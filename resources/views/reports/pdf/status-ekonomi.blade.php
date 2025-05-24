{{-- resources/views/reports/pdf/status-ekonomi.blade.php --}}
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
            border-bottom: 2px solid #0891b2;
            padding-bottom: 15px;
        }

        .header h1 {
            color: #0891b2;
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
            background: #f8fafc;
            padding: 15px;
            border-radius: 5px;
        }

        .statistics h3 {
            margin-top: 0;
            color: #0891b2;
            font-size: 14px;
        }

        .stat-grid {
            display: table;
            width: 100%;
        }

        .stat-item {
            display: table-cell;
            width: 33.33%;
            text-align: center;
            padding: 10px;
        }

        .stat-number {
            font-size: 20px;
            font-weight: bold;
            color: #0891b2;
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
            padding: 8px;
            text-align: left;
            font-size: 10px;
        }

        th {
            background-color: #0891b2;
            color: white;
            font-weight: bold;
        }

        tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .status-badge {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
        }

        .status-sangat-miskin {
            background-color: #fee2e2;
            color: #dc2626;
        }

        .status-miskin {
            background-color: #fef3c7;
            color: #d97706;
        }

        .status-rentan-miskin {
            background-color: #cffafe;
            color: #0891b2;
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
        <h3>Statistik Status Ekonomi</h3>
        <div class="stat-grid">
            <div class="stat-item">
                <div class="stat-number">{{ $statistics['sangat_miskin'] }}</div>
                <div class="stat-label">Sangat Miskin</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">{{ $statistics['miskin'] }}</div>
                <div class="stat-label">Miskin</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">{{ $statistics['rentan_miskin'] }}</div>
                <div class="stat-label">Rentan Miskin</div>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 15%">No. KK</th>
                <th style="width: 25%">Kepala Keluarga</th>
                <th style="width: 35%">Alamat</th>
                <th style="width: 15%">Status Ekonomi</th>
                <th style="width: 10%">Penghasilan</th>
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
                        <span class="status-badge status-{{ $item->status_ekonomi }}">
                            @if($item->status_ekonomi == 'sangat_miskin')
                                Sangat Miskin
                            @elseif($item->status_ekonomi == 'miskin')
                                Miskin
                            @elseif($item->status_ekonomi == 'rentan_miskin')
                                Rentan Miskin
                            @endif
                        </span>
                    </td>
                    <td>
                        @if($item->penghasilan_bulanan)
                            Rp {{ number_format($item->penghasilan_bulanan, 0, ',', '.') }}
                        @else
                            -
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
