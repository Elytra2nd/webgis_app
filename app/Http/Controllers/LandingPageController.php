<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Keluarga;
use App\Models\AnggotaKeluarga;

class LandingPageController extends Controller
{
    public function index()
    {
        try {
            // Public statistics (non-sensitive data only)
            $stats = [
                'total_keluarga' => Keluarga::count(),
                'total_anggota' => AnggotaKeluarga::count(),
                'total_wilayah' => Keluarga::distinct('kota')->whereNotNull('kota')->count()
            ];

            // Featured regions (top 5)
            $featured_regions = Keluarga::select('kota', DB::raw('count(*) as total'))
                ->whereNotNull('kota')
                ->where('kota', '!=', '')
                ->groupBy('kota')
                ->orderBy('total', 'desc')
                ->take(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'kota' => $item->kota,
                        'total' => $item->total
                    ];
                });

            return Inertia::render('LandingPage', [
                'stats' => $stats,
                'featured_regions' => $featured_regions
            ]);

        } catch (\Exception $e) {
            // Fallback data if database fails
            return Inertia::render('LandingPage', [
                'stats' => [
                    'total_keluarga' => 0,
                    'total_anggota' => 0,
                    'total_wilayah' => 0
                ],
                'featured_regions' => []
            ]);
        }
    }
}
