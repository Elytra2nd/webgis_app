import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, FileSpreadsheet, Settings, AlertCircle, Shield, Globe } from 'lucide-react';

// Interface untuk public export modal
interface PublicExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: any;
    statistik?: any;
    category: string;
    title: string;
}

export default function PublicExportModal({ 
    isOpen, 
    onClose, 
    filters, 
    statistik, 
    category, 
    title 
}: PublicExportModalProps) {
    const [exportFormat, setExportFormat] = useState('pdf');
    const [exportOptions, setExportOptions] = useState({
        includeStatistics: true,
        includeFilters: true,
        includeTimestamp: true,
        pageOrientation: 'landscape',
        anonymizeData: true, // Khusus untuk public export
        includePrivacyNotice: true // Khusus untuk public export
    });
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState('');

    const handleExport = async () => {
        setIsExporting(true);
        setExportError('');

        try {
            // PERBAIKAN: Gunakan route public untuk export
            const exportRoute = 'keluarga.export'; // Route public

            if (exportFormat === 'pdf') {
                // Form submission untuk PDF export ke route public
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = route(exportRoute);
                form.target = '_blank';

                // Add CSRF token
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_token';
                csrfInput.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                form.appendChild(csrfInput);

                // Add form data untuk public export
                const formData = {
                    format: exportFormat,
                    filters: JSON.stringify(filters),
                    options: JSON.stringify(exportOptions),
                    category: 'public-pkh'
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

                setTimeout(() => onClose(), 1000);

            } else {
                // CSV export untuk public
                const response = await fetch(route(exportRoute), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/octet-stream',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        format: exportFormat,
                        filters,
                        options: exportOptions,
                        category: 'public-pkh'
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error('Gagal mengambil data untuk export');
                }

                // Handle CSV download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `data-pkh-public-${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                setTimeout(() => onClose(), 1000);
            }

        } catch (error) {
            console.error('Export error:', error);
            setExportError(error instanceof Error ? error.message : 'Terjadi kesalahan saat export');
        } finally {
            setIsExporting(false);
        }
    };

    // Animation variants
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
                                    <pattern id="waves-public-modal" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                        <path d="M0 10 Q5 0 10 10 T20 10" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                                    </pattern>
                                </defs>
                                <rect width="100" height="100" fill="url(#waves-public-modal)" className="text-green-600"/>
                            </svg>
                        </div>

                        {/* Header */}
                        <div className="relative px-8 py-6 bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <motion.div
                                        className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center"
                                        whileHover={{ rotate: 10 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <Download className="w-4 h-4 text-white" />
                                    </motion.div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800">Export Data PKH Publik</h3>
                                        <p className="text-sm text-slate-600">Download data transparan Program Keluarga Harapan</p>
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
                            {/* Privacy Notice */}
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3">
                                <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                                <div>
                                    <p className="text-blue-800 text-sm font-medium mb-1">Perlindungan Data Pribadi</p>
                                    <p className="text-blue-700 text-xs">
                                        Data yang diexport telah dianonimkan untuk melindungi privasi. 
                                        Informasi sensitif seperti nama lengkap dan nomor KK telah disamarkan.
                                    </p>
                                </div>
                            </div>

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
                                    <Settings className="w-5 h-5 mr-2 text-green-600" />
                                    Format Export
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.div
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            exportFormat === 'pdf'
                                                ? 'border-green-500 bg-green-50 shadow-lg'
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
                                                <FileText className={`w-6 h-6 ${exportFormat === 'pdf' ? 'text-green-600' : 'text-slate-400'}`} />
                                            </motion.div>
                                            <div>
                                                <h5 className="font-medium text-slate-800">PDF</h5>
                                                <p className="text-sm text-slate-600">Format laporan</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            exportFormat === 'csv'
                                                ? 'border-green-500 bg-green-50 shadow-lg'
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
                                                <FileSpreadsheet className={`w-6 h-6 ${exportFormat === 'csv' ? 'text-green-600' : 'text-slate-400'}`} />
                                            </motion.div>
                                            <div>
                                                <h5 className="font-medium text-slate-800">CSV</h5>
                                                <p className="text-sm text-slate-600">Data spreadsheet</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Export Options untuk Public */}
                            <div>
                                <h4 className="text-lg font-medium text-slate-800 mb-4">Opsi Export Publik</h4>
                                <div className="space-y-3">
                                    <motion.label
                                        className="flex items-center space-x-3 cursor-pointer"
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={exportOptions.includeStatistics}
                                            onChange={(e) => setExportOptions({...exportOptions, includeStatistics: e.target.checked})}
                                            className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                                        />
                                        <span className="text-slate-700">Sertakan statistik PKH</span>
                                    </motion.label>

                                    <motion.label
                                        className="flex items-center space-x-3 cursor-pointer"
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={exportOptions.includeFilters}
                                            onChange={(e) => setExportOptions({...exportOptions, includeFilters: e.target.checked})}
                                            className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
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
                                            className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                                        />
                                        <span className="text-slate-700">Sertakan timestamp export</span>
                                    </motion.label>

                                    <motion.label
                                        className="flex items-center space-x-3 cursor-pointer opacity-50"
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={exportOptions.anonymizeData}
                                            disabled={true}
                                            className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                                        />
                                        <span className="text-slate-700">Anonimkan data pribadi (wajib)</span>
                                    </motion.label>

                                    <motion.label
                                        className="flex items-center space-x-3 cursor-pointer"
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={exportOptions.includePrivacyNotice}
                                            onChange={(e) => setExportOptions({...exportOptions, includePrivacyNotice: e.target.checked})}
                                            className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                                        />
                                        <span className="text-slate-700">Sertakan pemberitahuan privasi</span>
                                    </motion.label>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="relative px-8 py-6 bg-gradient-to-r from-slate-50 to-green-50 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-600 flex items-center space-x-2">
                                    <Globe className="w-4 h-4" />
                                    <span>Export data: <span className="font-medium text-slate-800">PKH Publik Transparan</span></span>
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
                                        className="px-8 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
