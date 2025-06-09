import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { useToast } from '@/Hooks/use-toast';
import DeleteConfirmationDialog from '@/Components/DeleteConfirmationDialog';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Waves,
  UserCheck,
  UserX,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2
} from 'lucide-react';

// Tipe data untuk satu anggota keluarga
interface AnggotaKeluarga {
    id: number;
    nik: string;
    nama: string;
    jenis_kelamin: 'L' | 'P';
    tempat_lahir: string;
    tanggal_lahir: string;
    status_dalam_keluarga: string;
    status_perkawinan: string;
    pendidikan_terakhir: string;
    pekerjaan: string;
    keluarga: {
        id: number;
        no_kk: string;
        nama_kepala_keluarga: string;
    };
}

// Tipe data untuk response paginasi Laravel
interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface Pagination<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLinks[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface IndexProps extends PageProps {
    anggotaKeluarga: Pagination<AnggotaKeluarga>;
}

const Index: React.FC<IndexProps> = ({ auth, anggotaKeluarga }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filteredData, setFilteredData] = useState<AnggotaKeluarga[]>(anggotaKeluarga.data);
    const [isFiltering, setIsFiltering] = useState(false);

    // Delete states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAnggota, setSelectedAnggota] = useState<AnggotaKeluarga | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { toast } = useToast();

    // Format tanggal lahir ke DD/MM/YYYY
    const formatTanggalLahir = (tanggal: string) => {
        if (!tanggal) return '-';
        if (tanggal.includes('T')) {
            const dateOnly = tanggal.split('T')[0];
            const [year, month, day] = dateOnly.split('-');
            return `${day}/${month}/${year}`;
        }
        return tanggal;
    };

    // Filter function dengan animasi
    const applyFilters = () => {
        setIsFiltering(true);

        let filtered = anggotaKeluarga.data;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(anggota =>
                anggota.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                anggota.nik.includes(searchTerm)
            );
        }

        // Apply gender filter
        if (filterGender !== 'all') {
            filtered = filtered.filter(anggota => anggota.jenis_kelamin === filterGender);
        }

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(anggota =>
                anggota.status_dalam_keluarga.toLowerCase().includes(filterStatus.toLowerCase())
            );
        }

        // Simulate loading untuk animasi
        setTimeout(() => {
            setFilteredData(filtered);
            setIsFiltering(false);

            // Show toast notification
            const activeFilters = [];
            if (searchTerm) activeFilters.push(`pencarian: "${searchTerm}"`);
            if (filterGender !== 'all') activeFilters.push(`jenis kelamin: ${filterGender === 'L' ? 'Laki-laki' : 'Perempuan'}`);
            if (filterStatus !== 'all') activeFilters.push(`status: ${filterStatus}`);

            if (activeFilters.length > 0) {
                toast({
                    title: "Filter Diterapkan",
                    description: `Menampilkan ${filtered.length} hasil dengan filter: ${activeFilters.join(', ')}`,
                    variant: "default",
                });
            } else {
                toast({
                    title: "Filter Direset",
                    description: `Menampilkan semua ${filtered.length} anggota keluarga`,
                    variant: "default",
                });
            }
        }, 300);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setFilterGender('all');
        setFilterStatus('all');
        setFilteredData(anggotaKeluarga.data);

        toast({
            title: "Filter Dibersihkan",
            description: "Semua filter telah dihapus",
            variant: "default",
        });
    };

    // Apply filters when any filter changes
    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterGender, filterStatus]);

    // Handle delete
    const handleDeleteClick = (anggota: AnggotaKeluarga) => {
        setSelectedAnggota(anggota);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedAnggota) return;

        setIsDeleting(true);

        try {
            await router.delete(route('anggota-keluarga.destroy', selectedAnggota.id), {
                preserveScroll: true,
                onStart: () => {
                    toast({
                        title: "Menghapus Data",
                        description: "Sedang menghapus data anggota keluarga...",
                        variant: "default",
                    });
                },
                onSuccess: () => {
                    // Update filtered data
                    setFilteredData(prev => prev.filter(item => item.id !== selectedAnggota.id));

                    toast({
                        title: "Data Berhasil Dihapus! 🗑️",
                        description: `Data ${selectedAnggota.nama} telah berhasil dihapus dari sistem.`,
                        variant: "default",
                    });

                    handleDeleteCancel();
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                    toast({
                        title: "Gagal Menghapus Data",
                        description: "Terjadi kesalahan saat menghapus data. Silakan coba lagi.",
                        variant: "destructive",
                    });
                },
                onFinish: () => {
                    setIsDeleting(false);
                }
            });
        } catch (error) {
            console.error('Delete error:', error);
            toast({
                title: "Gagal Menghapus Data",
                description: "Terjadi kesalahan saat menghapus data. Silakan coba lagi.",
                variant: "destructive",
            });
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setSelectedAnggota(null);
        setIsDeleting(false);
    };

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

    const filterVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 200, damping: 20 }
        }
    };

    const tableRowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: "spring", stiffness: 100 }
        },
        exit: {
            opacity: 0,
            x: 20,
            transition: { duration: 0.2 }
        }
    };

    const waveVariants = {
        animate: {
            x: [0, -20, 0],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
    };

    // Get statistics dari filtered data
    const getStats = () => ({
        total: filteredData.length,
        laki: filteredData.filter(a => a.jenis_kelamin === 'L').length,
        perempuan: filteredData.filter(a => a.jenis_kelamin === 'P').length,
        kepala: filteredData.filter(a => a.status_dalam_keluarga.toLowerCase().includes('kepala')).length,
    });

    const stats = getStats();

    // Check if any filter is active
    const hasActiveFilters = searchTerm || filterGender !== 'all' || filterStatus !== 'all';

    // Breadcrumb
    const breadcrumbs = [
        { label: 'Dashboard', href: route('dashboard') },
        { label: 'Anggota Keluarga', current: true }
    ];

    return (
        <AuthenticatedLayout user={auth.user} breadcrumbs={breadcrumbs}>
            <Head title="Daftar Anggota Keluarga" />

            <style>{`
                .name-cell { font-weight: 600; color: #1e293b; font-size: 0.875rem; line-height: 1.25rem; }
                .kk-info { font-family: 'Courier New', monospace; font-size: 0.8rem; background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 0.375rem; display: inline-block; }
                .kepala-keluarga-info { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; }
                .date-display { font-size: 0.875rem; color: #374151; font-weight: 500; }
                .filter-loading { animation: pulse 1s infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>

            <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div className="flex items-center space-x-4 mb-8" variants={itemVariants}>
                    <motion.div className="relative" variants={waveVariants} animate="animate">
                        <div className="w-3 h-10 bg-gradient-to-b from-cyan-400 via-teal-500 to-blue-600 rounded-full shadow-lg"></div>
                        <div className="absolute -top-1 -left-1 w-5 h-12 bg-gradient-to-b from-cyan-300/30 via-teal-400/30 to-blue-500/30 rounded-full blur-sm"></div>
                    </motion.div>
                    <div className="flex items-center space-x-3">
                        <Users className="w-8 h-8 text-teal-600" />
                        <h1 className="font-semibold text-3xl text-slate-800 tracking-wide">Data Anggota Keluarga</h1>
                    </div>
                </motion.div>

                {/* Statistics Cards dengan animasi update */}
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={itemVariants}>
                    {[
                        { label: 'Total Anggota', value: stats.total, icon: Users, color: 'font-semibold text-cyan-600', bg: 'bg-cyan-50' },
                        { label: 'Laki-laki', value: stats.laki, icon: UserCheck, color: 'font-semibold text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Perempuan', value: stats.perempuan, icon: UserX, color: 'font-semibold text-pink-600', bg: 'bg-pink-50' },
                        { label: 'Kepala Keluarga', value: stats.kepala, icon: UserCheck, color: 'font-semibold text-emerald-600', bg: 'bg-emerald-50' }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            whileHover={{ scale: 1.02, y: -5, transition: { type: "spring", stiffness: 300 }}}
                            whileTap={{ scale: 0.98 }}
                            layout
                        >
                            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
                                            <motion.p
                                                className={`text-3xl font-light ${stat.color}`}
                                                key={stat.value}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: "spring", stiffness: 200 }}
                                            >
                                                {stat.value}
                                            </motion.p>
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
                </motion.div>

                {/* Main Content Card */}
                <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
                        {/* Header */}
                        <CardHeader className="pb-6 bg-gradient-to-r from-cyan-50/50 to-teal-50/50 border-b border-gray-100/50">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div>
                                    <CardTitle className="text-xl font-medium text-slate-800 flex items-center space-x-2">
                                        <Waves className="w-5 h-5 text-teal-600" />
                                        <span>Daftar Anggota Keluarga</span>
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Kelola informasi anggota keluarga dengan mudah dan efisien
                                    </CardDescription>
                                </div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button asChild className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                                        <Link href={route('anggota-keluarga.create')}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Tambah Anggota
                                        </Link>
                                    </Button>
                                </motion.div>
                            </div>

                            {/* Filters dengan animasi */}
                            <motion.div className="mt-6 space-y-4" variants={filterVariants}>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <motion.div
                                        className="relative"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        whileFocus={{ scale: 1.02 }}
                                    >
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                                        <Input
                                            placeholder="Cari nama atau NIK..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 h-10 transition-all duration-200"
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        whileFocus={{ scale: 1.02 }}
                                    >
                                        <Select value={filterGender} onValueChange={setFilterGender}>
                                            <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 h-10 transition-all duration-200">
                                                <SelectValue placeholder="Filter Jenis Kelamin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Jenis Kelamin</SelectItem>
                                                <SelectItem value="L">Laki-laki</SelectItem>
                                                <SelectItem value="P">Perempuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex justify-end"
                                        whileFocus={{ scale: 1.02 }}
                                    >
                                        <div className="w-64">
                                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                                <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 h-10 transition-all duration-200">
                                                    <SelectValue placeholder="Filter Status Keluarga" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Status Keluarga</SelectItem>
                                                    <SelectItem value="kepala">Kepala Keluarga</SelectItem>
                                                    <SelectItem value="istri">Istri</SelectItem>
                                                    <SelectItem value="anak">Anak</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Active Filters Display */}
                                <AnimatePresence>
                                    {hasActiveFilters && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex items-center justify-between bg-cyan-50 rounded-lg p-3 border border-cyan-200"
                                        >
                                            <div className="flex items-center space-x-2 flex-wrap gap-2">
                                                <Filter className="w-4 h-4 text-cyan-600" />
                                                <span className="text-sm font-medium text-cyan-700">Filter aktif:</span>
                                                {searchTerm && (
                                                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                                                        Pencarian: "{searchTerm}"
                                                    </Badge>
                                                )}
                                                {filterGender !== 'all' && (
                                                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                                                        {filterGender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                    </Badge>
                                                )}
                                                {filterStatus !== 'all' && (
                                                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                                                        {filterStatus}
                                                    </Badge>
                                                )}
                                            </div>
                                            <motion.button
                                                onClick={clearFilters}
                                                className="text-cyan-600 hover:text-cyan-800 transition-colors"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <X className="w-4 h-4" />
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </CardHeader>

                        {/* Table Content dengan animasi filtering */}
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full table-fixed">
                                    <colgroup>
                                        <col className="w-[20%]" />
                                        <col className="w-[13%]" />
                                        <col className="w-[13%]" />
                                        <col className="w-[14%]" />
                                        <col className="w-[12%]" />
                                        <col className="w-[10%]" />
                                        <col className="w-[18%]" />
                                    </colgroup>
                                    <thead>
                                        <tr className="bg-gradient-to-r from-slate-50 to-cyan-50 border-b border-slate-200">
                                            <th className="px-3 py-4 text-left text-sm font-semibold text-slate-700">Nama Lengkap</th>
                                            <th className="px-3 py-4 text-left text-sm font-semibold text-slate-700">Tempat Lahir</th>
                                            <th className="px-3 py-4 text-left text-sm font-semibold text-slate-700">Tanggal Lahir</th>
                                            <th className="px-3 py-4 text-left text-sm font-semibold text-slate-700">No KK</th>
                                            <th className="px-3 py-4 text-left text-sm font-semibold text-slate-700">Status Keluarga</th>
                                            <th className="px-3 py-4 text-left text-sm font-semibold text-slate-700">Jenis Kelamin</th>
                                            <th className="px-3 py-4 text-center text-sm font-semibold text-slate-700">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white/50 backdrop-blur-sm">
                                        <AnimatePresence mode="wait">
                                            {isFiltering ? (
                                                <motion.tr
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <td colSpan={7} className="text-center py-16">
                                                        <div className="flex flex-col items-center justify-center space-y-4">
                                                            <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
                                                            <p className="text-slate-500 font-medium">Memfilter data...</p>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ) : filteredData.length === 0 ? (
                                                <motion.tr
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <td colSpan={7} className="text-center py-16">
                                                        <motion.div
                                                            className="flex flex-col items-center justify-center space-y-4"
                                                            initial={{ scale: 0.9, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ type: "spring", stiffness: 100 }}
                                                        >
                                                            <motion.div
                                                                className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center"
                                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                                transition={{ type: "spring", stiffness: 300 }}
                                                            >
                                                                <Users className="w-10 h-10 text-cyan-400" />
                                                            </motion.div>
                                                            <div className="text-center">
                                                                <p className="text-slate-500 font-medium text-lg">
                                                                    {hasActiveFilters ? 'Tidak ada data yang sesuai dengan filter' : 'Belum ada data anggota keluarga'}
                                                                </p>
                                                                <p className="text-slate-400 text-sm mt-1">
                                                                    {hasActiveFilters ? 'Coba ubah kriteria pencarian Anda' : 'Klik tombol "Tambah Anggota" untuk menambahkan data baru'}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </motion.tr>
                                            ) : (
                                                filteredData.map((anggota, index) => (
                                                    <motion.tr
                                                        key={anggota.id}
                                                        className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-teal-50/30 transition-all duration-300"
                                                        variants={tableRowVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        transition={{ delay: index * 0.05 }}
                                                        whileHover={{ scale: 1.01 }}
                                                        layout
                                                    >
                                                        {/* Nama Lengkap */}
                                                        <td className="px-3 py-4">
                                                            <div className="name-cell truncate" title={anggota.nama}>
                                                                {anggota.nama}
                                                            </div>
                                                        </td>
                                                        {/* Tempat Lahir */}
                                                        <td className="px-3 py-4">
                                                            <div className="text-slate-700 text-sm truncate" title={anggota.tempat_lahir}>
                                                                {anggota.tempat_lahir}
                                                            </div>
                                                        </td>
                                                        {/* Tanggal Lahir */}
                                                        <td className="px-3 py-4">
                                                            <div className="date-display text-sm" title={anggota.tanggal_lahir}>
                                                                {formatTanggalLahir(anggota.tanggal_lahir)}
                                                            </div>
                                                        </td>
                                                        {/* No KK */}
                                                        <td className="px-3 py-4">
                                                            <div>
                                                                <div className="kk-info truncate text-xs" title={anggota.keluarga.no_kk}>
                                                                    {anggota.keluarga.no_kk}
                                                                </div>
                                                                <div className="kepala-keluarga-info truncate" title={anggota.keluarga.nama_kepala_keluarga}>
                                                                    {anggota.keluarga.nama_kepala_keluarga}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {/* Status dalam Keluarga */}
                                                        <td className="px-3 py-4">
                                                            <Badge variant="secondary" className="bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 border border-cyan-200 text-xs">
                                                                {anggota.status_dalam_keluarga}
                                                            </Badge>
                                                        </td>
                                                        {/* Jenis Kelamin */}
                                                        <td className="px-3 py-4">
                                                            <Badge variant="secondary" className={`text-xs ${anggota.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-pink-100 text-pink-800 border border-pink-200'}`}>
                                                                {anggota.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                            </Badge>
                                                        </td>
                                                        {/* Aksi - DENGAN TOMBOL HAPUS */}
                                                        <td className="px-3 py-4">
                                                            <div className="flex items-center justify-center space-x-1">
                                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                    <Button asChild size="sm" variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 text-xs px-2 py-1">
                                                                        <Link href={route('anggota-keluarga.show', anggota.id)}>
                                                                            <Eye className="w-3 h-3" />
                                                                        </Link>
                                                                    </Button>
                                                                </motion.div>

                                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                    <Button asChild size="sm" variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50 text-xs px-2 py-1">
                                                                        <Link href={route('anggota-keluarga.edit', anggota.id)}>
                                                                            <Edit className="w-3 h-3" />
                                                                        </Link>
                                                                    </Button>
                                                                </motion.div>

                                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="border-red-200 text-red-700 hover:bg-red-50 text-xs px-2 py-1"
                                                                        onClick={() => handleDeleteClick(anggota)}
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </Button>
                                                                </motion.div>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>

                        {/* Pagination */}
                        {filteredData.length > 0 && (
                            <div className="px-6 py-4 bg-gradient-to-r from-slate-50/50 to-cyan-50/50 border-t border-gray-100/50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-slate-600">
                                        Menampilkan {filteredData.length} dari {anggotaKeluarga.total} anggota keluarga
                                        {hasActiveFilters && <span className="text-cyan-600 font-medium"> (difilter)</span>}
                                    </div>
                                    <nav className="flex items-center space-x-2">
                                        {anggotaKeluarga.links.map((link, i) => {
                                            if (link.label.includes('Previous')) {
                                                return (
                                                    <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Button asChild={!!link.url} variant="outline" size="sm" disabled={!link.url} className="border-slate-200 hover:bg-slate-50">
                                                            {link.url ? (
                                                                <Link href={link.url}>
                                                                    <ChevronLeft className="w-4 h-4" />
                                                                </Link>
                                                            ) : (
                                                                <span><ChevronLeft className="w-4 h-4" /></span>
                                                            )}
                                                        </Button>
                                                    </motion.div>
                                                );
                                            }
                                            if (link.label.includes('Next')) {
                                                return (
                                                    <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Button asChild={!!link.url} variant="outline" size="sm" disabled={!link.url} className="border-slate-200 hover:bg-slate-50">
                                                            {link.url ? (
                                                                <Link href={link.url}>
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </Link>
                                                            ) : (
                                                                <span><ChevronRight className="w-4 h-4" /></span>
                                                            )}
                                                        </Button>
                                                    </motion.div>
                                                );
                                            }
                                            return (
                                                <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button asChild={!!link.url} variant={link.active ? "default" : "outline"} size="sm" disabled={!link.url} className={link.active ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg" : "border-slate-200 hover:bg-slate-50"}>
                                                        {link.url ? (
                                                            <Link href={link.url}>{link.label}</Link>
                                                        ) : (
                                                            <span>{link.label}</span>
                                                        )}
                                                    </Button>
                                                </motion.div>
                                            );
                                        })}
                                    </nav>
                                </div>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                isOpen={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Hapus Anggota Keluarga"
                description="Apakah Anda yakin ingin menghapus anggota keluarga ini? Tindakan ini tidak dapat dibatalkan."
                itemName={selectedAnggota?.nama}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
};

export default Index;
