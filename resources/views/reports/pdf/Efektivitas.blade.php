<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'Laporan Efektivitas Program PKH' }}</title>
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

        .progress-bar-bg {
            background: #e0f2fe;
            border-radius: 8px;
            height: 14px;
            width: 100%;
            margin: 6px 0;
        }

        .progress-bar-fill {
            background: linear-gradient(90deg, #06b6d4 0%, #14b8a6 100%);
            height: 14px;
            border-radius: 8px;
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

        .success {
            color: #059669;
            font-weight: bold;
        }

        .warning {
            color: #eab308;
            font-weight: bold;
        }

        .danger {
            color: #dc2626;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $title ?? 'Laporan Efektivitas Program PKH' }}</h1>
        <p>Program Keluarga Harapan (PKH) — Analisis Efektivitas Penyaluran Bantuan</p>
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
    <div class="stat-cards">
        <div class="stat-card">
            <div class="stat-label">Total Keluarga</div>
            <div class="stat-value">{{ $efektivitasData['total_keluarga'] ?? 0 }}</div>
            <div class="stat-desc">Data keluarga PKH</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Total Penerima</div>
            <div class="stat-value">{{ $efektivitasData['total_penerima'] ?? 0 }}</div>
            <div class="stat-desc">Keluarga menerima bantuan</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Efektivitas</div>
            <div class="stat-value">{{ number_format($efektivitasData['efektivitas_percentage'] ?? 0, 2) }}%</div>
            <div class="stat-desc">Coverage penerima</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Belum Menerima</div>
            <div class="stat-value">{{ $efektivitasData['keluarga_belum_menerima'] ?? 0 }}</div>
            <div class="stat-desc">Keluarga belum terjangkau</div>
        </div>
    </div>

    {{-- Distribusi Per Status Ekonomi --}}
    <div class="section-title">Distribusi Efektivitas per Status Ekonomi</div>
    <table>
        <thead>
            <tr>
                <th>Status Ekonomi</th>
                <th>Total Keluarga</th>
                <th>Penerima</th>
                <th>Coverage (%)</th>
                <th>Progress</th>
            </tr>
        </thead>
        <tbody>
            @if(isset($efektivitasData['distribusi_per_status']) && count($efektivitasData['distribusi_per_status']) > 0)
                @foreach($efektivitasData['distribusi_per_status'] as $item)
                    @php
                        $coverage = $item['coverage_percentage'] ?? 0;
                        $barColor = $coverage >= 80 ? '#06b6d4' : ($coverage >= 60 ? '#eab308' : '#dc2626');
                    @endphp
                    <tr>
                        <td>
                            <span class="highlight">{{ $item['status'] ?? '-' }}</span>
                        </td>
                        <td>{{ $item['total_keluarga'] ?? 0 }}</td>
                        <td>{{ $item['total_penerima'] ?? 0 }}</td>
                        <td>
                            <span class="{{ $coverage >= 80 ? 'success' : ($coverage >= 60 ? 'warning' : 'danger') }}">
                                {{ number_format($coverage, 1) }}%
                            </span>
                        </td>
                        <td style="min-width:120px;">
                            <div class="progress-bar-bg">
                                <div class="progress-bar-fill" style="width:{{ $coverage }}%;background:{{ $barColor }}"></div>
                            </div>
                        </td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <td colspan="5" style="text-align:center;color:#64748b;">Tidak ada data distribusi per status ekonomi.
                    </td>
                </tr>
            @endif
        </tbody>
    </table>

    {{-- Target vs Realisasi --}}
    <div class="section-title">Target vs Realisasi Penerima PKH</div>
    <table>
        <thead>
            <tr>
                <th>Target</th>
                <th>Realisasi</th>
                <th>Pencapaian (%)</th>
                <th>Sisa Target</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $targetRealisasi['target'] ?? 0 }}</td>
                <td>{{ $targetRealisasi['realisasi'] ?? 0 }}</td>
                <td>
                    <span
                        class="{{ ($targetRealisasi['percentage'] ?? 0) >= 80 ? 'success' : (($targetRealisasi['percentage'] ?? 0) >= 60 ? 'warning' : 'danger') }}">
                        {{ number_format($targetRealisasi['percentage'] ?? 0, 1) }}%
                    </span>
                </td>
                <td>{{ $targetRealisasi['sisa_target'] ?? 0 }}</td>
            </tr>
        </tbody>
    </table>
    <div class="small-text" style="margin-top:6px;">
        <strong>Catatan:</strong> Target adalah jumlah keluarga sangat miskin & miskin yang menjadi sasaran PKH.
    </div>

    {{-- Efektivitas Distribusi Bantuan --}}
    <div class="section-title">Efektivitas Distribusi Bantuan</div>
    <table>
        <thead>
            <tr>
                <th>Total Target Distribusi</th>
                <th>Berhasil Disalurkan</th>
                <th>Gagal Disalurkan</th>
                <th>Persentase Realisasi</th>
                <th>Persentase Gagal</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $efektivitasDistribusi['total_target'] ?? 0 }}</td>
                <td>{{ $efektivitasDistribusi['total_realisasi'] ?? 0 }}</td>
                <td>{{ $efektivitasDistribusi['total_gagal'] ?? 0 }}</td>
                <td>
                    <span
                        class="{{ ($efektivitasDistribusi['persentase_realisasi'] ?? 0) >= 80 ? 'success' : (($efektivitasDistribusi['persentase_realisasi'] ?? 0) >= 60 ? 'warning' : 'danger') }}">
                        {{ number_format($efektivitasDistribusi['persentase_realisasi'] ?? 0, 1) }}%
                    </span>
                </td>
                <td>
                    <span
                        class="{{ ($efektivitasDistribusi['persentase_gagal'] ?? 0) < 20 ? 'success' : (($efektivitasDistribusi['persentase_gagal'] ?? 0) < 40 ? 'warning' : 'danger') }}">
                        {{ number_format($efektivitasDistribusi['persentase_gagal'] ?? 0, 1) }}%
                    </span>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p class="total">Laporan Efektivitas PKH • Total Keluarga: {{ $efektivitasData['total_keluarga'] ?? 0 }}</p>
        <p>Laporan ini digenerate otomatis oleh Sistem Informasi PKH</p>
        <p style="margin-top: 10px; font-size: 9px;">© {{ date('Y') }} - WebGIS Program Keluarga Harapan v2.0</p>
        @if(isset($filters['tahun']) && $filters['tahun'])
            <p style="font-size: 9px; color: #059669;">📅 Data berdasarkan tahun anggaran PKH: {{ $filters['tahun'] }}</p>
        @endif
    </div>
</body>

</html>