import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Skeleton } from '@/Components/ui/skeleton';
import {
  Users,
  Home,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  UserX,
  DollarSign,
  MapPin,
  Calendar,
  Plus,
  Eye,
  Waves,
  BarChart3,
  PieChart,
  Activity,
  Loader2
} from 'lucide-react';

// Lazy load Chart.js components untuk optimasi performa
const Chart = lazy(() => import('react-chartjs-2').then(module => ({
  default: module.Doughnut
})));

const LineChart = lazy(() => import('react-chartjs-2').then(module => ({
  default: module.Line
})));

// Register Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);


const StatisticsCards = lazy(() => import('@/Components/Dashboard/StatisticsCards'));
const RecentFamilies = lazy(() => import('@/Components/Dashboard/RecentFamilies'));
const RegionalStats = lazy(() => import('@/Components/Dashboard/RegionalStats'));
const QuickActions = lazy(() => import('@/Components/Dashboard/QuickActions'));

interface DashboardStats {
  total_keluarga?: number;
  total_anggota?: number;
  keluarga_sangat_miskin?: number;
  keluarga_miskin?: number;
  keluarga_rentan_miskin?: number;
  anggota_laki?: number;
  anggota_perempuan?: number;
  kepala_keluarga?: number;
  penghasilan_rata_rata?: number;
}

interface ChartData {
  status_ekonomi?: {
    labels?: string[];
    data?: number[];
    colors?: string[];
  };
  jenis_kelamin?: {
    labels?: string[];
    data?: number[];
    colors?: string[];
  };
  trend_bulanan?: Array<{
    bulan?: string;
    total?: number;
  }>;
}

interface KeluargaTerbaru {
  id?: number;
  no_kk?: string;
  nama_kepala_keluarga?: string;
  alamat?: string;
  status_ekonomi?: string;
  jumlah_anggota?: number;
  created_at?: string;
}

interface StatistikWilayah {
  kota?: string;
  total?: number;
}

interface DashboardProps extends PageProps {
  stats?: DashboardStats;
  charts?: ChartData;
  keluarga_terbaru?: KeluargaTerbaru[];
  statistik_wilayah?: StatistikWilayah[];
}

// Loading Skeleton Components
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
    <CardHeader className="pb-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[300px] w-full" />
    </CardContent>
  </Card>
);

