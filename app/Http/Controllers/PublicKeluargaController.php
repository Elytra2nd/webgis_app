<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Keluarga;

class PublicKeluargaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $kota = $request->get('kota');

        $query = Keluarga::query()
            ->select(['id', 'no_kk', 'nama_kepala_keluarga', 'alamat', 'kota', 'status_ekonomi'])
            ->with(['anggota_keluarga:id,keluarga_id,nama']);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('nama_kepala_keluarga', 'like', "%{$search}%")
                  ->orWhere('alamat', 'like', "%{$search}%");
            });
        }

        if ($kota) {
            $query->where('kota', $kota);
        }

        $keluarga = $query->paginate(12);

        $available_cities = Keluarga::distinct('kota')
            ->whereNotNull('kota')
            ->pluck('kota')
            ->sort()
            ->values();

        return Inertia::render('Public/KeluargaIndex', [
            'keluarga' => $keluarga,
            'available_cities' => $available_cities,
            'filters' => [
                'search' => $search,
                'kota' => $kota
            ]
        ]);
    }

    public function show(Keluarga $keluarga)
    {
        $keluarga->load(['anggota_keluarga' => function($query) {
            $query->select(['id', 'keluarga_id', 'nama', 'jenis_kelamin', 'status_dalam_keluarga']);
        }]);

        return Inertia::render('Public/KeluargaShow', [
            'keluarga' => [
                'id' => $keluarga->id,
                'no_kk' => $keluarga->no_kk,
                'nama_kepala_keluarga' => $keluarga->nama_kepala_keluarga,
                'alamat' => $keluarga->alamat,
                'kota' => $keluarga->kota,
                'status_ekonomi' => $keluarga->status_ekonomi,
                'anggota_keluarga' => $keluarga->anggota_keluarga
            ]
        ]);
    }
}
