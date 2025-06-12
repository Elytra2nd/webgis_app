import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import ExportModal from '@/Components/ExportModal';
import { useExportModal } from '@/Hooks/useExportModal';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Map, Globe, Filter, Download, ExternalLink, Building2, BarChart3, TrendingUp, Users } from 'lucide-react';

interface Keluarga {
  id: number;
  no_kk: string;
  nama_keluarga: string;
  alamat: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
  rt?: string;
  rw?: string;
  status_ekonomi: string;
  lokasi?: string;
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

interface SebaranData {
  [provinsi: string]: Array<{
    kota: string;
    total_penerima: number;
  }>;
}

interface StatistikWilayah {
  provinsi_terbanyak?: {
    provinsi: string;
    total: number;
  };
  total_provinsi: number;
  total_kota: number;
  distribusi_terbanyak?: {
    provinsi: string;
    total_distribusi: number;
  };
}

interface DistribusiPerWilayah {
  [provinsi: string]: Array<{
    kota: string;
    total_distribusi: number;
    total_disalurkan: number;
  }>;
}

interface SebaranWilayahProps extends PageProps {
  sebaranData?: SebaranData;
  statistikWilayah?: StatistikWilayah;
  distribusiPerWilayah?: DistribusiPerWilayah;
  filters?: {
    tahun?: string;
    provinsi?: string;
  };
  tahunTersedia?: number[];
  provinsiList?: string[];
  category?: string;
}

export default function SebaranWilayah({
  auth,
  sebaranData = {},
  statistikWilayah,
  distribusiPerWilayah = {},
  filters = {},
  tahunTersedia = [],
  provinsiList = [],
  category = 'Sebaran Wilayah PKH'
}: SebaranWilayahProps) {
  const [selectedTahun, setSelectedTahun] = useState(filters.tahun || new Date().getFullYear().toString());
  const [selectedProvinsi, setSelectedProvinsi] = useState(filters.provinsi || 'all');
  const [activeTab, setActiveTab] = useState('sebaran');
  const exportModal = useExportModal();

  // Breadcrumbs untuk navigasi
  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Laporan PKH', href: route('admin.reports.index') },
    { label: category, active: true },
  ];

  useEffect(() => {
    setSelectedTahun(filters.tahun || new Date().getFullYear().toString());
    setSelectedProvinsi(filters.provinsi || 'all');
  }, [filters]);

  const handleTahunChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tahun = e.target.value;
    setSelectedTahun(tahun);
    
