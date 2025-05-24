<?php

namespace App\Http\Controllers;

use App\Models\Keluarga;
use Illuminate\Http\Request;
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
     * Export report data to PDF using Spatie Laravel PDF
     */
    public function export(Request $request, $category)
    {
        try {
            switch ($category) {
                case 'status-ekonomi':
                    return $this->exportStatusEkonomiPdf($request);
                case 'wilayah':
                    return $this->exportWilayahPdf($request);
                case 'koordinat':
                    return $this->exportKoordinatPdf($request);
                default:
                    abort(404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Terjadi kesalahan saat export PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    private function exportStatusEkonomiPdf($request)
    {
        $query = Keluarga::query();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status_ekonomi', $request->status);
        }

        $keluarga = $query->orderBy('created_at', 'desc')->get();

        $statistics = [
            'sangat_miskin' => Keluarga::where('status_ekonomi', 'sangat_miskin')->count(),
            'miskin' => Keluarga::where('status_ekonomi', 'miskin')->count(),
            'rentan_miskin' => Keluarga::where('status_ekonomi', 'rentan_miskin')->count(),
        ];

        $data = [
            'keluarga' => $keluarga,
            'statistics' => $statistics,
            'title' => 'Laporan Status Ekonomi Keluarga',
            'generated_at' => now()->format('d/m/Y H:i:s'),
            'filter' => $request->status !== 'all' ? $this->formatStatusEkonomi($request->status) : 'Semua Status'
        ];

        return pdf()
            ->view('reports.pdf.status-ekonomi', $data)
            ->format('a4')
            ->orientation('landscape')
            ->name('laporan-status-ekonomi-' . now()->format('Y-m-d') . '.pdf')
            ->download();
    }

    private function exportWilayahPdf($request)
    {
        $query = Keluarga::query();

        if ($request->has('provinsi') && $request->provinsi !== 'all') {
            $query->where('provinsi', $request->provinsi);
        }

        if ($request->has('kota') && $request->kota !== 'all') {
            $query->where('kota', $request->kota);
        }

        $keluarga = $query->orderBy('provinsi')->orderBy('kota')->get();

        $statistics = Keluarga::select('provinsi', DB::raw('count(*) as total'))
            ->whereNotNull('provinsi')
            ->where('provinsi', '!=', '')
            ->groupBy('provinsi')
            ->orderBy('total', 'desc')
            ->get();

        $data = [
            'keluarga' => $keluarga,
            'statistics' => $statistics,
            'title' => 'Laporan Data Keluarga Per Wilayah',
            'generated_at' => now()->format('d/m/Y H:i:s'),
            'filter_provinsi' => $request->provinsi !== 'all' ? $request->provinsi : 'Semua Provinsi',
            'filter_kota' => $request->kota !== 'all' ? $request->kota : 'Semua Kota/Kabupaten'
        ];

        return pdf()
            ->view('reports.pdf.wilayah', $data)
            ->format('a4')
            ->orientation('landscape')
            ->name('laporan-wilayah-' . now()->format('Y-m-d') . '.pdf')
            ->download();
    }

    private function exportKoordinatPdf($request)
    {
        $query = Keluarga::query();

        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'complete') {
                $query->whereNotNull('lokasi')
                    ->where('lokasi', '!=', '')
                    ->where('lokasi', 'REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$');
            } elseif ($request->status === 'incomplete') {
                $query->where(function ($q) {
                    $q->whereNull('lokasi')
                        ->orWhere('lokasi', '')
                        ->orWhere('lokasi', 'NOT REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$');
                });
            }
        }

        $keluarga = $query->orderBy('created_at', 'desc')->get();

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

        $data = [
            'keluarga' => $keluarga,
            'statistics' => $statistics,
            'title' => 'Laporan Kelengkapan Data Koordinat',
            'generated_at' => now()->format('d/m/Y H:i:s'),
            'filter' => $request->status === 'complete' ? 'Sudah Ada Koordinat' :
                       ($request->status === 'incomplete' ? 'Belum Ada Koordinat' : 'Semua Status')
        ];

        return pdf()
            ->view('reports.pdf.koordinat', $data)
            ->format('a4')
            ->orientation('landscape')
            ->name('laporan-koordinat-' . now()->format('Y-m-d') . '.pdf')
            ->download();
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
