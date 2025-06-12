import React, { useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Progress } from '@/Components/ui/progress';
import { 
    ArrowLeft, 
    Edit, 
    Calendar, 
    DollarSign, 
    Users, 
    MapPin, 
    CheckCircle, 
    Clock, 
    AlertTriangle,
    FileText,
    Home,
    Phone,
    Mail,
    HandHeart,
    TrendingUp,
    Target,
    Award
} from 'lucide-react';

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
        rt?: string;
        rw?: string;
        kelurahan?: string;
        kecamatan?: string;
        kota?: string;
        provinsi?: string;
        status_ekonomi: string;
        jumlah_anggota: number;
        penghasilan_bulanan?: number;
    };
    distribusi: Array<{
        id: number;
        bulan: number;
        status: 'belum_disalurkan' | 'disalurkan' | 'gagal';
        tanggal_distribusi?: string;
        catatan?: string;
    }>;
    persentase_distribusi: number;
}

interface StatistikDistribusi {
    total_bulan: number;
    sudah_disalurkan: number;
    belum_disalurkan: number;
    gagal: number;
    persentase: number;
    total_nominal_tahun: number;
    nominal_terdistribusi: number;
}

interface Props {
    auth: { user: { name: string; email: string } };
    bantuan: Bantuan;
    statistik_distribusi?: StatistikDistribusi;
}

