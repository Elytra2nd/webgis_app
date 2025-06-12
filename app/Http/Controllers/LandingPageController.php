<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Keluarga;
use App\Models\AnggotaKeluarga;

class LandingPageController extends Controller
{
    public function index()
    {
        try {
            // Cache statistics for better performance (cache for 5 minutes)
            $stats = Cache::remember('landing_page_stats', 300, function () {
                return [
                    'total_keluarga' => Keluarga::count(),
                    'total_anggota' => AnggotaKeluarga::count(),
                    // Perbaikan untuk count distinct yang benar
                    'total_wilayah' => Keluarga::whereNotNull('kota')
                        ->where('kota', '!=', '')
                        ->distinct('kota')
                        ->count('kota')
                ];
            });

            // Enhanced featured regions dengan lebih banyak data
            $featured_regions = Cache::remember('landing_page_regions', 300, function () {
                return Keluarga::select('kota', DB::raw('count(*) as total'))
                    ->whereNotNull('kota')
                    ->where('kota', '!=', '')
                    ->where('kota', 'not like', '%test%') // Filter test data
                    ->groupBy('kota')
                    ->orderBy('total', 'desc')
                    ->take(6) // Ambil 6 region terpopuler
                    ->get()
                    ->map(function ($item) {
                        return [
                            'kota' => trim($item->kota),
                            'total' => (int) $item->total
                        ];
                    })
                    ->toArray();
            });

            // Additional statistics untuk dashboard yang lebih informatif
            $additional_stats = Cache::remember('landing_page_additional_stats', 300, function () {
                return [
                    'total_desa_kelurahan' => Keluarga::whereNotNull('kelurahan')
                        ->where('kelurahan', '!=', '')
                        ->distinct('kelurahan')
                        ->count('kelurahan'),
                    'total_kecamatan' => Keluarga::whereNotNull('kecamatan')
                        ->where('kecamatan', '!=', '')
                        ->distinct('kecamatan')
                        ->count('kecamatan'),
                    'data_terakhir_update' => Keluarga::latest('updated_at')->value('updated_at'),
                    'keluarga_dengan_koordinat' => Keluarga::whereNotNull('latitude')
                        ->whereNotNull('longitude')
                        ->count()
                ];
            });

            // Merge stats dengan additional stats
            $stats = array_merge($stats, $additional_stats);

            // Log successful data fetch untuk monitoring
            Log::info('Landing page data fetched successfully', [
                'stats' => $stats,
                'regions_count' => count($featured_regions)
            ]);

            return Inertia::render('LandingPage', [
                'stats' => $stats,
                'featured_regions' => $featured_regions,
                'meta' => [
                    'title' => 'SiKeluarga - Sistem Informasi Keluarga Modern',
                    'description' => 'Platform terpadu untuk mengelola dan memantau data keluarga dengan teknologi modern dan antarmuka yang intuitif',
                    'keywords' => 'sistem informasi, keluarga, data management, indonesia'
                ]
            ]);

        } catch (\Exception $e) {
            // Enhanced error handling dengan logging
            Log::error('Landing page controller error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Fallback data yang lebih realistis untuk development/testing
            $fallback_stats = [
                'total_keluarga' => 150,
                'total_anggota' => 450,
                'total_wilayah' => 25,
                'total_desa_kelurahan' => 156,
                'total_kecamatan' => 45,
                'data_terakhir_update' => now(),
                'keluarga_dengan_koordinat' => 120
            ];

            $fallback_regions = [
                ['kota' => 'Pontianak', 'total' => 45],
                ['kota' => 'Singkawang', 'total' => 32],
                ['kota' => 'Sambas', 'total' => 28],
                ['kota' => 'Sanggau', 'total' => 25],
                ['kota' => 'Ketapang', 'total' => 20],
                ['kota' => 'Sintang', 'total' => 18]
            ];

            return Inertia::render('LandingPage', [
                'stats' => $fallback_stats,
                'featured_regions' => $fallback_regions,
                'meta' => [
                    'title' => 'SiKeluarga - Sistem Informasi Keluarga Modern',
                    'description' => 'Platform terpadu untuk mengelola dan memantau data keluarga dengan teknologi modern dan antarmuka yang intuitif',
                    'keywords' => 'sistem informasi, keluarga, data management, indonesia'
                ],
                'error_mode' => true // Flag untuk development debugging
            ]);
        }
    }

    /**
     * Get real-time statistics for AJAX requests
     */
    public function getStats()
    {
        try {
            $stats = [
                'total_keluarga' => Keluarga::count(),
                'total_anggota' => AnggotaKeluarga::count(),
                'total_wilayah' => Keluarga::whereNotNull('kota')
                    ->where('kota', '!=', '')
                    ->distinct('kota')
                    ->count('kota'),
                'last_updated' => now()->toISOString()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Stats API error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics'
            ], 500);
        }
    }

    /**
     * Get featured regions for AJAX requests
     */
    public function getFeaturedRegions()
    {
        try {
            $regions = Keluarga::select('kota', DB::raw('count(*) as total'))
                ->whereNotNull('kota')
                ->where('kota', '!=', '')
                ->groupBy('kota')
                ->orderBy('total', 'desc')
                ->take(6)
                ->get()
                ->map(function ($item) {
                    return [
                        'kota' => trim($item->kota),
                        'total' => (int) $item->total,
                        'percentage' => 0 // Will be calculated on frontend
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $regions
            ]);

        } catch (\Exception $e) {
            Log::error('Featured regions API error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch featured regions'
            ], 500);
        }
    }

    /**
     * Clear cache manually (for admin use)
     */
    public function clearCache()
    {
        try {
            Cache::forget('landing_page_stats');
            Cache::forget('landing_page_regions');
            Cache::forget('landing_page_additional_stats');

            return response()->json([
                'success' => true,
                'message' => 'Cache cleared successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Cache clear error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache'
            ], 500);
        }
    }
}
