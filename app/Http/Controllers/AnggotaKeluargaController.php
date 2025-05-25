<?php

namespace App\Http\Controllers;

use App\Models\AnggotaKeluarga;
use App\Models\Keluarga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class AnggotaKeluargaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $anggotaKeluarga = AnggotaKeluarga::with('keluarga')
            ->paginate(10)
            ->through(fn ($item) => [
                'id' => $item->id,
                'nik' => $item->nik,
                'nama' => $item->nama,
                'jenis_kelamin' => $item->jenis_kelamin,
                'tempat_lahir' => $item->tempat_lahir,
                'tanggal_lahir' => $item->tanggal_lahir,
                'status_dalam_keluarga' => $item->status_dalam_keluarga,
                'status_perkawinan' => $item->status_perkawinan,
                'pendidikan_terakhir' => $item->pendidikan_terakhir,
                'pekerjaan' => $item->pekerjaan,
                'keluarga_id' => $item->keluarga_id,
                'keluarga' => [
                    'id' => $item->keluarga->id,
                    'no_kk' => $item->keluarga->no_kk,
                    'nama_kepala_keluarga' => $item->keluarga->nama_kepala_keluarga
                ]
            ]);

        return Inertia::render('AnggotaKeluarga/Index', [
            'anggotaKeluarga' => $anggotaKeluarga
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $keluarga = Keluarga::select('id', 'no_kk', 'nama_kepala_keluarga')->get();
        $selectedKeluargaId = $request->get('keluarga_id');

        return Inertia::render('AnggotaKeluarga/Create', [
            'keluarga' => $keluarga,
            'selectedKeluargaId' => $selectedKeluargaId
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'keluarga_id' => 'required|exists:keluarga,id',
            'nik' => 'required|string|max:16|unique:anggota_keluarga,nik',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'tempat_lahir' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'status_dalam_keluarga' => 'required|in:kepala keluarga,istri,anak,lainnya',
            'status_perkawinan' => 'required|in:belum kawin,kawin,cerai hidup,cerai mati',
            'pendidikan_terakhir' => 'required|string|max:255',
            'pekerjaan' => 'required|string|max:255'
        ]);

        AnggotaKeluarga::create($request->all());

        return redirect()->route('anggota-keluarga.index', [
            'keluarga_id' => $request->keluarga_id
        ])->with('message', 'Anggota keluarga berhasil ditambahkan!');
    }

    /**
     * Display the specified resource.
     */
    public function show(AnggotaKeluarga $anggotaKeluarga)
    {
        // Load relasi keluarga
        $anggotaKeluarga->load('keluarga');

        return Inertia::render('AnggotaKeluarga/Show', [
            'anggotaKeluarga' => $anggotaKeluarga
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AnggotaKeluarga $anggotaKeluarga)
    {
        // Load relasi keluarga untuk anggota yang akan diedit
        $anggotaKeluarga->load('keluarga');
        
        // Ambil semua data keluarga untuk dropdown
        $keluarga = Keluarga::select('id', 'no_kk', 'nama_kepala_keluarga')->get();

        return Inertia::render('AnggotaKeluarga/Edit', [
            'anggotaKeluarga' => $anggotaKeluarga, // Perbaikan: ubah dari 'anggota' ke 'anggotaKeluarga'
            'keluarga' => $keluarga
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AnggotaKeluarga $anggotaKeluarga)
    {
        $request->validate([
            'keluarga_id' => 'required|exists:keluarga,id',
            'nik' => 'required|string|max:16|unique:anggota_keluarga,nik,' . $anggotaKeluarga->id,
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'tempat_lahir' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'status_dalam_keluarga' => 'required|in:kepala keluarga,istri,anak,lainnya',
            'status_perkawinan' => 'required|in:belum kawin,kawin,cerai hidup,cerai mati',
            'pendidikan_terakhir' => 'required|string|max:255',
            'pekerjaan' => 'required|string|max:255'
        ]);

        $anggotaKeluarga->update($request->all());

        return redirect()->route('anggota-keluarga.index')
            ->with('message', 'Anggota keluarga berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AnggotaKeluarga $anggotaKeluarga)
    {
        $anggotaKeluarga->delete();

        return redirect()->route('anggota-keluarga.index')
            ->with('message', 'Anggota keluarga berhasil dihapus!');
    }
}
