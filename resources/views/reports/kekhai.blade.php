<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo cáo Kê khai - {{ $hocKy->ten_hoc_ky ?? 'N/A' }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: {{ $font_size ?? 12 }}px;
            margin: {{ ($font_size ?? 12) > 14 ? '15px' : '20px' }}; /* Adjust margins based on font size */
            color: #333;
            line-height: 1.5;
        }

        /* Adjust header sizes based on font size for better readability */
        h1, h2, h3, h4 {
            color: #2c3e50;
            margin: {{ ($font_size ?? 12) > 14 ? '10px 0' : '15px 0' }};
            text-align: center;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            word-wrap: break-word;
        }

        h1 {
            font-size: {{ ($font_size ?? 12) + 8 }}px;
        }

        h2 {
            font-size: {{ ($font_size ?? 12) + 6 }}px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
        }

        h3 {
            font-size: {{ ($font_size ?? 12) + 4 }}px;
            color: #3498db;
        }

        h4 {
            font-size: {{ ($font_size ?? 12) + 2 }}px;
            color: #16a085;
        }

        .cover-page {
            text-align: center;
            margin: 50px 0;
            page-break-after: always;
            padding: 20px;
        }

        .cover-page img {
            max-width: 180px;
            margin-bottom: 30px;
        }

        .cover-page .title {
            font-size: {{ ($font_size ?? 12) + 12 }}px;
            font-weight: bold;
            margin: 30px 0 20px;
        }

        .cover-page .subtitle {
            font-size: {{ ($font_size ?? 12) + 6 }}px;
            margin-bottom: 20px;
        }

        .cover-page .meta {
            margin: 30px 0;
            font-size: {{ ($font_size ?? 12) + 2 }}px;
        }

        .cover-page .meta p {
            margin: 10px 0;
        }

        /* Make tables more responsive */
        .table-container {
            margin: {{ ($font_size ?? 12) > 14 ? '15px 0' : '25px 0' }};
            page-break-inside: avoid;
            overflow-x: auto;
            width: 100%;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: {{ ($font_size ?? 12) > 14 ? '15px' : '25px' }};
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            table-layout: fixed; /* This ensures the table respects width constraints */
        }

        /* Make cells handle overflow gracefully */
        th, td {
            border: 1px solid #bdc3c7;
            padding: {{ ($font_size ?? 12) > 14 ? '6px' : '10px' }};
            text-align: left;
            font-size: {{ $font_size ?? 12 }}px;
            word-break: break-word; /* Allow words to break */
            overflow: hidden;
            text-overflow: ellipsis; /* Show ellipsis for overflowing text */
            vertical-align: top;
        }

        th {
            background-color: #f2f6f9;
            font-weight: bold;
            color: #2c3e50;
            text-transform: uppercase;
            font-size: {{ ($font_size ?? 12) - 1 }}px;
        }

        tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        tr:hover {
            background-color: #f5f5f5;
        }

        .text-center {
            text-align: center;
        }

        /* Make nested tables more compact */
        .nested-table {
            width: 100%;
            margin: {{ ($font_size ?? 12) > 14 ? '5px 0' : '10px 0' }};
            border-collapse: collapse;
        }

        .nested-table th, .nested-table td {
            border: 1px solid #dfe6e9;
            padding: {{ ($font_size ?? 12) > 14 ? '4px' : '8px' }};
            font-size: {{ ($font_size ?? 12) - 1 }}px;
            word-break: break-word; /* Allow words to break */
        }

        .nested-table th {
            background-color: #f1f2f6;
        }

        .chart-container {
            margin: {{ ($font_size ?? 12) > 14 ? '20px 0' : '30px 0' }};
            text-align: center;
            page-break-inside: avoid;
            padding: 15px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        canvas {
            max-width: 100%; /* Make canvas responsive */
            height: auto !important;
            margin: 0 auto;
        }

        .section {
            margin: {{ ($font_size ?? 12) > 14 ? '20px 0' : '30px 0' }};
            page-break-inside: avoid;
        }

        .header, .footer {
            width: 100%;
            text-align: center;
            position: fixed;
        }

        .header {
            top: 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }

        .footer {
            bottom: 0;
            border-top: 1px solid #ddd;
            padding-top: 5px;
            font-size: {{ ($font_size ?? 12) - 2 }}px;
            color: #7f8c8d;
        }

        .page-number:after {
            content: counter(page);
        }

        .summary-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            padding: {{ ($font_size ?? 12) > 14 ? '10px' : '15px' }};
            margin: {{ ($font_size ?? 12) > 14 ? '15px 0' : '20px 0' }};
        }

        .summary-title {
            font-weight: bold;
            color: #495057;
            margin-bottom: {{ ($font_size ?? 12) > 14 ? '8px' : '10px' }};
        }

        .toc {
            margin: 20px 0;
            page-break-after: always;
        }

        .toc-title {
            font-size: {{ ($font_size ?? 12) + 4 }}px;
            text-align: center;
            margin-bottom: 20px;
        }

        .toc-item {
            margin: {{ ($font_size ?? 12) > 14 ? '6px 0' : '8px 0' }};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .toc-level-1 {
            font-weight: bold;
            margin-left: 0;
        }

        .toc-level-2 {
            margin-left: 20px;
        }

        .clear-both {
            clear: both;
        }

        /* Responsive adjustments for large font sizes */
        @if(($font_size ?? 12) > 14)
        .small-cell {
            font-size: {{ ($font_size ?? 12) - 2 }}px;
        }

        .compact-cell {
            padding: 4px;
        }

        /* For landscape orientation, make some layout adjustments */
        @if(($orientation ?? 'landscape') == 'landscape')
        .table-container {
            margin: 15px 0;
        }

        .detailed-table th, .detailed-table td {
            padding: 6px;
        }
        @endif
        @endif

        /* Special handling for detailed tables with many columns */
        .detailed-info table {
            table-layout: fixed;
        }

        .detailed-info table td, .detailed-info table th {
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* Handle tables with many columns differently */
        .multi-column-table {
            font-size: {{ ($font_size ?? 12) - 1 }}px;
        }

        .multi-column-table th, .multi-column-table td {
            padding: {{ ($font_size ?? 12) > 14 ? '4px' : '6px' }};
        }

        /* Give column hints for table width distribution */
        .w-5 { width: 5%; }
        .w-10 { width: 10%; }
        .w-15 { width: 15%; }
        .w-20 { width: 20%; }
        .w-25 { width: 25%; }
        .w-30 { width: 30%; }
        .w-35 { width: 35%; }
        .w-40 { width: 40%; }
        .w-45 { width: 45%; }
        .w-50 { width: 50%; }
        .w-55 { width: 55%; }
        .w-60 { width: 60%; }

        /* Add page breaks between sections */
        .page-break {
            page-break-before: always;
        }

        /* Ensure content doesn't get cut off at page breaks */
        p, div, table {
            orphans: 3; /* Min number of lines at bottom of a page */
            widows: 3;  /* Min number of lines at top of a page */
        }
    </style>
</head>
<body>
    <!-- Trang bìa -->
    @if ($report_type !== 'statistics' && !empty($reportData))
    <div class="cover-page">
        @if (file_exists($logo ?? ''))
        <img src="{{ $logo }}" alt="Logo" class="logo">
        @endif
        <div class="title">BÁO CÁO KÊ KHAI GIẢNG VIÊN</div>
        <div class="subtitle">{{ $hocKy->ten_hoc_ky ?? 'N/A' }} ({{ $hocKy->namHoc->ten_nam_hoc ?? 'N/A' }})</div>
        
        <div class="meta">
            <p>Khoa: <strong>{{ $reportData[0]['khoa'] ?? 'Không xác định' }}</strong></p>
            <p>Thời gian tạo báo cáo: {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</p>
        </div>
    </div>

    <!-- Mục lục cho báo cáo chi tiết -->
    @if($report_type === 'detailed')
    <div class="toc">
        <div class="toc-title">MỤC LỤC</div>
        <div class="toc-item toc-level-1">1. Tổng quan báo cáo</div>
        @foreach ($reportData as $index => $row)
        <div class="toc-item toc-level-2">
            1.{{ $index + 1 }}. {{ $row['ten_giang_vien'] ?? 'Giảng viên '.$index+1 }} ({{ $row['ma_giang_vien'] ?? 'N/A' }})
        </div>
        @endforeach
    </div>
    @endif
    @endif

    <div class="container">
        <!-- Báo cáo Tổng quan hoặc Chi tiết -->
        @if (in_array($report_type, ['overview', 'detailed']) && !empty($data))

        <!-- Tổng quan báo cáo -->
        <h2>{{ $report_type === 'overview' ? 'BÁO CÁO TỔNG QUAN KÊ KHAI' : 'BÁO CÁO CHI TIẾT KÊ KHAI' }}</h2>
        
        <div class="summary-box">
            <div class="summary-title">Thông tin chung:</div>
            <p>Học kỳ: <strong>{{ $hocKy->ten_hoc_ky ?? 'N/A' }}</strong></p>
            <p>Năm học: <strong>{{ $hocKy->namHoc->ten_nam_hoc ?? 'N/A' }}</strong></p>
            <p>Số giảng viên: <strong>{{ count($data) }}</strong></p>
        </div>

        <!-- Bảng tổng quan - make it responsive by using calculated widths -->
        <div class="table-container">
            <!-- Count the number of columns to adjust sizing -->
            @php
                $columnCount = 0;
                foreach(['ma_giang_vien', 'ten_giang_vien', 'email', 'bo_mon', 'khoa', 'trang_thai', 
                'tong_gio_chuan', 'gio_chuan_giang_day', 'gio_chuan_nckh', 'gio_chuan_khac', 
                'ngay_nop', 'ly_do_tu_choi', 'dinh_muc'] as $col) {
                    if (in_array($col, $columns ?? [])) $columnCount++;
                }
                
                // Set class based on number of columns
                $tableClass = $columnCount > 8 ? 'multi-column-table' : '';
                
                // Calculate relative column widths based on content
                $widths = [
                    'ma_giang_vien' => $columnCount > 8 ? 6 : 8,
                    'ten_giang_vien' => $columnCount > 8 ? 12 : 15,
                    'email' => $columnCount > 8 ? 12 : 15,
                    'bo_mon' => $columnCount > 8 ? 8 : 10,
                    'khoa' => $columnCount > 8 ? 8 : 10,
                    'trang_thai' => $columnCount > 8 ? 8 : 10,
                    'tong_gio_chuan' => $columnCount > 8 ? 6 : 8,
                    'gio_chuan_giang_day' => $columnCount > 8 ? 6 : 8,
                    'gio_chuan_nckh' => $columnCount > 8 ? 6 : 8,
                    'gio_chuan_khac' => $columnCount > 8 ? 6 : 8,
                    'ngay_nop' => $columnCount > 8 ? 8 : 10,
                    'ly_do_tu_choi' => $columnCount > 8 ? 8 : 10,
                    'dinh_muc' => $columnCount > 8 ? 8 : 10
                ];
            @endphp
            
            <table class="{{ $tableClass }}">
                <thead>
                    <tr>
                        @if (in_array('ma_giang_vien', $columns ?? []))<th class="w-{{ $widths['ma_giang_vien'] }}">Mã GV</th>@endif
                        @if (in_array('ten_giang_vien', $columns ?? []))<th class="w-{{ $widths['ten_giang_vien'] }}">Tên Giảng viên</th>@endif
                        @if (in_array('email', $columns ?? []))<th class="w-{{ $widths['email'] }}">Email</th>@endif
                        @if (in_array('bo_mon', $columns ?? []))<th class="w-{{ $widths['bo_mon'] }}">Bộ môn</th>@endif
                        @if (in_array('khoa', $columns ?? []))<th class="w-{{ $widths['khoa'] }}">Khoa</th>@endif
                        @if (in_array('trang_thai', $columns ?? []))<th class="w-{{ $widths['trang_thai'] }}">Trạng thái</th>@endif
                        @if (in_array('tong_gio_chuan', $columns ?? []))<th class="w-{{ $widths['tong_gio_chuan'] }}">Tổng giờ</th>@endif
                        @if (in_array('gio_chuan_giang_day', $columns ?? []))<th class="w-{{ $widths['gio_chuan_giang_day'] }}">Giờ GD</th>@endif
                        @if (in_array('gio_chuan_nckh', $columns ?? []))<th class="w-{{ $widths['gio_chuan_nckh'] }}">Giờ NCKH</th>@endif
                        @if (in_array('gio_chuan_khac', $columns ?? []))<th class="w-{{ $widths['gio_chuan_khac'] }}">Giờ khác</th>@endif
                        @if (in_array('ngay_nop', $columns ?? []))<th class="w-{{ $widths['ngay_nop'] }}">Ngày nộp</th>@endif
                        @if (in_array('ly_do_tu_choi', $columns ?? []))<th class="w-{{ $widths['ly_do_tu_choi'] }}">Lý do từ chối</th>@endif
                        @if (in_array('dinh_muc', $columns ?? []))<th class="w-{{ $widths['dinh_muc'] }}">Định mức</th>@endif
                    </tr>
                </thead>
                <tbody>
                    @foreach ($reportData as $index => $row)
                    <tr>
                        @if (in_array('ma_giang_vien', $columns ?? []))<td>{{ $row['ma_giang_vien'] ?? 'N/A' }}</td>@endif
                        @if (in_array('ten_giang_vien', $columns ?? []))<td>{{ $row['ten_giang_vien'] ?? 'N/A' }}</td>@endif
                        @if (in_array('email', $columns ?? []))<td>{{ $row['email'] ?? 'N/A' }}</td>@endif
                        @if (in_array('bo_mon', $columns ?? []))<td>{{ $row['bo_mon'] ?? 'N/A' }}</td>@endif
                        @if (in_array('khoa', $columns ?? []))<td>{{ $row['khoa'] ?? 'N/A' }}</td>@endif
                        @if (in_array('trang_thai', $columns ?? []))<td>{{ $row['trang_thai'] ?? 'Chưa nộp' }}</td>@endif
                        @if (in_array('tong_gio_chuan', $columns ?? []))<td class="text-center">{{ number_format($row['tong_gio_chuan'] ?? 0, 2) }}</td>@endif
                        @if (in_array('gio_chuan_giang_day', $columns ?? []))<td class="text-center">{{ number_format($row['gio_chuan_giang_day'] ?? 0, 2) }}</td>@endif
                        @if (in_array('gio_chuan_nckh', $columns ?? []))<td class="text-center">{{ number_format($row['gio_chuan_nckh'] ?? 0, 2) }}</td>@endif
                        @if (in_array('gio_chuan_khac', $columns ?? []))<td class="text-center">{{ number_format($row['gio_chuan_khac'] ?? 0, 2) }}</td>@endif
                        @if (in_array('ngay_nop', $columns ?? []))<td>{{ $row['ngay_nop'] ?? 'N/A' }}</td>@endif
                        @if (in_array('ly_do_tu_choi', $columns ?? []))<td>{{ $row['ly_do_tu_choi'] ?? 'N/A' }}</td>@endif
                        @if (in_array('dinh_muc', $columns ?? []))<td class="text-center">{{ $row['dinh_muc']['gio_chuan'] ?? 0 }} ({{ number_format($row['dinh_muc']['ty_le_hoan_thanh'] ?? 0, 2) }}%)</td>@endif
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        
        <!-- Chi tiết từng giảng viên -->
        @if ($report_type === 'detailed')
            @foreach ($reportData as $index => $row)
            <div class="{{ $index > 0 ? 'page-break' : '' }}">
                <div class="section" style="border-top: 3px solid #3498db; padding-top: 15px; margin-top: 20px;">
                    <div style="background-color: #f2f6f9; padding: 10px; border-left: 5px solid #3498db; margin-bottom: 15px;">
                        <h3 style="margin-top: 0; white-space: normal; word-break: break-word;">Chi tiết kê khai - {{ $row['ten_giang_vien'] ?? 'Giảng viên' }} ({{ $row['ma_giang_vien'] ?? 'N/A' }})</h3>
                    </div>
                    
                    <div class="summary-box">
                        <div class="summary-title">Thông tin giảng viên:</div>
                        <table class="nested-table">
                            @if (in_array('ma_giang_vien', $columns ?? []))
                            <tr>
                                <td width="30%">Mã giảng viên:</td>
                                <td><strong>{{ $row['ma_giang_vien'] ?? 'N/A' }}</strong></td>
                            </tr>
                            @endif
                            @if (in_array('ten_giang_vien', $columns ?? []))
                            <tr>
                                <td>Họ và tên:</td>
                                <td><strong>{{ $row['ten_giang_vien'] ?? 'N/A' }}</strong></td>
                            </tr>
                            @endif
                            @if (in_array('email', $columns ?? []))
                            <tr>
                                <td>Email:</td>
                                <td>{{ $row['email'] ?? 'N/A' }}</td>
                            </tr>
                            @endif
                            @if (in_array('bo_mon', $columns ?? []))
                            <tr>
                                <td>Bộ môn:</td>
                                <td>{{ $row['bo_mon'] ?? 'N/A' }}</td>
                            </tr>
                            @endif
                            @if (in_array('khoa', $columns ?? []))
                            <tr>
                                <td>Khoa:</td>
                                <td>{{ $row['khoa'] ?? 'N/A' }}</td>
                            </tr>
                            @endif
                            @if (in_array('trang_thai', $columns ?? []))
                            <tr>
                                <td>Trạng thái:</td>
                                <td>{{ $row['trang_thai'] ?? 'Chưa nộp' }}</td>
                            </tr>
                            @endif
                            @if (in_array('ngay_nop', $columns ?? []))
                            <tr>
                                <td>Ngày nộp:</td>
                                <td>{{ $row['ngay_nop'] ?? 'N/A' }}</td>
                            </tr>
                            @endif
                        </table>
                    </div>

                    <!-- Chi tiết kê khai - Optimized for better space usage -->
                    @if (in_array('ke_khai_chi_tiet', $columns ?? []) && !empty($row['ke_khai_chi_tiet']))
                        @if (!empty($row['ke_khai_chi_tiet']['giang_day']))
                        <h4>1. Hoạt động giảng dạy</h4>
                        <table class="nested-table {{ $font_size > 14 ? 'compact-cell' : '' }}">
                            <thead>
                                <tr>
                                    <th width="5%" class="text-center">STT</th>
                                    <th width="{{ $font_size > 14 ? '35%' : '40%' }}">Hoạt động</th>
                                    <th width="10%" class="text-center">Số tiết</th>
                                    <th width="10%" class="text-center">Giờ chuẩn</th>
                                    <th width="{{ $font_size > 14 ? '25%' : '30%' }}">Học phần</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($row['ke_khai_chi_tiet']['giang_day'] as $i => $item)
                                <tr>
                                    <td class="text-center">{{ $i + 1 }}</td>
                                    <td>{{ $item['hoat_dong'] ?? 'N/A' }}</td>
                                    <td class="text-center">{{ $item['so_tiet'] ?? 0 }}</td>
                                    <td class="text-center">{{ number_format($item['gio_chuan'] ?? 0, 2) }}</td>
                                    <td>{{ $item['hoc_phan'] ?? 'N/A' }}</td>
                                </tr>
                                @endforeach
                                <tr>
                                    <td colspan="3" class="text-center"><strong>Tổng cộng</strong></td>
                                    <td class="text-center"><strong>{{ number_format($row['gio_chuan_giang_day'] ?? 0, 2) }}</strong></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                        @endif

                        <!-- Keep NCKH and other tables from breaking across pages -->
                        @if (!empty($row['ke_khai_chi_tiet']['nckh']))
                        <div class="table-container">
                            <h4>2. Hoạt động nghiên cứu khoa học</h4>
                            <table class="nested-table {{ $font_size > 14 ? 'compact-cell' : '' }}">
                                <thead>
                                    <tr>
                                        <th width="5%" class="text-center">STT</th>
                                        <th width="{{ $font_size > 14 ? '40%' : '45%' }}">Hoạt động</th>
                                        <th width="{{ $font_size > 14 ? '30%' : '35%' }}">Sản phẩm</th>
                                        <th width="15%" class="text-center">Giờ chuẩn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($row['ke_khai_chi_tiet']['nckh'] as $i => $item)
                                    <tr>
                                        <td class="text-center">{{ $i + 1 }}</td>
                                        <td>{{ $item['hoat_dong'] ?? 'N/A' }}</td>
                                        <td>{{ $item['san_pham'] ?? 'N/A' }}</td>
                                        <td class="text-center">{{ number_format($item['gio_chuan'] ?? 0, 2) }}</td>
                                    </tr>
                                    @endforeach
                                    <tr>
                                        <td colspan="3" class="text-center"><strong>Tổng cộng</strong></td>
                                        <td class="text-center"><strong>{{ number_format($row['gio_chuan_nckh'] ?? 0, 2) }}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        @endif

                        @if (!empty($row['ke_khai_chi_tiet']['khac']))
                        <div class="table-container">
                            <h4>3. Các hoạt động khác</h4>
                            <table class="nested-table {{ $font_size > 14 ? 'compact-cell' : '' }}">
                                <thead>
                                    <tr>
                                        <th width="5%" class="text-center">STT</th>
                                        <th width="{{ $font_size > 14 ? '55%' : '60%' }}">Hoạt động</th>
                                        <th width="15%" class="text-center">Số lượng</th>
                                        <th width="20%" class="text-center">Giờ chuẩn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($row['ke_khai_chi_tiet']['khac'] as $i => $item)
                                    <tr>
                                        <td class="text-center">{{ $i + 1 }}</td>
                                        <td>{{ $item['hoat_dong'] ?? 'N/A' }}</td>
                                        <td class="text-center">{{ $item['so_luong'] ?? 0 }}</td>
                                        <td class="text-center">{{ number_format($item['gio_chuan'] ?? 0, 2) }}</td>
                                    </tr>
                                    @endforeach
                                    <tr>
                                        <td colspan="3" class="text-center"><strong>Tổng cộng</strong></td>
                                        <td class="text-center"><strong>{{ number_format($row['gio_chuan_khac'] ?? 0, 2) }}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        @endif
                    @endif

                    <div class="summary-box">
                        <div class="summary-title">Tổng kết giờ chuẩn:</div>
                        <table class="nested-table">
                            <tr>
                                <td width="60%">Giờ chuẩn giảng dạy:</td>
                                <td width="40%" class="text-center"><strong>{{ number_format($row['gio_chuan_giang_day'] ?? 0, 2) }}</strong></td>
                            </tr>
                            <tr>
                                <td>Giờ chuẩn NCKH:</td>
                                <td class="text-center"><strong>{{ number_format($row['gio_chuan_nckh'] ?? 0, 2) }}</strong></td>
                            </tr>
                            <tr>
                                <td>Giờ chuẩn hoạt động khác:</td>
                                <td class="text-center"><strong>{{ number_format($row['gio_chuan_khac'] ?? 0, 2) }}</strong></td>
                            </tr>
                            <tr style="border-top: 1px solid #bdc3c7;">
                                <td>Tổng giờ chuẩn:</td>
                                <td class="text-center"><strong>{{ number_format($row['tong_gio_chuan'] ?? 0, 2) }}</strong></td>
                            </tr>
                            <tr>
                                <td>Định mức giờ chuẩn:</td>
                                <td class="text-center"><strong>{{ $row['dinh_muc']['gio_chuan'] ?? 0 }}</strong></td>
                            </tr>
                            <tr>
                                <td>Tỷ lệ hoàn thành:</td>
                                <td class="text-center"><strong>{{ number_format($row['dinh_muc']['ty_le_hoan_thanh'] ?? 0, 2) }}%</strong></td>
                            </tr>
                        </table>
                    </div>

                    <!-- Minh chứng -->
                    @if (in_array('minh_chung', $columns ?? []) && !empty($row['minh_chung']))
                    <div class="table-container">
                        <h4>Minh chứng đính kèm</h4>
                        <table class="nested-table {{ $font_size > 14 ? 'compact-cell' : '' }}">
                            <thead>
                                <tr>
                                    <th width="10%" class="text-center">STT</th>
                                    <th width="90%">Tên file</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($row['minh_chung'] as $idx => $minhChung)
                                <tr>
                                    <td class="text-center">{{ $idx + 1 }}</td>
                                    <td>{{ $minhChung['ten_file'] ?? 'N/A' }}</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    @endif

                    <!-- Lịch sử phê duyệt -->
                    @if (in_array('lich_su_phe_duyet', $columns ?? []) && !empty($row['lich_su_phe_duyet']))
                    <div class="table-container">
                        <h4>Lịch sử phê duyệt</h4>
                        <table class="nested-table {{ $font_size > 14 ? 'compact-cell' : '' }}">
                            <thead>
                                <tr>
                                    <th width="5%" class="text-center">STT</th>
                                    <th width="20%">Người thực hiện</th>
                                    <th width="15%">Hành động</th>
                                    <th width="{{ $font_size > 14 ? '35%' : '40%' }}">Ghi chú</th>
                                    <th width="20%">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($row['lich_su_phe_duyet'] as $idx => $log)
                                <tr>
                                    <td class="text-center">{{ $idx + 1 }}</td>
                                    <td>{{ $log['nguoi_thuc_hien'] ?? 'N/A' }}</td>
                                    <td>{{ $log['hanh_dong'] ?? 'N/A' }}</td>
                                    <td>{{ $log['ghi_chu'] ?? 'N/A' }}</td>
                                    <td>{{ $log['thoi_gian'] ?? 'N/A' }}</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    @endif
                </div>
            </div>
            @endforeach
        @endif
        @elseif (in_array($report_type, ['overview', 'detailed']) && empty($data) && !empty($reportData))
        <!-- Check for reportData as a fallback for missing data variable -->
        <!-- Tổng quan báo cáo -->
        <h2>{{ $report_type === 'overview' ? 'BÁO CÁO TỔNG QUAN KÊ KHAI' : 'BÁO CÁO CHI TIẾT KÊ KHAI' }}</h2>
        
        <div class="summary-box">
            <div class="summary-title">Thông tin chung:</div>
            <p>Học kỳ: <strong>{{ $hocKy->ten_hoc_ky ?? 'N/A' }}</strong></p>
            <p>Năm học: <strong>{{ $hocKy->namHoc->ten_nam_hoc ?? 'N/A' }}</strong></p>
            <p>Số giảng viên: <strong>{{ count($reportData) }}</strong></p>
        </div>

        <!-- Bảng tổng quan - make it responsive by using calculated widths -->
        <div class="table-container">
            <!-- Count the number of columns to adjust sizing -->
            @php
                $columnCount = 0;
                foreach(['ma_giang_vien', 'ten_giang_vien', 'email', 'bo_mon', 'khoa', 'trang_thai', 
                'tong_gio_chuan', 'gio_chuan_giang_day', 'gio_chuan_nckh', 'gio_chuan_khac', 
                'ngay_nop', 'ly_do_tu_choi', 'dinh_muc'] as $col) {
                    if (in_array($col, $columns ?? [])) $columnCount++;
                }
                
                // Set class based on number of columns
                $tableClass = $columnCount > 8 ? 'multi-column-table' : '';
                
                // Calculate relative column widths based on content
                $widths = [
                    'ma_giang_vien' => $columnCount > 8 ? 6 : 8,
                    'ten_giang_vien' => $columnCount > 8 ? 12 : 15,
                    'email' => $columnCount > 8 ? 12 : 15,
                    'bo_mon' => $columnCount > 8 ? 8 : 10,
                    'khoa' => $columnCount > 8 ? 8 : 10,
                    'trang_thai' => $columnCount > 8 ? 8 : 10,
                    'tong_gio_chuan' => $columnCount > 8 ? 6 : 8,
                    'gio_chuan_giang_day' => $columnCount > 8 ? 6 : 8,
                    'gio_chuan_nckh' => $columnCount > 8 ? 6 : 8,
                    'gio_chuan_khac' => $columnCount > 8 ? 6 : 8,
                    'ngay_nop' => $columnCount > 8 ? 8 : 10,
                    'ly_do_tu_choi' => $columnCount > 8 ? 8 : 10,
                    'dinh_muc' => $columnCount > 8 ? 8 : 10
                ];
            @endphp
            
            <table class="{{ $tableClass }}">
                <thead>
                    <tr>
                        @if (in_array('ma_giang_vien', $columns ?? []))<th class="w-{{ $widths['ma_giang_vien'] }}">Mã GV</th>@endif
                        @if (in_array('ten_giang_vien', $columns ?? []))<th class="w-{{ $widths['ten_giang_vien'] }}">Tên Giảng viên</th>@endif
                        @if (in_array('email', $columns ?? []))<th class="w-{{ $widths['email'] }}">Email</th>@endif
                        @if (in_array('bo_mon', $columns ?? []))<th class="w-{{ $widths['bo_mon'] }}">Bộ môn</th>@endif
                        @if (in_array('khoa', $columns ?? []))<th class="w-{{ $widths['khoa'] }}">Khoa</th>@endif
                        @if (in_array('trang_thai', $columns ?? []))<th class="w-{{ $widths['trang_thai'] }}">Trạng thái</th>@endif
                        @if (in_array('tong_gio_chuan', $columns ?? []))<th class="w-{{ $widths['tong_gio_chuan'] }}">Tổng giờ</th>@endif
                        @if (in_array('gio_chuan_giang_day', $columns ?? []))<th class="w-{{ $widths['gio_chuan_giang_day'] }}">Giờ GD</th>@endif
                        @if (in_array('gio_chuan_nckh', $columns ?? []))<th class="w-{{ $widths['gio_chuan_nckh'] }}">Giờ NCKH</th>@endif
                        @if (in_array('gio_chuan_khac', $columns ?? []))<th class="w-{{ $widths['gio_chuan_khac'] }}">Giờ khác</th>@endif
                        @if (in_array('ngay_nop', $columns ?? []))<th class="w-{{ $widths['ngay_nop'] }}">Ngày nộp</th>@endif
                        @if (in_array('ly_do_tu_choi', $columns ?? []))<th class="w-{{ $widths['ly_do_tu_choi'] }}">Lý do từ chối</th>@endif
                        @if (in_array('dinh_muc', $columns ?? []))<th class="w-{{ $widths['dinh_muc'] }}">Định mức</th>@endif
                    </tr>
                </thead>
                <tbody>
                    @foreach ($reportData as $index => $row)
                    <tr>
                        @if (in_array('ma_giang_vien', $columns ?? []))<td>{{ $row['ma_giang_vien'] ?? 'N/A' }}</td>@endif
                        @if (in_array('ten_giang_vien', $columns ?? []))<td>{{ $row['ten_giang_vien'] ?? 'N/A' }}</td>@endif
                        @if (in_array('email', $columns ?? []))<td>{{ $row['email'] ?? 'N/A' }}</td>@endif
                        @if (in_array('bo_mon', $columns ?? []))<td>{{ $row['bo_mon'] ?? 'N/A' }}</td>@endif
                        @if (in_array('khoa', $columns ?? []))<td>{{ $row['khoa'] ?? 'N/A' }}</td>@endif
                        @if (in_array('trang_thai', $columns ?? []))<td>{{ $row['trang_thai'] ?? 'Chưa nộp' }}</td>@endif
                        @if (in_array('tong_gio_chuan', $columns ?? []))<td class="text-center">{{ number_format($row['tong_gio_chuan'] ?? 0, 2) }}</td>@endif
                        @if (in_array('gio_chuan_giang_day', $columns ?? []))<td class="text-center">{{ number_format($row['gio_chuan_giang_day'] ?? 0, 2) }}</td>@endif
                        @if (in_array('gio_chuan_nckh', $columns ?? []))<td class="text-center">{{ number_format($row['gio_chuan_nckh'] ?? 0, 2) }}</td>@endif
                        @if (in_array('gio_chuan_khac', $columns ?? []))<td class="text-center">{{ number_format($row['gio_chuan_khac'] ?? 0, 2) }}</td>@endif
                        @if (in_array('ngay_nop', $columns ?? []))<td>{{ $row['ngay_nop'] ?? 'N/A' }}</td>@endif
                        @if (in_array('ly_do_tu_choi', $columns ?? []))<td>{{ $row['ly_do_tu_choi'] ?? 'N/A' }}</td>@endif
                        @if (in_array('dinh_muc', $columns ?? []))<td class="text-center">{{ $row['dinh_muc']['gio_chuan'] ?? 0 }} ({{ number_format($row['dinh_muc']['ty_le_hoan_thanh'] ?? 0, 2) }}%)</td>@endif
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        
        <!-- Chi tiết từng giảng viên -->
        @if ($report_type === 'detailed')
            @foreach ($reportData as $index => $row)
            <!-- Include the detailed section for each row -->
            <div class="{{ $index > 0 ? 'page-break' : '' }}">
                <!-- The detailed view code is the same as in the other section -->
                <div class="section" style="border-top: 3px solid #3498db; padding-top: 15px; margin-top: 20px;">
                    <div style="background-color: #f2f6f9; padding: 10px; border-left: 5px solid #3498db; margin-bottom: 15px;">
                        <h3 style="margin-top: 0; white-space: normal; word-break: break-word;">Chi tiết kê khai - {{ $row['ten_giang_vien'] ?? 'Giảng viên' }} ({{ $row['ma_giang_vien'] ?? 'N/A' }})</h3>
                    </div>
                    
                    <div class="summary-box">
                        <div class="summary-title">Thông tin giảng viên:</div>
                        <table class="nested-table">
                            @if (in_array('ma_giang_vien', $columns ?? []))
                            <tr>
                                <td width="30%">Mã giảng viên:</td>
                                <td><strong>{{ $row['ma_giang_vien'] ?? 'N/A' }}</strong></td>
                            </tr>
                            @endif
                            @if (in_array('ten_giang_vien', $columns ?? []))
                            <tr>
                                <td>Họ và tên:</td>
                                <td><strong>{{ $row['ten_giang_vien'] ?? 'N/A' }}</strong></td>
                            </tr>
                            @endif
                            @if (in_array('email', $columns ?? []))
                            <tr>
                                <td>Email:</td>
                                <td>{{ $row['email'] ?? 'N/A' }}</td>
                            </tr>
                            @endif
                            @if (in_array('bo_mon', $columns ?? []))
                            <tr>
                                <td>Bộ môn:</td>
                                <td>{{ $row['bo_mon'] ?? 'N/A' }}</td>
                            </tr>
                            @endif
                            @if (in_array('khoa', $columns ?? []))
                            <tr>
                                <td>Khoa:</td>
                                <td>{{ $row['khoa'] ?? 'N/A' }}</td>
                            </tr>
                            @endif
                            @if (in_array('trang_thai', $columns ?? []))
                            <tr>
                                <td>Trạng thái:</td>
                                <td>{{ $row['trang_thai'] ?? 'Chưa nộp' }}</td>
                            </tr>
                            @endif
                            @if (in_array('ngay_nop', $columns ?? []))
                            <tr>
                                <td>Ngày nộp:</td>
                                <td>{{ $row['ngay_nop'] ?? 'N/A' }}</td>
                            </tr>
                            @endif
                        </table>
                    </div>

                    <!-- Chi tiết kê khai - Optimized for better space usage -->
                    @if (in_array('ke_khai_chi_tiet', $columns ?? []) && !empty($row['ke_khai_chi_tiet']))
                        @if (!empty($row['ke_khai_chi_tiet']['giang_day']))
                        <h4>1. Hoạt động giảng dạy</h4>
                        <table class="nested-table {{ $font_size > 14 ? 'compact-cell' : '' }}">
                            <thead>
                                <tr>
                                    <th width="5%" class="text-center">STT</th>
                                    <th width="{{ $font_size > 14 ? '35%' : '40%' }}">Hoạt động</th>
                                    <th width="10%" class="text-center">Số tiết</th>
                                    <th width="10%" class="text-center">Giờ chuẩn</th>
                                    <th width="{{ $font_size > 14 ? '25%' : '30%' }}">Học phần</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($row['ke_khai_chi_tiet']['giang_day'] as $i => $item)
                                <tr>
                                    <td class="text-center">{{ $i + 1 }}</td>
                                    <td>{{ $item['hoat_dong'] ?? 'N/A' }}</td>
                                    <td class="text-center">{{ $item['so_tiet'] ?? 0 }}</td>
                                    <td class="text-center">{{ number_format($item['gio_chuan'] ?? 0, 2) }}</td>
                                    <td>{{ $item['hoc_phan'] ?? 'N/A' }}</td>
                                </tr>
                                @endforeach
                                <tr>
                                    <td colspan="3" class="text-center"><strong>Tổng cộng</strong></td>
                                    <td class="text-center"><strong>{{ number_format($row['gio_chuan_giang_day'] ?? 0, 2) }}</strong></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                        @endif

                        <!-- Keep NCKH and other tables from breaking across pages -->
                        @if (!empty($row['ke_khai_chi_tiet']['nckh']))
                        <div class="table-container">
                            <h4>2. Hoạt động nghiên cứu khoa học</h4>
                            <table class="nested-table {{ $font_size > 14 ? 'compact-cell' : '' }}">
                                <thead>
                                    <tr>
                                        <th width="5%" class="text-center">STT</th>
                                        <th width="{{ $font_size > 14 ? '40%' : '45%' }}">Hoạt động</th>
                                        <th width="{{ $font_size > 14 ? '30%' : '35%' }}">Sản phẩm</th>
                                        <th width="15%" class="text-center">Giờ chuẩn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($row['ke_khai_chi_tiet']['nckh'] as $i => $item)
                                    <tr>
                                        <td class="text-center">{{ $i + 1 }}</td>
                                        <td>{{ $item['hoat_dong'] ?? 'N/A' }}</td>
                                        <td>{{ $item['san_pham'] ?? 'N/A' }}</td>
                                        <td class="text-center">{{ number_format($item['gio_chuan'] ?? 0, 2) }}</td>
                                    </tr>
                                    @endforeach
                                    <tr>
                                        <td colspan="3" class="text-center"><strong>Tổng cộng</strong></td>
                                        <td class="text-center"><strong>{{ number_format($row['gio_chuan_nckh'] ?? 0, 2) }}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        @endif

                        @if (!empty($row['ke_khai_chi_tiet']['khac']))
                        <div class="table-container">
                            <h4>3. Các hoạt động khác</h4>
                            <table class="nested-table {{ $font_size > 14 ? 'compact-cell' : '' }}">
                                <thead>
                                    <tr>
                                        <th width="5%" class="text-center">STT</th>
                                        <th width="{{ $font_size > 14 ? '55%' : '60%' }}">Hoạt động</th>
                                        <th width="15%" class="text-center">Số lượng</th>
                                        <th width="20%" class="text-center">Giờ chuẩn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($row['ke_khai_chi_tiet']['khac'] as $i => $item)
                                    <tr>
                                        <td class="text-center">{{ $i + 1 }}</td>
                                        <td>{{ $item['hoat_dong'] ?? 'N/A' }}</td>
                                        <td class="text-center">{{ $item['so_luong'] ?? 0 }}</td>
                                        <td class="text-center">{{ number_format($item['gio_chuan'] ?? 0, 2) }}</td>
                                    </tr>
                                    @endforeach
                                    <tr>
                                        <td colspan="3" class="text-center"><strong>Tổng cộng</strong></td>
                                        <td class="text-center"><strong>{{ number_format($row['gio_chuan_khac'] ?? 0, 2) }}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        @endif
                    @endif

                    <div class="summary-box">
                        <div class="summary-title">Tổng kết giờ chuẩn:</div>
                        <table class="nested-table">
                            <tr>
                                <td width="60%">Giờ chuẩn giảng dạy:</td>
                                <td width="40%" class="text-center"><strong>{{ number_format($row['gio_chuan_giang_day'] ?? 0, 2) }}</strong></td>
                            </tr>
                            <tr>
                                <td>Giờ chuẩn NCKH:</td>
                                <td class="text-center"><strong>{{ number_format($row['gio_chuan_nckh'] ?? 0, 2) }}</strong></td>
                            </tr>
                            <tr>
                                <td>Giờ chuẩn hoạt động khác:</td>
                                <td class="text-center"><strong>{{ number_format($row['gio_chuan_khac'] ?? 0, 2) }}</strong></td>
                            </tr>
                            <tr style="border-top: 1px solid #bdc3c7;">
                                <td>Tổng giờ chuẩn:</td>
                                <td class="text-center"><strong>{{ number_format($row['tong_gio_chuan'] ?? 0, 2) }}</strong></td>
                            </tr>
                            <tr>
                                <td>Định mức giờ chuẩn:</td>
                                <td class="text-center"><strong>{{ $row['dinh_muc']['gio_chuan'] ?? 0 }}</strong></td>
                            </tr>
                            <tr>
                                <td>Tỷ lệ hoàn thành:</td>
                                <td class="text-center"><strong>{{ number_format($row['dinh_muc']['ty_le_hoan_thanh'] ?? 0, 2) }}%</strong></td>
                            </tr>
                        </table>
                    </div>

                    <!-- Minh chứng -->
                    @if (in_array('minh_chung', $columns ?? []) && !empty($row['minh_chung']))
                    <div class="table-container">
                        <h4>Minh chứng đính kèm</h4>
                        <table class="nested-table {{ $font_size > 14 ? 'compact-cell' : '' }}">
                            <thead>
                                <tr>
                                    <th width="10%" class="text-center">STT</th>
                                    <th width="90%">Tên file</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($row['minh_chung'] as $idx => $minhChung)
                                <tr>
                                    <td class="text-center">{{ $idx + 1 }}</td>
                                    <td>{{ $minhChung['ten_file'] ?? 'N/A' }}</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    @endif

                    <!-- Lịch sử phê duyệt -->
                    @if (in_array('lich_su_phe_duyet', $columns ?? []) && !empty($row['lich_su_phe_duyet']))
                    <div class="table-container">
                        <h4>Lịch sử phê duyệt</h4>
                        <table class="nested-table {{ $font_size > 14 ? 'compact-cell' : '' }}">
                            <thead>
                                <tr>
                                    <th width="5%" class="text-center">STT</th>
                                    <th width="20%">Người thực hiện</th>
                                    <th width="15%">Hành động</th>
                                    <th width="{{ $font_size > 14 ? '35%' : '40%' }}">Ghi chú</th>
                                    <th width="20%">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($row['lich_su_phe_duyet'] as $idx => $log)
                                <tr>
                                    <td class="text-center">{{ $idx + 1 }}</td>
                                    <td>{{ $log['nguoi_thuc_hien'] ?? 'N/A' }}</td>
                                    <td>{{ $log['hanh_dong'] ?? 'N/A' }}</td>
                                    <td>{{ $log['ghi_chu'] ?? 'N/A' }}</td>
                                    <td>{{ $log['thoi_gian'] ?? 'N/A' }}</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    @endif
                </div>
            </div>
            @endforeach
        @endif
        @elseif (in_array($report_type, ['overview', 'detailed']) && empty($data) && empty($reportData))
        <div class="section">
            <h2>Không tìm thấy dữ liệu</h2>
            <p class="text-center">Không có dữ liệu kê khai nào phù hợp với điều kiện tìm kiếm.</p>
        </div>
        @endif

        <!-- Báo cáo Thống kê -->
        @if ($report_type === 'statistics' && !empty($statistics))
        <h2>BÁO CÁO THỐNG KÊ KÊ KHAI</h2>
        
        <div class="summary-box">
            <div class="summary-title">Thông tin chung:</div>
            <p>Học kỳ: <strong>{{ $hocKy->ten_hoc_ky ?? 'N/A' }}</strong></p>
            <p>Năm học: <strong>{{ $hocKy->namHoc->ten_nam_hoc ?? 'N/A' }}</strong></p>
        </div>
        
        <div class="chart-container">
            <h3>Biểu đồ phân bố giờ chuẩn theo loại hoạt động</h3>
            <div style="max-width: 100%; height: 350px; margin: 0 auto;">
                <canvas id="hoursChart" style="width: 100%; height: 100%;"></canvas>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
            <script>
                document.addEventListener('DOMContentLoaded', function () {
                    const ctx = document.getElementById('hoursChart').getContext('2d');
                    
                    // Create a responsive chart
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ['Giảng dạy', 'Nghiên cứu khoa học', 'Hoạt động khác'],
                            datasets: [{
                                label: 'Giờ chuẩn',
                                data: [
                                    {{ $statistics['giang_day'] ?? 0 }},
                                    {{ $statistics['nckh'] ?? 0 }},
                                    {{ $statistics['khac'] ?? 0 }}
                                ],
                                backgroundColor: ['#3498db', '#e74c3c', '#2ecc71'],
                                borderColor: ['#2980b9', '#c0392b', '#27ae60'],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Giờ chuẩn'
                                    }
                                },
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Loại hoạt động'
                                    }
                                }
                            },
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Phân bố giờ chuẩn theo loại hoạt động',
                                    font: {
                                        size: {{ ($font_size ?? 12) + 2 }}
                                    }
                                },
                                legend: {
                                    position: 'top'
                                }
                            }
                        }
                    });
                });
            </script>
        </div>

        <div class="table-container">
            <h3>Bảng thống kê chi tiết</h3>
            <table>
                <thead>
                    <tr>
                        <th width="10%" class="text-center">STT</th>
                        <th width="35%">Loại hoạt động</th>
                        <th width="25%" class="text-center">Tổng giờ chuẩn</th>
                        <th width="30%" class="text-center">Tỷ lệ (%)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="text-center">1</td>
                        <td>Giảng dạy</td>
                        <td class="text-center">{{ number_format($statistics['giang_day'] ?? 0, 2) }}</td>
                        <td class="text-center">{{ $statistics['total'] ? number_format(($statistics['giang_day'] / $statistics['total']) * 100, 2) : 0 }}%</td>
                    </tr>
                    <tr>
                        <td class="text-center">2</td>
                        <td>Nghiên cứu khoa học</td>
                        <td class="text-center">{{ number_format($statistics['nckh'] ?? 0, 2) }}</td>
                        <td class="text-center">{{ $statistics['total'] ? number_format(($statistics['nckh'] / $statistics['total']) * 100, 2) : 0 }}%</td>
                    </tr>
                    <tr>
                        <td class="text-center">3</td>
                        <td>Hoạt động khác</td>
                        <td class="text-center">{{ number_format($statistics['khac'] ?? 0, 2) }}</td>
                        <td class="text-center">{{ $statistics['total'] ? number_format(($statistics['khac'] / $statistics['total']) * 100, 2) : 0 }}%</td>
                    </tr>
                    <tr>
                        <td colspan="2" class="text-center"><strong>TỔNG CỘNG</strong></td>
                        <td class="text-center"><strong>{{ number_format($statistics['total'] ?? 0, 2) }}</strong></td>
                        <td class="text-center"><strong>100%</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        @elseif ($report_type === 'statistics' && empty($statistics))
        <div class="section">
            <h2>Không tìm thấy dữ liệu thống kê</h2>
            <p class="text-center">Không có dữ liệu thống kê nào phù hợp với điều kiện tìm kiếm.</p>
        </div>
        @endif
    </div>

    <div class="footer">
        <span>Trang <span class="page-number"></span></span> | 
        <span>Báo cáo được tạo vào: {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</span>
    </div>
</body>
</html>