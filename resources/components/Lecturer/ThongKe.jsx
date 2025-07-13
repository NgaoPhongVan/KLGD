import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Card,
    Select,
    Typography,
    Row,
    Col,
    Table,
    Tag,
    Empty,
    Statistic,
    Alert,
    Button,
    message,
    Tabs,
    Progress
} from 'antd';
import {
    BarChartOutlined,
    PieChartOutlined,
    LineChartOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    SyncOutlined,
    RadarChartOutlined,
    AreaChartOutlined,
    DotChartOutlined,
    ClockCircleOutlined 
} from '@ant-design/icons';
import { Bar, Pie, Line, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
    RadialLinearScale,
    Filler
} from "chart.js";

ChartJS.register(
    CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, 
    ChartTitle, Tooltip, Legend, RadialLinearScale, Filler
);

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

function ThongKe() {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingYearDetail, setIsLoadingYearDetail] = useState(false);
    const [error, setError] = useState(null);

    const [namHocList, setNamHocList] = useState([]);
    const [selectedNamHocId, setSelectedNamHocId] = useState("");

    const [statisticsOverview, setStatisticsOverview] = useState([]); // Dữ liệu cho bảng tổng quan các năm
    const [overallSummary, setOverallSummary] = useState(null); // Dữ liệu tóm tắt chung
    const [selectedYearData, setSelectedYearData] = useState(null); // Dữ liệu chi tiết của năm học được chọn

    useEffect(() => {
        fetchStatisticsOverview();
    }, []);

    useEffect(() => {
        if (selectedNamHocId) {
            fetchYearlyStatisticsDetail(selectedNamHocId);
        } else {
            setSelectedYearData(null); // Reset khi không chọn năm nào
        }
    }, [selectedNamHocId]);

    const fetchStatisticsOverview = async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get("/api/lecturer/statistics/overview", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatisticsOverview(response.data.statistics_by_year || []);
            setOverallSummary(response.data.overall_summary || null);
            setNamHocList(response.data.nam_hoc_list || []);

            // Tự động chọn năm học hiện hành để xem chi tiết nếu có
            const currentNamHoc = response.data.nam_hoc_list?.find(nh => nh.la_nam_hien_hanh === 1);
            if (currentNamHoc && !selectedNamHocId) {
                setSelectedNamHocId(currentNamHoc.id.toString());
            } else if (response.data.statistics_by_year?.length > 0 && !selectedNamHocId) {
                // Nếu không có năm hiện hành, chọn năm đầu tiên trong danh sách thống kê
                setSelectedNamHocId(response.data.statistics_by_year[0].nam_hoc_id.toString());
            }

        } catch (err) {
            setError(err.response?.data?.message || "Không thể tải dữ liệu thống kê.");
            message.error(err.response?.data?.message || "Lỗi tải dữ liệu tổng quan.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchYearlyStatisticsDetail = async (namHocId) => {
        if (!namHocId) {
            setSelectedYearData(null);
            return;
        }
        setIsLoadingYearDetail(true);
        setError(null);
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(`/api/lecturer/statistics/yearly-detail?nam_hoc_id=${namHocId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedYearData(response.data);
        } catch (err) {
            setSelectedYearData(null);
            message.error(err.response?.data?.message || `Lỗi tải chi tiết năm học.`);
        } finally {
            setIsLoadingYearDetail(false);
        }
    };

    const getTrangThaiText = (trangThai) => {
        switch (trangThai) {
            case 3: return "Đã duyệt";
            case 2: return "Từ chối";
            case 1: return "Chờ duyệt";
            case 0: return "Nháp";
            case 4: return "BM Trả lại";
            default: return "Không xác định";
        }
    };

     const getTrangThaiTag = (trangThai) => {
        switch (trangThai) {
            case 3: return <Tag color="success" icon={<CheckCircleOutlined />}>{getTrangThaiText(trangThai)}</Tag>;
            case 2: return <Tag color="error" icon={<CloseCircleOutlined />}>{getTrangThaiText(trangThai)}</Tag>;
            case 1: return <Tag color="processing" icon={<ClockCircleOutlined />}>{getTrangThaiText(trangThai)}</Tag>;
            case 0: return <Tag color="default" icon={<ExclamationCircleOutlined />}>{getTrangThaiText(trangThai)}</Tag>;
            case 4: return <Tag color="warning" icon={<ExclamationCircleOutlined />}>{getTrangThaiText(trangThai)}</Tag>;
            default: return <Tag color="default">{getTrangThaiText(trangThai)}</Tag>;
        }
    };

    const overviewColumns = [
        { title: 'Năm học', dataIndex: 'nam_hoc', key: 'nam_hoc', width: 150, fixed: 'left' },
        {
            title: 'Trạng thái', dataIndex: 'trang_thai_phe_duyet', key: 'trang_thai_phe_duyet', width: 150, align: 'center',
            render: (trangThai) => getTrangThaiTag(trangThai)
        },
        {
            title: 'Tổng giờ thực hiện', dataIndex: 'tong_gio_thuc_hien', key: 'tong_gio_thuc_hien', width: 150, align: 'center',
            render: (text) => <Text strong>{parseFloat(text || 0).toFixed(2)}</Text>
        },
        {
            title: 'ĐM Giảng dạy', dataIndex: 'dinh_muc_gd', key: 'dinh_muc_gd', width: 130, align: 'center',
            render: (text) => parseFloat(text || 0).toFixed(2)
        },
        {
            title: 'ĐM NCKH', dataIndex: 'dinh_muc_khcn', key: 'dinh_muc_khcn', width: 120, align: 'center',
            render: (text) => parseFloat(text || 0).toFixed(2)
        },
        {
            title: 'GD Lớp, ĐG, Khác GD', dataIndex: ['phan_bo_gio', 'giang_day_lop_danhgia_khacgd'], key: 'gd_lop_danhgia_khacgd', width: 180, align: 'center',
            render: (text) => parseFloat(text || 0).toFixed(2)
        },
        {
            title: 'Hướng dẫn QĐ', dataIndex: ['phan_bo_gio', 'huong_dan'], key: 'huong_dan', width: 130, align: 'center',
            render: (text) => parseFloat(text || 0).toFixed(2)
        },
        {
            title: 'Coi, Chấm thi ĐH', dataIndex: ['phan_bo_gio', 'coi_cham_thi_dh'], key: 'coi_cham_thi_dh', width: 150, align: 'center',
            render: (text) => parseFloat(text || 0).toFixed(2)
        },
        {
            title: 'NCKH & CTK ra KHCN', dataIndex: ['phan_bo_gio', 'khcn'], key: 'khcn', width: 180, align: 'center',
            render: (text) => parseFloat(text || 0).toFixed(2)
        },
        {
            title: 'GD Xa trường', dataIndex: ['phan_bo_gio', 'gd_xa_truong'], key: 'gd_xa_truong', width: 130, align: 'center',
            render: (text) => parseFloat(text || 0).toFixed(2)
        },
        {
            title: '% Hoàn thành GD', dataIndex: 'ty_le_hoanthanh_gd', key: 'ty_le_hoanthanh_gd', width: 150, align: 'center',
            render: (text) => <Tag color={text >= 100 ? "green" : text >=80 ? "orange" : "red"}>{parseFloat(text || 0).toFixed(1)}%</Tag>
        },
         {
            title: '% Hoàn thành KHCN', dataIndex: 'ty_le_hoanthanh_khcn', key: 'ty_le_hoanthanh_khcn', width: 160, align: 'center',
            render: (text) => <Tag color={text >= 100 ? "green" : text >=80 ? "orange" : "red"}>{parseFloat(text || 0).toFixed(1)}%</Tag>
        },
        {
            title: 'Thừa/Thiếu GD', dataIndex: 'thua_thieu_gd', key: 'thua_thieu_gd', width: 140, align: 'center',
            render: (text) => <Text type={text >=0 ? 'success' : 'danger'} strong>{parseFloat(text || 0).toFixed(2)}</Text>
        },
        {
            title: 'Hoàn thành KHCN so với Đ.Mức', dataIndex: 'hoan_thanh_khcn_so_voi_dm', key: 'hoan_thanh_khcn_so_voi_dm', width: 200, align: 'center',
            render: (text) => <Text type={text >=0 ? 'success' : 'danger'} strong>{parseFloat(text || 0).toFixed(2)}</Text>
        },
    ];

    const trendChartData = useMemo(() => {
        if (!statisticsOverview || statisticsOverview.length === 0) return { labels: [], datasets: [] };
        // Sắp xếp theo năm học tăng dần cho biểu đồ đường
        const sortedStats = [...statisticsOverview].sort((a, b) => (a.nam_hoc || "").localeCompare(b.nam_hoc || ""));
        return {
            labels: sortedStats.map(item => item.nam_hoc),
            datasets: [
                {
                    label: 'Tổng giờ thực hiện',
                    data: sortedStats.map(item => item.tong_gio_thuc_hien),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.1,
                    yAxisID: 'y',
                },
                {
                    label: 'Định mức GD',
                    data: sortedStats.map(item => item.dinh_muc_gd),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    type: 'line',
                    borderDash: [5, 5],
                    tension: 0.1,
                    yAxisID: 'y',
                },
                 {
                    label: '% Hoàn thành GD',
                    data: sortedStats.map(item => item.ty_le_hoanthanh_gd),
                    borderColor: 'rgb(255, 159, 64)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    type: 'bar', 
                    yAxisID: 'y1', 
                },
            ],
        };
    }, [statisticsOverview]);

    const trendChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        stacked: false,
        plugins: {
            title: { display: true, text: 'Xu hướng Khối lượng công việc qua các Năm học' },
            legend: { position: 'bottom' }
        },
        scales: {
            y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Giờ chuẩn' } },
            y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: {display: true, text: '% Hoàn thành'} },
        },
    };

    const yearlyDetailChartData = useMemo(() => {
        if (!selectedYearData || !selectedYearData.chi_tiet_gio) return { labels: [], datasets: [] };
        return selectedYearData.chi_tiet_gio;
    }, [selectedYearData]);

    const yearlyPieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right' },
            title: { display: true, text: `Phân bổ Giờ chuẩn Năm học ${selectedYearData?.nam_hoc || ''}` },
            tooltip: { callbacks: { label: (c) => `${c.label}: ${c.raw.toFixed(2)} giờ (${((c.raw / c.dataset.data.reduce((a,b)=>a+b,0)) * 100).toFixed(1)}%)`}}
        },
    };

    const yearlyBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            legend: { display: false }, 
            title: { display: true, text: `Chi tiết Giờ chuẩn Năm học ${selectedYearData?.nam_hoc || ''}` },
            tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.raw.toFixed(2)} giờ`}}
        },
        scales: { x: { beginAtZero: true, title: {display: true, text: 'Giờ chuẩn'} } }
    };

    const performanceRadarData = useMemo(() => {
        if (!selectedYearData || !selectedYearData.chi_tiet_gio) return { labels: [], datasets: [] };
        
        const data = selectedYearData.chi_tiet_gio;
        const labels = data.labels || [];
        const values = data.datasets[0]?.data || [];
        
        // Tính toán tỷ lệ phần trăm cho radar chart
        const maxValue = Math.max(...values);
        // const total = values.reduce((sum, val) => sum + val, 0);
        const percentageData = values.map(val => (val / maxValue) * 100);
        
        return {
            labels: labels,
            datasets: [{
                label: 'Tỷ lệ hoàn thành (%)',
                data: percentageData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
            }]
        };
    }, [selectedYearData]);

    const comparisonStackedData = useMemo(() => {
        if (!statisticsOverview || statisticsOverview.length === 0) return { labels: [], datasets: [] };
        
        const sortedStats = [...statisticsOverview].sort((a, b) => (a.nam_hoc || "").localeCompare(b.nam_hoc || ""));
        
        return {
            labels: sortedStats.map(item => item.nam_hoc),
            datasets: [
                {
                    label: 'Giảng dạy & Đánh giá',
                    data: sortedStats.map(item => item.phan_bo_gio?.giang_day_lop_danhgia_khacgd || 0),
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    stack: 'Stack 0',
                },
                {
                    label: 'Hướng dẫn',
                    data: sortedStats.map(item => item.phan_bo_gio?.huong_dan || 0),
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    stack: 'Stack 0',
                },
                {
                    label: 'NCKH',
                    data: sortedStats.map(item => item.phan_bo_gio?.khcn || 0),
                    backgroundColor: 'rgba(255, 205, 86, 0.8)',
                    stack: 'Stack 0',
                },
                {
                    label: 'Coi thi & Chấm thi',
                    data: sortedStats.map(item => item.phan_bo_gio?.coi_cham_thi_dh || 0),
                    backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    stack: 'Stack 0',
                },
                {
                    label: 'GD Xa trường',
                    data: sortedStats.map(item => item.phan_bo_gio?.gd_xa_truong || 0),
                    backgroundColor: 'rgba(153, 102, 255, 0.8)',
                    stack: 'Stack 0',
                }
            ]
        };
    }, [statisticsOverview]);

    const efficiencyDoughnutData = useMemo(() => {
        if (!selectedYearData) return { labels: [], datasets: [] };
        
        const datas = statisticsOverview[0];
        const completion = parseFloat(datas.ty_le_hoanthanh_gd || 0);
        const remaining = Math.max(0, 100 - completion);

        // Xử lý trường hợp tỷ lệ > 100%
        const displayCompletion = Math.min(completion, 100);
        const displayRemaining = Math.max(0, 100 - displayCompletion);
        
        return {
            labels: ['Đã hoàn thành', 'Còn lại'],
            datasets: [{
                data: [displayCompletion, displayRemaining],
                backgroundColor: [
                    completion >= 100 ? '#52c41a' : completion >= 80 ? '#faad14' : '#ff4d4f',
                    '#f0f0f0'
                ],
                borderWidth: 2,
                borderColor: '#fff',
                cutout: '60%'
            }]
        };
    }, [selectedYearData]);

    const yearlyAreaData = useMemo(() => {
        if (!statisticsOverview || statisticsOverview.length === 0) return { labels: [], datasets: [] };
        
        const sortedStats = [...statisticsOverview].sort((a, b) => (a.nam_hoc || "").localeCompare(b.nam_hoc || ""));
        
        return {
            labels: sortedStats.map(item => item.nam_hoc),
            datasets: [
                {
                    label: 'Định mức GD',
                    data: sortedStats.map(item => item.dinh_muc_gd),
                    fill: 'origin',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    tension: 0.4
                },
                {
                    label: 'Thực hiện GD',
                    data: sortedStats.map(item => item.phan_bo_gio?.giang_day_lop_danhgia_khacgd || 0),
                    fill: 'origin',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    tension: 0.4
                },
                {
                    label: 'Định mức NCKH',
                    data: sortedStats.map(item => item.dinh_muc_khcn),
                    fill: 'origin',
                    backgroundColor: 'rgba(255, 205, 86, 0.2)',
                    borderColor: 'rgba(255, 205, 86, 1)',
                    tension: 0.4
                }
            ]
        };
    }, [statisticsOverview]);

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: 'Phân tích Hiệu suất Công việc' },
            legend: { position: 'top' }
        },
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: { stepSize: 20 }
            }
        }
    };

    const stackedOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: 'So sánh Cơ cấu Công việc qua các Năm' },
            legend: { position: 'bottom' }
        },
        scales: {
            x: { stacked: true },
            y: { 
                stacked: true,
                title: { display: true, text: 'Giờ chuẩn' }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: 'Tỷ lệ Hoàn thành Định mức GD' },
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const actualCompletion = parseFloat(statisticsOverview[0]?.ty_le_hoanthanh_gd || 0);
                        if (context.dataIndex === 0) {
                            return `Đã hoàn thành: ${actualCompletion.toFixed(1)}%`;
                        } else {
                            return `Còn lại: ${Math.max(0, 100 - actualCompletion).toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    };

    const areaOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: 'Xu hướng Định mức vs Thực hiện' },
            legend: { position: 'bottom' },
            filler: { propagate: false }
        },
        scales: {
            y: {
                title: { display: true, text: 'Giờ chuẩn' },
                beginAtZero: true
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden flex items-center justify-center">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 text-center space-y-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <BarChartOutlined className="text-4xl text-white" />
                        </div>
                        
                        <div className="absolute -top-2 -right-8 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-ping"></div>
                        <div className="absolute -bottom-2 -left-8 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse delay-300"></div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-slate-700 to-gray-800 bg-clip-text text-transparent">
                            Đang tải dữ liệu thống kê
                        </h2>
                        <p className="text-lg text-gray-600 max-w-md mx-auto">
                            Vui lòng chờ trong giây lát, chúng tôi đang xử lý dữ liệu cho bạn...
                        </p>
                    </div>

                    <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                        <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-300"></div>
                    </div>

                    <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 relative">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10 p-8">
                    <Alert 
                        message="Lỗi tải dữ liệu thống kê" 
                        description={error} 
                        type="error" 
                        showIcon 
                        className="custom-alert"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-8 space-y-6">
                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                        <BarChartOutlined className="text-2xl text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-md"></div>
                                </div>
                                <div className="space-y-2">
                                    <Title level={2} style={{ margin: 0 }} className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
                                        Thống kê Khối lượng Công việc
                                    </Title>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                        <Text type="secondary">
                                            Phân tích và thống kê dữ liệu kê khai giờ chuẩn qua các năm học
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Row gutter={16} align="bottom">
                        <Col xs={24} sm={12} md={8}>
                            <Text strong>Chọn Năm học để xem chi tiết:</Text>
                            <Select
                                value={selectedNamHocId}
                                onChange={setSelectedNamHocId}
                                placeholder="Chọn năm học"
                                style={{ width: '100%', marginTop: 8 }}
                                size="large"
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                }
                                className="custom-select"
                            >
                                {namHocList.map(nh => (
                                    <Option key={nh.id} value={nh.id.toString()}>
                                        {nh.ten_nam_hoc}
                                        {nh.la_nam_hien_hanh ? <Tag color="green" style={{marginLeft: 5}}>Hiện hành</Tag> : null}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                         <Col xs={24} sm={12} md={8}>
                            <Button
                                icon={<SyncOutlined />}
                                onClick={fetchStatisticsOverview}
                                loading={isLoading}
                                size="large"
                                style={{ marginTop: 8 }}
                                className="custom-button"
                            >
                                Tải lại toàn bộ thống kê
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {overallSummary && (
                    <Card 
                        title="Tóm tắt chung (các năm đã duyệt)" 
                        className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" 
                        style={{ borderRadius: '16px' }}
                    >
                        <Row gutter={16}>
                            <Col span={8}>
                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                    <Statistic 
                                        title="Số năm thống kê" 
                                        value={overallSummary.so_nam_thong_ke}
                                        prefix={<CalendarOutlined className="text-blue-500" />}
                                    />
                                </div>
                            </Col>
                            <Col span={8}>
                                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                                    <Statistic 
                                        title="Tổng giờ TB/năm" 
                                        value={overallSummary.tong_gio_thuc_hien_tb} 
                                        suffix="giờ" 
                                        precision={2}
                                        prefix={<ClockCircleOutlined className="text-emerald-500" />}
                                    />
                                </div>
                            </Col>
                            <Col span={8}>
                                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                                    <Statistic 
                                        title="% Hoàn thành GD TB" 
                                        value={overallSummary.ty_le_hoanthanh_gd_tb} 
                                        suffix="%" 
                                        precision={1}
                                        prefix={<CheckCircleOutlined className="text-amber-500" />}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Card>
                )}

                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <Tabs defaultActiveKey="overview" className="custom-tabs">
                        <TabPane tab={<span className="tab-label"><BarChartOutlined />Tổng quan</span>} key="overview">
                            <div className="p-6">
                                <Row gutter={[24, 24]}>
                                    <Col xs={24} lg={12}>
                                        <Card 
                                            title="Phân bổ Giờ chuẩn Chi tiết Năm học" 
                                            className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg" 
                                            style={{ borderRadius: '12px', height: '100%' }}
                                        >
                                            {isLoadingYearDetail && selectedNamHocId ? (
                                                <div className="h-96 flex justify-center items-center">
                                                    <div className="text-center">
                                                        <div className="relative mb-6">
                                                            <div className="w-16 h-16 relative flex justify-center items-center mx-auto">
                                                                <div className="absolute w-full h-full border-4 border-indigo-200/30 rounded-full animate-spin"></div>
                                                                <div className="absolute w-12 h-12 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                                                                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-full flex items-center justify-center">
                                                                    <BarChartOutlined className="text-white text-xs animate-pulse" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Text className="text-sm text-gray-600">Đang tải chi tiết năm...</Text>
                                                    </div>
                                                </div>
                                            ) : selectedYearData ? (
                                                <div style={{ height: '400px' }}>
                                                    <Bar data={yearlyDetailChartData} options={yearlyBarOptions} />
                                                </div>
                                            ) : (
                                                <div className="h-96 flex flex-col justify-center items-center">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                                        <BarChartOutlined className="text-2xl text-gray-400" />
                                                    </div>
                                                    <Text type="secondary">Chọn một năm học để xem biểu đồ chi tiết.</Text>
                                                </div>
                                            )}
                                        </Card>
                                    </Col>
                                    <Col xs={24} lg={12}>
                                        <Card 
                                            title="Xu hướng Tổng giờ Thực hiện qua các Năm học" 
                                            className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg" 
                                            style={{ borderRadius: '12px', height: '100%' }}
                                        >
                                            {statisticsOverview.length > 0 ? (
                                                <div style={{ height: '400px' }}>
                                                    <Line data={trendChartData} options={trendChartOptions} />
                                                </div>
                                            ) : (
                                                <div className="h-96 flex flex-col justify-center items-center">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                                        <LineChartOutlined className="text-2xl text-gray-400" />
                                                    </div>
                                                    <Text type="secondary">Chưa có đủ dữ liệu để vẽ biểu đồ xu hướng.</Text>
                                                </div>
                                            )}
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        </TabPane>

                        <TabPane tab={<span className="tab-label"><RadarChartOutlined />Phân tích Hiệu suất</span>} key="performance">
                            <div className="p-6">
                                <Row gutter={[24, 24]}>
                                    <Col xs={24} lg={12}>
                                        <Card 
                                            title="Radar Chart - Hiệu suất Công việc" 
                                            className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg" 
                                            style={{ borderRadius: '12px', height: '100%' }}
                                        >
                                            {selectedYearData ? (
                                                <div style={{ height: '400px' }}>
                                                    <Radar data={performanceRadarData} options={radarOptions} />
                                                </div>
                                            ) : (
                                                <div className="h-96 flex flex-col justify-center items-center">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                                        <RadarChartOutlined className="text-2xl text-gray-400" />
                                                    </div>
                                                    <Text type="secondary">Chọn một năm học để xem phân tích hiệu suất.</Text>
                                                </div>
                                            )}
                                        </Card>
                                    </Col>
                                    <Col xs={24} lg={12}>
                                        <Card 
                                            title="Tỷ lệ Hoàn thành Định mức" 
                                            className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg" 
                                            style={{ borderRadius: '12px', height: '100%' }}
                                        >
                                            {statisticsOverview ? (
                                                <div style={{ height: '400px' }}>
                                                    <Doughnut data={efficiencyDoughnutData} options={doughnutOptions} />
                                                    <Progress 
                                                            percent={Math.round(statisticsOverview[0].ty_le_hoanthanh_gd || 0)} 
                                                            status={statisticsOverview[0].ty_le_hoanthanh_gd >= 100 ? "success" : "active"}
                                                            strokeColor={statisticsOverview[0].ty_le_hoanthanh_gd >= 100 ? "#52c41a" : statisticsOverview[0].ty_le_hoanthanh_gd >= 80 ? "#faad14" : "#ff4d4f"}
                                                            format={(percent) => `${parseFloat(statisticsOverview[0].ty_le_hoanthanh_gd || 0).toFixed(1)}%`}
                                                            className="custom-progress"
                                                        />
                                                </div>
                                            ) : (
                                                <div className="h-96 flex flex-col justify-center items-center">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                                        <PieChartOutlined className="text-2xl text-gray-400" />
                                                    </div>
                                                    <Text type="secondary">Chọn một năm học để xem tỷ lệ hoàn thành.</Text>
                                                </div>
                                            )}
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        </TabPane>

                        <TabPane tab={<span className="tab-label"><DotChartOutlined />So sánh Cơ cấu</span>} key="comparison">
                            <div className="p-6">
                                <Row gutter={[24, 24]}>
                                    <Col xs={24} lg={12}>
                                        <Card 
                                            title="Stacked Bar - Cơ cấu Công việc qua các Năm" 
                                            className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg" 
                                            style={{ borderRadius: '12px', height: '100%' }}
                                        >
                                            {statisticsOverview.length > 0 ? (
                                                <div style={{ height: '400px' }}>
                                                    <Bar data={comparisonStackedData} options={stackedOptions} />
                                                </div>
                                            ) : (
                                                <div className="h-96 flex flex-col justify-center items-center">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                                        <DotChartOutlined className="text-2xl text-gray-400" />
                                                    </div>
                                                    <Text type="secondary">Chưa có đủ dữ liệu để so sánh cơ cấu.</Text>
                                                </div>
                                            )}
                                        </Card>
                                    </Col>
                                    <Col xs={24} lg={12}>
                                        <Card 
                                            title="Area Chart - Xu hướng Định mức vs Thực hiện" 
                                            className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg" 
                                            style={{ borderRadius: '12px', height: '100%' }}
                                        >
                                            {statisticsOverview.length > 0 ? (
                                                <div style={{ height: '400px' }}>
                                                    <Line data={yearlyAreaData} options={areaOptions} />
                                                </div>
                                            ) : (
                                                <div className="h-96 flex flex-col justify-center items-center">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                                        <AreaChartOutlined className="text-2xl text-gray-400" />
                                                    </div>
                                                    <Text type="secondary">Chưa có đủ dữ liệu để vẽ biểu đồ xu hướng.</Text>
                                                </div>
                                            )}
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        </TabPane>

                        <TabPane tab={<span className="tab-label"><PieChartOutlined />Biểu đồ Tròn</span>} key="pie">
                            <div className="p-6">
                                <Row gutter={[24, 24]}>
                                    <Col xs={24} lg={12}>
                                        <Card 
                                            title="Pie Chart - Phân bổ Giờ chuẩn" 
                                            className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg" 
                                            style={{ borderRadius: '12px', height: '100%' }}
                                        >
                                            {selectedYearData ? (
                                                <div style={{ height: '400px' }}>
                                                    <Pie data={yearlyDetailChartData} options={yearlyPieOptions} />
                                                </div>
                                            ) : (
                                                <div className="h-96 flex flex-col justify-center items-center">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                                        <PieChartOutlined className="text-2xl text-gray-400" />
                                                    </div>
                                                    <Text type="secondary">Chọn một năm học để xem biểu đồ tròn.</Text>
                                                </div>
                                            )}
                                        </Card>
                                    </Col>
                                    <Col xs={24} lg={12}>
                                        <Card 
                                            title="Polar Area - Phân tích Khối lượng" 
                                            className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg" 
                                            style={{ borderRadius: '12px', height: '100%' }}
                                        >
                                            {selectedYearData ? (
                                                <div style={{ height: '400px' }}>
                                                    <PolarArea 
                                                        data={yearlyDetailChartData} 
                                                        options={{
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: {
                                                                title: { display: true, text: 'Polar Area - Phân tích Khối lượng Công việc' },
                                                                legend: { position: 'bottom' }
                                                            }
                                                        }} 
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-96 flex flex-col justify-center items-center">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                                        <RadarChartOutlined className="text-2xl text-gray-400" />
                                                    </div>
                                                    <Text type="secondary">Chọn một năm học để xem biểu đồ polar.</Text>
                                                </div>
                                            )}
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        </TabPane>
                    </Tabs>
                </Card>

                <Card 
                    title="Bảng Tổng quan Kê khai qua các Năm học" 
                    className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" 
                    style={{ borderRadius: '16px' }}
                >
                    {statisticsOverview.length > 0 ? (
                        <Table
                            columns={overviewColumns}
                            dataSource={statisticsOverview}
                            rowKey="nam_hoc_id" 
                            pagination={{ 
                                pageSize: 5, 
                                showSizeChanger: true, 
                                pageSizeOptions: ['5', '10', '20'],
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} của ${total} bản ghi`,
                            }}
                            scroll={{ x: 'max-content' }}
                            bordered
                            size="small"
                            className="custom-table"
                        />
                    ) : (
                        <Empty 
                            description="Không có dữ liệu tổng quan để hiển thị."
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    )}
                </Card>

                <style>{`
                    .enhanced-form .ant-form-item-label > label {
                        font-weight: 600 !important;
                        color: #374151 !important;
                    }

                    .custom-select .ant-select-selector {
                        border-radius: 12px !important;
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.2s ease !important;
                        background: rgba(255, 255, 255, 0.8) !important;
                        backdrop-filter: blur(8px) !important;
                    }
                    
                    .custom-select .ant-select-selector:hover {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
                    }

                    .custom-select .ant-select-focused .ant-select-selector {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
                    }

                    .custom-button.ant-btn {
                        border-radius: 12px !important;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                        backdrop-filter: blur(8px) !important;
                    }
                    
                    .custom-button.ant-btn:hover {
                        transform: translateY(-1px) !important;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
                    }

                    .custom-button.ant-btn-primary {
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                        border: none !important;
                    }

                    .custom-button.ant-btn-primary:hover {
                        background: linear-gradient(135deg, #1d4ed8, #1e40af) !important;
                    }

                    .custom-alert.ant-alert {
                        border-radius: 12px !important;
                        border: none !important;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
                        backdrop-filter: blur(8px) !important;
                    }

                    .custom-tabs .ant-tabs-nav {
                        margin-bottom: 0 !important;
                    }

                    .custom-tabs .ant-tabs-tab {
                        border-radius: 8px 8px 0 0 !important;
                        transition: all 0.2s ease !important;
                        font-weight: 500 !important;
                        margin-right: 8px !important;
                        padding: 12px 20px !important;
                        min-width: 160px !important;
                    }

                    .custom-tabs .ant-tabs-tab:hover {
                        background: rgba(59, 130, 246, 0.05) !important;
                    }

                    .custom-tabs .ant-tabs-tab-active {
                        background: rgba(59, 130, 246, 0.1) !important;
                        border-color: #3b82f6 !important;
                    }

                    .custom-tabs > .ant-tabs-content-holder {
                        padding: 0 !important;
                        background: transparent !important;
                    }

                    .custom-tabs > .ant-tabs-content-holder > .ant-tabs-content {
                        padding: 0 !important;
                    }

                    .ant-tabs-tabpane {
                        outline: none !important;
                    }

                    .tab-label {
                        display: inline-flex !important;
                        align-items: center !important;
                        gap: 8px !important;
                        font-size: 14px !important;
                        font-weight: 500 !important;
                        white-space: nowrap !important;
                    }

                    .tab-label .anticon {
                        font-size: 16px !important;
                        margin-right: 0 !important;
                    }

                    @media (max-width: 768px) {
                        .custom-tabs .ant-tabs-tab {
                            min-width: 120px !important;
                            padding: 8px 12px !important;
                        }
                        
                        .tab-label {
                            font-size: 13px !important;
                            gap: 6px !important;
                        }
                        
                        .tab-label .anticon {
                            font-size: 14px !important;
                        }
                    }

                    @media (max-width: 480px) {
                        .custom-tabs .ant-tabs-tab {
                            min-width: 100px !important;
                            padding: 6px 8px !important;
                        }
                        
                        .tab-label {
                            font-size: 12px !important;
                            gap: 4px !important;
                        }
                    }

                    .custom-table .ant-table {
                        border-radius: 12px !important;
                        overflow: hidden !important;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
                    }

                    .custom-table .ant-table-thead > tr > th {
                        background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
                        border: none !important;
                        font-weight: 600 !important;
                        color: #374151 !important;
                        padding: 12px 8px !important;
                    }

                    .custom-table .ant-table-tbody > tr > td {
                        border: none !important;
                        padding: 8px !important;
                        transition: all 0.2s ease !important;
                    }

                    .custom-table .ant-table-tbody > tr:hover > td {
                        background: rgba(59, 130, 246, 0.05) !important;
                    }

                    .custom-progress .ant-progress-bg {
                        border-radius: 8px !important;
                    }

                    .custom-progress .ant-progress-outer {
                        border-radius: 8px !important;
                    }

                    .ant-tag {
                        border-radius: 6px !important;
                        font-weight: 500 !important;
                        padding: 2px 8px !important;
                        border: none !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                    }

                    .ant-statistic-title {
                        font-size: 13px !important;
                        color: #6b7280 !important;
                        font-weight: 500 !important;
                    }
                    .ant-statistic-content {
                        font-size: 20px !important;
                        font-weight: 600 !important;
                    }

                    .ant-card {
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }

                    .ant-card:hover {
                        transform: translateY(-2px) !important;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
                    }

                    .ant-empty {
                        margin: 32px 0 !important;
                    }

                    .ant-empty-description {
                        color: #6b7280 !important;
                        font-size: 14px !important;
                    }

                    .ant-pagination {
                        margin-top: 24px !important;
                    }

                    .ant-pagination-item {
                        border-radius: 8px !important;
                        border: 1px solid #e2e8f0 !important;
                    }

                    .ant-pagination-item-active {
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                        border-color: #3b82f6 !important;
                    }

                    .ant-pagination-item-active a {
                        color: white !important;
                    }
                `}</style>
            </div>
        </div>
    );
}

export default ThongKe;