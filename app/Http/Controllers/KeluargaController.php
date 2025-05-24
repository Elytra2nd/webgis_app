<?php

namespace App\Http\Controllers;

use App\Models\Keluarga;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class KeluargaController extends Controller
{
    /**
     * Display a listing of the resource with pagination, search, and filter
     */
    public function index(Request $request)
    {
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

        // Get paginated results
        $keluarga = $query->orderBy('created_at', 'desc')
                         ->paginate(10)
                         ->withQueryString(); // Maintain query parameters in pagination links

        // Get statistics for all data (not just current page)
        $allKeluarga = Keluarga::all();
        $stats = [
            'total' => $allKeluarga->count(),
            'sangat_miskin' => $allKeluarga->where('status_ekonomi', 'sangat_miskin')->count(),
            'miskin' => $allKeluarga->where('status_ekonomi', 'miskin')->count(),
            'rentan_miskin' => $allKeluarga->where('status_ekonomi', 'rentan_miskin')->count(),
        ];

        return Inertia::render('Keluarga/Index', [
            'keluarga' => $keluarga,
            'filters' => $request->only(['search', 'status']),
            'stats' => $stats
        ]);
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
            $keluarga = Keluarga::create($validator->validated());

            return Redirect::route('keluarga.index')
                ->with('success', 'Data keluarga berhasil ditambahkan.')
                ->with('keluarga_id', $keluarga->id);
        } catch (\Exception $e) {
            return Redirect::back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Keluarga $keluarga)
    {
        // Load relationships if needed
        $keluarga->load(['anggotaKeluarga', 'wilayah', 'jarak']);

        return Inertia::render('Keluarga/Show', [
            'keluarga' => $keluarga
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Keluarga $keluarga)
    {
        return Inertia::render('Keluarga/Edit', [
            'keluarga' => $keluarga
        ]);
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
            $keluarga->update($validator->validated());

            return Redirect::route('keluarga.index')
                ->with('success', 'Data keluarga berhasil diperbarui.');
        } catch (\Exception $e) {
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
            // Delete related data first if needed
            $keluarga->anggotaKeluarga()->delete();
            $keluarga->wilayah()->detach();
            $keluarga->jarak()->delete();

            // Delete the main record
            $keluarga->delete();

            return Redirect::route('keluarga.index')
                ->with('success', 'Data keluarga berhasil dihapus.');
        } catch (\Exception $e) {
            return Redirect::back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menghapus data: ' . $e->getMessage()]);
        }
    }

    /**
     * Export data to various formats
     */
    public function export(Request $request)
    {
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

        // Export logic here (Excel, PDF, CSV)
        // This would typically use packages like Laravel Excel or DomPDF

        return response()->json([
            'message' => 'Export functionality will be implemented',
            'format' => $format,
            'count' => $keluarga->count()
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
            'with_coordinates' => Keluarga::whereNotNull('latitude')->whereNotNull('longitude')->count(),
            'without_coordinates' => Keluarga::whereNull('latitude')->orWhereNull('longitude')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Bulk operations
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
            $keluargaQuery = Keluarga::whereIn('id', $request->ids);

            switch ($request->action) {
                case 'delete':
                    $count = $keluargaQuery->count();
                    $keluargaQuery->delete();
                    return response()->json([
                        'message' => "Berhasil menghapus {$count} data keluarga."
                    ]);

                case 'update_status':
                    $count = $keluargaQuery->update(['status_ekonomi' => $request->status_ekonomi]);
                    return response()->json([
                        'message' => "Berhasil memperbarui status {$count} data keluarga."
                    ]);

                default:
                    return response()->json(['error' => 'Aksi tidak valid.'], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}
