{{-- resources/views/reports/pdf/wilayah.blade.php --}}
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

        .stat-list {
            display: table;
            width: 100%;
        }

        .stat-row {
            display: table-row;
        }

        .stat-cell {
            display: table-cell;
            padding: 5px 10px;
            border-bottom: 1px solid #e5e7eb;
        }

        .stat-provinsi {
            font-weight: bold;
            width: 70%;
        }

        .stat-total {
            text-align: right;
            width: 30%;
            color: #0891b2;
            font-weight: bold;
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
            background-color: #0891b2;
            color: white;
            font-weight: bold;
        }

        tr:nth-child(even) {
            background-color: #f9f9f9;
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
        <p>Provinsi: {{ $filter_provinsi }} | Kota/Kabupaten: {{ $filter_kota }}</p>
        <p>Digenerate pada: {{ $generated_at }}</p>
    </div>

    <div class="statistics">
        <h3>Statistik Per Provinsi (Top 10)</h3>
        <div class="stat-list">
            @foreach($statistics->take(10) as $stat)
                <div class="stat-row">
                    <div class="stat-cell stat-provinsi">{{ $stat->provinsi }}</div>
                    <div class="stat-cell stat-total">{{ $stat->total }} keluarga</div>
                </div>
            @endforeach
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 12%">No. KK</th>
                <th style="width: 20%">Kepala Keluarga</th>
                <th style="width: 25%">Alamat</th>
                <th style="width: 15%">Provinsi</th>
                <th style="width: 15%">Kota/Kabupaten</th>
                <th style="width: 13%">Kecamatan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($keluarga as $item)
                <tr>
                    <td>{{ $item->no_kk }}</td>
                    <td>{{ $item->nama_kepala_keluarga }}</td>
                    <td>{{ $item->alamat }}</td>
                    <td>{{ $item->provinsi }}</td>
                    <td>{{ $item->kota }}</td>
                    <td>{{ $item->kecamatan }}</td>
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
