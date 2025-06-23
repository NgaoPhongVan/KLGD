import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Card,
    Select,
    Typography,
    Spin,
    Row,
    Col,
    Table,
    Statistic,
    Empty,
    Alert,
    Button,
    message,
    Tag,
    Form,
    Divider
} from 'antd';
import {
    BarChartOutlined,
    PieChartOutlined,
    LineChartOutlined,
    TeamOutlined,
    UserOutlined,
    CalendarOutlined,
    SyncOutlined,
    InfoCircleOutlined,
    RiseOutlined,
    FallOutlined,
    UsergroupAddOutlined,
    SlidersOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DashboardOutlined,
    FilterOutlined,
    TrophyOutlined,
    RiseOutlined as TrendingUpOutlined // Use RiseOutlined as alias for trending up
} from '@ant-design/icons';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement,
    Title as ChartTitle, Tooltip, Legend
} from "chart.js";

ChartJS.register(
    CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, ChartTitle, Tooltip, Legend
);

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

function ManagerStatistics() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [namHocList, setNamHocList] = useState([]);
    const [selectedNamHocId, setSelectedNamHocId] = useState(""); // ID năm học để lọc
    const [boMonCuaManagerList, setBoMonCuaManagerList] = useState([]); // Nếu Manager là Trưởng Khoa
    const [selectedBoMonId, setSelectedBoMonId] = useState(""); // Chỉ dùng nếu Manager là Trưởng Khoa

    const [statsData, setStatsData] = useState({
        total_ke_khai_bm: 0,
        pending_bm: 0,
        approved_bm: 0,
        rejected_bm: 0,
        total_hours_approved_bm: 0,
        average_hours_per_teacher_bm: 0,
        activity_stats_bm: {
            giang_day_final: 0, giang_day_final_percentage: 0,
            nckh_final: 0, nckh_final_percentage: 0,
            congtac_khac_gd: 0, congtac_khac_gd_percentage: 0, // CT Khác ra GD
            coithi_chamthi_dh: 0, coithi_chamthi_dh_percentage: 0,
            gd_xa_truong: 0, gd_xa_truong_percentage: 0
        },
        top_giang_viens_bm: [],
        time_trend_bm: [],
    });
    const [managerInfo, setManagerInfo] = useState(null);


    useEffect(() => {
        fetchInitialFilters();
    }, []);

    useEffect(() => {
        // Fetch stats khi selectedNamHocId hoặc selectedBoMonId (nếu có) thay đổi
        if (managerInfo) { // Chỉ fetch khi đã có thông tin manager (để biết phạm vi)
            fetchStatisticsData();
        }
    }, [selectedNamHocId, selectedBoMonId, managerInfo]);

    const fetchInitialFilters = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        try {
            const [managerRes, namHocRes, boMonRes] = await Promise.all([
                axios.get("/api/manager/profile", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/manager/nam-hoc-list", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/manager/bo-mon-list", { headers: { Authorization: `Bearer ${token}` } }) // API lấy DS bộ môn thuộc khoa của manager
            ]);

            setManagerInfo(managerRes.data);
            const nhs = namHocRes.data || [];
            setNamHocList(nhs);
            setBoMonCuaManagerList(boMonRes.data || []);

            const currentNamHoc = nhs.find(nh => nh.la_nam_hien_hanh === 1);
            if (currentNamHoc) {
                setSelectedNamHocId(currentNamHoc.id.toString());
            }
            // Nếu manager là trưởng bộ môn, selectedBoMonId có thể được set cố định hoặc không cần
            // Nếu là trưởng khoa, giảng viên có thể chọn bộ môn

        } catch (err) {
            message.error("Không thể tải dữ liệu bộ lọc ban đầu.");
            setError("Lỗi tải dữ liệu bộ lọc.");
        } finally {
            setIsLoading(false);
        }
    };


    const fetchStatisticsData = async () => {
        if (!managerInfo) return; // Chưa có thông tin manager
        
        setIsLoading(true); setError(null);
        const token = localStorage.getItem("token");
        try {
            const params = {
                nam_hoc_id: selectedNamHocId,
                // bo_mon_id sẽ được controller tự xử lý dựa trên bo_mon_id của manager
                // Nếu Manager là Trưởng Khoa và cho phép chọn bộ môn:
                // bo_mon_id: selectedBoMonId,
            };
            const response = await axios.get("/api/manager/statistics", {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            setStatsData(response.data || {
                total_ke_khai_bm: 0, approved_bm: 0, pending_bm: 0, rejected_bm: 0,
                total_hours_approved_bm: 0, average_hours_per_teacher_bm: 0,
                activity_stats_bm: {}, top_giang_viens_bm: [], time_trend_bm: []
            });
        } catch (err) {
            message.error(err.response?.data?.message || "Lỗi tải dữ liệu thống kê.");
            setError(err.response?.data?.message || "Lỗi tải dữ liệu thống kê.");
        } finally {
            setIsLoading(false);
        }
    };


    const activityPieData = useMemo(() => {
        const { activity_stats_bm } = statsData;
        if (!activity_stats_bm || Object.keys(activity_stats_bm).length === 0) return { labels: [], datasets: [] };

        const labels = [
            'GD Lớp, ĐG, Khác GD, Khảo thí (ThS,TS)',
            'Hướng dẫn QĐ',
            'Coi thi, Chấm thi ĐH',
            'NCKH & CT Khác ra KHCN',
            'GD Xa trường'
        ];
        const dataValues = [
            activity_stats_bm.giang_day_final || 0, // Đây là tổng các giờ giảng dạy và các hoạt động liên quan
            activity_stats_bm.huong_dan_final || 0, // Cần thêm trường này từ backend hoặc tính từ các chi tiết
            activity_stats_bm.coithi_chamthi_dh || 0,
            activity_stats_bm.nckh_final || 0,
            activity_stats_bm.gd_xa_truong || 0
        ];
         // Lọc bỏ các giá trị 0 để biểu đồ không bị rối
        const filteredLabels = [];
        const filteredDataValues = [];
        const backgroundColors = [
            'rgba(54, 162, 235, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
        ];
        const filteredBackgroundColors = [];

        dataValues.forEach((value, index) => {
            if (value > 0) {
                filteredLabels.push(labels[index]);
                filteredDataValues.push(value);
                filteredBackgroundColors.push(backgroundColors[index]);
            }
        });


        return {
            labels: filteredLabels,
            datasets: [{
                data: filteredDataValues,
                backgroundColor: filteredBackgroundColors,
                hoverOffset: 4
            }]
        };
    }, [statsData.activity_stats_bm]);

    const pieOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels:{padding: 15, boxWidth:12} }, title: { display: true, text: 'Phân bổ Giờ chuẩn theo Loại hình (Đã duyệt)' } }
    };

    const topGiangViensBarData = useMemo(() => {
        return {
            labels: statsData.top_giang_viens_bm.map(gv => `${gv.ho_ten} (${gv.ma_gv})`),
            datasets: [{
                label: 'Tổng giờ chuẩn đã duyệt',
                data: statsData.top_giang_viens_bm.map(gv => gv.total_hours),
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };
    }, [statsData.top_giang_viens_bm]);
    
    const topGiangViensOptions = {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: true, text: 'Top Giảng viên có Giờ chuẩn cao nhất (Đã duyệt)' } },
        scales: { x: { beginAtZero: true, title: {display: true, text: 'Giờ chuẩn'} } }
    };


    const timeTrendLineData = useMemo(() => {
        const sortedTimeTrend = [...statsData.time_trend_bm].sort((a, b) => (a.period || "").localeCompare(b.period || ""));
        return {
            labels: sortedTimeTrend.map(item => item.period),
            datasets: [
                {
                    label: 'Tổng giờ chuẩn duyệt',
                    data: sortedTimeTrend.map(item => item.total_hours),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y_hours',
                },
                {
                    label: 'Số GV kê khai',
                    data: sortedTimeTrend.map(item => item.teacher_count),
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y_teachers',
                }
            ]
        };
    }, [statsData.time_trend_bm]);

    const timeTrendOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top' }, title: { display: true, text: 'Xu hướng Kê khai qua các Năm học (Đã duyệt)' } },
        scales: {
            y_hours: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Tổng Giờ Chuẩn' } },
            y_teachers: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Số Giảng viên' }, min: 0 }
        }
    };


    const topGiangVienColumns = [
        { title: 'Hạng', dataIndex: 'rank', key: 'rank', width: 80, render: (text, record, index) => index + 1 },
        { title: 'Mã GV', dataIndex: 'ma_gv', key: 'ma_gv', width: 120 },
        { title: 'Họ tên', dataIndex: 'ho_ten', key: 'ho_ten' },
        {
            title: 'Tổng giờ duyệt', dataIndex: 'total_hours', key: 'total_hours', width: 150, align: 'right',
            render: (text) => <Text strong>{parseFloat(text || 0).toFixed(2)}</Text>
        },
    ];


    if (isLoading && !statsData.top_giang_viens_bm.length) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex justify-center items-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-200/50 mx-auto">
                        <Spin size="large" />
                    </div>
                    <Text className="text-lg text-gray-600">Đang tải dữ liệu thống kê...</Text>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex justify-center items-center p-6">
                <Alert 
                    message="Lỗi Tải Dữ Liệu" 
                    description={error} 
                    type="error" 
                    showIcon 
                    className="max-w-md rounded-2xl border-0 shadow-lg"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden">
            {/* Enhanced animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/8 to-indigo-400/8 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 p-6 space-y-6">
                {/* Enhanced Header */}
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10" style={{ borderRadius: '24px' }}>
                    <div className="relative overflow-hidden bg-gradient-to-r from-slate-50/90 via-blue-50/60 to-indigo-50/90 px-8 py-6 -mx-6 -mt-6 mb-8 rounded-t-3xl border-b border-gray-200/50">
                        {/* Header decoration */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                        
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center space-x-8">
                                <div className="relative group">
                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-3 group-hover:rotate-0 transition-all duration-500 ease-out">
                                        <BarChartOutlined className="text-3xl text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full border-3 border-white shadow-lg animate-bounce"></div>
                                    <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full border-2 border-white shadow-md"></div>
                                </div>
                                <div className="space-y-3">
                                    <Title level={1} style={{ margin: 0 }} className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-slate-700 to-gray-800 bg-clip-text text-transparent">
                                        Thống kê Khối lượng Công việc
                                    </Title>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                                            <Text type="secondary" className="text-base">
                                                Báo cáo và phân tích dữ liệu bộ môn toàn diện
                                            </Text>
                                        </div>
                                        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-white/60 rounded-full border border-blue-200/50">
                                            <DashboardOutlined className="text-blue-500 text-sm" />
                                            <Text className="text-sm font-medium text-gray-700">
                                                Analytics Dashboard
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <Button 
                                    icon={<SyncOutlined />} 
                                    onClick={fetchStatisticsData} 
                                    loading={isLoading}
                                    size="large"
                                    className="bg-white/80 border-blue-200/60 hover:border-blue-400 hover:bg-blue-50/80 shadow-lg hover:shadow-xl transition-all duration-300"
                                    style={{ borderRadius: '12px' }}
                                >
                                    Làm mới
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Filters Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <FilterOutlined className="text-white text-sm" />
                                </div>
                                <Title level={4} className="mb-0 text-gray-800">
                                    Bộ lọc & Cài đặt
                                </Title>
                            </div>
                        </div>

                        <Row gutter={[20, 20]} align="bottom">
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item label={
                                    <span className="flex items-center space-x-2 font-medium text-gray-700">
                                        <CalendarOutlined className="text-blue-500" />
                                        <span>Năm học</span>
                                    </span>
                                } style={{marginBottom: 0}}>
                                    <Select
                                        value={selectedNamHocId}
                                        onChange={setSelectedNamHocId}
                                        placeholder="Tất cả năm học"
                                        style={{ width: '100%' }}
                                        size="large"
                                        allowClear
                                        className="custom-select"
                                    >
                                        {namHocList.map(nh => (
                                            <Select.Option key={nh.id} value={nh.id.toString()}>
                                                <div className="flex items-center justify-between">
                                                    <span>{nh.ten_nam_hoc}</span>
                                                    {nh.la_nam_hien_hanh && (
                                                        <Tag color="green" size="small">Hiện tại</Tag>
                                                    )}
                                                </div>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </Card>

                {isLoading && statsData.top_giang_viens_bm.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-200/50 mx-auto mb-4">
                            <Spin size="large" />
                        </div>
                        <Text className="text-lg text-gray-600">Đang tải dữ liệu thống kê...</Text>
                    </div>
                ) : !statsData || statsData.total_ke_khai_bm === 0 ? (
                    <div className="text-center py-20">
                        <Empty 
                            description="Không có dữ liệu thống kê cho lựa chọn hiện tại." 
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            className="py-10"
                        />
                    </div>
                ) : (
                    <>
                        {/* Enhanced Statistics Cards */}
                        <Row gutter={[24, 24]} className="mb-8">
                            <Col xs={24} md={12} lg={6}>
                                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 h-full" style={{ borderRadius: '16px' }}>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <FileTextOutlined className="text-white text-lg" />
                                        </div>
                                        <Statistic 
                                            title="Tổng Kê khai" 
                                            value={statsData.total_ke_khai_bm}
                                            valueStyle={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold' }}
                                        />
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                                <Card className="bg-white/80 backdrop-blur-sm border border-emerald-200/50 hover:shadow-lg transition-all duration-300 h-full" style={{ borderRadius: '16px' }}>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <CheckCircleOutlined className="text-white text-lg" />
                                        </div>
                                        <Statistic 
                                            title="Đã duyệt" 
                                            value={statsData.approved_bm} 
                                            valueStyle={{ color: '#059669', fontSize: '24px', fontWeight: 'bold' }}
                                        />
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                                <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50 hover:shadow-lg transition-all duration-300 h-full" style={{ borderRadius: '16px' }}>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <ClockCircleOutlined className="text-white text-lg" />
                                        </div>
                                        <Statistic 
                                            title="Chờ duyệt" 
                                            value={statsData.pending_bm} 
                                            valueStyle={{ color: '#d97706', fontSize: '24px', fontWeight: 'bold' }}
                                        />
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                                <Card className="bg-white/80 backdrop-blur-sm border border-purple-200/50 hover:shadow-lg transition-all duration-300 h-full" style={{ borderRadius: '16px' }}>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <BarChartOutlined className="text-white text-lg" />
                                        </div>
                                        <Statistic 
                                            title="Tổng giờ duyệt" 
                                            value={statsData.total_hours_approved_bm} 
                                            precision={2} 
                                            suffix="h"
                                            valueStyle={{ color: '#7c3aed', fontSize: '24px', fontWeight: 'bold' }}
                                        />
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        {/* Enhanced Charts Section */}
                        <Row gutter={[24, 24]} className="mb-8">
                            <Col xs={24} lg={10}>
                                <Card 
                                    className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg h-full"
                                    style={{ borderRadius: '20px' }}
                                    title={
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                                                <PieChartOutlined className="text-white text-sm" />
                                            </div>
                                            <span className="font-semibold text-gray-800">Phân bổ Giờ chuẩn theo Loại hình</span>
                                        </div>
                                    }
                                    headStyle={{ borderBottom: '1px solid #e2e8f0', padding: '20px 24px' }}
                                >
                                    {statsData.activity_stats_bm && Object.values(statsData.activity_stats_bm).some(val => val > 0) ? (
                                        <div style={{ height: 350 }} className="flex items-center justify-center">
                                            <Pie data={activityPieData} options={pieOptions} />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col justify-center items-center py-16">
                                            <Empty description="Không có dữ liệu phân bổ giờ" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                        </div>
                                    )}
                                </Card>
                            </Col>
                            <Col xs={24} lg={14}>
                                <Card 
                                    className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg h-full"
                                    style={{ borderRadius: '20px' }}
                                    title={
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                <TrophyOutlined className="text-white text-sm" />
                                            </div>
                                            <span className="font-semibold text-gray-800">Top Giảng viên xuất sắc</span>
                                        </div>
                                    }
                                    headStyle={{ borderBottom: '1px solid #e2e8f0', padding: '20px 24px' }}
                                >
                                    {statsData.top_giang_viens_bm && statsData.top_giang_viens_bm.length > 0 ? (
                                        <div style={{ height: 350 }} className="flex items-center justify-center">
                                            <Bar data={topGiangViensBarData} options={topGiangViensOptions} />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col justify-center items-center py-16">
                                            <Empty description="Không có dữ liệu xếp hạng giảng viên" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                        </div>
                                    )}
                                </Card>
                            </Col>
                        </Row>
                        
                        {/* Enhanced Table */}
                        {statsData.top_giang_viens_bm && statsData.top_giang_viens_bm.length > 0 && (
                            <Card 
                                className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg mb-8"
                                style={{ borderRadius: '20px' }}
                                title={
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                            <TeamOutlined className="text-white text-sm" />
                                        </div>
                                        <span className="font-semibold text-gray-800">Danh sách Top Giảng viên</span>
                                    </div>
                                }
                                headStyle={{ borderBottom: '1px solid #e2e8f0', padding: '20px 24px' }}
                            >
                                <Table
                                    columns={topGiangVienColumns}
                                    dataSource={statsData.top_giang_viens_bm.map((gv, index) => ({ ...gv, key: index, rank: index + 1 }))}
                                    pagination={{ pageSize: 5 }}
                                    className="elegant-table"
                                    size="middle"
                                />
                            </Card>
                        )}

                        {/* Enhanced Trend Chart */}
                        {statsData.time_trend_bm && statsData.time_trend_bm.length > 0 && (
                            <Card 
                                className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg"
                                style={{ borderRadius: '20px' }}
                                title={
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <TrendingUpOutlined className="text-white text-sm" />
                                        </div>
                                        <span className="font-semibold text-gray-800">Xu hướng Kê khai qua các Năm học</span>
                                    </div>
                                }
                                headStyle={{ borderBottom: '1px solid #e2e8f0', padding: '20px 24px' }}
                            >
                                <div style={{ height: 400 }} className="p-4">
                                    <Line data={timeTrendLineData} options={timeTrendOptions} />
                                </div>
                            </Card>
                        )}
                    </>
                )}

                {/* Enhanced Custom Styles */}
                <style jsx>{`
                    /* Enhanced Form Controls */
                    .custom-select .ant-select-selector {
                        border-radius: 12px !important;
                        border: 2px solid #e2e8f0 !important;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important;
                        transition: all 0.3s ease !important;
                    }

                    .custom-select .ant-select-selector:hover {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
                        transform: translateY(-1px) !important;
                    }

                    .custom-select.ant-select-focused .ant-select-selector {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
                        transform: translateY(-2px) !important;
                    }

                    /* Elegant Table Styling */
                    .elegant-table .ant-table-thead > tr > th {
                        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
                        border: none !important;
                        border-bottom: 1px solid #e2e8f0 !important;
                        font-weight: 600 !important;
                        font-size: 13px !important;
                        color: #374151 !important;
                        padding: 16px 12px !important;
                    }
                    
                    .elegant-table .ant-table-tbody > tr > td {
                        border: none !important;
                        border-bottom: 1px solid #f1f5f9 !important;
                        padding: 12px !important;
                        font-size: 13px !important;
                        transition: all 0.2s ease !important;
                    }
                    
                    .elegant-table .ant-table-tbody > tr:hover > td {
                        background: #f8fafc !important;
                        transform: translateY(-1px) !important;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
                    }

                    /* Enhanced Statistics */
                    .ant-statistic-title { 
                        font-size: 13px !important; 
                        color: #6b7280 !important; 
                        font-weight: 500 !important;
                        margin-bottom: 8px !important;
                    }
                    
                    .ant-statistic-content { 
                        font-size: 24px !important; 
                        font-weight: 700 !important;
                    }

                    /* Card enhancements */
                    .ant-card-head-title {
                        font-weight: 600 !important;
                        color: #374151 !important;
                    }

                    /* Animation enhancements */
                    @keyframes subtleSlideIn {
                        from {
                            opacity: 0;
                            transform: translateY(8px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .ant-card {
                        animation: subtleSlideIn 0.3s ease-out !important;
                    }

                    /* Responsive adjustments */
                    @media (max-width: 768px) {
                        .elegant-table .ant-table-tbody > tr > td {
                            padding: 8px 6px !important;
                            font-size: 12px !important;
                        }

                        .elegant-table .ant-table-thead > tr > th {
                            padding: 12px 8px !important;
                            font-size: 12px !important;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}

export default ManagerStatistics;