import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Link } from '@inertiajs/react';
import { MapPin, Plus } from 'lucide-react';

interface StatistikWilayah {
  kota?: string;
  total?: number;
}

interface RegionalStatsProps {
  regions: StatistikWilayah[];
}

const RegionalStats: React.FC<RegionalStatsProps> = ({ regions }) => {
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-slate-800 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              <span>Statistik Wilayah</span>
            </CardTitle>
            <CardDescription>10 kota dengan keluarga terbanyak</CardDescription>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild size="sm" variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50">
              <Link href={route('admin.keluarga.create')}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Data
              </Link>
            </Button>
          </motion.div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {regions.slice(0, 10).map((wilayah, index) => {
            if (!wilayah || typeof wilayah !== 'object' || !wilayah.kota) return null;

            return (
              <motion.div
                key={wilayah.kota || index}
                className="p-4 border-b border-slate-100 last:border-b-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      index < 3 ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{wilayah.kota}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 text-xs">
                      {wilayah.total || 0} keluarga
                    </Badge>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionalStats;
