<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Keluarga;
use MatanYadaev\EloquentSpatial\Objects\Point;

class KeluargaKalbarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $keluargaData = [
            // Data Keluarga Pontianak
            [
                'no_kk' => '6171010101240001',
                'nama_kepala_keluarga' => 'Budi Santoso',
                'alamat' => 'Jl. Gajah Mada No. 123',
                'rt' => '01',
                'rw' => '02',
                'kelurahan' => 'Sungai Bangkong',
                'kecamatan' => 'Pontianak Kota',
                'kota' => 'Pontianak',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '78113',
                'status_ekonomi' => 'sangat_miskin',
                'penghasilan_bulanan' => 800000,
                'jumlah_anggota' => 4,
                'latitude' => -0.025851,
                'longitude' => 109.342003,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ],
            [
                'no_kk' => '6171010101240002',
                'nama_kepala_keluarga' => 'Siti Aminah',
                'alamat' => 'Jl. Ahmad Yani No. 45',
                'rt' => '03',
                'rw' => '01',
                'kelurahan' => 'Benua Melayu Darat',
                'kecamatan' => 'Pontianak Selatan',
                'kota' => 'Pontianak',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '78124',
                'status_ekonomi' => 'miskin',
                'penghasilan_bulanan' => 1200000,
                'jumlah_anggota' => 5,
                'latitude' => -0.030000,
                'longitude' => 109.330000,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ],
            [
                'no_kk' => '6171010101240003',
                'nama_kepala_keluarga' => 'Ahmad Hidayat',
                'alamat' => 'Jl. Sultan Abdurrahman No. 78',
                'rt' => '05',
                'rw' => '03',
                'kelurahan' => 'Akcaya',
                'kecamatan' => 'Pontianak Utara',
                'kota' => 'Pontianak',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '78232',
                'status_ekonomi' => 'rentan_miskin',
                'penghasilan_bulanan' => 1800000,
                'jumlah_anggota' => 3,
                'latitude' => -0.010000,
                'longitude' => 109.320000,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ],
            [
                'no_kk' => '6171010101240004',
                'nama_kepala_keluarga' => 'Maria Theresia',
                'alamat' => 'Jl. Diponegoro No. 156',
                'rt' => '02',
                'rw' => '04',
                'kelurahan' => 'Darat Sekip',
                'kecamatan' => 'Pontianak Kota',
                'kota' => 'Pontianak',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '78113',
                'status_ekonomi' => 'kurang_mampu',
                'penghasilan_bulanan' => 2200000,
                'jumlah_anggota' => 6,
                'latitude' => -0.035000,
                'longitude' => 109.345000,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ],

            // Data Keluarga Singkawang
            [
                'no_kk' => '6172010101240005',
                'nama_kepala_keluarga' => 'Tan Ah Kiong',
                'alamat' => 'Jl. Niaga No. 89',
                'rt' => '01',
                'rw' => '01',
                'kelurahan' => 'Pasiran',
                'kecamatan' => 'Singkawang Barat',
                'kota' => 'Singkawang',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '79123',
                'status_ekonomi' => 'sangat_miskin',
                'penghasilan_bulanan' => 900000,
                'jumlah_anggota' => 4,
                'latitude' => 0.907000,
                'longitude' => 108.988000,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ],
            [
                'no_kk' => '6172010101240006',
                'nama_kepala_keluarga' => 'Liem Seng Ho',
                'alamat' => 'Jl. Pahlawan No. 234',
                'rt' => '04',
                'rw' => '02',
                'kelurahan' => 'Kubu',
                'kecamatan' => 'Singkawang Tengah',
                'kota' => 'Singkawang',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '79117',
                'status_ekonomi' => 'miskin',
                'penghasilan_bulanan' => 1300000,
                'jumlah_anggota' => 3,
                'latitude' => 0.910000,
                'longitude' => 108.985000,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ],

            // Data Keluarga Sambas
            [
                'no_kk' => '6101010101240007',
                'nama_kepala_keluarga' => 'Haji Abdullah',
                'alamat' => 'Jl. Veteran No. 67',
                'rt' => '02',
                'rw' => '01',
                'kelurahan' => 'Durian',
                'kecamatan' => 'Sambas',
                'kota' => 'Sambas',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '79462',
                'status_ekonomi' => 'sangat_miskin',
                'penghasilan_bulanan' => 750000,
                'jumlah_anggota' => 7,
                'latitude' => 1.373000,
                'longitude' => 109.297000,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ],
            [
                'no_kk' => '6101010101240008',
                'nama_kepala_keluarga' => 'Siti Khadijah',
                'alamat' => 'Jl. Merdeka No. 145',
                'rt' => '03',
                'rw' => '02',
                'kelurahan' => 'Lumbang',
                'kecamatan' => 'Sambas',
                'kota' => 'Sambas',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '79462',
                'status_ekonomi' => 'rentan_miskin',
                'penghasilan_bulanan' => 1600000,
                'jumlah_anggota' => 5,
                'latitude' => 1.380000,
                'longitude' => 109.290000,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ],

            // Data Keluarga Mempawah
            [
                'no_kk' => '6108010101240009',
                'nama_kepala_keluarga' => 'Pak Joko Widodo',
                'alamat' => 'Jl. Pantai Indah No. 23',
                'rt' => '01',
                'rw' => '03',
                'kelurahan' => 'Sungai Pinyuh',
                'kecamatan' => 'Sungai Pinyuh',
                'kota' => 'Mempawah',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '78351',
                'status_ekonomi' => 'kurang_mampu',
                'penghasilan_bulanan' => 2000000,
                'jumlah_anggota' => 4,
                'latitude' => -0.350000,
                'longitude' => 109.180000,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ],
            [
                'no_kk' => '6108010101240010',
                'nama_kepala_keluarga' => 'Ibu Mega Sari',
                'alamat' => 'Jl. Nelayan No. 88',
                'rt' => '05',
                'rw' => '01',
                'kelurahan' => 'Mempawah Hilir',
                'kecamatan' => 'Mempawah Hilir',
                'kota' => 'Mempawah',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '78361',
                'status_ekonomi' => 'miskin',
                'penghasilan_bulanan' => 1100000,
                'jumlah_anggota' => 6,
                'latitude' => -0.370000,
                'longitude' => 109.190000,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ],

            // Data Keluarga Ketapang
            [
                'no_kk' => '6107010101240011',
                'nama_kepala_keluarga' => 'Bapak Surya Darma',
                'alamat' => 'Jl. Rahadi Usman No. 99',
                'rt' => '02',
                'rw' => '02',
                'kelurahan' => 'Mulia Kerta',
                'kecamatan' => 'Delta Pawan',
                'kota' => 'Ketapang',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '78813',
                'status_ekonomi' => 'sangat_miskin',
                'penghasilan_bulanan' => 650000,
                'jumlah_anggota' => 8,
                'latitude' => -1.847000,
                'longitude' => 109.975000,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ],
            [
                'no_kk' => '6107010101240012',
                'nama_kepala_keluarga' => 'Ibu Ratna Dewi',
                'alamat' => 'Jl. Suprapto No. 177',
                'rt' => '04',
                'rw' => '03',
                'kelurahan' => 'Sukaharja',
                'kecamatan' => 'Delta Pawan',
                'kota' => 'Ketapang',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '78813',
                'status_ekonomi' => 'rentan_miskin',
                'penghasilan_bulanan' => 1700000,
                'jumlah_anggota' => 3,
                'latitude' => -1.850000,
                'longitude' => 109.980000,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ],

            // Data Keluarga Sanggau
            [
                'no_kk' => '6105010101240013',
                'nama_kepala_keluarga' => 'Pak Agus Salim',
                'alamat' => 'Jl. Diponegoro No. 55',
                'rt' => '01',
                'rw' => '01',
                'kelurahan' => 'Jangkang',
                'kecamatan' => 'Kapuas',
                'kota' => 'Sanggau',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '78557',
                'status_ekonomi' => 'kurang_mampu',
                'penghasilan_bulanan' => 2100000,
                'jumlah_anggota' => 5,
                'latitude' => -0.168000,
                'longitude' => 110.600000,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ],

            // Data Keluarga Sintang
            [
                'no_kk' => '6104010101240014',
                'nama_kepala_keluarga' => 'Bapak Dayak Iban',
                'alamat' => 'Jl. Veteran No. 123',
                'rt' => '03',
                'rw' => '02',
                'kelurahan' => 'Kapuas Kanan Hilir',
                'kecamatan' => 'Sintang',
                'kota' => 'Sintang',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '78619',
                'status_ekonomi' => 'sangat_miskin',
                'penghasilan_bulanan' => 700000,
                'jumlah_anggota' => 6,
                'latitude' => 0.063000,
                'longitude' => 111.500000,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ],

            // Data Keluarga Putussibau
            [
                'no_kk' => '6103010101240015',
                'nama_kepala_keluarga' => 'Kepala Suku Dayak',
                'alamat' => 'Jl. Lintas Utara No. 44',
                'rt' => '02',
                'rw' => '01',
                'kelurahan' => 'Putussibau Utara',
                'kecamatan' => 'Putussibau Utara',
                'kota' => 'Kapuas Hulu',
                'provinsi' => 'Kalimantan Barat',
                'kode_pos' => '78711',
                'status_ekonomi' => 'miskin',
                'penghasilan_bulanan' => 950000,
                'jumlah_anggota' => 7,
                'latitude' => 0.853000,
                'longitude' => 112.937000,
                'status_verifikasi' => 'terverifikasi',
                'is_active' => true
            ]
        ];

        foreach ($keluargaData as $data) {
            // Set lokasi Point jika ada koordinat
            if (isset($data['latitude']) && isset($data['longitude'])) {
                $data['lokasi'] = new Point($data['latitude'], $data['longitude']);
                $data['koordinat_updated_at'] = now();
            }

            Keluarga::create($data);
        }
    }
}
