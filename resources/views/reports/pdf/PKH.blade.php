<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'Laporan Program Keluarga Harapan (PKH)' }}</title>
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
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $title ?? 'Laporan Program Keluarga Harapan (PKH)' }}</h1>
        <p>Program Keluarga Harapan (PKH) — Rekapitulasi dan Monitoring Penerima Bantuan</p>
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
                <div class="stat-label">Total Penerima</div>
                <div class="stat-value">{{ $statistics['total_penerima'] ?? 0 }}</div>
                <div class="stat-desc">Keluarga menerima PKH</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Bantuan Disalurkan</div>
                <div class="stat-value">{{ $statistics['total_bantuan_disalurkan'] ?? 0 }}</div>
                <div class="stat-desc">Total distribusi bantuan</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Nominal Disalurkan</div>
                <div class="stat-value">
                    {{ isset($statistics['total_nominal_disalurkan']) ? number_format($statistics['total_nominal_disalurkan'], 0, ',', '.') : 0 }}
                </div>
                <div class="stat-desc">Total nominal (IDR)</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Efektivitas</div>
                <div class="stat-value">
                    @php
                        $efektivitas = ($statistics['total_penerima'] ?? 0) > 0
                            ? round(($statistics['total_bantuan_disalurkan'] ?? 0) / $statistics['total_penerima'] * 100, 1)
                            : 0;
                    @endphp
                    {{ $efektivitas }}%
                </div>
                <div class="stat-desc">Distribusi vs Penerima</div>
            </div>
        </div>
    @endif

    {{-- Data Tabel Utama --}}
    <div class="section-title">Data Keluarga Penerima PKH</div>
    <table>
        <thead>
            <tr>
                <th>No. KK</th>
                <th>Nama Keluarga</th>
                <th>Alamat</th>
                <th>Provinsi</th>
                <th>Kota</th>
                <th>Status Ekonomi</th>
                <th>Status Bantuan</th>
                <th>Nominal/Bulan</th>
                <th>Persentase Distribusi</th>
            </tr>
        </thead>
        <tbody>
            @if(isset($data) && count($data) > 0)
                @foreach($data as $item)
                    <tr>
                        <td>{{ $item['no_kk'] ?? '-' }}</td>
                        <td>{{ $item['nama_keluarga'] ?? '-' }}</td>
                        <td>
                            {{ $item['alamat'] ?? '-' }}
                            @if(!empty($item['kelurahan']))
                                <br><span class="small-text">{{ $item['kelurahan'] }}</span>
                            @endif
                            @if(!empty($item['kecamatan']))
                                <br><span class="small-text">{{ $item['kecamatan'] }}</span>
                            @endif
                        </td>
                        <td>{{ $item['provinsi'] ?? '-' }}</td>
                        <td>{{ $item['kota'] ?? '-' }}</td>
                        <td>
                            <span class="status-badge">{{ $item['status_ekonomi'] ?? '-' }}</span>
                        </td>
                        <td>
                            <span class="status-badge">
                                {{ $item['status_bantuan'] === 'aktif' ? 'Aktif' :
                    ($item['status_bantuan'] === 'pending' ? 'Pending' :
                        ($item['status_bantuan'] === 'received' ? 'Menerima' : 'Belum Menerima')) }}
                            </span>
                        </td>
                        <td>
                            @if(isset($item['nominal_per_bulan']))
                                {{ number_format($item['nominal_per_bulan'], 0, ',', '.') }}
                            @else
                                -
                            @endif
                        </td>
                        <td>
                            @if(isset($item['persentase_distribusi']))
                                {{ number_format($item['persentase_distribusi'], 1) }}%
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <td colspan="9" style="text-align:center;color:#64748b;">Tidak ada data keluarga PKH untuk ditampilkan.
                    </td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">
        <p class="total">Laporan PKH • Total Keluarga: {{ isset($data) ? count($data) : 0 }}</p>
        <p>Laporan ini digenerate otomatis oleh Sistem Informasi PKH</p>
        <p style="margin-top: 10px; font-size: 9px;">© {{ date('Y') }} - WebGIS Program Keluarga Harapan v2.0</p>
        @if(isset($filters['tahun']) && $filters['tahun'])
            <p style="font-size: 9px; color: #059669;">📅 Data berdasarkan tahun anggaran PKH: {{ $filters['tahun'] }}</p>
        @endif
    </div>
</body>

</html>