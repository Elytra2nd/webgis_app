import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { pickBy } from 'lodash';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { useToast } from "@/Hooks/use-toast";
import PublicExportModal from '@/Components/PublicExportModal'; // UPDATED: Menggunakan PublicExportModal
import { 
    Search, 
    Download, 
    X, 
    Users, 
    MapPin, 
    Home, 
    Filter, 
    CheckCircle, 
    ArrowLeft,
    HandHeart,
    Calendar,
    TrendingUp,
    AlertTriangle,
    Info,
    Globe,
    Shield,
    BarChart3
} from 'lucide-react';

interface KeluargaPublik {
    id: number;
    nama_kepala_keluarga: string; 
    wilayah: string;
    kota: string;
    status_ekonomi: 'sangat_miskin' | 'miskin' | 'rentan_miskin' | 'kurang_mampu' | 'mampu';
    jumlah_anggota: number;
    // Data PKH untuk transparansi
    status_bantuan?: 'sudah_terima' | 'belum_terima' | null;
    tahun_bantuan?: number;
    nominal_bantuan?: number;
    kategori_bantuan?: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
}

interface StatistikPublikPKH {
    total_keluarga: number;
    total_penerima_pkh: number;
    total_belum_terima: number;
    coverage_percentage: number;
    tahun_aktif: number;
    per_wilayah: {
        [key: string]: {
            total: number;
            penerima: number;
        };
    };
    total_penerima: number;
    total_distribusi: number;
    persentase_distribusi: number;
    rata_rata_bantuan: number;
}

interface Props {
    keluargas: PaginatedData<KeluargaPublik>;
    statistik?: StatistikPublikPKH;
    filters: {
        search: string;
        status: string;
        status_bantuan: string;
        tahun: string;
        wilayah: string;
    };
    tahun_tersedia?: number[];
    wilayah_tersedia?: string[];
}

const defaultKeluargasData: PaginatedData<KeluargaPublik> = {
    data: [],
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
    total: 0,
    per_page: 12,
};

const defaultFiltersData = {
    search: '',
    status: '',
    status_bantuan: '',
    tahun: '',
    wilayah: ''
};

const defaultStatistik: StatistikPublikPKH = {
    total_keluarga: 0,
    total_penerima_pkh: 0,
    total_belum_terima: 0,
    coverage_percentage: 0,
    tahun_aktif: new Date().getFullYear(),
    per_wilayah: {},
    total_penerima: 0,
    total_distribusi: 0,
    persentase_distribusi: 0,
    rata_rata_bantuan: 0
};

