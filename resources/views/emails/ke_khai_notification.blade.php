<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông báo kê khai hoạt động</title>
    <style>
        /* Modern Email Styles */
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

        /* Enhanced Header with Orange Gradient for Notification */
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 25%, #b45309 75%, #92400e 100%);
            position: relative;
            overflow: hidden;
            padding: 48px 32px;
            text-align: center;
        }

        /* Notification Logo */
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
            color: #f59e0b !important;
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

        /* Enhanced Content Area */
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

        /* Clean Info Cards */
        .info-card {
            border-radius: 16px;
            padding: 24px !important;
            margin-bottom: 24px !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            position: relative;
        }

        .semester-card {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #fbbf24;
            border-left: 4px solid #f59e0b;
        }

        .status-card {
            background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
            border: 1px solid #fb923c;
            border-left: 4px solid #ea580c;
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
            color: #92400e !important;
        }

        .status-card .card-title {
            color: #9a3412 !important;
        }

        .card-content {
            font-size: 15px !important;
            line-height: 1.6 !important;
            margin: 0 !important;
        }

        .semester-card .card-content {
            color: #b45309 !important;
            font-weight: 600 !important;
        }

        .status-card .card-content {
            color: #9a3412 !important;
        }

        /* Status Badge */
        .status-badge {
            display: inline-flex !important;
            align-items: center !important;
            padding: 8px 16px !important;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
            color: #ffffff !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            border-radius: 12px !important;
            margin-bottom: 16px !important;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3) !important;
        }

        .status-dot {
            width: 8px !important;
            height: 8px !important;
            background-color: #ffffff !important;
            border-radius: 50% !important;
            margin-right: 8px !important;
            animation: pulse 2s infinite !important;
        }

        /* Enhanced Table Styling */
        .table-container {
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            margin-bottom: 32px !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        table th {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
            color: #ffffff !important;
            text-align: left !important;
            padding: 16px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            letter-spacing: 0.025em !important;
            border: none !important;
        }

        table td {
            padding: 16px !important;
            border-bottom: 1px solid #f1f5f9 !important;
            font-size: 14px !important;
            color: #475569 !important;
            vertical-align: top !important;
        }

        tr:nth-child(even) {
            background-color: #f8fafc !important;
        }

        tr:last-child td {
            border-bottom: none !important;
        }

        /* Activity Type Badge */
        .activity-type {
            display: inline-block !important;
            padding: 4px 8px !important;
            background-color: #e0e7ff !important;
            color: #3730a3 !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            border-radius: 6px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
        }

        /* Enhanced Button */
        .button-container {
            text-align: center !important;
            margin: 40px 0 !important;
        }

        .cta-button {
            display: inline-block !important;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%) !important;
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
            box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3);
            transition: all 0.3s ease !important;
        }

        .cta-button:hover {
            color: #ffffff !important;
            text-decoration: none !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 15px 25px -3px rgba(245, 158, 11, 0.4) !important;
        }

        /* Enhanced Signature */
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
            color: #f59e0b !important;
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

        /* Enhanced Footer */
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
            color: #f59e0b !important;
            text-decoration: none !important;
            margin: 0 12px !important;
            font-weight: 500 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .footer-link:hover {
            color: #d97706 !important;
            text-decoration: underline !important;
        }

        /* Responsive Design */
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

            table th, table td {
                padding: 12px 8px !important;
                font-size: 13px !important;
            }
        }

        /* Animation Keyframes */
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }

        /* Force visibility for all content */
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
            <!-- Enhanced Header -->
            <div class="header">
                <div class="header-logo">
                    <div class="logo-inner">
                        <div class="logo-text">!</div>
                    </div>
                </div>
                
                <h1>Thông báo kê khai hoạt động</h1>
                <p>Hệ thống Quản lý Khối lượng Giảng dạy</p>
            </div>
            
            <!-- Enhanced Content -->
            <div class="content">
                <div class="greeting">
                    Kính chào Thầy/Cô,
                </div>
                
                <div class="info">
                    Hệ thống ghi nhận thông tin kê khai hoạt động của Thầy/Cô trong học kỳ dưới đây:
                </div>
                
                <!-- Semester Info Card -->
                <div class="info-card semester-card">
                    <div class="card-title">Thông tin học kỳ</div>
                    <div class="card-content">{{ $hoc_ky }} - {{ $nam_hoc }}</div>
                </div>
                
                <!-- Activity Table -->
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Loại hoạt động</th>
                                <th>Tên hoạt động</th>
                                <th>Số lượng</th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($ke_khai_list as $keKhai)
                                <tr>
                                    <td>
                                        <span class="activity-type">
                                            {{ $keKhai->hoatDongChiTiet->loaiHoatDong->ten_loai ?? 'Không xác định' }}
                                        </span>
                                    </td>
                                    <td>{{ $keKhai->hoatDongChiTiet->ten_hoat_dong ?? 'Không xác định' }}</td>
                                    <td>{{ $keKhai->so_tiet_thuc_day ?? $keKhai->so_luong ?? 'Không xác định' }}</td>
                                    <td>
                                        @if ($keKhai->hoatDongChiTiet->loaiHoatDong->ma_loai === 'GD')
                                            {{ $keKhai->ten_hoc_phan ?? 'N/A' }} ({{ $keKhai->ma_hoc_phan ?? 'N/A' }})
                                        @elseif ($keKhai->hoatDongChiTiet->loaiHoatDong->ma_loai === 'NCKH')
                                            {{ $keKhai->ten_san_pham ?? 'N/A' }}
                                        @else
                                            {{ $keKhai->mo_ta_cong_viec ?? 'N/A' }}
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                
                <!-- Status Card -->
                <div class="info-card status-card">
                    <div class="card-title">Trạng thái kê khai</div>
                    <div class="card-content">
                        <div class="status-badge">
                            <div class="status-dot"></div>
                            Chờ phê duyệt
                        </div>
                        <div style="margin-top: 8px; font-size: 14px;">
                            Thông tin kê khai của Thầy/Cô đang chờ phê duyệt. Hệ thống sẽ gửi thông báo khi có kết quả.
                        </div>
                    </div>
                </div>
                
                <!-- Enhanced Button -->
                <div class="button-container">
                    <a href="{{ env('APP_URL') }}" class="cta-button">
                        Xem chi tiết kê khai
                    </a>
                </div>
                
                <!-- Enhanced Signature -->
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
                    
                    <!-- Contact Information -->
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
            
            <!-- Enhanced Footer -->
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