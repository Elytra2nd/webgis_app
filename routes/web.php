<?php

use App\Http\Controllers\ProfileController;
use App\Models\AnggotaKeluarga;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\KeluargaController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AnggotaKeluargaController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Route untuk guest (read-only)
Route::get('/map', function() {
    return Inertia::render('Map/Index');
})->name('map.public');

Route::get('/keluarga/public', [KeluargaController::class, 'index'])->name('keluarga.public');
Route::get('/keluarga/{keluarga}/public', [KeluargaController::class, 'show'])->name('keluarga.public.show');

// API route untuk mendapatkan data keluarga untuk peta (read-only)
Route::get('/api/keluarga', [KeluargaController::class, 'getKeluargaForMap']);
Route::get('/api/map-data/{keluargaId}', [MapController::class, 'getMapData']);

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Keluarga routes
    Route::resource('keluarga', KeluargaController::class);

    Route::post('keluarga/{keluarga}/coordinates', [KeluargaController::class, 'updateCoordinates'])
        ->name('keluarga.update-coordinates');

    // Anggota Keluarga routes
    Route::resource('anggota-keluarga', AnggotaKeluargaController::class);

    // Map routes (authenticated)
    Route::get('/map/admin', function () {
        return Inertia::render('Map/Index');
    })->name('map');

    // API routes untuk authenticated users
    Route::post('/api/keluarga', [KeluargaController::class, 'storeFromMap']); // Route POST untuk map
    Route::post('/api/map-data', [MapController::class, 'saveMapData']);

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
});

require __DIR__ . '/auth.php';
