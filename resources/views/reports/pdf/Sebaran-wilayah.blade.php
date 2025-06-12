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

        .stat-cards {
            display: flex;
            flex-wrap: wrap;
            gap: 18px;
            margin-bottom: 24px;
        }

        .stat-card {
            flex: 1 1 180px;
            background: linear-gradient(120deg, #a7f3d0 0%, #e0f2fe 100%);
            border-radius: 14px;
            padding: 18px 16px;
            border: 1px solid #bae6fd;
            text-align: center;
            min-width: 160px;
        }

        .stat-label {
            font-size: 11px;
            color: #0e7490;
            margin-bottom: 4px;
        }

        .stat-value {
            font-size: 22px;
            font-weight: 700;
            color: #06b6d4;
            margin-bottom: 2px;
        }

        .stat-desc {
            font-size: 10px;
            color: #64748b;
        }

        .section-title {
            font-size: 15px;
            font-weight: 600;
            color: #0e7490;
            margin: 32px 0 10px 0;
            border-left: 4px solid #06b6d4;
            padding-left: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 18px;
            background: #fff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(6, 182, 212, 0.04);
        }

        th,
        td {
            border: 1px solid #bae6fd;
            padding: 9px 8px;
            text-align: left;
            font-size: 10px;
        }

        th {
            background: #e0f2fe;
            color: #0e7490;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        tr:nth-child(even) {
            background: #f0fdfa;
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
            margin-top: 36px;
            text-align: center;
            color: #64748b;
            font-size: 10px;
            background: #f0fdfa;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #e0f2fe;
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

        .highlight {
            color: #0e7490;
            font-weight: bold;
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

    @if(isset($filters) && is_array($filters) && array_filter($filters, function ($v) {
        return $v !== 'all' && $v !== null; }))
        <div class="filter-info">
            <strong>Filter:</strong>
            @foreach($filters as $key => $value)
                @if($value !== 'all' && $value !== null)
                    <span class="highlight">{{ ucfirst(str_replace('_', ' ', $key)) }}:</span> {{ $value }}&nbsp;
                @endif
            @endforeach
        </div>
    @endif

    {{-- Statistik Ringkas --}}
    @if(isset($statistics) && count($statistics) > 0)
        <div class="stat-cards">
            <div class="stat-card">
                <div class="stat-label">Total Provinsi</div>
                <div class="stat-value">{{ count($statistics) }}</div>
                <div class="stat-desc">Provinsi dengan penerima PKH</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Penerima</div>
                <div class="stat-value">{{ $statistics->sum('total') }}</div>
                <div class="stat-desc">Keluarga menerima PKH</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Provinsi Terbanyak</div>
                <div class="stat-value">{{ $statistics->first()->provinsi ?? '-' }}</div>
                <div class="stat-desc">{{ number_format($statistics->first()->total ?? 0) }} keluarga</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Rata-rata per Provinsi</div>
                <div class="stat-value">{{ count($statistics) > 0 ? number_format($statistics->avg('total')) : 0 }}</div>
                <div class="stat-desc">Keluarga per provinsi</div>
            </div>
        </div>
    @endif

    {{-- Statistik Sebaran Per Provinsi --}}
    @if(isset($statistics) && count($statistics) > 0)
        <div class="section-title">Statistik Sebaran PKH Per Provinsi (Top 10)</div>
        <table>
            <thead>
                <tr>
                    <th>Ranking</th>
                    <th>Provinsi</th>
                    <th>Total Penerima</th>
                    <th>Persentase</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $totalKeseluruhan = $statistics->sum('total');
                @endphp
                @foreach($statistics->take(10) as $index => $stat)
                    <tr>
                        <td style="text-align:center;font-weight:bold;">{{ $index + 1 }}</td>
                        <td><span class="highlight">{{ $stat->provinsi ?? '-' }}</span></td>
                        <td>{{ number_format($stat->total ?? 0) }}</td>
                        <td>{{ $totalKeseluruhan > 0 ? number_format(($stat->total / $totalKeseluruhan) * 100, 1) : 0 }}%</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    {{-- Data Tabel Detail --}}
    <div class="section-title">Data Keluarga Penerima PKH per Wilayah</div>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>No. KK</th>
                <th>Nama Keluarga</th>
                <th>Alamat</th>
                <th>Provinsi</th>
                <th>Kota/Kabupaten</th>
                <th>Kecamatan</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @php
                $dataToShow = $data ?? $keluarga ?? [];
            @endphp
            @if(count($dataToShow) > 0)
                @foreach($dataToShow as $index => $item)
                    <tr>
                        <td style="text-align: center; font-weight: bold;">{{ $index + 1 }}</td>
                        <td style="text-align: center;">
                            @if(isset($item['no_kk']) || (is_object($item) && isset($item->no_kk)))
                                <span class="no-kk">{{ is_array($item) ? $item['no_kk'] : $item->no_kk }}</span>
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
                @endforeach
            @else
                <tr>
                    <td colspan="8" style="text-align:center;color:#64748b;">Tidak ada data keluarga PKH untuk ditampilkan.
                    </td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">
        <p class="total">Laporan Sebaran Wilayah PKH • Total Data: {{ count($dataToShow) }} keluarga</p>
        @if(isset($statistics) && count($statistics) > 0)
            <p>Sebaran: {{ count($statistics) }} provinsi dengan {{ $statistics->sum('total') }} penerima PKH</p>
            <p>Provinsi Terbanyak: {{ $statistics->first()->provinsi ?? '-' }}
                ({{ number_format($statistics->first()->total ?? 0) }} keluarga)</p>
        @endif
        <p>Laporan ini digenerate otomatis oleh Sistem Informasi PKH</p>
        <p style="margin-top: 10px; font-size: 9px;">© {{ date('Y') }} - WebGIS Program Keluarga Harapan v2.0</p>
        @if(isset($filters['tahun']) && $filters['tahun'])
            <p style="font-size: 9px; color: #059669;">📅 Data berdasarkan tahun anggaran PKH: {{ $filters['tahun'] }}</p>
        @endif
    </div>
</body>

</html>