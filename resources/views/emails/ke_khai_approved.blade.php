<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kê khai đã được phê duyệt</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            line-height: 1.6;
            color: #1e293b !important;
            margin: 0;
            padding: 0;
            background-color: #f1f5f9;
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .email-wrapper {
            padding: 40px 20px;
            background-color: #f8fafc;
        }

        .container {
            max-width: 640px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
            border: 1px solid #e2e8f0;
        }

        .header {
            background: linear-gradient(135deg, #059669 0%, #047857 25%, #065f46 75%, #064e3b 100%);
            position: relative;
            overflow: hidden;
            padding: 48px 32px;
            text-align: center;
        }

        .header-logo {
            width: 80px;
            height: 80px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            margin: 0 auto 24px;
            display: table;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .logo-inner {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            width: 80px;
            height: 80px;
        }

        .logo-text {
            background-color: #ffffff;
            color: #059669 !important;
            font-weight: bold;
            font-size: 32px;
            border-radius: 12px;
            width: 50px;
            height: 50px;
            display: inline-block;
            line-height: 50px;
            text-align: center;
            margin: 0 auto;
        }

        .header h1 {
            margin: 0 !important;
            font-size: 28px !important;
            font-weight: 700 !important;
            color: #ffffff !important;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            letter-spacing: -0.5px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            padding: 0 !important;
        }

        .header p {
            margin: 12px 0 0 0 !important;
            font-size: 16px !important;
            color: rgba(255, 255, 255, 0.95) !important;
            font-weight: 500 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            padding: 0 !important;
        }

        .content {
            padding: 48px 32px !important;
            background-color: #ffffff;
        }

        .greeting {
            font-size: 18px !important;
            font-weight: 600 !important;
            margin-bottom: 24px !important;
            color: #1e293b !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .info {
            font-size: 16px !important;
            margin-bottom: 32px !important;
            color: #475569 !important;
            line-height: 1.7 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .info-card {
            border-radius: 16px;
            padding: 24px !important;
            margin-bottom: 24px !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            position: relative;
        }

        .semester-card {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 1px solid #86efac;
            border-left: 4px solid #059669;
        }

        .summary-card {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 1px solid #7dd3fc;
            border-left: 4px solid #0284c7;
        }

        .card-title {
            font-weight: 700 !important;
            font-size: 16px !important;
            margin: 0 0 16px 0 !important;
            line-height: 1.3 !important;
            color: inherit !important;
            letter-spacing: 0.025em !important;
        }

        .semester-card .card-title {
            color: #065f46 !important;
        }

        .summary-card .card-title {
            color: #0c4a6e !important;
        }

        .card-content {
            font-size: 15px !important;
            line-height: 1.6 !important;
            margin: 0 !important;
        }

        .semester-card .card-content {
            color: #065f46 !important;
            font-weight: 600 !important;
        }

        .summary-card .card-content {
            color: #0c4a6e !important;
        }

        .status-badge {
            display: inline-flex !important;
            align-items: center !important;
            padding: 8px 16px !important;
            background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
            color: #ffffff !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            border-radius: 12px !important;
            margin-bottom: 16px !important;
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3) !important;
        }

        .status-dot {
            width: 8px !important;
            height: 8px !important;
            background-color: #ffffff !important;
            border-radius: 50% !important;
            margin-right: 8px !important;
            animation: pulse 2s infinite !important;
        }

        .summary-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 16px 0 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .summary-table td {
            padding: 12px 16px !important;
            border-bottom: 1px solid #e2e8f0 !important;
            font-size: 14px !important;
            vertical-align: top !important;
        }

        .summary-table td:first-child {
            font-weight: 600 !important;
            color: #374151 !important;
            white-space: nowrap !important;
            width: 40% !important;
        }

        .summary-table td:last-child {
            color: #059669 !important;
            font-weight: 600 !important;
            text-align: right !important;
        }

        .button-container {
            text-align: center !important;
            margin: 40px 0 !important;
        }

        .cta-button {
            display: inline-block !important;
            background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%) !important;
            color: #ffffff !important;
            padding: 16px 32px !important;
            border-radius: 12px !important;
            text-decoration: none !important;
            font-weight: 600 !important;
            font-size: 16px !important;
            border: none !important;
            letter-spacing: 0.5px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3);
            transition: all 0.3s ease !important;
        }

        .cta-button:hover {
            color: #ffffff !important;
            text-decoration: none !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 15px 25px -3px rgba(5, 150, 105, 0.4) !important;
        }

        .signature-section {
            margin-top: 40px !important;
            padding: 32px !important;
            background-color: #f8fafc;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            text-align: center !important;
        }

        .signature-greeting {
            font-size: 16px !important;
            color: #475569 !important;
            margin-bottom: 8px !important;
            font-style: italic;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .university-name {
            font-weight: 700 !important;
            color: #059669 !important;
            font-size: 18px !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            margin-bottom: 4px !important;
        }

        .system-name {
            color: #0ea5e9 !important;
            font-weight: 500 !important;
            font-size: 16px !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .contact-info {
            margin-top: 24px !important;
            padding-top: 20px !important;
            border-top: 1px solid #e2e8f0;
            font-size: 14px !important;
            color: #64748b !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .contact-item {
            margin-bottom: 8px !important;
            color: #64748b !important;
            text-align: center !important;
            font-weight: 500 !important;
        }

        .footer-section {
            background-color: #f8fafc;
            padding: 24px 32px !important;
            text-align: center !important;
            font-size: 14px !important;
            color: #64748b !important;
            border-top: 1px solid #e2e8f0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .footer-links {
            margin-top: 16px !important;
            padding-top: 16px !important;
            border-top: 1px solid #e2e8f0;
        }

        .footer-link {
            color: #059669 !important;
            text-decoration: none !important;
            margin: 0 12px !important;
            font-weight: 500 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .footer-link:hover {
            color: #047857 !important;
            text-decoration: underline !important;
        }

        @media only screen and (max-width: 680px) {
            .email-wrapper {
                padding: 20px 10px !important;
            }

            .container {
                border-radius: 16px !important;
                margin: 0 10px !important;
            }

            .header {
                padding: 32px 24px !important;
            }

            .content {
                padding: 32px 24px !important;
            }

            .header h1 {
                font-size: 24px !important;
            }

            .signature-section {
                padding: 24px !important;
            }

            .cta-button {
                padding: 14px 24px !important;
                font-size: 15px !important;
            }

            .summary-table td {
                padding: 10px 12px !important;
                font-size: 13px !important;
            }
        }

        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }

        * {
            max-height: none !important;
            visibility: visible !important;
            overflow: visible !important;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="container">
            <div class="header">
                <div class="header-logo">
                    <div class="logo-inner">
                        <div class="logo-text">✓</div>
                    </div>
                </div>
                
                <h1>Kê khai đã được phê duyệt</h1>
                <p>Hệ thống Quản lý Khối lượng Giảng dạy</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Kính chào Thầy/Cô {{ $keKhai->nguoiDung->ho_ten ?? 'Giảng viên' }},
                </div>
                
                <div class="info">
                    Chúng tôi xin thông báo rằng kê khai hoạt động của Thầy/Cô cho năm học dưới đây đã được phê duyệt thành công.
                </div>
                
                <div class="info-card semester-card">
                    <div class="card-title">Thông tin năm học</div>
                    <div class="card-content">{{ $namHoc->ten_nam_hoc ?? 'N/A' }}</div>
                </div>
                
                <div class="info-card summary-card">
                    <div class="card-title">Kết quả phê duyệt</div>
                    <div class="card-content">
                        <div class="status-badge">
                            <div class="status-dot"></div>
                            Đã phê duyệt
                        </div>
                        
                        <table class="summary-table">
                            <tr>
                                <td>Tổng giờ giảng dạy:</td>
                                <td>{{ number_format(floatval($keKhai->tong_gio_giangday_final_duyet ?? $keKhai->tong_gio_giangday_final_tam_tinh ?? 0), 2) }} giờ</td>
                            </tr>
                            <tr>
                                <td>Tổng giờ NCKH:</td>
                                <td>{{ number_format(floatval($keKhai->tong_gio_khcn_kekhai_duyet ?? $keKhai->tong_gio_khcn_kekhai_tam_tinh ?? 0), 2) }} giờ</td>
                            </tr>
                            <tr>
                                <td>Tổng giờ thực hiện:</td>
                                <td>{{ number_format(floatval($keKhai->tong_gio_thuc_hien_final_duyet ?? $keKhai->tong_gio_thuc_hien_final_tam_tinh ?? 0), 2) }} giờ</td>
                            </tr>
                            <tr>
                                <td>Kết quả:</td>
                                <td>
                                    @php
                                        $ketQua = floatval($keKhai->ket_qua_thua_thieu_gio_gd_duyet ?? $keKhai->ket_qua_thua_thieu_gio_gd_tam_tinh ?? 0);
                                    @endphp
                                    @if($ketQua > 0)
                                        <span style="color: #059669;">+{{ number_format($ketQua, 2) }} giờ (Vượt)</span>
                                    @elseif($ketQua < 0)
                                        <span style="color: #dc2626;">{{ number_format($ketQua, 2) }} giờ (Thiếu)</span>
                                    @else
                                        <span style="color: #6b7280;">Đạt định mức</span>
                                    @endif
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div class="info">
                    Kê khai của Thầy/Cô đã được xem xét và phê duyệt. Thầy/Cô có thể xem chi tiết kết quả trong hệ thống và tải về báo cáo nếu cần thiết.
                </div>
                
                <div class="button-container">
                    <a href="{{ env('APP_URL') }}" class="cta-button">
                        Xem chi tiết kê khai
                    </a>
                </div>
                
                <div class="signature-section">
                    <div class="signature-greeting">
                        Trân trọng,
                    </div>
                    <div style="margin-top: 12px;">
                        <div class="university-name">
                            Đại học Thủy Lợi
                        </div>
                        <div class="system-name">
                            Hệ thống Quản lý Khối lượng Giảng dạy
                        </div>
                    </div>
                    
                    <div class="contact-info">
                        <div class="contact-item">
                            Email hỗ trợ: support@tlu.edu.vn
                        </div>
                        <div class="contact-item">
                            Hotline: (024) 3854 2201
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="footer-section">
                <div>© 2024 Đại học Thủy Lợi. Tất cả quyền được bảo lưu.</div>
                <div style="margin-top: 8px; font-size: 13px; color: #94a3b8;">
                    Đây là email tự động từ hệ thống, vui lòng không phản hồi trực tiếp.
                </div>
                
                <div class="footer-links">
                    <a href="{{ env('APP_URL') }}" class="footer-link">Trang chủ</a>
                    <a href="{{ env('APP_URL') }}/help" class="footer-link">Hướng dẫn</a>
                    <a href="{{ env('APP_URL') }}/contact" class="footer-link">Liên hệ</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>