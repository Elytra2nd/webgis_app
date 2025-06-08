<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'Laporan Data Keluarga Per Wilayah' }}</title>
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

        .stat-list {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-row {
            display: table;
            width: 100%;
            border-bottom: 1px solid #e2e8f0;
        }

        .stat-row:last-child {
            border-bottom: none;
        }

        .stat-cell {
            display: table-cell;
            padding: 12px 15px;
            font-size: 11px;
            vertical-align: middle;
        }

        .stat-provinsi {
            font-weight: 600;
            color: #0d9488;
            width: 70%;
        }

        .stat-total {
            text-align: right;
            width: 30%;
            color: #0891b2;
            font-weight: 600;
            background: #f0f9ff;
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

        .location-badge {
            display: inline-block;
            background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
            color: #0369a1;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 9px;
            font-weight: 500;
            border: 1px solid #7dd3fc;
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
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $title ?? 'Laporan Data Keluarga Per Wilayah' }}</h1>
        <p>Provinsi: {{ $filter_provinsi ?? 'Semua Provinsi' }} | Kota/Kabupaten:
            {{ $filter_kota ?? 'Semua Kota/Kabupaten' }}</p>
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
    @if(isset($statistics) && count($statistics) > 0)
        <div class="statistics">
            <h3>Statistik Per Provinsi (Top 10)</h3>
            <div class="stat-list">
                @foreach($statistics->take(10) as $stat)
                    <div class="stat-row">
                        <div class="stat-cell stat-provinsi">{{ $stat->provinsi ?? '-' }}</div>
                        <div class="stat-cell stat-total">{{ $stat->total ?? 0 }} keluarga</div>
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
                    <th style="width: 8%">No</th>
                    <th style="width: 22%">Nama Keluarga</th>
                    <th style="width: 28%">Alamat</th>
                    <th style="width: 16%">Provinsi</th>
                    <th style="width: 16%">Kota/Kabupaten</th>
                    <th style="width: 10%">Kecamatan</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $dataToShow = $data ?? $keluarga ?? [];
                @endphp
                @foreach($dataToShow as $index => $item)
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
                                    @if(isset($item->rt) && isset($item->rw))
                                        , RT {{ $item->rt }}/RW {{ $item->rw }}
                                    @endif
                                </span>
                            @endif
                        </td>
                        <td>
                            @if(isset($item->provinsi) && $item->provinsi)
                                <span class="location-badge">{{ $item->provinsi }}</span>
                            @else
                                -
                            @endif
                        </td>
                        <td>
                            @if(isset($item->kota) && $item->kota)
                                <span class="location-badge">{{ $item->kota }}</span>
                            @else
                                -
                            @endif
                        </td>
                        <td>{{ $item->kecamatan ?? '-' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-data">
            <p>Tidak ada data untuk ditampilkan.</p>
        </div>
    @endif

    <div class="footer">
        <p class="total">Total Data: {{ isset($data) ? count($data) : (isset($keluarga) ? count($keluarga) : 0) }}
            keluarga</p>
        <p>Laporan ini digenerate secara otomatis oleh Sistem Informasi Geografis Data Keluarga</p>
        <p style="margin-top: 10px; font-size: 9px;">© {{ date('Y') }} - WebGIS Data Keluarga v1.0</p>
    </div>
</body>

</html>
