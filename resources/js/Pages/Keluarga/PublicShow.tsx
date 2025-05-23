// resources/js/Pages/Keluarga/PublicShow.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import MapView from '@/Components/Map/MapView';

interface AnggotaKeluarga {
  id: number;
  nama: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  status_dalam_keluarga: string;
  pendidikan_terakhir: string;
  pekerjaan: string;
}

interface Keluarga {
  id: number;
  no_kk: string;
  nama_kepala_keluarga: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  status_ekonomi: string;
  latitude?: number;
  longitude?: number;
  anggota_keluarga: AnggotaKeluarga[];
}

interface PublicShowProps {
  keluarga: Keluarga;
}

export default function PublicShow({ keluarga }: PublicShowProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'sangat_miskin':
        return 'bg-red-100 text-red-800';
      case 'miskin':
        return 'bg-yellow-100 text-yellow-800';
      case 'rentan_miskin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatusKeluarga = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getGenderLabel = (gender: string) => {
    return gender === 'L' ? 'Laki-laki' : 'Perempuan';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <GuestLayout>
      <Head title={`Detail Keluarga - ${keluarga.nama_kepala_keluarga}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <Link
              href={route('keluarga.public')}
              className="inline-flex items-center px-4 py-2 bg-gray-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-600"
            >
              ← Kembali ke Daftar
            </Link>
            <Link
              href={route('login')}
              className="inline-flex items-center px-4 py-2 bg-blue-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-600"
            >
              Login untuk Mengelola Data
            </Link>
          </div>

          {/* Data Keluarga */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Informasi Keluarga</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(keluarga.status_ekonomi)}`}>
                  {formatStatusKeluarga(keluarga.status_ekonomi)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">No. Kartu Keluarga</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{keluarga.no_kk}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nama Kepala Keluarga</label>
                    <p className="mt-1 text-sm text-gray-900 font-semibold">{keluarga.nama_kepala_keluarga}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Alamat</label>
                    <p className="mt-1 text-sm text-gray-900">{keluarga.alamat}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">RT/RW</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {keluarga.rt || '-'} / {keluarga.rw || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Kelurahan</label>
                    <p className="mt-1 text-sm text-gray-900">{keluarga.kelurahan || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Kecamatan</label>
                    <p className="mt-1 text-sm text-gray-900">{keluarga.kecamatan || '-'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Kota</label>
                    <p className="mt-1 text-sm text-gray-900">{keluarga.kota || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Provinsi</label>
                    <p className="mt-1 text-sm text-gray-900">{keluarga.provinsi || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Koordinat</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {keluarga.latitude && keluarga.longitude
                        ? `${keluarga.latitude.toFixed(6)}, ${keluarga.longitude.toFixed(6)}`
                        : 'Belum diatur'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Peta Lokasi */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
            <div className="p-6 bg-white border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lokasi pada Peta</h3>
              {keluarga.latitude && keluarga.longitude ? (
                <MapView
                  keluargaId={keluarga.id}
                  point={{ lat: keluarga.latitude, lng: keluarga.longitude }}
                  readOnly={true}
                />
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Lokasi belum diatur untuk keluarga ini</p>
                </div>
              )}
            </div>
          </div>

          {/* Anggota Keluarga */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Anggota Keluarga</h3>
                <span className="text-sm text-gray-500">
                  Total: {keluarga.anggota_keluarga.length} orang
                </span>
              </div>

              {keluarga.anggota_keluarga.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jenis Kelamin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tempat, Tanggal Lahir
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status dalam Keluarga
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pendidikan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pekerjaan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {keluarga.anggota_keluarga.map((anggota) => (
                        <tr key={anggota.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {anggota.nama}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getGenderLabel(anggota.jenis_kelamin)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {anggota.tempat_lahir}, {formatDate(anggota.tanggal_lahir)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatStatusKeluarga(anggota.status_dalam_keluarga)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {anggota.pendidikan_terakhir || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {anggota.pekerjaan || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Belum ada data anggota keluarga</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
