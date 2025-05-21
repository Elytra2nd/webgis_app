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
  const { data, setData, post, processing, errors } = useForm<KeluargaFormData>({
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

  // setData from useForm already handles the correct types for form fields

  const [keluargaId, setKeluargaId] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('keluarga.store'), {
      onSuccess: (page) => {
        // Ambil ID keluarga yang baru dibuat dari response jika ada
        // @ts-expect-error: keluarga mungkin tidak ada di PageProps
        const id = page.props.keluarga?.id;
        if (id) {
          setKeluargaId(id);
        }
      }
    });
  };

  const handleMapPointSaved = (point: any) => {
    if (point && point.lat && point.lng) {
      setData({
        ...data,
        latitude: point.lat.toString(),
        longitude: point.lng.toString()
      });
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tambah Data Keluarga</h2>}
    >
      <Head title="Tambah Data Keluarga" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
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
                    />
                  </div>

                  <div>
                    <InputLabel htmlFor="nama_kepala_keluarga" value="Nama Kepala Keluarga" />
                    <TextInput
                      id="nama_kepala_keluarga"
                      className="mt-1 block w-full"
                      value={data.nama_kepala_keluarga}
                      onChange={(e) => setData('nama_kepala_keluarga', e.target.value)}
                      required
                    />
                  </div>

                  {/* Tambahkan field lainnya */}

                  <div>
                    <InputLabel htmlFor="status_ekonomi" value="Status Ekonomi" />
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      value={data.status_ekonomi}
                      onChange={(e) => setData('status_ekonomi', e.target.value)}
                      required
                    >
                      <option value="miskin">Miskin</option>
                      <option value="menengah">Menengah</option>
                      <option value="kaya">Kaya</option>
                    </select>
                    <InputError message={errors.status_ekonomi} className="mt-2" />
                  </div>
                </div>

                <div className="mt-6">
                  <InputLabel value="Lokasi pada Peta" />
                  <p className="text-sm text-gray-600 mb-2">
                    Gunakan marker untuk menandai rumah, polygon untuk wilayah, dan garis untuk menghitung jarak.
                  </p>
                  <div className="border rounded">
                    {keluargaId ? (
                      <MapDrawing keluargaId={keluargaId} onSave={handleMapPointSaved} />
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Simpan data keluarga terlebih dahulu untuk menggunakan fitur peta.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end mt-6">
                  <PrimaryButton className="ml-4" disabled={processing}>
                    Simpan
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
