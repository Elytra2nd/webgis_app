<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Keluarga;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use function Spatie\LaravelPdf\Support\pdf;

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

    /**
     * Export data keluarga ke PDF atau CSV
     */
    public function export(Request $request)
    {
        try {
            $format = $request->input('format', 'pdf');
            $filters = $request->input('filters', []);
            if (is_string($filters)) {
                $filters = json_decode($filters, true) ?? [];
            }

            // PERBAIKAN: Gunakan kolom yang sesuai dengan model
            $query = Keluarga::query()
                ->select([
                    'id', 
                    'no_kk', 
                    'nama_kepala_keluarga', 
                    'alamat', 
                    'kota', 
                    'status_ekonomi', 
                    'provinsi', 
                    'kecamatan', 
                    'kelurahan', 
                    'rt', 
                    'rw', 
                    'penghasilan_bulanan', // PERBAIKAN: Gunakan penghasilan_bulanan bukan pendapatan
                    'jumlah_anggota', 
                    'lokasi',
                    'latitude',
                    'longitude'
                ]);

            if (!empty($filters['search'])) {
                $query->where(function($q) use ($filters) {
                    $q->where('nama_kepala_keluarga', 'like', "%{$filters['search']}%")
                      ->orWhere('alamat', 'like', "%{$filters['search']}%");
                });
            }

            if (!empty($filters['kota'])) {
                $query->where('kota', $filters['kota']);
            }

            $data = $query->orderBy('nama_kepala_keluarga')->get();

            if ($format === 'pdf') {
                $pdfData = [
                    'title' => 'Laporan Data Keluarga PKH',
                    'generated_at' => now()->format('d/m/Y H:i:s'),
                    'filters' => $filters,
                    'data' => $data,
                    'statistics' => [
                        'total' => $data->count(),
                        'sangat_miskin' => $data->where('status_ekonomi', 'sangat_miskin')->count(),
                        'miskin' => $data->where('status_ekonomi', 'miskin')->count(),
                        'rentan_miskin' => $data->where('status_ekonomi', 'rentan_miskin')->count(),
                        'with_coordinates' => $data->whereNotNull('lokasi')->where('lokasi', '!=', '')->count(),
                        'without_coordinates' => $data->where(function($item) {
                            return is_null($item->lokasi) || $item->lokasi === '';
                        })->count(),
                    ],
                ];
                
                $filename = 'laporan-keluarga-pkh-' . now()->format('Y-m-d') . '.pdf';
                if (ob_get_level()) ob_end_clean();
                
                return pdf()
                    ->view('reports.pdf.KeluargaIndex', $pdfData)
                    ->format('a4')
                    ->orientation('landscape')
                    ->name($filename)
                    ->download();
            } else {
                // CSV Export
                $filename = 'laporan-keluarga-pkh-' . now()->format('Y-m-d') . '.csv';
                $headers = [
                    'Content-Type' => 'text/csv',
                    'Content-Disposition' => "attachment; filename=\"$filename\"",
                ];
                
                $callback = function() use ($data) {
                    $handle = fopen('php://output', 'w');
                    
                    // Header CSV - PERBAIKAN: Sesuaikan dengan kolom yang ada
                    fputcsv($handle, [
                        'No', 
                        'No. KK', 
                        'Nama Keluarga', 
                        'Alamat', 
                        'Provinsi', 
                        'Kota', 
                        'Kecamatan', 
                        'Kelurahan', 
                        'RT', 
                        'RW', 
                        'Status Ekonomi', 
                        'Penghasilan Bulanan', // PERBAIKAN: Ubah dari Pendapatan ke Penghasilan Bulanan
                        'Jumlah Anggota', 
                        'Koordinat'
                    ]);
                    
                    foreach ($data as $i => $item) {
                        // PERBAIKAN: Format koordinat dari latitude/longitude atau lokasi
                        $koordinat = '';
                        if ($item->latitude && $item->longitude) {
                            $koordinat = $item->latitude . ',' . $item->longitude;
                        } elseif ($item->lokasi) {
                            $koordinat = $item->lokasi;
                        }
                        
                        fputcsv($handle, [
                            $i + 1,
                            $item->no_kk,
                            $item->nama_kepala_keluarga,
                            $item->alamat,
                            $item->provinsi,
                            $item->kota,
                            $item->kecamatan,
                            $item->kelurahan,
                            $item->rt,
                            $item->rw,
                            $item->status_ekonomi,
                            $item->penghasilan_bulanan, // PERBAIKAN: Gunakan penghasilan_bulanan
                            $item->jumlah_anggota,
                            $koordinat,
                        ]);
                    }
                    fclose($handle);
                };
                
                return Response::stream($callback, 200, $headers);
            }
        } catch (\Exception $e) {
            Log::error('Export Keluarga Error: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal export data keluarga: '.$e->getMessage()
            ], 500);
        }
    }
}
