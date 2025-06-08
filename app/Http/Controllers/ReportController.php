<?php

namespace App\Http\Controllers;

use App\Models\Keluarga;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use function Spatie\LaravelPdf\Support\pdf;

class ReportController extends Controller
{
    /**
     * Display report index with categories
     */
    public function index()
    {
        // Get statistics by category
        $reportData = [
            'status_ekonomi' => [
                'title' => 'Laporan Status Ekonomi',
                'description' => 'Distribusi keluarga berdasarkan status ekonomi',
                'data' => Keluarga::select('status_ekonomi', DB::raw('count(*) as total'))
                    ->groupBy('status_ekonomi')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'category' => $this->formatStatusEkonomi($item->status_ekonomi),
                            'value' => $item->total,
                            'status' => $item->status_ekonomi
                        ];
                    })
            ],
            'wilayah' => [
                'title' => 'Laporan Per Wilayah',
                'description' => 'Distribusi keluarga berdasarkan wilayah',
                'data' => Keluarga::select('provinsi', 'kota', DB::raw('count(*) as total'))
                    ->whereNotNull('provinsi')
                    ->whereNotNull('kota')
                    ->where('provinsi', '!=', '')
                    ->where('kota', '!=', '')
                    ->groupBy('provinsi', 'kota')
                    ->orderBy('provinsi')
                    ->orderBy('kota')
                    ->get()
                    ->groupBy('provinsi')
                    ->map(function ($items, $provinsi) {
                        return [
                            'provinsi' => $provinsi,
                            'total' => $items->sum('total'),
                            'kota' => $items->map(function ($item) {
                                return [
                                    'nama' => $item->kota,
                                    'total' => $item->total
                                ];
                            })
                        ];
                    })
            ],
            'koordinat' => [
                'title' => 'Laporan Koordinat',
                'description' => 'Status kelengkapan data koordinat',
                'data' => [
                    [
                        'category' => 'Sudah Ada Koordinat',
                        'value' => Keluarga::whereNotNull('lokasi')
                            ->where('lokasi', '!=', '')
                            ->where('lokasi', 'REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$')
                            ->count(),
                        'status' => 'complete'
                    ],
                    [
                        'category' => 'Belum Ada Koordinat',
                        'value' => Keluarga::where(function ($query) {
                            $query->whereNull('lokasi')
                                ->orWhere('lokasi', '')
                                ->orWhere('lokasi', 'NOT REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$');
                        })->count(),
                        'status' => 'incomplete'
                    ]
                ]
            ]
        ];

        return Inertia::render('Reports/Index', [
            'reportData' => $reportData,
            'totalKeluarga' => Keluarga::count()
        ]);
    }

    /**
     * Display detailed report by category
     */
    public function show(Request $request, $category)
    {
        $page = $request->get('page', 1);
        $perPage = 15;

        switch ($category) {
            case 'status-ekonomi':
                return $this->statusEkonomiReport($request, $perPage);
            case 'wilayah':
                return $this->wilayahReport($request, $perPage);
            case 'koordinat':
                return $this->koordinatReport($request, $perPage);
            default:
                abort(404);
        }
    }

    private function statusEkonomiReport($request, $perPage)
    {
        $status = $request->get('status');
        $query = Keluarga::query();

        if ($status && $status !== 'all') {
            $query->where('status_ekonomi', $status);
        }

        $keluarga = $query->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $statistics = [
            'sangat_miskin' => Keluarga::where('status_ekonomi', 'sangat_miskin')->count(),
            'miskin' => Keluarga::where('status_ekonomi', 'miskin')->count(),
            'rentan_miskin' => Keluarga::where('status_ekonomi', 'rentan_miskin')->count(),
        ];

        return Inertia::render('Reports/StatusEkonomi', [
            'keluarga' => $keluarga,
            'statistics' => $statistics,
            'filters' => $request->only(['status']),
            'category' => 'Status Ekonomi'
        ]);
    }

    private function wilayahReport($request, $perPage)
    {
        $provinsi = $request->get('provinsi');
        $kota = $request->get('kota');

        $query = Keluarga::query();

        if ($provinsi && $provinsi !== 'all') {
            $query->where('provinsi', $provinsi);
        }

        if ($kota && $kota !== 'all') {
            $query->where('kota', $kota);
        }

        $keluarga = $query->orderBy('provinsi')
            ->orderBy('kota')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $provinsiList = Keluarga::select('provinsi')
            ->whereNotNull('provinsi')
            ->where('provinsi', '!=', '')
            ->distinct()
            ->orderBy('provinsi')
            ->pluck('provinsi');

        $kotaList = [];
        if ($provinsi && $provinsi !== 'all') {
            $kotaList = Keluarga::where('provinsi', $provinsi)
                ->select('kota')
                ->whereNotNull('kota')
                ->where('kota', '!=', '')
                ->distinct()
                ->orderBy('kota')
                ->pluck('kota');
        }

        $statistics = Keluarga::select('provinsi', DB::raw('count(*) as total'))
            ->whereNotNull('provinsi')
            ->where('provinsi', '!=', '')
            ->groupBy('provinsi')
            ->orderBy('total', 'desc')
            ->get();

        return Inertia::render('Reports/Wilayah', [
            'keluarga' => $keluarga,
            'statistics' => $statistics,
            'provinsiList' => $provinsiList,
            'kotaList' => $kotaList,
            'filters' => $request->only(['provinsi', 'kota']),
            'category' => 'Wilayah'
        ]);
    }

    private function koordinatReport($request, $perPage)
    {
        $status = $request->get('status', 'all');
        $query = Keluarga::query();

        if ($status === 'complete') {
            $query->whereNotNull('lokasi')
                ->where('lokasi', '!=', '')
                ->where('lokasi', 'REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$');
        } elseif ($status === 'incomplete') {
            $query->where(function ($q) {
                $q->whereNull('lokasi')
                    ->orWhere('lokasi', '')
                    ->orWhere('lokasi', 'NOT REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$');
            });
        }

        $keluarga = $query->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $statistics = [
            'complete' => Keluarga::whereNotNull('lokasi')
                ->where('lokasi', '!=', '')
                ->where('lokasi', 'REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$')
                ->count(),
            'incomplete' => Keluarga::where(function ($query) {
                $query->whereNull('lokasi')
                    ->orWhere('lokasi', '')
                    ->orWhere('lokasi', 'NOT REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$');
            })->count(),
        ];

        return Inertia::render('Reports/Koordinat', [
            'keluarga' => $keluarga,
            'statistics' => $statistics,
            'filters' => $request->only(['status']),
            'category' => 'Koordinat'
        ]);
    }

    private function formatStatusEkonomi($status)
    {
        $statusMap = [
            'sangat_miskin' => 'Sangat Miskin',
            'miskin' => 'Miskin',
            'rentan_miskin' => 'Rentan Miskin'
        ];
        return $statusMap[$status] ?? $status;
    }

    /**
     * Export report data to PDF or CSV
     */
    public function export(Request $request)
    {
        try {
            $category = $request->input('category');
            $filters = $request->input('filters', []);
            $format = $request->input('format', 'csv');
            $options = $request->input('options', []);

            // **PERBAIKAN: Decode JSON string jika perlu**
            if (is_string($filters)) {
                $filters = json_decode($filters, true) ?? [];
            }
            if (is_string($options)) {
                $options = json_decode($options, true) ?? [];
            }

            // **PERBAIKAN: Pastikan filters adalah array**
            if (!is_array($filters)) {
                $filters = [];
            }
            if (!is_array($options)) {
                $options = [];
            }

            // Get data based on category and filters
            $data = $this->getDataForExport($category, $filters);

            if ($format === 'pdf') {
                return $this->exportPdf($category, $filters, $data, $options);
            } else {
                // Return JSON for CSV export
                return response()->json([
                    'success' => true,
                    'data' => $this->transformDataForExport($data, $category),
                    'message' => 'Data berhasil diambil untuk export'
                ]);
            }

        } catch (\Exception $e) {
            if ($request->input('format') === 'pdf') {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengexport PDF: ' . $e->getMessage()
                ], 500);
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data: ' . $e->getMessage()
            ], 500);
        }
    }

    private function exportPdf($category, $filters, $data, $options)
    {
        // Tentukan view berdasarkan kategori
        $viewName = $this->getPdfViewName($category);

        // **PERBAIKAN: Pastikan semua data adalah array**
        $pdfData = [
            'keluarga' => $data,
            'data' => $data,
            'category' => $category,
            'filters' => is_array($filters) ? $filters : [],
            'options' => is_array($options) ? $options : [],
            'title' => $this->getCategoryTitle($category),
            'generated_at' => now()->format('d/m/Y H:i:s'),
            'total_records' => $data->count(),
            'statistics' => $this->getStatisticsForCategory($category, $filters)
        ];

        // **PERBAIKAN: Safe access untuk filter data**
        switch ($category) {
            case 'status-ekonomi':
                $pdfData['filter'] = isset($filters['status']) && $filters['status'] !== 'all' ?
                    $this->formatStatusEkonomi($filters['status']) : 'Semua Status';
                break;
            case 'wilayah':
                $pdfData['filter_provinsi'] = isset($filters['provinsi']) && $filters['provinsi'] !== 'all' ?
                    $filters['provinsi'] : 'Semua Provinsi';
                $pdfData['filter_kota'] = isset($filters['kota']) && $filters['kota'] !== 'all' ?
                    $filters['kota'] : 'Semua Kota/Kabupaten';
                break;
            case 'koordinat':
                $status = isset($filters['status']) ? $filters['status'] : 'all';
                $pdfData['filter'] = $status === 'complete' ? 'Sudah Ada Koordinat' :
                    ($status === 'incomplete' ? 'Belum Ada Koordinat' : 'Semua Status');
                break;
        }

        $orientation = isset($options['pageOrientation']) ? $options['pageOrientation'] : 'landscape';
        $filename = 'laporan-' . $category . '-' . now()->format('Y-m-d') . '.pdf';

        return pdf()
            ->view($viewName, $pdfData)
            ->format('a4')
            ->orientation($orientation)
            ->name($filename)
            ->download();
    }

    private function getDataForExport($category, $filters)
    {
        $query = Keluarga::query();

        // **PERBAIKAN: Safe access untuk filters**
        switch ($category) {
            case 'status-ekonomi':
                if (isset($filters['status']) && $filters['status'] !== 'all') {
                    $query->where('status_ekonomi', $filters['status']);
                }
                break;

            case 'wilayah':
                if (isset($filters['provinsi']) && $filters['provinsi'] !== 'all') {
                    $query->where('provinsi', $filters['provinsi']);
                }
                if (isset($filters['kota']) && $filters['kota'] !== 'all') {
                    $query->where('kota', $filters['kota']);
                }
                break;

            case 'koordinat':
                $status = isset($filters['status']) ? $filters['status'] : 'all';
                if ($status === 'complete') {
                    $query->whereNotNull('lokasi')
                        ->where('lokasi', '!=', '')
                        ->where('lokasi', 'REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$');
                } elseif ($status === 'incomplete') {
                    $query->where(function ($q) {
                        $q->whereNull('lokasi')
                            ->orWhere('lokasi', '')
                            ->orWhere('lokasi', 'NOT REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$');
                    });
                }
                break;
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    private function getPdfViewName($category)
    {
        switch ($category) {
            case 'koordinat':
                return 'reports.pdf.koordinat';
            case 'status-ekonomi':
                return 'reports.pdf.status-ekonomi';
            case 'wilayah':
                return 'reports.pdf.wilayah';
            default:
                return 'reports.pdf.status-ekonomi'; // fallback
        }
    }

    private function getCategoryTitle($category)
    {
        switch ($category) {
            case 'koordinat':
                return 'Laporan Kelengkapan Data Koordinat';
            case 'status-ekonomi':
                return 'Laporan Status Ekonomi Keluarga';
            case 'wilayah':
                return 'Laporan Data Keluarga Per Wilayah';
            default:
                return 'Laporan Data Keluarga';
        }
    }

    private function getStatisticsForCategory($category, $filters)
    {
        switch ($category) {
            case 'status-ekonomi':
                return [
                    'sangat_miskin' => Keluarga::where('status_ekonomi', 'sangat_miskin')->count(),
                    'miskin' => Keluarga::where('status_ekonomi', 'miskin')->count(),
                    'rentan_miskin' => Keluarga::where('status_ekonomi', 'rentan_miskin')->count(),
                ];

            case 'wilayah':
                return Keluarga::select('provinsi', DB::raw('count(*) as total'))
                    ->whereNotNull('provinsi')
                    ->where('provinsi', '!=', '')
                    ->groupBy('provinsi')
                    ->orderBy('total', 'desc')
                    ->get();

            case 'koordinat':
                return [
                    'complete' => Keluarga::whereNotNull('lokasi')
                        ->where('lokasi', '!=', '')
                        ->where('lokasi', 'REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$')
                        ->count(),
                    'incomplete' => Keluarga::where(function ($query) {
                        $query->whereNull('lokasi')
                            ->orWhere('lokasi', '')
                            ->orWhere('lokasi', 'NOT REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$');
                    })->count(),
                ];

            default:
                return [];
        }
    }

    private function transformDataForExport($data, $category)
    {
        return $data->map(function ($item) use ($category) {
            $baseData = [
                'nama_keluarga' => $item->nama_keluarga,
                'alamat' => $item->alamat,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ];

            switch ($category) {
                case 'status-ekonomi':
                    return array_merge($baseData, [
                        'status_ekonomi' => $item->status_ekonomi,
                        'jumlah_anggota' => $item->jumlah_anggota,
                        'pendapatan' => $item->pendapatan,
                    ]);

                case 'wilayah':
                    return array_merge($baseData, [
                        'provinsi' => $item->provinsi,
                        'kota' => $item->kota,
                        'kecamatan' => $item->kecamatan,
                        'kelurahan' => $item->kelurahan,
                        'rt' => $item->rt,
                        'rw' => $item->rw,
                        'lokasi' => $item->lokasi,
                    ]);

                case 'koordinat':
                    // Parse koordinat dari field lokasi
                    $koordinat = $this->parseKoordinat($item->lokasi);
                    return array_merge($baseData, [
                        'lokasi' => $item->lokasi,
                        'latitude' => $koordinat['latitude'],
                        'longitude' => $koordinat['longitude'],
                    ]);

                default:
                    return $baseData;
            }
        })->toArray();
    }

    private function parseKoordinat($lokasi)
    {
        if (empty($lokasi) || !preg_match('/^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$/', $lokasi)) {
            return ['latitude' => '', 'longitude' => ''];
        }

        $coords = explode(',', $lokasi);
        return [
            'latitude' => trim($coords[0] ?? ''),
            'longitude' => trim($coords[1] ?? '')
        ];
    }

    /**
     * Get statistics for dashboard
     */
    public function getStatistics()
    {
        $stats = [
            'total' => Keluarga::count(),
            'sangat_miskin' => Keluarga::where('status_ekonomi', 'sangat_miskin')->count(),
            'miskin' => Keluarga::where('status_ekonomi', 'miskin')->count(),
            'rentan_miskin' => Keluarga::where('status_ekonomi', 'rentan_miskin')->count(),
            'with_coordinates' => Keluarga::whereNotNull('lokasi')
                ->where('lokasi', '!=', '')
                ->where('lokasi', 'REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$')
                ->count(),
            'without_coordinates' => Keluarga::where(function ($query) {
                $query->whereNull('lokasi')
                    ->orWhere('lokasi', '')
                    ->orWhere('lokasi', 'NOT REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$');
            })->count(),
        ];

        return response()->json($stats);
    }
}
