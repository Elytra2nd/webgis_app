import React, { useState, useEffect, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ExportModal from '@/Components/ExportModal';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Waves, MapPin, Navigation, DollarSign, Download, Info, CheckCircle, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { provinsiData, kotaData, getKotaByProvinsi, Provinsi, Kota } from '@/data/provinsiKota';
import { Breadcrumb } from '@/Components/ui/breadcrumb';

export default function Index({ auth }: PageProps) {
    const [selectedCategory, setSelectedCategory] = useState('status-ekonomi');

    // PERBAIKAN: Menggunakan route admin yang sebenarnya berdasarkan route list
    const breadcrumbItems = [
        { label: 'Home', href: route('dashboard') },
        { label: 'Laporan PKH', href: route('admin.reports.index') }, // Menggunakan route admin yang benar
        { label: 'Data Keluarga Penerima', current: true }
    ];

    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        status_bantuan: 'all',
        tahun: new Date().getFullYear().toString(),
        wilayah: 'all',
        bulan: 'all',
        provinsi: 'all',
        kota: 'all'
    });
    const [showExportModal, setShowExportModal] = useState(false);

    // Mendapatkan daftar kota berdasarkan provinsi yang dipilih
    const availableKota = useMemo(() => {
        if (filters.provinsi === 'all') {
            return kotaData;
        }
        return getKotaByProvinsi(filters.provinsi);
    }, [filters.provinsi]);

    // Reset kota ketika provinsi berubah
    useEffect(() => {
        if (filters.provinsi !== 'all') {
            const kotaExists = availableKota.some(kota => String(kota.id) === filters.kota);
            if (!kotaExists) {
                setFilters(prev => ({ ...prev, kota: 'all' }));
            }
        }
    }, [filters.provinsi, availableKota]);

    // UPDATE: Categories sesuai dengan route yang tersedia
    const categories = [
        {
            id: 'status-ekonomi',
            title: 'Status Ekonomi PKH',
            description: 'Laporan berdasarkan status ekonomi keluarga penerima PKH',
            icon: DollarSign,
            color: 'from-cyan-400 via-teal-500 to-blue-600',
            bgColor: 'bg-gradient-to-br from-cyan-50 to-teal-50',
            borderColor: 'border-cyan-200',
            route: 'admin.reports.index' // Route dasar untuk export
        },
        {
            id: 'wilayah',
            title: 'Sebaran Wilayah PKH',
            description: 'Laporan sebaran geografis penerima bantuan PKH',
            icon: MapPin,
            color: 'from-emerald-400 via-green-500 to-teal-600',
            bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50',
            borderColor: 'border-emerald-200',
            route: 'admin.reports.sebaran-wilayah'
        },
        {
            id: 'koordinat',
            title: 'Data Koordinat PKH',
            description: 'Laporan kelengkapan data koordinat rumah penerima PKH',
            icon: Navigation,
            color: 'from-blue-400 via-indigo-500 to-purple-600',
            bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
            borderColor: 'border-blue-200',
            route: 'admin.reports.index'
        },
        {
            id: 'pkh',
            title: 'Laporan PKH',
            description: 'Laporan khusus Program Keluarga Harapan',
            icon: Users,
            color: 'from-purple-400 via-pink-500 to-red-600',
            bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
            borderColor: 'border-purple-200',
            route: 'admin.reports.pkh'
        },
        {
            id: 'trend-penerima',
            title: 'Trend Penerima PKH',
            description: 'Analisis trend dan perkembangan penerima PKH',
            icon: TrendingUp,
            color: 'from-orange-400 via-amber-500 to-yellow-600',
            bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
            borderColor: 'border-orange-200',
            route: 'admin.reports.trend-penerima'
        },
        {
            id: 'efektivitas',
            title: 'Efektivitas Program PKH',
            description: 'Evaluasi efektivitas dan dampak program PKH',
            icon: BarChart3,
            color: 'from-indigo-400 via-blue-500 to-cyan-600',
            bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-50',
            borderColor: 'border-indigo-200',
            route: 'admin.reports.efektivitas'
        }
    ];

    const handleExport = () => {
        setShowExportModal(true);
    };

    // TAMBAHAN: Generate tahun untuk filter
    const availableYears = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = 2020; year <= currentYear + 1; year++) {
            years.push(year);
        }
        return years;
    }, []);

    // TAMBAHAN: Handle navigation ke kategori tertentu
    const handleCategoryNavigation = (category: any) => {
        if (category.route && category.route !== 'admin.reports.index') {
            window.location.href = route(category.route);
        }
    };

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

    const waveVariants = {
        animate: {
            x: [0, -20, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            breadcrumbs={breadcrumbItems}
            header={
                <motion.div
                    className="flex items-center space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="relative"
                        variants={waveVariants}
                        animate="animate"
                    >
                        <div className="w-3 h-8 bg-gradient-to-b from-cyan-400 via-teal-500 to-blue-600 rounded-full shadow-lg"></div>
                        <div className="absolute -top-1 -left-1 w-5 h-10 bg-gradient-to-b from-cyan-300/30 via-teal-400/30 to-blue-500/30 rounded-full blur-sm"></div>
                    </motion.div>
                    <div className="flex items-center space-x-3">
                        <Waves className="w-6 h-6 text-teal-600" />
                        <h1 className="font-light text-2xl text-slate-800 tracking-wide">Laporan Program Keluarga Harapan (PKH)</h1>
                    </div>
                </motion.div>
            }
        >
            <Head title="Laporan PKH" />

            <motion.div
                className="space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Category Selection */}
                <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-6">
                            <CardTitle className="text-xl font-medium text-slate-800 flex items-center space-x-2">
                                <Waves className="w-5 h-5 text-teal-600" />
                                <span>Pilih Kategori Laporan PKH</span>
                            </CardTitle>
                            <CardDescription className="text-slate-600">
                                Pilih jenis laporan Program Keluarga Harapan yang ingin Anda export atau akses
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {categories.map((category, index) => {
                                        const IconComponent = category.icon;
                                        return (
                                            <motion.div
                                                key={category.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{
                                                    scale: 1.02,
                                                    y: -5,
                                                    transition: { type: "spring", stiffness: 300 }
                                                }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden ${
                                                    selectedCategory === category.id
                                                        ? `${category.borderColor} ${category.bgColor} shadow-xl ring-2 ring-cyan-200/50`
                                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'
                                                }`}
                                                onClick={() => {
                                                    setSelectedCategory(category.id);
                                                    // TAMBAHAN: Auto navigate untuk kategori khusus
                                                    if (category.id !== 'status-ekonomi' && category.id !== 'koordinat') {
                                                        handleCategoryNavigation(category);
                                                    }
                                                }}
                                            >
                                                <div className="absolute inset-0 opacity-5">
                                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                                        <defs>
                                                            <pattern id={`waves-${category.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                                <path d="M0 10 Q5 0 10 10 T20 10" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                                                            </pattern>
                                                        </defs>
                                                        <rect width="100" height="100" fill={`url(#waves-${category.id})`}/>
                                                    </svg>
                                                </div>

                                                <div className="relative text-center">
                                                    <motion.div
                                                        className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                                                        whileHover={{ rotate: 5 }}
                                                        transition={{ type: "spring", stiffness: 300 }}
                                                    >
                                                        <IconComponent className="w-7 h-7 text-white" />
                                                    </motion.div>
                                                    <h4 className="font-semibold text-slate-800 mb-2">{category.title}</h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed">{category.description}</p>

                                                    {/* TAMBAHAN: Indicator untuk kategori dengan halaman khusus */}
                                                    {category.route !== 'admin.reports.index' && (
                                                        <div className="mt-3">
                                                            <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                                                                Halaman Khusus
                                                            </Badge>
                                                        </div>
                                                    )}

                                                    <AnimatePresence>
                                                        {selectedCategory === category.id && (
                                                            <motion.div
                                                                className="mt-4"
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                transition={{ type: "spring", stiffness: 300 }}
                                                            >
                                                                <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border-cyan-200">
                                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                                    Terpilih
                                                                </Badge>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Filters - Hanya tampil untuk kategori yang bisa di-export */}
                {(selectedCategory === 'status-ekonomi' || selectedCategory === 'koordinat') && (
                    <motion.div variants={itemVariants}>
                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                            <CardHeader className="pb-6">
                                <CardTitle className="text-xl font-medium text-slate-800 flex items-center space-x-2">
                                    <Waves className="w-5 h-5 text-teal-600" />
                                    <span>Filter Laporan PKH</span>
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Sesuaikan filter untuk mendapatkan data PKH yang spesifik
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Filter Umum - Tahun dan Bulan */}
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">Tahun Anggaran PKH</label>
                                        <Select value={filters.tahun} onValueChange={(value) => setFilters({...filters, tahun: value})}>
                                            <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20">
                                                <SelectValue placeholder="Pilih tahun anggaran" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white/95 backdrop-blur-sm">
                                                {availableYears.map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">Periode Bulan</label>
                                        <Select value={filters.bulan} onValueChange={(value) => setFilters({...filters, bulan: value})}>
                                            <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20">
                                                <SelectValue placeholder="Pilih periode bulan" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white/95 backdrop-blur-sm">
                                                <SelectItem value="all">Semua Bulan</SelectItem>
                                                <SelectItem value="1">Januari</SelectItem>
                                                <SelectItem value="2">Februari</SelectItem>
                                                <SelectItem value="3">Maret</SelectItem>
                                                <SelectItem value="4">April</SelectItem>
                                                <SelectItem value="5">Mei</SelectItem>
                                                <SelectItem value="6">Juni</SelectItem>
                                                <SelectItem value="7">Juli</SelectItem>
                                                <SelectItem value="8">Agustus</SelectItem>
                                                <SelectItem value="9">September</SelectItem>
                                                <SelectItem value="10">Oktober</SelectItem>
                                                <SelectItem value="11">November</SelectItem>
                                                <SelectItem value="12">Desember</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </motion.div>

                                {/* Filter Spesifik per Kategori */}
                                <AnimatePresence mode="wait">
                                    {selectedCategory === 'status-ekonomi' && (
                                        <motion.div
                                            key="status-ekonomi"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                        >
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-slate-700">Status Ekonomi Keluarga</label>
                                                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                                                    <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20">
                                                        <SelectValue placeholder="Pilih status ekonomi" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white/95 backdrop-blur-sm">
                                                        <SelectItem value="all">Semua Status</SelectItem>
                                                        <SelectItem value="sangat_miskin">Sangat Miskin</SelectItem>
                                                        <SelectItem value="miskin">Miskin</SelectItem>
                                                        <SelectItem value="rentan_miskin">Rentan Miskin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-slate-700">Provinsi</label>
                                                <Select
                                                    value={filters.provinsi}
                                                    onValueChange={(value) => setFilters({...filters, provinsi: value})}
                                                >
                                                    <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20">
                                                        <SelectValue placeholder="Pilih provinsi" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white/95 backdrop-blur-sm max-h-60">
                                                        <SelectItem value="all">Semua Provinsi</SelectItem>
                                                        {provinsiData.map((provinsi) => (
                                                            <SelectItem key={provinsi.id} value={String(provinsi.id)}>
                                                                {provinsi.nama}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </motion.div>
                                    )}

                                    {selectedCategory === 'koordinat' && (
                                        <motion.div
                                            key="koordinat"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                        >
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-slate-700">Status Koordinat</label>
                                                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                                                    <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20">
                                                        <SelectValue placeholder="Pilih status koordinat" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white/95 backdrop-blur-sm">
                                                        <SelectItem value="all">Semua Status</SelectItem>
                                                        <SelectItem value="complete">Sudah Ada Koordinat</SelectItem>
                                                        <SelectItem value="incomplete">Belum Ada Koordinat</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-slate-700">Provinsi</label>
                                                <Select
                                                    value={filters.provinsi}
                                                    onValueChange={(value) => setFilters({...filters, provinsi: value})}
                                                >
                                                    <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20">
                                                        <SelectValue placeholder="Pilih provinsi" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white/95 backdrop-blur-sm max-h-60">
                                                        <SelectItem value="all">Semua Provinsi</SelectItem>
                                                        {provinsiData.map((provinsi) => (
                                                            <SelectItem key={provinsi.id} value={String(provinsi.id)}>
                                                                {provinsi.nama}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Export Actions - Hanya tampil untuk kategori yang bisa di-export */}
                {(selectedCategory === 'status-ekonomi' || selectedCategory === 'koordinat') && (
                    <motion.div variants={itemVariants}>
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-cyan-50/30 to-teal-50/30 backdrop-blur-sm">
                            <CardHeader className="pb-6">
                                <CardTitle className="text-xl font-medium text-slate-800 flex items-center space-x-2">
                                    <Download className="w-5 h-5 text-teal-600" />
                                    <span>Export Laporan PKH</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
                                    <div className="flex-1 space-y-2">
                                        <p className="text-slate-700">
                                            Siap untuk export laporan <span className="font-semibold text-teal-700">{categories.find(c => c.id === selectedCategory)?.title}</span>?
                                        </p>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            Pilih format export yang diinginkan (PDF atau CSV) dan kustomisasi opsi export untuk laporan Program Keluarga Harapan.
                                        </p>
                                        <div className="flex items-center space-x-4 text-xs text-slate-500 mt-3">
                                            <span>📅 Tahun: {filters.tahun}</span>
                                            {filters.bulan !== 'all' && <span>📆 Bulan: {filters.bulan}</span>}
                                            {filters.provinsi !== 'all' && <span>📍 Provinsi: Terpilih</span>}
                                        </div>
                                    </div>

                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            onClick={handleExport}
                                            className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                                        >
                                            <Download className="w-5 h-5 mr-2" />
                                            Export Laporan PKH
                                        </Button>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Info */}
                <motion.div variants={itemVariants}>
                    <Alert className="border-0 bg-gradient-to-r from-cyan-50 via-teal-50 to-blue-50 shadow-lg">
                        <Info className="h-5 w-5 text-teal-600" />
                        <div className="ml-2">
                            <h3 className="text-sm font-semibold text-teal-800 mb-2">
                                Informasi Laporan PKH
                            </h3>
                            <AlertDescription className="text-sm text-teal-700 space-y-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p><strong className="text-teal-800">Export Tersedia:</strong> Status Ekonomi dan Koordinat dapat di-export dalam format PDF/CSV</p>
                                        <p><strong className="text-teal-800">Halaman Khusus:</strong> Kategori lain memiliki halaman laporan tersendiri dengan fitur lengkap</p>
                                    </div>
                                    <div>
                                        <p>Semua export akan menyertakan timestamp, filter yang diterapkan, dan metadata PKH</p>
                                        <p>File akan otomatis terdownload setelah proses export selesai</p>
                                        <p className="text-xs text-teal-600 mt-2">
                                            💡 Klik kategori untuk mengakses halaman laporan khusus atau export data
                                        </p>
                                    </div>
                                </div>
                            </AlertDescription>
                        </div>
                    </Alert>
                </motion.div>
            </motion.div>

            {/* Export Modal */}
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                category={selectedCategory}
                filters={filters}
                title="Export Laporan Program Keluarga Harapan (PKH)"
                statistics={{
                    total_penerima: 0,
                    total_distribusi: 0,
                    persentase_distribusi: 0,
                    rata_rata_bantuan: 0
                }}
            />
        </AuthenticatedLayout>
    );
}
