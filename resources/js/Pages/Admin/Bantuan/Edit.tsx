import React, { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { useToast } from '@/Hooks/use-toast';
import { ArrowLeft, Save, DollarSign, Calendar, FileText, AlertTriangle, Users, HandHeart } from 'lucide-react';

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
        jumlah_anggota?: number;
    };
}

interface StatusOptions {
    [key: string]: string;
}

interface Props {
    auth: { user: { name: string; email: string } };
    bantuan: Bantuan;
    status_options?: StatusOptions;
}

export default function Edit({ auth, bantuan, status_options = {} }: Props) {
    const mainContainerRef = useRef(null);
    const { toast } = useToast();

    // Default status options jika tidak ada dari server
    const defaultStatusOptions = {
        'ditetapkan': 'Ditetapkan',
        'aktif': 'Aktif',
        'selesai': 'Selesai',
        'dibatalkan': 'Dibatalkan'
    };

    const finalStatusOptions = Object.keys(status_options).length > 0 
        ? status_options 
        : defaultStatusOptions;

    const { data, setData, patch, processing, errors, reset } = useForm({
        status: bantuan.status,
        nominal_per_bulan: bantuan.nominal_per_bulan.toString(),
        keterangan: bantuan.keterangan || '',
    });

    // Animasi GSAP
    useGSAP(() => {
        gsap.from('.form-card', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power3.out'
        });
        gsap.from('.info-card', {
            opacity: 0,
            x: 20,
            duration: 0.8,
            ease: 'power3.out',
            delay: 0.2
        });
    }, { scope: mainContainerRef });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        patch(route('admin.bantuan.update', bantuan.id), {
            onStart: () => {
                toast({
                    title: "Memproses Data",
                    description: "Sedang memperbarui data bantuan...",
                    variant: "default",
                });
            },
            onSuccess: () => {
                toast({
                    title: "Berhasil Diperbarui! ✅",
                    description: "Data bantuan telah berhasil diperbarui.",
                });
            },
            onError: () => {
                toast({
                    title: "Gagal Memperbarui",
                    description: "Terjadi kesalahan saat memperbarui data. Silakan coba lagi.",
                    variant: "destructive",
                });
            }
        });
    };

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

    const breadcrumbs = [
        { label: 'Dashboard', href: route('dashboard') },
        { label: 'Bantuan PKH', href: route('admin.bantuan.index') },
        { label: 'Edit Bantuan', current: true }
    ];

    return (
        <AuthenticatedLayout user={auth.user} breadcrumbs={breadcrumbs}>
            <Head title={`Edit Bantuan PKH - ${bantuan.keluarga.nama_kepala_keluarga}`} />

            <div ref={mainContainerRef} className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('admin.bantuan.show', bantuan.id)}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Edit Bantuan PKH</h1>
                        <p className="mt-1 text-slate-600">Perbarui informasi bantuan untuk {bantuan.keluarga.nama_kepala_keluarga}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Edit */}
                    <div className="lg:col-span-2">
                        <Card className="form-card bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-200">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-amber-600" />
                                    Form Edit Bantuan PKH
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="status">Status Bantuan *</Label>
                                            <Select value={data.status} onValueChange={(value) => setData('status', value as any)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Pilih status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(finalStatusOptions).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.status && (
                                                <p className="text-red-600 text-sm mt-1">{errors.status}</p>
                                            )}
                                            <p className="text-xs text-slate-500 mt-1">
                                                Status saat ini: <span className="font-medium">{finalStatusOptions[bantuan.status]}</span>
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="nominal_per_bulan">Nominal per Bulan (Rp) *</Label>
                                            <Input
                                                id="nominal_per_bulan"
                                                type="number"
                                                value={data.nominal_per_bulan}
                                                onChange={(e) => setData('nominal_per_bulan', e.target.value)}
                                                className="mt-1"
                                                placeholder="Masukkan nominal bantuan per bulan"
                                                min="0"
                                                step="1000"
                                            />
                                            {errors.nominal_per_bulan && (
                                                <p className="text-red-600 text-sm mt-1">{errors.nominal_per_bulan}</p>
                                            )}
                                            {data.nominal_per_bulan && (
                                                <p className="text-sm text-slate-600 mt-1">
                                                    Total per tahun: {formatCurrency(parseFloat(data.nominal_per_bulan) * 12)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="keterangan">Keterangan</Label>
                                        <Textarea
                                            id="keterangan"
                                            value={data.keterangan}
                                            onChange={(e) => setData('keterangan', e.target.value)}
                                            className="mt-1"
                                            placeholder="Masukkan keterangan tambahan (opsional)"
                                            rows={4}
                                        />
                                        {errors.keterangan && (
                                            <p className="text-red-600 text-sm mt-1">{errors.keterangan}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-green-600 hover:bg-green-700 flex-1"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Simpan Perubahan
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => reset()}
                                            disabled={processing}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Info Bantuan */}
                    <div className="space-y-6">
                        {/* Info Bantuan */}
                        <Card className="info-card bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200">
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                    Info Bantuan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600">No. KK</label>
                                    <p className="font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded mt-1">{bantuan.keluarga.no_kk}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Kepala Keluarga</label>
                                    <p className="font-semibold text-slate-800">{bantuan.keluarga.nama_kepala_keluarga}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Tahun Anggaran</label>
                                    <p className="text-slate-800">{bantuan.tahun_anggaran}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Status Ekonomi</label>
                                    <p className="text-slate-800 capitalize">{bantuan.keluarga.status_ekonomi.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Tanggal Penetapan</label>
                                    <p className="text-slate-800">{formatDate(bantuan.tanggal_penetapan)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Nominal Saat Ini</label>
                                    <p className="text-lg font-semibold text-green-600">{formatCurrency(bantuan.nominal_per_bulan)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info Keluarga */}
                        <Card className="info-card bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-purple-600" />
                                    Data Keluarga
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Alamat</label>
                                    <p className="text-slate-800">{bantuan.keluarga.alamat}</p>
                                </div>
                                {bantuan.keluarga.jumlah_anggota && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Jumlah Anggota</label>
                                        <p className="text-slate-800">{bantuan.keluarga.jumlah_anggota} orang</p>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-slate-200">
                                    <Link href={route('admin.keluarga.show', bantuan.keluarga.id)}>
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Users className="mr-2 h-4 w-4" />
                                            Lihat Detail Keluarga
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Peringatan */}
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Perhatian:</strong> Perubahan status bantuan akan mempengaruhi distribusi bulanan. 
                                Pastikan data yang dimasukkan sudah benar sebelum menyimpan.
                            </AlertDescription>
                        </Alert>

                        {/* Status Guide */}
                        <Card className="info-card bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-slate-200">
                                <CardTitle className="flex items-center gap-2">
                                    <HandHeart className="h-5 w-5 text-gray-600" />
                                    Panduan Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span><strong>Ditetapkan:</strong> Bantuan telah ditetapkan namun belum aktif</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span><strong>Aktif:</strong> Bantuan sedang berjalan dan dapat didistribusikan</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                        <span><strong>Selesai:</strong> Bantuan telah selesai untuk tahun anggaran ini</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span><strong>Dibatalkan:</strong> Bantuan dibatalkan karena alasan tertentu</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
