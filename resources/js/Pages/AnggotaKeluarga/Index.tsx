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
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Daftar Anggota Keluarga
                </h2>
            }
        >
            <Head title="Daftar Anggota Keluarga" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Data Anggota Keluarga</h3>
                                <Link
                                    href={route('anggota-keluarga.create')}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-200 active:bg-blue-600 disabled:opacity-25 transition"
                                >
                                    Tambah Anggota
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No KK</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {anggotaKeluarga.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center py-4 text-gray-400">
                                                    Tidak ada data anggota keluarga.
                                                </td>
                                            </tr>
                                        ) : (
                                            anggotaKeluarga.data.map((anggota) => (
                                                <tr key={anggota.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">{anggota.nik}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{anggota.nama}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{anggota.keluarga}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{anggota.status_dalam_keluarga}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Link
                                                            href={route('anggota-keluarga.edit', anggota.id)}
                                                            className="text-blue-600 hover:underline mr-2"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            href={route('anggota-keluarga.show', anggota.id)}
                                                            className="text-green-600 hover:underline"
                                                        >
                                                            Detail
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-4 flex justify-center">
                                {anggotaKeluarga.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        className={`px-3 py-1 mx-1 rounded ${link.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;
