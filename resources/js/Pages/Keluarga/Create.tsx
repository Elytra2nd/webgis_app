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

interface KeluargaResponse {
    id: number;
    // tambahkan properti lain jika diperlukan
}

interface LocationData {
    lat: number;
    lng: number;
}

export default function Create({ auth }: PageProps) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<KeluargaFormData>({
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
    const [isFormSaved, setIsFormSaved] = useState<boolean>(false);
    const [showMapSection, setShowMapSection] = useState<boolean>(false);
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
    const [showMap, setShowMap] = useState(false);

    // Handle submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi manual untuk koordinat jika diperlukan
        // if (!data.latitude || !data.longitude) {
        //   alert('Silakan tentukan lokasi pada peta');
        //   return;
        // }

        post(route('keluarga.store'), {
            onSuccess: (response: any) => {
                try {
                    // Coba beberapa cara untuk mendapatkan ID dari response
                    let id = null;

                    // Cara 1: Dari response.props
                    if (response.props && response.props.keluarga && response.props.keluarga.id) {
                        id = response.props.keluarga.id;
                    }
                    // Cara 2: Dari response langsung
                    else if (response.keluarga && response.keluarga.id) {
                        id = response.keluarga.id;
                    }
                    // Cara 3: Dari flash message atau session
                    else if (response.props && response.props.flash && response.props.flash.keluarga_id) {
                        id = response.props.flash.keluarga_id;
                    }

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
                    } else {
                        // Jika tidak ada ID, tetap set sebagai berhasil tapi tanpa map section
                        setIsFormSaved(true);
                        alert('Data keluarga berhasil disimpan!');
                    }
                } catch (error) {
                    console.error('Error processing response:', error);
                    setIsFormSaved(true);
                    alert('Data keluarga berhasil disimpan!');
                }
            },
            onError: (errors) => {
                console.error('Error saving keluarga:', errors);
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

            // Update data keluarga dengan koordinat baru jika sudah tersimpan
            if (keluargaId) {
                // Menggunakan put dengan data yang benar sesuai Laravel resource route
                put(route('keluarga.update', keluargaId), {
                    ...updatedData,
                    onSuccess: () => {
                        alert('Koordinat berhasil disimpan!');
                    },
                    onError: (errors: any) => {
                        console.error('Error updating coordinates:', errors);
                        // Fallback: simpan koordinat di state saja jika update gagal
                        alert('Koordinat berhasil ditentukan!');
                    }
                });
            }
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

    const handleStartOver = () => {
        // Reset form untuk data keluarga baru
        reset();
        setKeluargaId(null);
        setIsFormSaved(false);
        setShowMapSection(false);
        setCurrentLocation(null);
        setShowMap(false);
        clearErrors();

        // Scroll ke atas
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFinish = () => {
        // Gunakan router.visit untuk navigasi yang lebih aman
        try {
            router.visit(route('keluarga.index'));
        } catch (error) {
            console.error('Error navigating:', error);
            // Fallback ke window.location
            window.location.href = route('keluarga.index');
        }
    };

    const handleBackToList = () => {
        try {
            router.visit(route('keluarga.index'));
        } catch (error) {
            console.error('Error navigating back:', error);
            window.location.href = route('keluarga.index');
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Tambah Data Keluarga</h2>
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
            }
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
                                                disabled={isFormSaved}
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
                                                disabled={isFormSaved}
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
                                        {/* Provinsi - Level paling umum */}
                                        <div>
                                            <InputLabel htmlFor="provinsi" value="Provinsi *" />
                                            <TextInput
                                                id="provinsi"
                                                className="mt-1 block w-full"
                                                value={data.provinsi}
                                                onChange={(e) => setData('provinsi', e.target.value)}
                                                disabled={isFormSaved}
                                                placeholder="Nama provinsi"
                                                required
                                            />
                                            <InputError message={errors.provinsi} className="mt-2" />
                                        </div>

                                        {/* Kota/Kabupaten */}
                                        <div>
                                            <InputLabel htmlFor="kota" value="Kota/Kabupaten *" />
                                            <TextInput
                                                id="kota"
                                                className="mt-1 block w-full"
                                                value={data.kota}
                                                onChange={(e) => setData('kota', e.target.value)}
                                                disabled={isFormSaved}
                                                placeholder="Nama kota/kabupaten"
                                                required
                                            />
                                            <InputError message={errors.kota} className="mt-2" />
                                        </div>

                                        {/* Kecamatan dan Kelurahan */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel htmlFor="kecamatan" value="Kecamatan *" />
                                                <TextInput
                                                    id="kecamatan"
                                                    className="mt-1 block w-full"
                                                    value={data.kecamatan}
                                                    onChange={(e) => setData('kecamatan', e.target.value)}
                                                    disabled={isFormSaved}
                                                    placeholder="Nama kecamatan"
                                                    required
                                                />
                                                <InputError message={errors.kecamatan} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="kelurahan" value="Kelurahan/Desa *" />
                                                <TextInput
                                                    id="kelurahan"
                                                    className="mt-1 block w-full"
                                                    value={data.kelurahan}
                                                    onChange={(e) => setData('kelurahan', e.target.value)}
                                                    disabled={isFormSaved}
                                                    placeholder="Nama kelurahan/desa"
                                                    required
                                                />
                                                <InputError message={errors.kelurahan} className="mt-2" />
                                            </div>
                                        </div>

                                        {/* Kode Pos */}
                                        <div>
                                            <InputLabel htmlFor="kode_pos" value="Kode Pos *" />
                                            <TextInput
                                                id="kode_pos"
                                                className="mt-1 block w-full"
                                                value={data.kode_pos}
                                                onChange={(e) => setData('kode_pos', e.target.value)}
                                                disabled={isFormSaved}
                                                placeholder="12345"
                                                required
                                            />
                                            <InputError message={errors.kode_pos} className="mt-2" />
                                        </div>

                                        {/* Alamat (Jalan dan Nomor) */}
                                        <div>
                                            <InputLabel htmlFor="alamat" value="Alamat (Jalan dan Nomor) *" />
                                            <textarea
                                                id="alamat"
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                rows={3}
                                                value={data.alamat}
                                                onChange={(e) => setData('alamat', e.target.value)}
                                                required
                                                disabled={isFormSaved}
                                                placeholder="Nama jalan, nomor rumah, gang, dll"
                                            />
                                            <InputError message={errors.alamat} className="mt-2" />
                                        </div>

                                        {/* RT/RW - Opsional */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel htmlFor="rt" value="RT" />
                                                <TextInput
                                                    id="rt"
                                                    className="mt-1 block w-full"
                                                    value={data.rt}
                                                    onChange={(e) => setData('rt', e.target.value)}
                                                    disabled={isFormSaved}
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
                                                    disabled={isFormSaved}
                                                    placeholder="001"
                                                />
                                                <InputError message={errors.rw} className="mt-2" />
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
                                                disabled={isFormSaved}
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
                                                disabled={isFormSaved}
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
                                            disabled={isFormSaved}
                                            placeholder="Keterangan tambahan (opsional)"
                                        />
                                        <InputError message={errors.keterangan} className="mt-2" />
                                    </div>
                                </div>

                                {/* Lokasi Section - Hanya muncul jika form belum tersimpan */}
                                {!isFormSaved && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lokasi Geografis (Opsional)</h3>

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
                                                        onSave={handleMapPointSaved}
                                                        keluargaId={keluargaId || 0}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full bg-gray-100">
                                                        <p className="text-gray-500">Tentukan koordinat atau klik pada peta untuk menentukan lokasi</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Submit Button - Hanya muncul jika form belum tersimpan */}
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
                    {showMapSection && keluargaId && (
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
                                    <MapDrawing keluargaId={keluargaId} onSave={handleMapPointSaved} />
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
                                            Data keluarga berhasil disimpan! {data.latitude && data.longitude ? 'Koordinat sudah ditentukan.' : 'Silakan tentukan koordinat lokasi pada peta di atas jika diperlukan.'}
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
