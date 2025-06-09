import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import {
  User,
  Edit,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  GraduationCap,
  Briefcase,
  Heart,
  IdCard,
  Home,
  Phone,
  Waves,
  UserCheck,
  UserX
} from 'lucide-react';

// Tipe data untuk anggota keluarga
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
    agama?: string;
    kewarganegaraan?: string;
    no_telepon?: string;
    email?: string;
    alamat?: string;
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
    };
}

interface ShowProps extends PageProps {
    anggotaKeluarga: AnggotaKeluarga;
}

const Show: React.FC<ShowProps> = ({ auth, anggotaKeluarga }) => {
    // Function untuk format tanggal lahir
    const formatTanggalLahir = (tanggal: string) => {
        if (!tanggal) return '-';

        if (tanggal.includes('T')) {
            const dateOnly = tanggal.split('T')[0];
            const [year, month, day] = dateOnly.split('-');
            return `${day}/${month}/${year}`;
        }

        return tanggal;
    };

    // Function untuk menghitung umur
    const hitungUmur = (tanggalLahir: string) => {
        if (!tanggalLahir) return '-';

        const today = new Date();
        const birthDate = new Date(tanggalLahir);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return `${age} tahun`;
    };

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
        { label: anggotaKeluarga.nama, current: true }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            breadcrumbs={breadcrumbs}
        >
            <Head title={`Detail ${anggotaKeluarga.nama}`} />

            {/* Custom CSS untuk tema aquatic */}
            <style>{`
                .aquatic-gradient {
                    background: linear-gradient(135deg, #0891b2 0%, #0e7490 25%, #155e75 50%, #164e63 75%, #1e3a8a 100%);
                }
                .glass-effect {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .wave-pattern {
                    background-image:
                        radial-gradient(circle at 25% 25%, rgba(14, 116, 144, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 75% 75%, rgba(21, 94, 117, 0.1) 0%, transparent 50%);
                }
                .info-card {
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .info-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(8, 145, 178, 0.15);
                }
                .info-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #0891b2, #0e7490, #155e75);
                }
            `}</style>

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
                            <User className="w-8 h-8 text-teal-600" />
                            <div>
                                <h1 className="font-light text-3xl text-slate-800 tracking-wide">Detail Anggota Keluarga</h1>
                                <p className="text-slate-600 mt-1">{anggotaKeluarga.nama}</p>
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
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                asChild
                                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Link href={route('anggota-keluarga.edit', anggotaKeluarga.id)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Data
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Profile Card */}
                <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden info-card">
                        <CardHeader className="pb-6 bg-gradient-to-r from-cyan-50/50 to-teal-50/50 border-b border-gray-100/50">
                            <div className="flex items-center space-x-4">
                                <motion.div
                                    className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {anggotaKeluarga.jenis_kelamin === 'L' ? (
                                        <UserCheck className="w-10 h-10 text-blue-600" />
                                    ) : (
                                        <UserX className="w-10 h-10 text-pink-600" />
                                    )}
                                </motion.div>
                                <div>
                                    <CardTitle className="text-2xl font-medium text-slate-800">
                                        {anggotaKeluarga.nama}
                                    </CardTitle>
                                    <div className="flex items-center space-x-3 mt-2">
                                        <Badge
                                            variant="secondary"
                                            className="bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 border border-cyan-200"
                                        >
                                            {anggotaKeluarga.status_dalam_keluarga}
                                        </Badge>
                                        <Badge
                                            variant="secondary"
                                            className={`${
                                                anggotaKeluarga.jenis_kelamin === 'L'
                                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                    : 'bg-pink-100 text-pink-800 border border-pink-200'
                                            }`}
                                        >
                                            {anggotaKeluarga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Data Pribadi */}
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <Waves className="w-5 h-5 text-teal-600" />
                                        <h3 className="text-lg font-semibold text-slate-800">Data Pribadi</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <IdCard className="w-5 h-5 text-slate-500 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">NIK</p>
                                                <p className="text-slate-800 font-mono bg-slate-100 px-2 py-1 rounded text-sm inline-block">
                                                    {anggotaKeluarga.nik}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <MapPin className="w-5 h-5 text-slate-500 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Tempat Lahir</p>
                                                <p className="text-slate-800">{anggotaKeluarga.tempat_lahir}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <Calendar className="w-5 h-5 text-slate-500 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Tanggal Lahir</p>
                                                <p className="text-slate-800">
                                                    {formatTanggalLahir(anggotaKeluarga.tanggal_lahir)}
                                                    <span className="text-slate-500 ml-2">
                                                        ({hitungUmur(anggotaKeluarga.tanggal_lahir)})
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <Heart className="w-5 h-5 text-slate-500 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Status Perkawinan</p>
                                                <p className="text-slate-800">{anggotaKeluarga.status_perkawinan}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <GraduationCap className="w-5 h-5 text-slate-500 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Pendidikan Terakhir</p>
                                                <p className="text-slate-800">{anggotaKeluarga.pendidikan_terakhir}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <Briefcase className="w-5 h-5 text-slate-500 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Pekerjaan</p>
                                                <p className="text-slate-800">{anggotaKeluarga.pekerjaan}</p>
                                            </div>
                                        </div>

                                        {anggotaKeluarga.agama && (
                                            <div className="flex items-start space-x-3">
                                                <Heart className="w-5 h-5 text-slate-500 mt-1" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Agama</p>
                                                    <p className="text-slate-800">{anggotaKeluarga.agama}</p>
                                                </div>
                                            </div>
                                        )}

                                        {anggotaKeluarga.kewarganegaraan && (
                                            <div className="flex items-start space-x-3">
                                                <Users className="w-5 h-5 text-slate-500 mt-1" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Kewarganegaraan</p>
                                                    <p className="text-slate-800">{anggotaKeluarga.kewarganegaraan}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Data Keluarga */}
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <Home className="w-5 h-5 text-teal-600" />
                                        <h3 className="text-lg font-semibold text-slate-800">Data Keluarga</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <IdCard className="w-5 h-5 text-slate-500 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">No. Kartu Keluarga</p>
                                                <p className="text-slate-800 font-mono bg-slate-100 px-2 py-1 rounded text-sm inline-block">
                                                    {anggotaKeluarga.keluarga.no_kk}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <User className="w-5 h-5 text-slate-500 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Kepala Keluarga</p>
                                                <p className="text-slate-800">{anggotaKeluarga.keluarga.nama_kepala_keluarga}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <Home className="w-5 h-5 text-slate-500 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Alamat</p>
                                                <p className="text-slate-800">{anggotaKeluarga.keluarga.alamat}</p>

                                                {(anggotaKeluarga.keluarga.rt || anggotaKeluarga.keluarga.rw) && (
                                                    <p className="text-slate-600 text-sm mt-1">
                                                        RT {anggotaKeluarga.keluarga.rt || '-'} / RW {anggotaKeluarga.keluarga.rw || '-'}
                                                    </p>
                                                )}

                                                {anggotaKeluarga.keluarga.kelurahan && (
                                                    <p className="text-slate-600 text-sm">
                                                        Kelurahan {anggotaKeluarga.keluarga.kelurahan}
                                                        {anggotaKeluarga.keluarga.kecamatan && `, Kecamatan ${anggotaKeluarga.keluarga.kecamatan}`}
                                                    </p>
                                                )}

                                                {anggotaKeluarga.keluarga.kota && (
                                                    <p className="text-slate-600 text-sm">
                                                        {anggotaKeluarga.keluarga.kota}
                                                        {anggotaKeluarga.keluarga.provinsi && `, ${anggotaKeluarga.keluarga.provinsi}`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {anggotaKeluarga.no_telepon && (
                                            <div className="flex items-start space-x-3">
                                                <Phone className="w-5 h-5 text-slate-500 mt-1" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">No. Telepon</p>
                                                    <p className="text-slate-800">{anggotaKeluarga.no_telepon}</p>
                                                </div>
                                            </div>
                                        )}

                                        {anggotaKeluarga.email && (
                                            <div className="flex items-start space-x-3">
                                                <IdCard className="w-5 h-5 text-slate-500 mt-1" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Email</p>
                                                    <p className="text-slate-800">{anggotaKeluarga.email}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Separator className="my-6" />

                                    {/* Quick Actions */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-slate-700">Aksi Cepat</h4>
                                        <div className="flex flex-wrap gap-2">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Link href={route('keluarga.show', anggotaKeluarga.keluarga.id)}>
                                                        <Home className="w-4 h-4 mr-1" />
                                                        Lihat Keluarga
                                                    </Link>
                                                </Button>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                >
                                                    <Link href={route('anggota-keluarga.edit', anggotaKeluarga.id)}>
                                                        <Edit className="w-4 h-4 mr-1" />
                                                        Edit Data
                                                    </Link>
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Additional Information */}
                <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-lg bg-gradient-to-r from-cyan-50/50 to-teal-50/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full"></div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Informasi Tambahan</h3>
                                        <p className="text-slate-600 text-sm">Data lengkap anggota keluarga</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-white/80 text-slate-700">
                                    ID: {anggotaKeluarga.id}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </AuthenticatedLayout>
    );
};

export default Show;
