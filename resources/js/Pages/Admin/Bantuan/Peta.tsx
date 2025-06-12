import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { useToast } from '@/Hooks/use-toast';
import { MapPin, Calendar, Users, CheckCircle, AlertCircle, Layers, RefreshCw, ArrowLeft, Download, Filter } from 'lucide-react';

interface KeluargaMarker {
    id: number;
    no_kk: string;
    nama_kepala_keluarga: string;
    alamat: string;
    latitude: number;
    longitude: number;
    status_ekonomi: string;
    status_bantuan: 'sudah_terima' | 'belum_terima';
    nominal_bantuan: number;
    tahun_bantuan: number;
}

interface Props {
    auth: { user: { name: string; email: string } };
    tahun_tersedia?: number[];
    title?: string;
}

export default function PetaBantuan({ auth, tahun_tersedia = [], title }: Props) {
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [dataPeta, setDataPeta] = useState<{
        sudah_terima: KeluargaMarker[];
        belum_terima: KeluargaMarker[];
        statistik: {
            total_sudah_terima: number;
            total_belum_terima: number;
            tahun: number;
        };
    } | null>(null);
    const [showSudahTerima, setShowSudahTerima] = useState(true);
    const [showBelumTerima, setShowBelumTerima] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const mainContainerRef = useRef(null);

    const { toast } = useToast();

    // Animasi GSAP
    useGSAP(() => {
        gsap.from('.map-card', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power3.out'
        });
        gsap.from('.control-card', {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power3.out',
            delay: 0.2
        });
    }, { scope: mainContainerRef });

    // Load data peta dengan error handling yang lebih baik
    const loadDataPeta = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Gunakan route helper atau URL yang benar
            const response = await fetch(`/admin/bantuan/peta-data?tahun=${tahun}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Validasi struktur data
            if (data && typeof data === 'object') {
                setDataPeta({
                    sudah_terima: Array.isArray(data.sudah_terima) ? data.sudah_terima : [],
                    belum_terima: Array.isArray(data.belum_terima) ? data.belum_terima : [],
                    statistik: {
                        total_sudah_terima: data.statistik?.total_sudah_terima || 0,
                        total_belum_terima: data.statistik?.total_belum_terima || 0,
                        tahun: data.statistik?.tahun || parseInt(tahun)
                    }
                });

                toast({
                    title: "Data berhasil dimuat",
                    description: `Menampilkan data peta untuk tahun ${tahun}`,
                });
            } else {
                throw new Error('Format data tidak valid');
            }
        } catch (error) {
            console.error('Error loading map data:', error);
            setError(error instanceof Error ? error.message : 'Gagal memuat data peta');
            
            // Set data kosong jika error
            setDataPeta({
                sudah_terima: [],
                belum_terima: [],
                statistik: { total_sudah_terima: 0, total_belum_terima: 0, tahun: parseInt(tahun) }
            });

            toast({
                title: "Gagal memuat data",
                description: "Terjadi kesalahan saat memuat data peta. Silakan coba lagi.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Initialize map dengan koordinat Kalimantan Barat
    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current) {
            const L = (window as any).L;
            if (L) {
                // Koordinat Kalimantan Barat
                mapInstanceRef.current = L.map(mapRef.current, {
                    center: [-0.789275, 113.921327],
                    zoom: 8,
                    zoomControl: true,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    touchZoom: true
                });
                
                // Tambahkan tile layer dengan multiple providers
                const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                });

                const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: '© Esri',
                    maxZoom: 19
                });

                // Tambahkan layer default
                osmLayer.addTo(mapInstanceRef.current);

                // Tambahkan layer control
                const baseMaps = {
                    "OpenStreetMap": osmLayer,
                    "Satelit": satelliteLayer
                };
                L.control.layers(baseMaps).addTo(mapInstanceRef.current);

                // Tambahkan scale control
                L.control.scale().addTo(mapInstanceRef.current);
            } else {
                setError('Library Leaflet tidak ditemukan. Pastikan Leaflet sudah dimuat.');
            }
        }
    }, []);

    // Load data when tahun changes
    useEffect(() => {
        if (tahun) {
            loadDataPeta();
        }
    }, [tahun]);

    // Update markers when data or visibility changes
    useEffect(() => {
        if (!mapInstanceRef.current || !dataPeta) return;

        const L = (window as any).L;
        if (!L) return;

        // Clear existing markers
        markersRef.current.forEach(marker => {
            try {
                mapInstanceRef.current.removeLayer(marker);
            } catch (e) {
                console.warn('Error removing marker:', e);
            }
        });
        markersRef.current = [];

        // Add markers for families that already received aid
        if (showSudahTerima && dataPeta.sudah_terima.length > 0) {
            dataPeta.sudah_terima.forEach(keluarga => {
                try {
                    const marker = L.marker([keluarga.latitude, keluarga.longitude], {
                        icon: L.divIcon({
                            className: 'custom-marker-sudah-terima',
                            html: `<div class="w-8 h-8 bg-green-500 border-3 border-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                                     <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                       <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                     </svg>
                                   </div>`,
                            iconSize: [32, 32],
                            iconAnchor: [16, 16]
                        })
                    }).addTo(mapInstanceRef.current);

                    marker.bindPopup(`
                        <div class="p-4 min-w-80 max-w-sm">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                <h3 class="font-bold text-slate-800 text-lg">${keluarga.nama_kepala_keluarga}</h3>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="grid grid-cols-2 gap-2">
                                    <span class="font-medium text-slate-600">No. KK:</span>
                                    <span class="font-mono text-slate-800">${keluarga.no_kk}</span>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <span class="font-medium text-slate-600">Status:</span>
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                                        ✓ Sudah Terima
                                    </span>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <span class="font-medium text-slate-600">Bantuan:</span>
                                    <span class="font-bold text-green-600">Rp ${keluarga.nominal_bantuan.toLocaleString('id-ID')}/bulan</span>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <span class="font-medium text-slate-600">Tahun:</span>
                                    <span class="text-slate-800">${keluarga.tahun_bantuan || tahun}</span>
                                </div>
                                <div class="pt-2 border-t border-slate-200">
                                    <span class="font-medium text-slate-600">Alamat:</span>
                                    <p class="text-slate-800 mt-1">${keluarga.alamat}</p>
                                </div>
                            </div>
                        </div>
                    `, {
                        maxWidth: 400,
                        className: 'custom-popup'
                    });

                    markersRef.current.push(marker);
                } catch (e) {
                    console.warn('Error creating marker for sudah terima:', e);
                }
            });
        }

        // Add markers for families that haven't received aid
        if (showBelumTerima && dataPeta.belum_terima.length > 0) {
            dataPeta.belum_terima.forEach(keluarga => {
                try {
                    const marker = L.marker([keluarga.latitude, keluarga.longitude], {
                        icon: L.divIcon({
                            className: 'custom-marker-belum-terima',
                            html: `<div class="w-8 h-8 bg-red-500 border-3 border-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                                     <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                       <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                                     </svg>
                                   </div>`,
                            iconSize: [32, 32],
                            iconAnchor: [16, 16]
                        })
                    }).addTo(mapInstanceRef.current);

                    marker.bindPopup(`
                        <div class="p-4 min-w-80 max-w-sm">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                <h3 class="font-bold text-slate-800 text-lg">${keluarga.nama_kepala_keluarga}</h3>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="grid grid-cols-2 gap-2">
                                    <span class="font-medium text-slate-600">No. KK:</span>
                                    <span class="font-mono text-slate-800">${keluarga.no_kk}</span>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <span class="font-medium text-slate-600">Status:</span>
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 font-medium">
                                        ⚠ Belum Terima
                                    </span>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <span class="font-medium text-slate-600">Status Ekonomi:</span>
                                    <span class="text-slate-800 capitalize">${keluarga.status_ekonomi.replace('_', ' ')}</span>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <span class="font-medium text-slate-600">Tahun:</span>
                                    <span class="text-slate-800">${tahun}</span>
                                </div>
                                <div class="pt-2 border-t border-slate-200">
                                    <span class="font-medium text-slate-600">Alamat:</span>
                                    <p class="text-slate-800 mt-1">${keluarga.alamat}</p>
                                </div>
                            </div>
                        </div>
                    `, {
                        maxWidth: 400,
                        className: 'custom-popup'
                    });

                    markersRef.current.push(marker);
                } catch (e) {
                    console.warn('Error creating marker for belum terima:', e);
                }
            });
        }

        // Fit bounds jika ada markers
        if (markersRef.current.length > 0) {
            try {
                const group = new L.featureGroup(markersRef.current);
                mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
            } catch (e) {
                console.warn('Error fitting bounds:', e);
            }
        }
    }, [dataPeta, showSudahTerima, showBelumTerima, tahun]);

    // Handle refresh data
    const handleRefresh = () => {
        loadDataPeta();
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title || "Peta Sebaran Bantuan PKH"} />

            <div ref={mainContainerRef} className="max-w-7xl mx-auto space-y-6">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.bantuan.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Peta Sebaran Bantuan PKH</h1>
                            <p className="mt-1 text-slate-600">Visualisasi spasial Program Keluarga Harapan Kalimantan Barat</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </header>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Controls */}
                <Card className="control-card bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Tahun Anggaran</label>
                                    <Select value={tahun} onValueChange={setTahun}>
                                        <SelectTrigger className="w-40">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tahun_tersedia.length > 0 ? tahun_tersedia.map(t => (
                                                <SelectItem key={t} value={t.toString()}>
                                                    {t} {t === new Date().getFullYear() && '(Aktif)'}
                                                </SelectItem>
                                            )) : (
                                                <SelectItem value={new Date().getFullYear().toString()}>
                                                    {new Date().getFullYear()} (Default)
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={showSudahTerima ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setShowSudahTerima(!showSudahTerima)}
                                        className={showSudahTerima ? "bg-green-600 hover:bg-green-700" : ""}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Sudah Terima ({dataPeta?.statistik.total_sudah_terima || 0})
                                    </Button>
                                    <Button
                                        variant={showBelumTerima ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setShowBelumTerima(!showBelumTerima)}
                                        className={showBelumTerima ? "bg-red-600 hover:bg-red-700" : ""}
                                    >
                                        <AlertCircle className="mr-2 h-4 w-4" />
                                        Belum Terima ({dataPeta?.statistik.total_belum_terima || 0})
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Map */}
                <Card className="map-card bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-cyan-50 border-b border-slate-200">
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-cyan-600" />
                            Peta Sebaran Bantuan PKH Tahun {tahun}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 relative">
                        <div ref={mapRef} className="w-full h-[600px] relative z-10" />
                        
                        {/* Legend */}
                        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-slate-200 z-20">
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <Layers className="h-4 w-4" />
                                Legenda
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-sm text-slate-600 font-medium">Sudah Menerima Bantuan</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                                        <AlertCircle className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-sm text-slate-600 font-medium">Belum Menerima Bantuan</span>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-200">
                                <p className="text-xs text-slate-500">
                                    Total: {(dataPeta?.statistik.total_sudah_terima || 0) + (dataPeta?.statistik.total_belum_terima || 0)} KK
                                </p>
                            </div>
                        </div>

                        {/* Loading Overlay */}
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-30">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-600 font-medium">Memuat data peta...</p>
                                    <p className="text-slate-500 text-sm">Tahun {tahun}</p>
                                </div>
                            </div>
                        )}

                        {/* No Data Overlay */}
                        {!loading && dataPeta && 
                         dataPeta.sudah_terima.length === 0 && 
                         dataPeta.belum_terima.length === 0 && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-30">
                                <div className="text-center">
                                    <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600 font-medium text-lg">Tidak ada data untuk ditampilkan</p>
                                    <p className="text-slate-500 text-sm">Belum ada data keluarga dengan koordinat untuk tahun {tahun}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Custom CSS untuk marker dan popup */}
            <style>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                }
                .custom-popup .leaflet-popup-tip {
                    background: white;
                }
                .custom-marker-sudah-terima:hover,
                .custom-marker-belum-terima:hover {
                    z-index: 1000;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
