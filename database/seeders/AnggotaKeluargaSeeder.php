<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AnggotaKeluarga;
use App\Models\Keluarga;
use Carbon\Carbon;

class AnggotaKeluargaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil semua data keluarga yang sudah ada
        $keluargaList = Keluarga::all();

        foreach ($keluargaList as $keluarga) {
            $this->createAnggotaKeluarga($keluarga);
        }

        $this->command->info('Seeder AnggotaKeluarga berhasil dijalankan dengan data untuk ' . $keluargaList->count() . ' keluarga.');
    }

    private function createAnggotaKeluarga(Keluarga $keluarga)
    {
        $anggotaData = [];

        // Data kepala keluarga
        $anggotaData[] = [
            'keluarga_id' => $keluarga->id,
            'nik' => $this->generateNIK($keluarga->no_kk, 1),
            'nama' => $keluarga->nama_kepala_keluarga,
            'jenis_kelamin' => $this->getGenderFromName($keluarga->nama_kepala_keluarga),
            'tempat_lahir' => $this->getTempatlahir($keluarga->kota),
            'tanggal_lahir' => $this->generateTanggalLahir(35, 55),
            'status_dalam_keluarga' => 'kepala_keluarga',
            'status_perkawinan' => 'kawin',
            'pendidikan_terakhir' => $this->getPendidikanKepala($keluarga->status_ekonomi),
            'pekerjaan' => $this->getPekerjaanFromKeterangan($keluarga->keterangan)
        ];

        // Generate anggota keluarga lainnya berdasarkan jumlah_anggota
        $jumlahAnggotaLain = $keluarga->jumlah_anggota - 1; // Minus kepala keluarga

        for ($i = 1; $i <= $jumlahAnggotaLain; $i++) {
            $hubungan = $this->getHubunganKeluarga($i, $jumlahAnggotaLain);
            $umur = $this->getUmurByHubungan($hubungan);

            $anggotaData[] = [
                'keluarga_id' => $keluarga->id,
                'nik' => $this->generateNIK($keluarga->no_kk, $i + 1),
                'nama' => $this->generateNama($hubungan, $keluarga->nama_kepala_keluarga),
                'jenis_kelamin' => $this->getJenisKelaminByHubungan($hubungan),
                'tempat_lahir' => $this->getTempatlahir($keluarga->kota),
                'tanggal_lahir' => $this->generateTanggalLahir($umur['min'], $umur['max']),
                'status_dalam_keluarga' => $hubungan,
                'status_perkawinan' => $this->getStatusPerkawinanByUmur($umur['min']),
                'pendidikan_terakhir' => $this->getPendidikanByUmur($umur['min'], $umur['max']),
                'pekerjaan' => $this->getPekerjaanByUmur($umur['min'], $hubungan)
            ];
        }

        // Insert data anggota keluarga
        foreach ($anggotaData as $data) {
            AnggotaKeluarga::create($data);
        }
    }

    private function generateNIK($noKK, $urutan)
    {
        // Ambil 12 digit pertama dari no KK dan tambah urutan
        $baseNIK = substr($noKK, 0, 12);
        return $baseNIK . str_pad($urutan, 4, '0', STR_PAD_LEFT);
    }

    private function getGenderFromName($nama)
    {
        $namaPria = ['Budi', 'Ahmad', 'Agus', 'Rahmat', 'Haji', 'Muhammad', 'Pak', 'Bapak', 'Tan', 'Liem', 'Wong', 'Chen'];
        $namaWanita = ['Siti', 'Maria', 'Dewi', 'Fatimah', 'Ibu', 'Aminah'];

        foreach ($namaPria as $pria) {
            if (strpos($nama, $pria) !== false) {
                return 'laki-laki';
            }
        }

        foreach ($namaWanita as $wanita) {
            if (strpos($nama, $wanita) !== false) {
                return 'perempuan';
            }
        }

        return 'laki-laki'; // Default
    }

    private function getTempatlahir($kota)
    {
        $tempatLahir = [
            'Pontianak' => ['Pontianak', 'Mempawah', 'Kubu Raya'],
            'Singkawang' => ['Singkawang', 'Sambas', 'Bengkayang'],
            'Sambas' => ['Sambas', 'Pemangkat', 'Tebas'],
            'Mempawah' => ['Mempawah', 'Pontianak', 'Kubu Raya'],
            'Ketapang' => ['Ketapang', 'Sukadana', 'Marau'],
            'Sanggau' => ['Sanggau', 'Sekadau', 'Melawi'],
            'Sintang' => ['Sintang', 'Melawi', 'Kapuas Hulu'],
            'Kapuas Hulu' => ['Putussibau', 'Sintang', 'Sekadau'],
            'Bengkayang' => ['Bengkayang', 'Singkawang', 'Sambas']
        ];

        $options = $tempatLahir[$kota] ?? [$kota];
        return $options[array_rand($options)];
    }

    private function generateTanggalLahir($minUmur, $maxUmur)
    {
        $umur = rand($minUmur, $maxUmur);
        return Carbon::now()->subYears($umur)->subDays(rand(0, 365));
    }

    private function getHubunganKeluarga($urutan, $totalAnggota)
    {
        if ($urutan == 1 && $totalAnggota >= 2) {
            return 'istri';
        } elseif ($urutan <= 4) {
            return 'anak';
        } elseif ($urutan == 5) {
            return rand(0, 1) ? 'orang_tua' : 'mertua';
        } else {
            $hubungan = ['saudara', 'keponakan', 'cucu'];
            return $hubungan[array_rand($hubungan)];
        }
    }

    private function getUmurByHubungan($hubungan)
    {
        switch ($hubungan) {
            case 'istri':
                return ['min' => 25, 'max' => 50];
            case 'anak':
                return ['min' => 0, 'max' => 25];
            case 'orang_tua':
            case 'mertua':
                return ['min' => 55, 'max' => 80];
            case 'saudara':
                return ['min' => 20, 'max' => 45];
            case 'keponakan':
                return ['min' => 5, 'max' => 20];
            case 'cucu':
                return ['min' => 0, 'max' => 15];
            default:
                return ['min' => 15, 'max' => 40];
        }
    }

    private function getJenisKelaminByHubungan($hubungan)
    {
        switch ($hubungan) {
            case 'istri':
                return 'perempuan';
            case 'anak':
                return rand(0, 1) ? 'laki-laki' : 'perempuan';
            default:
                return rand(0, 1) ? 'laki-laki' : 'perempuan';
        }
    }

    private function generateNama($hubungan, $namaKepala)
    {
        $namaDepan = [
            'laki-laki' => ['Ahmad', 'surya', 'ilham', 'Budi', 'Andi', 'Dedi', 'Eko', 'Fajar', 'Gilang', 'Hadi', 'Indra', 'Joko', 'Kurnia', 'Lukman', 'Maman', 'Nanda', 'Oki', 'Pandu', 'Qori', 'Rizki', 'Sandi', 'Toni', 'Udin', 'Vino', 'Wawan', 'Yanto', 'Zaki'],
            'perempuan' => ['Ani', 'Budi', 'Citra', 'Dewi', 'Eka', 'Fitri', 'Gita', 'Hani', 'Indah', 'Jihan', 'Kartika', 'Lina', 'Maya', 'Nina', 'Ovi', 'Putri', 'Qira', 'Rina', 'Sari', 'Tina', 'Umi', 'Vera', 'Wati', 'Yuni', 'Zahra']
        ];

        $namaBelakang = ['Pratama', 'Sari', 'Wijaya', 'Utama', 'Permata', 'Cahaya', 'Indah', 'Jaya', 'Lestari', 'Mulia', 'Nusantara', 'Perdana', 'Rahayu', 'Santoso', 'Tama', 'Utomo', 'Wibowo', 'Yudha', 'Zahra', 'sijabat', 'siregar', 'simanjuntak', 'sinaga', 'sitorus', 'palupi', 'sihombing'];

        if ($hubungan == 'istri') {
            // Ambil nama belakang dari kepala keluarga
            $namaKepalaParts = explode(' ', $namaKepala);
            $namaBelakangKepala = end($namaKepalaParts);

            $namaDepanIstri = $namaDepan['perempuan'][array_rand($namaDepan['perempuan'])];
            return $namaDepanIstri . ' ' . $namaBelakangKepala;
        }

        $jenisKelamin = $this->getJenisKelaminByHubungan($hubungan);
        $namaDepanTerpilih = $namaDepan[$jenisKelamin][array_rand($namaDepan[$jenisKelamin])];
        $namaBelakangTerpilih = $namaBelakang[array_rand($namaBelakang)];

        return $namaDepanTerpilih . ' ' . $namaBelakangTerpilih;
    }

    private function getStatusPerkawinanByUmur($minUmur)
    {
        if ($minUmur < 17) {
            return 'belum_kawin';
        } elseif ($minUmur < 25) {
            return rand(0, 1) ? 'belum_kawin' : 'kawin';
        } elseif ($minUmur < 50) {
            $status = ['kawin', 'kawin', 'kawin', 'belum_kawin', 'cerai'];
            return $status[array_rand($status)];
        } else {
            $status = ['kawin', 'kawin', 'janda', 'duda'];
            return $status[array_rand($status)];
        }
    }

    private function getPendidikanByUmur($minUmur, $maxUmur)
    {
        if ($maxUmur < 6) {
            return 'belum_sekolah';
        } elseif ($maxUmur < 12) {
            return rand(0, 1) ? 'belum_sekolah' : 'sd';
        } elseif ($maxUmur < 15) {
            return 'sd';
        } elseif ($maxUmur < 18) {
            return rand(0, 1) ? 'smp' : 'sma';
        } elseif ($maxUmur < 25) {
            $pendidikan = ['sma', 'sma', 'diploma', 's1'];
            return $pendidikan[array_rand($pendidikan)];
        } else {
            $pendidikan = ['sd', 'smp', 'sma', 'sma', 'diploma', 's1'];
            return $pendidikan[array_rand($pendidikan)];
        }
    }

    private function getPekerjaanByUmur($minUmur, $hubungan)
    {
        if ($minUmur < 15) {
            return 'pelajar';
        } elseif ($minUmur < 18) {
            return rand(0, 1) ? 'pelajar' : 'tidak_bekerja';
        } elseif ($hubungan == 'istri') {
            $pekerjaanIstri = ['ibu_rumah_tangga', 'pedagang', 'buruh', 'petani', 'penjahit', 'guru', 'tidak_bekerja'];
            return $pekerjaanIstri[array_rand($pekerjaanIstri)];
        } else {
            $pekerjaan = ['petani', 'buruh', 'pedagang', 'nelayan', 'tukang', 'sopir', 'guru', 'pegawai', 'wiraswasta', 'tidak_bekerja'];
            return $pekerjaan[array_rand($pekerjaan)];
        }
    }

    private function getPendidikanKepala($statusEkonomi)
    {
        switch ($statusEkonomi) {
            case 'sangat_miskin':
                $pendidikan = ['sd', 'smp', 'tidak_sekolah'];
                return $pendidikan[array_rand($pendidikan)];
            case 'miskin':
                $pendidikan = ['sd', 'smp', 'sma'];
                return $pendidikan[array_rand($pendidikan)];
            case 'rentan_miskin':
                $pendidikan = ['smp', 'sma', 'diploma'];
                return $pendidikan[array_rand($pendidikan)];
            case 'kurang_mampu':
                $pendidikan = ['sma', 'diploma', 's1'];
                return $pendidikan[array_rand($pendidikan)];
            default:
                return 'sma';
        }
    }

    private function getPekerjaanFromKeterangan($keterangan)
    {
        $keteranganLower = strtolower($keterangan);

        if (strpos($keteranganLower, 'buruh') !== false) return 'buruh';
        if (strpos($keteranganLower, 'ojek') !== false) return 'sopir';
        if (strpos($keteranganLower, 'pedagang') !== false) return 'pedagang';
        if (strpos($keteranganLower, 'sopir') !== false) return 'sopir';
        if (strpos($keteranganLower, 'pemulung') !== false) return 'buruh';
        if (strpos($keteranganLower, 'penjual') !== false) return 'pedagang';
        if (strpos($keteranganLower, 'tukang') !== false) return 'tukang';
        if (strpos($keteranganLower, 'nelayan') !== false) return 'nelayan';
        if (strpos($keteranganLower, 'petani') !== false) return 'petani';
        if (strpos($keteranganLower, 'guru') !== false) return 'guru';
        if (strpos($keteranganLower, 'pegawai') !== false) return 'pegawai';
        if (strpos($keteranganLower, 'pabrik') !== false) return 'buruh';
        if (strpos($keteranganLower, 'warung') !== false) return 'wiraswasta';
        if (strpos($keteranganLower, 'security') !== false) return 'pegawai';
        if (strpos($keteranganLower, 'penjahit') !== false) return 'penjahit';
        if (strpos($keteranganLower, 'karet') !== false) return 'petani';
        if (strpos($keteranganLower, 'penenun') !== false) return 'pengrajin';
        if (strpos($keteranganLower, 'kayu') !== false) return 'tukang';
        if (strpos($keteranganLower, 'elektronik') !== false) return 'tukang';
        if (strpos($keteranganLower, 'honorer') !== false) return 'guru';
        if (strpos($keteranganLower, 'desa') !== false) return 'pegawai';

        return 'wiraswasta'; // Default
    }
}
