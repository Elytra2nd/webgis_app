import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { useToast } from '@/Hooks/use-toast';
import DeleteConfirmationDialog from '@/Components/DeleteConfirmationDialog';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  ExternalLink,
  Waves,
  Home,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

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
  penghasilan_bulanan?: string;
  keterangan?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  lokasi?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface PaginatedKeluarga {
  data: Keluarga[];
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

interface IndexProps extends PageProps {
  keluarga?: PaginatedKeluarga;
  filters?: {
    search?: string;
    status?: string;
  };
  stats?: {
    total: number;
    sangat_miskin: number;
    miskin: number;
    rentan_miskin: number;
  };
}

export default function Index({ auth, keluarga, filters = {}, stats }: IndexProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [filteredData, setFilteredData] = useState<Keluarga[]>(keluarga?.data || []);
  const [isFiltering, setIsFiltering] = useState(false);

  // Delete states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKeluarga, setSelectedKeluarga] = useState<Keluarga | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

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

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 }
    }
  };

  // Breadcrumb
  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Data Keluarga', current: true }
  ];

  // Utility functions untuk validasi data
  const isValidCoordinate = (value: any): value is number => {
    if (typeof value === 'number') {
      return !isNaN(value) && isFinite(value);
    }
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return !isNaN(num) && isFinite(num);
    }
    return false;
  };

  const isValidLokasiString = (value: any): value is string => {
    return typeof value === 'string' &&
           value.trim().length > 0 &&
           value.includes(',') &&
           value.split(',').length === 2;
  };

  const parseLokasiString = (lokasi: string): { lat: number; lng: number } | null => {
    try {
      const coords = lokasi.split(',');
      if (coords.length === 2) {
        const lat = parseFloat(coords[0].trim());
        const lng = parseFloat(coords[1].trim());

        if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
          return { lat, lng };
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  // Filter function dengan animasi
  const applyFilters = () => {
    if (!keluarga?.data) return;

    setIsFiltering(true);

    let filtered = keluarga.data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nama_kepala_keluarga.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.no_kk.includes(searchTerm) ||
        item.alamat.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status_ekonomi === statusFilter);
    }

    // Simulate loading untuk animasi
    setTimeout(() => {
      setFilteredData(filtered);
      setIsFiltering(false);

      // Show toast notification
      const activeFilters = [];
      if (searchTerm) activeFilters.push(`pencarian: "${searchTerm}"`);
      if (statusFilter !== 'all') activeFilters.push(`status: ${formatStatusEkonomi(statusFilter)}`);

      if (activeFilters.length > 0) {
        toast({
          title: "Filter Diterapkan",
          description: `Menampilkan ${filtered.length} hasil dengan filter: ${activeFilters.join(', ')}`,
          variant: "default",
        });
      }
    }, 300);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setFilteredData(keluarga?.data || []);

    toast({
      title: "Filter Dibersihkan",
      description: "Semua filter telah dihapus",
      variant: "default",
    });
  };

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, keluarga?.data]);

  // Handle delete
  const handleDeleteClick = (item: Keluarga) => {
    setSelectedKeluarga(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedKeluarga) return;

    setIsDeleting(true);

    try {
      await router.delete(route('keluarga.destroy', selectedKeluarga.id), {
        preserveScroll: true,
        onStart: () => {
          toast({
            title: "Menghapus Data",
            description: "Sedang menghapus data keluarga...",
            variant: "default",
          });
        },
        onSuccess: () => {
          // Update filtered data
          setFilteredData(prev => prev.filter(item => item.id !== selectedKeluarga.id));

          toast({
            title: "Data Berhasil Dihapus! 🗑️",
            description: `Data keluarga ${selectedKeluarga.nama_kepala_keluarga} telah berhasil dihapus.`,
            variant: "default",
          });

          handleDeleteCancel();
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
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedKeluarga(null);
    setIsDeleting(false);
  };

  // Early return jika data tidak tersedia
  if (!keluarga || !keluarga.data || !keluarga.meta) {
    return (
      <AuthenticatedLayout user={auth.user} breadcrumbs={breadcrumbs}>
        <Head title="Data Keluarga" />
        <motion.div
          className="min-h-screen flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md max-w-md w-full">
            <CardContent className="p-8 text-center">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Users className="w-10 h-10 text-cyan-500" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Memuat Data Keluarga</h2>
              <p className="text-slate-600 mb-6">Mohon tunggu sebentar...</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white">
                  <Link href={route('admin.keluarga.create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Keluarga
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </AuthenticatedLayout>
    );
  }

  const formatStatusEkonomi = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'sangat_miskin': 'Sangat Miskin',
      'miskin': 'Miskin',
      'rentan_miskin': 'Rentan Miskin'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sangat_miskin':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'miskin':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'rentan_miskin':
        return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatCoordinates = (lat?: number | string | null, lng?: number | string | null, lokasi?: string | null) => {
    // Prioritas 1: Gunakan latitude dan longitude jika valid
    if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
      const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
      const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
      return `${latNum.toFixed(6)}, ${lngNum.toFixed(6)}`;
    }

    // Prioritas 2: Gunakan lokasi string jika valid
    if (isValidLokasiString(lokasi)) {
      const parsed = parseLokasiString(lokasi);
      if (parsed) {
        return `${parsed.lat.toFixed(6)}, ${parsed.lng.toFixed(6)}`;
      }
      return lokasi;
    }

    return 'Belum diatur';
  };

  const openGoogleMaps = (lat?: number | string | null, lng?: number | string | null, lokasi?: string | null) => {
    // Prioritas 1: Gunakan koordinat langsung
    if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
      const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
      const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
      window.open(`https://www.google.com/maps?q=${latNum},${lngNum}`, '_blank');
      return;
    }

    // Prioritas 2: Parse dari lokasi string
    if (isValidLokasiString(lokasi)) {
      const coords = parseLokasiString(lokasi);
      if (coords) {
        window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank');
      }
    }
  };

  const hasValidCoordinates = (item: Keluarga): boolean => {
    const hasLatLng = isValidCoordinate(item.latitude) && isValidCoordinate(item.longitude);
    const hasLokasi = isValidLokasiString(item.lokasi);
    return hasLatLng || hasLokasi;
  };

  // Safe statistics calculation
  const getStatusStats = () => {
    if (stats) return stats;

    const safeData = filteredData || [];
    return {
      total: safeData.length,
      sangat_miskin: safeData.filter(k => k?.status_ekonomi === 'sangat_miskin').length,
      miskin: safeData.filter(k => k?.status_ekonomi === 'miskin').length,
      rentan_miskin: safeData.filter(k => k?.status_ekonomi === 'rentan_miskin').length,
    };
  };

  const statsData = getStatusStats();
  const hasActiveFilters = searchTerm || statusFilter !== 'all';

  return (
    <AuthenticatedLayout user={auth.user} breadcrumbs={breadcrumbs}>
      <Head title="Data Keluarga" />

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
            <Home className="w-8 h-8 text-teal-600" />
            <h1 className="font-semibold text-3xl text-slate-800 tracking-wide">Data Keluarga</h1>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={itemVariants}
        >
          {[
            { label: 'Total Keluarga', value: statsData.total, icon: Users, color: 'font-semibold text-cyan-600', bg: 'bg-cyan-50' },
            { label: 'Sangat Miskin', value: statsData.sangat_miskin, icon: AlertTriangle, color: 'font-semibold text-red-600', bg: 'bg-red-50' },
            { label: 'Miskin', value: statsData.miskin, icon: TrendingDown, color: 'font-semibold text-amber-600', bg: 'bg-amber-50' },
            { label: 'Rentan Miskin', value: statsData.rentan_miskin, icon: CheckCircle, color: 'font-semibold text-cyan-600', bg: 'bg-cyan-50' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
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
                      <p className="text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
                      <motion.p
                        className={`text-3xl font-light ${stat.color}`}
                        key={stat.value}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        {stat.value.toLocaleString()}
                      </motion.p>
                    </div>
                    <motion.div
                      className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}
                      whileHover={{ rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
            {/* Header */}
            <CardHeader className="pb-6 bg-gradient-to-r from-cyan-50/50 to-teal-50/50 border-b border-gray-100/50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <CardTitle className="text-xl font-medium text-slate-800 flex items-center space-x-2">
                    <Waves className="w-5 h-5 text-teal-600" />
                    <span>Daftar Keluarga</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Menampilkan {keluarga.meta?.from || 0} - {keluarga.meta?.to || 0} dari {keluarga.meta?.total || 0} keluarga terdaftar
                  </CardDescription>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Link href={route('admin.keluarga.create')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Keluarga
                    </Link>
                  </Button>
                </motion.div>
              </div>

              {/* Filters */}
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                    <Input
                      placeholder="Cari keluarga..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 h-10"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 h-10">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="sangat_miskin">Sangat Miskin</SelectItem>
                        <SelectItem value="miskin">Miskin</SelectItem>
                        <SelectItem value="rentan_miskin">Rentan Miskin</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <div></div>
                </div>

                {/* Active Filters Display */}
                <AnimatePresence>
                  {hasActiveFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between bg-cyan-50 rounded-lg p-3 border border-cyan-200"
                    >
                      <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <Filter className="w-4 h-4 text-cyan-600" />
                        <span className="text-sm font-medium text-cyan-700">Filter aktif:</span>
                        {searchTerm && (
                          <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                            Pencarian: "{searchTerm}"
                          </Badge>
                        )}
                        {statusFilter !== 'all' && (
                          <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                            {formatStatusEkonomi(statusFilter)}
                          </Badge>
                        )}
                      </div>
                      <motion.button
                        onClick={clearFilters}
                        className="text-cyan-600 hover:text-cyan-800 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardHeader>

            {/* Table */}
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-cyan-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">No. KK</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Kepala Keluarga</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Alamat</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status Ekonomi</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Koordinat</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 backdrop-blur-sm">
                    <AnimatePresence mode="wait">
                      {isFiltering ? (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td colSpan={6} className="text-center py-16">
                            <div className="flex flex-col items-center justify-center space-y-4">
                              <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
                              <p className="text-slate-500 font-medium">Memfilter data...</p>
                            </div>
                          </td>
                        </motion.tr>
                      ) : filteredData.length > 0 ? (
                        filteredData.map((item, index) => (
                          <motion.tr
                            key={item.id}
                            className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-teal-50/30 transition-all duration-300"
                            variants={tableRowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            layout
                          >
                            <td className="px-6 py-4">
                              <span className="text-sm font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                {item.no_kk}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-slate-900">{item.nama_kepala_keluarga}</div>
                                {item.rt && item.rw && (
                                  <div className="text-xs text-slate-500">RT {item.rt} / RW {item.rw}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="max-w-xs">
                                <div className="text-sm text-slate-900 truncate">{item.alamat}</div>
                                {item.kelurahan && (
                                  <div className="text-xs text-slate-500 truncate">
                                    {item.kelurahan}, {item.kecamatan}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="secondary" className={`text-xs ${getStatusColor(item.status_ekonomi)}`}>
                                {formatStatusEkonomi(item.status_ekonomi)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono text-slate-600">
                                  {formatCoordinates(item.latitude, item.longitude, item.lokasi)}
                                </span>
                                {hasValidCoordinates(item) && (
                                  <motion.button
                                    onClick={() => openGoogleMaps(item.latitude, item.longitude, item.lokasi)}
                                    className="text-cyan-600 hover:text-cyan-800 transition-colors duration-200"
                                    title="Lihat di Google Maps"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </motion.button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center space-x-1">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button asChild size="sm" variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 text-xs px-2 py-1">
                                    <Link href={route('admin.keluarga.show', item.id)}>
                                      <Eye className="w-3 h-3" />
                                    </Link>
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button asChild size="sm" variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50 text-xs px-2 py-1">
                                    <Link href={route('admin.keluarga.edit', item.id)}>
                                      <Edit className="w-3 h-3" />
                                    </Link>
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 text-red-700 hover:bg-red-50 text-xs px-2 py-1"
                                    onClick={() => handleDeleteClick(item)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </motion.div>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td colSpan={6} className="text-center py-16">
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
                                <Home className="w-10 h-10 text-cyan-400" />
                              </motion.div>
                              <div className="text-center">
                                <p className="text-slate-500 font-medium text-lg">
                                  {hasActiveFilters ? 'Tidak ada data yang sesuai dengan filter' : 'Belum ada data keluarga'}
                                </p>
                                <p className="text-slate-400 text-sm mt-1">
                                  {hasActiveFilters ? 'Coba ubah kriteria pencarian Anda' : 'Klik tombol "Tambah Keluarga" untuk menambahkan data baru'}
                                </p>
                              </div>
                            </motion.div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>

            {/* Pagination */}
            {filteredData.length > 0 && keluarga.links && (
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50/50 to-cyan-50/50 border-t border-gray-100/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Menampilkan {filteredData.length} dari {keluarga.meta?.total || 0} keluarga
                    {hasActiveFilters && <span className="text-cyan-600 font-medium"> (difilter)</span>}
                  </div>
                  <nav className="flex items-center space-x-2">
                    {keluarga.links.map((link, i) => {
                      if (link.label.includes('Previous')) {
                        return (
                          <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button asChild={!!link.url} variant="outline" size="sm" disabled={!link.url} className="border-slate-200 hover:bg-slate-50">
                              {link.url ? (
                                <Link href={link.url}>‹</Link>
                              ) : (
                                <span>‹</span>
                              )}
                            </Button>
                          </motion.div>
                        );
                      }
                      if (link.label.includes('Next')) {
                        return (
                          <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button asChild={!!link.url} variant="outline" size="sm" disabled={!link.url} className="border-slate-200 hover:bg-slate-50">
                              {link.url ? (
                                <Link href={link.url}>›</Link>
                              ) : (
                                <span>›</span>
                              )}
                            </Button>
                          </motion.div>
                        );
                      }
                      return (
                        <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button asChild={!!link.url} variant={link.active ? "default" : "outline"} size="sm" disabled={!link.url} className={link.active ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg" : "border-slate-200 hover:bg-slate-50"}>
                            {link.url ? (
                              <Link href={link.url}>{link.label}</Link>
                            ) : (
                              <span>{link.label}</span>
                            )}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </nav>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Keluarga"
        description="Apakah Anda yakin ingin menghapus data keluarga ini? Tindakan ini tidak dapat dibatalkan."
        itemName={selectedKeluarga?.nama_kepala_keluarga}
        isDeleting={isDeleting}
      />
    </AuthenticatedLayout>
  );
}
