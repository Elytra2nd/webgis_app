import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import ExportModal from '@/Components/ExportModal';
import { useExportModal } from '@/Hooks/useExportModal';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Users, Filter, Download, MapPin, BarChart3, Calendar, TrendingUp, Target, Activity, AlertTriangle } from 'lucide-react';

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
  status_bantuan?: string;
  nominal_per_bulan?: number;
  total_nominal_tahun?: number;
  persentase_distribusi?: number;
  sisa_bulan_distribusi?: number;
  total_disalurkan?: number;
  total_gagal?: number;
  tanggal_penetapan?: string;
  lokasi?: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedKeluarga {
  data: Keluarga[];
  links: Array<{ url: string | null; label: string; active: boolean }>;
  meta: { current_page: number; from: number; last_page: number; per_page: number; to: number; total: number };
}

interface DistribusiPerStatus {
  status: string;
  total_keluarga: number;
  total_penerima: number;
  coverage_percentage: number;
}

interface EfektivitasData {
  total_keluarga: number;
  total_penerima: number;
  efektivitas_percentage: number;
  keluarga_belum_menerima: number;
  distribusi_per_status: DistribusiPerStatus[];
  rata_rata_distribusi: number;
}

interface TargetRealisasi {
  target: number;
  realisasi: number;
  percentage: number;
  sisa_target: number;
}

interface EfektivitasDistribusi {
  total_target: number;
  total_realisasi: number;
  total_gagal: number;
  persentase_realisasi: number;
  persentase_gagal: number;
}

interface EfektivitasProps extends PageProps {
  efektivitasData?: EfektivitasData;
  targetRealisasi?: TargetRealisasi;
  efektivitasDistribusi?: EfektivitasDistribusi;
  filters?: { tahun?: string; provinsi?: string };
  tahunTersedia?: number[];
  provinsiList?: string[];
  category?: string;
}

