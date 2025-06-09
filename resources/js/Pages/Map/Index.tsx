import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Separator } from '@/Components/ui/separator';
import { useToast } from '@/Hooks/use-toast';
import {
  MapPin,
  Plus,
  X,
  Save,
  Loader2,
  ExternalLink,
  Users,
  TrendingDown,
  AlertTriangle,
  Waves,
  Navigation,
  MapIcon,
  CheckCircle,
  Sparkles
} from 'lucide-react';

// Fix icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Komponen untuk memastikan peta di-resize dengan benar
const MapResizer = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
};

// Komponen untuk menangani klik pada peta
const MapClickHandler = ({
  isAddingMarker,
  onMapClick
}: {
  isAddingMarker: boolean;
  onMapClick: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click: (e) => {
      if (isAddingMarker) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
};

interface Keluarga {
  id: number;
  no_kk: string;
  nama_kepala_keluarga: string;
  alamat: string;
  status_ekonomi: string;
  latitude: number;
  longitude: number;
}

interface NewMarkerData {
  no_kk: string;
  nama_kepala_keluarga: string;
  alamat: string;
  status_ekonomi: string;
  latitude: number;
  longitude: number;
}

export default function MapIndex({ auth }: PageProps) {
  const [keluarga, setKeluarga] = useState<Keluarga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [center] = useState<[number, number]>([-2.5489, 118.0149]);
  const [zoom] = useState<number>(5);

  // State untuk menambah marker baru
  const [isAddingMarker, setIsAddingMarker] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newMarkerPosition, setNewMarkerPosition] = useState<[number, number] | null>(null);
  const [newMarkerData, setNewMarkerData] = useState<NewMarkerData>({
    no_kk: '',
    nama_kepala_keluarga: '',
    alamat: '',
    status_ekonomi: 'miskin',
    latitude: 0,
    longitude: 0
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<boolean>(false);

  // Toast hook
  const { toast } = useToast();

  // Breadcrumb
  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Peta Penduduk', current: true }
  ];

  useEffect(() => {
    fetchKeluarga();

    // Set CSRF token untuk semua request axios
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
      axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
    } else {
      console.error('CSRF token not found');
    }
  }, []);

  const fetchKeluarga = () => {
    setLoading(true);
    axios.get('/api/keluarga')
      .then(response => {
        setKeluarga(response.data);
        setLoading(false);

        // Show success toast for data loading
        toast({
          variant: "default",
          title: "Data Berhasil Dimuat",
          description: `${response.data.length} marker keluarga telah dimuat ke peta.`,
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);

        // Show error toast
        toast({
          variant: "destructive",
          title: "Gagal Memuat Data",
          description: "Terjadi kesalahan saat memuat data peta. Silakan refresh halaman.",
        });
      });
  };

  // Custom marker icon berdasarkan status ekonomi dengan warna aqua theme
  const getMarkerIcon = (status: string) => {
    let color = 'blue';

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

  // Icon untuk marker sementara (sedang ditambahkan)
  const getTempMarkerIcon = () => {
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  // Handler untuk memulai mode menambah marker
  const handleStartAddMarker = () => {
    setIsAddingMarker(true);
    setShowAddForm(false);
    setNewMarkerPosition(null);

    // Show info toast
    toast({
      variant: "default",
      title: "Mode Tambah Marker Aktif",
      description: "Klik pada peta untuk menambah lokasi keluarga baru.",
    });
  };

  // Handler untuk membatalkan penambahan marker
  const handleCancelAddMarker = () => {
    setIsAddingMarker(false);
    setShowAddForm(false);
    setNewMarkerPosition(null);
    setNewMarkerData({
      no_kk: '',
      nama_kepala_keluarga: '',
      alamat: '',
      status_ekonomi: 'miskin',
      latitude: 0,
      longitude: 0
    });

    // Show info toast
    toast({
      variant: "default",
      title: "Mode Dibatalkan",
      description: "Penambahan marker baru telah dibatalkan.",
    });
  };

  // Handler untuk klik pada peta (menambah marker)
  const handleMapClick = (lat: number, lng: number) => {
    setNewMarkerPosition([lat, lng]);
    setNewMarkerData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    setShowAddForm(true);
    setIsAddingMarker(false);

    // Show success toast for location selection
    toast({
      variant: "default",
      title: "Lokasi Dipilih",
      description: `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}. Silakan isi form untuk menambah data keluarga.`,
    });
  };

  // Handler untuk menyimpan data keluarga baru - UPDATED with Toast
  const handleSaveNewMarker = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMarkerData.no_kk || !newMarkerData.nama_kepala_keluarga || !newMarkerData.alamat) {
      toast({
        variant: "destructive",
        title: "Validasi Gagal",
        description: "Mohon lengkapi semua field yang wajib diisi (No. KK, Nama Kepala Keluarga, dan Alamat).",
      });
      return;
    }

    setIsSaving(true);

    try {
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (!token) {
        throw new Error('CSRF token not found');
      }

      const response = await axios.post('/api/keluarga', newMarkerData, {
        headers: {
          'X-CSRF-TOKEN': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.status === 201) {
        // Update state with new data
        const newKeluarga = response.data.data || response.data;
        setKeluarga(prev => [...prev, newKeluarga]);

        // Show success toast
        toast({
          variant: "success",
          title: "Data Berhasil Disimpan! 🎉",
          description: `Data keluarga ${newMarkerData.nama_kepala_keluarga} telah ditambahkan ke peta dengan status ${newMarkerData.status_ekonomi.replace('_', ' ')}.`,
        });

        // Show success animation
        setShowSuccessAnimation(true);

        // Hide form and reset after animation
        setTimeout(() => {
          handleCancelAddMarker();
          setShowSuccessAnimation(false);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error saving data:', error);

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 422:
            const errors = data.errors || {};
            const errorMessages = Object.values(errors).flat();
            toast({
              variant: "destructive",
              title: "Validasi Gagal",
              description: errorMessages.join(', '),
            });
            break;
          case 419:
            toast({
              variant: "destructive",
              title: "Session Expired",
              description: "Sesi Anda telah berakhir. Halaman akan di-refresh otomatis.",
            });
            setTimeout(() => window.location.reload(), 2000);
            break;
          case 401:
            toast({
              variant: "destructive",
              title: "Unauthorized",
              description: "Anda perlu login untuk menambah data. Akan diarahkan ke halaman login.",
            });
            setTimeout(() => window.location.href = '/login', 2000);
            break;
          case 500:
            toast({
              variant: "destructive",
              title: "Server Error",
              description: data.message || 'Terjadi kesalahan server. Silakan coba lagi.',
            });
            break;
          default:
            toast({
              variant: "destructive",
              title: `Error ${status}`,
              description: data.message || 'Terjadi kesalahan. Silakan coba lagi.',
            });
        }
      } else if (error.request) {
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Tidak ada respon dari server. Periksa koneksi internet Anda.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handler untuk mengubah input form
  const handleInputChange = (field: keyof NewMarkerData, value: string) => {
    setNewMarkerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get statistics
  const getStats = () => {
    return {
      total: keluarga.length,
      sangat_miskin: keluarga.filter(k => k.status_ekonomi === 'sangat_miskin').length,
      miskin: keluarga.filter(k => k.status_ekonomi === 'miskin').length,
      rentan_miskin: keluarga.filter(k => k.status_ekonomi === 'rentan_miskin').length,
    };
  };

  const stats = getStats();

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

  const successVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      breadcrumbs={breadcrumbs}
    >
      <Head title="Peta Penduduk Miskin" />

      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header dengan animasi wave */}
        <motion.div
          className="flex items-center space-x-4 mb-8"
          variants={itemVariants}
        >
          <motion.div
            className="relative"
            variants={waveVariants}
            animate="animate"
          >
            <div className="w-3 h-10 bg-gradient-to-b from-cyan-400 via-teal-500 to-blue-600 rounded-full shadow-lg"></div>
            <div className="absolute -top-1 -left-1 w-5 h-12 bg-gradient-to-b from-cyan-300/30 via-teal-400/30 to-blue-500/30 rounded-full blur-sm"></div>
          </motion.div>
          <div className="flex items-center space-x-3">
            <MapIcon className="w-8 h-8 text-teal-600" />
            <h1 className="font-semibold text-3xl text-slate-800 tracking-wide">Peta Sebaran Penduduk</h1>
          </div>
        </motion.div>

        {/* Statistics Cards dengan animasi stagger */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={itemVariants}
        >
          <motion.div
            whileHover={{
              scale: 1.02,
              y: -5,
              transition: { type: "spring", stiffness: 300 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
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
                      {stats.total}
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
            whileHover={{
              scale: 1.02,
              y: -5,
              transition: { type: "spring", stiffness: 300 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
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
                      {stats.sangat_miskin}
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
            whileHover={{
              scale: 1.02,
              y: -5,
              transition: { type: "spring", stiffness: 300 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
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
                      {stats.miskin}
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
            whileHover={{
              scale: 1.02,
              y: -5,
              transition: { type: "spring", stiffness: 300 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
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
                      {stats.rentan_miskin}
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
        </motion.div>

        {/* Main Map Container */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
            {/* Header */}
            <CardHeader className="pb-6 bg-gradient-to-r from-cyan-50/50 to-teal-50/50 border-b border-gray-100/50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <CardTitle className="text-xl font-medium text-slate-800 flex items-center space-x-2">
                    <Waves className="w-5 h-5 text-teal-600" />
                    <span>Peta Interaktif Sebaran Penduduk</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Klik pada marker untuk melihat detail keluarga atau tambah marker baru dengan mengklik tombol di bawah.
                  </CardDescription>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <AnimatePresence mode="wait">
                    {!isAddingMarker && !showAddForm ? (
                      <motion.div
                        key="add-button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleStartAddMarker}
                          className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah Marker
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cancel-button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleCancelAddMarker}
                          variant="outline"
                          className="border-slate-300 hover:bg-slate-50 transition-all duration-200"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Batal
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Mode Indicator - Fixed AlertDescription */}
              <AnimatePresence>
                {isAddingMarker && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Alert className="mt-6 border-cyan-200 bg-gradient-to-r from-cyan-50 to-teal-50">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex-shrink-0"
                        >
                          <Navigation className="h-4 w-4 text-cyan-600" />
                        </motion.div>
                        <AlertDescription className="text-cyan-800 font-medium text-nowrap whitespace-nowrap">
                          Mode Tambah Marker Aktif - Klik pada peta untuk menambah lokasi baru
                        </AlertDescription>
                      </div>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-6">
                {[
                  { color: 'bg-red-500', label: 'Sangat Miskin' },
                  { color: 'bg-orange-500', label: 'Miskin' },
                  { color: 'bg-violet-500', label: 'Rentan Miskin' },
                  { color: 'bg-green-500', label: 'Marker Baru' }
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

            {/* Map and Form Container */}
            <div className="flex flex-col lg:flex-row">
              <motion.div
                className={`${showAddForm ? 'lg:w-2/3' : 'w-full'} transition-all duration-500 ease-in-out`}
                layout
              >
                <div className="h-[600px] lg:h-[700px] relative">
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

                  {/* Success Animation Overlay */}
                  <AnimatePresence>
                    {showSuccessAnimation && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-sm flex items-center justify-center z-20"
                      >
                        <motion.div
                          variants={successVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="flex flex-col items-center"
                        >
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              rotate: [0, 360]
                            }}
                            transition={{
                              duration: 1,
                              ease: "easeInOut"
                            }}
                            className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg"
                          >
                            <CheckCircle className="w-8 h-8 text-white" />
                          </motion.div>
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-green-700 font-semibold text-lg"
                          >
                            Data berhasil ditambahkan!
                          </motion.p>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                            className="flex items-center mt-2"
                          >
                            <Sparkles className="w-4 h-4 text-emerald-500 mr-1" />
                            <span className="text-emerald-600 text-sm">Marker baru telah ditambahkan ke peta</span>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <MapContainer
                    center={center}
                    zoom={zoom}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-b-2xl lg:rounded-br-none lg:rounded-bl-2xl"
                  >
                    <MapResizer />
                    <MapClickHandler
                      isAddingMarker={isAddingMarker}
                      onMapClick={handleMapClick}
                    />

                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* Marker keluarga yang sudah ada */}
                    {!loading && keluarga.map(item => (
                      item.latitude && item.longitude ? (
                        <Marker
                          key={item.id}
                          position={[item.latitude, item.longitude]}
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
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-600">Status:</span>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      item.status_ekonomi === 'sangat_miskin' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                      item.status_ekonomi === 'miskin' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                                      'bg-violet-100 text-violet-700 hover:bg-violet-200'
                                    }`}
                                  >
                                    {item.status_ekonomi.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>
                              <Separator className="my-3" />
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-cyan-600 border-cyan-200 hover:bg-cyan-50"
                                asChild
                              >
                                <a
                                  href={`/keluarga/${item.id}`}
                                  target="_blank"
                                  className="flex items-center justify-center"
                                >
                                  Lihat Detail
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              </Button>
                            </div>
                          </Popup>
                        </Marker>
                      ) : null
                    ))}

                    {/* Marker sementara untuk lokasi baru dengan animasi bounce */}
                    {newMarkerPosition && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <Marker
                          position={newMarkerPosition}
                          icon={getTempMarkerIcon()}
                        >
                          <Popup>
                            <div className="p-2">
                              <p className="font-semibold text-green-600 mb-1">Lokasi Baru</p>
                              <p className="text-xs text-slate-600">Lat: {newMarkerPosition[0].toFixed(6)}</p>
                              <p className="text-xs text-slate-600">Lng: {newMarkerPosition[1].toFixed(6)}</p>
                            </div>
                          </Popup>
                        </Marker>
                      </motion.div>
                    )}
                  </MapContainer>
                </div>
              </motion.div>

              {/* Form untuk menambah data keluarga baru dengan enhanced animations */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 300 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="lg:w-1/3 bg-gradient-to-br from-slate-50/50 to-cyan-50/30 border-t lg:border-t-0 lg:border-l border-gray-100/50"
                  >
                    <div className="p-8">
                      <motion.div
                        className="flex items-center space-x-3 mb-6"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div
                          className="w-2 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        />
                        <h4 className="text-lg font-medium text-slate-900">Tambah Data Keluarga</h4>
                      </motion.div>

                      <motion.form
                        onSubmit={handleSaveNewMarker}
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Label htmlFor="no_kk" className="text-sm font-medium text-slate-700">
                            No. Kartu Keluarga *
                          </Label>
                          <Input
                            id="no_kk"
                            type="text"
                            value={newMarkerData.no_kk}
                            onChange={(e) => handleInputChange('no_kk', e.target.value)}
                            placeholder="Masukkan nomor KK"
                            className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200"
                            required
                          />
                        </motion.div>

                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <Label htmlFor="nama_kepala_keluarga" className="text-sm font-medium text-slate-700">
                            Nama Kepala Keluarga *
                          </Label>
                          <Input
                            id="nama_kepala_keluarga"
                            type="text"
                            value={newMarkerData.nama_kepala_keluarga}
                            onChange={(e) => handleInputChange('nama_kepala_keluarga', e.target.value)}
                            placeholder="Masukkan nama kepala keluarga"
                            className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200"
                            required
                          />
                        </motion.div>

                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 }}
                        >
                          <Label htmlFor="alamat" className="text-sm font-medium text-slate-700">
                            Alamat *
                          </Label>
                          <Textarea
                            id="alamat"
                            value={newMarkerData.alamat}
                            onChange={(e) => handleInputChange('alamat', e.target.value)}
                            placeholder="Masukkan alamat lengkap"
                            className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 min-h-[80px] transition-all duration-200"
                            required
                          />
                        </motion.div>

                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                        >
                          <Label htmlFor="status_ekonomi" className="text-sm font-medium text-slate-700">
                            Status Ekonomi *
                          </Label>
                          <Select
                            value={newMarkerData.status_ekonomi}
                            onValueChange={(value) => handleInputChange('status_ekonomi', value)}
                          >
                            <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200">
                              <SelectValue placeholder="Pilih status ekonomi" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="miskin">Miskin</SelectItem>
                              <SelectItem value="sangat_miskin">Sangat Miskin</SelectItem>
                              <SelectItem value="rentan_miskin">Rentan Miskin</SelectItem>
                            </SelectContent>
                          </Select>
                        </motion.div>

                        <motion.div
                          className="grid grid-cols-2 gap-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 }}
                        >
                          <div className="space-y-2">
                            <Label htmlFor="latitude" className="text-sm font-medium text-slate-700">
                              Latitude
                            </Label>
                            <Input
                              id="latitude"
                              type="number"
                              step="any"
                              value={newMarkerData.latitude}
                              readOnly
                              className="bg-slate-50 text-slate-600 border-slate-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="longitude" className="text-sm font-medium text-slate-700">
                              Longitude
                            </Label>
                            <Input
                              id="longitude"
                              type="number"
                              step="any"
                              value={newMarkerData.longitude}
                              readOnly
                              className="bg-slate-50 text-slate-600 border-slate-200"
                            />
                          </div>
                        </motion.div>

                        <motion.div
                          className="flex space-x-3 pt-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 }}
                        >
                          <motion.div
                            className="flex-1"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              type="submit"
                              disabled={isSaving}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              {isSaving ? (
                                <>
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <Loader2 className="w-4 h-4 mr-2" />
                                  </motion.div>
                                  Menyimpan...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  Simpan Data
                                </>
                              )}
                            </Button>
                          </motion.div>
                          <motion.div
                            className="flex-1"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              type="button"
                              onClick={handleCancelAddMarker}
                              variant="outline"
                              className="w-full border-slate-300 hover:bg-slate-50 transition-all duration-200"
                            >
                              Batal
                            </Button>
                          </motion.div>
                        </motion.div>
                      </motion.form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Custom CSS untuk popup dengan tema aquatic */}
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
    </AuthenticatedLayout>
  );
}
