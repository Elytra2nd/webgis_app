import React from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Separator } from '@/Components/ui/separator';
import { useToast } from '@/Hooks/use-toast';
import {
  User,
  Plus,
  ArrowLeft,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
  MapPin,
  Heart,
  GraduationCap,
  Briefcase,
  IdCard,
  Waves,
  UserCheck,
  UserX
} from 'lucide-react';

interface Keluarga {
    id: number;
    no_kk: string;
    nama_kepala_keluarga: string;
}

interface CreateProps extends PageProps {
    keluarga: Keluarga[];
    selectedKeluargaId?: number;
}

type AnggotaKeluargaFormData = {
    keluarga_id: string;
    nik: string;
    nama: string;
    jenis_kelamin: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    status_dalam_keluarga: string;
    status_perkawinan: string;
    pendidikan_terakhir: string;
    pekerjaan: string;
} & Record<string, any>;

export default function Create({ auth, keluarga, selectedKeluargaId }: CreateProps) {
    const { toast } = useToast();

    // Animation variants
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

    // Breadcrumb
    const breadcrumbs = [
        { label: 'Dashboard', href: route('dashboard') },
        { label: 'Anggota Keluarga', href: route('anggota-keluarga.index') },
        { label: 'Tambah Anggota', current: true }
    ];

    const { data, setData, post, processing, errors } = useForm<AnggotaKeluargaFormData>({
        keluarga_id: selectedKeluargaId?.toString() || '',
        nik: '',
        nama: '',
        jenis_kelamin: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        status_dalam_keluarga: '',
        status_perkawinan: '',
        pendidikan_terakhir: '',
        pekerjaan: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData: Record<string, any> = { ...data };

        router.post(route('anggota-keluarga.store'), formData, {
            preserveScroll: true,
            onStart: () => {
                toast({
                    title: "Memproses Data",
                    description: "Sedang menyimpan data anggota keluarga...",
                    variant: "default",
                });
            },
            onSuccess: () => {
                toast({
                    title: "Data Berhasil Disimpan! 🎉",
                    description: `Data anggota keluarga ${data.nama} telah berhasil ditambahkan.`,
                    variant: "default",
                });
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                const errorMessages = Object.values(errors).flat();
                toast({
                    title: "Gagal Menyimpan Data",
                    description: errorMessages.join(', '),
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} breadcrumbs={breadcrumbs}>
            <Head title="Tambah Anggota Keluarga" />

            <motion.div
                className="space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header dengan animasi wave */}
                <motion.div
                    className="flex items-center justify-between mb-8"
                    variants={itemVariants}
                >
                    <div className="flex items-center space-x-4">
                        <motion.div
                            className="relative"
                            variants={waveVariants}
                            animate="animate"
                        >
                            <div className="w-3 h-10 bg-gradient-to-b from-cyan-400 via-teal-500 to-blue-600 rounded-full shadow-lg"></div>
                            <div className="absolute -top-1 -left-1 w-5 h-12 bg-gradient-to-b from-cyan-300/30 via-teal-400/30 to-blue-500/30 rounded-full blur-sm"></div>
                        </motion.div>
                        <div className="flex items-center space-x-3">
                            <Plus className="w-8 h-8 text-teal-600" />
                            <div>
                                <h1 className="font-semibold text-3xl text-slate-800 tracking-wide">Tambah Anggota Keluarga</h1>
                                <p className="text-slate-600 mt-1">Lengkapi informasi anggota keluarga dengan akurat</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                asChild
                                variant="outline"
                                className="border-slate-300 hover:bg-slate-50"
                            >
                                <Link href={route('anggota-keluarga.index')}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Main Form Card */}
                <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
                        {/* Header */}
                        <CardHeader className="pb-6 bg-gradient-to-r from-cyan-50/50 to-teal-50/50 border-b border-gray-100/50">
                            <div className="flex items-center space-x-4">
                                <motion.div
                                    className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <User className="w-8 h-8 text-cyan-600" />
                                </motion.div>
                                <div>
                                    <CardTitle className="text-xl font-medium text-slate-800">
                                        Form Data Anggota Keluarga
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Masukkan informasi lengkap anggota keluarga baru
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Family Selection */}
                                <motion.div
                                    className="space-y-4"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Users className="w-5 h-5 text-teal-600" />
                                        <h3 className="text-lg font-semibold text-slate-800">Informasi Keluarga</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="keluarga_id" className="text-sm font-medium text-slate-700">
                                            Pilih Keluarga *
                                        </Label>
                                        <Select value={data.keluarga_id} onValueChange={(value) => setData('keluarga_id', value)}>
                                            <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20">
                                                <SelectValue placeholder="Pilih Keluarga" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {keluarga.map((item) => (
                                                    <SelectItem key={item.id} value={item.id.toString()}>
                                                        {item.no_kk} - {item.nama_kepala_keluarga}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.keluarga_id && (
                                            <Alert variant="destructive">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>{errors.keluarga_id}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </motion.div>

                                <Separator />

                                {/* Personal Information */}
                                <motion.div
                                    className="space-y-6"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="flex items-center space-x-3 mb-4">
                                        <IdCard className="w-5 h-5 text-teal-600" />
                                        <h3 className="text-lg font-semibold text-slate-800">Data Pribadi</h3>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* NIK */}
                                        <div className="space-y-2">
                                            <Label htmlFor="nik" className="text-sm font-medium text-slate-700">
                                                NIK *
                                            </Label>
                                            <Input
                                                id="nik"
                                                type="text"
                                                value={data.nik}
                                                onChange={(e) => setData('nik', e.target.value)}
                                                placeholder="16 digit NIK"
                                                maxLength={16}
                                                className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                                required
                                            />
                                            {errors.nik && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.nik}
                                                </p>
                                            )}
                                        </div>

                                        {/* Nama */}
                                        <div className="space-y-2">
                                            <Label htmlFor="nama" className="text-sm font-medium text-slate-700">
                                                Nama Lengkap *
                                            </Label>
                                            <Input
                                                id="nama"
                                                type="text"
                                                value={data.nama}
                                                onChange={(e) => setData('nama', e.target.value)}
                                                placeholder="Nama lengkap sesuai KTP"
                                                className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                                required
                                            />
                                            {errors.nama && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.nama}
                                                </p>
                                            )}
                                        </div>

                                        {/* Jenis Kelamin */}
                                        <div className="space-y-2">
                                            <Label htmlFor="jenis_kelamin" className="text-sm font-medium text-slate-700">
                                                Jenis Kelamin *
                                            </Label>
                                            <Select value={data.jenis_kelamin} onValueChange={(value) => setData('jenis_kelamin', value)}>
                                                <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20">
                                                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="L">
                                                        <div className="flex items-center space-x-2">
                                                            <UserCheck className="w-4 h-4 text-blue-600" />
                                                            <span>Laki-laki</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="P">
                                                        <div className="flex items-center space-x-2">
                                                            <UserX className="w-4 h-4 text-pink-600" />
                                                            <span>Perempuan</span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.jenis_kelamin && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.jenis_kelamin}
                                                </p>
                                            )}
                                        </div>

                                        {/* Tempat Lahir */}
                                        <div className="space-y-2">
                                            <Label htmlFor="tempat_lahir" className="text-sm font-medium text-slate-700">
                                                Tempat Lahir *
                                            </Label>
                                            <Input
                                                id="tempat_lahir"
                                                type="text"
                                                value={data.tempat_lahir}
                                                onChange={(e) => setData('tempat_lahir', e.target.value)}
                                                placeholder="Kota/Kabupaten kelahiran"
                                                className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                                required
                                            />
                                            {errors.tempat_lahir && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.tempat_lahir}
                                                </p>
                                            )}
                                        </div>

                                        {/* Tanggal Lahir */}
                                        <div className="space-y-2">
                                            <Label htmlFor="tanggal_lahir" className="text-sm font-medium text-slate-700">
                                                Tanggal Lahir *
                                            </Label>
                                            <Input
                                                id="tanggal_lahir"
                                                type="date"
                                                value={data.tanggal_lahir}
                                                onChange={(e) => setData('tanggal_lahir', e.target.value)}
                                                className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                                required
                                            />
                                            {errors.tanggal_lahir && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.tanggal_lahir}
                                                </p>
                                            )}
                                        </div>

                                        {/* Status dalam Keluarga */}
                                        <div className="space-y-2">
                                            <Label htmlFor="status_dalam_keluarga" className="text-sm font-medium text-slate-700">
                                                Status dalam Keluarga *
                                            </Label>
                                            <Select value={data.status_dalam_keluarga} onValueChange={(value) => setData('status_dalam_keluarga', value)}>
                                                <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20">
                                                    <SelectValue placeholder="Pilih Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="kepala keluarga">Kepala Keluarga</SelectItem>
                                                    <SelectItem value="istri">Istri</SelectItem>
                                                    <SelectItem value="anak">Anak</SelectItem>
                                                    <SelectItem value="lainnya">Lainnya</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status_dalam_keluarga && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.status_dalam_keluarga}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                <Separator />

                                {/* Additional Information */}
                                <motion.div
                                    className="space-y-6"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Briefcase className="w-5 h-5 text-teal-600" />
                                        <h3 className="text-lg font-semibold text-slate-800">Informasi Tambahan</h3>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Status Perkawinan */}
                                        <div className="space-y-2">
                                            <Label htmlFor="status_perkawinan" className="text-sm font-medium text-slate-700">
                                                Status Perkawinan *
                                            </Label>
                                            <Select value={data.status_perkawinan} onValueChange={(value) => setData('status_perkawinan', value)}>
                                                <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20">
                                                    <SelectValue placeholder="Pilih Status Perkawinan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="belum kawin">Belum Kawin</SelectItem>
                                                    <SelectItem value="kawin">Kawin</SelectItem>
                                                    <SelectItem value="cerai hidup">Cerai Hidup</SelectItem>
                                                    <SelectItem value="cerai mati">Cerai Mati</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status_perkawinan && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.status_perkawinan}
                                                </p>
                                            )}
                                        </div>

                                        {/* Pendidikan Terakhir */}
                                        <div className="space-y-2">
                                            <Label htmlFor="pendidikan_terakhir" className="text-sm font-medium text-slate-700">
                                                Pendidikan Terakhir *
                                            </Label>
                                            <Input
                                                id="pendidikan_terakhir"
                                                type="text"
                                                value={data.pendidikan_terakhir}
                                                onChange={(e) => setData('pendidikan_terakhir', e.target.value)}
                                                placeholder="SD, SMP, SMA, D3, S1, S2, S3"
                                                className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                                required
                                            />
                                            {errors.pendidikan_terakhir && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.pendidikan_terakhir}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pekerjaan */}
                                    <div className="space-y-2">
                                        <Label htmlFor="pekerjaan" className="text-sm font-medium text-slate-700">
                                            Pekerjaan *
                                        </Label>
                                        <Input
                                            id="pekerjaan"
                                            type="text"
                                            value={data.pekerjaan}
                                            onChange={(e) => setData('pekerjaan', e.target.value)}
                                            placeholder="Jenis pekerjaan atau profesi"
                                            className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                            required
                                        />
                                        {errors.pekerjaan && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <AlertTriangle className="w-4 h-4 mr-1" />
                                                {errors.pekerjaan}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Action Buttons */}
                                <motion.div
                                    className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-slate-200"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="border-slate-300 hover:bg-slate-50"
                                        >
                                            <Link href={route('anggota-keluarga.index')}>
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                Batal
                                            </Link>
                                        </Button>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Simpan Data
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </AuthenticatedLayout>
    );
}
