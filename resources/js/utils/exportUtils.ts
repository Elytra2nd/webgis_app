export interface ExportData {
    [key: string]: any;
}

export const exportToCsv = (filename: string, rows: ExportData[], headers?: string[]): void => {
    if (!rows || !rows.length) {
        return;
    }

    const separator: string = ",";
    const keys: string[] = Object.keys(rows[0]);
    let columnHeaders: string[];

    if (headers) {
        columnHeaders = headers;
    } else {
        columnHeaders = keys;
    }

    const csvContent =
        "sep=,\n" +
        columnHeaders.join(separator) +
        '\n' +
        rows.map(row => {
            return keys.map(k => {
                let cell = row[k] === null || row[k] === undefined ? '' : row[k];
                cell = cell instanceof Date
                    ? cell.toLocaleString('id-ID')
                    : cell.toString().replace(/"/g, '""');

                // Handle special characters for IE
                if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.userAgent.indexOf('Trident') !== -1) {
                    cell = cell.replace(/[^\x00-\x7F]/g, "");
                }

                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell}"`;
                }

                return cell;
            }).join(separator);
        }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // For IE 10+
    if ((navigator as any).msSaveBlob) {
        (navigator as any).msSaveBlob(blob, filename);
    } else {
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
};

export const formatDataForExport = (data: any[], category: string, filters: any) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

    switch (category) {
        case 'status-ekonomi':
            return {
                filename: `laporan-status-ekonomi-${timestamp}.csv`,
                headers: ['No', 'Nama Keluarga', 'Alamat', 'Status Ekonomi', 'Jumlah Anggota', 'Pendapatan', 'Tanggal Update'],
                data: data.map((item, index) => ({
                    no: index + 1,
                    nama_keluarga: item.nama_keluarga || '',
                    alamat: item.alamat || '',
                    status_ekonomi: item.status_ekonomi || '',
                    jumlah_anggota: item.jumlah_anggota || 0,
                    pendapatan: item.pendapatan || 0,
                    tanggal_update: item.updated_at ? new Date(item.updated_at).toLocaleDateString('id-ID') : ''
                }))
            };

        case 'wilayah':
            return {
                filename: `laporan-wilayah-${timestamp}.csv`,
                headers: ['No', 'Nama Keluarga', 'Provinsi', 'Kota/Kabupaten', 'Kecamatan', 'Kelurahan', 'RT/RW', 'Koordinat'],
                data: data.map((item, index) => ({
                    no: index + 1,
                    nama_keluarga: item.nama_keluarga || '',
                    provinsi: item.provinsi || '',
                    kota: item.kota || '',
                    kecamatan: item.kecamatan || '',
                    kelurahan: item.kelurahan || '',
                    rt_rw: `${item.rt || ''}/${item.rw || ''}`,
                    koordinat: item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : ''
                }))
            };

        case 'koordinat':
            return {
                filename: `laporan-koordinat-${timestamp}.csv`,
                headers: ['No', 'Nama Keluarga', 'Alamat', 'Latitude', 'Longitude', 'Status Koordinat', 'Tanggal Input'],
                data: data.map((item, index) => ({
                    no: index + 1,
                    nama_keluarga: item.nama_keluarga || '',
                    alamat: item.alamat || '',
                    latitude: item.latitude || '',
                    longitude: item.longitude || '',
                    status_koordinat: item.latitude && item.longitude ? 'Lengkap' : 'Belum Lengkap',
                    tanggal_input: item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : ''
                }))
            };

        default:
            return {
                filename: `laporan-${category}-${timestamp}.csv`,
                headers: Object.keys(data[0] || {}),
                data: data
            };
    }
};
