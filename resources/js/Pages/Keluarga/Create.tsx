import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MapDrawing from '@/Components/Map/MapDrawing';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { PageProps } from '@/types';

// Definisikan interface untuk form data
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

interface KeluargaResponse {
  id: number;
  // tambahkan properti lain jika diperlukan
}

interface PageWithKeluarga {
  props: {
    keluarga?: KeluargaResponse;
    // tambahkan properti lain jika diperlukan
  };
}

export default function Create({ auth }: PageProps) {
  const { data, setData, post, put, processing, errors, reset } = useForm<KeluargaFormData>({
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

  const [keluargaId, setKeluargaId] = useState<number | null>(null);
  const [isFormSaved, setIsFormSaved] = useState<boolean>(false);
  const [showMapSection, setShowMapSection] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('keluarga.store'), {
      onSuccess: (page) => {
        // Ambil ID keluarga yang baru dibuat dari response
        // @ts-expect-error: keluarga mungkin tidak ada di PageProps
        const id = page.props.keluarga?.id;
        if (id) {
          setKeluargaId(id);
          setIsFormSaved(true);
          setShowMapSection(true);

          // Scroll ke section peta
          setTimeout(() => {
            const mapSection = document.getElementById('map-section');
            if (mapSection) {
              mapSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }
      },
      onError: (errors) => {
        console.error('Error saving keluarga:', errors);
      }
    });
  };

  const handleMapPointSaved = (point: any) => {
    if (point && point.lat && point.lng) {
      // Update koordinat di form data
      const updatedData = {
        ...data,
        latitude: point.lat.toString(),
        longitude: point.lng.toString()
      };

      setData(updatedData);

      // Update data keluarga dengan koordinat baru
      if (keluargaId) {
        put(route('keluarga.update', keluargaId), {
          data: updatedData,
          onSuccess: () => {
            alert('Koordinat berhasil disimpan!');
          },
          onError: (errors) => {
            console.error('Error updating coordinates:', errors);
          }
        });
      }
    }
  };

  const handleStartOver = () => {
    // Reset form untuk data keluarga baru
    reset();
    setKeluargaId(null);
    setIsFormSaved(false);
    setShowMapSection(false);

    // Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = () => {
    // Redirect ke halaman daftar keluarga
    window.location.href = route('keluarga.index');
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tambah Data Keluarga</h2>}
    >
      <Head title="Tambah Data Keluarga" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

          {/* Form Data Keluarga */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {isFormSaved ? 'Data Keluarga (Tersimpan)' : 'Data Keluarga'}
                </h3>
                {isFormSaved && (
                  <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Data Tersimpan
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <InputLabel htmlFor="no_kk" value="Nomor KK" />
                    <TextInput
                      id="no_kk"
                      className="mt-1 block w-full"
                      value={data.no_kk}
                      onChange={(e) => setData('no_kk', e.target.value)}
                      required
                      disabled={isFormSaved}
                    />
                    <InputError message={errors.no_kk} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="nama_kepala_keluarga" value="Nama Kepala Keluarga" />
                    <TextInput
                      id="nama_kepala_keluarga"
                      className="mt-1 block w-full"
                      value={data.nama_kepala_keluarga}
                      onChange={(e) => setData('nama_kepala_keluarga', e.target.value)}
                      required
                      disabled={isFormSaved}
                    />
                    <InputError message={errors.nama_kepala_keluarga} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="alamat" value="Alamat" />
                    <TextInput
                      id="alamat"
                      className="mt-1 block w-full"
                      value={data.alamat}
                      onChange={(e) => setData('alamat', e.target.value)}
                      required
                      disabled={isFormSaved}
                    />
                    <InputError message={errors.alamat} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="rt" value="RT" />
                    <TextInput
                      id="rt"
                      className="mt-1 block w-full"
                      value={data.rt}
                      onChange={(e) => setData('rt', e.target.value)}
                      required
                      disabled={isFormSaved}
                    />
                    <InputError message={errors.rt} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="rw" value="RW" />
                    <TextInput
                      id="rw"
                      className="mt-1 block w-full"
                      value={data.rw}
                      onChange={(e) => setData('rw', e.target.value)}
                      required
                      disabled={isFormSaved}
                    />
                    <InputError message={errors.rw} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="kelurahan" value="Kelurahan" />
                    <TextInput
                      id="kelurahan"
                      className="mt-1 block w-full"
                      value={data.kelurahan}
                      onChange={(e) => setData('kelurahan', e.target.value)}
                      required
                      disabled={isFormSaved}
                    />
                    <InputError message={errors.kelurahan} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="kecamatan" value="Kecamatan" />
                    <TextInput
                      id="kecamatan"
                      className="mt-1 block w-full"
                      value={data.kecamatan}
                      onChange={(e) => setData('kecamatan', e.target.value)}
                      required
                      disabled={isFormSaved}
                    />
                    <InputError message={errors.kecamatan} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="kota" value="Kota" />
                    <TextInput
                      id="kota"
                      className="mt-1 block w-full"
                      value={data.kota}
                      onChange={(e) => setData('kota', e.target.value)}
                      required
                      disabled={isFormSaved}
                    />
                    <InputError message={errors.kota} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="provinsi" value="Provinsi" />
                    <TextInput
                      id="provinsi"
                      className="mt-1 block w-full"
                      value={data.provinsi}
                      onChange={(e) => setData('provinsi', e.target.value)}
                      required
                      disabled={isFormSaved}
                    />
                    <InputError message={errors.provinsi} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="kode_pos" value="Kode Pos" />
                    <TextInput
                      id="kode_pos"
                      className="mt-1 block w-full"
                      value={data.kode_pos}
                      onChange={(e) => setData('kode_pos', e.target.value)}
                      disabled={isFormSaved}
                    />
                    <InputError message={errors.kode_pos} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="status_ekonomi" value="Status Ekonomi" />
                    <select
                      id="status_ekonomi"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      value={data.status_ekonomi}
                      onChange={(e) => setData('status_ekonomi', e.target.value)}
                      required
                      disabled={isFormSaved}
                    >
                      <option value="miskin">Miskin</option>
                      <option value="menengah">Menengah</option>
                      <option value="kaya">Kaya</option>
                    </select>
                    <InputError message={errors.status_ekonomi} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="penghasilan_bulanan" value="Penghasilan Bulanan" />
                    <TextInput
                      id="penghasilan_bulanan"
                      className="mt-1 block w-full"
                      value={data.penghasilan_bulanan}
                      onChange={(e) => setData('penghasilan_bulanan', e.target.value)}
                      disabled={isFormSaved}
                    />
                    <InputError message={errors.penghasilan_bulanan} className="mt-2" />
                  </div>
                </div>

                <div className="mt-6">
                  <InputLabel htmlFor="keterangan" value="Keterangan" />
                  <textarea
                    id="keterangan"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    rows={3}
                    value={data.keterangan}
                    onChange={(e) => setData('keterangan', e.target.value)}
                    disabled={isFormSaved}
                  />
                  <InputError message={errors.keterangan} className="mt-2" />
                </div>

                {!isFormSaved && (
                  <div className="flex items-center justify-end mt-6">
                    <PrimaryButton className="ml-4" disabled={processing}>
                      {processing ? 'Menyimpan...' : 'Simpan Data Keluarga'}
                    </PrimaryButton>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Section Peta - Muncul setelah data tersimpan */}
          {showMapSection && (
            <div id="map-section" className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Tentukan Lokasi pada Peta</h3>
                  <div className="flex items-center text-blue-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Langkah 2: Tentukan Koordinat
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Gunakan marker untuk menandai lokasi rumah, polygon untuk wilayah, dan garis untuk menghitung jarak.
                  Koordinat akan otomatis tersimpan setelah Anda menandai lokasi.
                </p>

                <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                  <MapDrawing keluargaId={keluargaId!} onSave={handleMapPointSaved} />
                </div>

                {/* Status Koordinat */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Status Koordinat:</p>
                      {data.latitude && data.longitude ? (
                        <p className="text-sm text-green-600">
                          ✓ Tersimpan - Lat: {data.latitude}, Lng: {data.longitude}
                        </p>
                      ) : (
                        <p className="text-sm text-orange-600">
                          ⚠ Belum ditentukan - Klik pada peta untuk menentukan lokasi
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-6">
                  <button
                    type="button"
                    onClick={handleStartOver}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Tambah Keluarga Lain
                  </button>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowMapSection(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Lewati Koordinat
                    </button>
                    <PrimaryButton onClick={handleFinish}>
                      Selesai & Lihat Daftar Keluarga
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {isFormSaved && (
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Data keluarga berhasil disimpan! {data.latitude && data.longitude ? 'Koordinat sudah ditentukan.' : 'Silakan tentukan koordinat lokasi pada peta di atas.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
