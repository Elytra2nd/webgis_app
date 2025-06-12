<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Keluarga;
use App\Models\AnggotaKeluarga;
use App\Models\Bantuan;
use App\Models\DistribusiBantuan;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the dashboard untuk Program Keluarga Harapan (PKH).
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
            $keluargaKurangMampu = Keluarga::where('status_ekonomi', 'kurang_mampu')->count() ?? 0;

            // Statistik Anggota Keluarga dengan error handling
            $totalAnggota = AnggotaKeluarga::count() ?? 0;
            $anggotaLaki = AnggotaKeluarga::where('jenis_kelamin', 'L')->count() ?? 0;
            $anggotaPerempuan = AnggotaKeluarga::where('jenis_kelamin', 'P')->count() ?? 0;
            $kepalaKeluarga = AnggotaKeluarga::where('status_dalam_keluarga', 'LIKE', '%kepala%')->count() ?? 0;

            // Statistik Bantuan PKH untuk tahun ini
            $tahunIni = now()->year;
            $totalPenerimaBantuan = Bantuan::where('tahun_anggaran', $tahunIni)
                ->whereIn('status', ['ditetapkan', 'aktif'])
                ->count() ?? 0;
            
            $bantuanAktif = Bantuan::where('tahun_anggaran', $tahunIni)
                ->where('status', 'aktif')
                ->count() ?? 0;
            
            $totalNominalBantuan = Bantuan::where('tahun_anggaran', $tahunIni)
                ->whereIn('status', ['ditetapkan', 'aktif'])
                ->sum('nominal_per_bulan') ?? 0;

            $distribusiBulanIni = DistribusiBantuan::whereHas('bantuan', function($q) use ($tahunIni) {
                    $q->where('tahun_anggaran', $tahunIni);
                })
                ->where('bulan', now()->month)
                ->where('status', 'disalurkan')
                ->count() ?? 0;

            // Keluarga yang belum menerima bantuan tapi layak
            $keluargaBelumTerima = Keluarga::whereDoesntHave('bantuan', function($q) use ($tahunIni) {
                    $q->where('tahun_anggaran', $tahunIni)
                      ->whereIn('status', ['ditetapkan', 'aktif']);
                })
                ->whereIn('status_ekonomi', ['sangat_miskin', 'miskin', 'rentan_miskin', 'kurang_mampu'])
                ->where('status_verifikasi', 'terverifikasi')
                ->count() ?? 0;

            // Data untuk chart status ekonomi dengan warna PKH
            $statusEkonomiChart = [
                'labels' => ['Sangat Miskin', 'Miskin', 'Rentan Miskin', 'Kurang Mampu'],
                'data' => [$keluargaSangatMiskin, $keluargaMiskin, $keluargaRentanMiskin, $keluargaKurangMampu],
                'colors' => ['#dc2626', '#ea580c', '#d97706', '#059669']
            ];

            // Data untuk chart bantuan PKH
            $bantuanChart = [
                'labels' => ['Sudah Terima', 'Belum Terima'],
                'data' => [$totalPenerimaBantuan, $keluargaBelumTerima],
                'colors' => ['#059669', '#dc2626']
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
                $keluargaTerbaru = Keluarga::with(['anggota_keluarga', 'bantuanAktif'])
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
                            'status_bantuan' => $keluarga->bantuanAktif ? 'sudah_terima' : 'belum_terima',
                            'nominal_bantuan' => $keluarga->bantuanAktif?->nominal_per_bulan ?? 0,
                            'created_at' => $keluarga->created_at ? $keluarga->created_at->format('d M Y') : 'Tidak tersedia'
                        ];
                    });
            } catch (\Exception $e) {
                Log::warning('Error fetching keluarga terbaru: ' . $e->getMessage());
                $keluargaTerbaru = collect();
            }

            // Statistik berdasarkan wilayah Kalimantan Barat
            $statistikWilayah = collect();
            try {
                $statistikWilayah = Keluarga::select('kota', DB::raw('count(*) as total'))
                    ->whereNotNull('kota')
                    ->where('kota', '!=', '')
                    ->where('provinsi', 'Kalimantan Barat')
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

            // Trend bantuan bulanan (6 bulan terakhir)
            $trendBantuan = [];
            try {
                for ($i = 5; $i >= 0; $i--) {
                    $bulan = Carbon::now()->subMonths($i);
                    $totalDistribusi = DistribusiBantuan::whereHas('bantuan', function($q) use ($tahunIni) {
                            $q->where('tahun_anggaran', $tahunIni);
                        })
                        ->where('bulan', $bulan->month)
                        ->where('status', 'disalurkan')
                        ->count() ?? 0;
                    
                    $trendBantuan[] = [
                        'bulan' => $bulan->format('M Y'),
                        'total' => $totalDistribusi
                    ];
                }
            } catch (\Exception $e) {
                Log::warning('Error calculating trend bantuan: ' . $e->getMessage());
                $trendBantuan = [];
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

            // Statistik tambahan untuk PKH
            $additionalStats = [];
            try {
                $additionalStats = [
                    'keluarga_dengan_koordinat' => Keluarga::whereNotNull('latitude')
                        ->whereNotNull('longitude')
                        ->count() ?? 0,
                    'keluarga_terverifikasi' => Keluarga::where('status_verifikasi', 'terverifikasi')->count() ?? 0,
                    'rata_rata_anggota_per_keluarga' => $totalKeluarga > 0 ? round($totalAnggota / $totalKeluarga, 2) : 0,
                    'coverage_area' => Keluarga::distinct('kota')->count() ?? 0
                ];
            } catch (\Exception $e) {
                Log::warning('Error calculating additional stats: ' . $e->getMessage());
                $additionalStats = [
                    'keluarga_dengan_koordinat' => 0,
                    'keluarga_terverifikasi' => 0,
                    'rata_rata_anggota_per_keluarga' => 0,
                    'coverage_area' => 0
                ];
            }

            // FIX: Ubah render path ke Admin/Dashboard
            return Inertia::render('Admin/Dashboard', [
                'stats' => [
                    'total_keluarga' => $totalKeluarga,
                    'total_anggota' => $totalAnggota,
                    'keluarga_sangat_miskin' => $keluargaSangatMiskin,
                    'keluarga_miskin' => $keluargaMiskin,
                    'keluarga_rentan_miskin' => $keluargaRentanMiskin,
                    'keluarga_kurang_mampu' => $keluargaKurangMampu,
                    'anggota_laki' => $anggotaLaki,
                    'anggota_perempuan' => $anggotaPerempuan,
                    'kepala_keluarga' => $kepalaKeluarga,
                    'penghasilan_rata_rata' => $penghasilanRataRata,
                    // Statistik PKH
                    'total_penerima_bantuan' => $totalPenerimaBantuan,
                    'bantuan_aktif' => $bantuanAktif,
                    'total_nominal_bantuan' => $totalNominalBantuan,
                    'distribusi_bulan_ini' => $distribusiBulanIni,
                    'keluarga_belum_terima' => $keluargaBelumTerima,
                    'additional' => $additionalStats
                ],
                'charts' => [
                    'status_ekonomi' => $statusEkonomiChart,
                    'bantuan_pkh' => $bantuanChart,
                    'jenis_kelamin' => $jenisKelaminChart,
                    'trend_bantuan' => $trendBantuan
                ],
                'keluarga_terbaru' => $keluargaTerbaru,
                'statistik_wilayah' => $statistikWilayah,
                'meta' => [
                    'last_updated' => Carbon::now()->format('d M Y H:i'),
                    'tahun_aktif' => $tahunIni,
                    'program' => 'Program Keluarga Harapan (PKH)',
                    'wilayah' => 'Kalimantan Barat',
                    'data_quality' => [
                        'keluarga_lengkap' => $totalKeluarga > 0 ? round(($additionalStats['keluarga_dengan_koordinat'] / $totalKeluarga) * 100, 1) : 0,
                        'keluarga_terverifikasi' => $totalKeluarga > 0 ? round(($additionalStats['keluarga_terverifikasi'] / $totalKeluarga) * 100, 1) : 0,
                        'coverage_bantuan' => $totalKeluarga > 0 ? round(($totalPenerimaBantuan / $totalKeluarga) * 100, 1) : 0
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            // Log error untuk debugging
            Log::error('Dashboard Controller Error: ' . $e->getMessage(), [
                'user_id' => Auth::user() ? Auth::user()->id : null,
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            // FIX: Return safe fallback data dengan path yang benar
            return Inertia::render('Admin/Dashboard', [
                'stats' => [
                    'total_keluarga' => 0,
                    'total_anggota' => 0,
                    'keluarga_sangat_miskin' => 0,
                    'keluarga_miskin' => 0,
                    'keluarga_rentan_miskin' => 0,
                    'keluarga_kurang_mampu' => 0,
                    'anggota_laki' => 0,
                    'anggota_perempuan' => 0,
                    'kepala_keluarga' => 0,
                    'penghasilan_rata_rata' => 0,
                    'total_penerima_bantuan' => 0,
                    'bantuan_aktif' => 0,
                    'total_nominal_bantuan' => 0,
                    'distribusi_bulan_ini' => 0,
                    'keluarga_belum_terima' => 0,
                    'additional' => [
                        'keluarga_dengan_koordinat' => 0,
                        'keluarga_terverifikasi' => 0,
                        'rata_rata_anggota_per_keluarga' => 0,
                        'coverage_area' => 0
                    ]
                ],
                'charts' => [
                    'status_ekonomi' => [
                        'labels' => ['Sangat Miskin', 'Miskin', 'Rentan Miskin', 'Kurang Mampu'],
                        'data' => [0, 0, 0, 0],
                        'colors' => ['#dc2626', '#ea580c', '#d97706', '#059669']
                    ],
                    'bantuan_pkh' => [
                        'labels' => ['Sudah Terima', 'Belum Terima'],
                        'data' => [0, 0],
                        'colors' => ['#059669', '#dc2626']
                    ],
                    'jenis_kelamin' => [
                        'labels' => ['Laki-laki', 'Perempuan'],
                        'data' => [0, 0],
                        'colors' => ['#3b82f6', '#ec4899']
                    ],
                    'trend_bantuan' => []
                ],
                'keluarga_terbaru' => [],
                'statistik_wilayah' => [],
                'meta' => [
                    'last_updated' => Carbon::now()->format('d M Y H:i'),
                    'tahun_aktif' => now()->year,
                    'program' => 'Program Keluarga Harapan (PKH)',
                    'wilayah' => 'Kalimantan Barat',
                    'error' => 'Terjadi kesalahan saat memuat data dashboard',
                    'data_quality' => [
                        'keluarga_lengkap' => 0,
                        'keluarga_terverifikasi' => 0,
                        'coverage_bantuan' => 0
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
            ], 200, [], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            Log::error('Dashboard API Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data dashboard PKH',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500, [], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Get real-time statistics untuk PKH
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function realtimeStats()
    {
        try {
            $tahunIni = now()->year;
            
            $stats = [
                'total_keluarga' => Keluarga::count(),
                'total_anggota' => AnggotaKeluarga::count(),
                'total_penerima_bantuan' => Bantuan::where('tahun_anggaran', $tahunIni)
                    ->whereIn('status', ['ditetapkan', 'aktif'])
                    ->count(),
                'distribusi_hari_ini' => DistribusiBantuan::whereHas('bantuan', function($q) use ($tahunIni) {
                        $q->where('tahun_anggaran', $tahunIni);
                    })
                    ->whereDate('tanggal_distribusi', today())
                    ->where('status', 'disalurkan')
                    ->count(),
                'last_updated' => Carbon::now()->format('H:i:s')
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ], 200, [], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            Log::error('Realtime Stats Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat statistik real-time PKH'
            ], 500, [], JSON_UNESCAPED_UNICODE);
        }
    }
}
