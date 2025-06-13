# WebGIS Sistem Informasi Geografis - Program Keluarga Harapan (PKH)
## Dinas Sosial Kalimantan Barat

### Anggota Kelompok 4
1. H1101231011 - Muhammad Ilham Nugraha
2. H1101231031 - Abiyasha Syahrizal Romdhon
3. H1101231037 - Suryanto
4. H1101231051 - M. Imam Firdaus
5. H1101231057 - Maida Al Ghazali

## Deskripsi Aplikasi

WebGIS untuk mengelola data spasial bertipe point yang merepresentasikan posisi rumah/tempat tinggal Keluarga Penerima Manfaat (KPM) Program Keluarga Harapan di Kalimantan Barat. Aplikasi ini memungkinkan Dinas Sosial untuk:

- Mengelola data Kartu Keluarga (KK) dan anggota keluarga
- Memetakan sebaran KK secara spasial
- Membedakan KK yang sudah dan belum menerima bantuan
- Mengelola data bantuan per tahun anggaran
- Melakukan analisis distribusi bantuan sosial

## Teknologi yang Digunakan

- **Backend**: Laravel 12
- **Frontend**: React 18 dengan TypeScript
- **Database**: MySQL/PostgreSQL
- **Maps**: Leaflet.js
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: npm/yarn

## Persyaratan Sistem

- PHP >= 8.2
- Node.js >= 18.x
- Composer
- MySQL/PostgreSQL
- Web Server (Apache/Nginx)

## Instalasi dan Konfigurasi

### 1. Clone Repository
```
git clone [repository-url]
cd webgis-pkh-kalbar
```

### 2. Install Dependencies Backend
```
composer install
```

### 3. Install Dependencies Frontend
```
npm install
# atau
yarn install
```

### 4. Konfigurasi Environment
```
cp .env.example .env
php artisan key:generate
```

### 5. Konfigurasi Database
Edit file `.env` dan sesuaikan konfigurasi database:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=webgis_app
DB_USERNAME=root
DB_PASSWORD=
```

### 6. Migrasi Database dan Seeder
```
php artisan migrate
php artisan db:seed
```

### 7. Build Assets
```
npm run build
# atau untuk development
npm run dev
```

### 8. Jalankan Server
```
php artisan serve
```

Aplikasi akan berjalan di: `http://localhost:8000`

## Akun Login Default

### Admin
- **Username**: admin@dinsos.kalbarprov.go.id
- **Password**: password123

### Petugas
- **Username**: admin@pontianak.go.id
- **Password**: pontianak123

## Struktur Database

### Tabel Utama:
- `keluarga` - Data Kartu Keluarga
- `anggota_keluarga` - Data anggota dalam KK
- `bantuan` - Data bantuan yang diberikan
- `distribusi_bantuan` - Detail distribusi bantuan bulanan
- `users` - Data pengguna sistem

### Relasi:
- 1 Keluarga memiliki banyak Anggota Keluarga
- 1 Keluarga dapat memiliki banyak Bantuan (per tahun)
- 1 Bantuan memiliki banyak Distribusi Bantuan (per bulan)

## Fitur Aplikasi

### 1. Manajemen Data Keluarga
- CRUD data Kartu Keluarga
- CRUD data anggota keluarga
- Validasi NIK dan Nomor KK

### 2. Pemetaan Spasial
- Tampilan peta interaktif menggunakan Leaflet
- Marker berbeda untuk KK penerima dan non-penerima bantuan
- Info popup dengan detail keluarga
- Filter berdasarkan tahun dan status bantuan

### 3. Manajemen Bantuan
- Penetapan KK penerima bantuan per tahun
- Pencairan bantuan bulanan
- Laporan distribusi bantuan
- Monitoring status bantuan

### 4. Laporan dan Analisis
- Laporan sebaran KK per wilayah
- Statistik penerima bantuan
- Export data ke Excel/PDF
- Dashboard analitik

## Asumsi Pengembangan

1. **Data Koordinat**: Koordinat rumah diambil berdasarkan alamat yang diinputkan atau marking manual di peta
2. **Tahun Anggaran**: Bantuan diberikan per tahun anggaran (Januari-Desember)
3. **Status KK**: KK dapat berpindah status dari penerima ke non-penerima berdasarkan evaluasi tahunan
4. **Wilayah Cakupan**: Hanya mencakup wilayah Kalimantan Barat
5. **Verifikasi Data**: Setiap data KK harus diverifikasi oleh petugas lapangan

## Contoh Data Testing

Aplikasi sudah dilengkapi dengan data sample:
- 40 Keluarga tersebar di 9 Kabupaten/Kota di Kalimantan Barat
- 200+ Anggota Keluarga dengan variasi umur dan status
- Data bantuan untuk tahun 2024 dan 2025
- Distribusi bantuan bulanan yang bervariasi

## File Export Database

File `database_export.sql` berisi:
- Struktur tabel lengkap
- Data sample untuk testing
- Stored procedures dan triggers
- Indexes untuk optimasi query

## Pengembangan

### Menjalankan Development Server
```
# Terminal 1 - Laravel Server
php artisan serve

# Terminal 2 - Vite Dev Server
npm run dev
```

### Build untuk Production
```
npm run build
php artisan optimize
```

## Troubleshooting

### Error CSRF Token
Pastikan meta tag CSRF ada di layout:
```

```

### Error Permission
```
sudo chmod -R 775 storage bootstrap/cache
```

### Error Node Modules
```
rm -rf node_modules package-lock.json
npm install
```

## Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/nama-fitur`)
3. Commit perubahan (`git commit -am 'Tambah fitur baru'`)
4. Push ke branch (`git push origin feature/nama-fitur`)
5. Buat Pull Request

## Lisensi

Aplikasi ini dikembangkan untuk keperluan tugas besar mata kuliah Sistem Informasi Geografis Dasar.

---

**Dosen Pengampu**: Dr. Ir. Yus Sholva, S.T, M.T.  
**Semester**: Genap 2024/2025  
**Universitas**: Universitas Tanjungpura