export default function KeluargaPublikIndex({
    keluargas = defaultKeluargasData,
    statistik = defaultStatistik,
    filters = defaultFiltersData,
    tahun_tersedia = [],
    wilayah_tersedia = []
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [statusBantuan, setStatusBantuan] = useState(filters.status_bantuan || 'all');
    const [tahun, setTahun] = useState(filters.tahun || new Date().getFullYear().toString());
    const [wilayah, setWilayah] = useState(filters.wilayah || 'all');

    // State untuk modal export
    const [showExportModal, setShowExportModal] = useState(false);

    const { toast } = useToast();
    const mainContainerRef = useRef(null);
    const hasActiveFilters = search || status !== 'all' || statusBantuan !== 'all' || 
                           tahun !== new Date().getFullYear().toString() || wilayah !== 'all';

    // GSAP Animations untuk layout publik
    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' }});
        tl.from('.hero-section', { opacity: 0, y: -30, duration: 1 })
          .from('.stats-grid', { opacity: 0, y: 20, duration: 0.8, stagger: 0.1 }, "-=0.5")
          .from('.data-section', { opacity: 0, y: 20, duration: 0.6 }, "-=0.3");

        gsap.from('.data-card-item', {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            delay: 1.2
        });
    }, { scope: mainContainerRef, dependencies: [keluargas?.current_page] });

    // Effect for filtering
    useEffect(() => {
        const params = pickBy({ 
            search, 
            status: status === 'all' ? '' : status,
            status_bantuan: statusBantuan === 'all' ? '' : statusBantuan,
            tahun: tahun === new Date().getFullYear().toString() ? '' : tahun,
            wilayah: wilayah === 'all' ? '' : wilayah
        });
        
        const timeoutId = setTimeout(() => {
            router.get(route('keluarga.index'), params, {
                preserveState: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, status, statusBantuan, tahun, wilayah]);

    const resetFilters = () => {
        setSearch('');
        setStatus('all');
        setStatusBantuan('all');
        setTahun(new Date().getFullYear().toString());
        setWilayah('all');
    };

    // Handler untuk membuka modal export
    const handleExportPublicData = () => {
        setShowExportModal(true);
    };

    // Handler untuk menutup modal export
    const handleCloseExportModal = () => {
        setShowExportModal(false);
    };

    // Fungsi untuk mendapatkan info status dengan konteks PKH
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'sangat_miskin':
                return { 
                    colorClass: 'bg-red-500', 
                    textClass: 'bg-red-100 text-red-800 border-red-200',
                    label: 'Sangat Miskin',
                    eligible: true,
                    priority: 'Prioritas Tinggi'
                };
            case 'miskin':
                return { 
                    colorClass: 'bg-orange-500', 
                    textClass: 'bg-orange-100 text-orange-800 border-orange-200',
                    label: 'Miskin',
                    eligible: true,
                    priority: 'Prioritas Menengah'
                };
            case 'rentan_miskin':
                return { 
                    colorClass: 'bg-yellow-500', 
                    textClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    label: 'Rentan Miskin',
                    eligible: true,
                    priority: 'Prioritas Rendah'
                };
            case 'kurang_mampu':
                return { 
                    colorClass: 'bg-blue-500', 
                    textClass: 'bg-blue-100 text-blue-800 border-blue-200',
                    label: 'Kurang Mampu',
                    eligible: false,
                    priority: 'Tidak Prioritas'
                };
            case 'mampu':
                return { 
                    colorClass: 'bg-green-500', 
                    textClass: 'bg-green-100 text-green-800 border-green-200',
                    label: 'Mampu',
                    eligible: false,
                    priority: 'Tidak Prioritas'
                };
            default:
                return { 
                    colorClass: 'bg-slate-500', 
                    textClass: 'bg-slate-100 text-slate-800 border-slate-200',
                    label: 'Tidak Diketahui',
                    eligible: false,
                    priority: 'Tidak Diketahui'
                };
        }
    };

    const getBantuanInfo = (status?: string | null) => {
        switch (status) {
            case 'sudah_terima':
                return {
                    colorClass: 'bg-green-500',
                    textClass: 'bg-green-100 text-green-800 border-green-200',
                    label: 'Menerima PKH',
                    icon: CheckCircle
                };
            case 'belum_terima':
                return {
                    colorClass: 'bg-amber-500',
                    textClass: 'bg-amber-100 text-amber-800 border-amber-200',
                    label: 'Belum Menerima',
                    icon: AlertTriangle
                };
            default:
                return {
                    colorClass: 'bg-gray-500',
                    textClass: 'bg-gray-100 text-gray-800 border-gray-200',
                    label: 'Tidak Diketahui',
                    icon: Info
                };
        }
    };

    const formatCurrency = (amount?: number) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const maskName = (name: string) => {
        // Menyamarkan nama untuk privasi publik
        const words = name.split(' ');
        return words.map(word => 
            word.length > 2 ? word.charAt(0) + '*'.repeat(word.length - 2) + word.charAt(word.length - 1) : word
        ).join(' ');
    };

    return (
        <div ref={mainContainerRef} className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-green-50/50 relative overflow-hidden">
            <Head title="Data Publik Program Keluarga Harapan (PKH) - Kalimantan Barat" />

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-green-600"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 p-4 sm:p-6 lg:p-8">
                {/* Hero Section */}
                <section className="hero-section text-center py-12 mb-12">
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative">
                            <div className="w-4 h-16 bg-gradient-to-b from-blue-500 via-green-500 to-teal-600 rounded-full shadow-lg"></div>
                            <div className="absolute -top-1 -left-1 w-6 h-18 bg-gradient-to-b from-blue-400/30 via-green-400/30 to-teal-500/30 rounded-full blur-sm"></div>
                        </div>
                        <div className="ml-6">
                            <HandHeart className="w-12 h-12 text-green-600 mb-4" />
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                                Program Keluarga Harapan
                            </h1>
                            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                                Transparansi Data Bantuan Sosial Kalimantan Barat
                            </p>
                            <p className="text-sm text-slate-500 mt-2">
                                Data dipublikasikan untuk akuntabilitas dan transparansi program bantuan sosial
                            </p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center gap-4 mb-8">
                        <Button asChild variant="outline" className="border-slate-300 hover:bg-slate-50">
                            <Link href={route('landing')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Beranda
                            </Link>
                        </Button>
                        <Button 
                            onClick={handleExportPublicData} 
                            className="bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Unduh Statistik
                        </Button>
                    </div>
                </section>

                {/* Statistik Grid */}
                <section className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Card className="bg-white/90 backdrop-blur-sm border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total Keluarga Terdaftar</p>
                                    <p className="text-3xl font-bold text-slate-800">
                                        {statistik.total_keluarga.toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Keluarga di Kalimantan Barat</p>
                                </div>
                                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Users className="h-7 w-7 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/90 backdrop-blur-sm border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Penerima PKH Aktif</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {statistik.total_penerima_pkh.toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Tahun {statistik.tahun_aktif}</p>
                                </div>
                                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                                    <HandHeart className="h-7 w-7 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/90 backdrop-blur-sm border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Calon Penerima</p>
                                    <p className="text-3xl font-bold text-amber-600">
                                        {statistik.total_belum_terima.toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Memenuhi kriteria PKH</p>
                                </div>
                                <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="h-7 w-7 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/90 backdrop-blur-sm border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Cakupan Program</p>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {statistik.coverage_percentage.toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Dari target yang layak</p>
                                </div>
                                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="h-7 w-7 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Filter Section */}
                <Card className="data-section bg-white/90 backdrop-blur-sm border-slate-200/80 shadow-lg mb-8">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-slate-600" />
                            Filter Data Publik PKH
                        </CardTitle>
                        <CardDescription>
                            Jelajahi data Program Keluarga Harapan berdasarkan kriteria tertentu
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                                <Input
                                    placeholder="Cari wilayah atau nama..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 border-slate-200 focus:border-green-500 focus:ring-green-500/20"
                                />
                            </div>

                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="border-slate-200 focus:border-green-500 focus:ring-green-500/20">
                                    <SelectValue placeholder="Status Ekonomi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="sangat_miskin">Sangat Miskin</SelectItem>
                                    <SelectItem value="miskin">Miskin</SelectItem>
                                    <SelectItem value="rentan_miskin">Rentan Miskin</SelectItem>
                                    <SelectItem value="kurang_mampu">Kurang Mampu</SelectItem>
                                    <SelectItem value="mampu">Mampu</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusBantuan} onValueChange={setStatusBantuan}>
                                <SelectTrigger className="border-slate-200 focus:border-green-500 focus:ring-green-500/20">
                                    <SelectValue placeholder="Status PKH" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status PKH</SelectItem>
                                    <SelectItem value="sudah_terima">Menerima PKH</SelectItem>
                                    <SelectItem value="belum_terima">Belum Menerima</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={wilayah} onValueChange={setWilayah}>
                                <SelectTrigger className="border-slate-200 focus:border-green-500 focus:ring-green-500/20">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Wilayah" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Wilayah</SelectItem>
                                    {wilayah_tersedia.map(w => (
                                        <SelectItem key={w} value={w}>{w}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={tahun} onValueChange={setTahun}>
                                <SelectTrigger className="border-slate-200 focus:border-green-500 focus:ring-green-500/20">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tahun_tersedia.map(t => (
                                        <SelectItem key={t} value={t.toString()}>
                                            {t} {t === new Date().getFullYear() && '(Aktif)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {hasActiveFilters && (
                            <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
                                <div className="flex items-center space-x-2 flex-wrap gap-2">
                                    <Filter className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">Filter aktif:</span>
                                    {search && (<Badge variant="secondary" className="bg-green-100 text-green-800">Pencarian: "{search}"</Badge>)}
                                    {status !== 'all' && (<Badge variant="secondary" className="bg-green-100 text-green-800">{getStatusInfo(status).label}</Badge>)}
                                    {statusBantuan !== 'all' && (<Badge variant="secondary" className="bg-green-100 text-green-800">{getBantuanInfo(statusBantuan).label}</Badge>)}
                                    {wilayah !== 'all' && (<Badge variant="secondary" className="bg-green-100 text-green-800">Wilayah: {wilayah}</Badge>)}
                                    {tahun !== new Date().getFullYear().toString() && (<Badge variant="secondary" className="bg-green-100 text-green-800">Tahun: {tahun}</Badge>)}
                                </div>
                                <button onClick={resetFilters} className="text-green-600 hover:text-green-800 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Data Cards Grid (bukan tabel untuk tampilan publik yang lebih friendly) */}
                <section className="data-section">
                    {keluargas?.data?.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {keluargas.data.map((item) => {
                                    const statusInfo = getStatusInfo(item.status_ekonomi);
                                    const bantuanInfo = getBantuanInfo(item.status_bantuan);
                                    const BantuanIcon = bantuanInfo.icon;
                                    
                                    return (
                                        <Card key={item.id} className="data-card-item bg-white/90 backdrop-blur-sm border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                            <CardContent className="p-6">
                                                <div className="space-y-4">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-slate-800 text-lg">
                                                                {maskName(item.nama_kepala_keluarga)}
                                                            </h3>
                                                            <p className="text-sm text-slate-500 flex items-center mt-1">
                                                                <MapPin className="w-3 h-3 mr-1" />
                                                                {item.wilayah}, {item.kota}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge variant="secondary" className={`text-xs ${statusInfo.textClass}`}>
                                                                <span className={`mr-1 h-2 w-2 rounded-full ${statusInfo.colorClass}`}></span>
                                                                {statusInfo.label}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Info Keluarga */}
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-slate-500">Anggota Keluarga:</span>
                                                            <p className="font-medium text-slate-800">{item.jumlah_anggota} orang</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500">Prioritas PKH:</span>
                                                            <p className={`font-medium text-xs ${statusInfo.eligible ? 'text-green-600' : 'text-slate-600'}`}>
                                                                {statusInfo.priority}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Status PKH */}
                                                    <div className="border-t border-slate-100 pt-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <BantuanIcon className="w-4 h-4 text-slate-600" />
                                                                <span className="text-sm text-slate-600">Status PKH:</span>
                                                            </div>
                                                            <Badge variant="secondary" className={`text-xs ${bantuanInfo.textClass}`}>
                                                                {bantuanInfo.label}
                                                            </Badge>
                                                        </div>
                                                        
                                                        {item.status_bantuan === 'sudah_terima' && (
                                                            <div className="mt-2 space-y-1">
                                                                {item.nominal_bantuan && (
                                                                    <p className="text-sm text-green-600 font-medium">
                                                                        {formatCurrency(item.nominal_bantuan)}/bulan
                                                                    </p>
                                                                )}
                                                                {item.tahun_bantuan && (
                                                                    <p className="text-xs text-slate-500">
                                                                        Tahun {item.tahun_bantuan}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
                                <div className="text-sm text-slate-600">
                                    Menampilkan <span className="font-semibold">{keluargas.from}</span> - <span className="font-semibold">{keluargas.to}</span> dari <span className="font-semibold">{keluargas.total}</span> data keluarga
                                </div>
                                <nav className="flex items-center space-x-2">
                                    {Array.from({ length: keluargas.last_page }, (_, i) => i + 1).map(page => (
                                        <Button 
                                            key={page}
                                            asChild={page !== keluargas.current_page}
                                            variant={page === keluargas.current_page ? "default" : "outline"} 
                                            size="sm"
                                            className={page === keluargas.current_page ? 'bg-green-600 hover:bg-green-700' : ''}
                                        >
                                            {page !== keluargas.current_page ? (
                                                <Link href={route('keluarga.index', { ...filters, page })}>
                                                    {page}
                                                </Link>
                                            ) : (
                                                <span>{page}</span>
                                            )}
                                        </Button>
                                    ))}
                                </nav>
                            </div>
                        </>
                    ) : (
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200/80 shadow-lg">
                            <CardContent className="text-center py-16">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                                        <BarChart3 className="w-10 h-10 text-green-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-slate-500 font-medium text-lg">
                                            {hasActiveFilters ? 'Tidak ada data yang sesuai filter' : 'Belum ada data tersedia'}
                                        </p>
                                        <p className="text-slate-400 text-sm mt-1">
                                            {hasActiveFilters ? 'Coba ubah kriteria pencarian Anda' : 'Data akan ditampilkan setelah tersedia'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Info Footer */}
                <footer className="mt-16">
                    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Shield className="w-6 h-6 text-green-600" />
                                        <h3 className="text-xl font-semibold text-slate-800">Privasi & Transparansi</h3>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Data yang ditampilkan telah dianonimkan untuk melindungi privasi individu. 
                                        Nomor KK dan informasi pribadi sensitif tidak ditampilkan sesuai dengan 
                                        prinsip perlindungan data pribadi.
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Globe className="w-6 h-6 text-blue-600" />
                                        <h3 className="text-xl font-semibold text-slate-800">Tentang Program PKH</h3>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Program Keluarga Harapan (PKH) adalah program bantuan sosial bersyarat 
                                        dari pemerintah untuk keluarga miskin dan rentan miskin di Kalimantan Barat. 
                                        Data ini dipublikasikan untuk transparansi dan akuntabilitas program.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-green-200 flex items-center justify-center space-x-6 text-xs text-slate-500">
                                <span>Dinas Sosial Kalimantan Barat</span>
                                <span>•</span>
                                <span>Data per {new Date().toLocaleDateString('id-ID')}</span>
                                <span>•</span>
                                <span>Tahun Anggaran {statistik.tahun_aktif}</span>
                            </div>
                        </CardContent>
                    </Card>
                </footer>
            </div>

            {/* Modal Export - UPDATED: Menggunakan PublicExportModal */}
            <PublicExportModal
                isOpen={showExportModal}
                onClose={handleCloseExportModal}
                filters={filters}
                statistik={statistik}
                category="public-pkh"
                title="Export Data PKH Publik"
            />
        </div>
    );
}
