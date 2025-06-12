import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { useToast } from '@/Hooks/use-toast';
import DeleteConfirmationDialog from '@/Components/DeleteConfirmationDialog';
import {
  User,
  Edit,
  ArrowLeft,
  Trash2,
  MapPin,
  ExternalLink,
  Users,
  Home,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Waves,
  UserCheck,
  UserX,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Navigation,
  HandHeart
} from 'lucide-react';

interface AnggotaKeluarga {
  id: number;
  nik: string;
  nama: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  status_dalam_keluarga: string;
  status_perkawinan: string;
  pendidikan_terakhir: string;
  pekerjaan: string;
}

interface Wilayah {
  id: number;
  nama: string;
  keterangan: string;
}

interface Jarak {
  id: number;
  nama: string;
  panjang: number;
}

interface Keluarga {
  id: number;
  no_kk: string;
  nama_kepala_keluarga: string;
  alamat: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  kode_pos?: string;
  status_ekonomi: string;
  penghasilan_bulanan?: number;
  keterangan?: string;
  latitude?: number | string;
  longitude?: number | string;
  jumlah_anggota?: number;
  status_verifikasi?: string;
  anggota_keluarga?: AnggotaKeluarga[];
  wilayah?: Wilayah[];
  jarak?: Jarak[];
  // Tambahan untuk PKH
  status_bantuan?: 'sudah_terima' | 'belum_terima' | null;
  tahun_bantuan?: number;
  nominal_bantuan?: number;
  bulan_terakhir_distribusi?: number;
}

interface ShowProps extends PageProps {
  keluarga?: Keluarga;
}

