import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { Plus, UserCheck } from 'lucide-react';

const QuickActions: React.FC = () => {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-cyan-50/50 to-teal-50/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full"></div>
            <div>
              <h3 className="font-semibold text-slate-800">Aksi Cepat</h3>
              <p className="text-slate-600 text-sm">Kelola data dengan mudah</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white">
                <Link href={route('admin.keluarga.create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Keluarga
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white">
                <Link href={route('anggota-keluarga.create')}>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Tambah Anggota
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
