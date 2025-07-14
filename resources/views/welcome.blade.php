<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    
    <title>Hệ thống Quản lý Khối lượng Giảng dạy - Đại học Thủy Lợi</title>
    <meta name="description" content="Hệ thống quản lý khối lượng công việc giảng viên Đại học Thủy Lợi. Hỗ trợ kê khai, phê duyệt và tính toán giờ chuẩn giảng dạy, nghiên cứu khoa học, công tác khác một cách tự động, minh bạch và chính xác.">
    <meta name="keywords" content="quản lý khối lượng giảng dạy, đại học thủy lợi, kê khai giờ chuẩn, nghiên cứu khoa học, giảng viên, hệ thống quản lý giáo dục, workload management, teaching load">
    <meta name="author" content="Đại học Thủy Lợi">
    <meta name="robots" content="index, follow">
    <meta name="language" content="Vietnamese">
    <meta name="geo.region" content="VN">
    <meta name="geo.position" content="21.0285;105.8542">
    <meta name="ICBM" content="21.0285, 105.8542">
    
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="Hệ thống Quản lý Khối lượng Giảng dạy - Đại học Thủy Lợi">
    <meta property="og:description" content="Hệ thống quản lý khối lượng công việc giảng viên Đại học Thủy Lợi. Hỗ trợ kê khai, phê duyệt và tính toán giờ chuẩn giảng dạy, nghiên cứu khoa học một cách tự động và minh bạch.">
    <meta property="og:image" content="{{ asset('images/logo.png') }}">
    <meta property="og:site_name" content="Đại học Thủy Lợi">
    <meta property="og:locale" content="vi_VN">
    
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{ url()->current() }}">
    <meta property="twitter:title" content="Hệ thống Quản lý Khối lượng Giảng dạy - Đại học Thủy Lợi">
    <meta property="twitter:description" content="Hệ thống quản lý khối lượng công việc giảng viên Đại học Thủy Lợi. Hỗ trợ kê khai, phê duyệt và tính toán giờ chuẩn giảng dạy, nghiên cứu khoa học một cách tự động và minh bạch.">
    <meta property="twitter:image" content="{{ asset('images/logo.png') }}">
    
    <meta name="theme-color" content="#1e40af">
    <meta name="msapplication-TileColor" content="#1e40af">
    <meta name="msapplication-config" content="{{ asset('browserconfig.xml') }}">
    <meta name="application-name" content="KLGD - Quản lý Khối lượng Giảng dạy">
    <meta name="apple-mobile-web-app-title" content="KLGD - Đại học Thủy Lợi">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    
    <link rel="canonical" href="{{ url()->current() }}">
    
    <link rel="icon" href="{{ asset('images/logo.png') }}" type="image/png">
    <link rel="apple-touch-icon" href="{{ asset('images/logo.png') }}">
    <link rel="mask-icon" href="{{ asset('images/logo.png') }}" color="#1e40af">
    
    <link rel="preconnect" href="https://cdn.tailwindcss.com">
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    
    <link rel="dns-prefetch" href="//cdn.tailwindcss.com">
    <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
    <link rel="dns-prefetch" href="//cdnjs.cloudflare.com">
    
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Hệ thống Quản lý Khối lượng Giảng dạy",
        "description": "Hệ thống quản lý khối lượng công việc giảng viên Đại học Thủy Lợi",
        "url": "{{ url()->current() }}",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web Browser",
        "provider": {
            "@type": "EducationalOrganization",
            "name": "Đại học Thủy Lợi",
            "url": "https://tlu.edu.vn",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "175 Tây Sơn",
                "addressLocality": "Hà Nội",
                "addressCountry": "VN"
            }
        },
        "featureList": [
            "Kê khai khối lượng giảng dạy",
            "Quản lý nghiên cứu khoa học",
            "Tính toán giờ chuẩn tự động",
            "Phê duyệt và báo cáo",
            "Thống kê và phân tích"
        ]
    }
    </script>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body>
    <div id="app"></div>
</body>
</html>