    router.get(route('admin.reports.sebaran-wilayah'), {
      tahun,
      provinsi: selectedProvinsi
    }, {
      preserveState: true,
      replace: true
    });
  };

  const handleProvinsiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinsi = e.target.value;
    setSelectedProvinsi(provinsi);
    
    router.get(route('admin.reports.sebaran-wilayah'), {
      tahun: selectedTahun,
      provinsi
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

  // Calculate totals for display
  const totalPenerima = Object.values(sebaranData).reduce((total, kota) => 
    total + kota.reduce((kotaTotal, item) => kotaTotal + item.total_penerima, 0), 0
  );

  const totalDistribusi = Object.values(distribusiPerWilayah).reduce((total, kota) => 
    total + kota.reduce((kotaTotal, item) => kotaTotal + item.total_disalurkan, 0), 0
  );

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
            <h3 className="text-lg font-medium text-slate-900">Filter Laporan PKH</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tahun" className="block text-sm font-medium text-slate-700 mb-2">
                <BarChart3 className="w-4 h-4 inline mr-2 text-emerald-600" />
                Tahun Anggaran PKH
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  id="tahun"
                  value={selectedTahun}
                  onChange={handleTahunChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white/80 backdrop-blur-sm"
                >
                  {tahunTersedia.map((tahun) => (
                    <option key={tahun} value={tahun.toString()}>{tahun}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="provinsi" className="block text-sm font-medium text-slate-700 mb-2">
                <Globe className="w-4 h-4 inline mr-2 text-emerald-600" />
                Provinsi
                {selectedProvinsi !== 'all' && (
                  <span className="text-xs text-emerald-600 ml-1">
                    (Filter aktif)
                  </span>
                )}
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
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={itemVariants}>
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Penerima PKH</p>
                <p className="text-3xl font-light text-slate-900">{totalPenerima.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Total Provinsi</p>
                <p className="text-3xl font-light text-emerald-700">{statistikWilayah?.total_provinsi || 0}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Kota/Kabupaten</p>
                <p className="text-3xl font-light text-slate-700">{statistikWilayah?.total_kota || 0}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Distribusi</p>
                <p className="text-3xl font-light text-blue-700">{totalDistribusi.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 overflow-hidden shadow-lg"
          variants={itemVariants}
        >
          <div className="border-b border-slate-100">
            <nav className="flex space-x-8 px-8 py-4">
              <button
                onClick={() => setActiveTab('sebaran')}
                className={`pb-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'sebaran'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                Sebaran Penerima
              </button>
              <button
                onClick={() => setActiveTab('distribusi')}
                className={`pb-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'distribusi'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Distribusi Bantuan
              </button>
            </nav>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'sebaran' ? (
                <motion.div
                  key="sebaran"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-slate-900">Sebaran Penerima PKH Per Wilayah</h3>
                    <motion.button
                      onClick={exportModal.openModal}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-200 shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </motion.button>
                  </div>

                  {Object.keys(sebaranData).length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {Object.entries(sebaranData).map(([provinsi, kotaList], index) => (
                        <motion.div
                          key={provinsi}
                          className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-xl p-6 border border-slate-100"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                            <Globe className="w-5 h-5 mr-2 text-emerald-600" />
                            {provinsi}
                          </h4>
                          <div className="space-y-3">
                            {kotaList.map((kota, kotaIndex) => (
                              <motion.div
                                key={kota.kota}
                                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                                whileHover={{ scale: 1.02 }}
                              >
                                <span className="text-sm font-medium text-slate-700">{kota.kota}</span>
                                <span className="text-sm font-bold text-emerald-600">
                                  {kota.total_penerima.toLocaleString()} keluarga
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Map className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 text-lg">Tidak ada data sebaran untuk ditampilkan</p>
                      <p className="text-slate-400 text-sm">Coba ubah filter tahun atau provinsi</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="distribusi"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-slate-900">Distribusi Bantuan PKH Per Wilayah</h3>
                    <motion.button
                      onClick={exportModal.openModal}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </motion.button>
                  </div>

                  {Object.keys(distribusiPerWilayah).length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {Object.entries(distribusiPerWilayah).map(([provinsi, kotaList], index) => (
                        <motion.div
                          key={provinsi}
                          className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-100"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                            {provinsi}
                          </h4>
                          <div className="space-y-3">
                            {kotaList.map((kota, kotaIndex) => (
                              <motion.div
                                key={kota.kota}
                                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                                whileHover={{ scale: 1.02 }}
                              >
                                <div>
                                  <span className="text-sm font-medium text-slate-700 block">{kota.kota}</span>
                                  <span className="text-xs text-slate-500">
                                    {kota.total_disalurkan} dari {kota.total_distribusi} distribusi
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-bold text-blue-600 block">
                                    {((kota.total_disalurkan / kota.total_distribusi) * 100 || 0).toFixed(1)}%
                                  </span>
                                  <span className="text-xs text-slate-500">efektivitas</span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 text-lg">Tidak ada data distribusi untuk ditampilkan</p>
                      <p className="text-slate-400 text-sm">Coba ubah filter tahun atau provinsi</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Top Performers */}
        {statistikWilayah && (
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-6 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full"></div>
              <h3 className="text-lg font-medium text-slate-900">Informasi Wilayah Terbaik</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {statistikWilayah.provinsi_terbanyak && (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
                  <h4 className="font-semibold text-emerald-800 mb-2">Provinsi dengan Penerima Terbanyak</h4>
                  <p className="text-2xl font-bold text-emerald-600">{statistikWilayah.provinsi_terbanyak.provinsi}</p>
                  <p className="text-sm text-emerald-700">{statistikWilayah.provinsi_terbanyak.total.toLocaleString()} keluarga penerima PKH</p>
                </div>
              )}

              {statistikWilayah.distribusi_terbanyak && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-2">Provinsi dengan Distribusi Terbanyak</h4>
                  <p className="text-2xl font-bold text-blue-600">{statistikWilayah.distribusi_terbanyak.provinsi}</p>
                  <p className="text-sm text-blue-700">{statistikWilayah.distribusi_terbanyak.total_distribusi.toLocaleString()} distribusi bantuan</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModal.isOpen}
        onClose={exportModal.closeModal}
        category="wilayah"
        filters={{
          tahun: selectedTahun,
          provinsi: selectedProvinsi
        }}
        title="Export Laporan Sebaran Wilayah PKH"
      />
    </AuthenticatedLayout>
  );
}
