import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MapDrawing from '@/Components/Map/MapDrawing';
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
  Home,
  Edit as EditIcon,
  ArrowLeft,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Users,
  MapPin,
  DollarSign,
  FileText,
  Waves,
  Navigation,
  RotateCcw,
  Eye,
  Map
} from 'lucide-react';

// Import data dari file terpisah
import {
  provinsiData,
  kotaData,
  getKotaByProvinsi,
  findProvinsiByNama,
  type Provinsi,
  type Kota
} from '@/data/provinsiKota';

// Interface untuk form data
type KeluargaFormData = {
    no_kk: string;
    nama_kepala_keluarga: string;
    alamat: string;
    rt: string;
    rw: string;
    kelurahan: string;
    kecamatan: string;
    kota: string;
    provinsi: string;
    kode_pos: string;
    latitude: string;
    longitude: string;
    status_ekonomi: string;
    penghasilan_bulanan: string;
    keterangan: string;
};

interface Keluarga {
  id: number;
  no_kk: string;
  nama_kepala_keluarga: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kode_pos: string;
  latitude: string;
  longitude: string;
  status_ekonomi: string;
  penghasilan_bulanan: string;
  keterangan: string;
  created_at: string;
  updated_at: string;
}

interface LocationData {
  lat: number;
  lng: number;
}

interface EditPageProps extends PageProps {
  keluarga: Keluarga;
}

