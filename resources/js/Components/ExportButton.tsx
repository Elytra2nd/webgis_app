// resources/js/Components/ExportButton.tsx
import React, { useState } from 'react';

interface ExportButtonProps {
  category: string;
  filters?: Record<string, any>;
  className?: string;
  children?: React.ReactNode;
}

export default function ExportButton({
  category,
  filters = {},
  className = '',
  children
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });

      // Create export URL
      const exportUrl = route('reports.export', { category }) +
        (params.toString() ? '?' + params.toString() : '');

      // Open in new window for download
      window.open(exportUrl, '_blank');

    } catch (error) {
      console.error('Export error:', error);
      alert('Terjadi kesalahan saat export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isExporting ? (
        <>
          <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Mengexport...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {children || 'Export PDF'}
        </>
      )}
    </button>
  );
}