const ListSkeleton = () => (
  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <div className="space-y-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-slate-100 last:border-b-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard({
  auth,
  stats,
  charts,
  keluarga_terbaru,
  statistik_wilayah
}: DashboardProps) {
  const [isChartsLoaded, setIsChartsLoaded] = useState(false);
  const [chartsError, setChartsError] = useState<string | null>(null);

  // Safe defaults dengan defensive checking yang lebih ketat
  const safeStats: Required<DashboardStats> = {
    total_keluarga: stats?.total_keluarga ?? 0,
    total_anggota: stats?.total_anggota ?? 0,
    keluarga_sangat_miskin: stats?.keluarga_sangat_miskin ?? 0,
    keluarga_miskin: stats?.keluarga_miskin ?? 0,
    keluarga_rentan_miskin: stats?.keluarga_rentan_miskin ?? 0,
    anggota_laki: stats?.anggota_laki ?? 0,
    anggota_perempuan: stats?.anggota_perempuan ?? 0,
    kepala_keluarga: stats?.kepala_keluarga ?? 0,
    penghasilan_rata_rata: stats?.penghasilan_rata_rata ?? 0
  };

  const safeCharts: ChartData = {
    status_ekonomi: charts?.status_ekonomi ? {
      labels: charts.status_ekonomi.labels ?? ['Sangat Miskin', 'Miskin', 'Rentan Miskin'],
      data: charts.status_ekonomi.data ?? [0, 0, 0],
      colors: charts.status_ekonomi.colors ?? ['#ef4444', '#f59e0b', '#06b6d4']
    } : undefined,
    jenis_kelamin: charts?.jenis_kelamin ? {
      labels: charts.jenis_kelamin.labels ?? ['Laki-laki', 'Perempuan'],
      data: charts.jenis_kelamin.data ?? [0, 0],
      colors: charts.jenis_kelamin.colors ?? ['#3b82f6', '#ec4899']
    } : undefined,
    trend_bulanan: Array.isArray(charts?.trend_bulanan) ? charts.trend_bulanan : []
  };

  const safeKeluargaTerbaru: KeluargaTerbaru[] = Array.isArray(keluarga_terbaru)
    ? keluarga_terbaru.filter(item => item && typeof item === 'object')
    : [];

  const safeStatistikWilayah: StatistikWilayah[] = Array.isArray(statistik_wilayah)
    ? statistik_wilayah.filter(item => item && typeof item === 'object')
    : [];

  // Preload charts when component mounts
  useEffect(() => {
    const preloadCharts = async () => {
      try {
        await Promise.all([
          import('react-chartjs-2'),
          import('chart.js')
        ]);
        setIsChartsLoaded(true);
      } catch (error) {
        console.error('Failed to load charts:', error);
        setChartsError('Failed to load charts');
      }
    };

    if (safeCharts.status_ekonomi || safeCharts.jenis_kelamin || safeCharts.trend_bulanan?.length) {
      preloadCharts();
    }
  }, [safeCharts]);

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

  // Safe utility functions
  const formatCurrency = (amount: number | undefined | null): string => {
    if (!amount || isNaN(Number(amount))) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const getStatusColor = (status: string | undefined): string => {
    if (!status) return 'bg-gray-100 text-gray-800 border border-gray-200';

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

  const formatStatusEkonomi = (status: string | undefined): string => {
    if (!status) return 'Tidak Diketahui';

    const statusMap: { [key: string]: string } = {
      'sangat_miskin': 'Sangat Miskin',
      'miskin': 'Miskin',
      'rentan_miskin': 'Rentan Miskin'
    };
    return statusMap[status] || status;
  };

  // Chart data dengan lazy loading
  const statusEkonomiChartData = {
    labels: safeCharts.status_ekonomi?.labels || ['Sangat Miskin', 'Miskin', 'Rentan Miskin'],
    datasets: [
      {
        data: safeCharts.status_ekonomi?.data || [0, 0, 0],
        backgroundColor: safeCharts.status_ekonomi?.colors || ['#ef4444', '#f59e0b', '#06b6d4'],
        borderWidth: 0,
        hoverBackgroundColor: (safeCharts.status_ekonomi?.colors || ['#ef4444', '#f59e0b', '#06b6d4']).map(color => color + 'CC'),
      },
    ],
  };

  const jenisKelaminChartData = {
    labels: safeCharts.jenis_kelamin?.labels || ['Laki-laki', 'Perempuan'],
    datasets: [
      {
        data: safeCharts.jenis_kelamin?.data || [0, 0],
        backgroundColor: safeCharts.jenis_kelamin?.colors || ['#3b82f6', '#ec4899'],
        borderWidth: 0,
        hoverBackgroundColor: (safeCharts.jenis_kelamin?.colors || ['#3b82f6', '#ec4899']).map(color => color + 'CC'),
      },
    ],
  };

  const trendBulananChartData = {
    labels: safeCharts.trend_bulanan?.map(item => item?.bulan || '') || [],
    datasets: [
      {
        label: 'Jumlah Keluarga',
        data: safeCharts.trend_bulanan?.map(item => item?.total || 0) || [],
        borderColor: '#06b6d4',
        backgroundColor: '#06b6d4',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Early return dengan loading state yang lebih informatif
  if (!stats && !charts && (!keluarga_terbaru || keluarga_terbaru.length === 0) && (!statistik_wilayah || statistik_wilayah.length === 0)) {
    return (
      <AuthenticatedLayout user={auth.user}>
        <Head title="Dashboard" />
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
                <Activity className="w-10 h-10 text-cyan-500" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Memuat Dashboard</h2>
              <p className="text-slate-600 mb-6">Mohon tunggu sebentar...</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white">
                  <Link href={route('keluarga.create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Data Keluarga
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Dashboard" />

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
            <Activity className="w-8 h-8 text-teal-600" />
            <div>
              <h1 className="font-semibold text-3xl text-slate-800 tracking-wide">Dashboard</h1>
              <p className="text-slate-600 mt-1">Selamat datang, {auth.user?.name || 'User'}!</p>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards dengan Lazy Loading */}
        <motion.div variants={itemVariants}>
          <Suspense fallback={<StatsSkeleton />}>
            <StatisticsCards stats={safeStats} formatCurrency={formatCurrency} />
          </Suspense>
        </motion.div>

        {/* Charts Section dengan Lazy Loading */}
        {(safeCharts.status_ekonomi || safeCharts.jenis_kelamin || (safeCharts.trend_bulanan && safeCharts.trend_bulanan.length > 0)) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Status Ekonomi Chart */}
            {safeCharts.status_ekonomi && (
              <motion.div variants={itemVariants}>
                <Suspense fallback={<ChartSkeleton />}>
                  {isChartsLoaded && !chartsError ? (
                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800 flex items-center space-x-2">
                          <PieChart className="w-5 h-5 text-teal-600" />
                          <span>Status Ekonomi</span>
                        </CardTitle>
                        <CardDescription>Distribusi status ekonomi keluarga</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div style={{ height: '300px' }}>
                          <Chart data={statusEkonomiChartData} options={chartOptions} />
                        </div>
                      </CardContent>
                    </Card>
                  ) : chartsError ? (
                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
                      <CardContent className="p-8 text-center">
                        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <p className="text-slate-600">Gagal memuat chart</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
                      <CardContent className="p-8 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-4" />
                        <p className="text-slate-600">Memuat chart...</p>
                      </CardContent>
                    </Card>
                  )}
                </Suspense>
              </motion.div>
            )}

            {/* Jenis Kelamin Chart */}
            {safeCharts.jenis_kelamin && (
              <motion.div variants={itemVariants}>
                <Suspense fallback={<ChartSkeleton />}>
                  {isChartsLoaded && !chartsError ? (
                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800 flex items-center space-x-2">
                          <Users className="w-5 h-5 text-teal-600" />
                          <span>Jenis Kelamin</span>
                        </CardTitle>
                        <CardDescription>Distribusi jenis kelamin anggota</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div style={{ height: '300px' }}>
                          <Chart data={jenisKelaminChartData} options={chartOptions} />
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <ChartSkeleton />
                  )}
                </Suspense>
              </motion.div>
            )}

            {/* Trend Bulanan Chart */}
            {safeCharts.trend_bulanan && safeCharts.trend_bulanan.length > 0 && (
              <motion.div variants={itemVariants}>
                <Suspense fallback={<ChartSkeleton />}>
                  {isChartsLoaded && !chartsError ? (
                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800 flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5 text-teal-600" />
                          <span>Trend Bulanan</span>
                        </CardTitle>
                        <CardDescription>Pertumbuhan keluarga 6 bulan terakhir</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div style={{ height: '300px' }}>
                          <LineChart data={trendBulananChartData} options={lineChartOptions} />
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <ChartSkeleton />
                  )}
                </Suspense>
              </motion.div>
            )}
          </div>
        )}

        {/* Recent Data and Statistics dengan Lazy Loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Keluarga Terbaru */}
          {safeKeluargaTerbaru.length > 0 && (
            <motion.div variants={itemVariants}>
              <Suspense fallback={<ListSkeleton />}>
                <RecentFamilies
                  families={safeKeluargaTerbaru}
                  getStatusColor={getStatusColor}
                  formatStatusEkonomi={formatStatusEkonomi}
                />
              </Suspense>
            </motion.div>
          )}

          {/* Statistik Wilayah */}
          {safeStatistikWilayah.length > 0 && (
            <motion.div variants={itemVariants}>
              <Suspense fallback={<ListSkeleton />}>
                <RegionalStats regions={safeStatistikWilayah} />
              </Suspense>
            </motion.div>
          )}
        </div>

        {/* Quick Actions dengan Lazy Loading */}
        <motion.div variants={itemVariants}>
          <Suspense fallback={
            <Card className="border-0 shadow-lg bg-gradient-to-r from-cyan-50/50 to-teal-50/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          }>
            <QuickActions />
          </Suspense>
        </motion.div>
      </motion.div>
    </AuthenticatedLayout>
  );
}