export default function Edit({ auth, keluarga }: EditPageProps) {
  const { toast } = useToast();

  const { data, setData, put, processing, errors, reset, clearErrors, isDirty } = useForm<KeluargaFormData>({
    no_kk: keluarga?.no_kk || '',
    nama_kepala_keluarga: keluarga?.nama_kepala_keluarga || '',
    alamat: keluarga?.alamat || '',
    rt: keluarga?.rt || '',
    rw: keluarga?.rw || '',
    kelurahan: keluarga?.kelurahan || '',
    kecamatan: keluarga?.kecamatan || '',
    kota: keluarga?.kota || '',
    provinsi: keluarga?.provinsi || '',
    kode_pos: keluarga?.kode_pos || '',
    latitude: keluarga?.latitude || '',
    longitude: keluarga?.longitude || '',
    status_ekonomi: keluarga?.status_ekonomi || 'miskin',
    penghasilan_bulanan: keluarga?.penghasilan_bulanan || '',
    keterangan: keluarga?.keterangan || ''
  });

  // State untuk dependent dropdown
  const [selectedProvinsi, setSelectedProvinsi] = useState<Provinsi | null>(null);
  const [availableKota, setAvailableKota] = useState<Kota[]>([]);
  const [showMapSection, setShowMapSection] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [isFormUpdated, setIsFormUpdated] = useState<boolean>(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const waveVariants = {
    animate: {
      x: [0, -20, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  };

  // Breadcrumb
  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Data Keluarga', href: route('keluarga.index') },
    { label: 'Edit Data', current: true }
  ];

  // Set initial location dan provinsi jika ada
  useEffect(() => {
    if (keluarga?.latitude && keluarga?.longitude) {
      const lat = parseFloat(keluarga.latitude);
      const lng = parseFloat(keluarga.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCurrentLocation({ lat, lng });
      }
    }

    // Set initial provinsi dan kota
    if (keluarga?.provinsi) {
      const provinsi = findProvinsiByNama(keluarga.provinsi);
      setSelectedProvinsi(provinsi || null);

      if (provinsi) {
        const filteredKota = getKotaByProvinsi(provinsi.id);
        setAvailableKota(filteredKota);
      }
    }
  }, [keluarga]);

  // Handle perubahan provinsi
  const handleProvinsiChange = (provinsiNama: string) => {
    setData('provinsi', provinsiNama);
    setData('kota', ''); // Reset kota

    if (provinsiNama) {
      const provinsi = findProvinsiByNama(provinsiNama);
      setSelectedProvinsi(provinsi || null);

      if (provinsi) {
        const filteredKota = getKotaByProvinsi(provinsi.id);
        setAvailableKota(filteredKota);
      } else {
        setAvailableKota([]);
      }
    } else {
      setSelectedProvinsi(null);
      setAvailableKota([]);
    }
  };

  // Handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    put(route('keluarga.update', keluarga.id), {
      onStart: () => {
        toast({
          title: "Memproses Data",
          description: "Sedang memperbarui data keluarga...",
          variant: "default",
        });
      },
      onSuccess: () => {
        setIsFormUpdated(true);

        toast({
          title: "Data Berhasil Diperbarui! 🎉",
          description: `Data keluarga ${data.nama_kepala_keluarga} telah berhasil diperbarui.`,
          variant: "default",
        });

        setTimeout(() => {
          setIsFormUpdated(false);
        }, 3000);
      },
      onError: (errors) => {
        console.error('Error updating keluarga:', errors);
        const errorMessages = Object.values(errors).flat();
        toast({
          title: "Gagal Memperbarui Data",
          description: errorMessages.join(', '),
          variant: "destructive",
        });
      }
    });
  };

  // Handle koordinat dari peta
  const handleMapPointSaved = (point: LocationData) => {
    if (point && point.lat && point.lng) {
      const updatedData = {
        ...data,
        latitude: point.lat.toString(),
        longitude: point.lng.toString()
      };

      setData(updatedData);
      setCurrentLocation(point);

      put(route('keluarga.update', keluarga.id), {
        ...updatedData,
        onSuccess: () => {
          toast({
            title: "Koordinat Berhasil Diperbarui! 📍",
            description: "Lokasi keluarga telah berhasil ditentukan pada peta.",
            variant: "default",
          });
        },
        onError: (errors: any) => {
          console.error('Error updating coordinates:', errors);
          toast({
            title: "Gagal Menyimpan Koordinat",
            description: "Terjadi kesalahan saat menyimpan koordinat.",
            variant: "destructive",
          });
        }
      });
    }
  };

  // Handle perubahan input koordinat manual
  const handleCoordinateChange = (field: 'latitude' | 'longitude', value: string) => {
    setData(field, value);

    if (field === 'latitude' && data.longitude && !isNaN(parseFloat(value))) {
      setCurrentLocation({
        lat: parseFloat(value),
        lng: parseFloat(data.longitude)
      });
    } else if (field === 'longitude' && data.latitude && !isNaN(parseFloat(value))) {
      setCurrentLocation({
        lat: parseFloat(data.latitude),
        lng: parseFloat(value)
      });
    }
  };

  // Toggle tampilan peta
  const toggleMap = () => {
    setShowMap(!showMap);
    if (!showMap && !currentLocation) {
      setCurrentLocation({ lat: -2.548926, lng: 118.0148634 });
    }
  };

  // Toggle section peta
  const toggleMapSection = () => {
    setShowMapSection(!showMapSection);
  };

  const handleBackToList = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman ini?'
      );
      if (!confirmLeave) {
        return;
      }
    }
    router.visit(route('keluarga.index'));
  };

  const handleViewDetail = () => {
    router.visit(route('keluarga.show', keluarga.id));
  };

  // Reset form to original values
  const handleResetForm = () => {
    const confirmReset = window.confirm(
      'Apakah Anda yakin ingin mengembalikan semua perubahan ke data asli?'
    );

    if (confirmReset) {
      setData({
        no_kk: keluarga?.no_kk || '',
        nama_kepala_keluarga: keluarga?.nama_kepala_keluarga || '',
        alamat: keluarga?.alamat || '',
        rt: keluarga?.rt || '',
        rw: keluarga?.rw || '',
        kelurahan: keluarga?.kelurahan || '',
        kecamatan: keluarga?.kecamatan || '',
        kota: keluarga?.kota || '',
        provinsi: keluarga?.provinsi || '',
        kode_pos: keluarga?.kode_pos || '',
        latitude: keluarga?.latitude || '',
        longitude: keluarga?.longitude || '',
        status_ekonomi: keluarga?.status_ekonomi || 'miskin',
        penghasilan_bulanan: keluarga?.penghasilan_bulanan || '',
        keterangan: keluarga?.keterangan || ''
      });

      // Reset provinsi dan kota
      if (keluarga?.provinsi) {
        const provinsi = findProvinsiByNama(keluarga.provinsi);
        setSelectedProvinsi(provinsi || null);

        if (provinsi) {
          const filteredKota = getKotaByProvinsi(provinsi.id);
          setAvailableKota(filteredKota);
        }
      }

      if (keluarga?.latitude && keluarga?.longitude) {
        const lat = parseFloat(keluarga.latitude);
        const lng = parseFloat(keluarga.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          setCurrentLocation({ lat, lng });
        }
      } else {
        setCurrentLocation(null);
      }

      clearErrors();
    }
  };

  return (
    <AuthenticatedLayout user={auth.user} breadcrumbs={breadcrumbs}>
      <Head title={`Edit Data Keluarga - ${keluarga?.nama_kepala_keluarga}`} />

      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header dengan animasi wave */}
        <motion.div
          className="flex items-center justify-between mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-4">
            <motion.div
              className="relative"
              variants={waveVariants}
              animate="animate"
            >
              <div className="w-3 h-10 bg-gradient-to-b from-cyan-400 via-teal-500 to-blue-600 rounded-full shadow-lg"></div>
              <div className="absolute -top-1 -left-1 w-5 h-12 bg-gradient-to-b from-cyan-300/30 via-teal-400/30 to-blue-500/30 rounded-full blur-sm"></div>
            </motion.div>
            <div className="flex items-center space-x-3">
              <EditIcon className="w-8 h-8 text-teal-600" />
              <div>
                <h1 className="font-light text-3xl text-slate-800 tracking-wide">Edit Data Keluarga</h1>
                <p className="text-slate-600 mt-1">{keluarga?.nama_kepala_keluarga}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild variant="outline" className="border-slate-300 hover:bg-slate-50">
                <Link href={route('keluarga.index')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                <Link href={route('keluarga.show', keluarga.id)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Detail
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {isFormUpdated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Data keluarga berhasil diperbarui!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Info */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-slate-800">Informasi Keluarga</h3>
                  <p className="text-slate-600 font-mono text-sm">
                    KK: {keluarga?.no_kk} • {keluarga?.nama_kepala_keluarga}
                  </p>
                  <p className="text-xs text-slate-500">
                    Terakhir diperbarui: {new Date(keluarga?.updated_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {isDirty && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    Ada perubahan yang belum disimpan
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form Data Keluarga */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-r from-cyan-50/50 to-teal-50/50 border-b border-gray-100/50">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Home className="w-8 h-8 text-cyan-600" />
                </motion.div>
                <div>
                  <CardTitle className="text-xl font-medium text-slate-800">
                    Edit Data Keluarga
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Perbarui informasi keluarga dengan akurat
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Data KK Section */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Data Kartu Keluarga</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="no_kk" className="text-sm font-medium text-slate-700">
                        Nomor KK *
                      </Label>
                      <Input
                        id="no_kk"
                        value={data.no_kk}
                        onChange={(e) => setData('no_kk', e.target.value)}
                        placeholder="16 digit nomor KK"
                        maxLength={16}
                        className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                        required
                      />
                      {errors.no_kk && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errors.no_kk}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nama_kepala_keluarga" className="text-sm font-medium text-slate-700">
                        Nama Kepala Keluarga *
                      </Label>
                      <Input
                        id="nama_kepala_keluarga"
                        value={data.nama_kepala_keluarga}
                        onChange={(e) => setData('nama_kepala_keluarga', e.target.value)}
                        placeholder="Nama lengkap kepala keluarga"
                        className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                        required
                      />
                      {errors.nama_kepala_keluarga && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errors.nama_kepala_keluarga}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>

                <Separator />

                {/* Alamat Section dengan Enhanced Dropdown */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Alamat Lengkap</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Provinsi Dropdown */}
                    <div className="space-y-2">
                      <Label htmlFor="provinsi" className="text-sm font-medium text-slate-700">
                        Provinsi *
                      </Label>
                      <Select value={data.provinsi} onValueChange={handleProvinsiChange}>
                        <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20">
                          <SelectValue placeholder="Pilih Provinsi" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinsiData.map((provinsi) => (
                            <SelectItem key={provinsi.id} value={provinsi.nama}>
                              {provinsi.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.provinsi && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errors.provinsi}
                        </p>
                      )}
                    </div>

                    {/* Kota/Kabupaten Dropdown */}
                    <div className="space-y-2">
                      <Label htmlFor="kota" className="text-sm font-medium text-slate-700">
                        Kota/Kabupaten *
                      </Label>
                      <Select
                        value={data.kota}
                        onValueChange={(value) => setData('kota', value)}
                        disabled={!selectedProvinsi}
                      >
                        <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20">
                          <SelectValue placeholder={
                            selectedProvinsi ? 'Pilih Kota/Kabupaten' : 'Pilih Provinsi Terlebih Dahulu'
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {availableKota.map((kota) => (
                            <SelectItem key={kota.id} value={kota.nama}>
                              {kota.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.kota && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errors.kota}
                        </p>
                      )}
                    </div>

                    {/* Rest of address fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="kecamatan" className="text-sm font-medium text-slate-700">
                          Kecamatan *
                        </Label>
                        <Input
                          id="kecamatan"
                          value={data.kecamatan}
                          onChange={(e) => setData('kecamatan', e.target.value)}
                          placeholder="Nama kecamatan"
                          className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                          required
                        />
                        {errors.kecamatan && (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {errors.kecamatan}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="kelurahan" className="text-sm font-medium text-slate-700">
                          Kelurahan/Desa *
                        </Label>
                        <Input
                          id="kelurahan"
                          value={data.kelurahan}
                          onChange={(e) => setData('kelurahan', e.target.value)}
                          placeholder="Nama kelurahan/desa"
                          className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                          required
                        />
                        {errors.kelurahan && (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {errors.kelurahan}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alamat" className="text-sm font-medium text-slate-700">
                        Alamat (Jalan dan Nomor) *
                      </Label>
                      <Textarea
                        id="alamat"
                        rows={3}
                        value={data.alamat}
                        onChange={(e) => setData('alamat', e.target.value)}
                        placeholder="Nama jalan, nomor rumah, gang, dll"
                        className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                        required
                      />
                      {errors.alamat && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errors.alamat}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="rt" className="text-sm font-medium text-slate-700">
                          RT
                        </Label>
                        <Input
                          id="rt"
                          value={data.rt}
                          onChange={(e) => setData('rt', e.target.value)}
                          placeholder="001"
                          className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                        />
                        {errors.rt && (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {errors.rt}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rw" className="text-sm font-medium text-slate-700">
                          RW
                        </Label>
                        <Input
                          id="rw"
                          value={data.rw}
                          onChange={(e) => setData('rw', e.target.value)}
                          placeholder="001"
                          className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                        />
                        {errors.rw && (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {errors.rw}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="kode_pos" className="text-sm font-medium text-slate-700">
                          Kode Pos
                        </Label>
                        <Input
                          id="kode_pos"
                          value={data.kode_pos}
                          onChange={(e) => setData('kode_pos', e.target.value)}
                          placeholder="12345"
                          className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                        />
                        {errors.kode_pos && (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {errors.kode_pos}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <Separator />

                {/* Status Ekonomi Section */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <DollarSign className="w-5 h-5 text-teal-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Status Ekonomi</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="status_ekonomi" className="text-sm font-medium text-slate-700">
                        Status Ekonomi *
                      </Label>
                      <Select
                        value={data.status_ekonomi}
                        onValueChange={(value) => setData('status_ekonomi', value)}
                      >
                        <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20">
                          <SelectValue placeholder="Pilih Status Ekonomi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sangat_miskin">Sangat Miskin</SelectItem>
                          <SelectItem value="miskin">Miskin</SelectItem>
                          <SelectItem value="rentan_miskin">Rentan Miskin</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status_ekonomi && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errors.status_ekonomi}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="penghasilan_bulanan" className="text-sm font-medium text-slate-700">
                        Penghasilan Bulanan (Rp)
                      </Label>
                      <Input
                        id="penghasilan_bulanan"
                        type="number"
                        value={data.penghasilan_bulanan}
                        onChange={(e) => setData('penghasilan_bulanan', e.target.value)}
                        placeholder="0"
                        min="0"
                        className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                      />
                      {errors.penghasilan_bulanan && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errors.penghasilan_bulanan}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keterangan" className="text-sm font-medium text-slate-700">
                      Keterangan
                    </Label>
                    <Textarea
                      id="keterangan"
                      rows={3}
                      value={data.keterangan}
                      onChange={(e) => setData('keterangan', e.target.value)}
                      placeholder="Keterangan tambahan (opsional)"
                      className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                    />
                    {errors.keterangan && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {errors.keterangan}
                      </p>
                    )}
                  </div>
                </motion.div>

                <Separator />

                {/* Lokasi Section */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Navigation className="w-5 h-5 text-teal-600" />
                      <h3 className="text-lg font-semibold text-slate-800">Lokasi Geografis</h3>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="button"
                        onClick={toggleMapSection}
                        variant="outline"
                        className="border-violet-200 text-violet-700 hover:bg-violet-50"
                      >
                        <Map className="w-4 h-4 mr-2" />
                        {showMapSection ? 'Sembunyikan Peta' : 'Tampilkan Peta'}
                      </Button>
                    </motion.div>
                  </div>

                  {/* Koordinat Manual */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-sm font-medium text-slate-700">
                        Latitude
                      </Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={data.latitude}
                        onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                        placeholder="-6.200000"
                        className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                      />
                      {errors.latitude && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errors.latitude}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-sm font-medium text-slate-700">
                        Longitude
                      </Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={data.longitude}
                        onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                        placeholder="106.816666"
                        className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                      />
                      {errors.longitude && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errors.longitude}
                        </p>
                      )}
                    </div>

                    <div className="flex items-end">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                        <Button
                          type="button"
                          onClick={toggleMap}
                          variant="outline"
                          className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          {showMap ? 'Sembunyikan' : 'Tampilkan'} Peta
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  {/* Status Koordinat */}
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Status Koordinat:</p>
                        {data.latitude && data.longitude ? (
                          <p className="text-sm text-emerald-600 flex items-center mt-1">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Tersedia - Lat: {data.latitude}, Lng: {data.longitude}
                          </p>
                        ) : (
                          <p className="text-sm text-amber-600 flex items-center mt-1">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Belum ditentukan - Klik pada peta untuk menentukan lokasi
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Peta Inline */}
                  <AnimatePresence>
                    {showMap && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border border-violet-200 rounded-lg overflow-hidden"
                        style={{ height: '400px' }}
                      >
                        <MapDrawing
                          onSave={handleMapPointSaved}
                          keluargaId={keluarga.id}
                          initialLat={currentLocation?.lat || -2.548926}
                          initialLng={currentLocation?.lng || 118.0148634}
                          existingMarker={currentLocation}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Submit Buttons */}
                <motion.div
                  className="flex items-center justify-between pt-8 border-t border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="button"
                      onClick={handleResetForm}
                      variant="outline"
                      className="border-slate-300 hover:bg-slate-50"
                      disabled={processing}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset ke Data Asli
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      disabled={processing}
                      className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Peta Terpisah */}
        <AnimatePresence>
          {showMapSection && (
            <motion.div
              id="map-section"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
                <CardHeader className="pb-6 bg-gradient-to-r from-violet-50/50 to-purple-50/50 border-b border-gray-100/50">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Navigation className="w-8 h-8 text-violet-600" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl font-medium text-slate-800">
                        Peta Lokasi Keluarga
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Klik pada peta untuk menentukan atau memperbarui koordinat lokasi keluarga
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  <div className="border border-violet-200 rounded-xl overflow-hidden shadow-inner" style={{ height: '500px' }}>
                    <MapDrawing
                      keluargaId={keluarga.id}
                      onSave={handleMapPointSaved}
                      initialLat={currentLocation?.lat || -2.548926}
                      initialLng={currentLocation?.lng || 118.0148634}
                      existingMarker={currentLocation}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AuthenticatedLayout>
  );
}
