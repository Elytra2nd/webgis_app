// resources/js/Pages/Keluarga/Show.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DetailLayout from '@/Layouts/DetailLayout';
import MapView from '@/Components/Map/MapView';
import { PageProps } from '@/types';

interface AnggotaKeluarga {
  id: number;
  nik: string;
  nama: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  status_dalam_keluarga: string;
  status_perkawinan: string;
  pendidikan_terakhir: string;
  pekerjaan: string;
}

interface Wilayah {
  id: number;
  nama: string;
  keterangan: string;
}

interface Jarak {
  id: number;
  nama: string;
  panjang: number;
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
  kode_pos: string;
  status_ekonomi: string;
  penghasilan_bulanan: number;
  keterangan: string;
  latitude?: number;
  longitude?: number;
  anggota_keluarga: AnggotaKeluarga[];
  wilayah: Wilayah[];
  jarak: Jarak[];
}

interface ShowProps extends PageProps {
  keluarga: Keluarga;
}

export default function Show({ auth, keluarga }: ShowProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'sangat_miskin':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'miskin':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'rentan_miskin':
        return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getGenderLabel = (gender: string) => {
    return gender === 'L' ? 'Laki-laki' : 'Perempuan';
  };

  const formatStatusKeluarga = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatStatusPerkawinan = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <DetailLayout
      user={auth.user}
      header={
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full"></div>
          <h2 className="font-light text-2xl text-gray-900">Detail Keluarga</h2>
        </div>
      }
    >
      <Head title={`Detail Keluarga - ${keluarga.nama_kepala_keluarga}`} />

      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header Actions */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Link
              href={route('keluarga.index')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href={route('keluarga.edit', keluarga.id)}
                className="inline-flex items-center px-6 py-2.5 bg-white border border-cyan-200 text-cyan-700 text-sm font-medium rounded-lg hover:bg-cyan-50 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>

              <Link
                href={route('keluarga.destroy', keluarga.id)}
                method="delete"
                as="button"
                className="inline-flex items-center px-6 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-all duration-200"
                onClick={(e) => {
                  if (!confirm('Apakah Anda yakin ingin menghapus data keluarga ini?')) {
                    e.preventDefault();
                  }
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">

            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-gray-100/50 overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div>
                    <h1 className="text-2xl font-light text-gray-900 mb-2">{keluarga.nama_kepala_keluarga}</h1>
                    <p className="text-gray-500 font-mono text-sm">{keluarga.no_kk}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeColor(keluarga.status_ekonomi)}`}>
                    {formatStatusKeluarga(keluarga.status_ekonomi)}
                  </span>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Basic Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100/50 p-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Informasi Dasar</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Alamat</label>
                        <p className="text-gray-900">{keluarga.alamat}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">RT</label>
                          <p className="text-gray-900">{keluarga.rt || '—'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">RW</label>
                          <p className="text-gray-900">{keluarga.rw || '—'}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Kelurahan</label>
                        <p className="text-gray-900">{keluarga.kelurahan || '—'}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Kecamatan</label>
                        <p className="text-gray-900">{keluarga.kecamatan || '—'}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Kota</label>
                        <p className="text-gray-900">{keluarga.kota || '—'}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Provinsi</label>
                        <p className="text-gray-900">{keluarga.provinsi || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial & Location Info */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100/50 p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Finansial</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Penghasilan Bulanan</label>
                      <p className="text-lg font-medium text-cyan-600">
                        {keluarga.penghasilan_bulanan ? formatCurrency(keluarga.penghasilan_bulanan) : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100/50 p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Lokasi</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Koordinat</label>
                      <p className="text-sm font-mono text-gray-600">
                        {keluarga.latitude && keluarga.longitude
                          ? `${keluarga.latitude.toFixed(6)}, ${keluarga.longitude.toFixed(6)}`
                          : 'Belum diatur'
                        }
                      </p>
                    </div>

                    {keluarga.kode_pos && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Kode Pos</label>
                        <p className="text-gray-900">{keluarga.kode_pos}</p>
                      </div>
                    )}
                  </div>
                </div>

                {keluarga.keterangan && (
                  <div className="bg-white rounded-2xl border border-gray-100/50 p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Keterangan</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{keluarga.keterangan}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-2xl border border-gray-100/50 overflow-hidden">
              <div className="p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Lokasi</h3>
                {keluarga.latitude && keluarga.longitude ? (
                  <div className="rounded-xl overflow-hidden border border-gray-100">
                    <MapView
                      keluargaId={keluarga.id}
                      point={{ lat: keluarga.latitude, lng: keluarga.longitude }}
                      readOnly={true}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-4">Lokasi belum diatur</p>
                    <Link
                      href={route('keluarga.edit', keluarga.id)}
                      className="inline-flex items-center px-4 py-2 bg-cyan-50 text-cyan-600 text-sm font-medium rounded-lg hover:bg-cyan-100 transition-colors duration-200"
                    >
                      Atur Lokasi
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Family Members */}
            <div className="bg-white rounded-2xl border border-gray-100/50 overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Anggota Keluarga</h3>
                  <span className="px-3 py-1 bg-cyan-50 text-cyan-600 text-sm font-medium rounded-full">
                    {keluarga.anggota_keluarga.length} orang
                  </span>
                </div>

                {keluarga.anggota_keluarga.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Kelamin</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">TTL</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Pendidikan</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Pekerjaan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {keluarga.anggota_keluarga.map((anggota) => (
                          <tr key={anggota.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                            <td className="py-4 px-4 text-sm font-mono text-gray-600">{anggota.nik}</td>
                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{anggota.nama}</td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                anggota.jenis_kelamin === 'L'
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'bg-pink-50 text-pink-600'
                              }`}>
                                {getGenderLabel(anggota.jenis_kelamin)}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              {anggota.tempat_lahir}, {formatDate(anggota.tanggal_lahir)}
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-50 text-gray-600 rounded-full">
                                {formatStatusKeluarga(anggota.status_dalam_keluarga)}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">{anggota.pendidikan_terakhir || '—'}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{anggota.pekerjaan || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-2">Belum ada data anggota keluarga</p>
                    <p className="text-sm text-gray-400">Tambahkan melalui halaman edit</p>
                  </div>
                )}
              </div>
            </div>

            {/* Geospatial Data */}
            {(keluarga.wilayah.length > 0 || keluarga.jarak.length > 0) && (
              <div className="bg-white rounded-2xl border border-gray-100/50 overflow-hidden">
                <div className="p-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Data Geospasial</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Wilayah */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                        Wilayah
                      </h4>
                      {keluarga.wilayah.length > 0 ? (
                        <div className="space-y-3">
                          {keluarga.wilayah.map((wilayah) => (
                            <div key={wilayah.id} className="bg-cyan-50/50 border border-cyan-100 rounded-lg p-4">
                              <p className="font-medium text-cyan-900 text-sm">{wilayah.nama}</p>
                              {wilayah.keterangan && (
                                <p className="text-xs text-cyan-700 mt-1">{wilayah.keterangan}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">Tidak ada data</p>
                      )}
                    </div>

                    {/* Jarak */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                        <div className="w-3 h-3 bg-teal-400 rounded-full mr-3"></div>
                        Jarak
                      </h4>
                      {keluarga.jarak.length > 0 ? (
                        <div className="space-y-3">
                          {keluarga.jarak.map((jarak) => (
                            <div key={jarak.id} className="bg-teal-50/50 border border-teal-100 rounded-lg p-4">
                              <p className="font-medium text-teal-900 text-sm">{jarak.nama}</p>
                              <p className="text-xs text-teal-700 mt-1">
                                {(jarak.panjang / 1000).toFixed(2)} km
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">Tidak ada data</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DetailLayout>
  );
}
