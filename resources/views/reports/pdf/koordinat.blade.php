<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'Laporan Data Koordinat PKH' }}</title>
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

        .header .pkh-badge {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 15px;
            padding: 5px 12px;
            font-size: 11px;
            font-weight: 600;
            display: inline-block;
            margin-top: 8px;
            letter-spacing: 0.5px;
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
            width: 33.33%;
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

        .ekonomi-badge {
            padding: 3px 6px;
            border-radius: 8px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .ekonomi-sangat-miskin {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #f87171;
        }

        .ekonomi-miskin {
            background: #fef3c7;
            color: #d97706;
            border: 1px solid #fbbf24;
        }

        .ekonomi-rentan-miskin {
            background: #dbeafe;
            color: #2563eb;
            border: 1px solid #60a5fa;
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

        .pkh-info {
            background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            font-size: 11px;
            color: #92400e;
        }

        .pkh-info strong {
            color: #78350f;
        }

        .tahun-info {
            background: #e0f2fe;
            color: #0369a1;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 15px;
            border: 1px solid #7dd3fc;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $title ?? 'Laporan Kelengkapan Data Koordinat PKH' }}</h1>
        <p>Program Keluarga Harapan (PKH) - Sistem Informasi Geografis</p>
        <p>Digenerate pada: {{ $generated_at ?? now()->format('d/m/Y H:i:s') }}</p>
        <div class="pkh-badge">PROGRAM KELUARGA HARAPAN</div>
    </div>

    {{-- PKH Information --}}
    <div class="pkh-info">
        <strong>Informasi PKH:</strong> Laporan ini menampilkan data kelengkapan koordinat rumah keluarga penerima
        Program Keluarga Harapan (PKH).
        Data koordinat diperlukan untuk pemetaan dan monitoring distribusi bantuan sosial.
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
                            @if($value === 'complete')
                                Sudah Ada Koordinat
                            @elseif($value === 'incomplete')
                                Belum Ada Koordinat
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
            <h3>Statistik Kelengkapan Koordinat PKH</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    @php
                        $total = ($statistics['complete'] ?? 0) + ($statistics['incomplete'] ?? 0);
                        $completePercentage = $total > 0 ? round(($statistics['complete'] / $total) * 100, 1) : 0;
                    @endphp
                    <div class="stat-number">{{ $statistics['complete'] ?? 0 }}</div>
                    <div class="stat-label">Sudah Ada Koordinat</div>
                    <div class="stat-percentage">{{ $completePercentage }}%</div>
                </div>
                <div class="stat-item">
                    @php
                        $incompletePercentage = $total > 0 ? round(($statistics['incomplete'] / $total) * 100, 1) : 0;
                    @endphp
                    <div class="stat-number">{{ $statistics['incomplete'] ?? 0 }}</div>
                    <div class="stat-label">Belum Ada Koordinat</div>
                    <div class="stat-percentage">{{ $incompletePercentage }}%</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ $total }}</div>
                    <div class="stat-label">Total Keluarga PKH</div>
                    <div class="stat-percentage">100%</div>
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
                    <th style="width: 20%">Nama Keluarga</th>
                    <th style="width: 25%">Alamat</th>
                    <th style="width: 12%">Status Ekonomi</th>
                    <th style="width: 18%">Koordinat</th>
                    <th style="width: 7%">Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data as $index => $item)
                    @php
                        $koordinat = '';
                        $hasKoordinat = false;

                        // Check individual lat/lng fields first
                        if (
                            isset($item->latitude) && isset($item->longitude) &&
                            is_numeric($item->latitude) && is_numeric($item->longitude)
                        ) {
                            $koordinat = $item->latitude . ', ' . $item->longitude;
                            $hasKoordinat = true;
                        }
                        // Fallback to lokasi string
                        elseif (!empty($item->lokasi) && preg_match('/^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$/', $item->lokasi)) {
                            $koordinat = $item->lokasi;
                            $hasKoordinat = true;
                        }

                        // Format status ekonomi
                        $statusEkonomi = $item->status_ekonomi ?? '';
                        $statusEkonomiFormatted = '';
                        $statusEkonomiClass = '';

                        switch ($statusEkonomi) {
                            case 'sangat_miskin':
                                $statusEkonomiFormatted = 'Sangat Miskin';
                                $statusEkonomiClass = 'ekonomi-sangat-miskin';
                                break;
                            case 'miskin':
                                $statusEkonomiFormatted = 'Miskin';
                                $statusEkonomiClass = 'ekonomi-miskin';
                                break;
                            case 'rentan_miskin':
                                $statusEkonomiFormatted = 'Rentan Miskin';
                                $statusEkonomiClass = 'ekonomi-rentan-miskin';
                                break;
                            default:
                                $statusEkonomiFormatted = ucfirst(str_replace('_', ' ', $statusEkonomi));
                                $statusEkonomiClass = 'ekonomi-rentan-miskin';
                        }
                    @endphp
                    <tr>
                        <td style="text-align: center; font-weight: bold;">{{ $index + 1 }}</td>
                        <td style="text-align: center;">
                            <span
                                style="font-family: 'Courier New', monospace; font-size: 9px; background: #f1f5f9; padding: 2px 4px; border-radius: 3px;">
                                {{ $item->no_kk ?? '-' }}
                            </span>
                        </td>
                        <td>
                            <strong>{{ $item->nama_keluarga ?? $item->nama_kepala_keluarga ?? '-' }}</strong>
                            @if(isset($item->jumlah_anggota) && $item->jumlah_anggota)
                                <br><span class="small-text">{{ $item->jumlah_anggota }} anggota</span>
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
                            @if($statusEkonomiFormatted)
                                <span class="ekonomi-badge {{ $statusEkonomiClass }}">{{ $statusEkonomiFormatted }}</span>
                            @else
                                <span class="small-text">-</span>
                            @endif
                        </td>
                        <td style="text-align: center;">
                            @if($hasKoordinat)
                                <span class="koordinat-text">{{ $koordinat }}</span>
                                @if(isset($item->lokasi) && $item->lokasi)
                                    <br><span class="small-text">📍 Tersedia</span>
                                @endif
                            @else
                                <span class="small-text" style="color: #dc2626;">Belum diatur</span>
                                <br><span class="small-text" style="color: #dc2626;">⚠️ Perlu input</span>
                            @endif
                        </td>
                        <td style="text-align: center;">
                            @if($hasKoordinat)
                                <span class="status-badge status-complete">✓ Lengkap</span>
                            @else
                                <span class="status-badge status-incomplete">✗ Belum</span>
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
                                    <th style="width: 20%">Nama Keluarga</th>
                                    <th style="width: 25%">Alamat</th>
                                    <th style="width: 12%">Status Ekonomi</th>
                                    <th style="width: 18%">Koordinat</th>
                                    <th style="width: 7%">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                    @endif
                @endforeach
            </tbody>
        </table>
    @else
        <div style="text-align: center; padding: 40px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">Tidak ada data keluarga PKH untuk ditampilkan.</p>
            <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">Coba ubah filter atau periksa data di sistem.</p>
        </div>
    @endif

    <div class="footer">
        <p class="total">Total Data: {{ isset($data) ? count($data) : (isset($keluarga) ? $keluarga->count() : 0) }}
            keluarga penerima PKH</p>
        @if(isset($statistics) && is_array($statistics))
            @php
                $total = ($statistics['complete'] ?? 0) + ($statistics['incomplete'] ?? 0);
                $completePercentage = $total > 0 ? round(($statistics['complete'] / $total) * 100, 1) : 0;
            @endphp
            <p>Kelengkapan Koordinat: {{ $statistics['complete'] ?? 0 }} dari {{ $total }} keluarga
                ({{ $completePercentage }}%)</p>
        @endif
        <p>Laporan ini digenerate secara otomatis oleh Sistem Informasi PKH</p>
        <p style="margin-top: 10px; font-size: 9px;">© {{ date('Y') }} - WebGIS Program Keluarga Harapan v2.0</p>
        @if(isset($filters['tahun']) && $filters['tahun'])
            <p style="font-size: 9px; color: #059669;">📅 Data berdasarkan tahun anggaran PKH: {{ $filters['tahun'] }}</p>
        @endif
    </div>
</body>

</html>