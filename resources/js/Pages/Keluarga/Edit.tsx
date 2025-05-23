import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
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
  latitude: string;
  longitude: string;
  status_ekonomi: string;
  penghasilan_bulanan: string;
  keterangan: string;
  created_at: string;
  updated_at: string;
}

interface LocationData {
  lat: number;
  lng: number;
}

interface EditPageProps extends PageProps {
  keluarga: Keluarga;
}

export default function Edit({ auth, keluarga }: EditPageProps) {
  const { data, setData, put, processing, errors, reset, clearErrors, isDirty } = useForm<KeluargaFormData>({
    no_kk: keluarga?.no_kk || '',
    nama_kepala_keluarga: keluarga?.nama_kepala_keluarga || '',
    alamat: keluarga?.alamat || '',
    rt: keluarga?.rt || '',
    rw: keluarga?.rw || '',
    kelurahan: keluarga?.kelurahan || '',
    kecamatan: keluarga?.kecamatan || '',
    kota: keluarga?.kota || '',
    provinsi: keluarga?.provinsi || '',
    kode_pos: keluarga?.kode_pos || '',
    latitude: keluarga?.latitude || '',
    longitude: keluarga?.longitude || '',
    status_ekonomi: keluarga?.status_ekonomi || 'miskin',
    penghasilan_bulanan: keluarga?.penghasilan_bulanan || '',
    keterangan: keluarga?.keterangan || ''
  });

  const [showMapSection, setShowMapSection] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [isFormUpdated, setIsFormUpdated] = useState<boolean>(false);
  const [lastSavedData, setLastSavedData] = useState<KeluargaFormData>(data);

  // Set initial location jika ada koordinat
  useEffect(() => {
    if (keluarga?.latitude && keluarga?.longitude) {
      const lat = parseFloat(keluarga.latitude);
      const lng = parseFloat(keluarga.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCurrentLocation({ lat, lng });
      }
    }
  }, [keluarga]);

  // Handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    put(route('keluarga.update', keluarga.id), {
      onSuccess: () => {
        setIsFormUpdated(true);
        setLastSavedData(data);
        
        // Show success message
        setTimeout(() => {
          setIsFormUpdated(false);
        }, 3000);
      },
      onError: (errors) => {
        console.error('Error updating keluarga:', errors);
      }
    });
  };

  // Handle koordinat dari peta
  const handleMapPointSaved = (point: LocationData) => {
    if (point && point.lat && point.lng) {
      // Update koordinat di form data
      const updatedData = {
        ...data,
        latitude: point.lat.toString(),
        longitude: point.lng.toString()
      };

      setData(updatedData);
      setCurrentLocation(point);

      // Update data keluarga dengan koordinat baru
      put(route('keluarga.update', keluarga.id), {
        ...updatedData,
        onSuccess: () => {
          setLastSavedData(updatedData);
          alert('Koordinat berhasil diperbarui!');
        },
        onError: (errors: any) => {
          console.error('Error updating coordinates:', errors);
          alert('Error updating coordinates. Please try again.');
        }
      });
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

  // Toggle section peta
  const toggleMapSection = () => {
    setShowMapSection(!showMapSection);
  };

  const handleBackToList = () => {
    // Check if there are unsaved changes
    if (isDirty) {
      const confirmLeave = window.confirm(
        'Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman ini?'
      );
      if (!confirmLeave) {
        return;
      }
    }

    try {
      router.visit(route('keluarga.index'));
    } catch (error) {
      console.error('Error navigating back:', error);
      window.location.href = route('keluarga.index');
    }
  };

  const handleViewDetail = () => {
    try {
      router.visit(route('keluarga.show', keluarga.id));
    } catch (error) {
      console.error('Error navigating to detail:', error);
      window.location.href = route('keluarga.show', keluarga.id);
    }
  };

  // Reset form to original values
  const handleResetForm = () => {
    const confirmReset = window.confirm(
      'Apakah Anda yakin ingin mengembalikan semua perubahan ke data asli?'
    );
    
    if (confirmReset) {
      setData({
        no_kk: keluarga?.no_kk || '',
        nama_kepala_keluarga: keluarga?.nama_kepala_keluarga || '',
        alamat: keluarga?.alamat || '',
        rt: keluarga?.rt || '',
        rw: keluarga?.rw || '',
        kelurahan: keluarga?.kelurahan || '',
        kecamatan: keluarga?.kecamatan || '',
        kota: keluarga?.kota || '',
        provinsi: keluarga?.provinsi || '',
        kode_pos: keluarga?.kode_pos || '',
        latitude: keluarga?.latitude || '',
        longitude: keluarga?.longitude || '',
        status_ekonomi: keluarga?.status_ekonomi || 'miskin',
        penghasilan_bulanan: keluarga?.penghasilan_bulanan || '',
        keterangan: keluarga?.keterangan || ''
      });
      
      // Reset location
      if (keluarga?.latitude && keluarga?.longitude) {
        const lat = parseFloat(keluarga.latitude);
        const lng = parseFloat(keluarga.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          setCurrentLocation({ lat, lng });
        }
      } else {
        setCurrentLocation(null);
      }
      
      clearErrors();
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
              Edit Data Keluarga
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              KK: {keluarga?.no_kk} - {keluarga?.nama_kepala_keluarga}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleViewDetail}
              className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Lihat Detail
            </button>
            <button
              onClick={handleBackToList}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
            </button>
          </div>
        </div>
      }
    >
      <Head title={`Edit Data Keluarga - ${keluarga?.nama_kepala_keluarga}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

          {/* Success Message */}
          {isFormUpdated && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Data keluarga berhasil diperbarui!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Data Keluarga */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Edit Data Keluarga</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Terakhir diperbarui:</span>
                  <span className="font-medium">
                    {new Date(keluarga?.updated_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

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
                        <option value="menengah">Menengah</option>
                        <option value="kaya">Kaya</option>
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Lokasi Geografis</h3>
                    <button
                      type="button"
                      onClick={toggleMapSection}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                    >
                      {showMapSection ? 'Sembunyikan Peta' : 'Tampilkan Peta'}
                    </button>
                  </div>

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

                  {/* Status Koordinat */}
                  <div className="p-3 bg-white rounded-md border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Status Koordinat:</p>
                        {data.latitude && data.longitude ? (
                          <p className="text-sm text-green-600">
                            ✓ Tersedia - Lat: {data.latitude}, Lng: {data.longitude}
                          </p>
                        ) : (
                          <p className="text-sm text-orange-600">
                            ⚠ Belum ditentukan - Klik pada peta untuk menentukan lokasi
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Peta - hanya tampil jika showMap true */}
                  {showMap && (
                    <div className="border rounded-lg overflow-hidden h-96 mt-4">
                      <MapDrawing
                        onSave={handleMapPointSaved}
                        keluargaId={keluarga.id}
                       
                      />
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={processing}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset ke Data Asli
                  </button>

                  <div className="flex items-center space-x-4">
                    {isDirty && (
                      <span className="text-sm text-orange-600">
                        * Ada perubahan yang belum disimpan
                      </span>
                    )}
                    <PrimaryButton disabled={processing}>
                      {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </PrimaryButton>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Section Peta - Tampil jika showMapSection true */}
          {showMapSection && (
            <div id="map-section" className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Peta Lokasi Keluarga</h3>
                  <div className="flex items-center text-blue-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Peta Interaktif
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Gunakan marker untuk menandai lokasi rumah, polygon untuk wilayah, dan garis untuk menghitung jarak.
                  Koordinat akan otomatis tersimpan setelah Anda menandai lokasi.
                </p>

                <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                  <MapDrawing 
                    keluargaId={keluarga.id} 
                    onSave={handleMapPointSaved}
                
                  />
                </div>
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Tips Edit Data Keluarga
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Semua perubahan akan tersimpan setelah Anda klik "Simpan Perubahan"</li>
                    <li>Koordinat dapat diperbarui secara terpisah melalui peta interaktif</li>
                    <li>Gunakan "Reset ke Data Asli" untuk membatalkan semua perubahan</li>
                    <li>Data yang wajib diisi ditandai dengan tanda bintang (*)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Change History Info */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Perubahan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">Dibuat pada:</p>
                  <p className="text-gray-600">
                    {new Date(keluarga?.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">Terakhir diperbarui:</p>
                  <p className="text-gray-600">
                    {new Date(keluarga?.updated_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}