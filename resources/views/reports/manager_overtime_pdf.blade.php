<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo cáo Khối lượng Tính vượt giờ</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: {{ $fontSize ?? 10 }}px;
            margin: 0;
            padding: 10px;
            line-height: 1.2;
        }
        
        .header {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        
        .header-left,
        .header-right {
            display: table-cell;
            width: 50%;
            text-align: center;
            vertical-align: top;
        }
        
        .header h1 {
            font-size: {{ ($fontSize ?? 10) + 4 }}px;
            margin: 5px 0;
            font-weight: bold;
        }
        
        .header h2 {
            font-size: {{ ($fontSize ?? 10) + 2 }}px;
            margin: 3px 0;
            font-weight: bold;
        }
        
        .header p {
            margin: 2px 0;
        }
        
        .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: {{ $fontSize ?? 10 }}px;
        }
        
        .report-table th,
        .report-table td {
            border: 1px solid #000;
            padding: 4px 6px;
            text-align: center;
            vertical-align: middle;
            word-wrap: break-word;
        }
        
        .report-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: {{ ($fontSize ?? 10) - 1 }}px;
        }
        
        .report-table .text-left {
            text-align: left;
        }
        
        .report-table .text-right {
            text-align: right;
        }
        
        .total-row {
            font-weight: bold;
            background-color: #f8f8f8;
        }
        
        .signature-section {
            margin-top: 30px;
            display: table;
            width: 100%;
        }
        
        .signature-block {
            display: table-cell;
            width: 25%;
            text-align: center;
            vertical-align: top;
            padding: 10px;
        }
        
        .signature-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .signature-subtitle {
            font-style: italic;
            font-size: {{ ($fontSize ?? 10) - 1 }}px;
            margin-bottom: 40px;
        }
        
        .signature-name {
            font-weight: bold;
        }
        
        .page-break {
            page-break-after: always;
        }
        
        .nowrap {
            white-space: nowrap;
        }
        
        .number {
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <h1><strong>BỘ NÔNG NGHIỆP & MÔI TRƯỜNG</strong></h1>
            <h1><strong>TRƯỜNG ĐẠI HỌC THỦY LỢI</strong></h1>
        </div>
        <div class="header-right">
            <h1>BẢNG TỔNG HỢP KHỐI LƯỢNG TÍNH VƯỢT GIỜ</h1>
            <h2>NĂM HỌC {{ $namHoc->ten_nam_hoc ?? 'N/A' }}</h2>
            <p>Bộ môn: {{ $boMon->ten_bo_mon ?? 'N/A' }}</p>
        </div>
    </div>

    <table class="report-table">
        <thead>
            <tr>
                <th rowspan="2" style="width: 4%;">STT</th>
                <th rowspan="2" style="width: 8%;">Họ đệm</th>
                <th rowspan="2" style="width: 6%;">Tên</th>
                <th rowspan="2" style="width: 6%;">Học hàm</th>
                <th rowspan="2" style="width: 6%;">Học vị</th>
                <th colspan="2" style="width: 12%;">Định mức</th>
                <th colspan="3" style="width: 18%;">Khối lượng thực hiện</th>
                <th colspan="5" style="width: 25%;">Khối lượng tính vượt giờ</th>
                <th rowspan="2" style="width: 8%;">Thành tiền</th>
                <th rowspan="2" style="width: 8%;">Ghi chú</th>
            </tr>
            <tr>
                <th>KHCN</th>
                <th>GD</th>
                <th>KHCN</th>
                <th>GD</th>
                <th>Xa trường</th>
                <th>Số tiết</th>
                <th>Mức lương CB</th>
                <th>LA</th>
                <th>LV</th>
                <th>ĐA/KL</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totalThanhTien = 0;
                $totalSoTiet = 0;
            @endphp
            
            @foreach($reportData as $index => $item)
            @php
                $totalThanhTien += floatval($item['thanh_tien'] ?? 0);
                $totalSoTiet += floatval($item['so_tiet_vuot'] ?? 0);
            @endphp
            <tr>
                <td>{{ $index + 1 }}</td>
                <td class="text-left">{{ $item['ho_dem'] ?? '' }}</td>
                <td class="text-left">{{ $item['ten'] ?? '' }}</td>
                <td>{{ $item['hoc_ham'] ?? '' }}</td>
                <td>{{ $item['hoc_vi'] ?? '' }}</td>
                <td class="number">{{ number_format(floatval($item['dinhmuc_khcn'] ?? 0), 2) }}</td>
                <td class="number">{{ number_format(floatval($item['dinhmuc_gd'] ?? 0), 2) }}</td>
                <td class="number">{{ number_format(floatval($item['thuc_hien_khcn'] ?? 0), 2) }}</td>
                <td class="number">{{ number_format(floatval($item['thuc_hien_gd'] ?? 0), 2) }}</td>
                <td class="number">{{ number_format(floatval($item['gd_xa_truong'] ?? 0), 2) }}</td>
                <td class="number">{{ number_format(floatval($item['so_tiet_vuot'] ?? 0), 2) }}</td>
                <td class="number">{{ number_format(floatval($item['muc_luong_co_ban'] ?? 0), 0, ',', '.') }}</td>
                <td class="number">{{ intval($item['hd_la'] ?? 0) }}</td>
                <td class="number">{{ intval($item['hd_lv'] ?? 0) }}</td>
                <td class="number">{{ intval($item['hd_da_kl'] ?? 0) }}</td>
                <td class="number">{{ number_format(floatval($item['thanh_tien'] ?? 0), 0, ',', '.') }}</td>
                <td class="text-left">{{ $item['ghi_chu'] ?? '' }}</td>
            </tr>
            @endforeach
            
            <tr class="total-row">
                <td colspan="10" class="text-left"><strong>Tổng cộng</strong></td>
                <td class="number"><strong>{{ number_format($totalSoTiet, 2) }}</strong></td>
                <td colspan="4"></td>
                <td class="number"><strong>{{ number_format($totalThanhTien, 0, ',', '.') }}</strong></td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <div class="signature-section">
        <div class="signature-block">
            <div class="signature-title">Hiệu trưởng</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-name">&nbsp;</div>
        </div>
        <div class="signature-block">
            <div class="signature-title">Phòng TC-KT</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-name">&nbsp;</div>
        </div>
        <div class="signature-block">
            <div class="signature-title">Phòng Tổ chức Cán bộ</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-name">&nbsp;</div>
        </div>
        <div class="signature-block">
            <div class="signature-title">Phòng Đào tạo</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-name">&nbsp;</div>
        </div>
        <div class="signature-block">
            <div class="signature-title">Trưởng Bộ môn</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-name">&nbsp;</div>
        </div>
    </div>

    <div style="text-align: center; margin-top: 20px;">
        <p><em>Hà Nội, ngày {{ date('d') }} tháng {{ date('m') }} năm {{ date('Y') }}</em></p>
    </div>
</body>
</html>
