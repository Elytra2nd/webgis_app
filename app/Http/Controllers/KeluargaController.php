<?php

namespace App\Http\Controllers;

use App\Models\Keluarga;
use Illuminate\Http\Request;
use Inertia\Inertia;
use MatanYadaev\EloquentSpatial\Objects\Point;

class KeluargaController extends Controller
{
    public function index(Request $request)
    {
        // Load relasi
        $keluarga = Keluarga::all();

        // Transformasi data untuk frontend
        $keluarga->transform(function ($item) {
            if ($item->lokasi) {
                $item->latitude = $item->lokasi->latitude;
                $item->longitude = $item->lokasi->longitude;
            }
            return $item;
        });

        if (!$request->user()) {
            return Inertia::render('Keluarga/PublicIndex', [
                'keluarga' => $keluarga
            ]);
        }

        return Inertia::render('Keluarga/Index', [
            'keluarga' => $keluarga
        ]);
    }

    public function getKeluargaForMap()
    {
        $keluarga = Keluarga::all();

        // Transformasi data untuk frontend
        $keluarga->transform(function ($item) {
            if ($item->lokasi) {
                $item->latitude = $item->lokasi->latitude;
                $item->longitude = $item->lokasi->longitude;
            }
            return $item;
        });

        return response()->json($keluarga);
    }

    public function create()
    {
        return Inertia::render('Keluarga/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'no_kk' => 'required|string|max:16|unique:keluarga',
            'nama_kepala_keluarga' => 'required|string|max:255',
            'alamat' => 'required|string',
            'rt' => 'required|string',
            'rw' => 'required|string',
            'kelurahan' => 'required|string',
            'kecamatan' => 'required|string',
            'kota' => 'required|string',
            'provinsi' => 'required|string',
            'kode_pos' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'status_ekonomi' => 'required|in:sangat_miskin,miskin,rentan_miskin',
            'penghasilan_bulanan' => 'nullable|integer',
            'keterangan' => 'nullable|string',
        ]);

        // Buat objek Point jika ada koordinat
        if (isset($validated['latitude']) && isset($validated['longitude'])) {
            $validated['lokasi'] = new Point($validated['latitude'], $validated['longitude']);
        }

        // Hapus latitude dan longitude dari array validated
        unset($validated['latitude'], $validated['longitude']);

        $keluarga = Keluarga::create($validated);

        return redirect()->route('keluarga.index')
            ->with('message', 'Data keluarga berhasil disimpan.');
    }

    // Method baru untuk menyimpan data dari peta
    public function storeFromMap(Request $request)
    {
        try {
            $validated = $request->validate([
                'no_kk' => 'required|string|max:16|unique:keluarga',
                'nama_kepala_keluarga' => 'required|string|max:255',
                'alamat' => 'required|string',
                'status_ekonomi' => 'required|in:sangat_miskin,miskin,rentan_miskin',
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
                // Field opsional untuk map
                'rt' => 'nullable|string',
                'rw' => 'nullable|string',
                'kelurahan' => 'nullable|string',
                'kecamatan' => 'nullable|string',
                'kota' => 'nullable|string',
                'provinsi' => 'nullable|string',
                'kode_pos' => 'nullable|string',
                'penghasilan_bulanan' => 'nullable|integer',
                'keterangan' => 'nullable|string',
            ]);

            // Buat objek Point untuk lokasi
            $validated['lokasi'] = new Point($validated['latitude'], $validated['longitude']);

            // Hapus latitude dan longitude dari array validated
            unset($validated['latitude'], $validated['longitude']);

            $keluarga = Keluarga::create($validated);

            // Transform data untuk response
            if ($keluarga->lokasi) {
                $keluarga->latitude = $keluarga->lokasi->latitude;
                $keluarga->longitude = $keluarga->lokasi->longitude;
            }

            return response()->json($keluarga, 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('Error saving keluarga from map: ' . $e->getMessage());

            return response()->json([
                'message' => 'Gagal menyimpan data. Silakan coba lagi.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, Keluarga $keluarga)
    {
        // Load relasi
        $keluarga->load('anggotaKeluarga', 'wilayah', 'jarak');

        // Transformasi data untuk frontend
        if ($keluarga->lokasi) {
            $keluarga->latitude = $keluarga->lokasi->latitude;
            $keluarga->longitude = $keluarga->lokasi->longitude;
        }

        if (!$request->user()) {
            return Inertia::render('Keluarga/PublicShow', [
                'keluarga' => $keluarga
            ]);
        }

        return Inertia::render('Keluarga/Show', [
            'keluarga' => $keluarga
        ]);
    }

    public function edit(Keluarga $keluarga)
    {
        // Transformasi data untuk frontend
        if ($keluarga->lokasi) {
            $keluarga->latitude = $keluarga->lokasi->latitude;
            $keluarga->longitude = $keluarga->lokasi->longitude;
        }

        return Inertia::render('Keluarga/Edit', [
            'keluarga' => $keluarga
        ]);
    }

    public function update(Request $request, Keluarga $keluarga)
    {
        $validated = $request->validate([
            'no_kk' => 'required|string|max:16|unique:keluarga,no_kk,' . $keluarga->id,
            'nama_kepala_keluarga' => 'required|string|max:255',
            'alamat' => 'required|string',
            'rt' => 'required|string',
            'rw' => 'required|string',
            'kelurahan' => 'required|string',
            'kecamatan' => 'required|string',
            'kota' => 'required|string',
            'provinsi' => 'required|string',
            'kode_pos' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'status_ekonomi' => 'required|in:sangat_miskin,miskin,rentan_miskin',
            'penghasilan_bulanan' => 'nullable|integer',
            'keterangan' => 'nullable|string',
        ]);

        // Buat objek Point jika ada koordinat
        if (isset($validated['latitude']) && isset($validated['longitude'])) {
            $validated['lokasi'] = new Point($validated['latitude'], $validated['longitude']);
        }

        // Hapus latitude dan longitude dari array validated
        unset($validated['latitude'], $validated['longitude']);

        $keluarga->update($validated);

        return redirect()->route('keluarga.index')
            ->with('message', 'Data keluarga berhasil diperbarui.');
    }

    public function destroy(Keluarga $keluarga)
    {
        $keluarga->delete();

        return redirect()->route('keluarga.index')
            ->with('message', 'Data keluarga berhasil dihapus.');
    }
}
