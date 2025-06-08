import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, FileSpreadsheet, Settings, Waves, Database, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: string;
    filters: any;
    title: string;
}

// Utility functions untuk export CSV
const exportToCsv = (filename: string, rows: any[], headers?: string[]): void => {
    if (!rows || !rows.length) {
        return;
    }

    const separator = ",";
    const keys = Object.keys(rows[0]);
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

                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell}"`;
                }

                return cell;
            }).join(separator);
        }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

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
            URL.revokeObjectURL(url);
        }
    }
};

const formatDataForExport = (data: any[], category: string, filters: any) => {
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
                    koordinat: item.lokasi || ''
                }))
            };

        case 'koordinat':
            return {
                filename: `laporan-koordinat-${timestamp}.csv`,
                headers: ['No', 'Nama Keluarga', 'Alamat', 'Latitude', 'Longitude', 'Status Koordinat', 'Tanggal Input'],
                data: data.map((item, index) => {
                    const koordinat = parseKoordinat(item.lokasi);
                    return {
                        no: index + 1,
                        nama_keluarga: item.nama_keluarga || '',
                        alamat: item.alamat || '',
                        latitude: koordinat.latitude || '',
                        longitude: koordinat.longitude || '',
                        status_koordinat: koordinat.latitude && koordinat.longitude ? 'Lengkap' : 'Belum Lengkap',
                        tanggal_input: item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : ''
                    };
                })
            };

        default:
            return {
                filename: `laporan-${category}-${timestamp}.csv`,
                headers: Object.keys(data[0] || {}),
                data: data
            };
    }
};

const parseKoordinat = (lokasi: string) => {
    if (!lokasi || !lokasi.match(/^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$/)) {
        return { latitude: '', longitude: '' };
    }

    const coords = lokasi.split(',');
    return {
        latitude: coords[0]?.trim() || '',
        longitude: coords[1]?.trim() || ''
    };
};

