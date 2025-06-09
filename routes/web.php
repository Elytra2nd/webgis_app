<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Import Controllers with Aliases for Clarity and to avoid name conflicts
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AnggotaKeluargaController;
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

// Public routes untuk Data Keluarga
Route::get('/keluarga', [PublicKeluargaController::class, 'index'])->name('keluarga.index');
Route::get('/keluarga/{keluarga}', [PublicKeluargaController::class, 'show'])->name('keluarga.show');

// Public map access
Route::get('/map', function() {
    return Inertia::render('Map/Index');
})->name('map.public');


/*
|--------------------------------------------------------------------------
| Authenticated Routes (Requires Login)
|--------------------------------------------------------------------------
|
| Rute-rute ini hanya dapat diakses oleh pengguna yang sudah login.
|
*/

// Dashboard route
// FIX: Menggunakan sintaks array [Controller::class, 'method'] untuk menunjuk ke metode 'index' secara eksplisit.
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
    // Ini membuat struktur lebih rapi dan menghindari konflik URL.
    Route::prefix('admin')->name('admin.')->group(function () {

        // Manajemen Keluarga (CRUD)
        Route::resource('keluarga', AdminKeluargaController::class);

        // Update koordinat keluarga
        Route::post('keluarga/{keluarga}/coordinates', [AdminKeluargaController::class, 'updateCoordinates'])
            ->name('keluarga.update-coordinates');

        // Rute untuk Peta Admin
        Route::get('map', function () {
            return Inertia::render('Map/Index');
        })->name('map'); // Nama rutenya sekarang 'admin.map'

        // Manajemen Laporan
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [ReportController::class, 'index'])->name('index');
            Route::post('/export', [ReportController::class, 'export'])->name('export');
        });

        // Manajemen Pengaturan
        Route::get('settings', function () {
            return Inertia::render('Settings/Index');
        })->name('settings');
    });

    // API Routes (untuk data dinamis)
    Route::prefix('api')->group(function () {
        Route::get('/keluarga', [AdminKeluargaController::class, 'getKeluargaForMap']);
        Route::get('/map-data/{keluargaId}', [MapController::class, 'getMapData']);
        Route::post('/map-data', [MapController::class, 'saveMapData']);
        Route::get('/dashboard', [DashboardController::class, 'apiData'])->name('dashboard.api'); // Nama ini mungkin perlu diubah agar tidak konflik
        Route::get('/dashboard/realtime', [DashboardController::class, 'realtimeStats'])->name('dashboard.realtime');
    });
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

require __DIR__ . '/auth.php';
