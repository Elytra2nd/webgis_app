import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

interface Keluarga {
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
  kode_pos?: string;
  status_ekonomi: string;
  penghasilan_bulanan?: string;
  keterangan?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

interface IndexProps extends PageProps {
  keluarga: Keluarga[];
}

export default function Index({ auth, keluarga }: IndexProps) {
  const formatStatusEkonomi = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'sangat_miskin': 'Sangat Miskin',
      'miskin': 'Miskin',
      'menengah': 'Menengah',
      'kaya': 'Kaya'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sangat_miskin':
        return 'bg-red-100 text-red-800';
      case 'miskin':
        return 'bg-orange-100 text-orange-800';
      case 'menengah':
        return 'bg-yellow-100 text-yellow-800';
      case 'kaya':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCoordinates = (lat?: number, lng?: number) => {
    if (lat && lng) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
    return 'Belum diatur';
  };

  const openGoogleMaps = (lat?: number, lng?: number) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Data Keluarga</h2>}
    >
      <Head title="Data Keluarga" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Daftar Keluarga</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Total: {keluarga.length} keluarga terdaftar
                  </p>
                </div>
                <Link
                  href={route('keluarga.create')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Keluarga
                </Link>
              </div>

              <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide sm:pl-6">
                        No. KK
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Kepala Keluarga
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Alamat
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status Ekonomi
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Koordinat
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {keluarga.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {item.no_kk}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{item.nama_kepala_keluarga}</div>
                            {item.rt && item.rw && (
                              <div className="text-gray-500 text-xs">RT {item.rt} / RW {item.rw}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          <div className="max-w-xs">
                            <div className="truncate">{item.alamat}</div>
                            {item.kelurahan && (
                              <div className="text-xs text-gray-500 truncate">
                                {item.kelurahan}, {item.kecamatan}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status_ekonomi)}`}>
                            {formatStatusEkonomi(item.status_ekonomi)}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono">
                              {formatCoordinates(item.latitude, item.longitude)}
                            </span>
                            {item.latitude && item.longitude && (
                              <button
                                onClick={() => openGoogleMaps(item.latitude, item.longitude)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Lihat di Google Maps"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end space-x-2">
                            <Link
                              href={route('keluarga.show', item.id)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Detail
                            </Link>
                            <Link
                              href={route('keluarga.edit', item.id)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                              Edit
                            </Link>
                            <Link
                              href={route('keluarga.destroy', item.id)}
                              method="delete"
                              as="button"
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              onBefore={() => confirm('Apakah Anda yakin ingin menghapus data keluarga ini?')}
                            >
                              Hapus
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {keluarga.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-14 text-center">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">Belum ada data keluarga</p>
                            <p className="text-gray-400 text-sm">Klik tombol "Tambah Keluarga" untuk menambahkan data baru</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}