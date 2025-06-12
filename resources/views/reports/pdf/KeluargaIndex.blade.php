<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'Laporan Data Keluarga PKH' }}</title>
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

        .status-badge {
            display: inline-block;
            border-radius: 8px;
            font-size: 9px;
            font-weight: bold;
            padding: 2px 8px;
            background: #e0f2fe;
            color: #0e7490;
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

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $title ?? 'Laporan Data Keluarga PKH' }}</h1>
        <p>Program Keluarga Harapan (PKH) — Database Keluarga Penerima Bantuan</p>
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
    @if(isset($statistics))
        <div class="stat-cards">
            <div class="stat-card">
                <div class="stat-label">Total Keluarga</div>
                <div class="stat-value">{{ $statistics['total'] ?? 0 }}</div>
                <div class="stat-desc">Keluarga terdaftar</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Sangat Miskin</div>
                <div class="stat-value">{{ $statistics['sangat_miskin'] ?? 0 }}</div>
                <div class="stat-desc">Keluarga sangat miskin</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Miskin</div>
                <div class="stat-value">{{ $statistics['miskin'] ?? 0 }}</div>
                <div class="stat-desc">Keluarga miskin</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Rentan Miskin</div>
                <div class="stat-value">{{ $statistics['rentan_miskin'] ?? 0 }}</div>
                <div class="stat-desc">Keluarga rentan miskin</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Dengan Koordinat</div>
                <div class="stat-value">{{ $statistics['with_coordinates'] ?? 0 }}</div>
                <div class="stat-desc">Keluarga dengan koordinat</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Tanpa Koordinat</div>
                <div class="stat-value">{{ $statistics['without_coordinates'] ?? 0 }}</div>
                <div class="stat-desc">Keluarga tanpa koordinat</div>
            </div>
        </div>
    @endif

    {{-- Data Tabel Utama --}}
    <div class="section-title">Data Keluarga Program Keluarga Harapan (PKH)</div>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>No. KK</th>
                <th>Nama Keluarga</th>
                <th>Alamat</th>
                <th>Wilayah</th>
                <th>Status Ekonomi</th>
                <th>Anggota</th>
                <th>Koordinat</th>
            </tr>
        </thead>
        <tbody>
            @if(isset($data) && count($data) > 0)
                @foreach($data as $index => $item)
                    <tr>
                        <td style="text-align:center;font-weight:bold;">{{ $index + 1 }}</td>
                        <td style="text-align:center;">
                            @if(isset($item->no_kk) && $item->no_kk)
                                <span class="no-kk">{{ $item->no_kk }}</span>
                            @else
                                <span class="small-text">-</span>
                            @endif
                        </td>
                        <td>
                            <strong>{{ $item->nama_keluarga ?? $item->nama_kepala_keluarga ?? '-' }}</strong>
                            @if(isset($item->pendapatan) && $item->pendapatan)
                                <br><span class="small-text">💰 {{ number_format($item->pendapatan, 0, ',', '.') }}/bulan</span>
                            @endif
                        </td>
                        <td>
                            {{ $item->alamat ?? '-' }}
                            @if(isset($item->rt) && isset($item->rw) && $item->rt && $item->rw)
                                <br><span class="small-text">RT {{ $item->rt }}/RW {{ $item->rw }}</span>
                            @endif
                        </td>
                        <td>
                            @if(isset($item->kelurahan) && $item->kelurahan)
                                {{ $item->kelurahan }}
                                @if(isset($item->kecamatan) && $item->kecamatan)
                                    <br><span class="small-text">{{ $item->kecamatan }}</span>
                                @endif
                            @endif
                            @if(isset($item->kota) && $item->kota)
                                <br><span class="small-text">{{ $item->kota }}</span>
                            @endif
                            @if(isset($item->provinsi) && $item->provinsi)
                                <br><span class="small-text">{{ $item->provinsi }}</span>
                            @endif
                        </td>
                        <td style="text-align:center;">
                            @if(isset($item->status_ekonomi) && $item->status_ekonomi)
                                @php
                                    $statusClass = 'status-' . str_replace(' ', '-', strtolower($item->status_ekonomi));
                                    $statusLabel = '';

                                    switch ($item->status_ekonomi) {
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
                                            $statusLabel = ucfirst(str_replace('_', ' ', $item->status_ekonomi));
                                    }
                                @endphp
                                <span class="status-badge {{ $statusClass }}">{{ $statusLabel }}</span>
                            @else
                                <span class="small-text">-</span>
                            @endif
                        </td>
                        <td style="text-align:center;">
                            @if(isset($item->jumlah_anggota) && $item->jumlah_anggota)
                                <strong>{{ $item->jumlah_anggota }}</strong>
                                <br><span class="small-text">orang</span>
                            @else
                                <span class="small-text">-</span>
                            @endif
                        </td>
                        <td style="text-align:center;">
                            @if(isset($item->lokasi) && $item->lokasi && preg_match('/^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$/', $item->lokasi))
                                <span class="koordinat-info">📍 {{ $item->lokasi }}</span>
                                <br><span class="small-text" style="color:#059669;">Tersedia</span>
                            @elseif(isset($item->latitude) && isset($item->longitude) && $item->latitude && $item->longitude)
                                <span class="koordinat-info">📍 {{ $item->latitude }},{{ $item->longitude }}</span>
                                <br><span class="small-text" style="color:#059669;">Tersedia</span>
                            @else
                                <span class="small-text" style="color:#dc2626;">Belum diatur</span>
                                <br><span class="small-text" style="color:#dc2626;">⚠️ Perlu input</span>
                            @endif
                        </td>
                    </tr>

                    {{-- Page break every 25 rows --}}
                    @if(($index + 1) % 25 == 0 && $index + 1 < count($data))
                            </tbody>
                        </table>
                        <div class="page-break"></div>
                        <table>
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>No. KK</th>
                                    <th>Nama Keluarga</th>
                                    <th>Alamat</th>
                                    <th>Wilayah</th>
                                    <th>Status Ekonomi</th>
                                    <th>Anggota</th>
                                    <th>Koordinat</th>
                                </tr>
                            </thead>
                            <tbody>
                    @endif
                @endforeach
            @else
                <tr>
                    <td colspan="8" style="text-align:center;color:#64748b;">Tidak ada data keluarga untuk ditampilkan.</td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">
        <p class="total">Laporan Data Keluarga PKH • Total: {{ isset($data) ? count($data) : 0 }} keluarga</p>
        @if(isset($statistics))
            <p>Distribusi Status: Sangat Miskin ({{ $statistics['sangat_miskin'] ?? 0 }}), Miskin
                ({{ $statistics['miskin'] ?? 0 }}), Rentan Miskin ({{ $statistics['rentan_miskin'] ?? 0 }})</p>
            <p>Kelengkapan Koordinat: {{ $statistics['with_coordinates'] ?? 0 }} tersedia,
                {{ $statistics['without_coordinates'] ?? 0 }} belum tersedia</p>
        @endif
        <p>Laporan ini digenerate otomatis oleh Sistem Informasi PKH</p>
        <p style="margin-top: 10px; font-size: 9px;">© {{ date('Y') }} - WebGIS Program Keluarga Harapan v2.0</p>
        @if(isset($filters['tahun']) && $filters['tahun'])
            <p style="font-size: 9px; color: #059669;">📅 Data berdasarkan tahun: {{ $filters['tahun'] }}</p>
        @endif
    </div>
</body>

</html>