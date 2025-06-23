<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo Cáo Kê Khai - {{ $hocKy->ten_hoc_ky }} - {{ $hocKy->namHoc->ten_nam_hoc }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: {{ $font_size ?? $fontSize ?? 12 }}px;
            line-height: 1.4;
            color: #333;
        }
        h1, h2, h3 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .section {
            margin-bottom: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .sub-table {
            margin-left: 20px;
            width: 95%;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>BÁO CÁO KÊ KHAI GIỜ CHUẨN</h1>
        <h2>Học kỳ: {{ $hocKy->ten_hoc_ky }} - Năm học: {{ $hocKy->namHoc->ten_nam_hoc }}</h2>
    </div>

    @foreach ($data as $lecturer)
        <div class="section">
            <h3>Thông tin giảng viên</h3>
            <table>
                @if (in_array('ma_giang_vien', $columns))
                    <tr><th>Mã giảng viên</th><td>{{ $lecturer['ma_giang_vien'] }}</td></tr>
                @endif
                @if (in_array('ten_giang_vien', $columns))
                    <tr><th>Tên giảng viên</th><td>{{ $lecturer['ten_giang_vien'] }}</td></tr>
                @endif
                @if (in_array('email', $columns))
                    <tr><th>Email</th><td>{{ $lecturer['email'] }}</td></tr>
                @endif
                @if (in_array('khoa', $columns))
                    <tr><th>Khoa</th><td>{{ $lecturer['khoa'] }}</td></tr>
                @endif
                @if (in_array('bo_mon', $columns))
                    <tr><th>Bộ môn</th><td>{{ $lecturer['bo_mon'] }}</td></tr>
                @endif
                @if (in_array('trang_thai', $columns))
                    <tr><th>Trạng thái</th><td>{{ $lecturer['trang_thai'] }}</td></tr>
                @endif
                @if (in_array('tong_gio_chuan', $columns))
                    <tr><th>Tổng giờ chuẩn</th><td>{{ number_format($lecturer['tong_gio_chuan'], 2) }}</td></tr>
                @endif
                @if (in_array('gio_chuan_giang_day', $columns))
                    <tr><th>Giờ chuẩn giảng dạy</th><td>{{ number_format($lecturer['gio_chuan_giang_day'], 2) }}</td></tr>
                @endif
                @if (in_array('gio_chuan_nckh', $columns))
                    <tr><th>Giờ chuẩn NCKH</th><td>{{ number_format($lecturer['gio_chuan_nckh'], 2) }}</td></tr>
                @endif
                @if (in_array('gio_chuan_khac', $columns))
                    <tr><th>Giờ chuẩn khác</th><td>{{ number_format($lecturer['gio_chuan_khac'], 2) }}</td></tr>
                @endif
                @if (in_array('ngay_nop', $columns))
                    <tr><th>Ngày nộp</th><td>{{ $lecturer['ngay_nop'] }}</td></tr>
                @endif
                @if (in_array('ly_do_tu_choi', $columns))
                    <tr><th>Lý do từ chối</th><td>{{ $lecturer['ly_do_tu_choi'] }}</td></tr>
                @endif
                @if (in_array('dinh_muc', $columns))
                    <tr><th>Định mức giờ chuẩn</th><td>{{ number_format($lecturer['dinh_muc']['gio_chuan'], 2) }}</td></tr>
                    <tr><th>Tỷ lệ hoàn thành</th><td>{{ number_format($lecturer['dinh_muc']['ty_le_hoan_thanh'], 2) }}%</td></tr>
                @endif
            </table>

            @if (in_array('ke_khai_chi_tiet', $columns))
                <h3>Chi tiết kê khai</h3>
                <!-- Giảng dạy -->
                @if (!empty($lecturer['ke_khai_chi_tiet']['giang_day']))
                    <h4>Hoạt động giảng dạy</h4>
                    <table class="sub-table">
                        <thead>
                            <tr>
                                <th>Hoạt động</th>
                                <th>Học phần</th>
                                <th>Số tiết</th>
                                <th>Giờ chuẩn</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($lecturer['ke_khai_chi_tiet']['giang_day'] as $item)
                                <tr>
                                    <td>{{ $item['hoat_dong'] }}</td>
                                    <td>{{ $item['hoc_phan'] }}</td>
                                    <td>{{ $item['so_tiet'] }}</td>
                                    <td>{{ number_format($item['gio_chuan'], 2) }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @endif

                <!-- NCKH -->
                @if (!empty($lecturer['ke_khai_chi_tiet']['nckh']))
                    <h4>Hoạt động nghiên cứu khoa học</h4>
                    <table class="sub-table">
                        <thead>
                            <tr>
                                <th>Hoạt động</th>
                                <th>Sản phẩm</th>
                                <th>Giờ chuẩn</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($lecturer['ke_khai_chi_tiet']['nckh'] as $item)
                                <tr>
                                    <td>{{ $item['hoat_dong'] }}</td>
                                    <td>{{ $item['san_pham'] }}</td>
                                    <td>{{ number_format($item['gio_chuan'], 2) }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @endif

                <!-- Hoạt động khác -->
                @if (!empty($lecturer['ke_khai_chi_tiet']['khac']))
                    <h4>Hoạt động khác</h4>
                    <table class="sub-table">
                        <thead>
                            <tr>
                                <th>Hoạt động</th>
                                <th>Số lượng</th>
                                <th>Giờ chuẩn</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($lecturer['ke_khai_chi_tiet']['khac'] as $item)
                                <tr>
                                    <td>{{ $item['hoat_dong'] }}</td>
                                    <td>{{ $item['so_luong'] }}</td>
                                    <td>{{ number_format($item['gio_chuan'], 2) }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @endif
            @endif

            @if (in_array('minh_chung', $columns) && !empty($lecturer['minh_chung']))
                <h3>Minh chứng</h3>
                <table class="sub-table">
                    <thead>
                        <tr>
                            <th>Tên file</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($lecturer['minh_chung'] as $minhChung)
                            <tr>
                                <td>{{ $minhChung['ten_file'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif

            @if (in_array('lich_su_phe_duyet', $columns) && !empty($lecturer['lich_su_phe_duyet']))
                <h3>Lịch sử phê duyệt</h3>
                <table class="sub-table">
                    <thead>
                        <tr>
                            <th>Người thực hiện</th>
                            <th>Hành động</th>
                            <th>Ghi chú</th>
                            <th>Thời gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($lecturer['lich_su_phe_duyet'] as $history)
                            <tr>
                                <td>{{ $history['nguoi_thuc_hien'] }}</td>
                                <td>{{ $history['hanh_dong'] }}</td>
                                <td>{{ $history['ghi_chu'] }}</td>
                                <td>{{ $history['thoi_gian'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>
    @endforeach
</body>
</html>