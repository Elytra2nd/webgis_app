import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ExportModal from '@/Components/ExportModal';
import { useExportModal } from '@/Hooks/useExportModal';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, BarChart3, Users, Filter, Download, Calendar, MapPin, DollarSign, Activity } from 'lucide-react';

interface TrendDataItem {
  tahun_anggaran: number;
  total_penerima: number;
  total_nominal: number;
}

interface PerbandinganTahunanItem {
  tahun: number;
  total_keluarga: number;
  total_penerima: number;
  total_distribusi: number;
  coverage_percentage: number;
  efektivitas_distribusi: number;
}

interface TrendDistribusiItem {
  tahun_anggaran: number;
  bulan: number;
  total_distribusi: number;
  total_disalurkan: number;
}

interface TrendPenerimaProps extends PageProps {
  trendData?: TrendDataItem[];
  perbandinganTahunan?: PerbandinganTahunanItem[];
  trendDistribusi?: { [tahun: string]: TrendDistribusiItem[] };
  filters?: {
    tahun_mulai?: string;
    tahun_selesai?: string;
    provinsi?: string;
  };
  tahunTersedia?: number[];
  provinsiList?: string[];
  category?: string;
}

export default function TrendPenerima({
  auth,
  trendData = [],
  perbandinganTahunan = [],
  trendDistribusi = {},
  filters = {},
  tahunTersedia = [],
  provinsiList = [],
  category = 'Trend Penerima PKH'
}: TrendPenerimaProps) {
  const [tahunMulai, setTahunMulai] = useState(filters.tahun_mulai || (new Date().getFullYear() - 2).toString());
  const [tahunSelesai, setTahunSelesai] = useState(filters.tahun_selesai || new Date().getFullYear().toString());
  const [selectedProvinsi, setSelectedProvinsi] = useState(filters.provinsi || 'all');
  const [activeTab, setActiveTab] = useState('trend');
  const exportModal = useExportModal();

  // Breadcrumbs untuk navigasi
  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Laporan PKH', href: route('admin.reports.index') },
    { label: category, active: true },
  ];

  useEffect(() => {
    setTahunMulai(filters.tahun_mulai || (new Date().getFullYear() - 2).toString());
    setTahunSelesai(filters.tahun_selesai || new Date().getFullYear().toString());
    setSelectedProvinsi(filters.provinsi || 'all');
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    switch (key) {
      case 'tahun_mulai':
        setTahunMulai(value);
        break;
      case 'tahun_selesai':
        setTahunSelesai(value);
        break;
      case 'provinsi':
        setSelectedProvinsi(value);
        break;
    }

    const newFilters = {
      tahun_mulai: key === 'tahun_mulai' ? value : tahunMulai,
      tahun_selesai: key === 'tahun_selesai' ? value : tahunSelesai,
      provinsi: key === 'provinsi' ? value : selectedProvinsi
    };

    router.get(route('admin.reports.trend-penerima'), newFilters, { preserveState: true, replace: true });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const getNamaBulan = (bulan: number) => {
    const namaBulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return namaBulan[bulan - 1] || 'Unknown';
  };

  // Calculate summary statistics
  const totalPenerimaAkhir = trendData.length > 0 ? trendData[trendData.length - 1]?.total_penerima || 0 : 0;
  const totalNominalAkhir = trendData.length > 0 ? trendData[trendData.length - 1]?.total_nominal || 0 : 0;
  const avgCoveragePercentage = perbandinganTahunan.length > 0 
    ? perbandinganTahunan.reduce((sum, item) => sum + item.coverage_percentage, 0) / perbandinganTahunan.length 
    : 0;
  const avgEfektivitasDistribusi = perbandinganTahunan.length > 0 
    ? perbandinganTahunan.reduce((sum, item) => sum + item.efektivitas_distribusi, 0) / perbandinganTahunan.length 
    : 0;

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
            <TrendingUp className="w-6 h-6 text-teal-600" />
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
            <h3 className="text-lg font-medium text-slate-900">Filter Analisis Trend PKH</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="tahun_mulai" className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2 text-teal-600" />
                Tahun Mulai
              </label>
              <select
                id="tahun_mulai"
                value={tahunMulai}
                onChange={(e) => handleFilterChange('tahun_mulai', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {tahunTersedia.map((tahun) => (
                  <option key={tahun} value={tahun.toString()}>{tahun}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tahun_selesai" className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2 text-teal-600" />
                Tahun Selesai
              </label>
              <select
                id="tahun_selesai"
                value={tahunSelesai}
                onChange={(e) => handleFilterChange('tahun_selesai', e.target.value)}
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

        {/* Summary Statistics Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={itemVariants}>
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Penerima Terkini</p>
                <p className="text-3xl font-light text-slate-900">{totalPenerimaAkhir.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-blue-600">Nominal Terkini</p>
                <p className="text-2xl font-light text-blue-700">{formatCurrency(totalNominalAkhir)}</p>
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
                <p className="text-sm font-medium text-green-600">Rata-rata Coverage</p>
                <p className="text-3xl font-light text-green-700">{avgCoveragePercentage.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Rata-rata Efektivitas</p>
                <p className="text-3xl font-light text-purple-700">{avgEfektivitasDistribusi.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
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
                onClick={() => setActiveTab('trend')}
                className={`pb-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'trend'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Trend Penerima
              </button>
              <button
                onClick={() => setActiveTab('perbandingan')}
                className={`pb-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'perbandingan'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Perbandingan Tahunan
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
                Trend Distribusi
              </button>
            </nav>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-slate-900">
                {activeTab === 'trend' && 'Trend Penerima PKH'}
                {activeTab === 'perbandingan' && 'Perbandingan Tahunan PKH'}
                {activeTab === 'distribusi' && 'Trend Distribusi Bantuan PKH'}
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
              {activeTab === 'trend' && (
                <motion.div
                  key="trend"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-x-auto"
                >
                  <table className="w-full">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tahun</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Penerima</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Nominal</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pertumbuhan Penerima</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pertumbuhan Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <AnimatePresence>
                        {trendData.length > 0 ? (
                          trendData.map((item, index) => {
                            const prevItem = index > 0 ? trendData[index - 1] : null;
                            const growthPenerima = prevItem 
                              ? ((item.total_penerima - prevItem.total_penerima) / prevItem.total_penerima * 100)
                              : 0;
                            const growthNominal = prevItem 
                              ? ((item.total_nominal - prevItem.total_nominal) / prevItem.total_nominal * 100)
                              : 0;

                            return (
                              <motion.tr
                                key={item.tahun_anggaran}
                                className="hover:bg-slate-50/50 transition-colors duration-200"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-900">{item.tahun_anggaran}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-900">{item.total_penerima.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-900">{formatCurrency(item.total_nominal)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {index > 0 ? (
                                    <span className={`text-sm font-medium ${growthPenerima >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {growthPenerima >= 0 ? '+' : ''}{growthPenerima.toFixed(1)}%
                                    </span>
                                  ) : (
                                    <span className="text-sm text-slate-500">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {index > 0 ? (
                                    <span className={`text-sm font-medium ${growthNominal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {growthNominal >= 0 ? '+' : ''}{growthNominal.toFixed(1)}%
                                    </span>
                                  ) : (
                                    <span className="text-sm text-slate-500">-</span>
                                  )}
                                </td>
                              </motion.tr>
                            );
                          })
                        ) : (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <td colSpan={5} className="px-6 py-16 text-center text-slate-500">Tidak ada data trend penerima.</td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === 'perbandingan' && (
                <motion.div
                  key="perbandingan"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-x-auto"
                >
                  <table className="w-full">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tahun</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Keluarga</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Penerima</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Distribusi</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Coverage (%)</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Efektivitas Distribusi (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <AnimatePresence>
                        {perbandinganTahunan.length > 0 ? (
                          perbandinganTahunan.map((item, index) => (
                            <motion.tr
                              key={item.tahun}
                              className="hover:bg-slate-50/50 transition-colors duration-200"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-900">{item.tahun}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-900">{item.total_keluarga.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-900">{item.total_penerima.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-900">{item.total_distribusi.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-medium ${
                                  item.coverage_percentage >= 70 ? 'text-green-600' :
                                  item.coverage_percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {item.coverage_percentage.toFixed(2)}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-medium ${
                                  item.efektivitas_distribusi >= 80 ? 'text-green-600' :
                                  item.efektivitas_distribusi >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {item.efektivitas_distribusi.toFixed(2)}%
                                </span>
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <td colSpan={6} className="px-6 py-16 text-center text-slate-500">Tidak ada data perbandingan tahunan.</td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
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
                  {Object.keys(trendDistribusi).length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {Object.entries(trendDistribusi).map(([tahun, distribusiData]) => (
                        <motion.div
                          key={tahun}
                          className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl p-6 border border-slate-100"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-cyan-600" />
                            Distribusi Tahun {tahun}
                          </h4>
                          <div className="space-y-3">
                            {distribusiData.map((item) => (
                              <div key={item.bulan} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                <span className="text-sm font-medium text-slate-700">{getNamaBulan(item.bulan)}</span>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-cyan-600">
                                    {item.total_disalurkan} / {item.total_distribusi}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {((item.total_disalurkan / item.total_distribusi) * 100 || 0).toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 text-lg">Tidak ada data trend distribusi untuk ditampilkan</p>
                      <p className="text-slate-400 text-sm">Coba ubah filter tahun atau provinsi</p>
                    </div>
                  )}
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
        category="trend-penerima"
        filters={{
          tahun_mulai: tahunMulai,
          tahun_selesai: tahunSelesai,
          provinsi: selectedProvinsi
        }}
        title="Export Laporan Trend Penerima PKH"
      />
    </AuthenticatedLayout>
  );
}
