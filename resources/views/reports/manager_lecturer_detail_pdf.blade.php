<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo cáo Chi tiết Kê khai - {{ $keKhaiData['ma_gv'] ?? 'N/A' }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: {{ $fontSize ?? 10 }}px;
            margin: 0;
            padding: 15px;
            line-height: 1.3;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        
        .header h1 {
            font-size: {{ ($fontSize ?? 10) + 6 }}px;
            margin: 5px 0;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .header h2 {
            font-size: {{ ($fontSize ?? 10) + 2 }}px;
            margin: 3px 0;
            font-weight: bold;
            color: #34495e;
        }
        
        .header p {
            margin: 2px 0;
            color: #555;
        }
        
        .lecturer-info {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            border-left: 4px solid #3498db;
        }
        
        .lecturer-info h3 {
            margin-top: 0;
            color: #2c3e50;
            font-size: {{ ($fontSize ?? 10) + 2 }}px;
        }
        
        .info-grid {
            display: table;
            width: 100%;
        }
        
        .info-row {
            display: table-row;
        }
        
        .info-cell {
            display: table-cell;
            width: 50%;
            padding: 3px 10px 3px 0;
        }
        
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            background-color: #fff;
        }
        
        .summary-table th,
        .summary-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        .summary-table th {
            background-color: #3498db;
            color: white;
            font-weight: bold;
            text-align: center;
        }
        
        .summary-table .number {
            text-align: right;
        }
        
        .section-title {
            background-color: #34495e;
            color: white;
            padding: 8px 10px;
            margin: 20px 0 10px 0;
            font-weight: bold;
            font-size: {{ ($fontSize ?? 10) + 1 }}px;
        }
        
        .detail-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: {{ ($fontSize ?? 10) - 1 }}px;
        }
        
        .detail-table th,
        .detail-table td {
            border: 1px solid #bdc3c7;
            padding: 5px;
            text-align: center;
            vertical-align: middle;
        }
        
        .detail-table th {
            background-color: #ecf0f1;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .detail-table .text-left {
            text-align: left;
        }
        
        .detail-table .number {
            text-align: right;
        }
        
        .highlight {
            background-color: #fff3cd;
            font-weight: bold;
        }
        
        .signature-section {
            margin-top: 40px;
            display: table;
            width: 100%;
        }
        
        .signature-block {
            display: table-cell;
            width: 50%;
            text-align: center;
            vertical-align: top;
            padding: 10px;
        }
        
        .signature-title {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: {{ ($fontSize ?? 10) + 1 }}px;
        }
        
        .signature-subtitle {
            font-style: italic;
            font-size: {{ ($fontSize ?? 10) - 1 }}px;
            margin-bottom: 50px;
        }
        
        .signature-name {
            font-weight: bold;
            margin-top: 20px;
        }
        
        .page-break {
            page-break-after: always;
        }
        
        .no-data {
            text-align: center;
            font-style: italic;
            color: #7f8c8d;
            padding: 20px;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: {{ ($fontSize ?? 10) - 1 }}px;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <p><strong>BỘ NÔNG NGHIỆP & PTNT</strong></p>
        <p><strong>TRƯỜNG ĐẠI HỌC THỦY LỢI</strong></p>
        <h1>BÁO CÁO CHI TIẾT KÊ KHAI GIỜ CHUẨN</h1>
        <h2>NĂM HỌC {{ $namHoc->ten_nam_hoc ?? 'N/A' }}</h2>
        <p>Bộ môn: {{ $boMon->ten_bo_mon ?? 'N/A' }}</p>
    </div>

    <!-- Lecturer Information -->
    <div class="lecturer-info">
        <h3>Thông tin Giảng viên</h3>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-cell"><strong>Họ và tên:</strong> {{ $keKhaiData['ho_ten'] ?? 'N/A' }}</div>
                <div class="info-cell"><strong>Mã giảng viên:</strong> {{ $keKhaiData['ma_gv'] ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-cell"><strong>Học hàm:</strong> {{ $keKhaiData['hoc_ham'] ?? 'N/A' }}</div>
                <div class="info-cell"><strong>Học vị:</strong> {{ $keKhaiData['hoc_vi'] ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-cell"><strong>Định mức GD:</strong> {{ number_format($keKhaiData['dinhmuc_gd_apdung'] ?? 0, 2) }}</div>
                <div class="info-cell"><strong>Định mức KHCN:</strong> {{ number_format($keKhaiData['dinhmuc_khcn_apdung'] ?? 0, 2) }}</div>
            </div>
        </div>
    </div>

    <!-- Summary Table -->
    <table class="summary-table">
        <thead>
            <tr>
                <th colspan="4">TỔNG HỢP KẾT QUẢ KÊ KHAI</th>
            </tr>
            <tr>
                <th style="width: 40%;">Hạng mục</th>
                <th style="width: 20%;">Định mức</th>
                <th style="width: 20%;">Thực hiện</th>
                <th style="width: 20%;">Ghi chú</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Giảng dạy</strong></td>
                <td class="number">{{ number_format($keKhaiData['dinhmuc_gd_apdung'] ?? 0, 2) }}</td>
                <td class="number">{{ number_format($keKhaiData['tong_gio_giangday_final_tam_tinh'] ?? 0, 2) }}</td>
                <td>Bao gồm giảng dạy và hướng dẫn</td>
            </tr>
            <tr>
                <td><strong>Nghiên cứu khoa học</strong></td>
                <td class="number">{{ number_format($keKhaiData['dinhmuc_khcn_apdung'] ?? 0, 2) }}</td>
                <td class="number">{{ number_format($keKhaiData['tong_gio_khcn_kekhai_tam_tinh'] ?? 0, 2) }}</td>
                <td>Các hoạt động NCKH</td>
            </tr>
            <tr class="highlight">
                <td><strong>Kết quả thừa/thiếu giờ GD</strong></td>
                <td class="number">-</td>
                <td class="number"><strong>{{ number_format($keKhaiData['ket_qua_thua_thieu_gio_gd_tam_tinh'] ?? 0, 2) }}</strong></td>
                <td>
                    @if(($keKhaiData['ket_qua_thua_thieu_gio_gd_tam_tinh'] ?? 0) > 0)
                        Vượt giờ
                    @elseif(($keKhaiData['ket_qua_thua_thieu_gio_gd_tam_tinh'] ?? 0) < 0)
                        Thiếu giờ
                    @else
                        Đạt định mức
                    @endif
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Detailed breakdown sections - Only show sections with data -->
    @foreach([
        'gd_lop_dh_trong_bm' => '1. GIẢNG DẠY LỚP ĐẠI HỌC TRONG BỘ MÔN',
        'gd_lop_dh_ngoai_bm' => '2. GIẢNG DẠY LỚP ĐẠI HỌC NGOÀI BỘ MÔN',
        'gd_lop_dh_ngoai_cs' => '3. GIẢNG DẠY LỚP ĐẠI HỌC NGOÀI CƠ SỞ',
        'gd_lop_ths' => '4. GIẢNG DẠY LỚP THẠC SĨ',
        'gd_lop_ts' => '5. GIẢNG DẠY LỚP TIẾN SĨ',
        'hd_datn_daihoc' => '6. HƯỚNG DẪN ĐỒ ÁN TỐT NGHIỆP ĐẠI HỌC',
        'hd_lv_thacsi' => '7. HƯỚNG DẪN LUẬN VĂN THẠC SĨ',
        'hd_la_tiensi' => '8. HƯỚNG DẪN LUẬN ÁN TIẾN SĨ',
        'dg_hp_tn_daihoc' => '9. ĐÁNH GIÁ HỌC PHẦN TỐT NGHIỆP ĐẠI HỌC',
        'dg_lv_thacsi' => '10. ĐÁNH GIÁ LUẬN VĂN THẠC SĨ',
        'khao_thi_dh_trong_bm' => '11. KHẢO THÍ ĐẠI HỌC TRONG BỘ MÔN',
        'khao_thi_dh_ngoai_bm' => '12. KHẢO THÍ ĐẠI HỌC NGOÀI BỘ MÔN',
        'khao_thi_thacsi' => '13. KHẢO THÍ THẠC SĨ',
        'khao_thi_tiensi' => '14. KHẢO THÍ TIẾN SĨ',
        'dg_la_tiensi_dot' => '15. ĐÁNH GIÁ LUẬN ÁN TIẾN SĨ',
        'xd_ctdt_va_khac_gd' => '16. XÂY DỰNG CHƯƠNG TRÌNH ĐÀO TẠO VÀ CÔNG TÁC KHÁC GIÁO DỤC',
        'nckh_nam_hoc' => '17. NGHIÊN CỨU KHOA HỌC',
        'congtac_khac_nam_hoc' => '18. CÔNG TÁC KHÁC',
    ] as $sectionKey => $sectionTitle)
        @if(!empty($keKhaiData['ke_khai_details'][$sectionKey]) && count($keKhaiData['ke_khai_details'][$sectionKey]) > 0)
            <div class="section-title">{{ $sectionTitle }}</div>
            
            @if(in_array($sectionKey, ['gd_lop_dh_trong_bm', 'gd_lop_dh_ngoai_bm', 'gd_lop_dh_ngoai_cs']))
                {{-- Teaching sections --}}
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã lớp</th>
                            <th>Tên môn học</th>
                            <th>Số tiết LT</th>
                            <th>Số tiết TH</th>
                            <th>Hệ số</th>
                            <th>Tổng giờ quy đổi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($keKhaiData['ke_khai_details'][$sectionKey] as $index => $item)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td class="text-left">{{ $item['ma_lop'] ?? '' }}</td>
                            <td class="text-left">{{ $item['ten_mon_hoc'] ?? '' }}</td>
                            <td class="number">{{ $item['so_tiet_lt'] ?? 0 }}</td>
                            <td class="number">{{ $item['so_tiet_th'] ?? 0 }}</td>
                            <td class="number">{{ number_format($item['he_so'] ?? 1, 2) }}</td>
                            <td class="number">{{ number_format($item['tong_gio_quy_doi'] ?? 0, 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
                
            @elseif(in_array($sectionKey, ['gd_lop_ths', 'gd_lop_ts']))
                {{-- Graduate teaching sections --}}
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã lớp</th>
                            <th>Tên môn học</th>
                            <th>Số tiết</th>
                            <th>Hệ số</th>
                            <th>Tổng giờ quy đổi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($keKhaiData['ke_khai_details'][$sectionKey] as $index => $item)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td class="text-left">{{ $item['ma_lop'] ?? '' }}</td>
                            <td class="text-left">{{ $item['ten_mon_hoc'] ?? '' }}</td>
                            <td class="number">{{ $item['so_tiet'] ?? 0 }}</td>
                            <td class="number">{{ number_format($item['he_so'] ?? 1, 2) }}</td>
                            <td class="number">{{ number_format($item['tong_gio_quy_doi'] ?? 0, 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
                
            @elseif($sectionKey === 'hd_datn_daihoc')
                {{-- Thesis supervision --}}
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên sinh viên</th>
                            <th>Tên đề tài</th>
                            <th>Số lượng SV</th>
                            <th>Hệ số</th>
                            <th>Tổng giờ quy đổi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($keKhaiData['ke_khai_details'][$sectionKey] as $index => $item)
                        @php
                            $hasRealData = (!empty($item['ten_sinh_vien']) && $item['ten_sinh_vien'] !== '') || 
                                          (!empty($item['ten_de_tai']) && $item['ten_de_tai'] !== '');
                        @endphp
                        @if($hasRealData || ($item['tong_gio_quy_doi'] ?? 0) > 0)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td class="text-left">{{ $item['ten_sinh_vien'] ?? 'Chưa có tên SV' }}</td>
                            <td class="text-left">{{ $item['ten_de_tai'] ?? 'Chưa có đề tài' }}</td>
                            <td class="number">{{ $item['so_luong_sv'] ?? 1 }}</td>
                            <td class="number">{{ number_format($item['he_so'] ?? 1, 2) }}</td>
                            <td class="number">{{ number_format($item['tong_gio_quy_doi'] ?? 0, 2) }}</td>
                        </tr>
                        @endif
                        @endforeach
                        @if(count(array_filter($keKhaiData['ke_khai_details'][$sectionKey], function($item) {
                            $hasRealData = (!empty($item['ten_sinh_vien']) && $item['ten_sinh_vien'] !== '') || 
                                          (!empty($item['ten_de_tai']) && $item['ten_de_tai'] !== '');
                            return $hasRealData || ($item['tong_gio_quy_doi'] ?? 0) > 0;
                        })) === 0)
                        <tr>
                            <td colspan="6" class="text-center" style="padding: 20px; font-style: italic; color: #666;">
                                Chưa có dữ liệu kê khai chi tiết
                            </td>
                        </tr>
                        @endif
                    </tbody>
                </table>
                
            @elseif(in_array($sectionKey, ['hd_lv_thacsi', 'hd_la_tiensi', 'dg_hp_tn_daihoc', 'dg_lv_thacsi']))
                {{-- Supervision and evaluation sections --}}
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên {{ str_contains($sectionKey, 'hd_') ? 'học viên/nghiên cứu sinh' : 'sinh viên/học viên' }}</th>
                            <th>Tên đề tài</th>
                            <th>Vai trò</th>
                            <th>Hệ số</th>
                            <th>Tổng giờ quy đổi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($keKhaiData['ke_khai_details'][$sectionKey] as $index => $item)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td class="text-left">{{ $item['ten_hoc_vien'] ?? $item['ten_nghien_cuu_sinh'] ?? $item['ten_sinh_vien'] ?? '' }}</td>
                            <td class="text-left">{{ $item['ten_de_tai'] ?? '' }}</td>
                            <td class="text-left">{{ $item['vai_tro'] ?? '' }}</td>
                            <td class="number">{{ number_format($item['he_so'] ?? 1, 2) }}</td>
                            <td class="number">{{ number_format($item['tong_gio_quy_doi'] ?? 0, 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
                
            @elseif(in_array($sectionKey, ['khao_thi_dh_trong_bm', 'khao_thi_dh_ngoai_bm', 'khao_thi_thacsi', 'khao_thi_tiensi']))
                {{-- Examination sections --}}
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên môn thi</th>
                            <th>Số ca thi</th>
                            <th>Hệ số</th>
                            <th>Tổng giờ quy đổi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($keKhaiData['ke_khai_details'][$sectionKey] as $index => $item)
                        @php
                            $hasRealData = (!empty($item['ten_mon_thi']) && $item['ten_mon_thi'] !== '') || 
                                          ($item['so_ca_thi'] ?? 0) > 0 || ($item['tong_gio_quy_doi'] ?? 0) > 0;
                        @endphp
                        @if($hasRealData)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td class="text-left">{{ $item['ten_mon_thi'] ?? 'Chưa có tên môn thi' }}</td>
                            <td class="number">{{ $item['so_ca_thi'] ?? 0 }}</td>
                            <td class="number">{{ number_format($item['he_so'] ?? 1, 2) }}</td>
                            <td class="number">{{ number_format($item['tong_gio_quy_doi'] ?? 0, 2) }}</td>
                        </tr>
                        @endif
                        @endforeach
                        @if(count(array_filter($keKhaiData['ke_khai_details'][$sectionKey], function($item) {
                            return (!empty($item['ten_mon_thi']) && $item['ten_mon_thi'] !== '') || 
                                   ($item['so_ca_thi'] ?? 0) > 0 || ($item['tong_gio_quy_doi'] ?? 0) > 0;
                        })) === 0)
                        <tr>
                            <td colspan="5" class="text-center" style="padding: 20px; font-style: italic; color: #666;">
                                Chưa có dữ liệu kê khai chi tiết
                            </td>
                        </tr>
                        @endif
                    </tbody>
                </table>
                
            @else
                {{-- Generic sections --}}
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên hoạt động/công việc</th>
                            <th>Vai trò/Loại</th>
                            <th>Giờ thực hiện</th>
                            <th>Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($keKhaiData['ke_khai_details'][$sectionKey] as $index => $item)
                        @php
                            $hasRealData = (!empty($item['ten_hoat_dong']) && $item['ten_hoat_dong'] !== '') || 
                                          (!empty($item['ten_de_tai']) && $item['ten_de_tai'] !== '') || 
                                          (!empty($item['ten_cong_viec']) && $item['ten_cong_viec'] !== '') || 
                                          (!empty($item['thong_tin_dot']) && $item['thong_tin_dot'] !== '') || 
                                          ($item['tong_gio_quy_doi'] ?? 0) > 0 || 
                                          ($item['tong_gio_nckh_gv_nhap'] ?? 0) > 0 || 
                                          ($item['gio_thuc_hien'] ?? 0) > 0;
                        @endphp
                        @if($hasRealData)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td class="text-left">{{ $item['ten_hoat_dong'] ?? $item['ten_de_tai'] ?? $item['ten_cong_viec'] ?? $item['thong_tin_dot'] ?? 'Chưa có thông tin' }}</td>
                            <td class="text-left">{{ $item['vai_tro'] ?? $item['loai_cong_viec'] ?? '' }}</td>
                            <td class="number">{{ number_format($item['tong_gio_quy_doi'] ?? $item['tong_gio_nckh_gv_nhap'] ?? $item['gio_thuc_hien'] ?? 0, 2) }}</td>
                            <td class="text-left">{{ $item['ghi_chu'] ?? '' }}</td>
                        </tr>
                        @endif
                        @endforeach
                        @if(count(array_filter($keKhaiData['ke_khai_details'][$sectionKey], function($item) {
                            return (!empty($item['ten_hoat_dong']) && $item['ten_hoat_dong'] !== '') || 
                                   (!empty($item['ten_de_tai']) && $item['ten_de_tai'] !== '') || 
                                   (!empty($item['ten_cong_viec']) && $item['ten_cong_viec'] !== '') || 
                                   (!empty($item['thong_tin_dot']) && $item['thong_tin_dot'] !== '') || 
                                   ($item['tong_gio_quy_doi'] ?? 0) > 0 || 
                                   ($item['tong_gio_nckh_gv_nhap'] ?? 0) > 0 || 
                                   ($item['gio_thuc_hien'] ?? 0) > 0;
                        })) === 0)
                        <tr>
                            <td colspan="5" class="text-center" style="padding: 20px; font-style: italic; color: #666;">
                                Chưa có dữ liệu kê khai chi tiết
                            </td>
                        </tr>
                        @endif
                    </tbody>
                </table>
            @endif
        @endif
    @endforeach

    <!-- If no sections have data, show a message -->
    @if(empty(array_filter($keKhaiData['ke_khai_details'], function($section) { return !empty($section); })))
        <div class="section-title">THÔNG BÁO</div>
        <div class="no-data">Giảng viên chưa có dữ liệu kê khai chi tiết hoặc tất cả các mục đều trống.</div>
    @endif

    <!-- Comments Section -->
    @if($keKhaiData['ghi_chu_giang_vien'] || $keKhaiData['ghi_chu_quan_ly'])
    <div class="section-title">GHI CHÚ</div>
    <table class="detail-table">
        <tbody>
            @if($keKhaiData['ghi_chu_giang_vien'])
            <tr>
                <td style="width: 20%; font-weight: bold;">Ghi chú của giảng viên:</td>
                <td class="text-left">{{ $keKhaiData['ghi_chu_giang_vien'] }}</td>
            </tr>
            @endif
            @if($keKhaiData['ghi_chu_quan_ly'])
            <tr>
                <td style="width: 20%; font-weight: bold;">Ghi chú của quản lý:</td>
                <td class="text-left">{{ $keKhaiData['ghi_chu_quan_ly'] }}</td>
            </tr>
            @endif
        </tbody>
    </table>
    @endif

    <!-- Signature Section -->
    <div class="signature-section">
        <div class="signature-block">
            <div class="signature-title">NGƯỜI KÊ KHAI</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-name">{{ $keKhaiData['ho_ten'] ?? 'N/A' }}</div>
        </div>
        <div class="signature-block">
            <div class="signature-title">TRƯỞNG BỘ MÔN</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-name">{{ $keKhaiData['nguoi_duyet_bm'] ?? 'Chưa duyệt' }}</div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p><em>Báo cáo được tạo tự động từ hệ thống kê khai giờ chuẩn - {{ date('d/m/Y H:i:s') }}</em></p>
    </div>
</body>
</html>