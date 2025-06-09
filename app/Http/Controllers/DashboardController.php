<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Keluarga;
use App\Models\AnggotaKeluarga;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        try {
            // Statistik Keluarga dengan error handling
            $totalKeluarga = Keluarga::count() ?? 0;
            $keluargaSangatMiskin = Keluarga::where('status_ekonomi', 'sangat_miskin')->count() ?? 0;
            $keluargaMiskin = Keluarga::where('status_ekonomi', 'miskin')->count() ?? 0;
            $keluargaRentanMiskin = Keluarga::where('status_ekonomi', 'rentan_miskin')->count() ?? 0;

            // Statistik Anggota Keluarga dengan error handling
            $totalAnggota = AnggotaKeluarga::count() ?? 0;
            $anggotaLaki = AnggotaKeluarga::where('jenis_kelamin', 'L')->count() ?? 0;
            $anggotaPerempuan = AnggotaKeluarga::where('jenis_kelamin', 'P')->count() ?? 0;
            $kepalaKeluarga = AnggotaKeluarga::where('status_dalam_keluarga', 'LIKE', '%kepala%')->count() ?? 0;

            // Data untuk chart status ekonomi
            $statusEkonomiChart = [
                'labels' => ['Sangat Miskin', 'Miskin', 'Rentan Miskin'],
                'data' => [$keluargaSangatMiskin, $keluargaMiskin, $keluargaRentanMiskin],
                'colors' => ['#ef4444', '#f59e0b', '#06b6d4']
            ];

            // Data untuk chart jenis kelamin
            $jenisKelaminChart = [
                'labels' => ['Laki-laki', 'Perempuan'],
                'data' => [$anggotaLaki, $anggotaPerempuan],
                'colors' => ['#3b82f6', '#ec4899']
            ];

            // Data keluarga terbaru dengan safe access
            $keluargaTerbaru = collect();
            try {
                $keluargaTerbaru = Keluarga::with(['anggota_keluarga'])
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($keluarga) {
                        return [
                            'id' => $keluarga->id ?? 0,
                            'no_kk' => $keluarga->no_kk ?? 'Tidak tersedia',
                            'nama_kepala_keluarga' => $keluarga->nama_kepala_keluarga ?? 'Tidak tersedia',
                            'alamat' => $keluarga->alamat ?? 'Tidak tersedia',
                            'status_ekonomi' => $keluarga->status_ekonomi ?? 'tidak_diketahui',
                            'jumlah_anggota' => $keluarga->anggota_keluarga ? $keluarga->anggota_keluarga->count() : 0,
                            'created_at' => $keluarga->created_at ? $keluarga->created_at->format('d M Y') : 'Tidak tersedia'
                        ];
                    });
            } catch (\Exception $e) {
                Log::warning('Error fetching keluarga terbaru: ' . $e->getMessage());
                $keluargaTerbaru = collect();
            }

            // Statistik berdasarkan wilayah dengan error handling
            $statistikWilayah = collect();
            try {
                $statistikWilayah = Keluarga::select('kota', DB::raw('count(*) as total'))
                    ->whereNotNull('kota')
                    ->where('kota', '!=', '')
                    ->groupBy('kota')
                    ->orderBy('total', 'desc')
                    ->take(10)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'kota' => $item->kota ?? 'Tidak diketahui',
                            'total' => $item->total ?? 0
                        ];
                    });
            } catch (\Exception $e) {
                Log::warning('Error fetching statistik wilayah: ' . $e->getMessage());
                $statistikWilayah = collect();
            }

            // Trend bulanan (6 bulan terakhir) dengan error handling
            $trendBulanan = [];
            try {
                for ($i = 5; $i >= 0; $i--) {
                    $bulan = Carbon::now()->subMonths($i);
                    $totalBulan = Keluarga::whereYear('created_at', $bulan->year)
                        ->whereMonth('created_at', $bulan->month)
                        ->count() ?? 0;

                    $trendBulanan[] = [
                        'bulan' => $bulan->format('M Y'),
                        'total' => $totalBulan
                    ];
                }
            } catch (\Exception $e) {
                Log::warning('Error calculating trend bulanan: ' . $e->getMessage());
                $trendBulanan = [];
            }

            // Penghasilan rata-rata dengan error handling
            $penghasilanRataRata = 0;
            try {
                $penghasilanRataRata = Keluarga::whereNotNull('penghasilan_bulanan')
                    ->where('penghasilan_bulanan', '>', 0)
                    ->avg('penghasilan_bulanan') ?? 0;
            } catch (\Exception $e) {
                Log::warning('Error calculating penghasilan rata-rata: ' . $e->getMessage());
                $penghasilanRataRata = 0;
            }

            // Statistik tambahan untuk insight yang lebih baik
            $additionalStats = [];
            try {
                $additionalStats = [
                    'keluarga_dengan_koordinat' => Keluarga::whereNotNull('latitude')
                        ->whereNotNull('longitude')
                        ->count() ?? 0,
                    'keluarga_tanpa_penghasilan' => Keluarga::where(function($query) {
                        $query->whereNull('penghasilan_bulanan')
                              ->orWhere('penghasilan_bulanan', '<=', 0);
                    })->count() ?? 0,
                    'rata_rata_anggota_per_keluarga' => $totalKeluarga > 0 ? round($totalAnggota / $totalKeluarga, 2) : 0
                ];
            } catch (\Exception $e) {
                Log::warning('Error calculating additional stats: ' . $e->getMessage());
                $additionalStats = [
                    'keluarga_dengan_koordinat' => 0,
                    'keluarga_tanpa_penghasilan' => 0,
                    'rata_rata_anggota_per_keluarga' => 0
                ];
            }

            // Distribusi pendidikan untuk insight tambahan
            $distribusiPendidikan = [];
            try {
                $distribusiPendidikan = AnggotaKeluarga::select('pendidikan_terakhir', DB::raw('count(*) as total'))
                    ->whereNotNull('pendidikan_terakhir')
                    ->where('pendidikan_terakhir', '!=', '')
                    ->groupBy('pendidikan_terakhir')
                    ->orderBy('total', 'desc')
                    ->take(5)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'pendidikan' => $item->pendidikan_terakhir ?? 'Tidak diketahui',
                            'total' => $item->total ?? 0
                        ];
                    });
            } catch (\Exception $e) {
                Log::warning('Error fetching distribusi pendidikan: ' . $e->getMessage());
                $distribusiPendidikan = collect();
            }

            // Distribusi pekerjaan
            $distribusiPekerjaan = [];
            try {
                $distribusiPekerjaan = AnggotaKeluarga::select('pekerjaan', DB::raw('count(*) as total'))
                    ->whereNotNull('pekerjaan')
                    ->where('pekerjaan', '!=', '')
                    ->groupBy('pekerjaan')
                    ->orderBy('total', 'desc')
                    ->take(5)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'pekerjaan' => $item->pekerjaan ?? 'Tidak diketahui',
                            'total' => $item->total ?? 0
                        ];
                    });
            } catch (\Exception $e) {
                Log::warning('Error fetching distribusi pekerjaan: ' . $e->getMessage());
                $distribusiPekerjaan = collect();
            }

            return Inertia::render('Dashboard', [
                'stats' => [
                    'total_keluarga' => $totalKeluarga,
                    'total_anggota' => $totalAnggota,
                    'keluarga_sangat_miskin' => $keluargaSangatMiskin,
                    'keluarga_miskin' => $keluargaMiskin,
                    'keluarga_rentan_miskin' => $keluargaRentanMiskin,
                    'anggota_laki' => $anggotaLaki,
                    'anggota_perempuan' => $anggotaPerempuan,
                    'kepala_keluarga' => $kepalaKeluarga,
                    'penghasilan_rata_rata' => $penghasilanRataRata,
                    'additional' => $additionalStats
                ],
                'charts' => [
                    'status_ekonomi' => $statusEkonomiChart,
                    'jenis_kelamin' => $jenisKelaminChart,
                    'trend_bulanan' => $trendBulanan,
                    'distribusi_pendidikan' => $distribusiPendidikan,
                    'distribusi_pekerjaan' => $distribusiPekerjaan
                ],
                'keluarga_terbaru' => $keluargaTerbaru,
                'statistik_wilayah' => $statistikWilayah,
                'meta' => [
                    'last_updated' => Carbon::now()->format('d M Y H:i'),
                    'data_quality' => [
                        'keluarga_lengkap' => $totalKeluarga > 0 ? round(($additionalStats['keluarga_dengan_koordinat'] / $totalKeluarga) * 100, 1) : 0,
                        'penghasilan_tersedia' => $totalKeluarga > 0 ? round((($totalKeluarga - $additionalStats['keluarga_tanpa_penghasilan']) / $totalKeluarga) * 100, 1) : 0
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            // Log error untuk debugging
            Log::error('Dashboard Controller Error: ' . $e->getMessage(), [
                'user_id' => Auth::user() ? Auth::user()->id : null
            ]);

            // Return safe fallback data
            return Inertia::render('Dashboard', [
                'stats' => [
                    'total_keluarga' => 0,
                    'total_anggota' => 0,
                    'keluarga_sangat_miskin' => 0,
                    'keluarga_miskin' => 0,
                    'keluarga_rentan_miskin' => 0,
                    'anggota_laki' => 0,
                    'anggota_perempuan' => 0,
                    'kepala_keluarga' => 0,
                    'penghasilan_rata_rata' => 0,
                    'additional' => [
                        'keluarga_dengan_koordinat' => 0,
                        'keluarga_tanpa_penghasilan' => 0,
                        'rata_rata_anggota_per_keluarga' => 0
                    ]
                ],
                'charts' => [
                    'status_ekonomi' => [
                        'labels' => ['Sangat Miskin', 'Miskin', 'Rentan Miskin'],
                        'data' => [0, 0, 0],
                        'colors' => ['#ef4444', '#f59e0b', '#06b6d4']
                    ],
                    'jenis_kelamin' => [
                        'labels' => ['Laki-laki', 'Perempuan'],
                        'data' => [0, 0],
                        'colors' => ['#3b82f6', '#ec4899']
                    ],
                    'trend_bulanan' => [],
                    'distribusi_pendidikan' => [],
                    'distribusi_pekerjaan' => []
                ],
                'keluarga_terbaru' => [],
                'statistik_wilayah' => [],
                'meta' => [
                    'last_updated' => Carbon::now()->format('d M Y H:i'),
                    'error' => 'Terjadi kesalahan saat memuat data dashboard',
                    'data_quality' => [
                        'keluarga_lengkap' => 0,
                        'penghasilan_tersedia' => 0
                    ]
                ]
            ]);
        }
    }

    /**
     * Get dashboard data for API endpoint
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiData(Request $request)
    {
        try {
            $data = $this->index($request);
            return response()->json([
                'success' => true,
                'data' => $data->getData()
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard API Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data dashboard',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get real-time statistics
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function realtimeStats()
    {
        try {
            $stats = [
                'total_keluarga' => Keluarga::count(),
                'total_anggota' => AnggotaKeluarga::count(),
                'last_updated' => Carbon::now()->format('H:i:s')
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Realtime Stats Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat statistik real-time'
            ], 500);
        }
    }
}
