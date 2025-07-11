<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo cáo Tổng hợp Khối lượng Công tác</title>
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
    <!-- Header -->
    <div class="header">
        <div class="header-left">
            <h1><strong>BỘ NÔNG NGHIỆP & PTNT</strong></h1>
            <h1><strong>TRƯỜNG ĐẠI HỌC THỦY LỢI</strong></h1>
        </div>
        <div class="header-right">
            <h1>BẢNG TỔNG HỢP KHỐI LƯỢNG CÔNG TÁC</h1>
            <h2>NĂM HỌC {{ $namHoc->ten_nam_hoc ?? 'N/A' }}</h2>
            <p>Bộ môn: {{ $boMon->ten_bo_mon ?? 'N/A' }}</p>
        </div>
    </div>

    <!-- Main Report Table -->
    <table class="report-table">
        <thead>
            <tr>
                <th rowspan="3" style="width: 4%;">TT</th>
                <th rowspan="3" style="width: 8%;">Họ đệm</th>
                <th rowspan="3" style="width: 6%;">Tên</th>
                <th rowspan="3" style="width: 8%;">KHCN (P9)</th>
                <th colspan="2" style="width: 12%;">Công tác khác (P7)</th>
                <th rowspan="3" style="width: 8%;">Coi chấm thi (đại học) (P6)</th>
                <th colspan="5" style="width: 32%;">Công tác giảng dạy(P3)</th>
                <th rowspan="3" style="width: 8%;">Tổng số giờ KHCN</th>
                <th rowspan="3" style="width: 8%;">Tổng số giờ giảng dạy</th>
                <th rowspan="3" style="width: 8%;">Số tiết GD xa trường</th>
            </tr>
            <tr>
                <th rowspan="2">QĐ giờ KHCN</th>
                <th rowspan="2">Quy đổi tiết</th>
                <th rowspan="2">Giảng dạy</th>
                <th colspan="3">Hướng dẫn</th>
                <th rowspan="2">Số tiết</th>
            </tr>
            <tr>
                <th>LA</th>
                <th>LV</th>
                <th>ĐA</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totals = [
                    'khcn_p9' => 0,
                    'congtac_khac_p7' => 0,
                    'coi_cham_thi_p6' => 0,
                    'giang_day' => 0,
                    'hd_la' => 0,
                    'hd_lv' => 0,
                    'hd_da' => 0,
                    'so_tiet_hd' => 0,
                    'tong_khcn' => 0,
                    'tong_giang_day' => 0,
                    'gd_xa_truong' => 0
                ];
            @endphp
            
            @foreach($reportData as $index => $item)
            @php
                foreach($totals as $key => $value) {
                    $totals[$key] += floatval($item[$key] ?? 0);
                }
            @endphp
            <tr>
                <td>{{ $index + 1 }}</td>
                <td class="text-left">{{ $item['ho_dem'] ?? '' }}</td>
                <td class="text-left">{{ $item['ten'] ?? '' }}</td>
                <td class="number">{{ number_format(floatval($item['khcn_p9'] ?? 0), 2) }}</td>
                <td class="number">{{ number_format(floatval($item['congtac_khac_p7'] ?? 0), 2) }}</td>
                <td class="number">-</td>
                <td class="number">{{ number_format(floatval($item['coi_cham_thi_p6'] ?? 0), 2) }}</td>
                <td class="number">{{ number_format(floatval($item['giang_day'] ?? 0), 2) }}</td>
                <td class="number">{{ intval($item['hd_la'] ?? 0) }}</td>
                <td class="number">{{ intval($item['hd_lv'] ?? 0) }}</td>
                <td class="number">{{ intval($item['hd_da'] ?? 0) }}</td>
                <td class="number">{{ number_format(floatval($item['so_tiet_hd'] ?? 0), 2) }}</td>
                <td class="number">{{ number_format(floatval($item['tong_khcn'] ?? 0), 2) }}</td>
                <td class="number">{{ number_format(floatval($item['tong_giang_day'] ?? 0), 2) }}</td>
                <td class="number">{{ number_format(floatval($item['gd_xa_truong'] ?? 0), 2) }}</td>
            </tr>
            @endforeach
            
            <!-- Total Row -->
            <tr class="total-row">
                <td colspan="3" class="text-left"><strong>Tổng cộng</strong></td>
                <td class="number"><strong>{{ number_format($totals['khcn_p9'], 2) }}</strong></td>
                <td class="number"><strong>{{ number_format($totals['congtac_khac_p7'], 2) }}</strong></td>
                <td class="number"><strong>-</strong></td>
                <td class="number"><strong>{{ number_format($totals['coi_cham_thi_p6'], 2) }}</strong></td>
                <td class="number"><strong>{{ number_format($totals['giang_day'], 2) }}</strong></td>
                <td class="number"><strong>{{ $totals['hd_la'] }}</strong></td>
                <td class="number"><strong>{{ $totals['hd_lv'] }}</strong></td>
                <td class="number"><strong>{{ $totals['hd_da'] }}</strong></td>
                <td class="number"><strong>{{ number_format($totals['so_tiet_hd'], 2) }}</strong></td>
                <td class="number"><strong>{{ number_format($totals['tong_khcn'], 2) }}</strong></td>
                <td class="number"><strong>{{ number_format($totals['tong_giang_day'], 2) }}</strong></td>
                <td class="number"><strong>{{ number_format($totals['gd_xa_truong'], 2) }}</strong></td>
            </tr>
        </tbody>
    </table>

    <!-- Signature Section -->
    <div class="signature-section">
        <div class="signature-block">
            <div class="signature-title">Hiệu trưởng</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-name">&nbsp;</div>
        </div>
        <div class="signature-block">
            <div class="signature-title">Phòng QLKH&HTQT</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-name">&nbsp;</div>
        </div>
        <div class="signature-block">
            <div class="signature-title">Phòng CTSV</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-name">&nbsp;</div>
        </div>
        <div class="signature-block">
            <div class="signature-title">Phòng khảo thí</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-name">&nbsp;</div>
        </div>
        <div class="signature-block">
            <div class="signature-title">Trưởng Bộ môn</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-name">&nbsp;</div>
        </div>
    </div>

    <!-- Date and Location -->
    <div style="text-align: center; margin-top: 20px;">
        <p><em>Hà Nội, ngày {{ date('d') }} tháng {{ date('m') }} năm {{ date('Y') }}</em></p>
    </div>
</body>
</html>
