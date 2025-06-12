import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import ExportModal from '@/Components/ExportModal';
import { useExportModal } from '@/Hooks/useExportModal';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Map, Globe, Filter, Download, ExternalLink, Building2 } from 'lucide-react';

interface Keluarga {
  id: number;
  no_kk: string;
  nama_keluarga: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
  rt?: string;
  rw?: string;
  status_ekonomi: string;
  lokasi?: string;
  alamat?: string;
  created_at: string;
  updated_at: string;
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

interface WilayahProps extends PageProps {
  keluarga?: PaginatedKeluarga;
  statistics?: Array<{ provinsi: string; total: number }>;
  provinsiList?: string[];
  kotaList?: string[];
  filters?: {
    provinsi?: string;
    kota?: string;
    tahun?: string;
  };
  category?: string;
}

export default function Wilayah({
  auth,
  keluarga,
  statistics = [],
  provinsiList = [],
  kotaList = [],
  filters = {},
  category = 'Sebaran Wilayah PKH'
}: WilayahProps) {
  const [selectedProvinsi, setSelectedProvinsi] = useState(filters.provinsi || 'all');
  const [selectedKota, setSelectedKota] = useState(filters.kota || 'all');
  const exportModal = useExportModal();

  // PERBAIKAN: Update breadcrumbs untuk menggunakan route admin yang benar
  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Laporan PKH', href: route('admin.reports.index') },
    { label: category, active: true },
  ];

  // Safe data access dengan null checks yang lebih ketat
  const safeKeluarga = keluarga || {
    data: [],
    meta: {
      current_page: 1,
      from: 0,
      last_page: 1,
      per_page: 15,
      to: 0,
      total: 0
    },
    links: []
  };

  const safeMeta = safeKeluarga.meta || {
    current_page: 1,
    from: 0,
    last_page: 1,
    per_page: 15,
    to: 0,
    total: 0
  };

  // PERBAIKAN: Enhanced loading state
  if (!keluarga) {
    return (
      <AuthenticatedLayout
        user={auth.user}
        breadcrumbs={breadcrumbs}
        header={
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-3 h-8 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full shadow-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-emerald-600" />
              <h2 className="font-light text-2xl text-slate-800 tracking-wide">Laporan {category}</h2>
            </div>
          </motion.div>
        }
      >
        <Head title={`Laporan ${category}`} />

        <div className="space-y-8">
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <MapPin className="w-8 h-8 text-emerald-600" />
              </motion.div>
              <p className="text-slate-600 text-lg font-medium mb-2">Memuat data laporan sebaran wilayah PKH...</p>
              <p className="text-slate-400 text-sm">Mohon tunggu sebentar</p>
            </div>
          </motion.div>
        </div>
      </AuthenticatedLayout>
    );
  }

  useEffect(() => {
    setSelectedProvinsi(filters.provinsi || 'all');
    setSelectedKota(filters.kota || 'all');
  }, [filters]);

  const handleProvinsiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinsi = e.target.value;
    setSelectedProvinsi(provinsi);
    setSelectedKota('all');
    
