<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'Laporan Koordinat' }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            line-height: 1.4;
            color: #334155;
            background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #0891b2;
            padding-bottom: 20px;
            background: linear-gradient(135deg, #0891b2 0%, #0d9488 100%);
            color: white;
            margin: -20px -20px 30px -20px;
            padding: 25px 20px 20px 20px;
            border-radius: 0 0 15px 15px;
        }

        .header h1 {
            margin: 0 0 8px 0;
            font-size: 22px;
            font-weight: 300;
            letter-spacing: 0.5px;
        }

        .header p {
            margin: 4px 0;
            opacity: 0.9;
            font-size: 13px;
        }

        .filter-info {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 25px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .filter-info h3 {
            color: #0f766e;
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
            background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #5eead4;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .statistics h3 {
            margin-top: 0;
            color: #0d9488;
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
            width: 50%;
            text-align: center;
            padding: 15px;
            background: white;
            margin: 0 5px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
            color: #0891b2;
            margin-bottom: 5px;
        }

        .stat-label {
            color: #64748b;
            font-size: 11px;
            font-weight: 500;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        th,
        td {
            border: 1px solid #e2e8f0;
            padding: 10px 8px;
            text-align: left;
            font-size: 10px;
        }

        th {
            background: linear-gradient(135deg, #0891b2 0%, #0d9488 100%);
            color: white;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        tr:nth-child(even) {
            background-color: #f8fafc;
        }

        tr:hover {
            background-color: #f1f5f9;
        }

        .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .status-complete {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            color: #065f46;
            border: 1px solid #34d399;
        }

        .status-incomplete {
            background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
            color: #dc2626;
            border: 1px solid #f87171;
        }

        .koordinat-text {
            font-family: 'Courier New', monospace;
            font-size: 9px;
            color: #0891b2;
            background: #f0f9ff;
            padding: 2px 4px;
            border-radius: 4px;
        }

        .footer {
            margin-top: 30px;
            text-align: center;
            color: #64748b;
            font-size: 10px;
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }

        .footer p {
            margin: 5px 0;
        }

        .footer .total {
            font-weight: bold;
            color: #0891b2;
            font-size: 11px;
        }

        .page-break {
            page-break-after: always;
        }

        .small-text {
            font-size: 9px;
            color: #64748b;
            font-style: italic;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $title ?? 'Laporan Kelengkapan Data Koordinat' }}</h1>
        <p>Sistem Informasi Geografis Data Keluarga</p>
        <p>Digenerate pada: {{ $generated_at ?? now()->format('d/m/Y H:i:s') }}</p>
    </div>

    {{-- Filter Information --}}
    @if(isset($filters) && is_array($filters) && array_filter($filters, function ($value) {
        return $value !== 'all'; }))
        <div class="filter-info">
            <h3>Filter yang Diterapkan:</h3>
            @foreach($filters as $key => $value)
                @if($value !== 'all')
                    <span class="filter-item">
                        <strong>{{ ucfirst(str_replace('_', ' ', $key)) }}:</strong> {{ $value }}
                    </span>
                @endif
            @endforeach
        </div>
    @endif

    {{-- Statistics Section --}}
    @if(isset($statistics) && is_array($statistics))
        <div class="statistics">
            <h3>Statistik Kelengkapan Koordinat</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-number">{{ $statistics['complete'] ?? 0 }}</div>
                    <div class="stat-label">Sudah Ada Koordinat</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ $statistics['incomplete'] ?? 0 }}</div>
                    <div class="stat-label">Belum Ada Koordinat</div>
                </div>
            </div>
        </div>
    @endif

    {{-- Data Table --}}
    @if(isset($data) && count($data) > 0)
        <table>
            <thead>
                <tr>
                    <th style="width: 8%">No</th>
                    <th style="width: 25%">Nama Keluarga</th>
                    <th style="width: 30%">Alamat</th>
                    <th style="width: 22%">Koordinat</th>
                    <th style="width: 15%">Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data as $index => $item)
                    @php
                        $koordinat = '';
                        $hasKoordinat = false;

                        if (!empty($item->lokasi) && preg_match('/^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$/', $item->lokasi)) {
                            $koordinat = $item->lokasi;
                            $hasKoordinat = true;
                        }
                    @endphp
                    <tr>
                        <td style="text-align: center; font-weight: bold;">{{ $index + 1 }}</td>
                        <td>
                            <strong>{{ $item->nama_keluarga ?? $item->nama_kepala_keluarga ?? '-' }}</strong>
                            @if(isset($item->no_kk) && $item->no_kk)
                                <br><span class="small-text">No. KK: {{ $item->no_kk }}</span>
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
                        </td>
                        <td style="text-align: center;">
                            @if($hasKoordinat)
                                <span class="koordinat-text">{{ $koordinat }}</span>
                            @else
                                <span class="small-text" style="color: #dc2626;">Belum diatur</span>
                            @endif
                        </td>
                        <td style="text-align: center;">
                            @if($hasKoordinat)
                                <span class="status-badge status-complete">Lengkap</span>
                            @else
                                <span class="status-badge status-incomplete">Belum Lengkap</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div style="text-align: center; padding: 40px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">Tidak ada data untuk ditampilkan.</p>
        </div>
    @endif

    <div class="footer">
        <p class="total">Total Data: {{ isset($data) ? count($data) : (isset($keluarga) ? $keluarga->count() : 0) }}
            keluarga</p>
        <p>Laporan ini digenerate secara otomatis oleh Sistem Informasi Geografis Data Keluarga</p>
        <p style="margin-top: 10px; font-size: 9px;">© {{ date('Y') }} - WebGIS Data Keluarga v1.0</p>
    </div>
</body>

</html>