export default function Efektivitas({
  auth,
  efektivitasData,
  targetRealisasi,
  efektivitasDistribusi,
  filters = {},
  tahunTersedia = [],
  provinsiList = [],
  category = 'Efektivitas Program PKH'
}: EfektivitasProps) {
  const [selectedTahun, setSelectedTahun] = useState(filters.tahun || new Date().getFullYear().toString());
  const [selectedProvinsi, setSelectedProvinsi] = useState(filters.provinsi || 'all');
  const [activeTab, setActiveTab] = useState('overview');
  const exportModal = useExportModal();

  // Safe data access
  const safeEfektivitasData = efektivitasData || { 
    total_keluarga: 0,
    total_penerima: 0,
    efektivitas_percentage: 0,
    keluarga_belum_menerima: 0,
    distribusi_per_status: [],
    rata_rata_distribusi: 0
  };

  const safeTargetRealisasi = targetRealisasi || {
    target: 0,
    realisasi: 0,
    percentage: 0,
    sisa_target: 0
  };

  const safeEfektivitasDistribusi = efektivitasDistribusi || {
    total_target: 0,
    total_realisasi: 0,
    total_gagal: 0,
    persentase_realisasi: 0,
    persentase_gagal: 0
  };

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

  const handleFilterChange = (key: string, value: string) => {
    switch (key) {
      case 'tahun':
        setSelectedTahun(value);
        break;
      case 'provinsi':
        setSelectedProvinsi(value);
        break;
    }

    const newFilters = {
      tahun: key === 'tahun' ? value : selectedTahun,
      provinsi: key === 'provinsi' ? value : selectedProvinsi
    };

    router.get(route('admin.reports.efektivitas'), newFilters, { preserveState: true, replace: true });
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

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="w-4 h-4" />;
    if (percentage >= 60) return <AlertTriangle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
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
            className="w-3 h-8 bg-gradient-to-b from-cyan-400 via-teal-500 to-blue-600 rounded-full shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-teal-600" />
            <h2 className="font-light text-2xl text-slate-800 tracking-wide">Laporan {category}</h2>
          </div>
        </motion.div>
      }
    >
      <Head title={`Laporan ${category}`} />

      <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
        {/* Filter Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-6 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full"></div>
            <h3 className="text-lg font-medium text-slate-900">Filter Laporan Efektivitas PKH</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tahun" className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2 text-teal-600" />
                Tahun Anggaran
              </label>
              <select
                id="tahun"
                value={selectedTahun}
                onChange={(e) => handleFilterChange('tahun', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {tahunTersedia.map((tahun) => (
                  <option key={tahun} value={tahun.toString()}>{tahun}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="provinsi" className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2 text-teal-600" />
                Provinsi
              </label>
              <select
                id="provinsi"
                value={selectedProvinsi}
                onChange={(e) => handleFilterChange('provinsi', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">Semua Provinsi</option>
                {provinsiList.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
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
                <p className="text-sm font-medium text-slate-600">Total Keluarga</p>
                <p className="text-3xl font-light text-slate-900">{safeEfektivitasData.total_keluarga.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Penerima</p>
                <p className="text-3xl font-light text-green-700">{safeEfektivitasData.total_penerima.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600">Efektivitas (%)</p>
                <p className={`text-3xl font-light ${getPerformanceColor(safeEfektivitasData.efektivitas_percentage)}`}>
                  {safeEfektivitasData.efektivitas_percentage.toFixed(2)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Belum Menerima</p>
                <p className="text-3xl font-light text-slate-900">{safeEfektivitasData.keluarga_belum_menerima.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-slate-600" />
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
                onClick={() => setActiveTab('overview')}
                className={`pb-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'overview'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Overview Efektivitas
              </button>
              <button
                onClick={() => setActiveTab('target')}
                className={`pb-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'target'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Target className="w-4 h-4 inline mr-2" />
                Target vs Realisasi
              </button>
              <button
                onClick={() => setActiveTab('distribusi')}
                className={`pb-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'distribusi'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                Efektivitas Distribusi
              </button>
            </nav>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-slate-900">
                {activeTab === 'overview' && 'Overview Efektivitas PKH'}
                {activeTab === 'target' && 'Target vs Realisasi PKH'}
                {activeTab === 'distribusi' && 'Efektivitas Distribusi Bantuan'}
              </h3>
              <motion.button
                onClick={exportModal.openModal}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-lg hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-teal-200 transition-all duration-200 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-slate-50 to-teal-50 rounded-xl p-6 border border-slate-100">
                      <h4 className="font-semibold text-teal-800 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Distribusi Per Status Ekonomi
                      </h4>
                      {safeEfektivitasData.distribusi_per_status.length > 0 ? (
                        <div className="space-y-4">
                          {safeEfektivitasData.distribusi_per_status.map((item, index) => (
                            <motion.div
                              key={item.status}
                              className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div>
                                <span className="text-sm font-medium text-slate-700">{item.status}</span>
                                <div className="text-xs text-slate-500">
                                  {item.total_penerima} dari {item.total_keluarga} keluarga
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-sm font-bold flex items-center ${getPerformanceColor(item.coverage_percentage)}`}>
                                  {getPerformanceIcon(item.coverage_percentage)}
                                  <span className="ml-1">{item.coverage_percentage.toFixed(1)}%</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Tidak ada data distribusi per status.</p>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl p-6 border border-slate-100">
                      <h4 className="font-semibold text-cyan-800 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Ringkasan Efektivitas
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                          <span className="text-sm text-slate-700">Rata-rata Distribusi</span>
                          <span className="text-sm font-bold text-cyan-600">
                            {safeEfektivitasData.rata_rata_distribusi.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                          <span className="text-sm text-slate-700">Coverage Rate</span>
                          <span className={`text-sm font-bold flex items-center ${getPerformanceColor(safeEfektivitasData.efektivitas_percentage)}`}>
                            {getPerformanceIcon(safeEfektivitasData.efektivitas_percentage)}
                            <span className="ml-1">{safeEfektivitasData.efektivitas_percentage.toFixed(1)}%</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                          <span className="text-sm text-slate-700">Keluarga Terjangkau</span>
                          <span className="text-sm font-bold text-green-600">
                            {safeEfektivitasData.total_penerima.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                          <span className="text-sm text-slate-700">Keluarga Belum Terjangkau</span>
                          <span className="text-sm font-bold text-red-600">
                            {safeEfektivitasData.keluarga_belum_menerima.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'target' && (
                <motion.div
                  key="target"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <h4 className="font-semibold text-blue-800 mb-2">Target Penerima</h4>
                      <p className="text-2xl font-bold text-blue-600">{safeTargetRealisasi.target.toLocaleString()}</p>
                      <p className="text-xs text-blue-700">Keluarga sangat miskin & miskin</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <h4 className="font-semibold text-green-800 mb-2">Realisasi</h4>
                      <p className="text-2xl font-bold text-green-600">{safeTargetRealisasi.realisasi.toLocaleString()}</p>
                      <p className="text-xs text-green-700">Keluarga yang menerima PKH</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                      <h4 className="font-semibold text-purple-800 mb-2">Pencapaian</h4>
                      <p className={`text-2xl font-bold flex items-center ${getPerformanceColor(safeTargetRealisasi.percentage)}`}>
                        {getPerformanceIcon(safeTargetRealisasi.percentage)}
                        <span className="ml-1">{safeTargetRealisasi.percentage.toFixed(1)}%</span>
                      </p>
                      <p className="text-xs text-purple-700">Dari target yang ditetapkan</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                      <h4 className="font-semibold text-orange-800 mb-2">Sisa Target</h4>
                      <p className="text-2xl font-bold text-orange-600">{safeTargetRealisasi.sisa_target.toLocaleString()}</p>
                      <p className="text-xs text-orange-700">Keluarga belum terjangkau</p>
                    </div>
                  </div>

                  <div className="mt-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-100">
                    <h4 className="font-semibold text-slate-800 mb-4">Progress Target PKH</h4>
                    <div className="w-full bg-slate-200 rounded-full h-4 mb-2">
                      <motion.div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full flex items-center justify-end pr-2"
                        initial={{ width: 0 }}
                        animate={{ width: `${safeTargetRealisasi.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      >
                        <span className="text-xs text-white font-medium">
                          {safeTargetRealisasi.percentage.toFixed(1)}%
                        </span>
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>0</span>
                      <span>{safeTargetRealisasi.target.toLocaleString()} (Target)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'distribusi' && (
                <motion.div
                  key="distribusi"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                      <h4 className="font-semibold text-blue-800 mb-2">Total Target Distribusi</h4>
                      <p className="text-2xl font-bold text-blue-600">{safeEfektivitasDistribusi.total_target.toLocaleString()}</p>
                      <p className="text-xs text-blue-700">Distribusi yang direncanakan</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <h4 className="font-semibold text-green-800 mb-2">Berhasil Disalurkan</h4>
                      <p className="text-2xl font-bold text-green-600">{safeEfektivitasDistribusi.total_realisasi.toLocaleString()}</p>
                      <p className="text-xs text-green-700">
                        {safeEfektivitasDistribusi.persentase_realisasi.toFixed(1)}% dari target
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
                      <h4 className="font-semibold text-red-800 mb-2">Gagal Disalurkan</h4>
                      <p className="text-2xl font-bold text-red-600">{safeEfektivitasDistribusi.total_gagal.toLocaleString()}</p>
                      <p className="text-xs text-red-700">
                        {safeEfektivitasDistribusi.persentase_gagal.toFixed(1)}% dari target
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-100">
                    <h4 className="font-semibold text-slate-800 mb-4">Efektivitas Distribusi Bantuan</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Berhasil Disalurkan</span>
                          <span className="font-medium text-green-600">
                            {safeEfektivitasDistribusi.persentase_realisasi.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <motion.div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${safeEfektivitasDistribusi.persentase_realisasi}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Gagal Disalurkan</span>
                          <span className="font-medium text-red-600">
                            {safeEfektivitasDistribusi.persentase_gagal.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <motion.div
                            className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${safeEfektivitasDistribusi.persentase_gagal}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModal.isOpen}
        onClose={exportModal.closeModal}
        category="efektivitas"
        filters={{
          tahun: selectedTahun,
          provinsi: selectedProvinsi
        }}
        title="Export Laporan Efektivitas Program PKH"
      />
    </AuthenticatedLayout>
  );
}
