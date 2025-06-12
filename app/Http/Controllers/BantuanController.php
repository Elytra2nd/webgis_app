<?php

namespace App\Http\Controllers;

use App\Models\Bantuan;
use App\Models\DistribusiBantuan;
use App\Models\Keluarga;
use App\Models\PengaturanBantuan;
use App\Models\LogAktivitas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class BantuanController extends Controller
{
    /**
     * Display a listing of bantuan with enhanced PKH filtering
     */
    public function index(Request $request): Response
    {
        try {
            $tahun = $request->input('tahun', now()->year);
            $status = $request->input('status');
            $search = $request->input('search');

            $query = Bantuan::with(['keluarga', 'distribusi'])
                ->where('tahun_anggaran', $tahun);

            // Filter by status
            if ($status && $status !== 'all') {
                $query->where('status', $status);
            }

            // Search functionality
            if ($search) {
                $query->whereHas('keluarga', function ($q) use ($search) {
                    $q->where('no_kk', 'like', "%{$search}%")
                      ->orWhere('nama_kepala_keluarga', 'like', "%{$search}%");
                });
            }

            $bantuan = $query->latest()
                           ->paginate(15)
                           ->withQueryString();

            // Enhanced statistics for PKH
            $statistik = $this->getBantuanStatistics($tahun);

            return Inertia::render('Admin/Bantuan/Index', [
                'bantuan' => $bantuan,
                'statistik' => $statistik,
                'filters' => [
                    'tahun' => $tahun,
                    'status' => $status,
                    'search' => $search,
                ],
                'tahun_tersedia' => $this->getAvailableYears()
            ]);

        } catch (\Exception $e) {
            Log::error('Error in BantuanController@index: ' . $e->getMessage());

            return Inertia::render('Admin/Bantuan/Index', [
                'bantuan' => ['data' => [], 'links' => [], 'meta' => []],
                'statistik' => $this->getEmptyStatistics(),
                'filters' => $request->only(['tahun', 'status', 'search']),
                'tahun_tersedia' => range(2020, now()->year + 1),
                'error' => 'Terjadi kesalahan saat memuat data bantuan.'
            ]);
        }
    }

    /**
     * FIX: Tambahkan method show untuk menampilkan detail bantuan
     */
    public function show(Bantuan $bantuan): Response
    {
        try {
            // Load relasi yang diperlukan untuk detail bantuan PKH
            $bantuan->load([
                'keluarga' => function($query) {
                    $query->with(['anggota_keluarga']);
                },
                'distribusi' => function($query) {
                    $query->orderBy('bulan');
                }
            ]);

            // Hitung persentase distribusi
            $totalDistribusi = $bantuan->distribusi->count();
            $distribusiSelesai = $bantuan->distribusi->where('status', 'disalurkan')->count();
            $persentaseDistribusi = $totalDistribusi > 0 ? ($distribusiSelesai / $totalDistribusi) * 100 : 0;

            // Data tambahan untuk PKH
            $statistikDistribusi = [
                'total_bulan' => $totalDistribusi,
                'sudah_disalurkan' => $distribusiSelesai,
                'belum_disalurkan' => $bantuan->distribusi->where('status', 'belum_disalurkan')->count(),
                'gagal' => $bantuan->distribusi->where('status', 'gagal')->count(),
                'persentase' => round($persentaseDistribusi, 2),
                'total_nominal_tahun' => $bantuan->nominal_per_bulan * 12,
                'nominal_terdistribusi' => $bantuan->nominal_per_bulan * $distribusiSelesai
            ];

            return Inertia::render('Admin/Bantuan/Show', [
                'bantuan' => $bantuan,
                'statistik_distribusi' => $statistikDistribusi,
                'title' => "Detail Bantuan PKH - {$bantuan->keluarga->nama_kepala_keluarga}"
            ]);

        } catch (\Exception $e) {
            Log::error('Error in BantuanController@show: ' . $e->getMessage(), [
                'bantuan_id' => $bantuan->id ?? 'unknown'
            ]);
            
            return Inertia::render('Admin/Bantuan/Show', [
                'error' => 'Terjadi kesalahan saat memuat detail bantuan.',
                'bantuan' => null,
                'statistik_distribusi' => null,
                'title' => "Detail Bantuan PKH"
            ]);
        }
    }

    /**
     * FIX: Tambahkan method edit untuk form edit bantuan
     */
    public function edit(Bantuan $bantuan): Response|RedirectResponse
    {
        try {
            // Load data keluarga untuk konteks
            $bantuan->load('keluarga');

            // Data untuk form edit
            $statusOptions = [
                'ditetapkan' => 'Ditetapkan',
                'aktif' => 'Aktif',
                'selesai' => 'Selesai',
                'dibatalkan' => 'Dibatalkan'
            ];

            // Validasi apakah bantuan masih bisa diedit
            $canEdit = in_array($bantuan->status, ['ditetapkan', 'aktif']);
            
            if (!$canEdit) {
                return redirect()->route('admin.bantuan.show', $bantuan)
                    ->with('warning', 'Bantuan dengan status "' . $bantuan->status . '" tidak dapat diedit.');
            }

            return Inertia::render('Admin/Bantuan/Edit', [
                'bantuan' => $bantuan,
                'status_options' => $statusOptions,
                'title' => "Edit Bantuan PKH - {$bantuan->keluarga->nama_kepala_keluarga}"
            ]);

        } catch (\Exception $e) {
            Log::error('Error in BantuanController@edit: ' . $e->getMessage(), [
                'bantuan_id' => $bantuan->id ?? 'unknown'
            ]);
            
            return redirect()->route('admin.bantuan.index')
                ->with('error', 'Terjadi kesalahan saat memuat form edit bantuan.');
        }
    }

    /**
     * Display families that haven't received assistance
     */
    public function belumMenerima(Request $request): Response
    {
        try {
            $tahun = $request->input('tahun', now()->year);
            $search = $request->input('search');

            $query = Keluarga::with(['bantuan', 'verifikator'])
                ->belumMenerimaBantuan($tahun)
                ->layakBantuan();

            // Search functionality
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('no_kk', 'like', "%{$search}%")
                      ->orWhere('nama_kepala_keluarga', 'like', "%{$search}%")
                      ->orWhere('alamat', 'like', "%{$search}%");
                });
            }

            $keluarga = $query->latest()
                            ->paginate(15)
                            ->withQueryString();

            $statistik = [
                'total_belum_terima' => Keluarga::belumMenerimaBantuan($tahun)
                    ->layakBantuan()
                    ->count(),
                'sangat_miskin' => Keluarga::belumMenerimaBantuan($tahun)
                    ->where('status_ekonomi', 'sangat_miskin')
                    ->where('status_verifikasi', 'terverifikasi')
                    ->count(),
                'miskin' => Keluarga::belumMenerimaBantuan($tahun)
                    ->where('status_ekonomi', 'miskin')
                    ->where('status_verifikasi', 'terverifikasi')
                    ->count(),
                'rentan_miskin' => Keluarga::belumMenerimaBantuan($tahun)
                    ->where('status_ekonomi', 'rentan_miskin')
                    ->where('status_verifikasi', 'terverifikasi')
                    ->count(),
                'kurang_mampu' => Keluarga::belumMenerimaBantuan($tahun)
                    ->where('status_ekonomi', 'kurang_mampu')
                    ->where('status_verifikasi', 'terverifikasi')
                    ->count(),
            ];

            return Inertia::render('Admin/Bantuan/BelumMenerima', [
                'keluarga' => $keluarga,
                'statistik' => $statistik,
                'filters' => [
                    'tahun' => $tahun,
                    'search' => $search,
                ],
                'tahun_tersedia' => $this->getAvailableYears()
            ]);

        } catch (\Exception $e) {
            Log::error('Error in BantuanController@belumMenerima: ' . $e->getMessage());

            return Inertia::render('Admin/Bantuan/BelumMenerima', [
                'keluarga' => ['data' => [], 'links' => [], 'meta' => []],
                'statistik' => [
                    'total_belum_terima' => 0,
                    'sangat_miskin' => 0,
                    'miskin' => 0,
                    'rentan_miskin' => 0,
                    'kurang_mampu' => 0,
                ],
                'filters' => $request->only(['tahun', 'search']),
                'tahun_tersedia' => range(2020, now()->year + 1),
                'error' => 'Terjadi kesalahan saat memuat data.'
            ]);
        }
    }

    /**
     * Get spatial distribution data for map
     */
    public function peta(Request $request)
    {
        try {
            $tahun = $request->input('tahun', now()->year);

            if (!is_numeric($tahun) || $tahun < 2020 || $tahun > now()->year + 5) {
                return response()->json([
                    'error' => 'Tahun tidak valid',
                    'sudah_terima' => [],
                    'belum_terima' => [],
                    'statistik' => [
                        'total_sudah_terima' => 0,
                        'total_belum_terima' => 0,
                        'tahun' => $tahun,
                    ]
                ], 400);
            }

            // Get families that already received assistance
            $keluargaSudahTerima = collect();
            try {
                $keluargaSudahTerima = Keluarga::with(['bantuan' => function($q) use ($tahun) {
                        $q->where('tahun_anggaran', $tahun)
                          ->whereIn('status', ['ditetapkan', 'aktif']);
                    }])
                    ->whereHas('bantuan', function($q) use ($tahun) {
                        $q->where('tahun_anggaran', $tahun)
                          ->whereIn('status', ['ditetapkan', 'aktif']);
                    })
                    ->whereNotNull('latitude')
                    ->whereNotNull('longitude')
                    ->get()
                    ->map(function ($keluarga) use ($tahun) {
                        $bantuan = $keluarga->bantuan->first();
                        return [
                            'id' => $keluarga->id,
                            'no_kk' => $keluarga->no_kk ?? 'N/A',
                            'nama_kepala_keluarga' => $keluarga->nama_kepala_keluarga ?? 'N/A',
                            'alamat' => $keluarga->alamat ?? 'Alamat tidak tersedia',
                            'latitude' => (float) ($keluarga->latitude ?? 0),
                            'longitude' => (float) ($keluarga->longitude ?? 0),
                            'status_ekonomi' => $keluarga->status_ekonomi ?? 'N/A',
                            'status_bantuan' => 'sudah_terima',
                            'nominal_bantuan' => $bantuan ? (float) ($bantuan->nominal_per_bulan ?? 0) : 0,
                            'tahun_bantuan' => (int) $tahun,
                        ];
                    });
            } catch (\Exception $e) {
                Log::error('Error getting keluarga sudah terima: ' . $e->getMessage());
                $keluargaSudahTerima = collect();
            }

            // Get families that haven't received assistance
            $keluargaBelumTerima = collect();
            try {
                $keluargaBelumTerima = Keluarga::whereDoesntHave('bantuan', function($q) use ($tahun) {
                        $q->where('tahun_anggaran', $tahun)
                          ->whereIn('status', ['ditetapkan', 'aktif']);
                    })
                    ->whereIn('status_ekonomi', ['sangat_miskin', 'miskin', 'rentan_miskin', 'kurang_mampu'])
                    ->where('status_verifikasi', 'terverifikasi')
                    ->whereNotNull('latitude')
                    ->whereNotNull('longitude')
                    ->get()
                    ->map(function ($keluarga) use ($tahun) {
                        return [
                            'id' => $keluarga->id,
                            'no_kk' => $keluarga->no_kk ?? 'N/A',
                            'nama_kepala_keluarga' => $keluarga->nama_kepala_keluarga ?? 'N/A',
                            'alamat' => $keluarga->alamat ?? 'Alamat tidak tersedia',
                            'latitude' => (float) ($keluarga->latitude ?? 0),
                            'longitude' => (float) ($keluarga->longitude ?? 0),
                            'status_ekonomi' => $keluarga->status_ekonomi ?? 'N/A',
                            'status_bantuan' => 'belum_terima',
                            'nominal_bantuan' => 0,
                            'tahun_bantuan' => (int) $tahun,
                        ];
                    });
            } catch (\Exception $e) {
                Log::error('Error getting keluarga belum terima: ' . $e->getMessage());
                $keluargaBelumTerima = collect();
            }

            return response()->json([
                'sudah_terima' => $keluargaSudahTerima->toArray(),
                'belum_terima' => $keluargaBelumTerima->toArray(),
                'statistik' => [
                    'total_sudah_terima' => $keluargaSudahTerima->count(),
                    'total_belum_terima' => $keluargaBelumTerima->count(),
                    'tahun' => (int) $tahun,
                ]
            ], 200, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            Log::error('Error in BantuanController@peta: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'error' => 'Terjadi kesalahan saat memuat data peta.',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
                'sudah_terima' => [],
                'belum_terima' => [],
                'statistik' => [
                    'total_sudah_terima' => 0,
                    'total_belum_terima' => 0,
                    'tahun' => $request->input('tahun', now()->year),
                ]
            ], 500, [], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Store new bantuan (penetapan penerima)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'keluarga_ids' => 'required|array|min:1',
            'keluarga_ids.*' => 'exists:keluarga,id',
            'tahun_anggaran' => 'required|integer|min:2020|max:' . (now()->year + 5),
            'nominal_per_bulan' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string|max:500'
        ], [
            'keluarga_ids.required' => 'Pilih minimal satu keluarga.',
            'keluarga_ids.array' => 'Data keluarga tidak valid.',
            'keluarga_ids.min' => 'Pilih minimal satu keluarga.',
            'tahun_anggaran.required' => 'Tahun anggaran wajib diisi.',
            'tahun_anggaran.integer' => 'Tahun anggaran harus berupa angka.',
            'nominal_per_bulan.required' => 'Nominal bantuan per bulan wajib diisi.',
            'nominal_per_bulan.numeric' => 'Nominal bantuan harus berupa angka.',
            'nominal_per_bulan.min' => 'Nominal bantuan tidak boleh negatif.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            $berhasil = 0;
            $gagal = [];

            foreach ($request->keluarga_ids as $keluargaId) {
                try {
                    // Check if already has bantuan for this year
                    $existingBantuan = Bantuan::where('keluarga_id', $keluargaId)
                        ->where('tahun_anggaran', $request->tahun_anggaran)
                        ->first();

                    if ($existingBantuan) {
                        $gagal[] = $keluargaId;
                        continue;
                    }

                    // Create bantuan
                    $bantuan = Bantuan::create([
                        'keluarga_id' => $keluargaId,
                        'tahun_anggaran' => $request->tahun_anggaran,
                        'status' => 'ditetapkan',
                        'nominal_per_bulan' => $request->nominal_per_bulan,
                        'keterangan' => $request->keterangan,
                        'tanggal_penetapan' => now(),
                    ]);

                    // Create monthly distribution records
                    for ($bulan = 1; $bulan <= 12; $bulan++) {
                        DistribusiBantuan::create([
                            'bantuan_id' => $bantuan->id,
                            'bulan' => $bulan,
                            'status' => 'belum_disalurkan'
                        ]);
                    }

                    // Log activity
                    LogAktivitas::log(
                        'penetapan_bantuan',
                        'bantuan',
                        $bantuan->id,
                        null,
                        $bantuan->toArray(),
                        "Penetapan bantuan untuk keluarga ID: {$keluargaId}, tahun: {$request->tahun_anggaran}"
                    );

                    $berhasil++;

                } catch (\Exception $e) {
                    Log::error("Error creating bantuan for keluarga {$keluargaId}: " . $e->getMessage());
                    $gagal[] = $keluargaId;
                }
            }

            DB::commit();

            $message = "Berhasil menetapkan bantuan untuk {$berhasil} keluarga.";
            if (count($gagal) > 0) {
                $message .= " " . count($gagal) . " keluarga gagal (mungkin sudah menerima bantuan tahun ini).";
            }

            return back()->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in BantuanController@store: ' . $e->getMessage());

            return back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menetapkan bantuan.'])
                ->withInput();
        }
    }

    /**
     * Update bantuan
     */
    public function update(Request $request, Bantuan $bantuan)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:ditetapkan,aktif,selesai,dibatalkan',
            'nominal_per_bulan' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string|max:500'
        ], [
            'status.required' => 'Status bantuan wajib dipilih.',
            'status.in' => 'Status bantuan tidak valid.',
            'nominal_per_bulan.required' => 'Nominal bantuan per bulan wajib diisi.',
            'nominal_per_bulan.numeric' => 'Nominal bantuan harus berupa angka.',
            'nominal_per_bulan.min' => 'Nominal bantuan tidak boleh negatif.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $oldData = $bantuan->toArray();
            
            $bantuan->update([
                'status' => $request->status,
                'nominal_per_bulan' => $request->nominal_per_bulan,
                'keterangan' => $request->keterangan
            ]);

            // Log activity
            LogAktivitas::log(
                'update_bantuan',
                'bantuan',
                $bantuan->id,
                $oldData,
                $bantuan->fresh()->toArray(),
                "Update bantuan untuk keluarga: {$bantuan->keluarga->nama_kepala_keluarga}"
            );

            return redirect()->route('admin.bantuan.show', $bantuan)
                ->with('success', 'Data bantuan berhasil diperbarui.');

        } catch (\Exception $e) {
            Log::error('Error updating bantuan: ' . $e->getMessage());

            return back()
                ->withErrors(['error' => 'Terjadi kesalahan saat memperbarui data bantuan.'])
                ->withInput();
        }
    }

    /**
     * Delete bantuan
     */
    public function destroy(Bantuan $bantuan)
    {
        try {
            DB::beginTransaction();

            $keluargaName = $bantuan->keluarga->nama_kepala_keluarga;

            // Log before deletion
            LogAktivitas::log(
                'hapus_bantuan',
                'bantuan',
                $bantuan->id,
                $bantuan->toArray(),
                null,
                "Hapus bantuan untuk keluarga: {$keluargaName}"
            );

            // Hapus distribusi terkait terlebih dahulu
            $bantuan->distribusi()->delete();
            
            // Hapus bantuan
            $bantuan->delete();

            DB::commit();

            return redirect()->route('admin.bantuan.index')
                ->with('success', "Data bantuan untuk keluarga {$keluargaName} berhasil dihapus.");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting bantuan: ' . $e->getMessage());

            return back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menghapus data bantuan.']);
        }
    }

    /**
     * Distribute monthly assistance
     */
    public function distribusi(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'distribusi_ids' => 'required|array|min:1',
            'distribusi_ids.*' => 'exists:distribusi_bantuan,id',
            'catatan' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        try {
            DB::beginTransaction();

            $berhasil = 0;
            
            foreach ($request->distribusi_ids as $distribusiId) {
                $distribusi = DistribusiBantuan::find($distribusiId);
                
                if ($distribusi && $distribusi->status === 'belum_disalurkan') {
                    $distribusi->update([
                        'status' => 'disalurkan',
                        'tanggal_distribusi' => now(),
                        'catatan' => $request->catatan
                    ]);
                    
                    // Log activity
                    LogAktivitas::log(
                        'distribusi_bantuan',
                        'distribusi_bantuan',
                        $distribusi->id,
                        ['status' => 'belum_disalurkan'],
                        ['status' => 'disalurkan'],
                        "Distribusi bantuan bulan {$distribusi->bulan}"
                    );
                    
                    $berhasil++;
                }
            }

            DB::commit();

            return back()->with('success', "Berhasil mendistribusikan bantuan untuk {$berhasil} bulan.");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in distribusi bantuan: ' . $e->getMessage());

            return back()->withErrors(['error' => 'Terjadi kesalahan saat mendistribusikan bantuan.']);
        }
    }

    /**
     * Get bantuan statistics
     */
    private function getBantuanStatistics($tahun)
    {
        try {
            return [
                'total_penerima' => Bantuan::where('tahun_anggaran', $tahun)->count(),
                'aktif' => Bantuan::where('tahun_anggaran', $tahun)->where('status', 'aktif')->count(),
                'ditetapkan' => Bantuan::where('tahun_anggaran', $tahun)->where('status', 'ditetapkan')->count(),
                'selesai' => Bantuan::where('tahun_anggaran', $tahun)->where('status', 'selesai')->count(),
                'dibatalkan' => Bantuan::where('tahun_anggaran', $tahun)->where('status', 'dibatalkan')->count(),
                'total_nominal' => Bantuan::where('tahun_anggaran', $tahun)->sum('nominal_per_bulan') * 12,
                'distribusi_bulan_ini' => DistribusiBantuan::whereHas('bantuan', function ($q) use ($tahun) {
                    $q->where('tahun_anggaran', $tahun);
                })->where('bulan', now()->month)
                  ->where('status', 'disalurkan')
                  ->count(),
            ];
        } catch (\Exception $e) {
            Log::error('Error getting bantuan statistics: ' . $e->getMessage());
            return $this->getEmptyStatistics();
        }
    }

    /**
     * Get empty statistics for error handling
     */
    private function getEmptyStatistics()
    {
        return [
            'total_penerima' => 0,
            'aktif' => 0,
            'ditetapkan' => 0,
            'selesai' => 0,
            'dibatalkan' => 0,
            'total_nominal' => 0,
            'distribusi_bulan_ini' => 0,
        ];
    }

    /**
     * Get available years for filter
     */
    private function getAvailableYears()
    {
        try {
            $years = Bantuan::select('tahun_anggaran')
                ->distinct()
                ->orderBy('tahun_anggaran', 'desc')
                ->pluck('tahun_anggaran')
                ->toArray();

            // Add current and next year if not in list
            $currentYear = now()->year;
            if (!in_array($currentYear, $years)) {
                $years[] = $currentYear;
            }
            if (!in_array($currentYear + 1, $years)) {
                $years[] = $currentYear + 1;
            }

            return array_unique(array_filter($years));
        } catch (\Exception $e) {
            Log::error('Error getting available years: ' . $e->getMessage());
            return range(2020, now()->year + 1);
        }
    }
}
