// resources/js/Pages/Keluarga/Edit.tsx
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

  // Breadcrumb
  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Data Keluarga', href: route('keluarga.index') },
    { label: 'Edit Data', active: true }
  ];

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

    router.post(route('keluarga.update', keluarga.id), {
      ...data,
      _method: 'PUT'
    }, {
      forceFormData: true,
      onSuccess: () => {
        setIsFormUpdated(true);
        setLastSavedData(data);

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
    console.log('Received point from map:', point);

    if (point && point.lat && point.lng) {
      const updatedData = {
        ...data,
        latitude: point.lat.toString(),
        longitude: point.lng.toString()
      };

      setData(updatedData);
      setCurrentLocation(point);

      router.post(route('keluarga.update', keluarga.id), {
        ...updatedData,
        _method: 'PUT'
      }, {
        forceFormData: true,
        onSuccess: () => {
          setLastSavedData(updatedData);
          alert('Koordinat berhasil diperbarui!');
        },
        onError: (errors: any) => {
          console.error('Error updating coordinates:', errors);
          alert('Terjadi kesalahan saat menyimpan koordinat. Silakan coba lagi.');
        }
      });
    } else {
      console.error('Invalid point data:', point);
      alert('Data koordinat tidak valid');
    }
  };

  // Handle perubahan input koordinat manual
  const handleCoordinateChange = (field: 'latitude' | 'longitude', value: string) => {
    setData(field, value);

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
      setCurrentLocation({ lat: -2.548926, lng: 118.0148634 });
    }
  };

  // Toggle section peta
  const toggleMapSection = () => {
    setShowMapSection(!showMapSection);
  };

  const handleBackToList = () => {
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
      breadcrumbs={breadcrumbs}
      header={
        <div className="flex items-center space-x-4 animate-slideInDown">
          <div className="w-1 h-10 bg-gradient-to-b from-cyan-400 via-cyan-500 to-teal-600 rounded-full shadow-lg animate-pulse"></div>
          <h2 className="font-extralight text-3xl text-slate-800 tracking-wide">Edit Data Keluarga</h2>
        </div>
      }
    >
      <Head title={`Edit Data Keluarga - ${keluarga?.nama_kepala_keluarga}`} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50">
        <div className="space-y-8 p-6">
          {/* Success Message */}
          {isFormUpdated && (
            <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-3xl p-6 shadow-lg animate-slideInUp backdrop-blur-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center animate-bounce">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-emerald-800">
                    Data keluarga berhasil diperbarui!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header Info */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-xl animate-fadeInUp">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-light text-slate-800">Informasi Keluarga</h3>
                <p className="text-slate-600 font-mono text-sm">
                  KK: {keluarga?.no_kk} • {keluarga?.nama_kepala_keluarga}
                </p>
                <p className="text-xs text-slate-500">
                  Terakhir diperbarui: {new Date(keluarga?.updated_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleViewDetail}
                  className="group inline-flex items-center px-6 py-3 border border-cyan-200 rounded-2xl text-sm font-medium text-cyan-700 bg-white/50 hover:bg-cyan-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Detail
                </button>
                <button
                  onClick={handleBackToList}
                  className="group inline-flex items-center px-6 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 bg-white/50 hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali
                </button>
              </div>
            </div>
          </div>

          {/* Form Data Keluarga */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-xl animate-fadeInUp">
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full animate-pulse"></div>
                <h3 className="text-2xl font-extralight text-slate-800 tracking-wide">Edit Data Keluarga</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Data KK Section */}
                <div className="group bg-gradient-to-br from-slate-50/50 to-cyan-50/30 p-8 rounded-3xl border border-slate-100/50 hover:shadow-lg transition-all duration-500 animate-slideInLeft">
                  <h4 className="text-lg font-light text-slate-800 mb-6 flex items-center">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full mr-4"></div>
                    Data Kartu Keluarga
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <InputLabel htmlFor="no_kk" value="Nomor KK *" className="text-slate-700 font-medium" />
                      <TextInput
                        id="no_kk"
                        className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md"
                        value={data.no_kk}
                        onChange={(e) => setData('no_kk', e.target.value)}
                        required
                        placeholder="16 digit nomor KK"
                      />
                      <InputError message={errors.no_kk} className="mt-2" />
                    </div>

                    <div className="space-y-2">
                      <InputLabel htmlFor="nama_kepala_keluarga" value="Nama Kepala Keluarga *" className="text-slate-700 font-medium" />
                      <TextInput
                        id="nama_kepala_keluarga"
                        className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md"
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
                <div className="group bg-gradient-to-br from-blue-50/30 to-cyan-50/50 p-8 rounded-3xl border border-blue-100/50 hover:shadow-lg transition-all duration-500 animate-slideInRight">
                  <h4 className="text-lg font-light text-slate-800 mb-6 flex items-center">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full mr-4"></div>
                    Alamat Lengkap
                  </h4>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <InputLabel htmlFor="alamat" value="Alamat *" className="text-slate-700 font-medium" />
                      <textarea
                        id="alamat"
                        className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md resize-none"
                        rows={3}
                        value={data.alamat}
                        onChange={(e) => setData('alamat', e.target.value)}
                        required
                        placeholder="Alamat lengkap (jalan, nomor rumah, dll)"
                      />
                      <InputError message={errors.alamat} className="mt-2" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <InputLabel htmlFor="rt" value="RT" className="text-slate-700 font-medium" />
                        <TextInput
                          id="rt"
                          className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md"
                          value={data.rt}
                          onChange={(e) => setData('rt', e.target.value)}
                          placeholder="001"
                        />
                        <InputError message={errors.rt} className="mt-2" />
                      </div>

                      <div className="space-y-2">
                        <InputLabel htmlFor="rw" value="RW" className="text-slate-700 font-medium" />
                        <TextInput
                          id="rw"
                          className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md"
                          value={data.rw}
                          onChange={(e) => setData('rw', e.target.value)}
                          placeholder="001"
                        />
                        <InputError message={errors.rw} className="mt-2" />
                      </div>

                      <div className="space-y-2">
                        <InputLabel htmlFor="kode_pos" value="Kode Pos" className="text-slate-700 font-medium" />
                        <TextInput
                          id="kode_pos"
                          className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md"
                          value={data.kode_pos}
                          onChange={(e) => setData('kode_pos', e.target.value)}
                          placeholder="12345"
                        />
                        <InputError message={errors.kode_pos} className="mt-2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <InputLabel htmlFor="kelurahan" value="Kelurahan *" className="text-slate-700 font-medium" />
                        <TextInput
                          id="kelurahan"
                          className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md"
                          value={data.kelurahan}
                          onChange={(e) => setData('kelurahan', e.target.value)}
                          placeholder="Nama kelurahan"
                          required
                        />
                        <InputError message={errors.kelurahan} className="mt-2" />
                      </div>

                      <div className="space-y-2">
                        <InputLabel htmlFor="kecamatan" value="Kecamatan *" className="text-slate-700 font-medium" />
                        <TextInput
                          id="kecamatan"
                          className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md"
                          value={data.kecamatan}
                          onChange={(e) => setData('kecamatan', e.target.value)}
                          placeholder="Nama kecamatan"
                          required
                        />
                        <InputError message={errors.kecamatan} className="mt-2" />
                      </div>

                      <div className="space-y-2">
                        <InputLabel htmlFor="kota" value="Kota/Kabupaten *" className="text-slate-700 font-medium" />
                        <TextInput
                          id="kota"
                          className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md"
                          value={data.kota}
                          onChange={(e) => setData('kota', e.target.value)}
                          placeholder="Nama kota/kabupaten"
                          required
                        />
                        <InputError message={errors.kota} className="mt-2" />
                      </div>

                      <div className="space-y-2">
                        <InputLabel htmlFor="provinsi" value="Provinsi *" className="text-slate-700 font-medium" />
                        <TextInput
                          id="provinsi"
                          className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md"
                          value={data.provinsi}
                          onChange={(e) => setData('provinsi', e.target.value)}
                          placeholder="Nama provinsi"
                          required
                        />
                        <InputError message={errors.provinsi} className="mt-2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Ekonomi Section */}
                <div className="group bg-gradient-to-br from-emerald-50/30 to-cyan-50/50 p-8 rounded-3xl border border-emerald-100/50 hover:shadow-lg transition-all duration-500 animate-slideInLeft">
                  <h4 className="text-lg font-light text-slate-800 mb-6 flex items-center">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-400 to-cyan-500 rounded-full mr-4"></div>
                    Status Ekonomi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <InputLabel htmlFor="status_ekonomi" value="Status Ekonomi *" className="text-slate-700 font-medium" />
                      <select
                        id="status_ekonomi"
                        className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md"
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

                    <div className="space-y-2">
                      <InputLabel htmlFor="penghasilan_bulanan" value="Penghasilan Bulanan (Rp)" className="text-slate-700 font-medium" />
                      <TextInput
                        id="penghasilan_bulanan"
                        type="number"
                        className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md"
                        value={data.penghasilan_bulanan}
                        onChange={(e) => setData('penghasilan_bulanan', e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                      <InputError message={errors.penghasilan_bulanan} className="mt-2" />
                    </div>
                  </div>

                  <div className="mt-8 space-y-2">
                    <InputLabel htmlFor="keterangan" value="Keterangan" className="text-slate-700 font-medium" />
                    <textarea
                      id="keterangan"
                      className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md resize-none"
                      rows={3}
                      value={data.keterangan}
                      onChange={(e) => setData('keterangan', e.target.value)}
                      placeholder="Keterangan tambahan (opsional)"
                    />
                    <InputError message={errors.keterangan} className="mt-2" />
                  </div>
                </div>

                {/* Lokasi Section */}
                <div className="group bg-gradient-to-br from-violet-50/30 to-cyan-50/50 p-8 rounded-3xl border border-violet-100/50 hover:shadow-lg transition-all duration-500 animate-slideInRight">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-lg font-light text-slate-800 flex items-center">
                      <div className="w-1.5 h-6 bg-gradient-to-b from-violet-400 to-cyan-500 rounded-full mr-4"></div>
                      Lokasi Geografis
                    </h4>
                    <button
                      type="button"
                      onClick={toggleMapSection}
                      className="group inline-flex items-center px-6 py-3 text-sm font-medium text-violet-700 bg-violet-100/60 backdrop-blur-sm rounded-2xl hover:bg-violet-200/60 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      {showMapSection ? 'Sembunyikan Peta' : 'Tampilkan Peta'}
                    </button>
                  </div>

                  {/* Koordinat Manual */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="space-y-2">
                      <InputLabel htmlFor="latitude" value="Latitude" className="text-slate-700 font-medium" />
                      <TextInput
                        id="latitude"
                        type="number"
                        step="any"
                        className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md"
                        value={data.latitude}
                        onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                        placeholder="-6.200000"
                      />
                      <InputError message={errors.latitude} className="mt-2" />
                    </div>

                    <div className="space-y-2">
                      <InputLabel htmlFor="longitude" value="Longitude" className="text-slate-700 font-medium" />
                      <TextInput
                        id="longitude"
                        type="number"
                        step="any"
                        className="mt-2 block w-full border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:shadow-md"
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
                        className="group w-full inline-flex justify-center items-center px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-medium rounded-2xl hover:from-violet-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl backdrop-blur-sm"
                      >
                        <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {showMap ? 'Sembunyikan' : 'Tampilkan'} Peta
                      </button>
                    </div>
                  </div>

                  {/* Status Koordinat */}
                  <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-violet-200/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Status Koordinat:</p>
                        {data.latitude && data.longitude ? (
                          <p className="text-sm text-emerald-600 flex items-center mt-2">
                            <svg className="w-4 h-4 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Tersedia - Lat: {data.latitude}, Lng: {data.longitude}
                          </p>
                        ) : (
                          <p className="text-sm text-amber-600 flex items-center mt-2">
                            <svg className="w-4 h-4 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Belum ditentukan - Klik pada peta untuk menentukan lokasi
                          </p>
                        )}
                      </div>
                      {currentLocation && (
                        <div className="text-xs text-slate-500 bg-slate-50/60 backdrop-blur-sm px-4 py-2 rounded-xl">
                          <div>Current: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Peta Inline */}
                  {showMap && (
                    <div className="border border-violet-200/50 rounded-2xl overflow-hidden mt-8 animate-slideInUp" style={{ height: '400px' }}>
                      <MapDrawing
                        onSave={handleMapPointSaved}
                        keluargaId={keluarga.id}
                        initialLat={currentLocation?.lat || -2.548926}
                        initialLng={currentLocation?.lng || 118.0148634}
                        existingMarker={currentLocation}
                      />
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-between pt-8 border-t border-slate-200/50">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="group inline-flex items-center px-8 py-4 border border-slate-300/50 rounded-2xl text-sm font-medium text-slate-700 bg-white/60 backdrop-blur-sm hover:bg-slate-50/60 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    disabled={processing}
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset ke Data Asli
                  </button>

                  <div className="flex items-center space-x-6">
                    {isDirty && (
                      <span className="text-sm text-amber-600 flex items-center animate-pulse">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Ada perubahan yang belum disimpan
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={processing}
                      className="group inline-flex items-center px-10 py-4 bg-gradient-to-r from-cyan-500 via-cyan-600 to-teal-600 text-white font-medium rounded-2xl hover:from-cyan-600 hover:via-cyan-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-cyan-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                    >
                      {processing ? (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Menyimpan...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Simpan Perubahan
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Section Peta Terpisah */}
          {showMapSection && (
            <div id="map-section" className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-xl animate-slideInUp">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-extralight text-slate-800 flex items-center tracking-wide">
                    <div className="w-2 h-8 bg-gradient-to-b from-violet-400 to-cyan-500 rounded-full mr-4 animate-pulse"></div>
                    Peta Lokasi Keluarga
                  </h3>
                  <div className="flex items-center text-violet-600">
                    <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Peta Interaktif
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-8 p-4 bg-slate-50/60 backdrop-blur-sm rounded-2xl border border-slate-200/50">
                  {currentLocation
                    ? 'Lokasi saat ini sudah ditentukan. Klik pada peta untuk memindahkan marker ke lokasi baru.'
                    : 'Klik pada peta untuk menentukan lokasi keluarga.'
                  }
                </p>

                <div className="border border-violet-200/50 rounded-3xl overflow-hidden shadow-lg" style={{ height: '500px' }}>
                  <MapDrawing
                    keluargaId={keluarga.id}
                    onSave={handleMapPointSaved}
                    initialLat={currentLocation?.lat || -2.548926}
                    initialLng={currentLocation?.lng || 118.0148634}
                    existingMarker={currentLocation}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS untuk animasi aqua modern */}
      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideInDown {
          animation: slideInDown 0.6s ease-out forwards;
        }

        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        /* Aqua glass morphism effect */
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .backdrop-blur-sm {
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }

        /* Hover effects */
        .group:hover .group-hover\\:rotate-12 {
          transform: rotate(12deg);
        }

        .group:hover .group-hover\\:rotate-180 {
          transform: rotate(180deg);
        }

        .group:hover .group-hover\\:-translate-x-1 {
          transform: translateX(-0.25rem);
        }

        /* Staggered animation delays */
        .group:nth-child(1) { animation-delay: 0.1s; }
        .group:nth-child(2) { animation-delay: 0.2s; }
        .group:nth-child(3) { animation-delay: 0.3s; }
        .group:nth-child(4) { animation-delay: 0.4s; }
        .group:nth-child(5) { animation-delay: 0.5s; }
      `}</style>
    </AuthenticatedLayout>
  );
}
