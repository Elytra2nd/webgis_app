<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'Laporan Status Ekonomi PKH' }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            color: #1e293b;
            background: #f0fdfa;
            margin: 0;
            padding: 0 0 24px 0;
        }

        .header {
            text-align: center;
            background: linear-gradient(120deg, #99f6e4 0%, #06b6d4 100%);
            color: #fff;
            padding: 36px 24px 24px 24px;
            border-radius: 0 0 32px 32px;
            margin-bottom: 32px;
        }

        .header h1 {
            margin: 0 0 8px 0;
            font-size: 24px;
            font-weight: 400;
            letter-spacing: 1px;
        }

        .header p {
            margin: 4px 0;
            font-size: 13px;
            opacity: 0.92;
        }

        .badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.18);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 18px;
            padding: 5px 16px;
            font-size: 11px;
            font-weight: 600;
            margin-top: 10px;
            letter-spacing: 0.5px;
        }

        .filter-info {
            background: #e0f2fe;
            border: 1px solid #7dd3fc;
            border-radius: 10px;
            padding: 14px;
            margin: 0 0 20px 0;
            color: #0369a1;
            font-size: 11px;
        }

        .filter-info h3 {
            color: #0e7490;
            font-size: 14px;
            margin: 0 0 10px 0;
            font-weight: 600;
        }

        .filter-item {
            display: inline-block;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 6px 12px;
            margin: 3px;
            font-size: 11px;
            color: #475569;
        }

        .statistics {
            margin-bottom: 25px;
            background: linear-gradient(120deg, #a7f3d0 0%, #e0f2fe 100%);
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #bae6fd;
            box-shadow: 0 2px 4px rgba(6, 182, 212, 0.04);
        }

        .statistics h3 {
            margin-top: 0;
            color: #0e7490;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
        }

        .stat-grid {
            display: table;
            width: 100%;
        }

        .stat-item {
            display: table-cell;
            width: 25%;
            text-align: center;
            padding: 15px;
            background: white;
            margin: 0 5px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(6, 182, 212, 0.1);
        }

        .stat-item:first-child {
            margin-left: 0;
        }

        .stat-item:last-child {
            margin-right: 0;
        }

        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #06b6d4;
            margin-bottom: 5px;
        }

        .stat-label {
            color: #64748b;
            font-size: 11px;
            font-weight: 500;
        }

        .stat-percentage {
            font-size: 10px;
            color: #059669;
            font-weight: 600;
            margin-top: 3px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(6, 182, 212, 0.04);
        }

        th,
        td {
            border: 1px solid #bae6fd;
            padding: 10px 8px;
            text-align: left;
            font-size: 10px;
        }

        th {
            background: #e0f2fe;
            color: #0e7490;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        tr:nth-child(even) {
            background-color: #f0fdfa;
        }

        tr:hover {
            background-color: #ccfbf1;
        }

        .status-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            display: inline-block;
        }

        .status-sangat-miskin {
            background: linear-gradient(120deg, #fef2f2 0%, #fecaca 100%);
            color: #dc2626;
            border: 1px solid #f87171;
        }

        .status-miskin {
            background: linear-gradient(120deg, #fef3c7 0%, #fde68a 100%);
            color: #d97706;
            border: 1px solid #fbbf24;
        }

        .status-rentan-miskin {
            background: linear-gradient(120deg, #dbeafe 0%, #bfdbfe 100%);
            color: #2563eb;
            border: 1px solid #60a5fa;
        }

        .currency {
            font-family: 'Courier New', monospace;
            font-size: 9px;
            color: #059669;
            background: #f0fdf4;
            padding: 2px 4px;
            border-radius: 4px;
        }

        .footer {
            margin-top: 30px;
            text-align: center;
            color: #64748b;
            font-size: 10px;
            background: #f0fdfa;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e0f2fe;
        }

        .footer p {
            margin: 5px 0;
        }

        .footer .total {
            font-weight: bold;
            color: #06b6d4;
            font-size: 11px;
        }

        .small-text {
            font-size: 9px;
            color: #64748b;
            font-style: italic;
        }

        .no-data {
            text-align: center;
            padding: 40px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }

        .page-break {
            page-break-after: always;
        }

        .pkh-info {
            background: linear-gradient(120deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            font-size: 11px;
            color: #1e40af;
        }

        .pkh-info strong {
            color: #1d4ed8;
        }

        .tahun-info {
            background: #e0f2fe;
            color: #0e7490;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 15px;
            border: 1px solid #06b6d4;
        }

        .no-kk {
            font-family: 'Courier New', monospace;
            font-size: 9px;
            background: #f1f5f9;
            padding: 2px 4px;
            border-radius: 3px;
            color: #475569;
        }

        .highlight {
            color: #0e7490;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $title ?? 'Laporan Status Ekonomi Keluarga PKH' }}</h1>
        <p>Program Keluarga Harapan (PKH) — Sistem Informasi Geografis</p>
        <p>Digenerate pada: {{ $generated_at ?? now()->format('d/m/Y H:i:s') }}</p>
        <div class="badge">AQUA MODERN MINIMALIST</div>
    </div>

    {{-- PKH Information --}}
    <div class="pkh-info">
        <strong>Informasi PKH:</strong> Laporan ini menampilkan distribusi status ekonomi keluarga penerima Program
        Keluarga Harapan (PKH).
        Data status ekonomi digunakan untuk menentukan prioritas bantuan dan monitoring kesejahteraan keluarga.
    </div>

    {{-- Tahun Information --}}
    @if(isset($filters['tahun']) && $filters['tahun'])
        <div class="tahun-info">
            📅 Tahun Anggaran PKH: {{ $filters['tahun'] }}
        </div>
    @endif

    {{-- Filter Information --}}
    @if(
            isset($filters) && is_array($filters) && array_filter($filters, function ($value) {
                return $value !== 'all' && $value !== null;
            })
        )
        <div class="filter-info">
            <h3>Filter yang Diterapkan:</h3>
            @foreach($filters as $key => $value)
                @if($value !== 'all' && $value !== null)
                    <span class="filter-item">
                        <strong>{{ ucfirst(str_replace('_', ' ', $key)) }}:</strong>
                        @if($key === 'status')
                            @if($value === 'sangat_miskin')
                                Sangat Miskin
                            @elseif($value === 'miskin')
                                Miskin
                            @elseif($value === 'rentan_miskin')
                                Rentan Miskin
                            @else
                                {{ $value }}
                            @endif
                        @else
                            {{ $value }}
                        @endif
                    </span>
                @endif
            @endforeach
        </div>
    @endif

    {{-- Statistics Section --}}
    @if(isset($statistics) && is_array($statistics))
        <div class="statistics">
            <h3>Statistik Status Ekonomi PKH</h3>
            <div class="stat-grid">
                @php
                    $total = ($statistics['sangat_miskin'] ?? 0) + ($statistics['miskin'] ?? 0) + ($statistics['rentan_miskin'] ?? 0);
                @endphp
                <div class="stat-item">
                    <div class="stat-number">{{ $total }}</div>
                    <div class="stat-label">Total Keluarga PKH</div>
                    <div class="stat-percentage">100%</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ $statistics['sangat_miskin'] ?? 0 }}</div>
                    <div class="stat-label">Sangat Miskin</div>
                    <div class="stat-percentage">
                        {{ $total > 0 ? round(($statistics['sangat_miskin'] / $total) * 100, 1) : 0 }}%</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ $statistics['miskin'] ?? 0 }}</div>
                    <div class="stat-label">Miskin</div>
                    <div class="stat-percentage">{{ $total > 0 ? round(($statistics['miskin'] / $total) * 100, 1) : 0 }}%
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ $statistics['rentan_miskin'] ?? 0 }}</div>
                    <div class="stat-label">Rentan Miskin</div>
                    <div class="stat-percentage">
                        {{ $total > 0 ? round(($statistics['rentan_miskin'] / $total) * 100, 1) : 0 }}%</div>
                </div>
            </div>
        </div>
    @endif

    {{-- Data Table --}}
    @if(isset($data) && count($data) > 0)
        <table>
            <thead>
                <tr>
                    <th style="width: 6%">No</th>
                    <th style="width: 12%">No. KK</th>
                    <th style="width: 22%">Nama Keluarga</th>
                    <th style="width: 28%">Alamat</th>
                    <th style="width: 15%">Status Ekonomi</th>
                    <th style="width: 8%">Anggota</th>
                    <th style="width: 9%">Pendapatan</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data as $index => $item)
                    @php
                        $statusClass = 'status-' . str_replace(' ', '-', strtolower($item->status_ekonomi ?? ''));
                        $statusLabel = '';

                        switch ($item->status_ekonomi ?? '') {
                            case 'sangat_miskin':
                                $statusLabel = 'Sangat Miskin';
                                break;
                            case 'miskin':
                                $statusLabel = 'Miskin';
                                break;
                            case 'rentan_miskin':
                                $statusLabel = 'Rentan Miskin';
                                break;
                            default:
                                $statusLabel = ucfirst(str_replace('_', ' ', $item->status_ekonomi ?? '-'));
                        }
                    @endphp
                    <tr>
                        <td style="text-align: center; font-weight: bold;">{{ $index + 1 }}</td>
                        <td style="text-align: center;">
                            @if(isset($item->no_kk) && $item->no_kk)
                                <span class="no-kk">{{ $item->no_kk }}</span>
                            @else
                                <span class="small-text">-</span>
                            @endif
                        </td>
                        <td>
                            <strong>{{ $item->nama_keluarga ?? $item->nama_kepala_keluarga ?? '-' }}</strong>
                            @if(isset($item->jumlah_anggota) && $item->jumlah_anggota)
                                <br><span class="small-text">👥 {{ $item->jumlah_anggota }} anggota</span>
                            @endif
                        </td>
                        <td>
                            {{ $item->alamat ?? '-' }}
                            @if(isset($item->kelurahan) && $item->kelurahan)
                                <br><span class="small-text">{{ $item->kelurahan }}
                                    @if(isset($item->kecamatan) && $item->kecamatan)
                                        , {{ $item->kecamatan }}
                                    @endif
                                </span>
                            @endif
                            @if(isset($item->kota) && $item->kota)
                                <br><span class="small-text">{{ $item->kota }}
                                    @if(isset($item->provinsi) && $item->provinsi)
                                        , {{ $item->provinsi }}
                                    @endif
                                </span>
                            @endif
                        </td>
                        <td style="text-align: center;">
                            <span class="status-badge {{ $statusClass }}">
                                {{ $statusLabel }}
                            </span>
                        </td>
                        <td style="text-align: center;">
                            @if(isset($item->jumlah_anggota) && $item->jumlah_anggota)
                                <strong>{{ $item->jumlah_anggota }}</strong>
                                <br><span class="small-text">orang</span>
                            @else
                                <span class="small-text">-</span>
                            @endif
                        </td>
                        <td style="text-align: center;">
                            @if(isset($item->penghasilan_bulanan) && $item->penghasilan_bulanan)
                                <span class="currency">{{ number_format($item->penghasilan_bulanan, 0, ',', '.') }}</span>
                                <br><span class="small-text">/bulan</span>
                            @elseif(isset($item->pendapatan) && $item->pendapatan)
                                <span class="currency">{{ number_format($item->pendapatan, 0, ',', '.') }}</span>
                                <br><span class="small-text">/bulan</span>
                            @else
                                <span class="small-text">Tidak ada data</span>
                            @endif
                        </td>
                    </tr>

                    {{-- Page break every 25 rows for better printing --}}
                    @if(($index + 1) % 25 == 0 && $index + 1 < count($data))
                            </tbody>
                        </table>
                        <div class="page-break"></div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 6%">No</th>
                                    <th style="width: 12%">No. KK</th>
                                    <th style="width: 22%">Nama Keluarga</th>
                                    <th style="width: 28%">Alamat</th>
                                    <th style="width: 15%">Status Ekonomi</th>
                                    <th style="width: 8%">Anggota</th>
                                    <th style="width: 9%">Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody>
                    @endif
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-data">
            <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">Tidak ada data keluarga PKH untuk ditampilkan.
            </p>
            <p style="margin: 0; color: #94a3b8;">Coba ubah filter atau periksa data di sistem.</p>
        </div>
    @endif

    <div class="footer">
        <p class="total">Total Data: {{ isset($data) ? count($data) : (isset($keluarga) ? $keluarga->count() : 0) }}
            keluarga penerima PKH</p>
        @if(isset($statistics) && is_array($statistics))
            @php
                $total = ($statistics['sangat_miskin'] ?? 0) + ($statistics['miskin'] ?? 0) + ($statistics['rentan_miskin'] ?? 0);
            @endphp
            <p>Distribusi Status Ekonomi: Sangat Miskin ({{ $statistics['sangat_miskin'] ?? 0 }}), Miskin
                ({{ $statistics['miskin'] ?? 0 }}), Rentan Miskin ({{ $statistics['rentan_miskin'] ?? 0 }})</p>
        @endif
        <p>Laporan ini digenerate secara otomatis oleh Sistem Informasi PKH</p>
        <p style="margin-top: 10px; font-size: 9px;">© {{ date('Y') }} - WebGIS Program Keluarga Harapan v2.0</p>
        @if(isset($filters['tahun']) && $filters['tahun'])
            <p style="font-size: 9px; color: #059669;">📅 Data berdasarkan tahun anggaran PKH: {{ $filters['tahun'] }}</p>
        @endif
    </div>
</body>

</html>