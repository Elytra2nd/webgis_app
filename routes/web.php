<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\KeluargaController;
use App\Http\Controllers\MapController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

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

    // Map data routes
    Route::post('/api/map-data', [MapController::class, 'saveMapData']);
    Route::get('/api/map-data/{keluargaId}', [MapController::class, 'getMapData']);

    // Map routes
    Route::get('/map', function() {
        return Inertia::render('Map/Index');
    })->name('map');

    // API route untuk mendapatkan data keluarga untuk peta
    Route::get('/api/keluarga', [KeluargaController::class, 'getKeluargaForMap']);

    // Reports route
    Route::get('/reports', function() {
        return Inertia::render('Reports/Index');
    })->name('reports');

    // Settings route
    Route::get('/settings', function() {
        return Inertia::render('Settings/Index');
    })->name('settings');
});

require __DIR__.'/auth.php';
