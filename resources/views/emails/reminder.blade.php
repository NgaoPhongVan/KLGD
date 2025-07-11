<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        /* Enhanced Modern Email Styles */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            line-height: 1.6;
            color: #1e293b !important;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e0 100%);
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .email-wrapper {
            padding: 40px 20px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
            position: relative;
            overflow: hidden;
        }

        .email-wrapper::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%);
            pointer-events: none;
        }

        .container {
            max-width: 680px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.18);
            border: 1px solid rgba(226, 232, 240, 0.6);
            position: relative;
        }

        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #f59e0b 0%, #d97706 25%, #ea580c 50%, #dc2626 75%, #b91c1c 100%);
        }

        /* Enhanced Header with Premium Gradient */
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 20%, #ea580c 60%, #dc2626 90%, #b91c1c 100%);
            position: relative;
            overflow: hidden;
            padding: 56px 40px;
            text-align: center;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="0.8" fill="rgba(255,255,255,0.12)"/><circle cx="80" cy="40" r="0.6" fill="rgba(255,255,255,0.08)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="60" cy="60" r="0.4" fill="rgba(255,255,255,0.06)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
            opacity: 0.7;
        }

        .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        }

        /* Premium Bell Logo */
        .header-logo {
            width: 88px;
            height: 88px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 24px;
            margin: 0 auto 28px;
            display: table;
            border: 3px solid rgba(255, 255, 255, 0.4);
            position: relative;
            z-index: 2;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        }

        .logo-inner {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            width: 88px;
            height: 88px;
        }

        .logo-text {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            color: #f59e0b !important;
            font-weight: bold;
            font-size: 32px;
            border-radius: 16px;
            width: 56px;
            height: 56px;
            display: inline-block;
            line-height: 56px;
            text-align: center;
            margin: 0 auto;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
            position: relative;
        }

        .logo-text::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4));
            border-radius: 18px;
            z-index: -1;
        }

        .header h1 {
            margin: 0 !important;
            font-size: 32px !important;
            font-weight: 700 !important;
            color: #ffffff !important;
            text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
            letter-spacing: -0.8px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            padding: 0 !important;
            position: relative;
            z-index: 2;
            line-height: 1.2;
        }

        .header p {
            margin: 16px 0 0 0 !important;
            font-size: 18px !important;
            color: rgba(255, 255, 255, 0.95) !important;
            font-weight: 500 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            padding: 0 !important;
            position: relative;
            z-index: 2;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        /* Enhanced Content Area */
        .content {
            padding: 56px 40px !important;
            background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
            position: relative;
        }

        .content::before {
            content: '';
            position: absolute;
            top: 0;
            left: 20px;
            right: 20px;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.6), transparent);
        }

        .greeting {
            font-size: 20px !important;
            font-weight: 600 !important;
            margin-bottom: 28px !important;
            color: #1e293b !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .message-content {
            font-size: 17px !important;
            margin-bottom: 36px !important;
            color: #475569 !important;
            line-height: 1.7 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fed7aa 100%);
            padding: 28px;
            border-radius: 20px;
            border-left: 5px solid #f59e0b;
            border: 1px solid #fcd34d;
            box-shadow: 0 4px 16px rgba(245, 158, 11, 0.1);
            position: relative;
        }

        .message-content::before {
            content: '';
            position: absolute;
            top: 12px;
            right: 12px;
            width: 8px;
            height: 8px;
            background: #f59e0b;
            border-radius: 50%;
            opacity: 0.6;
        }

        /* Enhanced Info Cards */
        .info-card {
            border-radius: 20px;
            padding: 28px !important;
            margin-bottom: 28px !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            position: relative;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
            backdrop-filter: blur(10px);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .info-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        }

        .semester-card {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%);
            border: 1px solid #93c5fd;
            border-left: 6px solid #3b82f6;
        }

        .time-card {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%);
            border: 1px solid #86efac;
            border-left: 6px solid #22c55e;
        }

        .urgent-card {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fca5a5 100%);
            border: 1px solid #fca5a5;
            border-left: 6px solid #ef4444;
            animation: gentlePulse 3s infinite;
        }

        @keyframes gentlePulse {
            0%, 100% { opacity: 1; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }
            50% { opacity: 0.95; box-shadow: 0 8px 24px rgba(239, 68, 68, 0.15); }
        }

        .card-title {
            font-weight: 700 !important;
            font-size: 18px !important;
            margin: 0 0 20px 0 !important;
            line-height: 1.3 !important;
            color: inherit !important;
            letter-spacing: 0.025em !important;
            display: flex;
            align-items: center;
        }

        .card-title::before {
            content: '';
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 16px;
            display: inline-block;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .semester-card .card-title {
            color: #1e40af !important;
        }

        .semester-card .card-title::before {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        .time-card .card-title {
            color: #14532d !important;
        }

        .time-card .card-title::before {
            background: linear-gradient(135deg, #22c55e, #15803d);
        }

        .urgent-card .card-title {
            color: #991b1b !important;
        }

        .urgent-card .card-title::before {
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .card-content {
            font-size: 16px !important;
            line-height: 1.7 !important;
            margin: 0 !important;
        }

        .semester-card .card-content {
            color: #1e40af !important;
            font-weight: 600 !important;
        }

        .time-card .card-content {
            color: #166534 !important;
        }

        .urgent-card .card-content {
            color: #991b1b !important;
            font-weight: 500 !important;
        }

        .time-item {
            margin-bottom: 12px !important;
            color: #166534 !important;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.6);
            padding: 12px 16px;
            border-radius: 12px;
            border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .time-item:last-child {
            margin-bottom: 0 !important;
        }

        .time-item strong {
            color: #14532d !important;
        }

        .time-badge {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.3));
            color: #14532d;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            border: 1px solid rgba(34, 197, 94, 0.3);
            box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1);
        }

        /* Enhanced Button */
        .button-container {
            text-align: center !important;
            margin: 48px 0 !important;
        }

        .cta-button {
            display: inline-block !important;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 30%, #ea580c 70%, #dc2626 100%) !important;
            color: #ffffff !important;
            padding: 20px 44px !important;
            border-radius: 16px !important;
            text-decoration: none !important;
            font-weight: 700 !important;
            font-size: 18px !important;
            border: none !important;
            letter-spacing: 0.5px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            box-shadow: 0 16px 32px -4px rgba(245, 158, 11, 0.4);
            transition: all 0.3s ease !important;
            position: relative;
            overflow: hidden;
            text-transform: uppercase;
            min-width: 280px;
        }

        .cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.6s ease;
        }

        .cta-button:hover::before {
            left: 100%;
        }

        .cta-button:hover {
            color: #ffffff !important;
            text-decoration: none !important;
            transform: translateY(-3px) scale(1.02) !important;
            box-shadow: 0 20px 40px -4px rgba(245, 158, 11, 0.5) !important;
        }

        /* Enhanced Signature */
        .signature-section {
            margin-top: 48px !important;
            padding: 40px !important;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
            border-radius: 20px;
            border: 1px solid #e2e8f0;
            text-align: center !important;
            position: relative;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .signature-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 20px;
            right: 20px;
            height: 4px;
            background: linear-gradient(135deg, #f59e0b, #d97706, #ea580c, #dc2626);
            border-radius: 0 0 12px 12px;
        }

        .signature-greeting {
            font-size: 18px !important;
            color: #475569 !important;
            margin-bottom: 12px !important;
            font-style: italic;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .university-name {
            font-weight: 700 !important;
            color: #f59e0b !important;
            font-size: 22px !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            margin-bottom: 8px !important;
            text-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
        }

        .system-name {
            color: #0ea5e9 !important;
            font-weight: 600 !important;
            font-size: 18px !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .contact-info {
            margin-top: 32px !important;
            padding-top: 24px !important;
            border-top: 1px solid #e2e8f0;
            font-size: 15px !important;
            color: #64748b !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .contact-item {
            margin-bottom: 12px !important;
            color: #64748b !important;
            text-align: center !important;
            font-weight: 500 !important;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin: 0 20px 12px 20px;
            background: rgba(255, 255, 255, 0.8);
            padding: 8px 16px;
            border-radius: 12px;
            border: 1px solid rgba(226, 232, 240, 0.6);
        }

        .contact-item::before {
            content: '📧';
            margin-right: 10px;
            font-size: 16px;
        }

        .contact-item:nth-child(2)::before {
            content: '📞';
        }

        /* Enhanced Footer */
        .footer-section {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
            padding: 32px 40px !important;
            text-align: center !important;
            font-size: 15px !important;
            color: #64748b !important;
            border-top: 1px solid #e2e8f0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            position: relative;
        }

        .footer-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.8), transparent);
        }

        .footer-links {
            margin-top: 20px !important;
            padding-top: 20px !important;
            border-top: 1px solid #e2e8f0;
        }

        .footer-link {
            color: #f59e0b !important;
            text-decoration: none !important;
            margin: 0 16px !important;
            font-weight: 600 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
            transition: all 0.2s ease !important;
            padding: 8px 16px;
            border-radius: 8px;
            display: inline-block;
        }

        .footer-link:hover {
            color: #d97706 !important;
            text-decoration: none !important;
            background: rgba(245, 158, 11, 0.1);
            transform: translateY(-1px);
        }

        /* Responsive Design */
        @media only screen and (max-width: 680px) {
            .email-wrapper {
                padding: 20px 10px !important;
            }

            .container {
                border-radius: 20px !important;
                margin: 0 10px !important;
            }

            .header {
                padding: 40px 24px !important;
            }

            .header h1 {
                font-size: 26px !important;
            }

            .header p {
                font-size: 16px !important;
            }

            .content {
                padding: 40px 24px !important;
            }

            .signature-section {
                padding: 32px 24px !important;
            }

            .cta-button {
                padding: 18px 32px !important;
                font-size: 16px !important;
                min-width: 240px;
            }

            .contact-item {
                display: block !important;
                margin: 0 0 12px 0 !important;
                width: auto;
            }

            .footer-section {
                padding: 24px !important;
            }

            .footer-link {
                display: block !important;
                margin: 8px 0 !important;
            }
        }

        /* Enhanced animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .info-card {
            animation: fadeInUp 0.6s ease-out;
        }

        .info-card:nth-child(2) {
            animation-delay: 0.1s;
        }

        .info-card:nth-child(3) {
            animation-delay: 0.2s;
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
                        <div class="logo-text">🔔</div>
                    </div>
                </div>

                <h1>{{ $title }}</h1>
                <p>Thông báo từ Hệ thống Quản lý Khối lượng Giảng dạy</p>
            </div>

            <!-- Enhanced Content -->
            <div class="content">
                <div class="greeting">
                    Kính chào Thầy/Cô,
                </div>

                <div class="message-content">
                    {{ $content }}
                </div>

                <!-- Enhanced Semester Info Card -->
                <div class="info-card semester-card">
                    <div class="card-title">Thông tin năm học</div>
                    <div class="card-content"> ({{ $namHoc->ten_nam_hoc ?? 'N/A' }})</div>
                </div>

                <!-- Enhanced Time Information Card -->
                @if($keKhaiThoiGian)
                <div class="info-card time-card">
                    <div class="card-title">Thông tin thời gian kê khai</div>
                    <div class="card-content">
                        <div class="time-item">
                            <span><strong>Bắt đầu:</strong></span>
                            <span class="time-badge">{{ \Carbon\Carbon::parse($keKhaiThoiGian->thoi_gian_bat_dau)->format('d/m/Y H:i') }}</span>
                        </div>
                        <div class="time-item">
                            <span><strong>Kết thúc:</strong></span>
                            <span class="time-badge">{{ \Carbon\Carbon::parse($keKhaiThoiGian->thoi_gian_ket_thuc)->format('d/m/Y H:i') }}</span>
                        </div>
                        @if($keKhaiThoiGian->ghi_chu)
                        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(34, 197, 94, 0.2);">
                            <div class="time-item">
                                <span><strong>Ghi chú:</strong></span>
                                <span>{{ $keKhaiThoiGian->ghi_chu }}</span>
                            </div>
                        </div>
                        @endif
                    </div>
                </div>

                <!-- Check if deadline is approaching (within 3 days) -->
                @php
                    $now = \Carbon\Carbon::now();
                    $deadline = \Carbon\Carbon::parse($keKhaiThoiGian->thoi_gian_ket_thuc);
                    $isUrgent = $now->diffInDays($deadline, false) <= 3 && $now->lt($deadline);
                @endphp

                @if($isUrgent)
                <div class="info-card urgent-card">
                    <div class="card-title">⚠️ Thông báo khẩn cấp</div>
                    <div class="card-content">
                        Thời hạn kê khai sắp hết! Còn lại {{ $now->diffInDays($deadline, false) }} ngày 
                        ({{ $now->diffInHours($deadline, false) }} giờ) để hoàn thành kê khai.
                    </div>
                </div>
                @endif
                @else
                <div class="info-card urgent-card">
                    <div class="card-title">Thông báo quan trọng</div>
                    <div class="card-content">Chưa có thông tin thời gian kê khai cho học kỳ này. Vui lòng liên hệ bộ môn để biết thêm chi tiết.</div>
                </div>
                @endif

                <div style="font-size: 16px; margin-bottom: 32px; color: #475569; line-height: 1.7;">
                    Để đảm bảo việc kê khai được thực hiện đúng thời hạn và chính xác, vui lòng đăng nhập vào hệ thống và hoàn thành kê khai khối lượng giảng dạy của mình.
                </div>

                <!-- Enhanced Button -->
                <div class="button-container">
                    <a href="{{ env('APP_URL') }}" class="cta-button">
                        🚀 Đăng nhập Hệ thống ngay
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

                    <!-- Enhanced Contact Information -->
                    <div class="contact-info">
                        <div class="contact-item">
                            support@tlu.edu.vn
                        </div>
                        <div class="contact-item">
                            (024) 3854 2201
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