<?php

namespace App\Http\Controllers;

use App\Models\Keluarga;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class KeluargaController extends Controller
{
    /**
     * Display a listing of the resource with pagination, search, and filter
     */
    public function index(Request $request)
    {
        try {
            $query = Keluarga::query();

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
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

            // Get paginated results with error handling
            $keluarga = $query->orderBy('created_at', 'desc')
                             ->paginate(10)
                             ->withQueryString();

            // Ensure pagination data is properly structured
            if (!$keluarga) {
                $keluarga = new \Illuminate\Pagination\LengthAwarePaginator(
                    [],
                    0,
                    10,
                    1,
                    ['path' => request()->url(), 'pageName' => 'page']
                );
            }

            // Get statistics with optimized queries and error handling
            $stats = $this->getKeluargaStatistics();

            // Ensure all required data is present
            $responseData = [
                'keluarga' => [
                    'data' => $keluarga->items() ?? [],
                    'meta' => [
                        'current_page' => $keluarga->currentPage() ?? 1,
                        'from' => $keluarga->firstItem() ?? 0,
                        'last_page' => $keluarga->lastPage() ?? 1,
                        'per_page' => $keluarga->perPage() ?? 10,
                        'to' => $keluarga->lastItem() ?? 0,
                        'total' => $keluarga->total() ?? 0,
                    ],
                    'links' => $keluarga->linkCollection()->toArray() ?? []
                ],
                'filters' => $request->only(['search', 'status']) ?? [],
                'stats' => $stats
            ];

            return Inertia::render('Keluarga/Index', $responseData);

        } catch (\Exception $e) {
            Log::error('Error in KeluargaController@index: ' . $e->getMessage());

            // Return safe fallback data
            return Inertia::render('Keluarga/Index', [
                'keluarga' => [
                    'data' => [],
                    'meta' => [
                        'current_page' => 1,
                        'from' => 0,
                        'last_page' => 1,
                        'per_page' => 10,
                        'to' => 0,
                        'total' => 0,
                    ],
                    'links' => []
                ],
                'filters' => $request->only(['search', 'status']) ?? [],
                'stats' => [
                    'total' => 0,
                    'sangat_miskin' => 0,
                    'miskin' => 0,
                    'rentan_miskin' => 0,
                ],
                'error' => 'Terjadi kesalahan saat memuat data. Silakan coba lagi.'
            ]);
        }
    }

    /**
     * Get statistics with error handling and caching
     */
    private function getKeluargaStatistics()
    {
        try {
            // Use DB queries for better performance
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

            // Return safe fallback
            return [
                'total' => 0,
                'sangat_miskin' => 0,
                'miskin' => 0,
                'rentan_miskin' => 0,
            ];
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
        $validator = Validator::make($request->all(), [
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
            'status_ekonomi' => 'required|in:sangat_miskin,miskin,rentan_miskin',
            'penghasilan_bulanan' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'lokasi' => 'nullable|string', // Support for lokasi field
        ], [
            'no_kk.required' => 'Nomor KK wajib diisi.',
            'no_kk.unique' => 'Nomor KK sudah terdaftar.',
            'no_kk.max' => 'Nomor KK maksimal 16 karakter.',
            'nama_kepala_keluarga.required' => 'Nama kepala keluarga wajib diisi.',
            'alamat.required' => 'Alamat wajib diisi.',
            'kelurahan.required' => 'Kelurahan wajib diisi.',
            'kecamatan.required' => 'Kecamatan wajib diisi.',
            'kota.required' => 'Kota/Kabupaten wajib diisi.',
            'provinsi.required' => 'Provinsi wajib diisi.',
            'status_ekonomi.required' => 'Status ekonomi wajib dipilih.',
            'status_ekonomi.in' => 'Status ekonomi tidak valid.',
            'penghasilan_bulanan.numeric' => 'Penghasilan bulanan harus berupa angka.',
            'penghasilan_bulanan.min' => 'Penghasilan bulanan tidak boleh negatif.',
            'latitude.between' => 'Latitude harus antara -90 dan 90.',
            'longitude.between' => 'Longitude harus antara -180 dan 180.',
        ]);

        if ($validator->fails()) {
            return Redirect::back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Prepare data with safe handling
            $data = $validator->validated();

            // Handle coordinate data - support both latitude/longitude and lokasi
            if (!empty($data['latitude']) && !empty($data['longitude'])) {
                $data['lokasi'] = $data['latitude'] . ',' . $data['longitude'];
            }

            $keluarga = Keluarga::create($data);

            DB::commit();

            return Redirect::route('keluarga.index')
                ->with('success', 'Data keluarga berhasil ditambahkan.')
                ->with('keluarga_id', $keluarga->id);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error storing keluarga: ' . $e->getMessage());

            return Redirect::back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.'])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Keluarga $keluarga)
    {
        try {
            // Safe loading with error handling
            $keluarga->loadMissing(['anggotaKeluarga', 'wilayah', 'jarak']);

            return Inertia::render('Keluarga/Show', [
                'keluarga' => $keluarga
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
            return Inertia::render('Keluarga/Edit', [
                'keluarga' => $keluarga
            ]);

        } catch (\Exception $e) {
            Log::error('Error editing keluarga: ' . $e->getMessage());

            return Redirect::route('keluarga.index')
                ->withErrors(['error' => 'Data keluarga tidak dapat diedit.']);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Keluarga $keluarga)
    {
        $validator = Validator::make($request->all(), [
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
            'status_ekonomi' => 'required|in:sangat_miskin,miskin,rentan_miskin',
            'penghasilan_bulanan' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'lokasi' => 'nullable|string',
        ], [
            'no_kk.required' => 'Nomor KK wajib diisi.',
            'no_kk.unique' => 'Nomor KK sudah terdaftar.',
            'no_kk.max' => 'Nomor KK maksimal 16 karakter.',
            'nama_kepala_keluarga.required' => 'Nama kepala keluarga wajib diisi.',
            'alamat.required' => 'Alamat wajib diisi.',
            'kelurahan.required' => 'Kelurahan wajib diisi.',
            'kecamatan.required' => 'Kecamatan wajib diisi.',
            'kota.required' => 'Kota/Kabupaten wajib diisi.',
            'provinsi.required' => 'Provinsi wajib diisi.',
            'status_ekonomi.required' => 'Status ekonomi wajib dipilih.',
            'status_ekonomi.in' => 'Status ekonomi tidak valid.',
            'penghasilan_bulanan.numeric' => 'Penghasilan bulanan harus berupa angka.',
            'penghasilan_bulanan.min' => 'Penghasilan bulanan tidak boleh negatif.',
            'latitude.between' => 'Latitude harus antara -90 dan 90.',
            'longitude.between' => 'Longitude harus antara -180 dan 180.',
        ]);

        if ($validator->fails()) {
            return Redirect::back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            $data = $validator->validated();

            // Handle coordinate data
            if (!empty($data['latitude']) && !empty($data['longitude'])) {
                $data['lokasi'] = $data['latitude'] . ',' . $data['longitude'];
            }

            $keluarga->update($data);

            DB::commit();

            return Redirect::route('keluarga.index')
                ->with('success', 'Data keluarga berhasil diperbarui.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating keluarga: ' . $e->getMessage());

            return Redirect::back()
                ->withErrors(['error' => 'Terjadi kesalahan saat memperbarui data. Silakan coba lagi.'])
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

            // Safe deletion with relationship checks
            if (method_exists($keluarga, 'anggotaKeluarga')) {
                $keluarga->anggotaKeluarga()->delete();
            }

            if (method_exists($keluarga, 'wilayah')) {
                $keluarga->wilayah()->detach();
            }

            if (method_exists($keluarga, 'jarak')) {
                $keluarga->jarak()->delete();
            }

            $keluarga->delete();

            DB::commit();

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
     * Export data to various formats
     */
    public function export(Request $request)
    {
        try {
            $format = $request->get('format', 'excel');
            $query = Keluarga::query();

            // Apply same filters as index
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('nama_kepala_keluarga', 'like', '%' . $search . '%')
                      ->orWhere('no_kk', 'like', '%' . $search . '%')
                      ->orWhere('alamat', 'like', '%' . $search . '%');
                });
            }

            if ($request->has('status') && $request->status !== 'all' && !empty($request->status)) {
                $query->where('status_ekonomi', $request->status);
            }

            $keluarga = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'message' => 'Export functionality will be implemented',
                'format' => $format,
                'count' => $keluarga->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Error exporting data: ' . $e->getMessage());

            return response()->json([
                'error' => 'Terjadi kesalahan saat export data.'
            ], 500);
        }
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

            return response()->json($stats);

        } catch (\Exception $e) {
            Log::error('Error getting statistics: ' . $e->getMessage());

            return response()->json([
                'total' => 0,
                'sangat_miskin' => 0,
                'miskin' => 0,
                'rentan_miskin' => 0,
                'with_coordinates' => 0,
                'without_coordinates' => 0,
            ]);
        }
    }

    /**
     * Get coordinate statistics
     */
    private function getCoordinateStatistics()
    {
        try {
            $withCoordinates = Keluarga::where(function ($query) {
                $query->whereNotNull('lokasi')
                      ->where('lokasi', '!=', '')
                      ->where('lokasi', 'REGEXP', '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$');
            })->count();

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
            'status_ekonomi' => 'required_if:action,update_status|in:sangat_miskin,miskin,rentan_miskin'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $keluargaQuery = Keluarga::whereIn('id', $request->ids);

            switch ($request->action) {
                case 'delete':
                    $count = $keluargaQuery->count();
                    $keluargaQuery->delete();

                    DB::commit();

                    return response()->json([
                        'message' => "Berhasil menghapus {$count} data keluarga."
                    ]);

                case 'update_status':
                    $count = $keluargaQuery->update(['status_ekonomi' => $request->status_ekonomi]);

                    DB::commit();

                    return response()->json([
                        'message' => "Berhasil memperbarui status {$count} data keluarga."
                    ]);

                default:
                    return response()->json(['error' => 'Aksi tidak valid.'], 400);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in bulk action: ' . $e->getMessage());

            return response()->json([
                'error' => 'Terjadi kesalahan saat memproses data.'
            ], 500);
        }
    }
}
