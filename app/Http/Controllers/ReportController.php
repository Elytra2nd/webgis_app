<?php

namespace App\Http\Controllers;

use App\Models\Keluarga;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

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
            // Cek lokasi yang tidak null, tidak kosong, dan mengandung koordinat valid (format: lat,lng)
            $query->whereNotNull('lokasi')
                ->where('lokasi', '!=', '')
                ->where('lokasi', 'REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$');
        } elseif ($status === 'incomplete') {
            // Cek lokasi yang null, kosong, atau tidak mengandung koordinat valid
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
     * Export report data
     */
    public function export(Request $request, $category)
    {
        // Export logic will be implemented here
        return response()->json([
            'message' => 'Export functionality for ' . $category,
            'category' => $category
        ]);
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
