<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AnggotaKeluargaController;
use App\Http\Controllers\BantuanController; // Controller untuk PKH
use App\Http\Controllers\KeluargaController as AdminKeluargaController; // Alias for Admin CRUD Controller
use App\Http\Controllers\Public\KeluargaController as PublicKeluargaController; // Alias for Public-facing Controller

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
|
| Rute-rute ini dapat diakses oleh siapa saja tanpa perlu login.
| Sesuai dengan requirements PKH untuk akses publik data.
|
*/

// Landing page route
Route::get('/', [LandingPageController::class, 'index'])->name('landing');

// Public routes untuk Data Keluarga PKH
Route::get('/keluarga', [PublicKeluargaController::class, 'index'])->name('keluarga.index');
Route::get('/keluarga/{keluarga}', [PublicKeluargaController::class, 'show'])->name('keluarga.show');

// Public map access untuk melihat sebaran PKH
Route::get('/map', function() {
    return Inertia::render('Map/Index', [
        'public_access' => true,
        'title' => 'Peta Sebaran Program Keluarga Harapan',
        'readonly' => true
    ]);
})->name('map.public');

// Public API untuk data peta (read-only) - sesuai requirements
Route::get('/api/keluarga-public', [AdminKeluargaController::class, 'getForMap'])->name('api.keluarga.public');

// Public API untuk statistik umum PKH
Route::get('/api/statistik-public', [DashboardController::class, 'publicStats'])->name('api.statistik.public');

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Requires Login)
|--------------------------------------------------------------------------
|
| Rute-rute ini hanya dapat diakses oleh pengguna yang sudah login.
| Sesuai dengan requirements untuk manajemen PKH oleh Dinas Sosial.
|
*/

