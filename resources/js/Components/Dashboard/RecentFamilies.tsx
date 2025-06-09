import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Link } from '@inertiajs/react';
import { Calendar, Eye } from 'lucide-react';

interface KeluargaTerbaru {
  id?: number;
  no_kk?: string;
  nama_kepala_keluarga?: string;
  alamat?: string;
  status_ekonomi?: string;
  jumlah_anggota?: number;
  created_at?: string;
}

interface RecentFamiliesProps {
  families: KeluargaTerbaru[];
  getStatusColor: (status: string | undefined) => string;
  formatStatusEkonomi: (status: string | undefined) => string;
}

const RecentFamilies: React.FC<RecentFamiliesProps> = ({
  families,
  getStatusColor,
  formatStatusEkonomi
}) => {
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-slate-800 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>Keluarga Terbaru</span>
            </CardTitle>
            <CardDescription>5 keluarga yang baru terdaftar</CardDescription>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild size="sm" className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white">
              <Link href={route('keluarga.index')}>
                <Eye className="w-4 h-4 mr-2" />
                Lihat Semua
              </Link>
            </Button>
          </motion.div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {families.slice(0, 5).map((keluarga, index) => {
            if (!keluarga || typeof keluarga !== 'object') return null;

            return (
              <motion.div
                key={keluarga.id || index}
                className="p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">
                      {keluarga.nama_kepala_keluarga || 'Nama tidak tersedia'}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {keluarga.no_kk || 'No KK tidak tersedia'}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {keluarga.alamat || 'Alamat tidak tersedia'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className={`text-xs ${getStatusColor(keluarga.status_ekonomi)}`}>
                      {formatStatusEkonomi(keluarga.status_ekonomi)}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">
                      {keluarga.jumlah_anggota || 0} orang
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

export default RecentFamilies;
