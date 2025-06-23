<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đặt lại mật khẩu</title>
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

        /* Enhanced Header with Blue Gradient for Password Reset */
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 25%, #1d4ed8 75%, #1e40af 100%);
            position: relative;
            overflow: hidden;
            padding: 48px 32px;
            text-align: center;
        }

        /* Password Reset Logo */
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
            color: #3b82f6 !important;
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

        .email-card {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #60a5fa;
            border-left: 4px solid #3b82f6;
        }

        .security-card {
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

        .email-card .card-title {
            color: #1e40af !important;
        }

        .security-card .card-title {
            color: #9a3412 !important;
        }

        .card-content {
            font-size: 15px !important;
            line-height: 1.6 !important;
            margin: 0 !important;
        }

        .email-card .card-content {
            color: #1d4ed8 !important;
            font-weight: 600 !important;
        }

        .security-card .card-content {
            color: #9a3412 !important;
        }

        .security-card ul {
            margin: 0 !important;
            padding-left: 20px !important;
        }

        .security-card li {
            margin-bottom: 8px !important;
        }

        /* Enhanced Button */
        .button-container {
            text-align: center !important;
            margin: 40px 0 !important;
        }

        .cta-button {
            display: inline-block !important;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%) !important;
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
            box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
            transition: all 0.3s ease !important;
        }

        .cta-button:hover {
            color: #ffffff !important;
            text-decoration: none !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 15px 25px -3px rgba(59, 130, 246, 0.4) !important;
        }

        /* URL Container */
        .url-container {
            background-color: #f8fafc;
            border-radius: 12px;
            padding: 20px !important;
            border: 1px solid #e2e8f0;
            margin: 24px 0 !important;
            word-break: break-all;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .url-container a {
            color: #3b82f6 !important;
            text-decoration: none !important;
            font-size: 14px !important;
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
            color: #3b82f6 !important;
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
            color: #3b82f6 !important;
            text-decoration: none !important;
            margin: 0 12px !important;
            font-weight: 500 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif !important;
        }

        .footer-link:hover {
            color: #1d4ed8 !important;
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
                        <div class="logo-text">🔑</div>
                    </div>
                </div>
                
                <h1>Đặt lại mật khẩu</h1>
                <p>Hệ thống Quản lý Khối lượng Công việc</p>
            </div>
            
            <!-- Enhanced Content -->
            <div class="content">
                <div class="greeting">
                    Xin chào!
                </div>
                
                <div class="info">
                    Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Để tiếp tục quá trình đặt lại mật khẩu, vui lòng thực hiện theo hướng dẫn bên dưới.
                </div>
                
                <!-- Email Info Card -->
                <div class="info-card email-card">
                    <div class="card-title">📧 Tài khoản email</div>
                    <div class="card-content">{{ $notifiable }}</div>
                </div>
                
                <!-- Enhanced Button -->
                <div class="button-container">
                    <a href="{{ $url }}" class="cta-button">
                        🔑 Đặt lại mật khẩu
                    </a>
                </div>

                <!-- Security Card -->
                <div class="info-card security-card">
                    <div class="card-title">⚠️ Lưu ý bảo mật quan trọng</div>
                    <div class="card-content">
                        <ul style="margin: 0; padding-left: 20px;">
                            <li>Liên kết này sẽ hết hạn sau <strong>{{ $count }} phút</strong></li>
                            <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                            <li>Không chia sẻ liên kết này với bất kỳ ai khác</li>
                            <li>Hãy tạo mật khẩu mạnh với ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                        </ul>
                    </div>
                </div>

                <div style="color: #6c757d; font-size: 14px; margin-top: 20px; text-align: center;">
                    Nếu bạn gặp sự cố với nút "Đặt lại mật khẩu", hãy sao chép và dán URL bên dưới vào trình duyệt web của bạn:
                </div>
                
                <div class="url-container">
                    <a href="{{ $url }}">{{ $url }}</a>
                </div>
                
                <!-- Enhanced Signature -->
                <div class="signature-section">
                    <div class="signature-greeting">
                        Trân trọng,
                    </div>
                    <div style="margin-top: 12px;">
                        <div class="university-name">
                            🏛️ Trường Đại học Thủy lợi
                        </div>
                        <div class="system-name">
                            Hệ thống Quản lý Khối lượng Công việc
                        </div>
                    </div>
                    
                    <!-- Contact Information -->
                    <div class="contact-info">
                        <div class="contact-item">
                            Email hỗ trợ: support@university.edu.vn
                        </div>
                        <div class="contact-item">
                            Thời gian gửi: {{ now()->format('H:i:s d/m/Y') }} (GMT+7)
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Enhanced Footer -->
            <div class="footer-section">
                <div>© {{ date('Y') }} Trường Đại học Thủy lợi. Tất cả quyền được bảo lưu.</div>
                <div style="margin-top: 8px; font-size: 13px; color: #94a3b8;">
                    Đây là email tự động từ hệ thống, vui lòng không phản hồi trực tiếp.
                </div>
                
                <div class="footer-links">
                    <a href="#" class="footer-link">Trang chủ</a>
                    <a href="#" class="footer-link">Hướng dẫn</a>
                    <a href="#" class="footer-link">Liên hệ</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
