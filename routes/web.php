<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\PublicKeluargaController;
use App\Models\AnggotaKeluarga;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\KeluargaController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AnggotaKeluargaController;

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

// Landing page route - Main homepage
Route::get('/', [LandingPageController::class, 'index'])->name('landing');

// Public map access
Route::get('/map', function() {
    return Inertia::render('Map/Index');
})->name('map.public');

// Public keluarga routes (read-only access)
Route::get('/keluarga/public', [PublicKeluargaController::class, 'index'])->name('keluarga.public');
Route::get('/keluarga/{keluarga}/public', [PublicKeluargaController::class, 'show'])->name('keluarga.public.show');

// API routes untuk public access (read-only)
Route::get('/api/keluarga', [KeluargaController::class, 'getKeluargaForMap']);
Route::get('/api/map-data/{keluargaId}', [MapController::class, 'getMapData']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

// Dashboard route - Requires authentication
Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Keluarga routes (Admin access)
    Route::resource('keluarga', KeluargaController::class);

    Route::post('keluarga/{keluarga}/coordinates', [KeluargaController::class, 'updateCoordinates'])
        ->name('keluarga.update-coordinates');

    // Anggota Keluarga routes (Resource routes untuk CRUD lengkap)
    Route::resource('anggota-keluarga', AnggotaKeluargaController::class)->names([
        'index' => 'anggota-keluarga.index',
        'create' => 'anggota-keluarga.create',
        'store' => 'anggota-keluarga.store',
        'show' => 'anggota-keluarga.show',
        'edit' => 'anggota-keluarga.edit',
        'update' => 'anggota-keluarga.update',
        'destroy' => 'anggota-keluarga.destroy'
    ]);

    // Map routes (authenticated admin access)
    Route::get('/map/admin', function () {
        return Inertia::render('Map/Index');
    })->name('map.admin');

    // API routes untuk authenticated users
    Route::post('/api/keluarga', [KeluargaController::class, 'storeFromMap']);
    Route::post('/api/map-data', [MapController::class, 'saveMapData']);

    // Dashboard API routes (real-time data)
    Route::get('/api/dashboard', [DashboardController::class, 'apiData'])->name('dashboard.api');
    Route::get('/api/dashboard/realtime', [DashboardController::class, 'realtimeStats'])->name('dashboard.realtime');

    // Settings route
    Route::get('/settings', function () {
        return Inertia::render('Settings/Index');
    })->name('settings');

    // Reports routes
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/{category}', [ReportController::class, 'show'])->name('show');
        Route::get('/{category}/export', [ReportController::class, 'export'])->name('export');
    });

    // Additional reports routes
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::post('/reports/export', [ReportController::class, 'export'])->name('reports.export');
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

require __DIR__ . '/auth.php';
