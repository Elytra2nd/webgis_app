import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

interface Keluarga {
  id: number;
  no_kk: string;
  nama_kepala_keluarga: string;
  alamat: string;
  status_ekonomi: string;
  latitude?: number;
  longitude?: number;
}

interface IndexProps extends PageProps {
  keluarga: Keluarga[];
}

export default function Index({ auth, keluarga }: IndexProps) {
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
              <div className="flex justify-between mb-6">
                <h3 className="text-lg font-semibold">Daftar Keluarga</h3>
                <Link
                  href={route('keluarga.create')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Tambah Keluarga
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        No. KK
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Nama Kepala Keluarga
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Alamat
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status Ekonomi
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Lokasi
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {keluarga.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-4 border-b border-gray-200">
                          {item.no_kk}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          {item.nama_kepala_keluarga}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          {item.alamat}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.status_ekonomi === 'sangat_miskin'
                              ? 'bg-red-100 text-red-800'
                              : item.status_ekonomi === 'miskin'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.status_ekonomi.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          {item.latitude && item.longitude
                            ? `${item.latitude.toFixed(6)}, ${item.longitude.toFixed(6)}`
                            : 'Belum diatur'}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          <div className="flex space-x-2">
                            <Link
                              href={route('keluarga.show', item.id)}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                              Detail
                            </Link>
                            <Link
                              href={route('keluarga.edit', item.id)}
                              className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                            >
                              Edit
                            </Link>
                            <Link
                              href={route('keluarga.destroy', item.id)}
                              method="delete"
                              as="button"
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Hapus
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {keluarga.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                          Belum ada data keluarga
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
