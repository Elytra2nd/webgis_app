import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MapDrawing from '@/Components/Map/MapDrawing';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { PageProps } from '@/types';

// Interface untuk form data
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

interface LocationData {
  lat: number;
  lng: number;
}

export default function Create({ auth }: PageProps) {
  const { data, setData, post, processing, errors, clearErrors } = useForm<KeluargaFormData>({
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
    status_ekonomi: 'miskin', // Default ke miskin
    penghasilan_bulanan: '',
    keterangan: ''
  });

  const [keluargaId, setKeluargaId] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi manual untuk koordinat
    if (!data.latitude || !data.longitude) {
      alert('Silakan tentukan lokasi pada peta');
      return;
    }

    post(route('keluarga.store'), {
      onSuccess: (page: any) => {
        // Ambil ID keluarga yang baru dibuat dari response
        if (page.props.keluarga?.id) {
          setKeluargaId(page.props.keluarga.id);
        }
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
      }
    });
  };

  // Handle koordinat dari peta
  const handleMapPointSaved = (point: LocationData) => {
    if (point && point.lat && point.lng) {
      setData(prevData => ({
        ...prevData,
        latitude: point.lat.toString(),
        longitude: point.lng.toString()
      }));
      setCurrentLocation(point);
    }
  };

  // Handle perubahan input koordinat manual
  const handleCoordinateChange = (field: 'latitude' | 'longitude', value: string) => {
    setData(field, value);
    
    // Update current location jika kedua koordinat valid
    if (field === 'latitude' && data.longitude && !isNaN(parseFloat(value))) {
      setCurrentLocation({
        lat: parseFloat(value),
        lng: parseFloat(data.longitude)
      });
    } else if (field === 'longitude' && data.latitude && !isNaN(parseFloat(value))) {
      setCurrentLocation({
        lat: parseFloat(data.latitude),
        lng: parseFloat(value)
      });
    }
  };

  // Toggle tampilan peta
  const toggleMap = () => {
    setShowMap(!showMap);
    if (!showMap && !currentLocation) {
      // Jika peta akan ditampilkan tapi belum ada lokasi, gunakan default
      setCurrentLocation({ lat: -2.548926, lng: 118.0148634 }); // Default ke Indonesia
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">Tambah Data Keluarga</h2>
          <Link
            href={route('keluarga.index')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </Link>
        </div>
      }
    >
      <Head title="Tambah Data Keluarga" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Data KK Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Kartu Keluarga</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <InputLabel htmlFor="no_kk" value="Nomor KK *" />
                      <TextInput
                        id="no_kk"
                        className="mt-1 block w-full"
                        value={data.no_kk}
                        onChange={(e) => setData('no_kk', e.target.value)}
                        required
                        placeholder="16 digit nomor KK"
                      />
                      <InputError message={errors.no_kk} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="nama_kepala_keluarga" value="Nama Kepala Keluarga *" />
                      <TextInput
                        id="nama_kepala_keluarga"
                        className="mt-1 block w-full"
                        value={data.nama_kepala_keluarga}
                        onChange={(e) => setData('nama_kepala_keluarga', e.target.value)}
                        required
                        placeholder="Nama lengkap kepala keluarga"
                      />
                      <InputError message={errors.nama_kepala_keluarga} className="mt-2" />
                    </div>
                  </div>
                </div>

                {/* Alamat Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Alamat Lengkap</h3>
                  <div className="space-y-4">
                    <div>
                      <InputLabel htmlFor="alamat" value="Alamat *" />
                      <textarea
                        id="alamat"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        rows={3}
                        value={data.alamat}
                        onChange={(e) => setData('alamat', e.target.value)}
                        required
                        placeholder="Alamat lengkap (jalan, nomor rumah, dll)"
                      />
                      <InputError message={errors.alamat} className="mt-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <InputLabel htmlFor="rt" value="RT" />
                        <TextInput
                          id="rt"
                          className="mt-1 block w-full"
                          value={data.rt}
                          onChange={(e) => setData('rt', e.target.value)}
                          placeholder="001"
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
                          placeholder="001"
                        />
                        <InputError message={errors.rw} className="mt-2" />
                      </div>

                      <div>
                        <InputLabel htmlFor="kode_pos" value="Kode Pos" />
                        <TextInput
                          id="kode_pos"
                          className="mt-1 block w-full"
                          value={data.kode_pos}
                          onChange={(e) => setData('kode_pos', e.target.value)}
                          placeholder="12345"
                        />
                        <InputError message={errors.kode_pos} className="mt-2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <InputLabel htmlFor="kelurahan" value="Kelurahan" />
                        <TextInput
                          id="kelurahan"
                          className="mt-1 block w-full"
                          value={data.kelurahan}
                          onChange={(e) => setData('kelurahan', e.target.value)}
                          placeholder="Nama kelurahan"
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
                          placeholder="Nama kecamatan"
                        />
                        <InputError message={errors.kecamatan} className="mt-2" />
                      </div>

                      <div>
                        <InputLabel htmlFor="kota" value="Kota/Kabupaten" />
                        <TextInput
                          id="kota"
                          className="mt-1 block w-full"
                          value={data.kota}
                          onChange={(e) => setData('kota', e.target.value)}
                          placeholder="Nama kota/kabupaten"
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
                          placeholder="Nama provinsi"
                        />
                        <InputError message={errors.provinsi} className="mt-2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Ekonomi Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Ekonomi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <InputLabel htmlFor="status_ekonomi" value="Status Ekonomi *" />
                      <select
                        id="status_ekonomi"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={data.status_ekonomi}
                        onChange={(e) => setData('status_ekonomi', e.target.value)}
                        required
                      >
                        <option value="sangat_miskin">Sangat Miskin</option>
                        <option value="miskin">Miskin</option>
                        <option value="rentan_miskin">Rentan Miskin</option>
                      </select>
                      <InputError message={errors.status_ekonomi} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="penghasilan_bulanan" value="Penghasilan Bulanan (Rp)" />
                      <TextInput
                        id="penghasilan_bulanan"
                        type="number"
                        className="mt-1 block w-full"
                        value={data.penghasilan_bulanan}
                        onChange={(e) => setData('penghasilan_bulanan', e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                      <InputError message={errors.penghasilan_bulanan} className="mt-2" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <InputLabel htmlFor="keterangan" value="Keterangan" />
                    <textarea
                      id="keterangan"
                      className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                      rows={3}
                      value={data.keterangan}
                      onChange={(e) => setData('keterangan', e.target.value)}
                      placeholder="Keterangan tambahan (opsional)"
                    />
                    <InputError message={errors.keterangan} className="mt-2" />
                  </div>
                </div>

                {/* Lokasi Section */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lokasi Geografis *</h3>
                  
                  {/* Koordinat Manual */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <InputLabel htmlFor="latitude" value="Latitude" />
                      <TextInput
                        id="latitude"
                        type="number"
                        step="any"
                        className="mt-1 block w-full"
                        value={data.latitude}
                        onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                        placeholder="-6.200000"
                      />
                      <InputError message={errors.latitude} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="longitude" value="Longitude" />
                      <TextInput
                        id="longitude"
                        type="number"
                        step="any"
                        className="mt-1 block w-full"
                        value={data.longitude}
                        onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                        placeholder="106.816666"
                      />
                      <InputError message={errors.longitude} className="mt-2" />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={toggleMap}
                        className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
                      >
                        {showMap ? 'Sembunyikan Peta' : 'Tampilkan Peta'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Peta */}
                  {showMap && (
                    <div className="border rounded-lg overflow-hidden h-96 mt-4">
                      {currentLocation ? (
                        <MapDrawing 
                          initialCenter={currentLocation}
                          onSave={handleMapPointSaved}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100">
                          <p className="text-gray-500">Tentukan koordinat atau klik pada peta untuk menentukan lokasi</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end mt-6">
                  <PrimaryButton className="ml-4" disabled={processing}>
                    Simpan Data Keluarga
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
