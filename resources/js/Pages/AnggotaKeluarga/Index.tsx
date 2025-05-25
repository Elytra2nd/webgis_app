import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

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
                .coral-accent {
                    background: linear-gradient(135deg, #f97316, #ea580c);
                }
                .sea-foam {
                    background: linear-gradient(135deg, #06b6d4, #0891b2);
                }
                .action-button {
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .action-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                .edit-button {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                }
                .edit-button:hover {
                    background: linear-gradient(135deg, #059669, #047857);
                    color: white;
                }
                .detail-button {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                }
                .detail-button:hover {
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: white;
                }
            `}</style>

            <AuthenticatedLayout
                user={auth.user}
                header={
                    <div className="flex items-center space-x-3">
                        <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full animate-pulse"></div>
                        <h2 className="font-light text-2xl text-gray-900">Daftar Anggota Keluarga</h2>
                    </div>
                }
            >
                <Head title="Daftar Anggota Keluarga" />

                <div className="min-h-screen aquatic-gradient wave-pattern py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="glass-effect rounded-3xl shadow-2xl overflow-hidden">
                            <div className="p-8">
                                {/* Header Section */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-2xl sea-foam flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-800">Data Anggota Keluarga</h3>
                                                <p className="text-slate-600">Kelola informasi anggota keluarga dengan mudah</p>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Total: {anggotaKeluarga.total} anggota keluarga
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href={route('anggota-keluarga.create')}
                                        className="ocean-button inline-flex items-center px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300 ripple-effect"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Tambah Anggota
                                    </Link>
                                </div>

                                {/* Table Section */}
                                <div className="overflow-hidden rounded-2xl border border-cyan-100 shadow-lg">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-cyan-100">
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 tracking-wider">NIK</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 tracking-wider">Nama Lengkap</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 tracking-wider">No KK</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 tracking-wider">Status Keluarga</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 tracking-wider">Jenis Kelamin</th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 tracking-wider">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white/50 backdrop-blur-sm">
                                                {anggotaKeluarga.data.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="text-center py-16">
                                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                                <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center">
                                                                    <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                    </svg>
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="text-slate-500 font-medium text-lg">Belum ada data anggota keluarga</p>
                                                                    <p className="text-slate-400 text-sm mt-1">Klik tombol "Tambah Anggota" untuk menambahkan data baru</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    anggotaKeluarga.data.map((anggota, index) => (
                                                        <tr key={anggota.id} className={`border-b border-cyan-50 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-teal-50/50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/30' : 'bg-white/10'}`}>
                                                            <td className="px-6 py-4 text-slate-700 font-mono text-sm">{anggota.nik}</td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-slate-800 font-semibold">{anggota.nama}</span>
                                                                    <span className="text-slate-500 text-xs">{anggota.tempat_lahir}, {anggota.tanggal_lahir}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-slate-700 font-mono text-sm">{anggota.keluarga.no_kk}</span>
                                                                    <span className="text-slate-500 text-xs">{anggota.keluarga.nama_kepala_keluarga}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 border border-cyan-200">
                                                                    {anggota.status_dalam_keluarga}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                    anggota.jenis_kelamin === 'L'
                                                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                                        : 'bg-pink-100 text-pink-800 border border-pink-200'
                                                                }`}>
                                                                    {anggota.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center justify-center space-x-2">
                                                                    <Link
                                                                        href={route('anggota-keluarga.edit', anggota.id)}
                                                                        className="action-button edit-button inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                        Edit
                                                                    </Link>
                                                                    <Link
                                                                        href={route('anggota-keluarga.show', anggota.id)}
                                                                        className="action-button detail-button inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                        Detail
                                                                    </Link>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Pagination */}
                                {anggotaKeluarga.data.length > 0 && (
                                    <div className="mt-8 flex justify-center">
                                        <nav className="flex items-center space-x-2">
                                            {anggotaKeluarga.links.map((link, i) => (
                                                <Link
                                                    key={i}
                                                    href={link.url ?? '#'}
                                                    className={`
                                                        relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300
                                                        ${link.active
                                                            ? 'ocean-button text-white shadow-lg transform scale-105'
                                                            : 'text-slate-600 hover:text-slate-800 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 border border-cyan-200 bg-white/80 backdrop-blur-sm'
                                                        }
                                                        ${!link.url ? 'pointer-events-none opacity-40' : 'hover:shadow-md hover:-translate-y-0.5'}
                                                    `}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                )}

                                {/* Summary Info */}
                                {anggotaKeluarga.data.length > 0 && (
                                    <div className="mt-6 text-center text-sm text-slate-500">
                                        Menampilkan {anggotaKeluarga.from} - {anggotaKeluarga.to} dari {anggotaKeluarga.total} anggota keluarga
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
};

export default Index;