export default function ExportModal({ isOpen, onClose, category, filters, title }: ExportModalProps) {
    const [exportFormat, setExportFormat] = useState('pdf');
    const [exportOptions, setExportOptions] = useState({
        includeCharts: true,
        includeFilters: true,
        includeTimestamp: true,
        pageOrientation: 'landscape',
        // CSV specific options
        delimiter: 'comma',
        encoding: 'utf-8',
        includeHeaders: true
    });
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState('');

    const handleExport = async () => {
        setIsExporting(true);
        setExportError('');

        try {
            if (exportFormat === 'pdf') {
                // Handle PDF export - direct download
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = route('reports.export');
                form.style.display = 'none';

                // Add CSRF token
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                if (csrfToken) {
                    const csrfInput = document.createElement('input');
                    csrfInput.type = 'hidden';
                    csrfInput.name = '_token';
                    csrfInput.value = csrfToken;
                    form.appendChild(csrfInput);
                }

                // Add form data
                const formData = {
                    category,
                    filters: JSON.stringify(filters),
                    format: exportFormat,
                    options: JSON.stringify(exportOptions)
                };

                Object.entries(formData).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
                document.body.removeChild(form);

            } else {
                // Handle CSV export
                const response = await fetch(route('reports.export'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        category,
                        filters,
                        format: exportFormat,
                        options: exportOptions
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Gagal mengambil data untuk export');
                }

                const result = await response.json();

                if (result.success && result.data) {
                    const { filename, headers, data } = formatDataForExport(result.data, category, filters);

                    // Add filter information if enabled
                    if (exportOptions.includeFilters) {
                        const filterInfo = {
                            no: 'FILTER INFO',
                            nama_keluarga: `Kategori: ${category}`,
                            alamat: `Filter: ${JSON.stringify(filters)}`,
                            ...Object.fromEntries(headers.slice(3).map(h => [h.toLowerCase().replace(/\s+/g, '_'), '']))
                        };
                        data.unshift(filterInfo);
                        data.unshift({}); // Empty row for separation
                    }

                    // Export to CSV
                    exportToCsv(filename, data, exportOptions.includeHeaders ? headers : undefined);
                } else {
                    throw new Error(result.message || 'Gagal mengexport data');
                }
            }

            // Close modal after successful export
            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (error) {
            console.error('Export error:', error);
            setExportError(error instanceof Error ? error.message : 'Terjadi kesalahan saat export');
        } finally {
            setIsExporting(false);
        }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.8,
            y: 50
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: 50,
            transition: {
                duration: 0.2
            }
        }
    };

    const formatContentVariants = {
        hidden: {
            opacity: 0,
            x: 30,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 25,
                duration: 0.4
            }
        },
        exit: {
            opacity: 0,
            x: -30,
            scale: 0.95,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="relative w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <defs>
                                    <pattern id="waves-modal" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                        <path d="M0 10 Q5 0 10 10 T20 10" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                                    </pattern>
                                </defs>
                                <rect width="100" height="100" fill="url(#waves-modal)" className="text-teal-600"/>
                            </svg>
                        </div>

                        {/* Header */}
                        <div className="relative px-8 py-6 bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-cyan-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <motion.div
                                        className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center"
                                        whileHover={{ rotate: 10 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <Download className="w-4 h-4 text-white" />
                                    </motion.div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
                                        <p className="text-sm text-slate-600">Kustomisasi opsi export laporan</p>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-white/50 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X className="w-5 h-5 text-slate-600" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative px-8 py-6 space-y-6">
                            {/* Error Message */}
                            {exportError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <p className="text-red-700 text-sm">{exportError}</p>
                                </motion.div>
                            )}

                            {/* Format Selection */}
                            <div>
                                <h4 className="text-lg font-medium text-slate-800 mb-4 flex items-center">
                                    <Settings className="w-5 h-5 mr-2 text-teal-600" />
                                    Format Export
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.div
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            exportFormat === 'pdf'
                                                ? 'border-teal-500 bg-teal-50 shadow-lg'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                        onClick={() => setExportFormat('pdf')}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        layout
                                    >
                                        <div className="flex items-center space-x-3">
                                            <motion.div
                                                animate={{
                                                    rotate: exportFormat === 'pdf' ? [0, 5, -5, 0] : 0,
                                                    scale: exportFormat === 'pdf' ? 1.1 : 1
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <FileText className={`w-6 h-6 ${exportFormat === 'pdf' ? 'text-teal-600' : 'text-slate-400'}`} />
                                            </motion.div>
                                            <div>
                                                <h5 className="font-medium text-slate-800">PDF</h5>
                                                <p className="text-sm text-slate-600">Format presentasi</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            exportFormat === 'csv'
                                                ? 'border-teal-500 bg-teal-50 shadow-lg'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                        onClick={() => setExportFormat('csv')}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        layout
                                    >
                                        <div className="flex items-center space-x-3">
                                            <motion.div
                                                animate={{
                                                    rotate: exportFormat === 'csv' ? [0, 5, -5, 0] : 0,
                                                    scale: exportFormat === 'csv' ? 1.1 : 1
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <FileSpreadsheet className={`w-6 h-6 ${exportFormat === 'csv' ? 'text-teal-600' : 'text-slate-400'}`} />
                                            </motion.div>
                                            <div>
                                                <h5 className="font-medium text-slate-800">CSV</h5>
                                                <p className="text-sm text-slate-600">Data spreadsheet</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Export Options */}
                            <div>
                                <h4 className="text-lg font-medium text-slate-800 mb-4">Opsi Export</h4>
                                <div className="space-y-3">
                                    {exportFormat === 'pdf' && (
                                        <motion.label
                                            className="flex items-center space-x-3 cursor-pointer"
                                            whileHover={{ x: 5 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={exportOptions.includeCharts}
                                                onChange={(e) => setExportOptions({...exportOptions, includeCharts: e.target.checked})}
                                                className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                                            />
                                            <span className="text-slate-700">Sertakan grafik dan visualisasi</span>
                                        </motion.label>
                                    )}

                                    <motion.label
                                        className="flex items-center space-x-3 cursor-pointer"
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={exportOptions.includeFilters}
                                            onChange={(e) => setExportOptions({...exportOptions, includeFilters: e.target.checked})}
                                            className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                                        />
                                        <span className="text-slate-700">Sertakan informasi filter</span>
                                    </motion.label>

                                    <motion.label
                                        className="flex items-center space-x-3 cursor-pointer"
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={exportOptions.includeTimestamp}
                                            onChange={(e) => setExportOptions({...exportOptions, includeTimestamp: e.target.checked})}
                                            className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                                        />
                                        <span className="text-slate-700">Sertakan timestamp export</span>
                                    </motion.label>
                                </div>
                            </div>

                            {/* Format Specific Options with Smooth Transition */}
                            <div className="min-h-[120px]">
                                <AnimatePresence mode="wait">
                                    {exportFormat === 'pdf' ? (
                                        <motion.div
                                            key="pdf-options"
                                            variants={formatContentVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="space-y-4"
                                        >
                                            <div className="flex items-center space-x-2 mb-4">
                                                <FileText className="w-5 h-5 text-teal-600" />
                                                <h4 className="text-lg font-medium text-slate-800">Opsi PDF</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">Orientasi Halaman</label>
                                                    <select
                                                        value={exportOptions.pageOrientation}
                                                        onChange={(e) => setExportOptions({...exportOptions, pageOrientation: e.target.value})}
                                                        className="w-full border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                                    >
                                                        <option value="portrait">Portrait</option>
                                                        <option value="landscape">Landscape</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center justify-center">
                                                    <motion.div
                                                        className="w-16 h-20 border-2 border-teal-300 rounded-lg bg-teal-50 flex items-center justify-center"
                                                        animate={{
                                                            rotate: exportOptions.pageOrientation === 'landscape' ? 90 : 0
                                                        }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                    >
                                                        <FileText className="w-6 h-6 text-teal-600" />
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="csv-options"
                                            variants={formatContentVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="space-y-4"
                                        >
                                            <div className="flex items-center space-x-2 mb-4">
                                                <Database className="w-5 h-5 text-teal-600" />
                                                <h4 className="text-lg font-medium text-slate-800">Opsi CSV</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">Delimiter</label>
                                                    <select
                                                        value={exportOptions.delimiter}
                                                        onChange={(e) => setExportOptions({...exportOptions, delimiter: e.target.value})}
                                                        className="w-full border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                                    >
                                                        <option value="comma">Koma (,)</option>
                                                        <option value="semicolon">Titik Koma (;)</option>
                                                        <option value="tab">Tab</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">Encoding</label>
                                                    <select
                                                        value={exportOptions.encoding}
                                                        onChange={(e) => setExportOptions({...exportOptions, encoding: e.target.value})}
                                                        className="w-full border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                                    >
                                                        <option value="utf-8">UTF-8</option>
                                                        <option value="utf-16">UTF-16</option>
                                                        <option value="ascii">ASCII</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <motion.label
                                                className="flex items-center space-x-3 cursor-pointer"
                                                whileHover={{ x: 5 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={exportOptions.includeHeaders}
                                                    onChange={(e) => setExportOptions({...exportOptions, includeHeaders: e.target.checked})}
                                                    className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                                                />
                                                <span className="text-slate-700">Sertakan header kolom</span>
                                            </motion.label>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="relative px-8 py-6 bg-gradient-to-r from-slate-50 to-cyan-50 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-600">
                                    Export kategori: <span className="font-medium text-slate-800">{category}</span>
                                </div>
                                <div className="flex space-x-3">
                                    <motion.button
                                        onClick={onClose}
                                        className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Batal
                                    </motion.button>
                                    <motion.button
                                        onClick={handleExport}
                                        disabled={isExporting}
                                        className="px-8 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileHover={{ scale: isExporting ? 1 : 1.05 }}
                                        whileTap={{ scale: isExporting ? 1 : 0.95 }}
                                    >
                                        {isExporting ? (
                                            <div className="flex items-center space-x-2">
                                                <motion.div
                                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                                <span>Mengexport...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                {exportFormat === 'pdf' ? (
                                                    <FileText className="w-4 h-4" />
                                                ) : (
                                                    <FileSpreadsheet className="w-4 h-4" />
                                                )}
                                                <span>Export {exportFormat.toUpperCase()}</span>
                                            </div>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
