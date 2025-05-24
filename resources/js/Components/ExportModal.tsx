// resources/js/Components/ExportModal.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  filters?: Record<string, any>;
  title?: string;
}

export default function ExportModal({
  isOpen,
  onClose,
  category,
  filters = {},
  title = 'Export Laporan'
}: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();

      // Add filters
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });

      // Add export options
      params.append('format', exportFormat);
      params.append('include_statistics', includeStatistics.toString());

      // Add date range if specified
      if (dateRange.start) {
        params.append('date_start', dateRange.start);
      }
      if (dateRange.end) {
        params.append('date_end', dateRange.end);
      }

      // Create export URL
      const exportUrl = route('reports.export', { category }) +
        (params.toString() ? '?' + params.toString() : '');

      // Open in new window for download
      window.open(exportUrl, '_blank');

      // Show success message
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Export error:', error);
      alert('Terjadi kesalahan saat export data');
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: '📄' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: '📊' },
    { value: 'csv', label: 'CSV File', icon: '📋' }
  ];

  const getCategoryTitle = () => {
    const categoryMap: { [key: string]: string } = {
      'status-ekonomi': 'Status Ekonomi',
      'wilayah': 'Wilayah',
      'koordinat': 'Koordinat'
    };
    return categoryMap[category] || category;
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl transform animate-slideUp">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">Laporan {getCategoryTitle()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Format Export
            </label>
            <div className="grid grid-cols-1 gap-2">
              {formatOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    exportFormat === option.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={exportFormat === option.value}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-lg mr-3">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                  {exportFormat === option.value && (
                    <svg className="w-5 h-5 ml-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Opsi Export
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeStatistics}
                  onChange={(e) => setIncludeStatistics(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-gray-700">Sertakan statistik</span>
              </label>
            </div>
          </div>

          {/* Date Range (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rentang Tanggal (Opsional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Dari</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sampai</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Current Filters Display */}
          {Object.keys(filters).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Aktif
              </label>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, value]) => (
                    value && value !== 'all' && (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full"
                      >
                        {key}: {value}
                      </span>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              {isExporting ? (
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Mengexport...
                </div>
              ) : (
                'Export Sekarang'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>,
    document.body
  );
}
