<?php

namespace App\Http\Controllers;

use App\Models\Keluarga;
use App\Models\Bantuan;
use App\Models\DistribusiBantuan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use function Spatie\LaravelPdf\Support\pdf;

class ReportController extends Controller
{
    /**
     * Display report index with categories for PKH
     */
    public function index()
    {
        // Get statistics by category for PKH
        $reportData = [
            'status_ekonomi' => [
                'title' => 'Laporan Status Ekonomi PKH',
                'description' => 'Distribusi keluarga penerima PKH berdasarkan status ekonomi',
                'data' => Keluarga::select('status_ekonomi', DB::raw('count(*) as total'))
                    ->groupBy('status_ekonomi')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'category' => $this->formatStatusEkonomi($item->status_ekonomi),
                            'value' => $item->total,
                            'status' => $item->status_ekonomi
                        ];
                    }),
                'icon' => 'DollarSign',
                'color' => 'from-cyan-400 via-teal-500 to-blue-600'
            ],
            'wilayah' => [
                'title' => 'Laporan Sebaran Wilayah PKH',
                'description' => 'Distribusi geografis keluarga penerima PKH',
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
                    }),
                'icon' => 'MapPin',
                'color' => 'from-emerald-400 via-green-500 to-teal-600'
            ],
            'koordinat' => [
                'title' => 'Laporan Data Koordinat PKH',
                'description' => 'Status kelengkapan data koordinat rumah penerima PKH',
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
                ],
                'icon' => 'Navigation',
                'color' => 'from-blue-400 via-indigo-500 to-purple-600'
            ]
        ];

        return Inertia::render('Reports/Index', [
            'reportData' => $reportData,
            'totalKeluarga' => Keluarga::count(),
            'totalPenerima' => $this->getTotalPenerima(),
            'tahunTersedia' => $this->getAvailableYears(),
            'statistikUmum' => $this->getGeneralStatistics()
        ]);
    }

    /**
     * Display PKH specific report
     */
    public function pkhReport(Request $request)
    {
        $tahun = $request->get('tahun', date('Y'));
        $bulan = $request->get('bulan');
        $status = $request->get('status');
        $provinsi = $request->get('provinsi');
        $kota = $request->get('kota');

        $query = Keluarga::with(['bantuan' => function($q) use ($tahun) {
            $q->byTahun($tahun)->with(['distribusi' => function($dq) {
                $dq->orderBy('bulan');
            }]);
        }]);

        // Apply filters
        if ($bulan && $bulan !== 'all') {
            $query->whereHas('bantuan.distribusi', function($q) use ($tahun, $bulan) {
                $q->whereHas('bantuan', function($bq) use ($tahun) {
                    $bq->byTahun($tahun);
                })->byBulan($bulan);
            });
        }

        if ($status && $status !== 'all') {
            if ($status === 'received') {
                $query->whereHas('bantuan', function($q) use ($tahun) {
                    $q->byTahun($tahun)->aktif();
                });
            } elseif ($status === 'not_received') {
                $query->whereDoesntHave('bantuan', function($q) use ($tahun) {
                    $q->byTahun($tahun);
                });
            } elseif ($status === 'pending') {
                $query->whereHas('bantuan', function($q) use ($tahun) {
                    $q->byTahun($tahun)->where('bantuan.status', 'pending');
                });
            }
        }

        if ($provinsi && $provinsi !== 'all') {
            $query->where('provinsi', $provinsi);
        }

        if ($kota && $kota !== 'all') {
            $query->where('kota', $kota);
        }

        $keluarga = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $statistics = $this->getPkhStatistics($tahun);

        return Inertia::render('Reports/PKH', [
            'keluarga' => $keluarga,
            'statistics' => $statistics,
            'filters' => $request->only(['tahun', 'bulan', 'status', 'provinsi', 'kota']),
            'tahunTersedia' => $this->getAvailableYears(),
            'provinsiList' => $this->getProvinsiList(),
            'kotaList' => $provinsi ? $this->getKotaList($provinsi) : [],
            'category' => 'PKH'
        ]);
    }

    /**
     * Display trend penerima PKH report
     */
    public function trendPenerima(Request $request)
    {
        $tahunMulai = $request->get('tahun_mulai', date('Y') - 2);
        $tahunSelesai = $request->get('tahun_selesai', date('Y'));
        $provinsi = $request->get('provinsi');

        $trendData = $this->getTrendData($tahunMulai, $tahunSelesai, $provinsi);
        $perbandinganTahunan = $this->getPerbandinganTahunan($tahunMulai, $tahunSelesai);
        $trendDistribusi = $this->getTrendDistribusi($tahunMulai, $tahunSelesai, $provinsi);

        return Inertia::render('Reports/TrendPenerima', [
            'trendData' => $trendData,
            'perbandinganTahunan' => $perbandinganTahunan,
            'trendDistribusi' => $trendDistribusi,
            'filters' => $request->only(['tahun_mulai', 'tahun_selesai', 'provinsi']),
            'tahunTersedia' => $this->getAvailableYears(),
            'provinsiList' => $this->getProvinsiList(),
            'category' => 'Trend Penerima PKH'
        ]);
    }

    /**
     * Display sebaran wilayah PKH report
     */
    public function sebaranWilayah(Request $request)
    {
        $tahun = $request->get('tahun', date('Y'));
        $provinsi = $request->get('provinsi');

        $sebaranData = $this->getSebaranWilayahData($tahun, $provinsi);
        $statistikWilayah = $this->getStatistikWilayah($tahun);
        $distribusiPerWilayah = $this->getDistribusiPerWilayah($tahun, $provinsi);

        return Inertia::render('Reports/SebaranWilayah', [
            'sebaranData' => $sebaranData,
            'statistikWilayah' => $statistikWilayah,
            'distribusiPerWilayah' => $distribusiPerWilayah,
            'filters' => $request->only(['tahun', 'provinsi']),
            'tahunTersedia' => $this->getAvailableYears(),
            'provinsiList' => $this->getProvinsiList(),
            'category' => 'Sebaran Wilayah PKH'
        ]);
    }

    /**
     * Display efektivitas PKH report
     */
    public function efektivitas(Request $request)
    {
        $tahun = $request->get('tahun', date('Y'));
        $provinsi = $request->get('provinsi');

        $efektivitasData = $this->getEfektivitasData($tahun, $provinsi);
        $targetRealisasi = $this->getTargetRealisasi($tahun);
        $efektivitasDistribusi = $this->getEfektivitasDistribusi($tahun, $provinsi);

        return Inertia::render('Reports/Efektivitas', [
            'efektivitasData' => $efektivitasData,
            'targetRealisasi' => $targetRealisasi,
            'efektivitasDistribusi' => $efektivitasDistribusi,
            'filters' => $request->only(['tahun', 'provinsi']),
            'tahunTersedia' => $this->getAvailableYears(),
            'provinsiList' => $this->getProvinsiList(),
            'category' => 'Efektivitas Program PKH'
        ]);
    }

    /**
     * Display detailed report by category (for backward compatibility)
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
        $tahun = $request->get('tahun', date('Y'));
        $query = Keluarga::query();

        if ($status && $status !== 'all') {
            $query->where('status_ekonomi', $status);
        }

        if ($tahun && $tahun !== 'all') {
            $query->whereYear('created_at', $tahun);
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
            'filters' => $request->only(['status', 'tahun']),
            'category' => 'Status Ekonomi PKH'
        ]);
    }

    private function wilayahReport($request, $perPage)
    {
        $provinsi = $request->get('provinsi');
        $kota = $request->get('kota');
        $tahun = $request->get('tahun', date('Y'));

        $query = Keluarga::query();

        if ($provinsi && $provinsi !== 'all') {
            $query->where('provinsi', $provinsi);
        }

        if ($kota && $kota !== 'all') {
            $query->where('kota', $kota);
        }

        if ($tahun && $tahun !== 'all') {
            $query->whereYear('created_at', $tahun);
        }

        $keluarga = $query->orderBy('provinsi')
            ->orderBy('kota')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $provinsiList = $this->getProvinsiList();
        $kotaList = $provinsi && $provinsi !== 'all' ? $this->getKotaList($provinsi) : [];

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
            'filters' => $request->only(['provinsi', 'kota', 'tahun']),
            'category' => 'Sebaran Wilayah PKH'
        ]);
    }

    private function koordinatReport($request, $perPage)
    {
        $status = $request->get('status', 'all');
        $tahun = $request->get('tahun', date('Y'));
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

        if ($tahun && $tahun !== 'all') {
            $query->whereYear('created_at', $tahun);
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
            'filters' => $request->only(['status', 'tahun']),
            'category' => 'Data Koordinat PKH'
        ]);
    }

    /**
     * Export PKH specific report
     */
    public function exportPkh(Request $request)
    {
        try {
            $tahun = $request->input('tahun', date('Y'));
            $format = $request->input('format', 'pdf');
            $filters = $request->input('filters', []);
            $options = $request->input('options', []);

            // Decode JSON strings if needed
            if (is_string($filters)) {
                $filters = json_decode($filters, true) ?? [];
            }
            if (is_string($options)) {
                $options = json_decode($options, true) ?? [];
            }

            $data = $this->getPkhDataForExport($tahun, $filters);

            if ($format === 'pdf') {
                return $this->exportPkhPdf($tahun, $filters, $data, $options);
            } else {
                return response()->json([
                    'success' => true,
                    'data' => $this->transformPkhDataForExport($data),
                    'message' => 'Data PKH berhasil diambil untuk export'
                ]);
            }

        } catch (\Exception $e) {
            Log::error('PKH Export Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengexport data PKH: ' . $e->getMessage()
            ], 500);
        }
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

            // Decode JSON string if needed
            if (is_string($filters)) {
                $filters = json_decode($filters, true) ?? [];
            }
            if (is_string($options)) {
                $options = json_decode($options, true) ?? [];
            }

            // Ensure filters and options are arrays
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
            Log::error('Export Error: ' . $e->getMessage());
            
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

    // PRIVATE METHODS

    private function getTotalPenerima()
    {
        return Bantuan::byTahun(date('Y'))
            ->aktif()
            ->distinct('keluarga_id')
            ->count();
    }

    private function getAvailableYears()
    {
        $years = [];
        $startYear = 2020;
        $currentYear = date('Y');
        
        for ($year = $startYear; $year <= $currentYear + 1; $year++) {
            $years[] = $year;
        }
        
        return $years;
    }

    private function getGeneralStatistics()
    {
        $currentYear = date('Y');
        
        return [
            'total_keluarga' => Keluarga::count(),
            'total_penerima_tahun_ini' => $this->getTotalPenerima(),
            'keluarga_dengan_koordinat' => Keluarga::whereNotNull('lokasi')
                ->where('lokasi', '!=', '')
                ->where('lokasi', 'REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$')
                ->count(),
            'distribusi_status' => Keluarga::select('status_ekonomi', DB::raw('count(*) as total'))
                ->groupBy('status_ekonomi')
                ->get()
                ->pluck('total', 'status_ekonomi'),
            'total_distribusi_bulan_ini' => DistribusiBantuan::whereHas('bantuan', function($q) use ($currentYear) {
                    $q->byTahun($currentYear);
                })
                ->byBulan(date('n'))
                ->where('distribusi_bantuan.status', 'disalurkan')
                ->count(),
            'persentase_distribusi_tahun_ini' => $this->getPersentaseDistribusiTahunIni($currentYear)
        ];
    }

    private function getPkhStatistics($tahun)
    {
        return [
            'total_penerima' => Bantuan::byTahun($tahun)
                ->distinct('keluarga_id')
                ->count(),
            'total_bantuan_disalurkan' => DistribusiBantuan::whereHas('bantuan', function($q) use ($tahun) {
                    $q->byTahun($tahun);
                })
                ->where('distribusi_bantuan.status', 'disalurkan')
                ->count(),
            'total_nominal_disalurkan' => $this->getTotalNominalDisalurkan($tahun),
            'distribusi_per_bulan' => DistribusiBantuan::whereHas('bantuan', function($q) use ($tahun) {
                    $q->byTahun($tahun);
                })
                ->select('bulan', DB::raw('count(*) as total_distribusi'))
                ->groupBy('bulan')
                ->orderBy('bulan')
                ->get()
                ->map(function($item) {
                    return [
                        'bulan' => $item->bulan,
                        'nama_bulan' => $this->getNamaBulan($item->bulan),
                        'total' => $item->total_distribusi
                    ];
                }),
            'distribusi_per_wilayah' => Keluarga::whereHas('bantuan', function($q) use ($tahun) {
                    $q->byTahun($tahun);
                })
                ->select('provinsi', DB::raw('count(*) as total'))
                ->whereNotNull('provinsi')
                ->where('provinsi', '!=', '')
                ->groupBy('provinsi')
                ->orderBy('total', 'desc')
                ->get(),
            'status_distribusi' => $this->getStatusDistribusi($tahun)
        ];
    }

    private function getTrendData($tahunMulai, $tahunSelesai, $provinsi = null)
    {
        $query = Bantuan::select(
                'tahun_anggaran',
                DB::raw('count(DISTINCT keluarga_id) as total_penerima'),
                DB::raw('sum(nominal_per_bulan * 12) as total_nominal')
            )
            ->whereBetween('tahun_anggaran', [$tahunMulai, $tahunSelesai]);

        if ($provinsi && $provinsi !== 'all') {
            $query->whereHas('keluarga', function($q) use ($provinsi) {
                $q->where('provinsi', $provinsi);
            });
        }

        return $query->groupBy('tahun_anggaran')
            ->orderBy('tahun_anggaran')
            ->get();
    }

    private function getTrendDistribusi($tahunMulai, $tahunSelesai, $provinsi = null)
    {
        $query = DistribusiBantuan::whereHas('bantuan', function($q) use ($tahunMulai, $tahunSelesai, $provinsi) {
                $q->whereBetween('tahun_anggaran', [$tahunMulai, $tahunSelesai]);
                
                if ($provinsi && $provinsi !== 'all') {
                    $q->whereHas('keluarga', function($kq) use ($provinsi) {
                        $kq->where('provinsi', $provinsi);
                    });
                }
            })
            ->join('bantuan', 'distribusi_bantuan.bantuan_id', '=', 'bantuan.id')
            ->select(
                'bantuan.tahun_anggaran',
                'distribusi_bantuan.bulan',
                DB::raw('count(*) as total_distribusi'),
                DB::raw('sum(case when distribusi_bantuan.status = "disalurkan" then 1 else 0 end) as total_disalurkan')
            )
            ->groupBy('bantuan.tahun_anggaran', 'distribusi_bantuan.bulan')
            ->orderBy('bantuan.tahun_anggaran')
            ->orderBy('distribusi_bantuan.bulan')
            ->get();

        return $query->groupBy('tahun_anggaran');
    }

    private function getPerbandinganTahunan($tahunMulai, $tahunSelesai)
    {
        $data = [];
        for ($tahun = $tahunMulai; $tahun <= $tahunSelesai; $tahun++) {
            $totalKeluarga = Keluarga::whereYear('created_at', '<=', $tahun)->count();
            $totalPenerima = Bantuan::byTahun($tahun)->distinct('keluarga_id')->count();
            $totalDistribusi = DistribusiBantuan::whereHas('bantuan', function($q) use ($tahun) {
                $q->byTahun($tahun);
            })->where('distribusi_bantuan.status', 'disalurkan')->count();
            
            $data[] = [
                'tahun' => $tahun,
                'total_keluarga' => $totalKeluarga,
                'total_penerima' => $totalPenerima,
                'total_distribusi' => $totalDistribusi,
                'coverage_percentage' => $this->calculateCoveragePercentage($tahun),
                'efektivitas_distribusi' => $this->calculateEfektivitasDistribusi($tahun)
            ];
        }
        return $data;
    }

    private function calculateCoveragePercentage($tahun)
    {
        $totalKeluarga = Keluarga::whereYear('created_at', '<=', $tahun)->count();
        $totalPenerima = Bantuan::byTahun($tahun)->distinct('keluarga_id')->count();
        
        return $totalKeluarga > 0 ? round(($totalPenerima / $totalKeluarga) * 100, 2) : 0;
    }

    private function calculateEfektivitasDistribusi($tahun)
    {
        $targetDistribusi = Bantuan::byTahun($tahun)->count() * 12; // 12 bulan per bantuan
        $realisasiDistribusi = DistribusiBantuan::whereHas('bantuan', function($q) use ($tahun) {
            $q->byTahun($tahun);
        })->where('distribusi_bantuan.status', 'disalurkan')->count();
        
        return $targetDistribusi > 0 ? round(($realisasiDistribusi / $targetDistribusi) * 100, 2) : 0;
    }

    private function getSebaranWilayahData($tahun, $provinsi = null)
    {
        $query = Keluarga::whereHas('bantuan', function($q) use ($tahun) {
                $q->byTahun($tahun);
            })
            ->select('provinsi', 'kota', DB::raw('count(*) as total_penerima'))
            ->whereNotNull('provinsi')
            ->whereNotNull('kota')
            ->where('provinsi', '!=', '')
            ->where('kota', '!=', '');

        if ($provinsi && $provinsi !== 'all') {
            $query->where('provinsi', $provinsi);
        }

        return $query->groupBy('provinsi', 'kota')
            ->orderBy('provinsi')
            ->orderBy('total_penerima', 'desc')
            ->get()
            ->groupBy('provinsi');
    }

    private function getDistribusiPerWilayah($tahun, $provinsi = null)
    {
        $query = DB::table('distribusi_bantuan as db')
            ->join('bantuan as b', 'db.bantuan_id', '=', 'b.id')
            ->join('keluarga as k', 'b.keluarga_id', '=', 'k.id')
            ->where('b.tahun_anggaran', $tahun)
            ->select(
                'k.provinsi',
                'k.kota',
                DB::raw('count(*) as total_distribusi'),
                DB::raw('sum(case when db.status = "disalurkan" then 1 else 0 end) as total_disalurkan')
            );

        if ($provinsi && $provinsi !== 'all') {
            $query->where('k.provinsi', $provinsi);
        }

        return $query->groupBy('k.provinsi', 'k.kota')
            ->orderBy('k.provinsi')
            ->orderBy('total_disalurkan', 'desc')
            ->get()
            ->groupBy('provinsi');
    }

    private function getStatistikWilayah($tahun)
    {
        $provinsiTerbanyak = Keluarga::whereHas('bantuan', function($q) use ($tahun) {
                $q->byTahun($tahun);
            })
            ->select('provinsi', DB::raw('count(*) as total'))
            ->whereNotNull('provinsi')
            ->where('provinsi', '!=', '')
            ->groupBy('provinsi')
            ->orderBy('total', 'desc')
            ->first();

        return [
            'provinsi_terbanyak' => $provinsiTerbanyak,
            'total_provinsi' => Keluarga::whereHas('bantuan', function($q) use ($tahun) {
                    $q->byTahun($tahun);
                })
                ->whereNotNull('provinsi')
                ->where('provinsi', '!=', '')
                ->distinct('provinsi')
                ->count(),
            'total_kota' => Keluarga::whereHas('bantuan', function($q) use ($tahun) {
                    $q->byTahun($tahun);
                })
                ->whereNotNull('kota')
                ->where('kota', '!=', '')
                ->distinct('kota')
                ->count(),
            'distribusi_terbanyak' => DB::table('distribusi_bantuan as db')
                ->join('bantuan as b', 'db.bantuan_id', '=', 'b.id')
                ->join('keluarga as k', 'b.keluarga_id', '=', 'k.id')
                ->where('b.tahun_anggaran', $tahun)
                ->where('db.status', 'disalurkan')
                ->select('k.provinsi', DB::raw('count(*) as total_distribusi'))
                ->groupBy('k.provinsi')
                ->orderBy('total_distribusi', 'desc')
                ->first()
        ];
    }

    private function getEfektivitasData($tahun, $provinsi = null)
    {
        $query = Keluarga::query();

        if ($provinsi && $provinsi !== 'all') {
            $query->where('provinsi', $provinsi);
        }

        $totalKeluarga = $query->count();
        $totalPenerima = $query->whereHas('bantuan', function($q) use ($tahun) {
            $q->byTahun($tahun);
        })->count();

        $efektivitas = $totalKeluarga > 0 ? ($totalPenerima / $totalKeluarga) * 100 : 0;

        return [
            'total_keluarga' => $totalKeluarga,
            'total_penerima' => $totalPenerima,
            'efektivitas_percentage' => round($efektivitas, 2),
            'keluarga_belum_menerima' => $totalKeluarga - $totalPenerima,
            'distribusi_per_status' => $this->getDistribusiPerStatus($tahun, $provinsi),
            'rata_rata_distribusi' => $this->getRataRataDistribusi($tahun, $provinsi)
        ];
    }

    private function getEfektivitasDistribusi($tahun, $provinsi = null)
    {
        $query = DistribusiBantuan::whereHas('bantuan', function($q) use ($tahun, $provinsi) {
            $q->byTahun($tahun);
            
            if ($provinsi && $provinsi !== 'all') {
                $q->whereHas('keluarga', function($kq) use ($provinsi) {
                    $kq->where('provinsi', $provinsi);
                });
            }
        });

        $totalTarget = $query->count();
        $totalRealisasi = $query->where('distribusi_bantuan.status', 'disalurkan')->count();
        $totalGagal = $query->where('distribusi_bantuan.status', 'gagal')->count();

        return [
            'total_target' => $totalTarget,
            'total_realisasi' => $totalRealisasi,
            'total_gagal' => $totalGagal,
            'persentase_realisasi' => $totalTarget > 0 ? round(($totalRealisasi / $totalTarget) * 100, 2) : 0,
            'persentase_gagal' => $totalTarget > 0 ? round(($totalGagal / $totalTarget) * 100, 2) : 0
        ];
    }

    private function getDistribusiPerStatus($tahun, $provinsi = null)
    {
        $query = Keluarga::select('status_ekonomi', 
                DB::raw('count(*) as total_keluarga'),
                DB::raw('sum(case when bantuan.id is not null then 1 else 0 end) as total_penerima')
            )
            ->leftJoin('bantuan', function($join) use ($tahun) {
                $join->on('keluarga.id', '=', 'bantuan.keluarga_id')
                     ->where('bantuan.tahun_anggaran', $tahun);
            });

        if ($provinsi && $provinsi !== 'all') {
            $query->where('keluarga.provinsi', $provinsi);
        }

        return $query->groupBy('status_ekonomi')
            ->get()
            ->map(function($item) {
                $coverage = $item->total_keluarga > 0 ? 
                    ($item->total_penerima / $item->total_keluarga) * 100 : 0;
                
                return [
                    'status' => $this->formatStatusEkonomi($item->status_ekonomi),
                    'total_keluarga' => $item->total_keluarga,
                    'total_penerima' => $item->total_penerima,
                    'coverage_percentage' => round($coverage, 2)
                ];
            });
    }

    private function getRataRataDistribusi($tahun, $provinsi = null)
    {
        $query = Bantuan::byTahun($tahun);

        if ($provinsi && $provinsi !== 'all') {
            $query->whereHas('keluarga', function($q) use ($provinsi) {
                $q->where('provinsi', $provinsi);
            });
        }

        $bantuanData = $query->with('distribusi')->get();
        
        if ($bantuanData->isEmpty()) {
            return 0;
        }

        $totalPersentase = $bantuanData->sum(function($bantuan) {
            return $bantuan->persentase_distribusi;
        });

        return round($totalPersentase / $bantuanData->count(), 2);
    }

    private function getTargetRealisasi($tahun)
    {
        // Target berdasarkan keluarga dengan status sangat miskin dan miskin
        $target = Keluarga::whereIn('status_ekonomi', ['sangat_miskin', 'miskin'])->count();
        $realisasi = Bantuan::byTahun($tahun)->distinct('keluarga_id')->count();

        return [
            'target' => $target,
            'realisasi' => $realisasi,
            'percentage' => $target > 0 ? round(($realisasi / $target) * 100, 2) : 0,
            'sisa_target' => $target - $realisasi
        ];
    }

    private function getProvinsiList()
    {
        return Keluarga::select('provinsi')
            ->whereNotNull('provinsi')
            ->where('provinsi', '!=', '')
            ->distinct()
            ->orderBy('provinsi')
            ->pluck('provinsi');
    }

    private function getKotaList($provinsi)
    {
        return Keluarga::where('provinsi', $provinsi)
            ->select('kota')
            ->whereNotNull('kota')
            ->where('kota', '!=', '')
            ->distinct()
            ->orderBy('kota')
            ->pluck('kota');
    }

    private function getPkhDataForExport($tahun, $filters)
    {
        $query = Keluarga::with(['bantuan' => function($q) use ($tahun) {
            $q->byTahun($tahun)->with(['distribusi' => function($dq) {
                $dq->orderBy('bulan');
            }]);
        }]);

        // Apply filters
        if (isset($filters['bulan']) && $filters['bulan'] !== 'all') {
            $query->whereHas('bantuan.distribusi', function($q) use ($tahun, $filters) {
                $q->whereHas('bantuan', function($bq) use ($tahun) {
                    $bq->byTahun($tahun);
                })->byBulan($filters['bulan']);
            });
        }

        if (isset($filters['status']) && $filters['status'] !== 'all') {
            if ($filters['status'] === 'received') {
                $query->whereHas('bantuan', function($q) use ($tahun) {
                    $q->byTahun($tahun)->aktif();
                });
            } elseif ($filters['status'] === 'not_received') {
                $query->whereDoesntHave('bantuan', function($q) use ($tahun) {
                    $q->byTahun($tahun);
                });
            } elseif ($filters['status'] === 'pending') {
                $query->whereHas('bantuan', function($q) use ($tahun) {
                    $q->byTahun($tahun)->where('bantuan.status', 'pending');
                });
            }
        }

        if (isset($filters['provinsi']) && $filters['provinsi'] !== 'all') {
            $query->where('provinsi', $filters['provinsi']);
        }

        if (isset($filters['kota']) && $filters['kota'] !== 'all') {
            $query->where('kota', $filters['kota']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    private function exportPkhPdf($tahun, $filters, $data, $options)
    {
        $pdfData = [
            'keluarga' => $data,
            'data' => $data,
            'category' => 'pkh',
            'tahun' => $tahun,
            'filters' => is_array($filters) ? $filters : [],
            'options' => is_array($options) ? $options : [],
            'title' => 'Laporan Program Keluarga Harapan (PKH)',
            'generated_at' => now()->format('d/m/Y H:i:s'),
            'total_records' => $data->count(),
            'statistics' => $this->getPkhStatistics($tahun)
        ];

        $orientation = isset($options['pageOrientation']) ? $options['pageOrientation'] : 'landscape';
        $filename = 'laporan-pkh-' . $tahun . '-' . now()->format('Y-m-d') . '.pdf';

        return pdf()
            ->view('reports.pdf.pkh', $pdfData)
            ->format('a4')
            ->orientation($orientation)
            ->name($filename)
            ->download();
    }

    private function transformPkhDataForExport($data)
    {
        return $data->map(function ($item) {
            $bantuan = $item->bantuan->first();
            $distribusiData = $bantuan ? $bantuan->distribusi : collect();
            
            return [
                'nama_keluarga' => $item->nama_keluarga,
                'alamat' => $item->alamat,
                'provinsi' => $item->provinsi,
                'kota' => $item->kota,
                'kecamatan' => $item->kecamatan,
                'kelurahan' => $item->kelurahan,
                'status_ekonomi' => $this->formatStatusEkonomi($item->status_ekonomi),
                'jumlah_anggota' => $item->jumlah_anggota,
                'pendapatan' => $item->pendapatan,
                'status_bantuan' => $bantuan ? $bantuan->status : 'Belum Menerima',
                'nominal_per_bulan' => $bantuan ? $bantuan->nominal_per_bulan : 0,
                'total_nominal_tahun' => $bantuan ? $bantuan->total_nominal_tahun : 0,
                'persentase_distribusi' => $bantuan ? $bantuan->persentase_distribusi : 0,
                'sisa_bulan_distribusi' => $bantuan ? $bantuan->sisa_bulan_distribusi : 0,
                'tanggal_penetapan' => $bantuan ? $bantuan->tanggal_penetapan->format('d/m/Y') : '',
                'total_disalurkan' => $distribusiData->where('status', 'disalurkan')->count(),
                'total_gagal' => $distribusiData->where('status', 'gagal')->count(),
                'koordinat' => $item->lokasi,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ];
        })->toArray();
    }

    private function exportPdf($category, $filters, $data, $options)
    {

        try {
            $viewName = $this->getPdfViewName($category);

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

            $orientation = isset($options['pageOrientation']) ? $options['pageOrientation'] : 'landscape';
            $filename = 'laporan-' . $category . '-' . now()->format('Y-m-d') . '.pdf';

            if (ob_get_level()) {
                ob_end_clean();
            }

            return pdf()
                ->view($viewName, $pdfData)
                ->format('a4')
                ->orientation($orientation)
                ->name($filename)
                ->download();

        } catch (\Exception $e) {
            \Log::error('PDF Export Error: ' . $e->getMessage());
        
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengexport PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getDataForExport($category, $filters)
    {
        $query = Keluarga::query();

        // Safe access for filters
        switch ($category) {
            case 'status-ekonomi':
                if (isset($filters['status']) && $filters['status'] !== 'all') {
                    $query->where('status_ekonomi', $filters['status']);
                }
                if (isset($filters['provinsi']) && $filters['provinsi'] !== 'all') {
                    $query->where('provinsi', $filters['provinsi']);
                }
                if (isset($filters['tahun']) && $filters['tahun'] !== 'all') {
                    $query->whereYear('created_at', $filters['tahun']);
                }
                break;

            case 'wilayah':
                if (isset($filters['provinsi']) && $filters['provinsi'] !== 'all') {
                    $query->where('provinsi', $filters['provinsi']);
                }
                if (isset($filters['kota']) && $filters['kota'] !== 'all') {
                    $query->where('kota', $filters['kota']);
                }
                if (isset($filters['tahun']) && $filters['tahun'] !== 'all') {
                    $query->whereYear('created_at', $filters['tahun']);
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
                if (isset($filters['tahun']) && $filters['tahun'] !== 'all') {
                    $query->whereYear('created_at', $filters['tahun']);
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
            case 'pkh':
                return 'reports.pdf.pkh';
            default:
                return 'reports.pdf.status-ekonomi'; // fallback
        }
    }

    private function getCategoryTitle($category)
    {
        switch ($category) {
            case 'koordinat':
                return 'Laporan Kelengkapan Data Koordinat PKH';
            case 'status-ekonomi':
                return 'Laporan Status Ekonomi Keluarga PKH';
            case 'wilayah':
                return 'Laporan Data Keluarga PKH Per Wilayah';
            case 'pkh':
                return 'Laporan Program Keluarga Harapan (PKH)';
            default:
                return 'Laporan Data Keluarga PKH';
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
                        'status_ekonomi' => $this->formatStatusEkonomi($item->status_ekonomi),
                        'jumlah_anggota' => $item->jumlah_anggota,
                        'pendapatan' => $item->pendapatan,
                        'provinsi' => $item->provinsi,
                        'kota' => $item->kota,
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
                        'status_ekonomi' => $this->formatStatusEkonomi($item->status_ekonomi),
                    ]);

                case 'koordinat':
                    // Parse koordinat dari field lokasi
                    $koordinat = $this->parseKoordinat($item->lokasi);
                    return array_merge($baseData, [
                        'lokasi' => $item->lokasi,
                        'latitude' => $koordinat['latitude'],
                        'longitude' => $koordinat['longitude'],
                        'status_koordinat' => $koordinat['latitude'] && $koordinat['longitude'] ? 'Lengkap' : 'Belum Lengkap',
                        'provinsi' => $item->provinsi,
                        'kota' => $item->kota,
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

    private function formatStatusEkonomi($status)
    {
        $statusMap = [
            'sangat_miskin' => 'Sangat Miskin',
            'miskin' => 'Miskin',
            'rentan_miskin' => 'Rentan Miskin'
        ];
        return $statusMap[$status] ?? $status;
    }

    private function getNamaBulan($bulan)
    {
        $namaBulan = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret',
            4 => 'April', 5 => 'Mei', 6 => 'Juni',
            7 => 'Juli', 8 => 'Agustus', 9 => 'September',
            10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        
        return $namaBulan[$bulan] ?? 'Unknown';
    }

    private function getTotalNominalDisalurkan($tahun)
    {
        return DistribusiBantuan::whereHas('bantuan', function($q) use ($tahun) {
                $q->byTahun($tahun);
            })
            ->where('distribusi_bantuan.status', 'disalurkan')
            ->join('bantuan', 'distribusi_bantuan.bantuan_id', '=', 'bantuan.id')
            ->sum('bantuan.nominal_per_bulan');
    }

    private function getStatusDistribusi($tahun)
    {
        return DistribusiBantuan::whereHas('bantuan', function($q) use ($tahun) {
                $q->byTahun($tahun);
            })
            ->select('distribusi_bantuan.status', DB::raw('count(*) as total'))
            ->groupBy('distribusi_bantuan.status')
            ->get()
            ->mapWithKeys(function($item) {
                return [$item->status => $item->total];
            });
    }

    private function getPersentaseDistribusiTahunIni($tahun)
    {
        $targetDistribusi = Bantuan::byTahun($tahun)->count() * 12;
        $realisasiDistribusi = DistribusiBantuan::whereHas('bantuan', function($q) use ($tahun) {
            $q->byTahun($tahun);
        })->where('distribusi_bantuan.status', 'disalurkan')->count();
        
        return $targetDistribusi > 0 ? round(($realisasiDistribusi / $targetDistribusi) * 100, 2) : 0;
    }

    /**
     * Get statistics for dashboard
     */
    public function getStatistics()
    {
        $currentYear = date('Y');
        
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
            'total_penerima_pkh' => $this->getTotalPenerima(),
            'coverage_pkh' => $this->calculateCoveragePercentage($currentYear),
            'total_distribusi_tahun_ini' => DistribusiBantuan::whereHas('bantuan', function($q) use ($currentYear) {
                $q->byTahun($currentYear);
            })->where('distribusi_bantuan.status', 'disalurkan')->count(),
            'persentase_distribusi_tahun_ini' => $this->getPersentaseDistribusiTahunIni($currentYear)
        ];

        return response()->json($stats);
    }
}
