import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import ExportModal from '@/Components/ExportModal';
import { useExportModal } from '@/Hooks/useExportModal';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Download, Filter, CheckCircle, AlertCircle, ExternalLink, DollarSign, Calendar, MapPin, TrendingUp, BarChart3 } from 'lucide-react';

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

interface StatistikPKH {
  total_penerima: number;
  total_bantuan_disalurkan: number;
  total_nominal_disalurkan: number;
  distribusi_per_bulan: Array<{ bulan: number; nama_bulan: string; total: number }>;
  distribusi_per_wilayah: Array<{ provinsi: string; total: number }>;
  status_distribusi: { [key: string]: number };
}

interface PKHProps extends PageProps {
  keluarga?: PaginatedKeluarga;
  statistics?: StatistikPKH;
  filters?: { tahun?: string; bulan?: string; status?: string; provinsi?: string; kota?: string };
  tahunTersedia?: number[];
  provinsiList?: string[];
  kotaList?: string[];
  category?: string;
}

export default function PKH({
  auth,
  keluarga,
  statistics,
  filters = {},
  tahunTersedia = [],
  provinsiList = [],
  kotaList = [],
  category = 'Program Keluarga Harapan (PKH)'
}: PKHProps) {
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [selectedTahun, setSelectedTahun] = useState(filters.tahun || new Date().getFullYear().toString());
  const [selectedBulan, setSelectedBulan] = useState(filters.bulan || 'all');
  const [selectedProvinsi, setSelectedProvinsi] = useState(filters.provinsi || 'all');
  const [selectedKota, setSelectedKota] = useState(filters.kota || 'all');
  const exportModal = useExportModal();

  // Safe data access
  const safeKeluarga = keluarga || { 
    data: [], 
    meta: { current_page: 1, from: 0, last_page: 1, per_page: 15, to: 0, total: 0 }, 
    links: [] 
  };
  const safeMeta = safeKeluarga.meta || { current_page: 1, from: 0, last_page: 1, per_page: 15, to: 0, total: 0 };
  const safeStatistics = statistics || { 
    total_penerima: 0, 
    total_bantuan_disalurkan: 0, 
    total_nominal_disalurkan: 0, 
    distribusi_per_bulan: [], 
    distribusi_per_wilayah: [], 
    status_distribusi: {} 
  };

  // Breadcrumbs untuk navigasi
  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Laporan PKH', href: route('admin.reports.index') },
    { label: category, active: true },
  ];

  useEffect(() => {
    setSelectedStatus(filters.status || 'all');
    setSelectedTahun(filters.tahun || new Date().getFullYear().toString());
    setSelectedBulan(filters.bulan || 'all');
    setSelectedProvinsi(filters.provinsi || 'all');
    setSelectedKota(filters.kota || 'all');
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    switch (key) {
      case 'status':
        setSelectedStatus(value);
        break;
      case 'tahun':
        setSelectedTahun(value);
        break;
      case 'bulan':
        setSelectedBulan(value);
        break;
      case 'provinsi':
        setSelectedProvinsi(value);
        setSelectedKota('all');
        break;
      case 'kota':
        setSelectedKota(value);
        break;
    }

    const newFilters = {
      status: key === 'status' ? value : selectedStatus,
      tahun: key === 'tahun' ? value : selectedTahun,
      bulan: key === 'bulan' ? value : selectedBulan,
      provinsi: key === 'provinsi' ? value : selectedProvinsi,
      kota: key === 'kota' ? value : selectedKota
    };

    router.get(route('admin.reports.pkh'), newFilters, { preserveState: true, replace: true });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(amount);
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

  const getBantuanStatusColor = (status: string) => {
    switch (status) {
      case 'aktif':
      case 'received':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'not_received':
      case 'selesai':
        return 'bg-slate-50 text-slate-700 border border-slate-200';
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
            <Users className="w-6 h-6 text-teal-600" />
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
            <h3 className="text-lg font-medium text-slate-900">Filter Laporan PKH</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
                  <option key={tahun} value={tahun.toString()}>
                    {tahun}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bulan" className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2 text-teal-600" />
                Periode Bulan
              </label>
              <select
                id="bulan"
                value={selectedBulan}
                onChange={(e) => handleFilterChange('bulan', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">Semua Bulan</option>
                <option value="1">Januari</option>
                <option value="2">Februari</option>
                <option value="3">Maret</option>
                <option value="4">April</option>
                <option value="5">Mei</option>
                <option value="6">Juni</option>
                <option value="7">Juli</option>
                <option value="8">Agustus</option>
                <option value="9">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                <CheckCircle className="w-4 h-4 inline mr-2 text-teal-600" />
                Status Bantuan
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">Semua Status</option>
                <option value="received">Sudah Menerima</option>
                <option value="not_received">Belum Menerima</option>
                <option value="pending">Dalam Proses</option>
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
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="kota" className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2 text-teal-600" />
                Kota/Kabupaten
              </label>
              <select
                id="kota"
                value={selectedKota}
                onChange={(e) => handleFilterChange('kota', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                disabled={selectedProvinsi === 'all'}
              >
                <option value="all">
                  {selectedProvinsi === 'all' ? 'Pilih provinsi terlebih dahulu' : 'Semua Kota/Kabupaten'}
                </option>
                {kotaList.map((kota) => (
                  <option key={kota} value={kota}>
                    {kota}
                  </option>
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
                <p className="text-sm font-medium text-slate-600">Total Penerima PKH</p>
                <p className="text-3xl font-light text-slate-900">{safeStatistics.total_penerima.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Bantuan Disalurkan</p>
                <p className="text-3xl font-light text-green-700">{safeStatistics.total_bantuan_disalurkan.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-blue-600">Total Nominal</p>
                <p className="text-2xl font-light text-blue-700">
                  {formatCurrency(safeStatistics.total_nominal_disalurkan)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Efektivitas</p>
                <p className="text-3xl font-light text-purple-700">
                  {safeStatistics.total_penerima > 0 
                    ? ((safeStatistics.total_bantuan_disalurkan / safeStatistics.total_penerima) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Statistics Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-6 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full"></div>
              <h3 className="text-lg font-medium text-slate-900">Statistik Distribusi Bantuan PKH</h3>
            </div>
            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Tahun {selectedTahun}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-6 border border-slate-100">
              <h4 className="font-semibold text-teal-800 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Distribusi Per Bulan
              </h4>
              {safeStatistics.distribusi_per_bulan.length > 0 ? (
                <div className="space-y-2">
                  {safeStatistics.distribusi_per_bulan.slice(0, 6).map((item) => (
                    <div key={item.bulan} className="flex justify-between items-center text-sm">
                      <span className="text-slate-700">{item.nama_bulan}</span>
                      <span className="font-medium text-teal-700">{item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Tidak ada data distribusi per bulan.</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-6 border border-slate-100">
              <h4 className="font-semibold text-teal-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Distribusi Per Wilayah
              </h4>
              {safeStatistics.distribusi_per_wilayah.length > 0 ? (
                <div className="space-y-2">
                  {safeStatistics.distribusi_per_wilayah.slice(0, 5).map((item) => (
                    <div key={item.provinsi} className="flex justify-between items-center text-sm">
                      <span className="text-slate-700 truncate">{item.provinsi}</span>
                      <span className="font-medium text-teal-700">{item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Tidak ada data distribusi per wilayah.</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-6 border border-slate-100">
              <h4 className="font-semibold text-teal-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Status Distribusi
              </h4>
              {Object.keys(safeStatistics.status_distribusi).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(safeStatistics.status_distribusi).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center text-sm">
                      <span className="text-slate-700 capitalize">{status.replace('_', ' ')}</span>
                      <span className="font-medium text-teal-700">{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Tidak ada data status distribusi.</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Data Table Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 overflow-hidden shadow-lg"
          variants={itemVariants}
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100/50 bg-gradient-to-r from-slate-50 to-cyan-50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="text-xl font-medium text-slate-900 mb-2">Detail Data Keluarga PKH</h3>
                <p className="text-sm text-slate-600">
                  Menampilkan {safeMeta.from || 0} - {safeMeta.to || 0} dari {safeMeta.total || 0} keluarga
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Export Button */}
                <motion.button
                  onClick={exportModal.openModal}
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-cyan-200 transition-all duration-200 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export Data
                </motion.button>
              </div>
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Wilayah</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status Ekonomi</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status Bantuan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nominal/Bulan</th>
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
                          {item.tanggal_penetapan && (
                            <div className="text-xs text-slate-500">
                              Penetapan: {new Date(item.tanggal_penetapan).toLocaleDateString('id-ID')}
                            </div>
                          )}
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
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-700">
                            <div>{item.kota}</div>
                            <div className="text-xs text-slate-500">{item.provinsi}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status_ekonomi)}`}>
                            {formatStatusEkonomi(item.status_ekonomi)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getBantuanStatusColor(item.status_bantuan || 'not_received')}`}>
                            {item.status_bantuan === 'aktif' ? 'Aktif' :
                             item.status_bantuan === 'pending' ? 'Pending' :
                             item.status_bantuan === 'received' ? 'Menerima' :
                             'Belum Menerima'}
                          </span>
                          {item.persentase_distribusi !== undefined && (
                            <div className="text-xs text-slate-500 mt-1">
                              {item.persentase_distribusi.toFixed(1)}% distribusi
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.nominal_per_bulan ? (
                            <div className="text-sm">
                              <div className="font-medium text-slate-900">
                                {formatCurrency(item.nominal_per_bulan)}
                              </div>
                              {item.total_nominal_tahun && (
                                <div className="text-xs text-slate-500">
                                  Total: {formatCurrency(item.total_nominal_tahun)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <Link
                              href={route('admin.keluarga.show', item.id)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-all duration-200"
                            >
                              Detail
                            </Link>
                            <motion.button
                              onClick={() => openGoogleMaps(item.alamat, item.kota, item.provinsi)}
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
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <motion.div 
                            className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Users className="w-8 h-8 text-slate-400" />
                          </motion.div>
                          <p className="text-slate-500 text-lg font-medium mb-2">Tidak ada data keluarga PKH</p>
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
                  <span className="font-medium">{safeMeta.total || 0}</span> keluarga
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
        category="pkh"
        filters={{
          status: selectedStatus,
          tahun: selectedTahun,
          bulan: selectedBulan,
          provinsi: selectedProvinsi,
          kota: selectedKota
        }}
        title="Export Laporan Program Keluarga Harapan (PKH)"
      />
    </AuthenticatedLayout>
  );
}