export default function Show({ auth, keluarga }: ShowProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Early return jika keluarga tidak tersedia
  if (!keluarga) {
    return (
      <AuthenticatedLayout user={auth.user}>
        <Head title="Data Tidak Ditemukan" />
        <motion.div
          className="min-h-screen flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md max-w-md w-full">
            <CardContent className="p-8 text-center">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Data Tidak Ditemukan</h2>
              <p className="text-slate-600 mb-6">Data keluarga yang Anda cari tidak tersedia atau telah dihapus.</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white">
                  <Link href={route('admin.keluarga.index')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Daftar
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </AuthenticatedLayout>
    );
  }

  // Safe arrays dengan defensive checking
  const safeAnggotaKeluarga = Array.isArray(keluarga.anggota_keluarga) ? keluarga.anggota_keluarga : [];
  const safeWilayah = Array.isArray(keluarga.wilayah) ? keluarga.wilayah : [];
  const safeJarak = Array.isArray(keluarga.jarak) ? keluarga.jarak : [];

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

  // FIX: Breadcrumb dengan route yang benar
  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Data Keluarga', href: route('admin.keluarga.index') },
    { label: keluarga.nama_kepala_keluarga || 'Detail', current: true }
  ];

  // Utility functions dengan safe checking
  const formatCoordinate = (value: any): string => {
    if (value === null || value === undefined) return '-';

    const num = Number(value);
    if (isNaN(num)) return '-';

    return num.toFixed(6);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount || isNaN(amount)) return 'Belum diatur';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';

    if (dateString.includes('T')) {
      const dateOnly = dateString.split('T')[0];
      const [year, month, day] = dateOnly.split('-');
      return `${day}/${month}/${year}`;
    }

    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'sangat_miskin':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'miskin':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'rentan_miskin':
        return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
      case 'kurang_mampu':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'mampu':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sangat_miskin':
        return AlertTriangle;
      case 'miskin':
        return TrendingDown;
      case 'rentan_miskin':
        return CheckCircle;
      default:
        return CheckCircle;
    }
  };

  const getGenderLabel = (gender: string) => {
    return gender === 'L' ? 'Laki-laki' : 'Perempuan';
  };

  const formatStatusKeluarga = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatStatusEkonomi = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'sangat_miskin': 'Sangat Miskin',
      'miskin': 'Miskin',
      'rentan_miskin': 'Rentan Miskin',
      'kurang_mampu': 'Kurang Mampu',
      'mampu': 'Mampu'
    };
    return statusMap[status] || status;
  };

  const getStatusBantuanColor = (status?: string | null) => {
    switch (status) {
      case 'sudah_terima':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'belum_terima':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatStatusBantuan = (status?: string | null) => {
    switch (status) {
      case 'sudah_terima':
        return 'Sudah Terima';
      case 'belum_terima':
        return 'Belum Terima';
      default:
        return 'Tidak Diketahui';
    }
  };

  const hasValidCoordinates = (): boolean => {
    const lat = Number(keluarga.latitude);
    const lng = Number(keluarga.longitude);
    return !isNaN(lat) && !isNaN(lng);
  };

  const openGoogleMaps = () => {
    const lat = Number(keluarga.latitude);
    const lng = Number(keluarga.longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    } else {
      toast({
        title: "Koordinat Tidak Valid",
        description: "Koordinat tidak tersedia atau tidak valid untuk dibuka di Google Maps.",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  // FIX: Handle delete dengan route yang benar
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      await router.delete(route('admin.keluarga.destroy', keluarga.id), {
        preserveScroll: true,
        onStart: () => {
          toast({
            title: "Menghapus Data",
            description: "Sedang menghapus data keluarga...",
            variant: "default",
          });
        },
        onSuccess: () => {
          toast({
            title: "Data Berhasil Dihapus! 🗑️",
            description: `Data keluarga ${keluarga.nama_kepala_keluarga} telah berhasil dihapus.`,
            variant: "default",
          });

          router.visit(route('admin.keluarga.index'));
        },
        onError: (errors) => {
          console.error('Delete error:', errors);
          toast({
            title: "Gagal Menghapus Data",
            description: "Terjadi kesalahan saat menghapus data. Silakan coba lagi.",
            variant: "destructive",
          });
        },
        onFinish: () => {
          setIsDeleting(false);
          setDeleteDialogOpen(false);
        }
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Gagal Menghapus Data",
        description: "Terjadi kesalahan saat menghapus data. Silakan coba lagi.",
        variant: "destructive",
      });
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setIsDeleting(false);
  };

  return (
    <AuthenticatedLayout user={auth.user} breadcrumbs={breadcrumbs}>
      <Head title={`Detail Keluarga - ${keluarga.nama_kepala_keluarga}`} />

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
              <User className="w-8 h-8 text-teal-600" />
              <div>
                <h1 className="font-semibold text-3xl text-slate-800 tracking-wide">Detail Keluarga PKH</h1>
                <p className="text-slate-600 mt-1">{keluarga.nama_kepala_keluarga}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild variant="outline" className="border-slate-300 hover:bg-slate-50">
                <Link href={route('admin.keluarga.index')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                {/* FIX: Route yang benar */}
                <Link href={route('admin.keluarga.edit', keluarga.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Data
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={handleDeleteClick}>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Header Card dengan Status PKH */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-r from-cyan-50/50 to-teal-50/50 border-b border-gray-100/50">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Home className="w-10 h-10 text-cyan-600" />
                </motion.div>
                <div className="flex-1">
                  <CardTitle className="text-2xl font-medium text-slate-800">
                    {keluarga.nama_kepala_keluarga}
                  </CardTitle>
                  <CardDescription className="mt-2 font-mono text-lg">
                    {keluarga.no_kk}
                  </CardDescription>
                  <div className="flex items-center space-x-3 mt-3">
                    <Badge variant="secondary" className={`${getStatusBadgeColor(keluarga.status_ekonomi)} flex items-center space-x-1`}>
                      {React.createElement(getStatusIcon(keluarga.status_ekonomi), { className: "w-3 h-3" })}
                      <span>{formatStatusEkonomi(keluarga.status_ekonomi)}</span>
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-800">
                      {keluarga.jumlah_anggota || safeAnggotaKeluarga.length} Anggota
                    </Badge>
                    {/* Badge Status Bantuan PKH */}
                    <Badge variant="secondary" className={getStatusBantuanColor(keluarga.status_bantuan)}>
                      <HandHeart className="w-3 h-3 mr-1" />
                      {formatStatusBantuan(keluarga.status_bantuan)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Basic Information */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-cyan-50/50 border-b border-gray-100/50">
                <CardTitle className="text-lg font-medium text-slate-800 flex items-center space-x-2">
                  <Home className="w-5 h-5 text-teal-600" />
                  <span>Informasi Alamat</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Alamat Lengkap</label>
                      <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{keluarga.alamat}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">RT</label>
                        <p className="text-slate-800 bg-slate-50 p-3 rounded-lg text-center">{keluarga.rt || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">RW</label>
                        <p className="text-slate-800 bg-slate-50 p-3 rounded-lg text-center">{keluarga.rw || '—'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Kelurahan</label>
                      <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{keluarga.kelurahan || '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Kecamatan</label>
                      <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{keluarga.kecamatan || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Kota/Kabupaten</label>
                      <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{keluarga.kota || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Provinsi</label>
                      <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{keluarga.provinsi || '—'}</p>
                    </div>
                    {keluarga.kode_pos && (
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Kode Pos</label>
                        <p className="text-slate-800 bg-slate-50 p-3 rounded-lg text-center font-mono">{keluarga.kode_pos}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Side Information */}
          <motion.div className="space-y-6" variants={itemVariants}>
            {/* Financial Info */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-slate-800 flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>Informasi Finansial</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Penghasilan Bulanan</label>
                  <p className="text-2xl font-semibold text-emerald-600">
                    {formatCurrency(keluarga.penghasilan_bulanan)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Informasi Bantuan PKH */}
            {keluarga.status_bantuan === 'sudah_terima' && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-slate-800 flex items-center space-x-2">
                    <HandHeart className="w-5 h-5 text-green-600" />
                    <span>Bantuan PKH</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Status Bantuan</label>
                    <Badge className="bg-green-100 text-green-800 border border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Sudah Menerima
                    </Badge>
                  </div>
                  {keluarga.nominal_bantuan && (
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Nominal per Bulan</label>
                      <p className="text-xl font-semibold text-green-600">
                        {formatCurrency(keluarga.nominal_bantuan)}
                      </p>
                    </div>
                  )}
                  {keluarga.tahun_bantuan && (
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Tahun Bantuan</label>
                      <p className="text-slate-800">{keluarga.tahun_bantuan}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Location Info */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-slate-800 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-cyan-600" />
                  <span>Lokasi Koordinat</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Koordinat</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-mono text-slate-800 bg-slate-50 p-2 rounded flex-1">
                        {keluarga.latitude && keluarga.longitude
                          ? `${formatCoordinate(keluarga.latitude)}, ${formatCoordinate(keluarga.longitude)}`
                          : 'Belum diatur'
                        }
                      </p>
                      {hasValidCoordinates() && (
                        <motion.button
                          onClick={openGoogleMaps}
                          className="p-2 text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 rounded transition-colors"
                          title="Buka di Google Maps"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            {keluarga.keterangan && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-slate-800">Keterangan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg">{keluarga.keterangan}</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Family Members */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-cyan-50/50 border-b border-gray-100/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium text-slate-800 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  <span>Anggota Keluarga</span>
                </CardTitle>
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                  {safeAnggotaKeluarga.length} Orang
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {safeAnggotaKeluarga.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-50 to-cyan-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">NIK</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Nama</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Jenis Kelamin</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">TTL</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Status</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Pendidikan</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Pekerjaan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-slate-100">
                      <AnimatePresence>
                        {safeAnggotaKeluarga.map((anggota, index) => (
                          <motion.tr
                            key={anggota.id}
                            className="hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-teal-50/30 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.01 }}
                          >
                            <td className="py-4 px-6">
                              <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                {anggota.nik}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm font-medium text-slate-900">{anggota.nama}</td>
                            <td className="py-4 px-6">
                              <Badge variant="secondary" className={`text-xs ${
                                anggota.jenis_kelamin === 'L'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-pink-100 text-pink-800 border border-pink-200'
                              }`}>
                                {anggota.jenis_kelamin === 'L' ? (
                                  <><UserCheck className="w-3 h-3 mr-1" />{getGenderLabel(anggota.jenis_kelamin)}</>
                                ) : (
                                  <><UserX className="w-3 h-3 mr-1" />{getGenderLabel(anggota.jenis_kelamin)}</>
                                )}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-600">
                              <div>
                                <div>{anggota.tempat_lahir}</div>
                                <div className="text-xs text-slate-500">{formatDate(anggota.tanggal_lahir)}</div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs">
                                {formatStatusKeluarga(anggota.status_dalam_keluarga)}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-600">{anggota.pendidikan_terakhir || '—'}</td>
                            <td className="py-4 px-6 text-sm text-slate-600">{anggota.pekerjaan || '—'}</td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-16 text-center">
                  <motion.div
                    className="flex flex-col items-center justify-center space-y-4"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                  >
                    <motion.div
                      className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Users className="w-10 h-10 text-cyan-400" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-slate-500 font-medium text-lg">Belum ada data anggota keluarga</p>
                      <p className="text-slate-400 text-sm mt-1">Tambahkan melalui halaman edit keluarga</p>
                    </div>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Geospatial Data */}
        {(safeWilayah.length > 0 || safeJarak.length > 0) && (
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-cyan-50/50 border-b border-gray-100/50">
                <CardTitle className="text-lg font-medium text-slate-800 flex items-center space-x-2">
                  <Navigation className="w-5 h-5 text-teal-600" />
                  <span>Data Geospasial</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Wilayah */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                      Wilayah
                    </h4>
                    {safeWilayah.length > 0 ? (
                      <div className="space-y-3">
                        {safeWilayah.map((wilayah, index) => (
                          <motion.div
                            key={wilayah.id}
                            className="bg-cyan-50 border border-cyan-200 rounded-lg p-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className="font-medium text-cyan-900 text-sm">{wilayah.nama}</p>
                            {wilayah.keterangan && (
                              <p className="text-xs text-cyan-700 mt-1">{wilayah.keterangan}</p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">Tidak ada data wilayah</p>
                    )}
                  </div>

                  {/* Jarak */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
                      <div className="w-3 h-3 bg-teal-400 rounded-full mr-3"></div>
                      Jarak
                    </h4>
                    {safeJarak.length > 0 ? (
                      <div className="space-y-3">
                        {safeJarak.map((jarak, index) => (
                          <motion.div
                            key={jarak.id}
                            className="bg-teal-50 border border-teal-200 rounded-lg p-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className="font-medium text-teal-900 text-sm">{jarak.nama}</p>
                            <p className="text-xs text-teal-700 mt-1">
                              {(jarak.panjang / 1000).toFixed(2)} km
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">Tidak ada data jarak</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Keluarga PKH"
        description="Apakah Anda yakin ingin menghapus data keluarga ini? Semua data anggota keluarga juga akan ikut terhapus. Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi data bantuan terkait."
        itemName={keluarga.nama_kepala_keluarga}
        isDeleting={isDeleting}
      />
    </AuthenticatedLayout>
  );
}
