import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MapDrawing from '@/Components/Map/MapDrawing';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Separator } from '@/Components/ui/separator';
import { useToast } from '@/Hooks/use-toast';
import {
  Home,
  Plus,
  ArrowLeft,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Users,
  MapPin,
  DollarSign,
  FileText,
  Waves,
  Navigation
} from 'lucide-react';

// Import data dari file terpisah
import {
  provinsiData,
  kotaData,
  getKotaByProvinsi,
  findProvinsiByNama,
  type Provinsi,
  type Kota
} from '@/data/provinsiKota';

// Interface untuk form data
type KeluargaFormData = {
    no_kk: string;
    nama_kepala_keluarga: string;
    alamat: string;
    rt: string;
    rw: string;
    kelurahan: string;
    kecamatan: string;
    kota: string;
    provinsi: string;
    kode_pos: string;
    latitude: string;
    longitude: string;
    status_ekonomi: string;
    penghasilan_bulanan: string;
    keterangan: string;
};

interface LocationData {
    lat: number;
    lng: number;
}

export default function Create({ auth }: PageProps) {
    const { toast } = useToast();

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<KeluargaFormData>({
        no_kk: '',
        nama_kepala_keluarga: '',
        alamat: '',
        rt: '',
        rw: '',
        kelurahan: '',
        kecamatan: '',
        kota: '',
        provinsi: '',
        kode_pos: '',
        latitude: '',
        longitude: '',
        status_ekonomi: 'miskin',
        penghasilan_bulanan: '',
        keterangan: ''
    });

    // State untuk dependent dropdown
    const [selectedProvinsi, setSelectedProvinsi] = useState<Provinsi | null>(null);
    const [availableKota, setAvailableKota] = useState<Kota[]>([]);
    const [keluargaId, setKeluargaId] = useState<number | null>(null);
    const [isFormSaved, setIsFormSaved] = useState<boolean>(false);
    const [showMapSection, setShowMapSection] = useState<boolean>(false);
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

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

    const waveVariants = {
        animate: {
            x: [0, -20, 0],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
    };

    // Breadcrumb
    const breadcrumbs = [
        { label: 'Dashboard', href: route('dashboard') },
        { label: 'Data Keluarga', href: route('keluarga.index') },
        { label: 'Tambah Data', current: true }
    ];

    // Handle perubahan provinsi
    const handleProvinsiChange = (provinsiNama: string) => {
        setData('provinsi', provinsiNama);
        setData('kota', ''); // Reset kota

        if (provinsiNama) {
            const provinsi = findProvinsiByNama(provinsiNama);
            setSelectedProvinsi(provinsi || null);

            if (provinsi) {
                const filteredKota = getKotaByProvinsi(provinsi.id);
                setAvailableKota(filteredKota);
            } else {
                setAvailableKota([]);
            }
        } else {
            setSelectedProvinsi(null);
            setAvailableKota([]);
        }
    };

    // Handle submit form
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('keluarga.store'), {
            onStart: () => {
                toast({
                    title: "Memproses Data",
                    description: "Sedang menyimpan data keluarga...",
                    variant: "default",
                });
            },
            onSuccess: (response: any) => {
                try {
                    let id = null;

                    if (response.props && response.props.keluarga && response.props.keluarga.id) {
                        id = response.props.keluarga.id;
                    } else if (response.keluarga && response.keluarga.id) {
                        id = response.keluarga.id;
                    } else if (response.props && response.props.flash && response.props.flash.keluarga_id) {
                        id = response.props.flash.keluarga_id;
                    }

                    if (id) {
                        setKeluargaId(id);
                        setIsFormSaved(true);
                        setShowMapSection(true);

                        toast({
                            title: "Data Berhasil Disimpan! 🎉",
                            description: `Data keluarga ${data.nama_kepala_keluarga} telah berhasil disimpan.`,
                            variant: "default",
                        });

                        setTimeout(() => {
                            const mapSection = document.getElementById('map-section');
                            if (mapSection) {
                                mapSection.scrollIntoView({ behavior: 'smooth' });
                            }
                        }, 100);
                    } else {
                        setIsFormSaved(true);
                        toast({
                            title: "Data Berhasil Disimpan! 🎉",
                            description: "Data keluarga telah berhasil disimpan.",
                            variant: "default",
                        });
                    }
                } catch (error) {
                    console.error('Error processing response:', error);
                    setIsFormSaved(true);
                    toast({
                        title: "Data Berhasil Disimpan! 🎉",
                        description: "Data keluarga telah berhasil disimpan.",
                        variant: "default",
                    });
                }
            },
            onError: (errors) => {
                console.error('Error saving keluarga:', errors);
                const errorMessages = Object.values(errors).flat();
                toast({
                    title: "Gagal Menyimpan Data",
                    description: errorMessages.join(', '),
                    variant: "destructive",
                });
            }
        });
    };

    // Handle koordinat dari peta
    const handleMapPointSaved = (point: LocationData) => {
        if (point && point.lat && point.lng) {
            setData(prev => ({
                ...prev,
                latitude: point.lat.toString(),
                longitude: point.lng.toString()
            }));

            setCurrentLocation(point);

            if (keluargaId) {
                const updateData = {
                    ...data,
                    latitude: point.lat.toString(),
                    longitude: point.lng.toString()
                };

                put(route('keluarga.update', keluargaId), {
                    ...updateData,
                    onSuccess: () => {
                        toast({
                            title: "Koordinat Berhasil Disimpan! 📍",
                            description: "Lokasi keluarga telah berhasil ditentukan pada peta.",
                            variant: "default",
                        });
                    },
                    onError: (errors: any) => {
                        console.error('Error updating coordinates:', errors);
                        toast({
                            title: "Gagal Menyimpan Koordinat",
                            description: "Terjadi kesalahan saat menyimpan koordinat.",
                            variant: "destructive",
                        });
                    }
                });
            }
        }
    };

    const handleStartOver = () => {
        reset();
        setKeluargaId(null);
        setIsFormSaved(false);
        setShowMapSection(false);
        setCurrentLocation(null);
        clearErrors();
        setSelectedProvinsi(null);
        setAvailableKota([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFinish = () => {
        router.visit(route('keluarga.index'));
    };

    return (
        <AuthenticatedLayout user={auth.user} breadcrumbs={breadcrumbs}>
            <Head title="Tambah Data Keluarga" />

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
                                <h1 className="font-semibold text-3xl text-slate-800 tracking-wide">Tambah Data Keluarga</h1>
                                <p className="text-slate-600 mt-1">Lengkapi informasi keluarga dengan akurat</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button asChild variant="outline" className="border-slate-300 hover:bg-slate-50">
                                <Link href={route('keluarga.index')}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Progress Indicator */}
                <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                        isFormSaved ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-r from-cyan-400 to-teal-500 text-white'
                                    }`}>
                                        {isFormSaved ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : (
                                            <span className="text-sm font-medium">1</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Data Keluarga</p>
                                        <p className="text-sm text-slate-500">
                                            {isFormSaved ? 'Tersimpan' : 'Isi informasi keluarga'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                        showMapSection ? 'bg-gradient-to-r from-cyan-400 to-teal-500 text-white' : 'bg-slate-200 text-slate-400'
                                    }`}>
                                        <span className="text-sm font-medium">2</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Lokasi Peta</p>
                                        <p className="text-sm text-slate-500">
                                            {showMapSection ? 'Tentukan koordinat' : 'Menunggu data tersimpan'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Form Data Keluarga */}
                <motion.div variants={itemVariants}>
                    <Card className={`border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden transition-all duration-500 ${
                        isFormSaved ? 'opacity-75' : 'opacity-100'
                    }`}>
                        <CardHeader className="pb-6 bg-gradient-to-r from-cyan-50/50 to-teal-50/50 border-b border-gray-100/50">
                            <div className="flex items-center space-x-4">
                                <motion.div
                                    className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Home className="w-8 h-8 text-cyan-600" />
                                </motion.div>
                                <div>
                                    <CardTitle className="text-xl font-medium text-slate-800">
                                        Form Data Keluarga
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Masukkan informasi lengkap keluarga baru
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Data KK Section */}
                                <motion.div
                                    className="space-y-6"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="flex items-center space-x-3 mb-4">
                                        <FileText className="w-5 h-5 text-teal-600" />
                                        <h3 className="text-lg font-semibold text-slate-800">Data Kartu Keluarga</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="no_kk" className="text-sm font-medium text-slate-700">
                                                Nomor KK *
                                            </Label>
                                            <Input
                                                id="no_kk"
                                                value={data.no_kk}
                                                onChange={(e) => setData('no_kk', e.target.value)}
                                                placeholder="16 digit nomor KK"
                                                maxLength={16}
                                                className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                                required
                                                disabled={isFormSaved}
                                            />
                                            {errors.no_kk && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.no_kk}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nama_kepala_keluarga" className="text-sm font-medium text-slate-700">
                                                Nama Kepala Keluarga *
                                            </Label>
                                            <Input
                                                id="nama_kepala_keluarga"
                                                value={data.nama_kepala_keluarga}
                                                onChange={(e) => setData('nama_kepala_keluarga', e.target.value)}
                                                placeholder="Nama lengkap kepala keluarga"
                                                className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                                required
                                                disabled={isFormSaved}
                                            />
                                            {errors.nama_kepala_keluarga && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.nama_kepala_keluarga}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                <Separator />

                                {/* Alamat Section dengan Enhanced Dropdown */}
                                <motion.div
                                    className="space-y-6"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="flex items-center space-x-3 mb-4">
                                        <MapPin className="w-5 h-5 text-teal-600" />
                                        <h3 className="text-lg font-semibold text-slate-800">Alamat Lengkap</h3>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Provinsi Dropdown */}
                                        <div className="space-y-2">
                                            <Label htmlFor="provinsi" className="text-sm font-medium text-slate-700">
                                                Provinsi *
                                            </Label>
                                            <Select value={data.provinsi} onValueChange={handleProvinsiChange} disabled={isFormSaved}>
                                                <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20">
                                                    <SelectValue placeholder="Pilih Provinsi" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {provinsiData.map((provinsi) => (
                                                        <SelectItem key={provinsi.id} value={provinsi.nama}>
                                                            {provinsi.nama}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.provinsi && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.provinsi}
                                                </p>
                                            )}
                                        </div>

                                        {/* Kota/Kabupaten Dropdown */}
                                        <div className="space-y-2">
                                            <Label htmlFor="kota" className="text-sm font-medium text-slate-700">
                                                Kota/Kabupaten *
                                            </Label>
                                            <Select
                                                value={data.kota}
                                                onValueChange={(value) => setData('kota', value)}
                                                disabled={isFormSaved || !selectedProvinsi}
                                            >
                                                <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20">
                                                    <SelectValue placeholder={
                                                        selectedProvinsi ? 'Pilih Kota/Kabupaten' : 'Pilih Provinsi Terlebih Dahulu'
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableKota.map((kota) => (
                                                        <SelectItem key={kota.id} value={kota.nama}>
                                                            {kota.nama}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.kota && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.kota}
                                                </p>
                                            )}
                                        </div>

                                        {/* Rest of address fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="kecamatan" className="text-sm font-medium text-slate-700">
                                                    Kecamatan *
                                                </Label>
                                                <Input
                                                    id="kecamatan"
                                                    value={data.kecamatan}
                                                    onChange={(e) => setData('kecamatan', e.target.value)}
                                                    placeholder="Nama kecamatan"
                                                    className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                                    required
                                                    disabled={isFormSaved}
                                                />
                                                {errors.kecamatan && (
                                                    <p className="text-sm text-red-600 flex items-center">
                                                        <AlertTriangle className="w-4 h-4 mr-1" />
                                                        {errors.kecamatan}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="kelurahan" className="text-sm font-medium text-slate-700">
                                                    Kelurahan/Desa *
                                                </Label>
                                                <Input
                                                    id="kelurahan"
                                                    value={data.kelurahan}
                                                    onChange={(e) => setData('kelurahan', e.target.value)}
                                                    placeholder="Nama kelurahan/desa"
                                                    className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                                    required
                                                    disabled={isFormSaved}
                                                />
                                                {errors.kelurahan && (
                                                    <p className="text-sm text-red-600 flex items-center">
                                                        <AlertTriangle className="w-4 h-4 mr-1" />
                                                        {errors.kelurahan}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="alamat" className="text-sm font-medium text-slate-700">
                                                Alamat (Jalan dan Nomor) *
                                            </Label>
                                            <Textarea
                                                id="alamat"
                                                rows={3}
                                                value={data.alamat}
                                                onChange={(e) => setData('alamat', e.target.value)}
                                                placeholder="Nama jalan, nomor rumah, gang, dll"
                                                className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                                required
                                                disabled={isFormSaved}
                                            />
                                            {errors.alamat && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.alamat}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="rt" className="text-sm font-medium text-slate-700">
                                                    RT
                                                </Label>
                                                <Input
                                                    id="rt"
                                                    value={data.rt}
                                                    onChange={(e) => setData('rt', e.target.value)}
                                                    placeholder="001"
                                                    className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                                    disabled={isFormSaved}
                                                />
                                                {errors.rt && (
                                                    <p className="text-sm text-red-600 flex items-center">
                                                        <AlertTriangle className="w-4 h-4 mr-1" />
                                                        {errors.rt}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="rw" className="text-sm font-medium text-slate-700">
                                                    RW
                                                </Label>
                                                <Input
                                                    id="rw"
                                                    value={data.rw}
                                                    onChange={(e) => setData('rw', e.target.value)}
                                                    placeholder="001"
                                                    className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                                    disabled={isFormSaved}
                                                />
                                                {errors.rw && (
                                                    <p className="text-sm text-red-600 flex items-center">
                                                        <AlertTriangle className="w-4 h-4 mr-1" />
                                                        {errors.rw}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <Separator />

                                {/* Status Ekonomi Section */}
                                <motion.div
                                    className="space-y-6"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="flex items-center space-x-3 mb-4">
                                        <DollarSign className="w-5 h-5 text-teal-600" />
                                        <h3 className="text-lg font-semibold text-slate-800">Status Ekonomi</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="status_ekonomi" className="text-sm font-medium text-slate-700">
                                                Status Ekonomi *
                                            </Label>
                                            <Select
                                                value={data.status_ekonomi}
                                                onValueChange={(value) => setData('status_ekonomi', value)}
                                                disabled={isFormSaved}
                                            >
                                                <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20">
                                                    <SelectValue placeholder="Pilih Status Ekonomi" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sangat_miskin">Sangat Miskin</SelectItem>
                                                    <SelectItem value="miskin">Miskin</SelectItem>
                                                    <SelectItem value="rentan_miskin">Rentan Miskin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status_ekonomi && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.status_ekonomi}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="penghasilan_bulanan" className="text-sm font-medium text-slate-700">
                                                Penghasilan Bulanan (Rp)
                                            </Label>
                                            <Input
                                                id="penghasilan_bulanan"
                                                type="number"
                                                value={data.penghasilan_bulanan}
                                                onChange={(e) => setData('penghasilan_bulanan', e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                                disabled={isFormSaved}
                                            />
                                            {errors.penghasilan_bulanan && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {errors.penghasilan_bulanan}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="keterangan" className="text-sm font-medium text-slate-700">
                                            Keterangan
                                        </Label>
                                        <Textarea
                                            id="keterangan"
                                            rows={3}
                                            value={data.keterangan}
                                            onChange={(e) => setData('keterangan', e.target.value)}
                                            placeholder="Keterangan tambahan (opsional)"
                                            className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                                            disabled={isFormSaved}
                                        />
                                        {errors.keterangan && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <AlertTriangle className="w-4 h-4 mr-1" />
                                                {errors.keterangan}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Submit Button */}
                                {!isFormSaved && (
                                    <motion.div
                                        className="flex items-center justify-end pt-6 border-t border-slate-200"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
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
                                                        Simpan Data Keluarga
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Section Peta - Muncul setelah data tersimpan */}
                <AnimatePresence>
                    {showMapSection && keluargaId && (
                        <motion.div
                            id="map-section"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            transition={{ type: "spring", stiffness: 100 }}
                        >
                            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
                                <CardHeader className="pb-6 bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-b border-gray-100/50">
                                    <div className="flex items-center space-x-4">
                                        <motion.div
                                            className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <Navigation className="w-8 h-8 text-emerald-600" />
                                        </motion.div>
                                        <div>
                                            <CardTitle className="text-xl font-medium text-slate-800">
                                                Tentukan Lokasi pada Peta
                                            </CardTitle>
                                            <CardDescription className="mt-2">
                                                Klik pada peta untuk menentukan koordinat lokasi keluarga
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-8">
                                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner" style={{ height: '500px' }}>
                                        <MapDrawing keluargaId={keluargaId} onSave={handleMapPointSaved} />
                                    </div>

                                    <div className="flex items-center justify-between mt-6">
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                onClick={handleStartOver}
                                                variant="outline"
                                                className="border-slate-300 hover:bg-slate-50"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Tambah Keluarga Lain
                                            </Button>
                                        </motion.div>

                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                onClick={handleFinish}
                                                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Selesai & Lihat Daftar Keluarga
                                            </Button>
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success Message */}
                <AnimatePresence>
                    {isFormSaved && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-700">
                                    Data keluarga berhasil disimpan! {data.latitude && data.longitude ? 'Koordinat sudah ditentukan.' : 'Silakan tentukan koordinat lokasi pada peta di atas jika diperlukan.'}
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AuthenticatedLayout>
    );
}
