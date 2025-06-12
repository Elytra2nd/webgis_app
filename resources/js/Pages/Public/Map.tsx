import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Separator } from '@/Components/ui/separator';
import {
  MapPin,
  Home,
  Users,
  TrendingDown,
  AlertTriangle,
  Waves,
  Navigation,
  MapIcon,
  ArrowLeft,
  Info,
  Layers,
  Eye,
  Globe,
  Building,
  UserCheck,
  Calendar,
  FileText,
  Sparkles,
  ExternalLink,
  Compass
} from 'lucide-react';

// PERBAIKAN UTAMA: Fix icon issues - PERSIS SAMA DENGAN ADMIN
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Komponen untuk memastikan peta di-resize dengan benar - SAMA DENGAN ADMIN
const MapResizer = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
};

// Interface yang PERSIS SAMA dengan admin
interface Keluarga {
  id: number;
  no_kk: string;
  nama_kepala_keluarga: string;
  alamat: string;
  status_ekonomi: string;
  latitude: number;
  longitude: number;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
}

interface PublicStats {
  total_keluarga: number;
  total_wilayah: number;
  sebaran_kota: Array<{
    kota: string;
    total: number;
  }>;
}

interface MapProps {
  title: string;
  public_access: boolean;
  readonly: boolean;
  can_edit: boolean;
  show_sensitive_data: boolean;
}

