// resources/js/Pages/AnggotaKeluarga/Edit.tsx
import React from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

interface Keluarga {
    id: number;
    no_kk: string;
    nama_kepala_keluarga: string;
}

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
    keluarga_id: number;
    keluarga?: {
        id: number;
        no_kk: string;
        nama_kepala_keluarga: string;
    };
}

interface EditProps extends PageProps {
    keluarga: Keluarga[];
    anggotaKeluarga: AnggotaKeluarga;
}

// PERBAIKAN: Ubah interface menjadi type dengan index signature
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
} & Record<string, any>; // Index signature untuk kompatibilitas

export default function Edit({ auth, keluarga = [], anggotaKeluarga }: EditProps) {
    // Debug: Log data yang diterima
    console.log('Data yang diterima:', { anggotaKeluarga, keluarga });

    // Pastikan data anggotaKeluarga ada sebelum digunakan
    if (!anggotaKeluarga || !anggotaKeluarga.id) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <div className="flex items-center space-x-3">
                        <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full animate-pulse"></div>
                        <h2 className="font-light text-2xl text-gray-900">Edit Anggota Keluarga</h2>
                    </div>
                }
            >
                <Head title="Data Tidak Ditemukan" />
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                        <div className="mb-4">
                            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Tidak Ditemukan</h2>
                        <p className="text-gray-600 mb-6">Anggota keluarga yang Anda cari tidak ditemukan atau telah dihapus.</p>
                        <Link
                            href={route('anggota-keluarga.index')}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kembali ke Daftar Anggota Keluarga
                        </Link>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // PERBAIKAN: Gunakan type yang sudah diperbaiki
    const { data, setData, put, processing, errors } = useForm<AnggotaKeluargaFormData>({
        keluarga_id: anggotaKeluarga.keluarga_id?.toString() || '',
        nik: anggotaKeluarga.nik || '',
        nama: anggotaKeluarga.nama || '',
        jenis_kelamin: anggotaKeluarga.jenis_kelamin || '',
        tempat_lahir: anggotaKeluarga.tempat_lahir || '',
        tanggal_lahir: anggotaKeluarga.tanggal_lahir || '',
        status_dalam_keluarga: anggotaKeluarga.status_dalam_keluarga || '',
        status_perkawinan: anggotaKeluarga.status_perkawinan || '',
        pendidikan_terakhir: anggotaKeluarga.pendidikan_terakhir || '',
        pekerjaan: anggotaKeluarga.pekerjaan || ''
    });

    // PERBAIKAN: Gunakan router.post dengan _method untuk mengatasi masalah PUT
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Gunakan router.post dengan _method untuk kompatibilitas yang lebih baik
        const formData: Record<string, any> = {
            ...data,
            _method: 'PUT'
        };

        // Menggunakan router.post dengan method spoofing
        router.post(route('anggota-keluarga.update', anggotaKeluarga.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Data berhasil diperbarui');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            }
        });
    };

    return (
        <>
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
                .floating-animation {
                    animation: float 6s ease-in-out infinite;
                }
                .ripple-effect {
                    position: relative;
                    overflow: hidden;
                }
                .ripple-effect:before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(14, 116, 144, 0.1), transparent);
                    transition: left 0.5s;
                }
                .ripple-effect:hover:before {
                    left: 100%;
                }
                .ocean-focus {
                    transition: all 0.3s ease;
                }
                .ocean-focus:focus {
                    border-color: #0891b2;
                    box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1), 0 4px 12px rgba(8, 145, 178, 0.15);
                    transform: translateY(-2px);
                }
                .ocean-button {
                    background: linear-gradient(135deg, #0891b2, #0e7490);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .ocean-button:hover {
                    background: linear-gradient(135deg, #0e7490, #155e75);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(8, 145, 178, 0.3);
                }
                .ocean-button:before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s;
                }
                .ocean-button:hover:before {
                    left: 100%;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .sea-foam {
                    background: linear-gradient(135deg, #06b6d4, #0891b2);
                }
            `}</style>

            <AuthenticatedLayout
                user={auth.user}
                header={
                    <div className="flex items-center space-x-3">
                        <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full animate-pulse"></div>
                        <h2 className="font-light text-2xl text-gray-900">Edit Anggota Keluarga</h2>
                    </div>
                }
            >
                <Head title={`Edit Anggota Keluarga - ${anggotaKeluarga.nama}`} />

                <div className="min-h-screen aquatic-gradient wave-pattern py-12">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="glass-effect rounded-3xl shadow-2xl overflow-hidden floating-animation">
                            <div className="p-8">
                                {/* Header Section */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-2xl sea-foam flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-800">Edit Data Anggota Keluarga</h3>
                                                <p className="text-slate-600">Perbarui informasi anggota keluarga dengan akurat</p>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    NIK: {anggotaKeluarga.nik} • {anggotaKeluarga.nama}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        href={route('anggota-keluarga.index')}
                                        className="inline-flex items-center px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-medium text-slate-700 transition-all duration-300 hover:shadow-lg ripple-effect"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Kembali
                                    </Link>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Family Selection */}
                                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-2xl border border-cyan-100">
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                                            <span className="flex items-center">
                                                <svg className="w-5 h-5 mr-2 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                                </svg>
                                                Pilih Keluarga
                                                <span className="text-red-500 ml-1">*</span>
                                            </span>
                                        </label>
                                        <select
                                            value={data.keluarga_id}
                                            onChange={(e) => setData('keluarga_id', e.target.value)}
                                            className="w-full border-0 bg-white rounded-xl px-4 py-3 ocean-focus shadow-sm text-slate-700"
                                            required
                                        >
                                            <option value="">Pilih Keluarga</option>
                                            {keluarga.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.no_kk} - {item.nama_kepala_keluarga}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.keluarga_id && (
                                            <div className="text-red-500 text-sm mt-2 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.keluarga_id}
                                            </div>
                                        )}
                                    </div>

                                    {/* Personal Information Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* NIK */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-semibold text-slate-700">
                                                <span className="flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                                    </svg>
                                                    NIK <span className="text-red-500">*</span>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nik}
                                                onChange={(e) => setData('nik', e.target.value)}
                                                className="w-full border-0 bg-white rounded-xl px-4 py-3 ocean-focus shadow-sm"
                                                maxLength={16}
                                                placeholder="16 digit NIK"
                                                required
                                            />
                                            {errors.nik && (
                                                <div className="text-red-500 text-sm flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.nik}
                                                </div>
                                            )}
                                        </div>

                                        {/* Nama */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-semibold text-slate-700">
                                                <span className="flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Nama Lengkap <span className="text-red-500">*</span>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nama}
                                                onChange={(e) => setData('nama', e.target.value)}
                                                className="w-full border-0 bg-white rounded-xl px-4 py-3 ocean-focus shadow-sm"
                                                placeholder="Nama lengkap sesuai KTP"
                                                required
                                            />
                                            {errors.nama && (
                                                <div className="text-red-500 text-sm flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.nama}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Gender and Birth Place */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="block text-sm font-semibold text-slate-700">
                                                <span className="flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5 14.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                    </svg>
                                                    Jenis Kelamin <span className="text-red-500">*</span>
                                                </span>
                                            </label>
                                            <select
                                                value={data.jenis_kelamin}
                                                onChange={(e) => setData('jenis_kelamin', e.target.value)}
                                                className="w-full border-0 bg-white rounded-xl px-4 py-3 ocean-focus shadow-sm"
                                                required
                                            >
                                                <option value="">Pilih Jenis Kelamin</option>
                                                <option value="L">Laki-laki</option>
                                                <option value="P">Perempuan</option>
                                            </select>
                                            {errors.jenis_kelamin && (
                                                <div className="text-red-500 text-sm flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.jenis_kelamin}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-sm font-semibold text-slate-700">
                                                <span className="flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Tempat Lahir <span className="text-red-500">*</span>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.tempat_lahir}
                                                onChange={(e) => setData('tempat_lahir', e.target.value)}
                                                className="w-full border-0 bg-white rounded-xl px-4 py-3 ocean-focus shadow-sm"
                                                placeholder="Kota/Kabupaten kelahiran"
                                                required
                                            />
                                            {errors.tempat_lahir && (
                                                <div className="text-red-500 text-sm flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.tempat_lahir}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Birth Date and Family Status */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="block text-sm font-semibold text-slate-700">
                                                <span className="flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 012 0v4m0 0V7a1 1 0 011 1v1m0 0h3m-3 0a1 1 0 01-1-1v-1m0 0H8m3 0a1 1 0 011 1v1h1M6 4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H6z" />
                                                    </svg>
                                                    Tanggal Lahir <span className="text-red-500">*</span>
                                                </span>
                                            </label>
                                            <input
                                                type="date"
                                                value={data.tanggal_lahir}
                                                onChange={(e) => setData('tanggal_lahir', e.target.value)}
                                                className="w-full border-0 bg-white rounded-xl px-4 py-3 ocean-focus shadow-sm"
                                                required
                                            />
                                            {errors.tanggal_lahir && (
                                                <div className="text-red-500 text-sm flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.tanggal_lahir}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-sm font-semibold text-slate-700">
                                                <span className="flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    Status dalam Keluarga <span className="text-red-500">*</span>
                                                </span>
                                            </label>
                                            <select
                                                value={data.status_dalam_keluarga}
                                                onChange={(e) => setData('status_dalam_keluarga', e.target.value)}
                                                className="w-full border-0 bg-white rounded-xl px-4 py-3 ocean-focus shadow-sm"
                                                required
                                            >
                                                <option value="">Pilih Status</option>
                                                <option value="kepala keluarga">Kepala Keluarga</option>
                                                <option value="istri">Istri</option>
                                                <option value="anak">Anak</option>
                                                <option value="lainnya">Lainnya</option>
                                            </select>
                                            {errors.status_dalam_keluarga && (
                                                <div className="text-red-500 text-sm flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.status_dalam_keluarga}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Marriage Status and Education */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="block text-sm font-semibold text-slate-700">
                                                <span className="flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    Status Perkawinan <span className="text-red-500">*</span>
                                                </span>
                                            </label>
                                            <select
                                                value={data.status_perkawinan}
                                                onChange={(e) => setData('status_perkawinan', e.target.value)}
                                                className="w-full border-0 bg-white rounded-xl px-4 py-3 ocean-focus shadow-sm"
                                                required
                                            >
                                                <option value="">Pilih Status Perkawinan</option>
                                                <option value="belum kawin">Belum Kawin</option>
                                                <option value="kawin">Kawin</option>
                                                <option value="cerai hidup">Cerai Hidup</option>
                                                <option value="cerai mati">Cerai Mati</option>
                                            </select>
                                            {errors.status_perkawinan && (
                                                <div className="text-red-500 text-sm flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.status_perkawinan}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-sm font-semibold text-slate-700">
                                                <span className="flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                    Pendidikan Terakhir <span className="text-red-500">*</span>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.pendidikan_terakhir}
                                                onChange={(e) => setData('pendidikan_terakhir', e.target.value)}
                                                className="w-full border-0 bg-white rounded-xl px-4 py-3 ocean-focus shadow-sm"
                                                placeholder="SD, SMP, SMA, D3, S1, S2, S3"
                                                required
                                            />
                                            {errors.pendidikan_terakhir && (
                                                <div className="text-red-500 text-sm flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.pendidikan_terakhir}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pekerjaan */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-slate-700">
                                            <span className="flex items-center">
                                                <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
                                                </svg>
                                                Pekerjaan <span className="text-red-500">*</span>
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.pekerjaan}
                                            onChange={(e) => setData('pekerjaan', e.target.value)}
                                            className="w-full border-0 bg-white rounded-xl px-4 py-3 ocean-focus shadow-sm"
                                            placeholder="Jenis pekerjaan atau profesi"
                                            required
                                        />
                                        {errors.pekerjaan && (
                                            <div className="text-red-500 text-sm flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.pekerjaan}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-slate-200">
                                        <Link
                                            href={route('anggota-keluarga.index')}
                                            className="inline-flex items-center justify-center px-8 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-semibold text-slate-700 transition-all duration-300 hover:shadow-lg ripple-effect"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Batal
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="ocean-button inline-flex items-center justify-center px-8 py-3 rounded-2xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Memperbarui Data...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Perbarui Data
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
