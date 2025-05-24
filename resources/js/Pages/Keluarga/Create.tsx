// resources/js/Pages/Keluarga/Create.tsx
import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MapDrawing from '@/Components/Map/MapDrawing';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { PageProps } from '@/types';

// Data Provinsi dan Kota
const provinsiData = [
    { id: 1, nama: 'Aceh' },
    { id: 2, nama: 'Sumatera Utara' },
    { id: 3, nama: 'Sumatera Barat' },
    { id: 4, nama: 'Riau' },
    { id: 5, nama: 'Jambi' },
    { id: 6, nama: 'Sumatera Selatan' },
    { id: 7, nama: 'Bengkulu' },
    { id: 8, nama: 'Lampung' },
    { id: 9, nama: 'Kepulauan Bangka Belitung' },
    { id: 10, nama: 'Kepulauan Riau' },
    { id: 11, nama: 'DKI Jakarta' },
    { id: 12, nama: 'Jawa Barat' },
    { id: 13, nama: 'Jawa Tengah' },
    { id: 14, nama: 'DI Yogyakarta' },
    { id: 15, nama: 'Jawa Timur' },
    { id: 16, nama: 'Banten' },
    { id: 17, nama: 'Bali' },
    { id: 18, nama: 'Nusa Tenggara Barat' },
    { id: 19, nama: 'Nusa Tenggara Timur' },
    { id: 20, nama: 'Kalimantan Barat' },
    { id: 21, nama: 'Kalimantan Tengah' },
    { id: 22, nama: 'Kalimantan Selatan' },
    { id: 23, nama: 'Kalimantan Timur' },
    { id: 24, nama: 'Kalimantan Utara' },
    { id: 25, nama: 'Sulawesi Utara' },
    { id: 26, nama: 'Sulawesi Tengah' },
    { id: 27, nama: 'Sulawesi Selatan' },
    { id: 28, nama: 'Sulawesi Tenggara' },
    { id: 29, nama: 'Gorontalo' },
    { id: 30, nama: 'Sulawesi Barat' },
    { id: 31, nama: 'Maluku' },
    { id: 32, nama: 'Maluku Utara' },
    { id: 33, nama: 'Papua' },
    { id: 34, nama: 'Papua Barat' },
    { id: 35, nama: 'Papua Selatan' },
    { id: 36, nama: 'Papua Tengah' },
    { id: 37, nama: 'Papua Pegunungan' },
    { id: 38, nama: 'Papua Barat Daya' },
  ];

  const kotaData = [
    // Aceh (18 kabupaten, 5 kota)
    { id: 1, nama: 'Kabupaten Simeulue', provinsi_id: 1 },
    { id: 2, nama: 'Kabupaten Aceh Singkil', provinsi_id: 1 },
    { id: 3, nama: 'Kabupaten Aceh Selatan', provinsi_id: 1 },
    { id: 4, nama: 'Kabupaten Aceh Tenggara', provinsi_id: 1 },
    { id: 5, nama: 'Kabupaten Aceh Timur', provinsi_id: 1 },
    { id: 6, nama: 'Kabupaten Aceh Tengah', provinsi_id: 1 },
    { id: 7, nama: 'Kabupaten Aceh Barat', provinsi_id: 1 },
    { id: 8, nama: 'Kabupaten Aceh Besar', provinsi_id: 1 },
    { id: 9, nama: 'Kabupaten Pidie', provinsi_id: 1 },
    { id: 10, nama: 'Kabupaten Bireuen', provinsi_id: 1 },
    { id: 11, nama: 'Kabupaten Aceh Utara', provinsi_id: 1 },
    { id: 12, nama: 'Kabupaten Aceh Barat Daya', provinsi_id: 1 },
    { id: 13, nama: 'Kabupaten Gayo Lues', provinsi_id: 1 },
    { id: 14, nama: 'Kabupaten Aceh Tamiang', provinsi_id: 1 },
    { id: 15, nama: 'Kabupaten Nagan Raya', provinsi_id: 1 },
    { id: 16, nama: 'Kabupaten Aceh Jaya', provinsi_id: 1 },
    { id: 17, nama: 'Kabupaten Bener Meriah', provinsi_id: 1 },
    { id: 18, nama: 'Kabupaten Pidie Jaya', provinsi_id: 1 },
    { id: 19, nama: 'Kota Banda Aceh', provinsi_id: 1 },
    { id: 20, nama: 'Kota Sabang', provinsi_id: 1 },
    { id: 21, nama: 'Kota Langsa', provinsi_id: 1 },
    { id: 22, nama: 'Kota Lhokseumawe', provinsi_id: 1 },
    { id: 23, nama: 'Kota Subulussalam', provinsi_id: 1 },

    // Sumatera Utara (25 kabupaten, 8 kota)
    { id: 24, nama: 'Kabupaten Asahan', provinsi_id: 2 },
    { id: 25, nama: 'Kabupaten Batubara', provinsi_id: 2 },
    { id: 26, nama: 'Kabupaten Dairi', provinsi_id: 2 },
    { id: 27, nama: 'Kabupaten Deli Serdang', provinsi_id: 2 },
    { id: 28, nama: 'Kabupaten Humbang Hasundutan', provinsi_id: 2 },
    { id: 29, nama: 'Kabupaten Karo', provinsi_id: 2 },
    { id: 30, nama: 'Kabupaten Labuhanbatu', provinsi_id: 2 },
    { id: 31, nama: 'Kabupaten Labuhanbatu Selatan', provinsi_id: 2 },
    { id: 32, nama: 'Kabupaten Labuhanbatu Utara', provinsi_id: 2 },
    { id: 33, nama: 'Kabupaten Langkat', provinsi_id: 2 },
    { id: 34, nama: 'Kabupaten Mandailing Natal', provinsi_id: 2 },
    { id: 35, nama: 'Kabupaten Nias', provinsi_id: 2 },
    { id: 36, nama: 'Kabupaten Nias Barat', provinsi_id: 2 },
    { id: 37, nama: 'Kabupaten Nias Selatan', provinsi_id: 2 },
    { id: 38, nama: 'Kabupaten Nias Utara', provinsi_id: 2 },
    { id: 39, nama: 'Kabupaten Padang Lawas', provinsi_id: 2 },
    { id: 40, nama: 'Kabupaten Padang Lawas Utara', provinsi_id: 2 },
    { id: 41, nama: 'Kabupaten Pakpak Bharat', provinsi_id: 2 },
    { id: 42, nama: 'Kabupaten Samosir', provinsi_id: 2 },
    { id: 43, nama: 'Kabupaten Serdang Bedagai', provinsi_id: 2 },
    { id: 44, nama: 'Kabupaten Simalungun', provinsi_id: 2 },
    { id: 45, nama: 'Kabupaten Tapanuli Selatan', provinsi_id: 2 },
    { id: 46, nama: 'Kabupaten Tapanuli Tengah', provinsi_id: 2 },
    { id: 47, nama: 'Kabupaten Tapanuli Utara', provinsi_id: 2 },
    { id: 48, nama: 'Kabupaten Toba', provinsi_id: 2 },
    { id: 49, nama: 'Kota Binjai', provinsi_id: 2 },
    { id: 50, nama: 'Kota Gunungsitoli', provinsi_id: 2 },
    { id: 51, nama: 'Kota Medan', provinsi_id: 2 },
    { id: 52, nama: 'Kota Padangsidempuan', provinsi_id: 2 },
    { id: 53, nama: 'Kota Pematangsiantar', provinsi_id: 2 },
    { id: 54, nama: 'Kota Sibolga', provinsi_id: 2 },
    { id: 55, nama: 'Kota Tanjung Balai', provinsi_id: 2 },
    { id: 56, nama: 'Kota Tebing Tinggi', provinsi_id: 2 },

    // Sumatera Barat (12 kabupaten, 7 kota)
    { id: 57, nama: 'Kabupaten Agam', provinsi_id: 3 },
    { id: 58, nama: 'Kabupaten Dharmasraya', provinsi_id: 3 },
    { id: 59, nama: 'Kabupaten Kepulauan Mentawai', provinsi_id: 3 },
    { id: 60, nama: 'Kabupaten Lima Puluh Kota', provinsi_id: 3 },
    { id: 61, nama: 'Kabupaten Padang Pariaman', provinsi_id: 3 },
    { id: 62, nama: 'Kabupaten Pasaman', provinsi_id: 3 },
    { id: 63, nama: 'Kabupaten Pasaman Barat', provinsi_id: 3 },
    { id: 64, nama: 'Kabupaten Pesisir Selatan', provinsi_id: 3 },
    { id: 65, nama: 'Kabupaten Sijunjung', provinsi_id: 3 },
    { id: 66, nama: 'Kabupaten Solok', provinsi_id: 3 },
    { id: 67, nama: 'Kabupaten Solok Selatan', provinsi_id: 3 },
    { id: 68, nama: 'Kabupaten Tanah Datar', provinsi_id: 3 },
    { id: 69, nama: 'Kota Bukittinggi', provinsi_id: 3 },
    { id: 70, nama: 'Kota Padang', provinsi_id: 3 },
    { id: 71, nama: 'Kota Padang Panjang', provinsi_id: 3 },
    { id: 72, nama: 'Kota Pariaman', provinsi_id: 3 },
    { id: 73, nama: 'Kota Payakumbuh', provinsi_id: 3 },
    { id: 74, nama: 'Kota Sawahlunto', provinsi_id: 3 },
    { id: 75, nama: 'Kota Solok', provinsi_id: 3 },

    // Riau (10 kabupaten, 2 kota)
    { id: 76, nama: 'Kabupaten Bengkalis', provinsi_id: 4 },
    { id: 77, nama: 'Kabupaten Indragiri Hilir', provinsi_id: 4 },
    { id: 78, nama: 'Kabupaten Indragiri Hulu', provinsi_id: 4 },
    { id: 79, nama: 'Kabupaten Kampar', provinsi_id: 4 },
    { id: 80, nama: 'Kabupaten Kepulauan Meranti', provinsi_id: 4 },
    { id: 81, nama: 'Kabupaten Kuantan Singingi', provinsi_id: 4 },
    { id: 82, nama: 'Kabupaten Pelalawan', provinsi_id: 4 },
    { id: 83, nama: 'Kabupaten Rokan Hilir', provinsi_id: 4 },
    { id: 84, nama: 'Kabupaten Rokan Hulu', provinsi_id: 4 },
    { id: 85, nama: 'Kabupaten Siak', provinsi_id: 4 },
    { id: 86, nama: 'Kota Dumai', provinsi_id: 4 },
    { id: 87, nama: 'Kota Pekanbaru', provinsi_id: 4 },

    // Jambi (9 kabupaten, 2 kota)
    { id: 88, nama: 'Kabupaten Batanghari', provinsi_id: 5 },
    { id: 89, nama: 'Kabupaten Bungo', provinsi_id: 5 },
    { id: 90, nama: 'Kabupaten Kerinci', provinsi_id: 5 },
    { id: 91, nama: 'Kabupaten Merangin', provinsi_id: 5 },
    { id: 92, nama: 'Kabupaten Muaro Jambi', provinsi_id: 5 },
    { id: 93, nama: 'Kabupaten Sarolangun', provinsi_id: 5 },
    { id: 94, nama: 'Kabupaten Tanjung Jabung Barat', provinsi_id: 5 },
    { id: 95, nama: 'Kabupaten Tanjung Jabung Timur', provinsi_id: 5 },
    { id: 96, nama: 'Kabupaten Tebo', provinsi_id: 5 },
    { id: 97, nama: 'Kota Jambi', provinsi_id: 5 },
    { id: 98, nama: 'Kota Sungai Penuh', provinsi_id: 5 },

    // Sumatera Selatan (13 kabupaten, 4 kota)
    { id: 99, nama: 'Kabupaten Banyuasin', provinsi_id: 6 },
    { id: 100, nama: 'Kabupaten Empat Lawang', provinsi_id: 6 },
    { id: 101, nama: 'Kabupaten Lahat', provinsi_id: 6 },
    { id: 102, nama: 'Kabupaten Muara Enim', provinsi_id: 6 },
    { id: 103, nama: 'Kabupaten Musi Banyuasin', provinsi_id: 6 },
    { id: 104, nama: 'Kabupaten Musi Rawas', provinsi_id: 6 },
    { id: 105, nama: 'Kabupaten Musi Rawas Utara', provinsi_id: 6 },
    { id: 106, nama: 'Kabupaten Ogan Ilir', provinsi_id: 6 },
    { id: 107, nama: 'Kabupaten Ogan Komering Ilir', provinsi_id: 6 },
    { id: 108, nama: 'Kabupaten Ogan Komering Ulu', provinsi_id: 6 },
    { id: 109, nama: 'Kabupaten Ogan Komering Ulu Selatan', provinsi_id: 6 },
    { id: 110, nama: 'Kabupaten Ogan Komering Ulu Timur', provinsi_id: 6 },
    { id: 111, nama: 'Kabupaten Penukal Abab Lematang Ilir', provinsi_id: 6 },
    { id: 112, nama: 'Kota Lubuklinggau', provinsi_id: 6 },
    { id: 113, nama: 'Kota Pagar Alam', provinsi_id: 6 },
    { id: 114, nama: 'Kota Palembang', provinsi_id: 6 },
    { id: 115, nama: 'Kota Prabumulih', provinsi_id: 6 },

    // Bengkulu (9 kabupaten, 1 kota)
    { id: 116, nama: 'Kabupaten Bengkulu Selatan', provinsi_id: 7 },
    { id: 117, nama: 'Kabupaten Rejang Lebong', provinsi_id: 7 },
    { id: 118, nama: 'Kabupaten Bengkulu Utara', provinsi_id: 7 },
    { id: 119, nama: 'Kabupaten Kaur', provinsi_id: 7 },
    { id: 120, nama: 'Kabupaten Seluma', provinsi_id: 7 },
    { id: 121, nama: 'Kabupaten Mukomuko', provinsi_id: 7 },
    { id: 122, nama: 'Kabupaten Lebong', provinsi_id: 7 },
    { id: 123, nama: 'Kabupaten Kepahiang', provinsi_id: 7 },
    { id: 124, nama: 'Kabupaten Bengkulu Tengah', provinsi_id: 7 },
    { id: 125, nama: 'Kota Bengkulu', provinsi_id: 7 },

    // Lampung (13 kabupaten, 2 kota)
    { id: 126, nama: 'Kabupaten Lampung Tengah', provinsi_id: 8 },
    { id: 127, nama: 'Kabupaten Lampung Utara', provinsi_id: 8 },
    { id: 128, nama: 'Kabupaten Lampung Selatan', provinsi_id: 8 },
    { id: 129, nama: 'Kabupaten Lampung Barat', provinsi_id: 8 },
    { id: 130, nama: 'Kabupaten Lampung Timur', provinsi_id: 8 },
    { id: 131, nama: 'Kabupaten Mesuji', provinsi_id: 8 },
    { id: 132, nama: 'Kabupaten Pesawaran', provinsi_id: 8 },
    { id: 133, nama: 'Kabupaten Pesisir Barat', provinsi_id: 8 },
    { id: 134, nama: 'Kabupaten Pringsewu', provinsi_id: 8 },
    { id: 135, nama: 'Kabupaten Tulang Bawang', provinsi_id: 8 },
    { id: 136, nama: 'Kabupaten Tulang Bawang Barat', provinsi_id: 8 },
    { id: 137, nama: 'Kabupaten Tanggamus', provinsi_id: 8 },
    { id: 138, nama: 'Kabupaten Way Kanan', provinsi_id: 8 },
    { id: 139, nama: 'Kota Bandar Lampung', provinsi_id: 8 },
    { id: 140, nama: 'Kota Metro', provinsi_id: 8 },

    // Kepulauan Bangka Belitung (6 kabupaten, 1 kota)
    { id: 141, nama: 'Kabupaten Bangka', provinsi_id: 9 },
    { id: 142, nama: 'Kabupaten Bangka Barat', provinsi_id: 9 },
    { id: 143, nama: 'Kabupaten Bangka Selatan', provinsi_id: 9 },
    { id: 144, nama: 'Kabupaten Bangka Tengah', provinsi_id: 9 },
    { id: 145, nama: 'Kabupaten Belitung', provinsi_id: 9 },
    { id: 146, nama: 'Kabupaten Belitung Timur', provinsi_id: 9 },
    { id: 147, nama: 'Kota Pangkal Pinang', provinsi_id: 9 },

    // Kepulauan Riau (5 kabupaten, 2 kota)
    { id: 148, nama: 'Kabupaten Bintan', provinsi_id: 10 },
    { id: 149, nama: 'Kabupaten Karimun', provinsi_id: 10 },
    { id: 150, nama: 'Kabupaten Kepulauan Anambas', provinsi_id: 10 },
    { id: 151, nama: 'Kabupaten Lingga', provinsi_id: 10 },
    { id: 152, nama: 'Kabupaten Natuna', provinsi_id: 10 },
    { id: 153, nama: 'Kota Batam', provinsi_id: 10 },
    { id: 154, nama: 'Kota Tanjung Pinang', provinsi_id: 10 },

    // DKI Jakarta (1 kabupaten, 5 kota)
    { id: 155, nama: 'Kabupaten Kepulauan Seribu', provinsi_id: 11 },
    { id: 156, nama: 'Kota Jakarta Pusat', provinsi_id: 11 },
    { id: 157, nama: 'Kota Jakarta Utara', provinsi_id: 11 },
    { id: 158, nama: 'Kota Jakarta Barat', provinsi_id: 11 },
    { id: 159, nama: 'Kota Jakarta Selatan', provinsi_id: 11 },
    { id: 160, nama: 'Kota Jakarta Timur', provinsi_id: 11 },

    // Jawa Barat (18 kabupaten, 9 kota)
    { id: 161, nama: 'Kabupaten Bandung', provinsi_id: 12 },
    { id: 162, nama: 'Kabupaten Bandung Barat', provinsi_id: 12 },
    { id: 163, nama: 'Kabupaten Bekasi', provinsi_id: 12 },
    { id: 164, nama: 'Kabupaten Bogor', provinsi_id: 12 },
    { id: 165, nama: 'Kabupaten Ciamis', provinsi_id: 12 },
    { id: 166, nama: 'Kabupaten Cianjur', provinsi_id: 12 },
    { id: 167, nama: 'Kabupaten Cirebon', provinsi_id: 12 },
    { id: 168, nama: 'Kabupaten Garut', provinsi_id: 12 },
    { id: 169, nama: 'Kabupaten Indramayu', provinsi_id: 12 },
    { id: 170, nama: 'Kabupaten Karawang', provinsi_id: 12 },
    { id: 171, nama: 'Kabupaten Kuningan', provinsi_id: 12 },
    { id: 172, nama: 'Kabupaten Majalengka', provinsi_id: 12 },
    { id: 173, nama: 'Kabupaten Pangandaran', provinsi_id: 12 },
    { id: 174, nama: 'Kabupaten Purwakarta', provinsi_id: 12 },
    { id: 175, nama: 'Kabupaten Subang', provinsi_id: 12 },
    { id: 176, nama: 'Kabupaten Sukabumi', provinsi_id: 12 },
    { id: 177, nama: 'Kabupaten Sumedang', provinsi_id: 12 },
    { id: 178, nama: 'Kabupaten Tasikmalaya', provinsi_id: 12 },
    { id: 179, nama: 'Kota Bandung', provinsi_id: 12 },
    { id: 180, nama: 'Kota Banjar', provinsi_id: 12 },
    { id: 181, nama: 'Kota Bekasi', provinsi_id: 12 },
    { id: 182, nama: 'Kota Bogor', provinsi_id: 12 },
    { id: 183, nama: 'Kota Cimahi', provinsi_id: 12 },
    { id: 184, nama: 'Kota Cirebon', provinsi_id: 12 },
    { id: 185, nama: 'Kota Depok', provinsi_id: 12 },
    { id: 186, nama: 'Kota Sukabumi', provinsi_id: 12 },
    { id: 187, nama: 'Kota Tasikmalaya', provinsi_id: 12 },

    // Jawa Tengah (29 kabupaten, 6 kota)
    { id: 188, nama: 'Kabupaten Banjarnegara', provinsi_id: 13 },
    { id: 189, nama: 'Kabupaten Banyumas', provinsi_id: 13 },
    { id: 190, nama: 'Kabupaten Batang', provinsi_id: 13 },
    { id: 191, nama: 'Kabupaten Blora', provinsi_id: 13 },
    { id: 192, nama: 'Kabupaten Boyolali', provinsi_id: 13 },
    { id: 193, nama: 'Kabupaten Brebes', provinsi_id: 13 },
    { id: 194, nama: 'Kabupaten Cilacap', provinsi_id: 13 },
    { id: 195, nama: 'Kabupaten Demak', provinsi_id: 13 },
    { id: 196, nama: 'Kabupaten Grobogan', provinsi_id: 13 },
    { id: 197, nama: 'Kabupaten Jepara', provinsi_id: 13 },
    { id: 198, nama: 'Kabupaten Karanganyar', provinsi_id: 13 },
    { id: 199, nama: 'Kabupaten Kebumen', provinsi_id: 13 },
    { id: 200, nama: 'Kabupaten Kendal', provinsi_id: 13 },
    { id: 201, nama: 'Kabupaten Klaten', provinsi_id: 13 },
    { id: 202, nama: 'Kabupaten Kudus', provinsi_id: 13 },
    { id: 203, nama: 'Kabupaten Magelang', provinsi_id: 13 },
    { id: 204, nama: 'Kabupaten Pati', provinsi_id: 13 },
    { id: 205, nama: 'Kabupaten Pekalongan', provinsi_id: 13 },
    { id: 206, nama: 'Kabupaten Pemalang', provinsi_id: 13 },
    { id: 207, nama: 'Kabupaten Purbalingga', provinsi_id: 13 },
    { id: 208, nama: 'Kabupaten Purworejo', provinsi_id: 13 },
    { id: 209, nama: 'Kabupaten Rembang', provinsi_id: 13 },
    { id: 210, nama: 'Kabupaten Semarang', provinsi_id: 13 },
    { id: 211, nama: 'Kabupaten Sragen', provinsi_id: 13 },
    { id: 212, nama: 'Kabupaten Sukoharjo', provinsi_id: 13 },
    { id: 213, nama: 'Kabupaten Tegal', provinsi_id: 13 },
    { id: 214, nama: 'Kabupaten Temanggung', provinsi_id: 13 },
    { id: 215, nama: 'Kabupaten Wonogiri', provinsi_id: 13 },
    { id: 216, nama: 'Kabupaten Wonosobo', provinsi_id: 13 },
    { id: 217, nama: 'Kota Magelang', provinsi_id: 13 },
    { id: 218, nama: 'Kota Pekalongan', provinsi_id: 13 },
    { id: 219, nama: 'Kota Salatiga', provinsi_id: 13 },
    { id: 220, nama: 'Kota Semarang', provinsi_id: 13 },
    { id: 221, nama: 'Kota Surakarta', provinsi_id: 13 },
    { id: 222, nama: 'Kota Tegal', provinsi_id: 13 },

    // DI Yogyakarta (4 kabupaten, 1 kota)
    { id: 223, nama: 'Kabupaten Bantul', provinsi_id: 14 },
    { id: 224, nama: 'Kabupaten Sleman', provinsi_id: 14 },
    { id: 225, nama: 'Kabupaten Gunungkidul', provinsi_id: 14 },
    { id: 226, nama: 'Kabupaten Kulon Progo', provinsi_id: 14 },
    { id: 227, nama: 'Kota Yogyakarta', provinsi_id: 14 },

    // Jawa Timur (29 kabupaten, 9 kota)
    { id: 228, nama: 'Kabupaten Bangkalan', provinsi_id: 15 },
    { id: 229, nama: 'Kabupaten Banyuwangi', provinsi_id: 15 },
    { id: 230, nama: 'Kabupaten Blitar', provinsi_id: 15 },
    { id: 231, nama: 'Kabupaten Bojonegoro', provinsi_id: 15 },
    { id: 232, nama: 'Kabupaten Bondowoso', provinsi_id: 15 },
    { id: 233, nama: 'Kabupaten Gresik', provinsi_id: 15 },
    { id: 234, nama: 'Kabupaten Jember', provinsi_id: 15 },
    { id: 235, nama: 'Kabupaten Jombang', provinsi_id: 15 },
    { id: 236, nama: 'Kabupaten Kediri', provinsi_id: 15 },
    { id: 237, nama: 'Kabupaten Lamongan', provinsi_id: 15 },
    { id: 238, nama: 'Kabupaten Lumajang', provinsi_id: 15 },
    { id: 239, nama: 'Kabupaten Madiun', provinsi_id: 15 },
    { id: 240, nama: 'Kabupaten Magetan', provinsi_id: 15 },
    { id: 241, nama: 'Kabupaten Malang', provinsi_id: 15 },
    { id: 242, nama: 'Kabupaten Mojokerto', provinsi_id: 15 },
    { id: 243, nama: 'Kabupaten Nganjuk', provinsi_id: 15 },
    { id: 244, nama: 'Kabupaten Ngawi', provinsi_id: 15 },
    { id: 245, nama: 'Kabupaten Pacitan', provinsi_id: 15 },
    { id: 246, nama: 'Kabupaten Pamekasan', provinsi_id: 15 },
    { id: 247, nama: 'Kabupaten Pasuruan', provinsi_id: 15 },
    { id: 248, nama: 'Kabupaten Ponorogo', provinsi_id: 15 },
    { id: 249, nama: 'Kabupaten Probolinggo', provinsi_id: 15 },
    { id: 250, nama: 'Kabupaten Sampang', provinsi_id: 15 },
    { id: 251, nama: 'Kabupaten Sidoarjo', provinsi_id: 15 },
    { id: 252, nama: 'Kabupaten Situbondo', provinsi_id: 15 },
    { id: 253, nama: 'Kabupaten Sumenep', provinsi_id: 15 },
    { id: 254, nama: 'Kabupaten Trenggalek', provinsi_id: 15 },
    { id: 255, nama: 'Kabupaten Tuban', provinsi_id: 15 },
    { id: 256, nama: 'Kabupaten Tulungagung', provinsi_id: 15 },
    { id: 257, nama: 'Kota Batu', provinsi_id: 15 },
    { id: 258, nama: 'Kota Blitar', provinsi_id: 15 },
    { id: 259, nama: 'Kota Kediri', provinsi_id: 15 },
    { id: 260, nama: 'Kota Madiun', provinsi_id: 15 },
    { id: 261, nama: 'Kota Malang', provinsi_id: 15 },
    { id: 262, nama: 'Kota Mojokerto', provinsi_id: 15 },
    { id: 263, nama: 'Kota Pasuruan', provinsi_id: 15 },
    { id: 264, nama: 'Kota Probolinggo', provinsi_id: 15 },
    { id: 265, nama: 'Kota Surabaya', provinsi_id: 15 },

    // Banten (4 kabupaten, 4 kota)
    { id: 266, nama: 'Kabupaten Lebak', provinsi_id: 16 },
    { id: 267, nama: 'Kabupaten Pandeglang', provinsi_id: 16 },
    { id: 268, nama: 'Kabupaten Serang', provinsi_id: 16 },
    { id: 269, nama: 'Kabupaten Tangerang', provinsi_id: 16 },
    { id: 270, nama: 'Kota Cilegon', provinsi_id: 16 },
    { id: 271, nama: 'Kota Serang', provinsi_id: 16 },
    { id: 272, nama: 'Kota Tangerang', provinsi_id: 16 },
    { id: 273, nama: 'Kota Tangerang Selatan', provinsi_id: 16 },

    // Bali (8 kabupaten, 1 kota)
    { id: 274, nama: 'Kabupaten Badung', provinsi_id: 17 },
    { id: 275, nama: 'Kabupaten Bangli', provinsi_id: 17 },
    { id: 276, nama: 'Kabupaten Buleleng', provinsi_id: 17 },
    { id: 277, nama: 'Kabupaten Gianyar', provinsi_id: 17 },
    { id: 278, nama: 'Kabupaten Jembrana', provinsi_id: 17 },
    { id: 279, nama: 'Kabupaten Karangasem', provinsi_id: 17 },
    { id: 280, nama: 'Kabupaten Klungkung', provinsi_id: 17 },
    { id: 281, nama: 'Kabupaten Tabanan', provinsi_id: 17 },
    { id: 282, nama: 'Kota Denpasar', provinsi_id: 17 },

    // Nusa Tenggara Barat (8 kabupaten, 2 kota)
    { id: 283, nama: 'Kabupaten Bima', provinsi_id: 18 },
    { id: 284, nama: 'Kabupaten Dompu', provinsi_id: 18 },
    { id: 285, nama: 'Kabupaten Lombok Barat', provinsi_id: 18 },
    { id: 286, nama: 'Kabupaten Lombok Tengah', provinsi_id: 18 },
    { id: 287, nama: 'Kabupaten Lombok Timur', provinsi_id: 18 },
    { id: 288, nama: 'Kabupaten Lombok Utara', provinsi_id: 18 },
    { id: 289, nama: 'Kabupaten Sumbawa', provinsi_id: 18 },
    { id: 290, nama: 'Kabupaten Sumbawa Barat', provinsi_id: 18 },
    { id: 291, nama: 'Kota Bima', provinsi_id: 18 },
    { id: 292, nama: 'Kota Mataram', provinsi_id: 18 },

    // Nusa Tenggara Timur (21 kabupaten, 1 kota)
    { id: 293, nama: 'Kabupaten Alor', provinsi_id: 19 },
    { id: 294, nama: 'Kabupaten Belu', provinsi_id: 19 },
    { id: 295, nama: 'Kabupaten Ende', provinsi_id: 19 },
    { id: 296, nama: 'Kabupaten Flores Timur', provinsi_id: 19 },
    { id: 297, nama: 'Kabupaten Kupang', provinsi_id: 19 },
    { id: 298, nama: 'Kabupaten Lembata', provinsi_id: 19 },
    { id: 299, nama: 'Kabupaten Manggarai', provinsi_id: 19 },
    { id: 300, nama: 'Kabupaten Manggarai Barat', provinsi_id: 19 },
    { id: 301, nama: 'Kabupaten Manggarai Timur', provinsi_id: 19 },
    { id: 302, nama: 'Kabupaten Nagekeo', provinsi_id: 19 },
    { id: 303, nama: 'Kabupaten Ngada', provinsi_id: 19 },
    { id: 304, nama: 'Kabupaten Rote Ndao', provinsi_id: 19 },
    { id: 305, nama: 'Kabupaten Sabu Raijua', provinsi_id: 19 },
    { id: 306, nama: 'Kabupaten Sikka', provinsi_id: 19 },
    { id: 307, nama: 'Kabupaten Sumba Barat', provinsi_id: 19 },
    { id: 308, nama: 'Kabupaten Sumba Barat Daya', provinsi_id: 19 },
    { id: 309, nama: 'Kabupaten Sumba Tengah', provinsi_id: 19 },
    { id: 310, nama: 'Kabupaten Sumba Timur', provinsi_id: 19 },
    { id: 311, nama: 'Kabupaten Timor Tengah Selatan', provinsi_id: 19 },
    { id: 312, nama: 'Kabupaten Timor Tengah Utara', provinsi_id: 19 },
    { id: 313, nama: 'Kabupaten Malaka', provinsi_id: 19 },
    { id: 314, nama: 'Kota Kupang', provinsi_id: 19 },

    // Kalimantan Barat (12 kabupaten, 2 kota)
    { id: 315, nama: 'Kabupaten Bengkayang', provinsi_id: 20 },
    { id: 316, nama: 'Kabupaten Kapuas Hulu', provinsi_id: 20 },
    { id: 317, nama: 'Kabupaten Kayong Utara', provinsi_id: 20 },
    { id: 318, nama: 'Kabupaten Ketapang', provinsi_id: 20 },
    { id: 319, nama: 'Kabupaten Kubu Raya', provinsi_id: 20 },
    { id: 320, nama: 'Kabupaten Landak', provinsi_id: 20 },
    { id: 321, nama: 'Kabupaten Melawi', provinsi_id: 20 },
    { id: 322, nama: 'Kabupaten Mempawah', provinsi_id: 20 },
    { id: 323, nama: 'Kabupaten Sambas', provinsi_id: 20 },
    { id: 324, nama: 'Kabupaten Sanggau', provinsi_id: 20 },
    { id: 325, nama: 'Kabupaten Sekadau', provinsi_id: 20 },
    { id: 326, nama: 'Kabupaten Sintang', provinsi_id: 20 },
    { id: 327, nama: 'Kota Pontianak', provinsi_id: 20 },
    { id: 328, nama: 'Kota Singkawang', provinsi_id: 20 },

    // Kalimantan Tengah (13 kabupaten, 1 kota)
    { id: 329, nama: 'Kabupaten Barito Selatan', provinsi_id: 21 },
    { id: 330, nama: 'Kabupaten Barito Timur', provinsi_id: 21 },
    { id: 331, nama: 'Kabupaten Barito Utara', provinsi_id: 21 },
    { id: 332, nama: 'Kabupaten Gunung Mas', provinsi_id: 21 },
    { id: 333, nama: 'Kabupaten Kapuas', provinsi_id: 21 },
    { id: 334, nama: 'Kabupaten Katingan', provinsi_id: 21 },
    { id: 335, nama: 'Kabupaten Kotawaringin Barat', provinsi_id: 21 },
    { id: 336, nama: 'Kabupaten Kotawaringin Timur', provinsi_id: 21 },
    { id: 337, nama: 'Kabupaten Lamandau', provinsi_id: 21 },
    { id: 338, nama: 'Kabupaten Murung Raya', provinsi_id: 21 },
    { id: 339, nama: 'Kabupaten Pulang Pisau', provinsi_id: 21 },
    { id: 340, nama: 'Kabupaten Seruyan', provinsi_id: 21 },
    { id: 341, nama: 'Kabupaten Sukamara', provinsi_id: 21 },
    { id: 342, nama: 'Kota Palangka Raya', provinsi_id: 21 },

    // Kalimantan Selatan (11 kabupaten, 2 kota)
    { id: 343, nama: 'Kabupaten Balangan', provinsi_id: 22 },
    { id: 344, nama: 'Kabupaten Banjar', provinsi_id: 22 },
    { id: 345, nama: 'Kabupaten Barito Kuala', provinsi_id: 22 },
    { id: 346, nama: 'Kabupaten Hulu Sungai Selatan', provinsi_id: 22 },
    { id: 347, nama: 'Kabupaten Hulu Sungai Tengah', provinsi_id: 22 },
    { id: 348, nama: 'Kabupaten Hulu Sungai Utara', provinsi_id: 22 },
    { id: 349, nama: 'Kabupaten Kotabaru', provinsi_id: 22 },
    { id: 350, nama: 'Kabupaten Tabalong', provinsi_id: 22 },
    { id: 351, nama: 'Kabupaten Tanah Bumbu', provinsi_id: 22 },
    { id: 352, nama: 'Kabupaten Tanah Laut', provinsi_id: 22 },
    { id: 353, nama: 'Kabupaten Tapin', provinsi_id: 22 },
    { id: 354, nama: 'Kota Banjarbaru', provinsi_id: 22 },
    { id: 355, nama: 'Kota Banjarmasin', provinsi_id: 22 },

    // Kalimantan Timur (7 kabupaten, 3 kota)
    { id: 356, nama: 'Kabupaten Berau', provinsi_id: 23 },
    { id: 357, nama: 'Kabupaten Kutai Barat', provinsi_id: 23 },
    { id: 358, nama: 'Kabupaten Kutai Kartanegara', provinsi_id: 23 },
    { id: 359, nama: 'Kabupaten Kutai Timur', provinsi_id: 23 },
    { id: 360, nama: 'Kabupaten Mahakam Ulu', provinsi_id: 23 },
    { id: 361, nama: 'Kabupaten Paser', provinsi_id: 23 },
    { id: 362, nama: 'Kabupaten Penajam Paser Utara', provinsi_id: 23 },
    { id: 363, nama: 'Kota Balikpapan', provinsi_id: 23 },
    { id: 364, nama: 'Kota Bontang', provinsi_id: 23 },
    { id: 365, nama: 'Kota Samarinda', provinsi_id: 23 },

    // Kalimantan Utara (4 kabupaten, 1 kota)
    { id: 366, nama: 'Kabupaten Bulungan', provinsi_id: 24 },
    { id: 367, nama: 'Kabupaten Malinau', provinsi_id: 24 },
    { id: 368, nama: 'Kabupaten Nunukan', provinsi_id: 24 },
    { id: 369, nama: 'Kabupaten Tana Tidung', provinsi_id: 24 },
    { id: 370, nama: 'Kota Tarakan', provinsi_id: 24 },

    // Sulawesi Utara (11 kabupaten, 4 kota)
    { id: 371, nama: 'Kabupaten Bolaang Mongondow', provinsi_id: 25 },
    { id: 372, nama: 'Kabupaten Bolaang Mongondow Selatan', provinsi_id: 25 },
    { id: 373, nama: 'Kabupaten Bolaang Mongondow Timur', provinsi_id: 25 },
    { id: 374, nama: 'Kabupaten Bolaang Mongondow Utara', provinsi_id: 25 },
    { id: 375, nama: 'Kabupaten Kepulauan Sangihe', provinsi_id: 25 },
    { id: 376, nama: 'Kabupaten Kepulauan Siau Tagulandang Biaro', provinsi_id: 25 },
    { id: 377, nama: 'Kabupaten Kepulauan Talaud', provinsi_id: 25 },
    { id: 378, nama: 'Kabupaten Minahasa', provinsi_id: 25 },
    { id: 379, nama: 'Kabupaten Minahasa Selatan', provinsi_id: 25 },
    { id: 380, nama: 'Kabupaten Minahasa Tenggara', provinsi_id: 25 },
    { id: 381, nama: 'Kabupaten Minahasa Utara', provinsi_id: 25 },
    { id: 382, nama: 'Kota Bitung', provinsi_id: 25 },
    { id: 383, nama: 'Kota Kotamobagu', provinsi_id: 25 },
    { id: 384, nama: 'Kota Manado', provinsi_id: 25 },
    { id: 385, nama: 'Kota Tomohon', provinsi_id: 25 },

    // Sulawesi Tengah (12 kabupaten, 1 kota)
    { id: 386, nama: 'Kabupaten Banggai', provinsi_id: 26 },
    { id: 387, nama: 'Kabupaten Banggai Kepulauan', provinsi_id: 26 },
    { id: 388, nama: 'Kabupaten Banggai Laut', provinsi_id: 26 },
    { id: 389, nama: 'Kabupaten Buol', provinsi_id: 26 },
    { id: 390, nama: 'Kabupaten Donggala', provinsi_id: 26 },
    { id: 391, nama: 'Kabupaten Morowali', provinsi_id: 26 },
    { id: 392, nama: 'Kabupaten Morowali Utara', provinsi_id: 26 },
    { id: 393, nama: 'Kabupaten Parigi Moutong', provinsi_id: 26 },
    { id: 394, nama: 'Kabupaten Poso', provinsi_id: 26 },
    { id: 395, nama: 'Kabupaten Sigi', provinsi_id: 26 },
    { id: 396, nama: 'Kabupaten Tojo Una-Una', provinsi_id: 26 },
    { id: 397, nama: 'Kabupaten Tolitoli', provinsi_id: 26 },
    { id: 398, nama: 'Kota Palu', provinsi_id: 26 },

    // Sulawesi Selatan (21 kabupaten, 3 kota)
    { id: 399, nama: 'Kabupaten Bantaeng', provinsi_id: 27 },
    { id: 400, nama: 'Kabupaten Barru', provinsi_id: 27 },
    { id: 401, nama: 'Kabupaten Bone', provinsi_id: 27 },
    { id: 402, nama: 'Kabupaten Bulukumba', provinsi_id: 27 },
    { id: 403, nama: 'Kabupaten Enrekang', provinsi_id: 27 },
    { id: 404, nama: 'Kabupaten Gowa', provinsi_id: 27 },
    { id: 405, nama: 'Kabupaten Jeneponto', provinsi_id: 27 },
    { id: 406, nama: 'Kabupaten Kepulauan Selayar', provinsi_id: 27 },
    { id: 407, nama: 'Kabupaten Luwu', provinsi_id: 27 },
    { id: 408, nama: 'Kabupaten Luwu Timur', provinsi_id: 27 },
    { id: 409, nama: 'Kabupaten Luwu Utara', provinsi_id: 27 },
    { id: 410, nama: 'Kabupaten Maros', provinsi_id: 27 },
    { id: 411, nama: 'Kabupaten Pangkajene dan Kepulauan', provinsi_id: 27 },
    { id: 412, nama: 'Kabupaten Pinrang', provinsi_id: 27 },
    { id: 413, nama: 'Kabupaten Sidenreng Rappang', provinsi_id: 27 },
    { id: 414, nama: 'Kabupaten Sinjai', provinsi_id: 27 },
    { id: 415, nama: 'Kabupaten Soppeng', provinsi_id: 27 },
    { id: 416, nama: 'Kabupaten Takalar', provinsi_id: 27 },
    { id: 417, nama: 'Kabupaten Tana Toraja', provinsi_id: 27 },
    { id: 418, nama: 'Kabupaten Toraja Utara', provinsi_id: 27 },
    { id: 419, nama: 'Kabupaten Wajo', provinsi_id: 27 },
    { id: 420, nama: 'Kota Makassar', provinsi_id: 27 },
    { id: 421, nama: 'Kota Palopo', provinsi_id: 27 },
    { id: 422, nama: 'Kota Parepare', provinsi_id: 27 },

    // Sulawesi Tenggara (15 kabupaten, 2 kota)
    { id: 423, nama: 'Kabupaten Bombana', provinsi_id: 28 },
    { id: 424, nama: 'Kabupaten Buton', provinsi_id: 28 },
    { id: 425, nama: 'Kabupaten Buton Selatan', provinsi_id: 28 },
    { id: 426, nama: 'Kabupaten Buton Tengah', provinsi_id: 28 },
    { id: 427, nama: 'Kabupaten Buton Utara', provinsi_id: 28 },
    { id: 428, nama: 'Kabupaten Kolaka', provinsi_id: 28 },
    { id: 429, nama: 'Kabupaten Kolaka Timur', provinsi_id: 28 },
    { id: 430, nama: 'Kabupaten Kolaka Utara', provinsi_id: 28 },
    { id: 431, nama: 'Kabupaten Konawe', provinsi_id: 28 },
    { id: 432, nama: 'Kabupaten Konawe Kepulauan', provinsi_id: 28 },
    { id: 433, nama: 'Kabupaten Konawe Selatan', provinsi_id: 28 },
    { id: 434, nama: 'Kabupaten Konawe Utara', provinsi_id: 28 },
    { id: 435, nama: 'Kabupaten Muna', provinsi_id: 28 },
    { id: 436, nama: 'Kabupaten Muna Barat', provinsi_id: 28 },
    { id: 437, nama: 'Kabupaten Wakatobi', provinsi_id: 28 },
    { id: 438, nama: 'Kota Bau-Bau', provinsi_id: 28 },
    { id: 439, nama: 'Kota Kendari', provinsi_id: 28 },

    // Gorontalo (5 kabupaten, 1 kota)
    { id: 440, nama: 'Kabupaten Boalemo', provinsi_id: 29 },
    { id: 441, nama: 'Kabupaten Bone Bolango', provinsi_id: 29 },
    { id: 442, nama: 'Kabupaten Gorontalo', provinsi_id: 29 },
    { id: 443, nama: 'Kabupaten Gorontalo Utara', provinsi_id: 29 },
    { id: 444, nama: 'Kabupaten Pohuwato', provinsi_id: 29 },
    { id: 445, nama: 'Kota Gorontalo', provinsi_id: 29 },

    // Sulawesi Barat (6 kabupaten)
    { id: 446, nama: 'Kabupaten Majene', provinsi_id: 30 },
    { id: 447, nama: 'Kabupaten Mamasa', provinsi_id: 30 },
    { id: 448, nama: 'Kabupaten Mamuju', provinsi_id: 30 },
    { id: 449, nama: 'Kabupaten Mamuju Tengah', provinsi_id: 30 },
    { id: 450, nama: 'Kabupaten Mamuju Utara', provinsi_id: 30 },
    { id: 451, nama: 'Kabupaten Polewali Mandar', provinsi_id: 30 },

    // Maluku (9 kabupaten, 2 kota)
    { id: 452, nama: 'Kabupaten Buru', provinsi_id: 31 },
    { id: 453, nama: 'Kabupaten Buru Selatan', provinsi_id: 31 },
    { id: 454, nama: 'Kabupaten Kepulauan Aru', provinsi_id: 31 },
    { id: 455, nama: 'Kabupaten Maluku Barat Daya', provinsi_id: 31 },
    { id: 456, nama: 'Kabupaten Maluku Tengah', provinsi_id: 31 },
    { id: 457, nama: 'Kabupaten Maluku Tenggara', provinsi_id: 31 },
    { id: 458, nama: 'Kabupaten Maluku Tenggara Barat', provinsi_id: 31 },
    { id: 459, nama: 'Kabupaten Seram Bagian Barat', provinsi_id: 31 },
    { id: 460, nama: 'Kabupaten Seram Bagian Timur', provinsi_id: 31 },
    { id: 461, nama: 'Kota Ambon', provinsi_id: 31 },
    { id: 462, nama: 'Kota Tual', provinsi_id: 31 },
];

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
        status_ekonomi: 'miskin',
        penghasilan_bulanan: '',
        keterangan: ''
    });

    // State untuk dependent dropdown
    const [selectedProvinsi, setSelectedProvinsi] = useState<any>(null);
    const [availableKota, setAvailableKota] = useState<any[]>([]);

    const [keluargaId, setKeluargaId] = useState<number | null>(null);
    const [isFormSaved, setIsFormSaved] = useState<boolean>(false);
    const [showMapSection, setShowMapSection] = useState<boolean>(false);
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
    const [showMap, setShowMap] = useState(false);

    // Breadcrumb
    const breadcrumbs = [
        { label: 'Dashboard', href: route('dashboard') },
        { label: 'Data Keluarga', href: route('keluarga.index') },
        { label: 'Tambah Data', active: true }
    ];

    // Handle perubahan provinsi
    const handleProvinsiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinsiNama = e.target.value;
        setData('provinsi', provinsiNama);

        // Reset kota
        setData('kota', '');

        if (provinsiNama) {
            // Cari provinsi yang dipilih
            const provinsi = provinsiData.find(p => p.nama === provinsiNama);
            setSelectedProvinsi(provinsi || null);

            // Filter kota berdasarkan provinsi
            if (provinsi) {
                const filteredKota = kotaData.filter(k => k.provinsi_id === provinsi.id);
                setAvailableKota(filteredKota);
            } else {
                setAvailableKota([]);
            }
        } else {
            setSelectedProvinsi(null);
            setAvailableKota([]);
        }
    };

    // Handle perubahan kota
    const handleKotaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('kota', e.target.value);
    };

    // Handle submit form - INI YANG DIPERBAIKI
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('keluarga.store'), {
            onSuccess: (response: any) => {
                try {
                    let id = null;

                    if (response.props && response.props.keluarga && response.props.keluarga.id) {
                        id = response.props.keluarga.id;
                    } else if (response.keluarga && response.keluarga.id) {
                        id = response.keluarga.id;
                    } else if (response.props && response.props.flash && response.props.flash.keluarga_id) {
                        id = response.props.flash.keluarga_id;
                    }

                    if (id) {
                        setKeluargaId(id);
                        setIsFormSaved(true);
                        setShowMapSection(true);

                        setTimeout(() => {
                            const mapSection = document.getElementById('map-section');
                            if (mapSection) {
                                mapSection.scrollIntoView({ behavior: 'smooth' });
                            }
                        }, 100);
                    } else {
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
        console.log('Received point from map:', point); // Debug log

        if (point && point.lat && point.lng) {
          // Update form data dengan koordinat baru
          setData(prev => ({
            ...prev,
            latitude: point.lat.toString(),
            longitude: point.lng.toString()
          }));

          setCurrentLocation(point);

          // Jika keluarga sudah tersimpan, update koordinat di database
          if (keluargaId) {
            const updateData = {
              ...data,
              latitude: point.lat.toString(),
              longitude: point.lng.toString()
            };

            put(route('keluarga.update', keluargaId), {
                          ...updateData,
                          onSuccess: () => {
                            alert('Koordinat berhasil disimpan!');
                          },
                          onError: (errors: any) => {
                            console.error('Error updating coordinates:', errors);
                            alert('Terjadi kesalahan saat menyimpan koordinat');
                          }
                        });
          } else {
            // Jika belum ada keluargaId, tampilkan pesan
            alert('Koordinat berhasil ditentukan! Data akan disimpan saat form disubmit.');
          }
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

    const handleStartOver = () => {
        reset();
        setKeluargaId(null);
        setIsFormSaved(false);
        setShowMapSection(false);
        setCurrentLocation(null);
        setShowMap(false);
        clearErrors();
        setSelectedProvinsi(null);
        setAvailableKota([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFinish = () => {
        try {
            router.visit(route('keluarga.index'));
        } catch (error) {
            console.error('Error navigating:', error);
            window.location.href = route('keluarga.index');
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            breadcrumbs={breadcrumbs}
            header={
                <div className="flex items-center space-x-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full animate-pulse"></div>
                    <h2 className="font-light text-2xl text-gray-900">Tambah Data Keluarga</h2>
                </div>
            }
        >
            <Head title="Tambah Data Keluarga" />

            <div className="space-y-8">
                {/* Progress Indicator */}
                <div className="bg-white rounded-2xl border border-gray-100/50 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isFormSaved ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-r from-cyan-400 to-teal-500 text-white'
                            }`}>
                                {isFormSaved ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <span className="text-sm font-medium">1</span>
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Data Keluarga</p>
                                <p className="text-sm text-gray-500">
                                    {isFormSaved ? 'Tersimpan' : 'Isi informasi keluarga'}
                                </p>
                            </div>
                        </div>

                        <Link
                            href={route('keluarga.index')}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kembali
                        </Link>
                    </div>
                </div>

                {/* Form Data Keluarga */}
                <div className={`bg-white rounded-2xl border border-gray-100/50 overflow-hidden shadow-sm transition-all duration-500 ${
                    isFormSaved ? 'opacity-75' : 'opacity-100'
                }`}>
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Data KK Section */}
                            <div className="bg-gradient-to-r from-cyan-50/50 to-teal-50/50 border border-cyan-100/50 p-6 rounded-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-900">Data Kartu Keluarga</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <InputLabel htmlFor="no_kk" value="Nomor KK *" className="text-sm font-medium text-gray-700" />
                                        <TextInput
                                            id="no_kk"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                                            value={data.no_kk}
                                            onChange={(e) => setData('no_kk', e.target.value)}
                                            required
                                            disabled={isFormSaved}
                                            placeholder="16 digit nomor KK"
                                        />
                                        <InputError message={errors.no_kk} className="mt-1" />
                                    </div>

                                    <div className="space-y-2">
                                        <InputLabel htmlFor="nama_kepala_keluarga" value="Nama Kepala Keluarga *" className="text-sm font-medium text-gray-700" />
                                        <TextInput
                                            id="nama_kepala_keluarga"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                                            value={data.nama_kepala_keluarga}
                                            onChange={(e) => setData('nama_kepala_keluarga', e.target.value)}
                                            required
                                            disabled={isFormSaved}
                                            placeholder="Nama lengkap kepala keluarga"
                                        />
                                        <InputError message={errors.nama_kepala_keluarga} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Alamat Section dengan Dependent Dropdown */}
                            <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100/50 p-6 rounded-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-900">Alamat Lengkap</h4>
                                </div>

                                <div className="space-y-6">
                                    {/* Provinsi Dropdown */}
                                    <div className="space-y-2">
                                        <InputLabel htmlFor="provinsi" value="Provinsi *" className="text-sm font-medium text-gray-700" />
                                        <select
                                            id="provinsi"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                                            value={data.provinsi}
                                            onChange={handleProvinsiChange}
                                            required
                                            disabled={isFormSaved}
                                        >
                                            <option value="">Pilih Provinsi</option>
                                            {provinsiData.map((provinsi) => (
                                                <option key={provinsi.id} value={provinsi.nama}>
                                                    {provinsi.nama}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.provinsi} className="mt-1" />
                                    </div>

                                    {/* Kota/Kabupaten Dropdown */}
                                    <div className="space-y-2">
                                        <InputLabel htmlFor="kota" value="Kota/Kabupaten *" className="text-sm font-medium text-gray-700" />
                                        <select
                                            id="kota"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                                            value={data.kota}
                                            onChange={handleKotaChange}
                                            required
                                            disabled={isFormSaved || !selectedProvinsi}
                                        >
                                            <option value="">
                                                {selectedProvinsi ? 'Pilih Kota/Kabupaten' : 'Pilih Provinsi Terlebih Dahulu'}
                                            </option>
                                            {availableKota.map((kota) => (
                                                <option key={kota.id} value={kota.nama}>
                                                    {kota.nama}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.kota} className="mt-1" />
                                    </div>

                                    {/* Rest of address fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <InputLabel htmlFor="kecamatan" value="Kecamatan *" className="text-sm font-medium text-gray-700" />
                                            <TextInput
                                                id="kecamatan"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                                                value={data.kecamatan}
                                                onChange={(e) => setData('kecamatan', e.target.value)}
                                                disabled={isFormSaved}
                                                placeholder="Nama kecamatan"
                                                required
                                            />
                                            <InputError message={errors.kecamatan} className="mt-1" />
                                        </div>

                                        <div className="space-y-2">
                                            <InputLabel htmlFor="kelurahan" value="Kelurahan/Desa *" className="text-sm font-medium text-gray-700" />
                                            <TextInput
                                                id="kelurahan"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                                                value={data.kelurahan}
                                                onChange={(e) => setData('kelurahan', e.target.value)}
                                                disabled={isFormSaved}
                                                placeholder="Nama kelurahan/desa"
                                                required
                                            />
                                            <InputError message={errors.kelurahan} className="mt-1" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <InputLabel htmlFor="alamat" value="Alamat (Jalan dan Nomor) *" className="text-sm font-medium text-gray-700" />
                                        <textarea
                                            id="alamat"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                                            rows={3}
                                            value={data.alamat}
                                            onChange={(e) => setData('alamat', e.target.value)}
                                            required
                                            disabled={isFormSaved}
                                            placeholder="Nama jalan, nomor rumah, gang, dll"
                                        />
                                        <InputError message={errors.alamat} className="mt-1" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <InputLabel htmlFor="rt" value="RT" className="text-sm font-medium text-gray-700" />
                                            <TextInput
                                                id="rt"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                                                value={data.rt}
                                                onChange={(e) => setData('rt', e.target.value)}
                                                disabled={isFormSaved}
                                                placeholder="001"
                                            />
                                            <InputError message={errors.rt} className="mt-1" />
                                        </div>

                                        <div className="space-y-2">
                                            <InputLabel htmlFor="rw" value="RW" className="text-sm font-medium text-gray-700" />
                                            <TextInput
                                                id="rw"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                                                value={data.rw}
                                                onChange={(e) => setData('rw', e.target.value)}
                                                disabled={isFormSaved}
                                                placeholder="001"
                                            />
                                            <InputError message={errors.rw} className="mt-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Ekonomi Section */}
                            <div className="bg-gradient-to-r from-emerald-50/50 to-green-50/50 border border-emerald-100/50 p-6 rounded-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-900">Status Ekonomi</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <InputLabel htmlFor="status_ekonomi" value="Status Ekonomi *" className="text-sm font-medium text-gray-700" />
                                        <select
                                            id="status_ekonomi"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                                            value={data.status_ekonomi}
                                            onChange={(e) => setData('status_ekonomi', e.target.value)}
                                            required
                                            disabled={isFormSaved}
                                        >
                                            <option value="sangat_miskin">Sangat Miskin</option>
                                            <option value="miskin">Miskin</option>
                                            <option value="rentan_miskin">Rentan Miskin</option>
                                        </select>
                                        <InputError message={errors.status_ekonomi} className="mt-1" />
                                    </div>

                                    <div className="space-y-2">
                                        <InputLabel htmlFor="penghasilan_bulanan" value="Penghasilan Bulanan (Rp)" className="text-sm font-medium text-gray-700" />
                                        <TextInput
                                            id="penghasilan_bulanan"
                                            type="number"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                                            value={data.penghasilan_bulanan}
                                            onChange={(e) => setData('penghasilan_bulanan', e.target.value)}
                                            disabled={isFormSaved}
                                            placeholder="0"
                                            min="0"
                                        />
                                        <InputError message={errors.penghasilan_bulanan} className="mt-1" />
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2">
                                    <InputLabel htmlFor="keterangan" value="Keterangan" className="text-sm font-medium text-gray-700" />
                                    <textarea
                                        id="keterangan"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                                        rows={3}
                                        value={data.keterangan}
                                        onChange={(e) => setData('keterangan', e.target.value)}
                                        disabled={isFormSaved}
                                        placeholder="Keterangan tambahan (opsional)"
                                    />
                                    <InputError message={errors.keterangan} className="mt-1" />
                                </div>
                            </div>

                            {/* Submit Button */}
                            {!isFormSaved && (
                                <div className="flex items-center justify-end pt-6">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`inline-flex items-center px-8 py-3 font-medium rounded-lg transition-all duration-200 transform ${
                                            processing
                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
                                        }`}
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Simpan Data Keluarga
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Section Peta - Muncul setelah data tersimpan */}
                {showMapSection && keluargaId && (
                    <div id="map-section" className="bg-white rounded-2xl border border-gray-100/50 overflow-hidden shadow-sm animate-fadeIn">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                                    <h3 className="text-xl font-medium text-gray-900">Tentukan Lokasi pada Peta</h3>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-xl overflow-hidden" style={{ height: '500px' }}>
                                <MapDrawing keluargaId={keluargaId} onSave={handleMapPointSaved} />
                            </div>

                            <div className="flex items-center justify-between mt-6">
                                <button
                                    type="button"
                                    onClick={handleStartOver}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Tambah Keluarga Lain
                                </button>

                                <button
                                    onClick={handleFinish}
                                    className="px-8 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-cyan-200 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                                >
                                    Selesai & Lihat Daftar Keluarga
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {isFormSaved && (
                    <div className="bg-white rounded-2xl border border-gray-100/50 overflow-hidden shadow-sm animate-fadeIn">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700 font-medium">
                                        Data keluarga berhasil disimpan! {data.latitude && data.longitude ? 'Koordinat sudah ditentukan.' : 'Silakan tentukan koordinat lokasi pada peta di atas jika diperlukan.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom CSS untuk animasi */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
