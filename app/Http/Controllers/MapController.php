<?php

namespace App\Http\Controllers;

use App\Models\Keluarga;
use App\Models\Wilayah;
use App\Models\Jarak;
use Illuminate\Http\Request;
use Inertia\Inertia;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Objects\LineString;
use MatanYadaev\EloquentSpatial\Objects\Polygon;

class MapController extends Controller
{

    public function index()
    {
        return Inertia::render('Map/Index');
    }

    public function saveMapData(Request $request)
    {
        $validated = $request->validate([
            'keluarga_id' => 'required|exists:keluarga,id',
            'type' => 'required|in:point,polygon,linestring',
            'data' => 'required|json',
            'nama' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ]);

        $data = json_decode($validated['data'], true);
        $keluargaId = $validated['keluarga_id'];

        switch ($validated['type']) {
            case 'point':
                // Simpan lokasi rumah (point)
                $keluarga = Keluarga::findOrFail($keluargaId);
                $keluarga->lokasi = new Point($data[0]['lat'], $data[0]['lng']);
                $keluarga->save();

                return response()->json(['message' => 'Lokasi rumah berhasil disimpan']);

            case 'polygon':
                // Simpan wilayah (polygon)
                $points = [];
                foreach ($data as $coord) {
                    $points[] = new Point($coord['lat'], $coord['lng']);
                }

                // Pastikan polygon tertutup dengan menambahkan titik pertama di akhir jika perlu
                if (
                    $points[0]->latitude !== end($points)->latitude ||
                    $points[0]->longitude !== end($points)->longitude
                ) {
                    $points[] = $points[0];
                }

                $polygon = new Polygon([$points]);

                Wilayah::create([
                    'keluarga_id' => $keluargaId,
                    'nama' => $validated['nama'] ?? 'Wilayah',
                    'area' => $polygon,
                    'keterangan' => $validated['keterangan'] ?? null
                ]);

                return response()->json(['message' => 'Data wilayah berhasil disimpan']);

            case 'linestring':
                // Simpan jarak (linestring)
                $points = [];
                $totalDistance = 0;

                for ($i = 0; $i < count($data); $i++) {
                    $points[] = new Point($data[$i]['lat'], $data[$i]['lng']);

                    // Hitung jarak
                    if ($i > 0) {
                        $p1 = new Point($data[$i - 1]['lat'], $data[$i - 1]['lng']);
                        $p2 = new Point($data[$i]['lat'], $data[$i]['lng']);

                        // Haversine formula untuk menghitung jarak
                        $earthRadius = 6371000; // meter
                        $latFrom = deg2rad($p1->latitude);
                        $lonFrom = deg2rad($p1->longitude);
                        $latTo = deg2rad($p2->latitude);
                        $lonTo = deg2rad($p2->longitude);

                        $latDelta = $latTo - $latFrom;
                        $lonDelta = $lonTo - $lonFrom;

                        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
                            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

                        $segmentDistance = $angle * $earthRadius;
                        $totalDistance += $segmentDistance;
                    }
                }

                $lineString = new LineString($points);

                Jarak::create([
                    'keluarga_id' => $keluargaId,
                    'nama' => $validated['nama'] ?? 'Jarak',
                    'line' => $lineString,
                    'panjang' => $totalDistance
                ]);

                return response()->json([
                    'message' => 'Data jarak berhasil disimpan',
                    'jarak' => round($totalDistance, 2) . ' meter'
                ]);

            default:
                return response()->json(['message' => 'Tipe data tidak valid'], 400);
        }
    }

    public function getMapData($keluargaId)
    {
        $keluarga = Keluarga::with(['wilayah', 'jarak'])->findOrFail($keluargaId);

        $result = [
            'point' => null,
            'polygons' => [],
            'lines' => []
        ];

        // Ambil data point (lokasi rumah)
        if ($keluarga->lokasi) {
            $result['point'] = [
                'lat' => $keluarga->lokasi->latitude,
                'lng' => $keluarga->lokasi->longitude
            ];
        }

        // Ambil data polygon (wilayah)
        foreach ($keluarga->wilayah as $wilayah) {
            if ($wilayah->area) {
                $coordinates = [];

                // Ambil koordinat dari polygon
                foreach ($wilayah->area->rings[0]->points as $point) {
                    $coordinates[] = [
                        'lat' => $point->latitude,
                        'lng' => $point->longitude
                    ];
                }

                $result['polygons'][] = [
                    'id' => $wilayah->id,
                    'nama' => $wilayah->nama,
                    'keterangan' => $wilayah->keterangan,
                    'coordinates' => $coordinates
                ];
            }
        }

        // Ambil data linestring (jarak)
        foreach ($keluarga->jarak as $jarak) {
            if ($jarak->line) {
                $coordinates = [];

                // Ambil koordinat dari linestring
                foreach ($jarak->line->points as $point) {
                    $coordinates[] = [
                        'lat' => $point->latitude,
                        'lng' => $point->longitude
                    ];
                }

                $result['lines'][] = [
                    'id' => $jarak->id,
                    'nama' => $jarak->nama,
                    'panjang' => $jarak->panjang,
                    'coordinates' => $coordinates
                ];
            }
        }

        return response()->json($result);
    }
}
