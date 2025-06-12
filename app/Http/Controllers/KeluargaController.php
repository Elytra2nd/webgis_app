<?php

namespace App\Http\Controllers;

use App\Models\Keluarga;
use App\Models\Bantuan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use MatanYadaev\EloquentSpatial\Objects\Point;

class KeluargaController extends Controller
{
    /**
     * Display a listing of the resource with pagination, search, and filter
     */
    public function index(Request $request)
    {
        try {
            $query = Keluarga::with(['bantuanAktif', 'verifikator']);

            // Search functionality dengan UTF-8 safe
            if ($request->has('search') && !empty($request->search)) {
                $search = $this->sanitizeUtf8String($request->search);
                $query->where(function ($q) use ($search) {
                    $q->where('nama_kepala_keluarga', 'like', '%' . $search . '%')
                      ->orWhere('no_kk', 'like', '%' . $search . '%')
                      ->orWhere('alamat', 'like', '%' . $search . '%')
                      ->orWhere('kelurahan', 'like', '%' . $search . '%')
                      ->orWhere('kecamatan', 'like', '%' . $search . '%')
                      ->orWhere('kota', 'like', '%' . $search . '%')
                      ->orWhere('provinsi', 'like', '%' . $search . '%');
                });
            }

            // Filter by status ekonomi
            if ($request->has('status') && $request->status !== 'all' && !empty($request->status)) {
                $query->where('status_ekonomi', $request->status);
            }

            // Filter by social assistance year (PKH requirement)
            $tahunBantuan = $request->input('tahun_bantuan', now()->year);
            if (!empty($tahunBantuan)) {
                // Add bantuan status to each keluarga based on selected year
                $query->addSelect([
                    'status_bantuan' => Bantuan::select(DB::raw("
                        CASE 
                            WHEN COUNT(*) > 0 THEN 'sudah_terima'
                            ELSE 'belum_terima'
                        END
                    "))
                    ->whereColumn('keluarga_id', 'keluarga.id')
                    ->where('tahun_anggaran', $tahunBantuan)
                    ->whereIn('status', ['ditetapkan', 'aktif'])
                    ->limit(1),
                    
                    'tahun_bantuan' => DB::raw($tahunBantuan),
                    
                    'nominal_bantuan' => Bantuan::select('nominal_per_bulan')
                        ->whereColumn('keluarga_id', 'keluarga.id')
                        ->where('tahun_anggaran', $tahunBantuan)
                        ->whereIn('status', ['ditetapkan', 'aktif'])
                        ->limit(1),
                        
                    'bulan_terakhir_distribusi' => DB::raw("(
                        SELECT MAX(db.bulan) 
                        FROM distribusi_bantuan db 
                        JOIN bantuan b ON db.bantuan_id = b.id 
                        WHERE b.keluarga_id = keluarga.id 
                        AND b.tahun_anggaran = {$tahunBantuan}
                        AND db.status = 'disalurkan'
                    )")
                ]);
            }

            // Filter by social assistance status (PKH requirement)
            if ($request->has('status_bantuan') && $request->status_bantuan !== 'all' && !empty($request->status_bantuan)) {
                $statusBantuan = $request->status_bantuan;
                if ($statusBantuan === 'sudah_terima') {
                    $query->whereHas('bantuan', function ($q) use ($tahunBantuan) {
                        $q->where('tahun_anggaran', $tahunBantuan)
                          ->whereIn('status', ['ditetapkan', 'aktif']);
                    });
                } elseif ($statusBantuan === 'belum_terima') {
                    $query->whereDoesntHave('bantuan', function ($q) use ($tahunBantuan) {
                        $q->where('tahun_anggaran', $tahunBantuan)
                          ->whereIn('status', ['ditetapkan', 'aktif']);
                    });
                }
            }

            // Get paginated results dengan UTF-8 handling
            $keluarga = $query->orderBy('created_at', 'desc')
                             ->paginate(15)
                             ->withQueryString();

            // Sanitize data untuk UTF-8 dan enhance dengan status bantuan
            $keluarga->getCollection()->transform(function ($item) {
                $sanitized = $this->sanitizeKeluargaForResponse($item);
                
                // Add PKH specific data
                $sanitized['status_bantuan'] = $item->status_bantuan ?? 'belum_terima';
                $sanitized['tahun_bantuan'] = $item->tahun_bantuan ?? null;
                $sanitized['nominal_bantuan'] = $item->nominal_bantuan ?? null;
                $sanitized['bulan_terakhir_distribusi'] = $item->bulan_terakhir_distribusi ?? null;
                
                return $sanitized;
            });

            // Get enhanced statistics for PKH
            $stats = $this->getKeluargaStatisticsForPKH($tahunBantuan);

            // Get available years for filter
            $tahunTersedia = $this->getAvailableYears();

            $responseData = [
                'keluarga' => [
                    'data' => $keluarga->items() ?? [],
                    'meta' => [
                        'current_page' => $keluarga->currentPage() ?? 1,
                        'from' => $keluarga->firstItem() ?? 0,
                        'last_page' => $keluarga->lastPage() ?? 1,
                        'per_page' => $keluarga->perPage() ?? 15,
                        'to' => $keluarga->lastItem() ?? 0,
                        'total' => $keluarga->total() ?? 0,
                    ],
                    'links' => $keluarga->linkCollection()->toArray() ?? []
                ],
                'filters' => $request->only(['search', 'status', 'tahun_bantuan', 'status_bantuan']) ?? [],
                'stats' => $stats,
                'tahun_tersedia' => $tahunTersedia,
                'tahun_aktif' => now()->year
            ];

            return Inertia::render('Admin/Keluarga/Index', $responseData);

        } catch (\Exception $e) {
            Log::error('Error in KeluargaController@index: ' . $e->getMessage());

            return Inertia::render('Admin/Keluarga/Index', [
                'keluarga' => [
                    'data' => [],
                    'meta' => [
                        'current_page' => 1,
                        'from' => 0,
                        'last_page' => 1,
                        'per_page' => 15,
                        'to' => 0,
                        'total' => 0,
                    ],
                    'links' => []
                ],
                'filters' => $request->only(['search', 'status', 'tahun_bantuan', 'status_bantuan']) ?? [],
                'stats' => [
                    'total' => 0,
                    'sangat_miskin' => 0,
                    'miskin' => 0,
                    'rentan_miskin' => 0,
                    'sudah_terima_bantuan' => 0,
                    'belum_terima_bantuan' => 0,
                    'layak_bantuan' => 0,
                    'total_penerima_tahun_ini' => 0
                ],
                'tahun_tersedia' => range(2020, now()->year + 1),
                'tahun_aktif' => now()->year,
                'error' => 'Terjadi kesalahan saat memuat data. Silakan coba lagi.'
            ]);
        }
    }

    /**
     * Get statistics with error handling
     */
    private function getKeluargaStatistics()
    {
        try {
            $totalCount = Keluarga::count();

            $statusCounts = Keluarga::select('status_ekonomi', DB::raw('count(*) as count'))
                ->groupBy('status_ekonomi')
                ->pluck('count', 'status_ekonomi')
                ->toArray();

            return [
                'total' => $totalCount,
                'sangat_miskin' => $statusCounts['sangat_miskin'] ?? 0,
                'miskin' => $statusCounts['miskin'] ?? 0,
                'rentan_miskin' => $statusCounts['rentan_miskin'] ?? 0,
            ];
        } catch (\Exception $e) {
            Log::error('Error getting statistics: ' . $e->getMessage());

            return [
                'total' => 0,
                'sangat_miskin' => 0,
                'miskin' => 0,
                'rentan_miskin' => 0,
            ];
        }
    }

    private function getKeluargaStatisticsForPKH($tahunBantuan = null)
    {
        try {
            $tahunBantuan = $tahunBantuan ?? now()->year;
            
            $totalCount = Keluarga::count();

            // Status ekonomi counts untuk semua kategori
            $statusCounts = Keluarga::select('status_ekonomi', DB::raw('count(*) as count'))
                ->groupBy('status_ekonomi')
                ->pluck('count', 'status_ekonomi')
                ->toArray();

            // PKH specific statistics - hanya untuk yang layak bantuan
            $sudahTerima = Keluarga::whereHas('bantuan', function ($q) use ($tahunBantuan) {
                $q->where('tahun_anggaran', $tahunBantuan)
                  ->whereIn('status', ['ditetapkan', 'aktif']);
            })->count();

            // FIX: Belum terima hanya untuk kategori yang layak PKH
            $belumTerima = Keluarga::whereDoesntHave('bantuan', function ($q) use ($tahunBantuan) {
                $q->where('tahun_anggaran', $tahunBantuan)
                  ->whereIn('status', ['ditetapkan', 'aktif']);
            })->whereIn('status_ekonomi', ['sangat_miskin', 'miskin', 'rentan_miskin']) // Hanya 3 kategori miskin yang layak PKH
              ->where('status_verifikasi', 'terverifikasi')
              ->count();

            // FIX: Layak bantuan hanya untuk 3 kategori miskin
            $layakBantuan = Keluarga::whereIn('status_ekonomi', ['sangat_miskin', 'miskin', 'rentan_miskin'])
                ->where('status_verifikasi', 'terverifikasi')
                ->count();

            $totalPenerimaTahunIni = Bantuan::where('tahun_anggaran', $tahunBantuan)
                ->whereIn('status', ['ditetapkan', 'aktif'])
                ->count();

            return [
                'total' => $totalCount,
                'sangat_miskin' => $statusCounts['sangat_miskin'] ?? 0,
                'miskin' => $statusCounts['miskin'] ?? 0,
                'rentan_miskin' => $statusCounts['rentan_miskin'] ?? 0,
                'kurang_mampu' => $statusCounts['kurang_mampu'] ?? 0,
                'mampu' => $statusCounts['mampu'] ?? 0,
                'sudah_terima_bantuan' => $sudahTerima,
                'belum_terima_bantuan' => $belumTerima,
                'layak_bantuan' => $layakBantuan,
                'total_penerima_tahun_ini' => $totalPenerimaTahunIni
            ];
        } catch (\Exception $e) {
            Log::error('Error getting PKH statistics: ' . $e->getMessage());

            return [
                'total' => 0,
                'sangat_miskin' => 0,
                'miskin' => 0,
                'rentan_miskin' => 0,
                'kurang_mampu' => 0,
                'mampu' => 0,
                'sudah_terima_bantuan' => 0,
                'belum_terima_bantuan' => 0,
                'layak_bantuan' => 0,
                'total_penerima_tahun_ini' => 0
            ];
        }
    }

    private function getAvailableYears()
    {
        try {
            $years = Bantuan::select('tahun_anggaran')
                ->distinct()
                ->orderBy('tahun_anggaran', 'desc')
                ->pluck('tahun_anggaran')
                ->toArray();

            // Add current year if not in list
            if (!in_array(now()->year, $years)) {
                $years[] = now()->year;
            }

            // Add previous and next years for flexibility
            $years[] = now()->year - 1;
            $years[] = now()->year + 1;

            return array_unique(array_filter($years));
        } catch (\Exception $e) {
            Log::error('Error getting available years: ' . $e->getMessage());
            return range(2020, now()->year + 1);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Keluarga/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info('Store request received:', [
            'method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'all_data' => $this->sanitizeDataForLogging($request->except(['_token']))
        ]);

        $inputData = $this->sanitizeUtf8Data($request->all());

        $validator = Validator::make($inputData, [
            'no_kk' => 'required|string|max:16|unique:keluarga,no_kk',
            'nama_kepala_keluarga' => 'required|string|max:255',
            'alamat' => 'required|string',
            'rt' => 'nullable|string|max:3',
            'rw' => 'nullable|string|max:3',
            'kelurahan' => 'required|string|max:255',
            'kecamatan' => 'required|string|max:255',
            'kota' => 'required|string|max:255',
            'provinsi' => 'required|string|max:255',
            'kode_pos' => 'nullable|string|max:5',
            // FIX: Tambahkan status mampu dan kurang_mampu
            'status_ekonomi' => 'required|in:sangat_miskin,miskin,rentan_miskin,kurang_mampu,mampu',
            'penghasilan_bulanan' => 'nullable|numeric|min:0',
            'jumlah_anggota' => 'required|integer|min:1',
            'keterangan' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ], [
            'no_kk.required' => 'Nomor KK wajib diisi.',
            'no_kk.unique' => 'Nomor KK sudah terdaftar.',
            'nama_kepala_keluarga.required' => 'Nama kepala keluarga wajib diisi.',
            'alamat.required' => 'Alamat wajib diisi.',
            'kelurahan.required' => 'Kelurahan wajib diisi.',
            'kecamatan.required' => 'Kecamatan wajib diisi.',
            'kota.required' => 'Kota/Kabupaten wajib diisi.',
            'provinsi.required' => 'Provinsi wajib diisi.',
            'status_ekonomi.required' => 'Status ekonomi wajib dipilih.',
            'status_ekonomi.in' => 'Status ekonomi harus salah satu dari: Sangat Miskin, Miskin, Rentan Miskin, Kurang Mampu, atau Mampu.',
            'jumlah_anggota.required' => 'Jumlah anggota keluarga wajib diisi.',
            'jumlah_anggota.min' => 'Jumlah anggota keluarga minimal 1.',
        ]);

        if ($validator->fails()) {
            return Redirect::back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            $data = $validator->validated();
            
            // Set default verification status
            $data['status_verifikasi'] = 'belum_verifikasi';
            $data['is_active'] = true;

            // Handle coordinate data with spatial point
            if (!empty($data['latitude']) && !empty($data['longitude'])) {
                $lat = (float) $data['latitude'];
                $lng = (float) $data['longitude'];
                
                $data['koordinat_updated_at'] = now();
                $data['lokasi'] = new Point($lat, $lng);
            }

            $keluarga = Keluarga::create($data);

            DB::commit();

            Log::info('Keluarga created successfully:', ['id' => $keluarga->id]);

            return Redirect::route('admin.keluarga.index')
                ->with('success', 'Data keluarga berhasil ditambahkan ke sistem PKH.')
                ->with('keluarga_id', $keluarga->id);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error storing keluarga: ' . $e->getMessage());

            return Redirect::back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function updateCoordinates(Request $request, Keluarga $keluarga)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $lat = (float) $request->latitude;
            $lng = (float) $request->longitude;

            $keluarga->updateCoordinates($lat, $lng);

            return response()->json([
                'success' => true,
                'message' => 'Koordinat berhasil diperbarui',
                'data' => [
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'updated_at' => $keluarga->koordinat_updated_at
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating coordinates: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui koordinat'
            ], 500);
        }
    }


    /**
     * Store a newly created resource from map - NEW METHOD
     */
    public function storeFromMap(Request $request): JsonResponse
    {
        try {
            Log::info('Store from map request received:', [
                'method' => $request->method(),
                'content_type' => $request->header('Content-Type'),
                'all_data' => $this->sanitizeDataForLogging($request->all())
            ]);

            $inputData = $this->sanitizeUtf8Data($request->all());

            $validator = Validator::make($inputData, [
                'no_kk' => 'required|string|max:16|unique:keluarga,no_kk',
                'nama_kepala_keluarga' => 'required|string|max:255',
                'alamat' => 'required|string',
                // FIX: Update validasi untuk map juga menerima semua status
                'status_ekonomi' => 'required|in:sangat_miskin,miskin,rentan_miskin,kurang_mampu,mampu',
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
            ], [
                'no_kk.required' => 'Nomor KK wajib diisi.',
                'no_kk.unique' => 'Nomor KK sudah terdaftar.',
                'no_kk.max' => 'Nomor KK maksimal 16 karakter.',
                'nama_kepala_keluarga.required' => 'Nama kepala keluarga wajib diisi.',
                'alamat.required' => 'Alamat wajib diisi.',
                'status_ekonomi.required' => 'Status ekonomi wajib dipilih.',
                'status_ekonomi.in' => 'Status ekonomi harus salah satu dari: Sangat Miskin, Miskin, Rentan Miskin, Kurang Mampu, atau Mampu.',
                'latitude.required' => 'Latitude wajib diisi.',
                'latitude.between' => 'Latitude harus antara -90 dan 90.',
                'longitude.required' => 'Longitude wajib diisi.',
                'longitude.between' => 'Longitude harus antara -180 dan 180.',
            ]);

            if ($validator->fails()) {
                Log::warning('Store from map validation failed:', $validator->errors()->toArray());

                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422, [], JSON_UNESCAPED_UNICODE);
            }

            DB::beginTransaction();

            $data = $validator->validated();
            $lat = (float) $data['latitude'];
            $lng = (float) $data['longitude'];

            $keluarga = Keluarga::create([
                'no_kk' => $data['no_kk'],
                'nama_kepala_keluarga' => $data['nama_kepala_keluarga'],
                'alamat' => $data['alamat'],
                'status_ekonomi' => $data['status_ekonomi'],
                'latitude' => $lat,
                'longitude' => $lng,
                'kelurahan' => 'Belum diisi',
                'kecamatan' => 'Belum diisi',
                'kota' => 'Belum diisi',
                'provinsi' => 'Belum diisi',
            ]);

            DB::statement(
                "UPDATE keluarga SET lokasi = POINT(?, ?) WHERE id = ?",
                [$lng, $lat, $keluarga->id]
            );

            DB::commit();

            Log::info('Keluarga created from map successfully:', ['id' => $keluarga->id]);

            $responseData = $this->sanitizeKeluargaForResponse($keluarga->fresh());
            $responseData['latitude'] = $lat;
            $responseData['longitude'] = $lng;

            return response()->json([
                'success' => true,
                'message' => 'Data keluarga berhasil ditambahkan',
                'data' => $responseData
            ], 201, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error storing keluarga from map: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500, [], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Get keluarga data for map display - NEW METHOD
     */
    public function getForMap(Request $request): JsonResponse
    {
        try {
            $query = Keluarga::query()
                ->whereNotNull('lokasi');

            // Apply filters if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status_ekonomi', $request->status);
            }

            // Get data dengan extract koordinat dari POINT
            $keluarga = $query->select([
                'id', 'no_kk', 'nama_kepala_keluarga', 'alamat',
                'kelurahan', 'kecamatan', 'kota', 'provinsi',
                'status_ekonomi',
                DB::raw('ST_X(lokasi) as longitude'),
                DB::raw('ST_Y(lokasi) as latitude')
            ])->get();

            // Sanitize data untuk response
            $sanitizedData = $keluarga->map(function ($item) {
                $data = $this->sanitizeKeluargaForResponse($item);
                // Ensure latitude and longitude are properly formatted
                $data['latitude'] = isset($data['latitude']) ? (float) $data['latitude'] : null;
                $data['longitude'] = isset($data['longitude']) ? (float) $data['longitude'] : null;
                return $data;
            })->filter(function ($item) {
                // Filter hanya yang memiliki koordinat valid
                return $item['latitude'] !== null && $item['longitude'] !== null;
            })->values();

            return response()->json($sanitizedData, 200, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            Log::error('Error getting keluarga for map: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memuat data peta: ' . $e->getMessage()
            ], 500, [], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Keluarga $keluarga)
    {
        try {
            // Sanitize data sebelum dikirim ke frontend
            $sanitizedKeluarga = $this->sanitizeKeluargaForResponse($keluarga);

            return Inertia::render('Admin/Keluarga/Show', [
                'keluarga' => $sanitizedKeluarga
            ]);

        } catch (\Exception $e) {
            Log::error('Error showing keluarga: ' . $e->getMessage());

            return Redirect::route('keluarga.index')
                ->withErrors(['error' => 'Data keluarga tidak dapat ditampilkan.']);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Keluarga $keluarga)
    {
        try {
            // Extract koordinat dari POINT jika ada
            if ($keluarga->lokasi) {
                $coordinates = DB::select(
                    "SELECT ST_X(lokasi) as longitude, ST_Y(lokasi) as latitude FROM keluarga WHERE id = ?",
                    [$keluarga->id]
                );

                if (!empty($coordinates)) {
                    $keluarga->latitude = $coordinates[0]->latitude;
                    $keluarga->longitude = $coordinates[0]->longitude;
                }
            }

            // Sanitize data sebelum dikirim ke frontend
            $sanitizedKeluarga = $this->sanitizeKeluargaForResponse($keluarga);

            return Inertia::render('Admin/Keluarga/Edit', [
                'keluarga' => $sanitizedKeluarga
            ]);

        } catch (\Exception $e) {
            Log::error('Error editing keluarga: ' . $e->getMessage());

            return Redirect::route('keluarga.index')
                ->withErrors(['error' => 'Data keluarga tidak dapat diedit.']);
        }
    }

    /**
     * Update the specified resource in storage - PERBAIKAN untuk UTF-8
     */
    public function update(Request $request, Keluarga $keluarga)
    {
        try {
            Log::info('Update request received:', [
                'method' => $request->method(),
                'has_method_field' => $request->has('_method'),
                'method_field' => $request->get('_method'),
                'content_type' => $request->header('Content-Type'),
                'keluarga_id' => $keluarga->id,
                'all_data' => $this->sanitizeDataForLogging($request->except(['_method', '_token']))
            ]);

            $dataToValidate = $request->except(['_method', '_token']);
            $dataToValidate = $this->sanitizeUtf8Data($dataToValidate);

            $validator = Validator::make($dataToValidate, [
                'no_kk' => [
                    'required',
                    'string',
                    'max:16',
                    Rule::unique('keluarga', 'no_kk')->ignore($keluarga->id)
                ],
                'nama_kepala_keluarga' => 'required|string|max:255',
                'alamat' => 'required|string',
                'rt' => 'nullable|string|max:3',
                'rw' => 'nullable|string|max:3',
                'kelurahan' => 'required|string|max:255',
                'kecamatan' => 'required|string|max:255',
                'kota' => 'required|string|max:255',
                'provinsi' => 'required|string|max:255',
                'kode_pos' => 'nullable|string|max:5',
                // FIX: Update validasi untuk menerima semua status ekonomi
                'status_ekonomi' => 'required|in:sangat_miskin,miskin,rentan_miskin,kurang_mampu,mampu',
                'penghasilan_bulanan' => 'nullable|numeric|min:0',
                'jumlah_anggota' => 'required|integer|min:1',
                'keterangan' => 'nullable|string',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
            ], [
                'status_ekonomi.required' => 'Status ekonomi wajib dipilih.',
                'status_ekonomi.in' => 'Status ekonomi harus salah satu dari: Sangat Miskin, Miskin, Rentan Miskin, Kurang Mampu, atau Mampu.',
            ]);

            if ($validator->fails()) {
                Log::warning('Update validation failed:', $validator->errors()->toArray());

                return Redirect::back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            $data = $validator->validated();

            // Handle coordinate data
            if (!empty($data['latitude']) && !empty($data['longitude'])) {
                $lat = (float) $data['latitude'];
                $lng = (float) $data['longitude'];

                $data['latitude'] = $lat;
                $data['longitude'] = $lng;

                DB::statement(
                    "UPDATE keluarga SET lokasi = POINT(?, ?) WHERE id = ?",
                    [$lng, $lat, $keluarga->id]
                );

                unset($data['lokasi']);
            } elseif (empty($data['latitude']) && empty($data['longitude'])) {
                $data['latitude'] = null;
                $data['longitude'] = null;

                DB::statement(
                    "UPDATE keluarga SET lokasi = NULL WHERE id = ?",
                    [$keluarga->id]
                );
            }

            $keluarga->update($data);

            DB::commit();

            Log::info('Keluarga updated successfully:', ['id' => $keluarga->id]);

            $responseKeluarga = $this->sanitizeKeluargaForResponse($keluarga->fresh());

            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'message' => 'Data keluarga berhasil diperbarui.',
                    'keluarga' => $responseKeluarga
                ], 200, [], JSON_UNESCAPED_UNICODE);
            }

            return Redirect::back()
                ->with('success', 'Data keluarga berhasil diperbarui.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating keluarga: ' . $e->getMessage(), [
                'keluarga_id' => $keluarga->id,
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'error' => 'Terjadi kesalahan saat memperbarui data: ' . $e->getMessage()
                ], 500, [], JSON_UNESCAPED_UNICODE);
            }

            return Redirect::back()
                ->withErrors(['error' => 'Terjadi kesalahan saat memperbarui data: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Keluarga $keluarga)
    {
        try {
            DB::beginTransaction();

            $keluarga->delete();

            DB::commit();

            Log::info('Keluarga deleted successfully:', ['id' => $keluarga->id]);

            return Redirect::route('keluarga.index')
                ->with('success', 'Data keluarga berhasil dihapus.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting keluarga: ' . $e->getMessage());

            return Redirect::back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menghapus data. Silakan coba lagi.']);
        }
    }

    /**
     * Get keluarga data for map display - LEGACY METHOD (kept for compatibility)
     */
    public function getKeluargaForMap(Request $request)
    {
        return $this->getForMap($request);
    }

    /**
     * PERBAIKAN: Sanitize data untuk UTF-8 encoding
     */
    private function sanitizeUtf8Data($data)
    {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                if (is_string($value)) {
                    // Ensure proper UTF-8 encoding dan remove invalid characters
                    $data[$key] = $this->sanitizeUtf8String($value);
                } elseif (is_array($value)) {
                    $data[$key] = $this->sanitizeUtf8Data($value);
                }
            }
        } elseif (is_string($data)) {
            $data = $this->sanitizeUtf8String($data);
        }

        return $data;
    }

    /**
     * PERBAIKAN: Sanitize single UTF-8 string
     */
    private function sanitizeUtf8String($string)
    {
        if (!is_string($string)) {
            return $string;
        }

        // Convert to UTF-8 if not already
        if (!mb_check_encoding($string, 'UTF-8')) {
            $string = mb_convert_encoding($string, 'UTF-8', mb_detect_encoding($string));
        }

        // Remove control characters and null bytes
        $string = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $string);

        // Ensure proper UTF-8 encoding
        $string = mb_convert_encoding($string, 'UTF-8', 'UTF-8');

        // Trim whitespace
        $string = trim($string);

        return $string;
    }

    /**
     * PERBAIKAN: Sanitize data untuk logging (remove binary data)
     */
    private function sanitizeDataForLogging($data)
    {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                if (is_string($value)) {
                    // Check if string contains binary data atau invalid UTF-8
                    if (!mb_check_encoding($value, 'UTF-8')) {
                        $data[$key] = '[BINARY_DATA_REMOVED]';
                    } else {
                        // Remove control characters untuk logging
                        $data[$key] = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value);
                    }
                } elseif (is_array($value)) {
                    $data[$key] = $this->sanitizeDataForLogging($value);
                }
            }
        }

        return $data;
    }

    /**
     * PERBAIKAN: Sanitize keluarga data untuk response
     */
    private function sanitizeKeluargaForResponse($keluarga)
    {
        $data = is_array($keluarga) ? $keluarga : $keluarga->toArray();

        // Sanitize string fields
        $stringFields = [
            'no_kk', 'nama_kepala_keluarga', 'alamat', 'rt', 'rw',
            'kelurahan', 'kecamatan', 'kota', 'provinsi', 'kode_pos',
            'status_ekonomi', 'keterangan'
        ];

        foreach ($stringFields as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = $this->sanitizeUtf8String($data[$field]);
            }
        }

        // Handle numeric fields
        $numericFields = ['latitude', 'longitude', 'penghasilan_bulanan'];
        foreach ($numericFields as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = is_numeric($data[$field]) ? $data[$field] : null;
            }
        }

        return $data;
    }

    /**
     * Get statistics for dashboard with error handling
     */
    public function getStatistics()
    {
        try {
            $stats = $this->getKeluargaStatistics();

            // Add coordinate statistics
            $coordinateStats = $this->getCoordinateStatistics();
            $stats = array_merge($stats, $coordinateStats);

            return response()->json($stats, 200, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            Log::error('Error getting statistics: ' . $e->getMessage());

            return response()->json([
                'total' => 0,
                'sangat_miskin' => 0,
                'miskin' => 0,
                'rentan_miskin' => 0,
                'with_coordinates' => 0,
                'without_coordinates' => 0,
            ], 200, [], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Get coordinate statistics
     */
    private function getCoordinateStatistics()
    {
        try {
            $withCoordinates = Keluarga::whereNotNull('lokasi')->count();
            $total = Keluarga::count();
            $withoutCoordinates = $total - $withCoordinates;

            return [
                'with_coordinates' => $withCoordinates,
                'without_coordinates' => $withoutCoordinates,
            ];

        } catch (\Exception $e) {
            Log::error('Error getting coordinate statistics: ' . $e->getMessage());

            return [
                'with_coordinates' => 0,
                'without_coordinates' => 0,
            ];
        }
    }

    /**
     * Bulk operations with enhanced error handling
     */
    public function bulkAction(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|in:delete,update_status',
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:keluarga,id',
            // FIX: Update validasi bulk untuk semua status
            'status_ekonomi' => 'required_if:action,update_status|in:sangat_miskin,miskin,rentan_miskin,kurang_mampu,mampu'
        ], [
            'status_ekonomi.in' => 'Status ekonomi harus salah satu dari: Sangat Miskin, Miskin, Rentan Miskin, Kurang Mampu, atau Mampu.'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422, [], JSON_UNESCAPED_UNICODE);
        }

        try {
            DB::beginTransaction();

            $keluargaQuery = Keluarga::whereIn('id', $request->ids);

            switch ($request->action) {
                case 'delete':
                    $count = $keluargaQuery->count();
                    $keluargaQuery->delete();

                    DB::commit();

                    Log::info('Bulk delete completed:', ['count' => $count]);

                    return response()->json([
                        'message' => "Berhasil menghapus {$count} data keluarga."
                    ], 200, [], JSON_UNESCAPED_UNICODE);

                case 'update_status':
                    $count = $keluargaQuery->update(['status_ekonomi' => $request->status_ekonomi]);

                    DB::commit();

                    Log::info('Bulk status update completed:', ['count' => $count]);

                    return response()->json([
                        'message' => "Berhasil memperbarui status {$count} data keluarga."
                    ], 200, [], JSON_UNESCAPED_UNICODE);

                default:
                    return response()->json(['error' => 'Aksi tidak valid.'], 400, [], JSON_UNESCAPED_UNICODE);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in bulk action: ' . $e->getMessage());

            return response()->json([
                'error' => 'Terjadi kesalahan saat memproses data.'
            ], 500, [], JSON_UNESCAPED_UNICODE);
        }
    }

}
