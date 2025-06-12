import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { useToast } from '@/Hooks/use-toast';
import DeleteConfirmationDialog from '@/Components/DeleteConfirmationDialog';
import { Search, Filter, Users, HandHeart, Calendar, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Eye, Edit, Trash2, Plus } from 'lucide-react';

interface Bantuan {
    id: number;
    keluarga_id: number;
    tahun_anggaran: number;
    status: 'ditetapkan' | 'aktif' | 'selesai' | 'dibatalkan';
    nominal_per_bulan: number;
    keterangan?: string;
    tanggal_penetapan: string;
    keluarga: {
        id: number;
        no_kk: string;
        nama_kepala_keluarga: string;
        alamat: string;
        status_ekonomi: string;
    };
    distribusi: Array<{
        id: number;
        bulan: number;
        status: 'belum_disalurkan' | 'disalurkan' | 'gagal';
        tanggal_distribusi?: string;
    }>;
    persentase_distribusi: number;
}

interface PaginatedBantuan {
    data: Bantuan[];
    links: any[];
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
}

interface Props {
    auth: { user: { name: string; email: string } };
    bantuan?: PaginatedBantuan;
    statistik?: {
        total_penerima: number;
        aktif: number;
        ditetapkan: number;
        selesai: number;
        dibatalkan: number;
        total_nominal: number;
        distribusi_bulan_ini: number;
    };
    filters?: {
        tahun: number;
        status?: string;
        search?: string;
    };
    tahun_tersedia?: number[];
    error?: string;
}