// Dashboard route untuk PKH
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Group untuk semua rute yang memerlukan otentikasi
Route::middleware('auth')->group(function () {

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Anggota Keluarga (CRUD) - Sesuai requirements tiap KK terdiri dari beberapa anggota
    Route::resource('anggota-keluarga', AnggotaKeluargaController::class);

    // Group untuk semua rute admin dengan prefix /admin dan nama admin.*
    // Struktur yang rapi untuk mengelola PKH oleh Dinas Sosial
    Route::prefix('admin')->name('admin.')->group(function () {

        // Manajemen Keluarga PKH (CRUD) - Sesuai requirements data point KK
        Route::resource('keluarga', AdminKeluargaController::class);

        // Update koordinat keluarga untuk pemetaan PKH - Sesuai requirements data spasial
        Route::post('keluarga/{keluarga}/coordinates', [AdminKeluargaController::class, 'updateCoordinates'])
            ->name('keluarga.update-coordinates');

        // Verifikasi keluarga untuk kelayakan PKH
        Route::post('keluarga/{keluarga}/verifikasi', [AdminKeluargaController::class, 'verifikasi'])
            ->name('keluarga.verifikasi');

        // Bulk operations untuk keluarga
        Route::post('keluarga/bulk-import', [AdminKeluargaController::class, 'bulkImport'])
            ->name('keluarga.bulk-import');
        Route::post('keluarga/bulk-export', [AdminKeluargaController::class, 'bulkExport'])
            ->name('keluarga.bulk-export');
        Route::post('keluarga/bulk-delete', [AdminKeluargaController::class, 'bulkDelete'])
            ->name('keluarga.bulk-delete');

        // Rute untuk Bantuan PKH - Sesuai requirements penetapan per tahun anggaran
        Route::prefix('bantuan')->name('bantuan.')->group(function () {
            // Daftar semua bantuan PKH
            Route::get('/', [BantuanController::class, 'index'])->name('index');
            
            // KK yang belum menerima bantuan (requirement utama PKH)
            Route::get('/belum-menerima', [BantuanController::class, 'belumMenerima'])->name('belum-menerima');
            
            // Peta sebaran bantuan PKH (requirement utama) - marker berbeda untuk sudah/belum terima
            Route::get('/peta', function () {
                return Inertia::render('Admin/Bantuan/Peta', [
                    'title' => 'Peta Sebaran Bantuan PKH',
                    'tahun_tersedia' => range(2020, now()->year + 1)
                ]);
            })->name('peta');
            
            // API untuk data peta bantuan - sesuai requirements sebaran spasial
            Route::get('/peta-data', [BantuanController::class, 'peta'])->name('peta.data');
            
            // CRUD operations untuk bantuan
            Route::post('/', [BantuanController::class, 'store'])->name('store'); // Penetapan bantuan PKH
            Route::get('/{bantuan}', [BantuanController::class, 'show'])->name('show'); // Detail bantuan
            Route::get('/{bantuan}/edit', [BantuanController::class, 'edit'])->name('edit'); // Form edit
            Route::patch('/{bantuan}', [BantuanController::class, 'update'])->name('update'); // Update bantuan
            Route::delete('/{bantuan}', [BantuanController::class, 'destroy'])->name('destroy'); // Hapus bantuan
            
            // Distribusi bantuan bulanan - sesuai requirements bantuan per bulan selama 1 tahun
            Route::post('/distribusi', [BantuanController::class, 'distribusi'])->name('distribusi');
            Route::get('/distribusi/{tahun}/{bulan}', [BantuanController::class, 'distribusiBulanan'])->name('distribusi.bulanan');
            Route::post('/distribusi/batch', [BantuanController::class, 'distribusiBatch'])->name('distribusi.batch');
            
            // Laporan bantuan PKH
            Route::get('/laporan', [BantuanController::class, 'laporan'])->name('laporan');
            Route::post('/laporan/export', [BantuanController::class, 'exportLaporan'])->name('laporan.export');
            Route::get('/laporan/tahunan/{tahun}', [BantuanController::class, 'laporanTahunan'])->name('laporan.tahunan');
            
            // Riwayat bantuan per KK
            Route::get('/riwayat/{keluarga}', [BantuanController::class, 'riwayatBantuan'])->name('riwayat');
            
            // Validasi dan approval bantuan
            Route::post('/{bantuan}/approve', [BantuanController::class, 'approve'])->name('approve');
            Route::post('/{bantuan}/reject', [BantuanController::class, 'reject'])->name('reject');
        });

        // Rute untuk Peta Admin PKH - dengan fitur edit koordinat
        Route::get('map', function () {
            return Inertia::render('Map/Index', [
                'admin_access' => true,
                'title' => 'Peta Admin - Program Keluarga Harapan',
                'editable' => true
            ]);
        })->name('map');

        // Manajemen Laporan PKH - sesuai requirements monitoring
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [ReportController::class, 'index'])->name('index');
            Route::post('/export', [ReportController::class, 'export'])->name('export');
            Route::get('/pkh', [ReportController::class, 'pkhReport'])->name('pkh');
            Route::post('/pkh/export', [ReportController::class, 'exportPkh'])->name('pkh.export');
            Route::get('/sebaran-wilayah', [ReportController::class, 'sebaranWilayah'])->name('sebaran-wilayah');
            Route::get('/trend-penerima', [ReportController::class, 'trendPenerima'])->name('trend-penerima');
            Route::get('/efektivitas', [ReportController::class, 'efektivitas'])->name('efektivitas');
        });

        // Manajemen Pengaturan PKH
        Route::get('settings', function () {
            return Inertia::render('Settings/Index', [
                'title' => 'Pengaturan Sistem PKH'
            ]);
        })->name('settings');

        // Pengaturan bantuan PKH per tahun - sesuai requirements penetapan per tahun anggaran
        Route::prefix('pengaturan-bantuan')->name('pengaturan-bantuan.')->group(function () {
            Route::get('/', [BantuanController::class, 'pengaturan'])->name('index');
            Route::post('/', [BantuanController::class, 'storePengaturan'])->name('store');
            Route::patch('/{pengaturan}', [BantuanController::class, 'updatePengaturan'])->name('update');
            Route::delete('/{pengaturan}', [BantuanController::class, 'destroyPengaturan'])->name('destroy');
        });

        // Manajemen User dan Role
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [AdminKeluargaController::class, 'users'])->name('index');
            Route::post('/', [AdminKeluargaController::class, 'storeUser'])->name('store');
            Route::patch('/{user}', [AdminKeluargaController::class, 'updateUser'])->name('update');
            Route::delete('/{user}', [AdminKeluargaController::class, 'destroyUser'])->name('destroy');
        });

        // Audit Log dan Activity Log
        Route::prefix('logs')->name('logs.')->group(function () {
            Route::get('/', [AdminKeluargaController::class, 'logs'])->name('index');
            Route::get('/activity', [AdminKeluargaController::class, 'activityLogs'])->name('activity');
            Route::get('/export', [AdminKeluargaController::class, 'exportLogs'])->name('export');
        });
    });

    // API Routes untuk PKH (data dinamis) - sesuai requirements WebGIS
    Route::prefix('api')->group(function () {
        // API untuk data keluarga di peta - sesuai requirements data spasial point
        Route::get('/keluarga', [AdminKeluargaController::class, 'getForMap'])->name('api.keluarga.map');
        Route::get('/keluarga/{tahun}', [AdminKeluargaController::class, 'getForMapByYear'])->name('api.keluarga.map.year');
        
        // API untuk data bantuan di peta - sesuai requirements marker berbeda
        Route::get('/bantuan/peta', [BantuanController::class, 'peta'])->name('api.bantuan.peta');
        Route::get('/bantuan/peta/{tahun}', [BantuanController::class, 'petaByYear'])->name('api.bantuan.peta.year');
        
        // API untuk statistik dashboard PKH
        Route::get('/dashboard', [DashboardController::class, 'apiData'])->name('api.dashboard');
        Route::get('/dashboard/realtime', [DashboardController::class, 'realtimeStats'])->name('api.dashboard.realtime');
        Route::get('/dashboard/chart-data', [DashboardController::class, 'chartData'])->name('api.dashboard.chart');
        
        // API untuk data peta umum
        Route::get('/map-data/{keluargaId}', [MapController::class, 'getMapData'])->name('api.map.data');
        Route::post('/map-data', [MapController::class, 'saveMapData'])->name('api.map.save');
        Route::delete('/map-data/{keluargaId}', [MapController::class, 'deleteMapData'])->name('api.map.delete');
        
        // API untuk statistik bantuan PKH - sesuai requirements monitoring
        Route::get('/bantuan/statistik/{tahun?}', [BantuanController::class, 'getStatistik'])->name('api.bantuan.statistik');
        Route::get('/bantuan/trend/{tahun?}', [BantuanController::class, 'getTrend'])->name('api.bantuan.trend');
        Route::get('/bantuan/sebaran/{tahun?}', [BantuanController::class, 'getSebaran'])->name('api.bantuan.sebaran');
        
        // API untuk export data PKH
        Route::post('/bantuan/export', [BantuanController::class, 'exportData'])->name('api.bantuan.export');
        Route::post('/keluarga/export', [AdminKeluargaController::class, 'exportData'])->name('api.keluarga.export');
        
        // API untuk validasi data PKH
        Route::post('/keluarga/validasi', [AdminKeluargaController::class, 'validasiData'])->name('api.keluarga.validasi');
        Route::post('/bantuan/validasi', [BantuanController::class, 'validasiData'])->name('api.bantuan.validasi');
        
        // API untuk geocoding dan reverse geocoding
        Route::post('/geocode', [MapController::class, 'geocode'])->name('api.geocode');
        Route::post('/reverse-geocode', [MapController::class, 'reverseGeocode'])->name('api.reverse-geocode');
        
        // API untuk wilayah administratif Kalimantan Barat
        Route::get('/wilayah/provinsi', [AdminKeluargaController::class, 'getProvinsi'])->name('api.wilayah.provinsi');
        Route::get('/wilayah/kota/{provinsi}', [AdminKeluargaController::class, 'getKota'])->name('api.wilayah.kota');
        Route::get('/wilayah/kecamatan/{kota}', [AdminKeluargaController::class, 'getKecamatan'])->name('api.wilayah.kecamatan');
        Route::get('/wilayah/kelurahan/{kecamatan}', [AdminKeluargaController::class, 'getKelurahan'])->name('api.wilayah.kelurahan');
    });

    // Rute khusus untuk monitoring PKH - sesuai requirements monitoring Dinas Sosial
    Route::prefix('monitoring')->name('monitoring.')->middleware('auth')->group(function () {
        // Monitoring distribusi bantuan real-time
        Route::get('/distribusi', [BantuanController::class, 'monitoringDistribusi'])->name('distribusi');
        Route::get('/distribusi/{tahun}', [BantuanController::class, 'monitoringDistribusiTahun'])->name('distribusi.tahun');
        
        // Monitoring penerima bantuan per wilayah - sesuai requirements sebaran geografis
        Route::get('/wilayah', [BantuanController::class, 'monitoringWilayah'])->name('wilayah');
        Route::get('/wilayah/{kota}', [BantuanController::class, 'monitoringWilayahDetail'])->name('wilayah.detail');
        
        // Monitoring trend penerima bantuan - sesuai requirements analisis multi-tahun
        Route::get('/trend', [BantuanController::class, 'monitoringTrend'])->name('trend');
        Route::get('/trend/perbandingan', [BantuanController::class, 'monitoringPerbandingan'])->name('trend.perbandingan');
        
        // Monitoring efektivitas program PKH
        Route::get('/efektivitas', [BantuanController::class, 'monitoringEfektivitas'])->name('efektivitas');
        Route::get('/coverage', [BantuanController::class, 'monitoringCoverage'])->name('coverage');
        
        // Monitoring data quality dan completeness
        Route::get('/data-quality', [AdminKeluargaController::class, 'monitoringDataQuality'])->name('data-quality');
        Route::get('/koordinat-missing', [AdminKeluargaController::class, 'koordinatMissing'])->name('koordinat-missing');
    });

    // Rute untuk integrasi dan sinkronisasi data
    Route::prefix('integration')->name('integration.')->middleware('auth')->group(function () {
        // Import data dari sistem lain
        Route::post('/import/keluarga', [AdminKeluargaController::class, 'importKeluarga'])->name('import.keluarga');
        Route::post('/import/bantuan', [BantuanController::class, 'importBantuan'])->name('import.bantuan');
        
        // Sinkronisasi dengan sistem pusat
        Route::post('/sync/keluarga', [AdminKeluargaController::class, 'syncKeluarga'])->name('sync.keluarga');
        Route::post('/sync/bantuan', [BantuanController::class, 'syncBantuan'])->name('sync.bantuan');
        
        // Backup dan restore data
        Route::post('/backup', [AdminKeluargaController::class, 'backup'])->name('backup');
        Route::post('/restore', [AdminKeluargaController::class, 'restore'])->name('restore');
    });

    // Rute untuk notifikasi dan alert system
    Route::prefix('notifications')->name('notifications.')->middleware('auth')->group(function () {
        Route::get('/', [AdminKeluargaController::class, 'notifications'])->name('index');
        Route::post('/mark-read/{notification}', [AdminKeluargaController::class, 'markAsRead'])->name('mark-read');
        Route::post('/mark-all-read', [AdminKeluargaController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::delete('/{notification}', [AdminKeluargaController::class, 'deleteNotification'])->name('delete');
    });
});

/*
|--------------------------------------------------------------------------
| WebHook Routes untuk Integrasi External
|--------------------------------------------------------------------------
|
| Routes untuk menerima data dari sistem external atau API pihak ketiga
|
*/

Route::prefix('webhook')->name('webhook.')->group(function () {
    // Webhook untuk update data dari sistem pusat
    Route::post('/keluarga-update', [AdminKeluargaController::class, 'webhookKeluargaUpdate'])->name('keluarga.update');
    Route::post('/bantuan-update', [BantuanController::class, 'webhookBantuanUpdate'])->name('bantuan.update');
    
    // Webhook untuk notifikasi sistem
    Route::post('/notification', [AdminKeluargaController::class, 'webhookNotification'])->name('notification');
});

/*
|--------------------------------------------------------------------------
| Fallback Routes
|--------------------------------------------------------------------------
|
| Routes untuk handling 404 dan error pages
|
*/

// 404 fallback dengan context PKH
Route::fallback(function () {
    return Inertia::render('Errors/404', [
        'title' => 'Halaman Tidak Ditemukan',
        'message' => 'Halaman yang Anda cari tidak tersedia dalam sistem PKH.',
        'back_url' => route('dashboard')
    ]);
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

require __DIR__ . '/auth.php';
