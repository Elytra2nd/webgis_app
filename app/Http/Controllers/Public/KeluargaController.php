<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Keluarga;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KeluargaController extends Controller
{
    /**
     * Menampilkan halaman daftar keluarga publik dengan fitur pencarian dan filter.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        // Ambil data dari query string untuk filter dan pencarian
        $searchQuery = $request->input('search');
        $statusFilter = $request->input('status');

        // Query dasar untuk model Keluarga
        $keluargas = Keluarga::query()
            // Menambahkan hitungan anggota keluarga secara efisien tanpa N+1 problem
            ->withCount('anggotaKeluarga as jumlah_anggota')
            ->latest('id') // Urutkan berdasarkan data terbaru
            ->when($searchQuery, function ($query, $search) {
                // Terapkan filter pencarian jika ada
                // Mencari berdasarkan no_kk ATAU nama kepala keluarga
                $query->where('no_kk', 'like', "%{$search}%")
                      ->orWhere('nama_kepala_keluarga', 'like', "%{$search}%");
            })
            ->when($statusFilter && $statusFilter !== 'all', function ($query, $status) {
                // Terapkan filter status ekonomi jika ada dan bukan 'all'
                $query->where('status_ekonomi', $status);
            })
            ->paginate(10) // Paginasi data, 10 item per halaman
            ->withQueryString(); // Memastikan link paginasi tetap menyertakan query filter

        // Render komponen Inertia dengan data yang sudah dipaginasi dan filter yang aktif
        return Inertia::render('Public/KeluargaIndex', [
            'keluargas' => $keluargas,
            'filters' => [
                'search' => $searchQuery,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Menampilkan halaman detail untuk satu keluarga.
     *
     * @param Keluarga $keluarga
     * @return Response
     */
    public function show(Keluarga $keluarga): Response
    {

        $keluarga->load('anggotaKeluarga');

        return Inertia::render('Public/KeluargaShow', [
            'keluarga' => $keluarga,
        ]);
    }
}
