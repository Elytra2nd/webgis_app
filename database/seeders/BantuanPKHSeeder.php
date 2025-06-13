<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Bantuan;
use App\Models\DistribusiBantuan;
use App\Models\Keluarga;

class BantuanPKHSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil keluarga yang layak bantuan (sangat miskin dan miskin)
        $keluargaLayak = Keluarga::whereIn('status_ekonomi', ['sangat_miskin', 'miskin'])
            ->where('status_verifikasi', 'terverifikasi')
            ->limit(20)
            ->get();

        foreach ($keluargaLayak as $keluarga) {
            // Buat bantuan untuk tahun 2024 (sudah selesai)
            $bantuan2024 = Bantuan::create([
                'keluarga_id' => $keluarga->id,
                'tahun_anggaran' => 2024,
                'status' => 'selesai',
                'nominal_per_bulan' => 300000,
                'keterangan' => 'Bantuan PKH tahun 2024',
                'tanggal_penetapan' => '2024-01-15'
            ]);

            // Buat distribusi untuk semua bulan 2024
            for ($bulan = 1; $bulan <= 12; $bulan++) {
                DistribusiBantuan::create([
                    'bantuan_id' => $bantuan2024->id,
                    'bulan' => $bulan,
                    'status' => 'disalurkan',
                    'tanggal_distribusi' => "2024-{$bulan}-15",
                    'catatan' => "Distribusi bulan {$bulan} tahun 2024"
                ]);
            }

            // Buat bantuan untuk tahun 2025 (aktif) - hanya untuk sebagian keluarga
            if ($keluarga->id <= 14) {
                $bantuan2025 = Bantuan::create([
                    'keluarga_id' => $keluarga->id,
                    'tahun_anggaran' => 2025,
                    'status' => 'aktif',
                    'nominal_per_bulan' => 350000, // Naik dari tahun sebelumnya
                    'keterangan' => 'Bantuan PKH tahun 2025',
                    'tanggal_penetapan' => '2025-01-10'
                ]);

                for ($bulan = 1; $bulan <= 6; $bulan++) { 
                    DistribusiBantuan::create([
                        'bantuan_id' => $bantuan2025->id,
                        'bulan' => $bulan,
                        'status' => 'disalurkan',
                        'tanggal_distribusi' => "2025-{$bulan}-15",
                        'catatan' => "Distribusi bulan {$bulan} tahun 2025"
                    ]);
                }

                for ($bulan = 7; $bulan <= 12; $bulan++) {
                    DistribusiBantuan::create([
                        'bantuan_id' => $bantuan2025->id,
                        'bulan' => $bulan,
                        'status' => 'belum_disalurkan'
                    ]);
                }
            }
        }
    }
}
