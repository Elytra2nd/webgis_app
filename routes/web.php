<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AnggotaKeluargaController;
use App\Http\Controllers\BantuanController; 
use App\Http\Controllers\KeluargaController as AdminKeluargaController; // Alias for Admin CRUD Controller
use App\Http\Controllers\Public\KeluargaController as PublicKeluargaController; // Alias for Public-facing Controller

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
|
| Rute-rute ini dapat diakses oleh siapa saja tanpa perlu login.
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
        'title' => 'Peta Sebaran Program Keluarga Harapan'
    ]);
})->name('map.public');

// Public API untuk data peta (read-only)
Route::get('/api/keluarga-public', [AdminKeluargaController::class, 'getForMap'])->name('api.keluarga.public');

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Requires Login)
|--------------------------------------------------------------------------
|
| Rute-rute ini hanya dapat diakses oleh pengguna yang sudah login.
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

    // Anggota Keluarga (CRUD) - Rute ini tetap di level atas karena bisa jadi relevan di luar konteks 'admin'
    Route::resource('anggota-keluarga', AnggotaKeluargaController::class);

    // Group untuk semua rute admin dengan prefix /admin dan nama admin.*
    // Struktur yang rapi untuk mengelola PKH
    Route::prefix('admin')->name('admin.')->group(function () {

        // Manajemen Keluarga PKH (CRUD)
        Route::resource('keluarga', AdminKeluargaController::class);

        // Update koordinat keluarga untuk pemetaan PKH
        Route::post('keluarga/{keluarga}/coordinates', [AdminKeluargaController::class, 'updateCoordinates'])
            ->name('keluarga.update-coordinates');

        // Verifikasi keluarga untuk kelayakan PKH
        Route::post('keluarga/{keluarga}/verifikasi', [AdminKeluargaController::class, 'verifikasi'])
            ->name('keluarga.verifikasi');

        // Rute untuk Bantuan PKH
        Route::prefix('bantuan')->name('bantuan.')->group(function () {
            // Daftar semua bantuan PKH
            Route::get('/', [BantuanController::class, 'index'])->name('index');
            
            // KK yang belum menerima bantuan (requirement utama PKH)
            Route::get('/belum-menerima', [BantuanController::class, 'belumMenerima'])->name('belum-menerima');
            
            // Peta sebaran bantuan PKH (requirement utama)
            Route::get('/peta', function () {
                return Inertia::render('Admin/Bantuan/Peta', [
                    'title' => 'Peta Sebaran Bantuan PKH',
                    'tahun_tersedia' => range(2020, now()->year + 1)
                ]);
            })->name('peta');
            
            // API untuk data peta bantuan
            Route::get('/peta-data', [BantuanController::class, 'peta'])->name('peta.data');
            
            // Penetapan bantuan PKH
            Route::post('/', [BantuanController::class, 'store'])->name('store');
            
            // Update status bantuan
            Route::patch('/{bantuan}', [BantuanController::class, 'update'])->name('update');
            
            // Hapus bantuan
            Route::delete('/{bantuan}', [BantuanController::class, 'destroy'])->name('destroy');
            
            // Distribusi bantuan bulanan
            Route::post('/distribusi', [BantuanController::class, 'distribusi'])->name('distribusi');
            
            // Laporan bantuan PKH
            Route::get('/laporan', [BantuanController::class, 'laporan'])->name('laporan');
            Route::post('/laporan/export', [BantuanController::class, 'exportLaporan'])->name('laporan.export');
        });

        // Rute untuk Peta Admin PKH
        Route::get('map', function () {
            return Inertia::render('Map/Index', [
                'admin_access' => true,
                'title' => 'Peta Admin - Program Keluarga Harapan'
            ]);
        })->name('map');

        // Manajemen Laporan PKH
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [ReportController::class, 'index'])->name('index');
            Route::post('/export', [ReportController::class, 'export'])->name('export');
            Route::get('/pkh', [ReportController::class, 'pkhReport'])->name('pkh');
            Route::post('/pkh/export', [ReportController::class, 'exportPkh'])->name('pkh.export');
        });

        // Manajemen Pengaturan PKH
        Route::get('settings', function () {
            return Inertia::render('Settings/Index', [
                'title' => 'Pengaturan Sistem PKH'
            ]);
        })->name('settings');

        // Pengaturan bantuan PKH per tahun
        Route::prefix('pengaturan-bantuan')->name('pengaturan-bantuan.')->group(function () {
            Route::get('/', [BantuanController::class, 'pengaturan'])->name('index');
            Route::post('/', [BantuanController::class, 'storePengaturan'])->name('store');
            Route::patch('/{pengaturan}', [BantuanController::class, 'updatePengaturan'])->name('update');
        });
    });

    // API Routes untuk PKH (data dinamis)
    Route::prefix('api')->group(function () {
        // API untuk data keluarga di peta
        Route::get('/keluarga', [AdminKeluargaController::class, 'getForMap'])->name('api.keluarga.map');
        
        // API untuk data bantuan di peta
        Route::get('/bantuan/peta', [BantuanController::class, 'peta'])->name('api.bantuan.peta');
        
        // API untuk statistik dashboard PKH
        Route::get('/dashboard', [DashboardController::class, 'apiData'])->name('api.dashboard');
        Route::get('/dashboard/realtime', [DashboardController::class, 'realtimeStats'])->name('api.dashboard.realtime');
        
        // API untuk data peta umum
        Route::get('/map-data/{keluargaId}', [MapController::class, 'getMapData'])->name('api.map.data');
        Route::post('/map-data', [MapController::class, 'saveMapData'])->name('api.map.save');
        
        // API untuk statistik bantuan PKH
        Route::get('/bantuan/statistik/{tahun?}', [BantuanController::class, 'getStatistik'])->name('api.bantuan.statistik');
        
        // API untuk export data PKH
        Route::post('/bantuan/export', [BantuanController::class, 'exportData'])->name('api.bantuan.export');
        
        // API untuk validasi data PKH
        Route::post('/keluarga/validasi', [AdminKeluargaController::class, 'validasiData'])->name('api.keluarga.validasi');
    });

    // Rute khusus untuk monitoring PKH
    Route::prefix('monitoring')->name('monitoring.')->middleware('auth')->group(function () {
        // Monitoring distribusi bantuan real-time
        Route::get('/distribusi', [BantuanController::class, 'monitoringDistribusi'])->name('distribusi');
        
        // Monitoring penerima bantuan per wilayah
        Route::get('/wilayah', [BantuanController::class, 'monitoringWilayah'])->name('wilayah');
        
        // Monitoring trend penerima bantuan
        Route::get('/trend', [BantuanController::class, 'monitoringTrend'])->name('trend');
    });
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

require __DIR__ . '/auth.php';