export default function PublicMap({ 
  title, 
  public_access, 
  readonly, 
  can_edit, 
  show_sensitive_data 
}: MapProps) {
  const [keluarga, setKeluarga] = useState<Keluarga[]>([]);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // KOORDINAT CENTER YANG SAMA DENGAN ADMIN
  const [center] = useState<[number, number]>([-2.5489, 118.0149]);
  const [zoom] = useState<number>(5);
  const [selectedMarker, setSelectedMarker] = useState<Keluarga | null>(null);

  // Cursor Tracker Refs
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const delayedMouse = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>();

  // State untuk cursor
  const [cursorHovered, setCursorHovered] = useState(false);

  // Custom Cursor Animation
  useEffect(() => {
    const manageMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      mouse.current = { x: clientX, y: clientY };

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%)`;
      }
    };

    const animate = () => {
      const dx = mouse.current.x - delayedMouse.current.x;
      const dy = mouse.current.y - delayedMouse.current.y;

      delayedMouse.current.x += dx * 0.15;
      delayedMouse.current.y += dy * 0.15;

      if (cursorInnerRef.current) {
        cursorInnerRef.current.style.transform = `translate(${delayedMouse.current.x}px, ${delayedMouse.current.y}px) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    const handleMouseEnter = () => setCursorHovered(true);
    const handleMouseLeave = () => setCursorHovered(false);

    window.addEventListener('mousemove', manageMouseMove);

    const interactiveElements = document.querySelectorAll('button, a, .marker-card, .stat-card');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    animate();

    return () => {
      window.removeEventListener('mousemove', manageMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchKeluarga();
    fetchStats();

    // Set CSRF token seperti di admin
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
      axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
    } else {
      console.error('CSRF token not found');
    }
  }, []);

  // FUNGSI FETCH YANG SAMA DENGAN ADMIN
  const fetchKeluarga = () => {
    setLoading(true);
    setError(null);
    
    axios.get('/api/keluarga-public')
      .then(response => {
        console.log('Raw API Response:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          // Filter data yang memiliki koordinat valid - SAMA DENGAN ADMIN
          const validData = response.data.filter((item: Keluarga) => {
            const hasCoordinates = item.latitude && item.longitude;
            const validLat = !isNaN(parseFloat(item.latitude.toString()));
            const validLng = !isNaN(parseFloat(item.longitude.toString()));
            
            console.log(`Item ${item.id}: lat=${item.latitude}, lng=${item.longitude}, hasCoordinates=${hasCoordinates}, validLat=${validLat}, validLng=${validLng}`);
            
            return hasCoordinates && validLat && validLng;
          });
          
          console.log('Filtered valid data:', validData);
          console.log('Total valid markers:', validData.length);
          
          setKeluarga(validData);
        } else {
          console.error('Invalid data format:', response.data);
          setError('Format data tidak valid');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Gagal memuat data peta');
        setLoading(false);
      });
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/map/stats');
      if (response.data && response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Buat stats manual dari data keluarga jika API stats gagal
      if (keluarga.length > 0) {
        const manualStats = {
          total_keluarga: keluarga.length,
          total_wilayah: [...new Set(keluarga.map(k => k.kota).filter(Boolean))].length,
          sebaran_kota: Object.entries(
            keluarga.reduce((acc: Record<string, number>, k) => {
              if (k.kota) {
                acc[k.kota] = (acc[k.kota] || 0) + 1;
              }
              return acc;
            }, {})
          ).map(([kota, total]) => ({ kota, total }))
        };
        setStats(manualStats);
      }
    }
  };

  // FUNGSI MARKER ICON YANG PERSIS SAMA DENGAN ADMIN
  const getMarkerIcon = (status: string) => {
    let color = 'blue'; // Default

    switch (status) {
      case 'sangat_miskin':
        color = 'red';
        break;
      case 'miskin':
        color = 'orange';
        break;
      case 'rentan_miskin':
        color = 'violet';
        break;
      default:
        color = 'blue';
    }

    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  // Get statistics - SAMA dengan admin
  const getStats = () => {
    return {
      total: keluarga.length,
      sangat_miskin: keluarga.filter(k => k.status_ekonomi === 'sangat_miskin').length,
      miskin: keluarga.filter(k => k.status_ekonomi === 'miskin').length,
      rentan_miskin: keluarga.filter(k => k.status_ekonomi === 'rentan_miskin').length,
    };
  };

  const localStats = getStats();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const waveVariants = {
    animate: {
      x: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50">
      <Head title={title} />

      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-6 h-6 pointer-events-none z-[9999] mix-blend-difference"
      >
        <div className="w-full h-full bg-white rounded-full shadow-lg"></div>
      </div>

      <div
        ref={cursorInnerRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] mix-blend-difference transition-all duration-200 ${
          cursorHovered ? 'w-12 h-12 shadow-[0_0_0_6px_rgba(6,182,212,0.2)]' : 'w-3 h-3'
        }`}
      >
        <div className="w-full h-full bg-white rounded-full opacity-60"></div>
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-cyan-200/12 to-teal-200/12 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-36 h-36 bg-gradient-to-br from-blue-200/8 to-cyan-200/8 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-30 h-30 bg-gradient-to-br from-teal-200/12 to-emerald-200/12 rounded-full blur-xl"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <motion.div
                className="relative"
                variants={waveVariants}
                animate="animate"
              >
                <div className="w-3 h-8 bg-gradient-to-b from-cyan-400 via-teal-500 to-blue-600 rounded-full shadow-lg"></div>
                <div className="absolute -top-1 -left-1 w-5 h-10 bg-gradient-to-b from-cyan-300/30 via-teal-400/30 to-blue-500/30 rounded-full blur-sm"></div>
              </motion.div>
              <span className="font-light text-xl text-slate-800">SiKeluarga</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </Button>
              <Link href="/">
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Beranda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <motion.div
        className="pt-24 pb-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          className="px-4 sm:px-6 lg:px-8"
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto text-center">
            <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 px-4 py-2 mb-4">
              <Navigation className="w-4 h-4 mr-2" />
              Peta Publik
            </Badge>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-4">
              {title}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Visualisasi sebaran data keluarga dalam bentuk peta interaktif untuk akses publik
            </p>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div 
            className="px-4 sm:px-6 lg:px-8"
            variants={itemVariants}
          >
            <div className="max-w-7xl mx-auto">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}. Silakan refresh halaman atau hubungi administrator.
                </AlertDescription>
              </Alert>
            </div>
          </motion.div>
        )}

        {/* Statistics Cards yang sama dengan admin */}
        <motion.div 
          className="px-4 sm:px-6 lg:px-8"
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="stat-card border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-600 mb-1">Total Marker</p>
                        <motion.p
                          className="text-3xl font-semibold text-slate-900"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        >
                          {localStats.total}
                        </motion.p>
                      </div>
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <MapPin className="w-6 h-6 text-cyan-600" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="stat-card border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-red-600 mb-1">Sangat Miskin</p>
                        <motion.p
                          className="text-3xl font-semibold text-red-700"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                        >
                          {localStats.sangat_miskin}
                        </motion.p>
                      </div>
                      <motion.div
                        className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="stat-card border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-amber-600 mb-1">Miskin</p>
                        <motion.p
                          className="text-3xl font-semibold text-amber-700"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                        >
                          {localStats.miskin}
                        </motion.p>
                      </div>
                      <motion.div
                        className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <TrendingDown className="w-6 h-6 text-orange-500" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="stat-card border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-violet-600 mb-1">Rentan Miskin</p>
                        <motion.p
                          className="text-3xl font-semibold text-violet-700"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                        >
                          {localStats.rentan_miskin}
                        </motion.p>
                      </div>
                      <motion.div
                        className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Users className="w-6 h-6 text-violet-500" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Map Container yang sama dengan admin */}
        <motion.div 
          className="px-4 sm:px-6 lg:px-8"
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
              {/* Header */}
              <CardHeader className="pb-6 bg-gradient-to-r from-cyan-50/50 to-teal-50/50 border-b border-gray-100/50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <CardTitle className="text-xl font-medium text-slate-800 flex items-center space-x-2">
                      <Waves className="w-5 h-5 text-teal-600" />
                      <span>Peta Interaktif Sebaran Penduduk (Publik)</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {keluarga.length > 0 
                        ? `Menampilkan ${keluarga.length} lokasi keluarga dengan koordinat valid`
                        : 'Klik pada marker untuk melihat detail keluarga'
                      }
                    </CardDescription>
                  </div>

                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Info className="w-3 h-3 mr-1" />
                    Mode Publik
                  </Badge>
                </div>

                {/* Legend - sama dengan admin */}
                <div className="mt-6 flex flex-wrap gap-6">
                  {[
                    { color: 'bg-red-500', label: 'Sangat Miskin' },
                    { color: 'bg-orange-500', label: 'Miskin' },
                    { color: 'bg-violet-500', label: 'Rentan Miskin' },
                    { color: 'bg-blue-500', label: 'Lainnya' }
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`w-4 h-4 ${item.color} rounded-full mr-2 shadow-sm`}></div>
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </CardHeader>

              {/* Map Area */}
              <div className="relative">
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-br from-cyan-50/80 to-teal-50/80 backdrop-blur-sm flex items-center justify-center z-10"
                    >
                      <div className="flex flex-col items-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-500 rounded-full mb-4"
                        />
                        <p className="text-slate-600 font-medium">Memuat peta...</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="h-[600px] lg:h-[700px] relative">
                  <MapContainer
                    center={center}
                    zoom={zoom}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-b-2xl"
                  >
                    <MapResizer />

                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* MARKER RENDERING YANG DIPERBAIKI - SAMA DENGAN ADMIN */}
                    {!loading && keluarga.length > 0 && keluarga.map(item => {
                      // Validasi koordinat yang ketat
                      if (!item.latitude || !item.longitude) {
                        console.warn(`Missing coordinates for item ${item.id}:`, item);
                        return null;
                      }

                      const lat = parseFloat(item.latitude.toString());
                      const lng = parseFloat(item.longitude.toString());

                      if (isNaN(lat) || isNaN(lng)) {
                        console.warn(`Invalid coordinates for item ${item.id}: lat=${lat}, lng=${lng}`);
                        return null;
                      }

                      console.log(`Rendering marker for ${item.nama_kepala_keluarga} at [${lat}, ${lng}] with status ${item.status_ekonomi}`);

                      return (
                        <Marker
                          key={`marker-${item.id}`}
                          position={[lat, lng]}
                          icon={getMarkerIcon(item.status_ekonomi)}
                        >
                          <Popup className="custom-popup">
                            <div className="p-3">
                              <h3 className="font-semibold text-slate-900 mb-3">{item.nama_kepala_keluarga}</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-600">No. KK:</span>
                                  <span className="text-slate-800">{item.no_kk}</span>
                                </div>
                                <div className="flex items-start justify-between">
                                  <span className="font-medium text-slate-600">Alamat:</span>
                                  <span className="text-slate-800 text-right max-w-[150px]">{item.alamat}</span>
                                </div>
                                {item.kota && (
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-slate-600">Kota:</span>
                                    <span className="text-slate-800">{item.kota}</span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-600">Status:</span>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      item.status_ekonomi === 'sangat_miskin' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                      item.status_ekonomi === 'miskin' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                                      item.status_ekonomi === 'rentan_miskin' ? 'bg-violet-100 text-violet-700 hover:bg-violet-200' :
                                      'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    }`}
                                  >
                                    {item.status_ekonomi?.replace('_', ' ') || 'Tidak diketahui'}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-600">Koordinat:</span>
                                  <span className="text-slate-800 text-xs">
                                    {lat.toFixed(4)}, {lng.toFixed(4)}
                                  </span>
                                </div>
                              </div>
                              <Separator className="my-3" />
                              <div className="flex items-center justify-center">
                                <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Data Publik
                                </Badge>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}

                    {/* Pesan jika tidak ada data */}
                    {!loading && keluarga.length === 0 && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                        <div className="text-center">
                          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                          <h3 className="text-lg font-semibold text-slate-700 mb-2">Tidak Ada Data</h3>
                          <p className="text-slate-600 text-sm">
                            Belum ada data keluarga dengan koordinat yang tersedia untuk ditampilkan.
                          </p>
                        </div>
                      </div>
                    )}
                  </MapContainer>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Top Cities */}
        {stats && stats.sebaran_kota && stats.sebaran_kota.length > 0 && (
          <motion.div 
            className="px-4 sm:px-6 lg:px-8"
            variants={itemVariants}
          >
            <div className="max-w-7xl mx-auto">
              <Card className="border-0 shadow-lg bg-white/90">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-teal-600" />
                    <span>Sebaran Per Kota</span>
                  </CardTitle>
                  <CardDescription>
                    Distribusi data keluarga berdasarkan kota/kabupaten
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.sebaran_kota.slice(0, 6).map((kota, index) => (
                      <motion.div
                        key={kota.kota}
                        className="marker-card p-4 bg-gradient-to-r from-slate-50 to-cyan-50 rounded-lg border border-slate-200"
                        whileHover={{ scale: 1.02 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-800">{kota.kota}</h4>
                            <p className="text-sm text-slate-600">{kota.total} keluarga</p>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full transition-all duration-1000"
                              style={{
                                width: `${Math.min(100, (kota.total / Math.max(...stats.sebaran_kota.map(k => k.total))) * 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Additional Info */}
        <motion.div 
          className="px-4 sm:px-6 lg:px-8 pb-8"
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-cyan-50 to-teal-50">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Compass className="w-8 h-8 text-cyan-600 mr-3" />
                  <h3 className="text-xl font-semibold text-slate-800">Informasi Peta</h3>
                </div>
                <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                  Peta ini menampilkan sebaran data keluarga yang tersedia untuk akses publik. 
                  Data yang ditampilkan telah disesuaikan untuk menjaga privasi dan keamanan informasi.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-center space-x-2">
                    <UserCheck className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm text-slate-600">Data Terverifikasi</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm text-slate-600">Update Real-time</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm text-slate-600">Akses Terbuka</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>

      {/* Custom CSS yang sama dengan admin */}
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 250, 0.95) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(6, 182, 212, 0.1);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          font-family: inherit;
        }
        .custom-popup .leaflet-popup-tip {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 250, 0.95) 100%);
          border: 1px solid rgba(6, 182, 212, 0.1);
          border-top: none;
          border-right: none;
        }
        .leaflet-popup-close-button {
          color: #0891b2 !important;
          font-size: 18px !important;
          font-weight: bold !important;
        }
        .leaflet-popup-close-button:hover {
          color: #0e7490 !important;
        }
      `}</style>
    </div>
  );
}
