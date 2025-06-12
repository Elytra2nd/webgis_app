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
import { Checkbox } from '@/Components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { useToast } from '@/Hooks/use-toast';
import { Search, Filter, Users, AlertTriangle, HandHeart, MapPin, Calendar, Plus } from 'lucide-react';

interface Keluarga {
    id: number;
    no_kk: string;
    nama_kepala_keluarga: string;
    alamat: string;
    kelurahan: string;
    kecamatan: string;
    status_ekonomi: string;
    jumlah_anggota: number;
    status_verifikasi: string;
}

interface Props {
    auth: { user: { name: string; email: string } };
    keluarga?: {
        data: Keluarga[];
        links: any[];
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            per_page: number;
            to: number;
            total: number;
        };
    };
    statistik?: {
        total_belum_terima: number;
        sangat_miskin: number;
        miskin: number;
        rentan_miskin: number;
        kurang_mampu: number;
    };
    filters?: {
        tahun: number;
        search: string;
    };
    tahun_tersedia?: number[];
}

export default function BelumMenerima({ auth, keluarga, statistik, filters, tahun_tersedia = [] }: Props) {
    // FIX: Safe defaults untuk mencegah undefined errors
    const safeKeluarga = keluarga || { 
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
        total_belum_terima: 0, 
        sangat_miskin: 0, 
        miskin: 0, 
        rentan_miskin: 0, 
        kurang_mampu: 0 
    };
    
    const safeFilters = filters || { 
        tahun: new Date().getFullYear(), 
        search: '' 
    };
    
    const safeTahunTersedia = Array.isArray(tahun_tersedia) ? tahun_tersedia : [];
    
    const [search, setSearch] = useState(safeFilters.search || '');
    const [tahun, setTahun] = useState((safeFilters.tahun || new Date().getFullYear()).toString());
    const [selectedKeluarga, setSelectedKeluarga] = useState<number[]>([]);
    const [showPenetapanForm, setShowPenetapanForm] = useState(false);
    const [nominalBantuan, setNominalBantuan] = useState('300000');
    
    const { toast } = useToast();
    const mainContainerRef = useRef(null);

    // Debug untuk melihat struktur data
    console.log('BelumMenerima props:', { 
        keluarga, 
        safeKeluarga, 
        meta: safeKeluarga.meta,
        from: safeKeluarga.meta?.from 
    });

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
        router.get(route('admin.bantuan.belum-menerima'), {
            search: search || '',
            tahun: tahun || new Date().getFullYear().toString()
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedKeluarga(safeKeluarga.data.map(k => k.id));
        } else {
            setSelectedKeluarga([]);
        }
    };

    const handleSelectKeluarga = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedKeluarga([...selectedKeluarga, id]);
        } else {
            setSelectedKeluarga(selectedKeluarga.filter(k => k !== id));
        }
    };

    const handlePenetapanBantuan = () => {
        if (selectedKeluarga.length === 0) {
            toast({
                title: "Peringatan",
                description: "Pilih minimal satu keluarga untuk ditetapkan sebagai penerima bantuan.",
                variant: "destructive"
            });
            return;
        }

        router.post(route('admin.bantuan.store'), {
            keluarga_ids: selectedKeluarga,
            tahun_anggaran: parseInt(tahun),
            nominal_per_bulan: parseFloat(nominalBantuan),
            keterangan: `Penetapan bantuan tahun ${tahun}`
        }, {
            onSuccess: () => {
                setSelectedKeluarga([]);
                setShowPenetapanForm(false);
                setNominalBantuan('300000');
                toast({
                    title: "Berhasil",
                    description: `${selectedKeluarga.length} keluarga berhasil ditetapkan sebagai penerima bantuan.`
                });
            }
        });
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'sangat_miskin':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'miskin':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'rentan_miskin':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'kurang_mampu':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const formatNumber = (value: number | undefined | null) => {
        const safeValue = value || 0;
        return safeValue.toLocaleString('id-ID');
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="KK Belum Menerima Bantuan" />

            <div ref={mainContainerRef} className="max-w-7xl mx-auto space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">KK Belum Menerima Bantuan</h1>
                        <p className="mt-1 text-slate-600">Kelola penetapan penerima bantuan sosial tahun {tahun}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={route('admin.bantuan.index')}>
                            <Button variant="outline">
                                <HandHeart className="mr-2 h-4 w-4" />
                                Daftar Penerima
                            </Button>
                        </Link>
                        <Link href={route('admin.bantuan.peta')}>
                            <Button variant="outline">
                                <MapPin className="mr-2 h-4 w-4" />
                                Lihat Peta
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Statistik Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[
                        { 
                            label: 'Total Belum Terima', 
                            value: formatNumber(safeStatistik.total_belum_terima), 
                            icon: AlertTriangle, 
                            color: 'text-red-600', 
                            bg: 'bg-red-50' 
                        },
                        { 
                            label: 'Sangat Miskin', 
                            value: formatNumber(safeStatistik.sangat_miskin), 
                            icon: AlertTriangle, 
                            color: 'text-red-600', 
                            bg: 'bg-red-50' 
                        },
                        { 
                            label: 'Miskin', 
                            value: formatNumber(safeStatistik.miskin), 
                            icon: AlertTriangle, 
                            color: 'text-orange-600', 
                            bg: 'bg-orange-50' 
                        },
                        { 
                            label: 'Rentan Miskin', 
                            value: formatNumber(safeStatistik.rentan_miskin), 
                            icon: AlertTriangle, 
                            color: 'text-yellow-600', 
                            bg: 'bg-yellow-50' 
                        },
                        { 
                            label: 'Kurang Mampu', 
                            value: formatNumber(safeStatistik.kurang_mampu), 
                            icon: Users, 
                            color: 'text-blue-600', 
                            bg: 'bg-blue-50' 
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
                            <Button onClick={handleFilter} className="bg-cyan-600 hover:bg-cyan-700">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabel Data */}
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-cyan-50 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <CardTitle>Daftar KK Belum Menerima Bantuan</CardTitle>
                            {selectedKeluarga.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-600">
                                        {selectedKeluarga.length} keluarga dipilih
                                    </span>
                                    <Button 
                                        onClick={() => setShowPenetapanForm(true)}
                                        className="bg-green-600 hover:bg-green-700"
                                        size="sm"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tetapkan Bantuan
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedKeluarga.length === safeKeluarga.data.length && safeKeluarga.data.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>No. KK</TableHead>
                                        <TableHead>Kepala Keluarga</TableHead>
                                        <TableHead>Alamat</TableHead>
                                        <TableHead>Status Ekonomi</TableHead>
                                        <TableHead className="text-center">Jumlah Anggota</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {safeKeluarga.data.length > 0 ? safeKeluarga.data.map((item) => (
                                        <TableRow key={item.id} className="table-row hover:bg-cyan-50/50 transition-colors">
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedKeluarga.includes(item.id)}
                                                    onCheckedChange={(checked) => handleSelectKeluarga(item.id, checked as boolean)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {item.no_kk || 'N/A'}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.nama_kepala_keluarga || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                <div>
                                                    <div>{item.alamat || 'Alamat tidak tersedia'}</div>
                                                    <div className="text-xs text-slate-500">
                                                        {item.kelurahan || 'N/A'}, {item.kecamatan || 'N/A'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusBadgeClass(item.status_ekonomi)}>
                                                    {item.status_ekonomi || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.jumlah_anggota || 0}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <div className="text-slate-500">
                                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                    <p className="text-lg font-medium">Tidak ada KK yang belum menerima bantuan</p>
                                                    <p className="text-sm">Semua KK yang layak sudah menerima bantuan tahun {tahun}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Form Penetapan Bantuan Modal */}
                {showPenetapanForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md mx-4">
                            <CardHeader>
                                <CardTitle>Penetapan Bantuan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Jumlah Keluarga Dipilih
                                    </label>
                                    <Input value={selectedKeluarga.length} disabled />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nominal per Bulan (Rp)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="Masukkan nominal bantuan per bulan"
                                        value={nominalBantuan}
                                        onChange={(e) => setNominalBantuan(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPenetapanForm(false)}
                                        className="flex-1"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handlePenetapanBantuan}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        disabled={!nominalBantuan}
                                    >
                                        Tetapkan
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* FIX: Pagination dengan safe access */}
                {safeKeluarga.data.length > 0 && safeKeluarga.links && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                            Menampilkan {safeKeluarga.meta?.from || 0} - {safeKeluarga.meta?.to || 0} dari {safeKeluarga.meta?.total || 0} keluarga
                        </div>
                        <nav className="flex items-center space-x-2">
                            {safeKeluarga.links.map((link: any, i: number) => {
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
        </AuthenticatedLayout>
    );
}
