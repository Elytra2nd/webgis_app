<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Keluarga;
use Inertia\Inertia;
use Illuminate\Http\Request;

class MapController extends Controller
{
    /**
     * Tampilkan peta untuk akses publik/guest
     */
    public function index()
    {
        return Inertia::render('Public/Map', [
            'title' => 'Peta Sebaran Program Keluarga Harapan',
            'public_access' => true,
            'readonly' => true,
            'can_edit' => false,
            'show_sensitive_data' => false
        ]);
    }

    /**
     * API untuk mendapatkan data peta publik (tanpa data sensitif)
     */
    public function getMapData()
    {
        $keluarga = Keluarga::select([
            'id',
            'nama_kepala_keluarga',
            'kota',
            'kecamatan',
            'kelurahan',
            'latitude',
            'longitude'
        ])
        ->whereNotNull('latitude')
        ->whereNotNull('longitude')
        ->where('is_public', true) // Asumsi ada field untuk kontrol visibility
        ->get()
        ->map(function ($item) {
            return [
                'id' => $item->id,
                'nama' => $item->nama_kepala_keluarga,
                'lokasi' => [
                    'kota' => $item->kota,
                    'kecamatan' => $item->kecamatan,
                    'kelurahan' => $item->kelurahan
                ],
                'coordinates' => [
                    'lat' => (float) $item->latitude,
                    'lng' => (float) $item->longitude
                ],
                'type' => 'keluarga'
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $keluarga,
            'total' => $keluarga->count()
        ]);
    }

    /**
     * API untuk statistik publik peta
     */
    public function getPublicStats()
    {
        $stats = [
            'total_keluarga' => Keluarga::where('is_public', true)->count(),
            'total_wilayah' => Keluarga::where('is_public', true)
                ->distinct('kota')
                ->count('kota'),
            'sebaran_kota' => Keluarga::where('is_public', true)
                ->selectRaw('kota, COUNT(*) as total')
                ->groupBy('kota')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
