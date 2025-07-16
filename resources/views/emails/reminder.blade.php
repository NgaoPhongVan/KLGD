<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
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
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 25%, #ea580c 75%, #dc2626 100%);
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
        
        .message-content {
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
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #fcd34d;
            border-left: 4px solid #f59e0b;
        }
        
        .time-card {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 1px solid #7dd3fc;
            border-left: 4px solid #0284c7;
        }
        
        .urgent-card {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 1px solid #fca5a5;
            border-left: 4px solid #ef4444;
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
            color: #d97706 !important;
        }
        
        .time-card .card-title {
            color: #0c4a6e !important;
        }
        
        .urgent-card .card-title {
            color: #991b1b !important;
        }
        
        .card-content {
            font-size: 15px !important;
            line-height: 1.6 !important;
            margin: 0 !important;
        }
        
        .semester-card .card-content {
            color: #d97706 !important;
            font-weight: 600 !important;
        }
        
        .time-card .card-content {
            color: #0c4a6e !important;
        }
        
        .urgent-card .card-content {
            color: #991b1b !important;
        }
        
        .time-item {
            margin-bottom: 12px !important;
            padding: 12px 16px !important;
            background-color: rgba(255, 255, 255, 0.8);
            border-radius: 8px;
            border: 1px solid rgba(2, 132, 199, 0.2);
        }
        
        .time-item:last-child {
            margin-bottom: 0 !important;
        }
        
        .time-item strong {
            color: #0c4a6e !important;
            font-weight: 600 !important;
        }
        
        .time-badge {
            background: linear-gradient(135deg, rgba(2, 132, 199, 0.1), rgba(2, 132, 199, 0.2));
            color: #0c4a6e !important;
            padding: 6px 12px !important;
            border-radius: 8px;
            font-size: 13px !important;
            font-weight: 600 !important;
            border: 1px solid rgba(2, 132, 199, 0.3);
            display: inline-block !important;
            margin-left: 8px !important;
        }
        
        .cta-button {
            display: inline-block !important;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #ea580c 100%) !important;
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
        }

        * {
            max-height: none !important;
            visibility: visible !important;
            overflow: visible !important;
        }
    </style>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f1f5f9;">
    
    <div class="email-wrapper">
        <div class="container">
            <div class="header">
                <div class="header-logo">
                    <div class="logo-inner">
                        <div class="logo-text">🔔</div>
                    </div>
                </div>
                
                <h1>{{ $title }}</h1>
                <p>Thông báo từ Hệ thống Quản lý Khối lượng Giảng dạy</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Kính chào Thầy/Cô,
                </div>
                
                <div class="message-content">
                    {{ $content }}
                </div>
                
                <div class="info-card semester-card">
                    <div class="card-title">Thông tin năm học</div>
                    <div class="card-content">{{ $namHoc->ten_nam_hoc ?? 'N/A' }}</div>
                </div>
                
                @if($keKhaiThoiGian)
                <div class="info-card time-card">
                    <div class="card-title">Thông tin thời gian kê khai</div>
                    <div class="card-content">
                        <div class="time-item">
                            <strong>Bắt đầu:</strong>
                            <span class="time-badge">{{ \Carbon\Carbon::parse($keKhaiThoiGian->thoi_gian_bat_dau)->format('d/m/Y H:i') }}</span>
                        </div>
                        <div class="time-item">
                            <strong>Kết thúc:</strong>
                            <span class="time-badge">{{ \Carbon\Carbon::parse($keKhaiThoiGian->thoi_gian_ket_thuc)->format('d/m/Y H:i') }}</span>
                        </div>
                        @if($keKhaiThoiGian->ghi_chu)
                        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(2, 132, 199, 0.2);">
                            <div class="time-item">
                                <strong>Ghi chú:</strong>
                                <span>{{ $keKhaiThoiGian->ghi_chu }}</span>
                            </div>
                        </div>
                        @endif
                    </div>
                </div>
                
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
                
                <div style="font-size: 16px; margin-bottom: 32px; color: #475569; line-height: 1.7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif;">
                    Để đảm bảo việc kê khai được thực hiện đúng thời hạn và chính xác, vui lòng đăng nhập vào hệ thống và hoàn thành kê khai khối lượng giảng dạy của mình.
                </div>
                
                <div style="text-align: center; margin: 40px 0;">
                    <a href="{{ env('APP_URL') }}" class="cta-button">
                        Đăng nhập Hệ thống ngay
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