export default function Show({ auth, bantuan, statistik_distribusi }: Props) {
    const mainContainerRef = useRef(null);

    // Safe defaults
    const safeStatistik = statistik_distribusi || {
        total_bulan: 12,
        sudah_disalurkan: 0,
        belum_disalurkan: 12,
        gagal: 0,
        persentase: 0,
        total_nominal_tahun: bantuan.nominal_per_bulan * 12,
        nominal_terdistribusi: 0
    };

    // Animasi GSAP
    useGSAP(() => {
        gsap.from('.detail-card', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out'
        });
        gsap.from('.progress-bar', {
            width: 0,
            duration: 1.5,
            ease: 'power2.out',
            delay: 0.5
        });
    }, { scope: mainContainerRef });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getNamaBulan = (bulan: number) => {
        const namaBulan = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return namaBulan[bulan - 1] || 'Unknown';
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

    const getDistribusiStatusClass = (status: string) => {
        switch (status) {
            case 'disalurkan':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'gagal':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getDistribusiStatusIcon = (status: string) => {
        switch (status) {
            case 'disalurkan':
                return CheckCircle;
            case 'gagal':
                return AlertTriangle;
            default:
                return Clock;
        }
    };

    const getStatusEkonomiColor = (status: string) => {
        switch (status) {
            case 'sangat_miskin':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'miskin':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'rentan_miskin':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'kurang_mampu':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'mampu':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const breadcrumbs = [
        { label: 'Dashboard', href: route('dashboard') },
        { label: 'Bantuan PKH', href: route('admin.bantuan.index') },
        { label: 'Detail Bantuan', current: true }
    ];

    return (
        <AuthenticatedLayout user={auth.user} breadcrumbs={breadcrumbs}>
            <Head title={`Detail Bantuan PKH - ${bantuan.keluarga.nama_kepala_keluarga}`} />

            <div ref={mainContainerRef} className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.bantuan.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Detail Bantuan PKH</h1>
                            <p className="mt-1 text-slate-600">Informasi lengkap bantuan untuk {bantuan.keluarga.nama_kepala_keluarga}</p>
                        </div>
                    </div>
                    <Link href={route('admin.bantuan.edit', bantuan.id)}>
                        <Button className="bg-amber-600 hover:bg-amber-700">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Bantuan
                        </Button>
                    </Link>
                </div>

                {/* Header Info Card */}
                <Card className="detail-card bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                                    <HandHeart className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-medium text-slate-800">
                                        {bantuan.keluarga.nama_kepala_keluarga}
                                    </CardTitle>
                                    <p className="text-slate-600 font-mono text-lg mt-1">
                                        {bantuan.keluarga.no_kk}
                                    </p>
                                    <div className="flex items-center space-x-3 mt-2">
                                        <Badge variant="outline" className={getStatusBadgeClass(bantuan.status)}>
                                            {bantuan.status}
                                        </Badge>
                                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                                            Tahun {bantuan.tahun_anggaran}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-600">Nominal per Bulan</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {formatCurrency(bantuan.nominal_per_bulan)}
                                </p>
                                <p className="text-sm text-slate-500">
                                    Total Tahun: {formatCurrency(safeStatistik.total_nominal_tahun)}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Informasi Bantuan */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Detail Bantuan */}
                        <Card className="detail-card bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-green-600" />
                                    Informasi Bantuan PKH
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Tahun Anggaran</label>
                                        <p className="text-lg font-semibold text-slate-800">{bantuan.tahun_anggaran}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Status Bantuan</label>
                                        <div className="mt-1">
                                            <Badge variant="outline" className={getStatusBadgeClass(bantuan.status)}>
                                                {bantuan.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Tanggal Penetapan</label>
                                        <p className="text-slate-800">{formatDate(bantuan.tanggal_penetapan)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Progress Distribusi</label>
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-slate-600">
                                                    {safeStatistik.sudah_disalurkan} dari {safeStatistik.total_bulan} bulan
                                                </span>
                                                <span className="text-sm font-medium text-slate-800">
                                                    {Math.round(safeStatistik.persentase)}%
                                                </span>
                                            </div>
                                            <Progress 
                                                value={safeStatistik.persentase} 
                                                className="progress-bar h-3"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {bantuan.keterangan && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Keterangan</label>
                                        <p className="text-slate-800 bg-slate-50 p-3 rounded-lg mt-1">{bantuan.keterangan}</p>
                                    </div>
                                )}

                                {/* Statistik Distribusi */}
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-green-600">{safeStatistik.sudah_disalurkan}</p>
                                        <p className="text-sm text-slate-600">Disalurkan</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <Clock className="w-6 h-6 text-yellow-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-yellow-600">{safeStatistik.belum_disalurkan}</p>
                                        <p className="text-sm text-slate-600">Belum Disalurkan</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <AlertTriangle className="w-6 h-6 text-red-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-red-600">{safeStatistik.gagal}</p>
                                        <p className="text-sm text-slate-600">Gagal</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Riwayat Distribusi */}
                        <Card className="detail-card bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                    Riwayat Distribusi Bantuan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Bulan</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Tanggal Distribusi</TableHead>
                                                <TableHead>Nominal</TableHead>
                                                <TableHead>Catatan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bantuan.distribusi.map((item) => {
                                                const StatusIcon = getDistribusiStatusIcon(item.status);
                                                return (
                                                    <TableRow key={item.id} className="hover:bg-slate-50/50">
                                                        <TableCell className="font-medium">
                                                            {getNamaBulan(item.bulan)} {bantuan.tahun_anggaran}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={getDistribusiStatusClass(item.status)}>
                                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                                {item.status === 'disalurkan' ? 'Disalurkan' : 
                                                                 item.status === 'gagal' ? 'Gagal' : 'Belum Disalurkan'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.tanggal_distribusi ? formatDate(item.tanggal_distribusi) : '-'}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {item.status === 'disalurkan' ? 
                                                                formatCurrency(bantuan.nominal_per_bulan) : '-'}
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">
                                                            {item.catatan || '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Informasi Keluarga */}
                    <div className="space-y-6">
                        {/* Data Keluarga */}
                        <Card className="detail-card bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-slate-200">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-cyan-600" />
                                    Data Keluarga
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600">No. KK</label>
                                    <p className="font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded mt-1">
                                        {bantuan.keluarga.no_kk}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Nama Kepala Keluarga</label>
                                    <p className="text-lg font-semibold text-slate-800">{bantuan.keluarga.nama_kepala_keluarga}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Status Ekonomi</label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className={getStatusEkonomiColor(bantuan.keluarga.status_ekonomi)}>
                                            {bantuan.keluarga.status_ekonomi.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Jumlah Anggota</label>
                                    <p className="text-slate-800">{bantuan.keluarga.jumlah_anggota} orang</p>
                                </div>
                                {bantuan.keluarga.penghasilan_bulanan && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Penghasilan Bulanan</label>
                                        <p className="text-slate-800">{formatCurrency(bantuan.keluarga.penghasilan_bulanan)}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Alamat */}
                        <Card className="detail-card bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-slate-200">
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-orange-600" />
                                    Alamat
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3">
                                <div>
                                    <p className="text-slate-800">{bantuan.keluarga.alamat}</p>
                                    {bantuan.keluarga.rt && bantuan.keluarga.rw && (
                                        <p className="text-sm text-slate-600">RT {bantuan.keluarga.rt} / RW {bantuan.keluarga.rw}</p>
                                    )}
                                    <p className="text-sm text-slate-600">
                                        {bantuan.keluarga.kelurahan}, {bantuan.keluarga.kecamatan}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        {bantuan.keluarga.kota}, {bantuan.keluarga.provinsi}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ringkasan Finansial */}
                        <Card className="detail-card bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-slate-200">
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-emerald-600" />
                                    Ringkasan Finansial
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Total Bantuan per Tahun</label>
                                    <p className="text-xl font-bold text-emerald-600">
                                        {formatCurrency(safeStatistik.total_nominal_tahun)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Sudah Terdistribusi</label>
                                    <p className="text-lg font-semibold text-green-600">
                                        {formatCurrency(safeStatistik.nominal_terdistribusi)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Sisa Distribusi</label>
                                    <p className="text-lg font-semibold text-orange-600">
                                        {formatCurrency(safeStatistik.total_nominal_tahun - safeStatistik.nominal_terdistribusi)}
                                    </p>
                                </div>
                                <div className="pt-3 border-t border-slate-200">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Progress:</span>
                                        <span className="font-medium text-slate-800">{Math.round(safeStatistik.persentase)}%</span>
                                    </div>
                                    <Progress value={safeStatistik.persentase} className="mt-2 h-2" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
