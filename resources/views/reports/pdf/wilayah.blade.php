<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'Laporan Sebaran Wilayah PKH' }}</title>
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

        .stat-list {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(6, 182, 212, 0.1);
        }

        .stat-row {
            display: table;
            width: 100%;
            border-bottom: 1px solid #bae6fd;
        }

        .stat-row:last-child {
            border-bottom: none;
        }

        .stat-row:nth-child(even) {
            background-color: #f0fdfa;
        }

        .stat-cell {
            display: table-cell;
            padding: 12px 15px;
            font-size: 11px;
            vertical-align: middle;
        }

        .stat-provinsi {
            font-weight: 600;
            color: #0e7490;
            width: 70%;
        }

        .stat-total {
            text-align: right;
            width: 30%;
            color: #06b6d4;
            font-weight: 600;
            background: #e0f2fe;
            border-radius: 4px;
            padding: 4px 8px;
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

        .location-badge {
            display: inline-block;
            background: linear-gradient(120deg, #a7f3d0 0%, #34d399 100%);
            color: #065f46;
            padding: 3px 8px;
            border-radius: 8px;
            font-size: 9px;
            font-weight: 600;
            border: 1px solid #34d399;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .status-badge {
            padding: 3px 6px;
            border-radius: 8px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-sangat-miskin {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #f87171;
        }

        .status-miskin {
            background: #fef3c7;
            color: #d97706;
            border: 1px solid #fbbf24;
        }

        .status-rentan-miskin {
            background: #dbeafe;
            color: #2563eb;
            border: 1px solid #60a5fa;
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

        .koordinat-info {
            font-family: 'Courier New', monospace;
            font-size: 8px;
            background: #f0f9ff;
            color: #0891b2;
            padding: 2px 4px;
            border-radius: 3px;
            border: 1px solid #bae6fd;
        }

        .highlight {
            color: #0e7490;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $title ?? 'Laporan Sebaran Wilayah PKH' }}</h1>
        <p>Program Keluarga Harapan (PKH) — Distribusi Geografis Penerima Bantuan</p>
        <p>Provinsi: {{ $filter_provinsi ?? 'Semua Provinsi' }} | Kota/Kabupaten:
            {{ $filter_kota ?? 'Semua Kota/Kabupaten' }}</p>
        <p>Digenerate pada: {{ $generated_at ?? now()->format('d/m/Y H:i:s') }}</p>
        <div class="badge">AQUA MODERN MINIMALIST</div>
    </div>

    {{-- PKH Information --}}
    <div class="pkh-info">
        <strong>Informasi PKH:</strong> Laporan ini menampilkan distribusi geografis keluarga penerima Program Keluarga
        Harapan (PKH)
        berdasarkan wilayah administratif. Data sebaran wilayah digunakan untuk monitoring dan evaluasi jangkauan
        program PKH.
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
                        <strong>{{ ucfirst(str_replace('_', ' ', $key)) }}:</strong> {{ $value }}
                    </span>
                @endif
            @endforeach
        </div>
    @endif

    {{-- Statistics Section --}}
    @if(isset($statistics) && count($statistics) > 0)
        <div class="statistics">
            <h3>Statistik Sebaran PKH Per Provinsi (Top 10)</h3>
            <div class="stat-list">
                @foreach($statistics->take(10) as $index => $stat)
                    <div class="stat-row">
                        <div class="stat-cell stat-provinsi">
                            <strong>{{ $index + 1 }}.</strong> {{ $stat->provinsi ?? '-' }}
                        </div>
                        <div class="stat-cell stat-total">{{ number_format($stat->total ?? 0) }} keluarga PKH</div>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    {{-- Data Table --}}
    @if((isset($data) && count($data) > 0) || (isset($keluarga) && count($keluarga) > 0))
        <table>
            <thead>
                <tr>
                    <th style="width: 6%">No</th>
                    <th style="width: 12%">No. KK</th>
                    <th style="width: 20%">Nama Keluarga</th>
                    <th style="width: 25%">Alamat</th>
                    <th style="width: 12%">Provinsi</th>
                    <th style="width: 12%">Kota/Kabupaten</th>
                    <th style="width: 8%">Kecamatan</th>
                    <th style="width: 5%">Status</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $dataToShow = $data ?? $keluarga ?? [];
                @endphp
                @foreach($dataToShow as $index => $item)
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
                                    @if(isset($item->rt) && isset($item->rw) && $item->rt && $item->rw)
                                        , RT {{ $item->rt }}/RW {{ $item->rw }}
                                    @endif
                                </span>
                            @endif
                            @if(isset($item->lokasi) && $item->lokasi)
                                <br><span class="koordinat-info">📍 {{ $item->lokasi }}</span>
                            @endif
                        </td>
                        <td style="text-align: center;">
                            @if(isset($item->provinsi) && $item->provinsi)
                                <span class="location-badge">{{ $item->provinsi }}</span>
                            @else
                                <span class="small-text">-</span>
                            @endif
                        </td>
                        <td style="text-align: center;">
                            @if(isset($item->kota) && $item->kota)
                                <span class="location-badge">{{ $item->kota }}</span>
                            @else
                                <span class="small-text">-</span>
                            @endif
                        </td>
                        <td style="text-align: center;">
                            @if(isset($item->kecamatan) && $item->kecamatan)
                                {{ $item->kecamatan }}
                            @else
                                <span class="small-text">-</span>
                            @endif
                        </td>
                        <td style="text-align: center;">
                            @if(isset($item->status_ekonomi) && $item->status_ekonomi)
                                @php
                                    $statusClass = 'status-' . str_replace(' ', '-', strtolower($item->status_ekonomi));
                                    $statusLabel = '';

                                    switch ($item->status_ekonomi) {
                                        case 'sangat_miskin':
                                            $statusLabel = 'SM';
                                            break;
                                        case 'miskin':
                                            $statusLabel = 'M';
                                            break;
                                        case 'rentan_miskin':
                                            $statusLabel = 'RM';
                                            break;
                                        default:
                                            $statusLabel = substr($item->status_ekonomi, 0, 2);
                                    }
                                @endphp
                                <span class="status-badge {{ $statusClass }}"
                                    title="{{ ucfirst(str_replace('_', ' ', $item->status_ekonomi)) }}">
                                    {{ $statusLabel }}
                                </span>
                            @else
                                <span class="small-text">-</span>
                            @endif
                        </td>
                    </tr>

                    {{-- Page break every 25 rows for better printing --}}
                    @if(($index + 1) % 25 == 0 && $index + 1 < count($dataToShow))
                            </tbody>
                        </table>
                        <div class="page-break"></div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 6%">No</th>
                                    <th style="width: 12%">No. KK</th>
                                    <th style="width: 20%">Nama Keluarga</th>
                                    <th style="width: 25%">Alamat</th>
                                    <th style="width: 12%">Provinsi</th>
                                    <th style="width: 12%">Kota/Kabupaten</th>
                                    <th style="width: 8%">Kecamatan</th>
                                    <th style="width: 5%">Status</th>
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
        <p class="total">Total Data: {{ isset($data) ? count($data) : (isset($keluarga) ? count($keluarga) : 0) }}
            keluarga penerima PKH</p>
        @if(isset($statistics) && count($statistics) > 0)
            <p>Sebaran Wilayah: {{ count($statistics) }} provinsi dengan penerima PKH terdaftar</p>
            <p>Provinsi Terbanyak: {{ $statistics->first()->provinsi ?? '-' }}
                ({{ number_format($statistics->first()->total ?? 0) }} keluarga)</p>
        @endif
        <p>Laporan ini digenerate secara otomatis oleh Sistem Informasi PKH</p>
        <p style="margin-top: 10px; font-size: 9px;">© {{ date('Y') }} - WebGIS Program Keluarga Harapan v2.0</p>
        @if(isset($filters['tahun']) && $filters['tahun'])
            <p style="font-size: 9px; color: #059669;">📅 Data berdasarkan tahun anggaran PKH: {{ $filters['tahun'] }}</p>
        @endif
    </div>
</body>

</html>