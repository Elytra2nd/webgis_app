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
    keluarga: string; // biasanya no_kk
    status_dalam_keluarga: string;
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

            <div className="py-8 min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="backdrop-blur-sm bg-white/80 border border-cyan-100 shadow-xl rounded-2xl overflow-hidden">
                        <div className="p-8">
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                <div>
                                    <h3 className="text-2xl font-light text-slate-800 mb-2">Data Anggota Keluarga</h3>
                                    <p className="text-slate-500 text-sm">Kelola informasi anggota keluarga dengan mudah</p>
                                </div>
                                <Link
                                    href={route('anggota-keluarga.create')}
                                    className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ease-out"
                                >
                                    <span className="relative z-10">+ Tambah Anggota</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Link>
                            </div>

                            {/* Table Section */}
                            <div className="overflow-hidden rounded-xl border border-cyan-100 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-cyan-100">
                                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700 tracking-wider">NIK</th>
                                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700 tracking-wider">Nama</th>
                                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700 tracking-wider">No KK</th>
                                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700 tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700 tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white/50 backdrop-blur-sm">
                                            {anggotaKeluarga.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-12">
                                                        <div className="flex flex-col items-center justify-center space-y-3">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center">
                                                                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                </svg>
                                                            </div>
                                                            <p className="text-slate-400 font-light">Belum ada data anggota keluarga</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                anggotaKeluarga.data.map((anggota, index) => (
                                                    <tr key={anggota.id} className={`border-b border-cyan-50 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-teal-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/30' : 'bg-white/10'}`}>
                                                        <td className="px-6 py-4 text-slate-700 font-mono text-sm">{anggota.nik}</td>
                                                        <td className="px-6 py-4 text-slate-800 font-medium">{anggota.nama}</td>
                                                        <td className="px-6 py-4 text-slate-600 font-mono text-sm">{anggota.keluarga}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 border border-cyan-200">
                                                                {anggota.status_dalam_keluarga}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-3">
                                                                <Link
                                                                    href={route('anggota-keluarga.edit', anggota.id)}
                                                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition-all duration-200"
                                                                >
                                                                    Edit
                                                                </Link>
                                                                <Link
                                                                    href={route('anggota-keluarga.show', anggota.id)}
                                                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-all duration-200"
                                                                >
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
                            <div className="mt-8 flex justify-center">
                                <nav className="flex items-center space-x-1">
                                    {anggotaKeluarga.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url ?? '#'}
                                            className={`
                                                relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                                                ${link.active
                                                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg transform scale-105'
                                                    : 'text-slate-600 hover:text-slate-800 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 border border-cyan-200 bg-white/80 backdrop-blur-sm'
                                                }
                                                ${!link.url ? 'pointer-events-none opacity-40' : 'hover:shadow-md hover:-translate-y-0.5'}
                                            `}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;
