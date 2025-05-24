{{-- resources/views/reports/pdf/koordinat.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            line-height: 1.4;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #10b981;
            padding-bottom: 15px;
        }

        .header h1 {
            color: #10b981;
            margin: 0;
            font-size: 18px;
            font-weight: bold;
        }

        .header p {
            margin: 5px 0;
            color: #666;
        }

        .statistics {
            margin-bottom: 20px;
            background: #f0fdf4;
            padding: 15px;
            border-radius: 5px;
        }

        .statistics h3 {
            margin-top: 0;
            color: #10b981;
            font-size: 14px;
        }

        .stat-grid {
            display: table;
            width: 100%;
        }

        .stat-item {
            display: table-cell;
            width: 50%;
            text-align: center;
            padding: 10px;
        }

        .stat-number {
            font-size: 20px;
            font-weight: bold;
            color: #10b981;
        }

        .stat-label {
            color: #666;
            font-size: 11px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
            font-size: 10px;
        }

        th {
            background-color: #10b981;
            color: white;
            font-weight: bold;
        }

        tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .status-badge {
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
        }

        .status-complete {
            background-color: #d1fae5;
            color: #065f46;
        }

        .status-incomplete {
            background-color: #f3f4f6;
            color: #374151;
        }

        .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 10px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Filter: {{ $filter }}</p>
        <p>Digenerate pada: {{ $generated_at }}</p>
    </div>

    <div class="statistics">
        <h3>Statistik Kelengkapan Koordinat</h3>
        <div class="stat-grid">
            <div class="stat-item">
                <div class="stat-number">{{ $statistics['complete'] }}</div>
                <div class="stat-label">Sudah Ada Koordinat</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">{{ $statistics['incomplete'] }}</div>
                <div class="stat-label">Belum Ada Koordinat</div>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 12%">No. KK</th>
                <th style="width: 22%">Kepala Keluarga</th>
                <th style="width: 30%">Alamat</th>
                <th style="width: 20%">Koordinat</th>
                <th style="width: 16%">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($keluarga as $item)
                <tr>
                    <td>{{ $item->no_kk }}</td>
                    <td>{{ $item->nama_kepala_keluarga }}</td>
                    <td>
                        {{ $item->alamat }}
                        @if($item->kelurahan)
                            <br><small>{{ $item->kelurahan }}, {{ $item->kecamatan }}</small>
                        @endif
                    </td>
                    <td>
                        @if($item->lokasi && strpos($item->lokasi, ',') !== false)
                            {{ $item->lokasi }}
                        @else
                            Belum diatur
                        @endif
                    </td>
                    <td>
                        @if($item->lokasi && strpos($item->lokasi, ',') !== false)
                            <span class="status-badge status-complete">Lengkap</span>
                        @else
                            <span class="status-badge status-incomplete">Belum Lengkap</span>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Total Data: {{ $keluarga->count() }} keluarga</p>
        <p>Laporan ini digenerate secara otomatis oleh Sistem Informasi Geografis Penduduk Miskin</p>
    </div>
</body>

</html>
