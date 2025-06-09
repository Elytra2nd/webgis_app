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
import { Waves, MapPin, Navigation, DollarSign, Download, Info, CheckCircle } from 'lucide-react';
import { provinsiData, kotaData, getKotaByProvinsi, Provinsi, Kota } from '@/data/provinsiKota';
import { Breadcrumb } from '@/Components/ui/breadcrumb';


export default function Index({ auth }: PageProps) {
    const [selectedCategory, setSelectedCategory] = useState('status-ekonomi');

    const breadcrumbItems = [
        { label: 'Home', href: route('dashboard') },
        { label: 'Laporan', href: route('admin.reports.index') },
        { label: 'Data Keluarga', current: true }
    ];

    const [filters, setFilters] = useState({
        status: 'all',
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

    const categories = [
        {
            id: 'status-ekonomi',
            title: 'Status Ekonomi',
            description: 'Laporan berdasarkan status ekonomi keluarga',
            icon: DollarSign,
            color: 'from-cyan-400 via-teal-500 to-blue-600',
            bgColor: 'bg-gradient-to-br from-cyan-50 to-teal-50',
            borderColor: 'border-cyan-200'
        },
        {
            id: 'wilayah',
            title: 'Per Wilayah',
            description: 'Laporan berdasarkan wilayah geografis',
            icon: MapPin,
            color: 'from-emerald-400 via-green-500 to-teal-600',
            bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50',
            borderColor: 'border-emerald-200'
        },
        {
            id: 'koordinat',
            title: 'Koordinat',
            description: 'Laporan kelengkapan data koordinat',
            icon: Navigation,
            color: 'from-blue-400 via-indigo-500 to-purple-600',
            bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
            borderColor: 'border-blue-200'
        }
    ];

    const handleExport = () => {
        setShowExportModal(true);
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
                        <h1 className="font-light text-2xl text-slate-800 tracking-wide">Laporan Data Keluarga</h1>
                    </div>
                </motion.div>
            }
        >
            <Head title="Laporan" />

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
                                <span>Pilih Kategori Laporan</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                                onClick={() => setSelectedCategory(category.id)}
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

                {/* Filters */}
                <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-6">
                            <CardTitle className="text-xl font-medium text-slate-800 flex items-center space-x-2">
                                <Waves className="w-5 h-5 text-teal-600" />
                                <span>Filter Laporan</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                            <label className="block text-sm font-medium text-slate-700">Status Ekonomi</label>
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
                                    </motion.div>
                                )}

                                {selectedCategory === 'wilayah' && (
                                    <motion.div
                                        key="wilayah"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
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
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-slate-700">
                                                Kota/Kabupaten
                                                {filters.provinsi !== 'all' && (
                                                    <span className="text-xs text-teal-600 ml-1">
                                                        ({availableKota.length} kota tersedia)
                                                    </span>
                                                )}
                                            </label>
                                            <Select
                                                value={filters.kota}
                                                onValueChange={(value) => setFilters({...filters, kota: value})}
                                                disabled={filters.provinsi === 'all'}
                                            >
                                                <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 disabled:opacity-50">
                                                    <SelectValue placeholder={
                                                        filters.provinsi === 'all'
                                                            ? "Pilih provinsi terlebih dahulu"
                                                            : "Pilih kota/kabupaten"
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white/95 backdrop-blur-sm max-h-60">
                                                    <SelectItem value="all">Semua Kota/Kabupaten</SelectItem>
                                                    {availableKota.map((kota) => (
                                                        <SelectItem key={kota.id} value={String(kota.id)}>
                                                            {kota.nama}
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
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Export Actions */}
                <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-cyan-50/30 to-teal-50/30 backdrop-blur-sm">
                        <CardHeader className="pb-6">
                            <CardTitle className="text-xl font-medium text-slate-800 flex items-center space-x-2">
                                <Download className="w-5 h-5 text-teal-600" />
                                <span>Export Laporan</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
                                <div className="flex-1 space-y-2">
                                    <p className="text-slate-700">
                                        Siap untuk export laporan <span className="font-semibold text-teal-700">{categories.find(c => c.id === selectedCategory)?.title}</span>?
                                    </p>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Pilih format export yang diinginkan (PDF atau CSV) dan kustomisasi opsi export.
                                    </p>
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
                                        Export Laporan
                                    </Button>
                                </motion.div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Info */}
                <motion.div variants={itemVariants}>
                    <Alert className="border-0 bg-gradient-to-r from-cyan-50 via-teal-50 to-blue-50 shadow-lg">
                        <Info className="h-5 w-5 text-teal-600" />
                        <div className="ml-2">
                            <h3 className="text-sm font-semibold text-teal-800 mb-2">
                                Informasi Export
                            </h3>
                            <AlertDescription className="text-sm text-teal-700 space-y-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p><strong className="text-teal-800">Format PDF:</strong> Cocok untuk presentasi dan pencetakan dengan layout yang rapi</p>
                                        <p><strong className="text-teal-800">Format CSV:</strong> Cocok untuk analisis data lebih lanjut dengan Excel atau aplikasi spreadsheet</p>
                                    </div>
                                    <div>
                                        <p>Semua export akan menyertakan timestamp dan filter yang diterapkan</p>
                                        <p>File akan otomatis terdownload setelah proses export selesai</p>
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
                title="Export Laporan"
            />
        </AuthenticatedLayout>
    );
}