    // PERBAIKAN: Update route untuk admin reports
    router.get(route('admin.reports.sebaran-wilayah'), {
      provinsi,
      kota: 'all'
    }, {
      preserveState: true,
      replace: true
    });
  };

  const handleKotaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const kota = e.target.value;
    setSelectedKota(kota);
    
    router.get(route('admin.reports.sebaran-wilayah'), {
      provinsi: selectedProvinsi,
      kota
    }, {
      preserveState: true,
      replace: true
    });
  };

  const formatStatusEkonomi = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'sangat_miskin': 'Sangat Miskin',
      'miskin': 'Miskin',
      'rentan_miskin': 'Rentan Miskin'
    };
    return statusMap[status] || status.replace('_', ' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sangat_miskin':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'miskin':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'rentan_miskin':
        return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const openGoogleMaps = (alamat: string, kota: string, provinsi: string) => {
    const query = encodeURIComponent(`${alamat}, ${kota}, ${provinsi}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

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

  return (
    <AuthenticatedLayout
      user={auth.user}
      breadcrumbs={breadcrumbs}
      header={
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-3 h-8 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-emerald-600" />
            <h2 className="font-light text-2xl text-slate-800 tracking-wide">Laporan {category}</h2>
          </div>
        </motion.div>
      }
    >
      <Head title={`Laporan ${category}`} />

      <motion.div 
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Filter Section */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-6 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full"></div>
            <h3 className="text-lg font-medium text-slate-900">Filter Wilayah PKH</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="provinsi" className="block text-sm font-medium text-slate-700 mb-2">
                <Globe className="w-4 h-4 inline mr-2 text-emerald-600" />
                Provinsi
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  id="provinsi"
                  value={selectedProvinsi}
                  onChange={handleProvinsiChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white/80 backdrop-blur-sm"
                >
                  <option value="all">Semua Provinsi</option>
                  {provinsiList.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="kota" className="block text-sm font-medium text-slate-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-2 text-emerald-600" />
                Kota/Kabupaten
                {selectedProvinsi !== 'all' && (
                  <span className="text-xs text-emerald-600 ml-1">
                    ({kotaList.length} kota tersedia)
                  </span>
                )}
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  id="kota"
                  value={selectedKota}
                  onChange={handleKotaChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white/80 backdrop-blur-sm disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={selectedProvinsi === 'all'}
                >
                  <option value="all">
                    {selectedProvinsi === 'all' ? 'Pilih provinsi terlebih dahulu' : 'Semua Kota/Kabupaten'}
                  </option>
                  {kotaList.map((kota) => (
                    <option key={kota} value={kota}>{kota}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Section */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-6 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full"></div>
              <h3 className="text-lg font-medium text-slate-900">Statistik Sebaran PKH Per Provinsi</h3>
            </div>
            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Top {Math.min(statistics.length, 10)} Provinsi
            </span>
          </div>

          {statistics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.slice(0, 10).map((stat, index) => (
                <motion.div
                  key={stat.provinsi}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-lg border border-slate-100 hover:shadow-md transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                      whileHover={{ rotate: 5 }}
                    >
                      {index + 1}
                    </motion.div>
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]" title={stat.provinsi}>
                      {stat.provinsi}
                    </span>
                  </div>
                  <span className="text-lg font-light text-slate-900">{stat.total.toLocaleString()}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Tidak ada data statistik wilayah PKH.</p>
            </motion.div>
          )}
        </motion.div>

        {/* Data Table Section */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 overflow-hidden shadow-lg"
          variants={itemVariants}
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100/50 bg-gradient-to-r from-slate-50 to-emerald-50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="text-xl font-medium text-slate-900 mb-2">Detail Data Keluarga PKH</h3>
                <p className="text-sm text-slate-600">
                  Menampilkan {safeMeta.from || 0} - {safeMeta.to || 0} dari {safeMeta.total || 0} keluarga
                </p>
              </div>

              {/* Export Button */}
              <motion.button
                onClick={exportModal.openModal}
                className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-200 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-5 h-5 mr-2" />
                Export Data
              </motion.button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">No. KK</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Keluarga</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Alamat</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Provinsi</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kota/Kabupaten</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kecamatan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kelurahan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status Ekonomi</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {safeKeluarga.data && safeKeluarga.data.length > 0 ? (
                    safeKeluarga.data.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        className="hover:bg-slate-50/50 transition-colors duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.8)" }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-slate-900">{item.no_kk}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">{item.nama_keluarga}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm text-slate-900 truncate">{item.alamat}</div>
                            {item.rt && item.rw && (
                              <div className="text-xs text-slate-500">
                                RT {item.rt} / RW {item.rw}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{item.provinsi}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{item.kota}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{item.kecamatan}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{item.kelurahan}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status_ekonomi)}`}>
                            {formatStatusEkonomi(item.status_ekonomi)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <Link
                              href={route('admin.keluarga.show', item.id)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all duration-200"
                            >
                              Detail
                            </Link>
                            <motion.button
                              onClick={() => openGoogleMaps(item.alamat || '', item.kota || '', item.provinsi || '')}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all duration-200"
                              title="Lihat di Google Maps"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Maps
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <td colSpan={9} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <motion.div 
                            className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <MapPin className="w-8 h-8 text-slate-400" />
                          </motion.div>
                          <p className="text-slate-500 text-lg font-medium mb-2">Tidak ada data keluarga</p>
                          <p className="text-slate-400 text-sm">Coba ubah filter untuk melihat data lainnya</p>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {safeKeluarga.data && safeKeluarga.data.length > 0 && safeKeluarga.links && safeKeluarga.links.length > 3 && (
            <motion.div 
              className="px-8 py-6 border-t border-slate-100/50 bg-slate-50/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                  Menampilkan <span className="font-medium">{safeMeta.from || 0}</span> sampai{' '}
                  <span className="font-medium">{safeMeta.to || 0}</span> dari{' '}
                  <span className="font-medium">{safeMeta.total || 0}</span> hasil
                </div>

                <Pagination links={safeKeluarga.links} />
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Export Modal */}
      <ExportModal
              isOpen={exportModal.isOpen}
              onClose={exportModal.closeModal}
              category="wilayah"
              filters={{
                  wilayah: selectedProvinsi !== 'all' ? `${selectedProvinsi}${selectedKota !== 'all' ? `, ${selectedKota}` : ''}` : '',
                  status: '',
                  status_bantuan: '',
                  search: '',
                  tahun: filters.tahun || new Date().getFullYear().toString()
              }}
              title="Export Laporan Sebaran Wilayah PKH"
              statistics={{
                total_kpm: safeMeta.total || 0,
                total_provinsi: statistics.length,
                total_kota: kotaList.length
              }}      />
    </AuthenticatedLayout>
  );
}