export default function Index({ auth, bantuan, statistik, filters, tahun_tersedia = [], error }: Props) {
    // Safe defaults untuk mencegah undefined errors
    const safeBantuan = bantuan || { 
        data: [], 
        links: [], 
        meta: { 
            current_page: 1, 
            from: 0, 
            last_page: 1, 
            per_page: 15, 
            to: 0, 
            total: 0 
        } 
    };
    
    const safeStatistik = statistik || { 
        total_penerima: 0, 
        aktif: 0, 
        ditetapkan: 0, 
        selesai: 0, 
        dibatalkan: 0, 
        total_nominal: 0, 
        distribusi_bulan_ini: 0 
    };
    
    const safeFilters = filters || { 
        tahun: new Date().getFullYear() 
    };
    
    const safeTahunTersedia = Array.isArray(tahun_tersedia) ? tahun_tersedia : [];
    
    const [search, setSearch] = useState(safeFilters.search || '');
    const [tahun, setTahun] = useState((safeFilters.tahun || new Date().getFullYear()).toString());
    const [status, setStatus] = useState(safeFilters.status || 'all');
    
    // Delete states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedBantuan, setSelectedBantuan] = useState<Bantuan | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const { toast } = useToast();
    const mainContainerRef = useRef(null);

    // Animasi GSAP
    useGSAP(() => {
        gsap.from('.stat-card', {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out'
        });
        gsap.from('.table-row', {
            opacity: 0,
            x: -20,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out',
            delay: 0.3
        });
    }, { scope: mainContainerRef });

    const handleFilter = () => {
        router.get(route('admin.bantuan.index'), {
            search: search || '',
            tahun: tahun || new Date().getFullYear().toString(),
            status: status !== 'all' ? status : ''
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Handle delete
    const handleDeleteClick = (item: Bantuan) => {
        setSelectedBantuan(item);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedBantuan) return;

        setIsDeleting(true);

        try {
            await router.delete(route('admin.bantuan.destroy', selectedBantuan.id), {
                preserveScroll: true,
                onStart: () => {
                    toast({
                        title: "Menghapus Data",
                        description: "Sedang menghapus data bantuan...",
                        variant: "default",
                    });
                },
                onSuccess: () => {
                    toast({
                        title: "Data Berhasil Dihapus! 🗑️",
                        description: `Data bantuan untuk keluarga ${selectedBantuan.keluarga.nama_kepala_keluarga} telah berhasil dihapus.`,
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
        setSelectedBantuan(null);
        setIsDeleting(false);
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'aktif':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'ditetapkan':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'selesai':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'dibatalkan':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const formatCurrency = (amount: number | undefined | null) => {
        const safeAmount = amount || 0;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(safeAmount);
    };

    const formatNumber = (value: number | undefined | null) => {
        const safeValue = value || 0;
        return safeValue.toLocaleString('id-ID');
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen Bantuan PKH" />

            <div ref={mainContainerRef} className="max-w-7xl mx-auto space-y-8">
                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Manajemen Bantuan PKH</h1>
                        <p className="mt-1 text-slate-600">Kelola distribusi Program Keluarga Harapan tahun {tahun}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={route('admin.bantuan.belum-menerima')}>
                            <Button variant="outline">
                                <Users className="mr-2 h-4 w-4" />
                                KK Belum Terima
                            </Button>
                        </Link>
                        <Link href={route('admin.bantuan.peta')}>
                            <Button variant="outline">
                                <HandHeart className="mr-2 h-4 w-4" />
                                Peta Sebaran
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Statistik Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { 
                            label: 'Total Penerima', 
                            value: formatNumber(safeStatistik.total_penerima), 
                            icon: Users, 
                            color: 'text-blue-600', 
                            bg: 'bg-blue-50' 
                        },
                        { 
                            label: 'Bantuan Aktif', 
                            value: formatNumber(safeStatistik.aktif), 
                            icon: CheckCircle, 
                            color: 'text-green-600', 
                            bg: 'bg-green-50' 
                        },
                        { 
                            label: 'Total Anggaran', 
                            value: formatCurrency(safeStatistik.total_nominal), 
                            icon: DollarSign, 
                            color: 'text-purple-600', 
                            bg: 'bg-purple-50' 
                        },
                        { 
                            label: 'Distribusi Bulan Ini', 
                            value: formatNumber(safeStatistik.distribusi_bulan_ini), 
                            icon: TrendingUp, 
                            color: 'text-orange-600', 
                            bg: 'bg-orange-50' 
                        }
                    ].map((stat, index) => (
                        <Card key={stat.label} className="stat-card bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                                        <p className={`text-2xl font-bold ${stat.color}`}>
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filter dan Pencarian */}
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Pencarian</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Cari No. KK atau nama kepala keluarga..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Tahun Anggaran</label>
                                <Select value={tahun} onValueChange={setTahun}>
                                    <SelectTrigger className="w-32">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {safeTahunTersedia.length > 0 ? safeTahunTersedia.map(t => (
                                            <SelectItem key={t} value={t.toString()}>{t}</SelectItem>
                                        )) : (
                                            <SelectItem value={new Date().getFullYear().toString()}>
                                                {new Date().getFullYear()}
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="ditetapkan">Ditetapkan</SelectItem>
                                        <SelectItem value="aktif">Aktif</SelectItem>
                                        <SelectItem value="selesai">Selesai</SelectItem>
                                        <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleFilter} className="bg-cyan-600 hover:bg-cyan-700">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabel Data dengan Lebar Kolom yang Diperbaiki */}
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-cyan-50 border-b border-slate-200">
                        <CardTitle>Daftar Penerima Bantuan PKH</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        {/* FIX: Perbaiki lebar kolom untuk No. KK */}
                                        <TableHead className="w-40 min-w-[160px]">No. KK</TableHead>
                                        <TableHead className="min-w-[200px]">Kepala Keluarga</TableHead>
                                        <TableHead className="w-32">Status Ekonomi</TableHead>
                                        <TableHead className="w-36">Nominal/Bulan</TableHead>
                                        <TableHead className="w-28">Status</TableHead>
                                        <TableHead className="w-40">Progress Distribusi</TableHead>
                                        <TableHead className="w-32 text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {safeBantuan.data.length > 0 ? safeBantuan.data.map((item) => (
                                        <TableRow key={item.id} className="table-row hover:bg-cyan-50/50 transition-colors">
                                            {/* FIX: Tampilkan No. KK dengan format yang tidak terpotong */}
                                            <TableCell className="font-mono text-sm w-40 min-w-[160px]">
                                                <div className="bg-slate-100 px-3 py-2 rounded-md border">
                                                    <span className="text-slate-800 font-medium">
                                                        {item.keluarga?.no_kk || 'N/A'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="min-w-[200px]">
                                                <div>
                                                    <div className="font-medium text-slate-900">
                                                        {item.keluarga?.nama_kepala_keluarga || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-slate-500 truncate max-w-[180px]" title={item.keluarga?.alamat}>
                                                        {item.keluarga?.alamat || 'Alamat tidak tersedia'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="w-32">
                                                <Badge variant="outline" className="text-xs">
                                                    {item.keluarga?.status_ekonomi || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium w-36">
                                                <span className="text-green-600 font-semibold">
                                                    {formatCurrency(item.nominal_per_bulan)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="w-28">
                                                <Badge variant="outline" className={getStatusBadgeClass(item.status)}>
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="w-40">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${Math.round(item.persentase_distribusi || 0)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-slate-600 font-medium">
                                                        {Math.round(item.persentase_distribusi || 0)}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="w-32">
                                                <div className="flex justify-center space-x-1">
                                                    {/* FIX: Implementasi CRUD dengan route yang benar */}
                                                    <Button 
                                                        asChild 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                                                        title="Lihat Detail"
                                                    >
                                                        <Link href={route('admin.bantuan.show', item.id)}>
                                                            <Eye className="w-3 h-3" />
                                                        </Link>
                                                    </Button>
                                                    <Button 
                                                        asChild 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="border-amber-200 text-amber-700 hover:bg-amber-50"
                                                        title="Edit Bantuan"
                                                    >
                                                        <Link href={route('admin.bantuan.edit', item.id)}>
                                                            <Edit className="w-3 h-3" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-200 text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDeleteClick(item)}
                                                        title="Hapus Bantuan"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <div className="text-slate-500">
                                                    <HandHeart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                    <p className="text-lg font-medium">Belum ada data bantuan PKH</p>
                                                    <p className="text-sm">Data bantuan akan muncul setelah penetapan penerima</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination dengan safe access */}
                {safeBantuan.data.length > 0 && safeBantuan.links && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                            Menampilkan {safeBantuan.meta?.from || 0} - {safeBantuan.meta?.to || 0} dari {safeBantuan.meta?.total || 0} data bantuan
                        </div>
                        <nav className="flex items-center space-x-2">
                            {safeBantuan.links.map((link: any, i: number) => {
                                if (link.label.includes('Previous')) {
                                    return (
                                        <Button key={i} asChild={!!link.url} variant="outline" size="sm" disabled={!link.url}>
                                            {link.url ? <Link href={link.url}>‹</Link> : <span>‹</span>}
                                        </Button>
                                    );
                                }
                                if (link.label.includes('Next')) {
                                    return (
                                        <Button key={i} asChild={!!link.url} variant="outline" size="sm" disabled={!link.url}>
                                            {link.url ? <Link href={link.url}>›</Link> : <span>›</span>}
                                        </Button>
                                    );
                                }
                                return (
                                    <Button key={i} asChild={!!link.url} variant={link.active ? "default" : "outline"} size="sm" disabled={!link.url}>
                                        {link.url ? <Link href={link.url}>{link.label}</Link> : <span>{link.label}</span>}
                                    </Button>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                isOpen={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Hapus Data Bantuan PKH"
                description="Apakah Anda yakin ingin menghapus data bantuan ini? Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi data distribusi terkait."
                itemName={selectedBantuan ? `${selectedBantuan.keluarga.nama_kepala_keluarga} (${selectedBantuan.keluarga.no_kk})` : ''}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
