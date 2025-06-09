import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/Components/ui/card';
import { Home, Users, AlertTriangle, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface StatisticsCardsProps {
  stats: any;
  formatCurrency: (amount: number) => string;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats, formatCurrency }) => {
  const statsData = [
    {
      label: 'Total Keluarga',
      value: stats.total_keluarga,
      icon: Home,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      trend: '+12%',
      trendUp: true
    },
    {
      label: 'Total Anggota',
      value: stats.total_anggota,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '+8%',
      trendUp: true
    },
    {
      label: 'Sangat Miskin',
      value: stats.keluarga_sangat_miskin,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      trend: '-3%',
      trendUp: false
    },
    {
      label: 'Penghasilan Rata-rata',
      value: stats.penghasilan_rata_rata,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: '+15%',
      trendUp: true,
      isCurrency: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.label}
          whileHover={{
            scale: 1.02,
            y: -5,
            transition: { type: "spring", stiffness: 300 }
          }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-600 mb-1">{stat.label}</p>
                  <motion.p
                    className={`text-2xl font-semibold ${stat.color} mb-2`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: index * 0.1 }}
                  >
                    {stat.isCurrency ? formatCurrency(stat.value) : (stat.value || 0).toLocaleString()}
                  </motion.p>
                  <div className="flex items-center space-x-1">
                    {stat.trendUp ? (
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${
                      stat.trendUp ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {stat.trend}
                    </span>
                    <span className="text-xs text-slate-500">vs bulan lalu</span>
                  </div>
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
    </div>
  );
};

export default StatisticsCards;
