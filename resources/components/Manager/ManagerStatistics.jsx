import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
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
    Tag,
} from "antd";
import {
    BarChartOutlined,
    PieChartOutlined,
    TeamOutlined,
    SyncOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TrophyOutlined,
    RiseOutlined as TrendingUpOutlined,
} from "@ant-design/icons";
import { Bar, Pie, Line } from "react-chartjs-2";
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
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    ChartTitle,
    Tooltip,
    Legend
);

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

function ManagerStatistics() {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [error, setError] = useState(null);

    const [notification, setNotification] = useState({
        show: false,
        type: "",
        message: "",
        title: "",
    });

    const showNotification = (type, message, title = "") => {
        setNotification({ show: true, type, message, title });
        setTimeout(() => {
            setNotification({ show: false, type: "", message: "", title: "" });
        }, 5000);
    };

    const dismissNotification = () => {
        setNotification({ show: false, type: "", message: "", title: "" });
    };

    const renderNotification = () => {
        if (!notification.show) return null;

        const notificationStyles = {
            success: {
                bg: "bg-gradient-to-r from-emerald-50 to-green-50",
                border: "border-emerald-200",
                icon: "✅",
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-600",
                textColor: "text-emerald-800",
                titleColor: "text-emerald-900",
            },
            error: {
                bg: "bg-gradient-to-r from-red-50 to-rose-50",
                border: "border-red-200",
                icon: "❌",
                iconBg: "bg-red-100",
                iconColor: "text-red-600",
                textColor: "text-red-800",
                titleColor: "text-red-900",
            },
            warning: {
                bg: "bg-gradient-to-r from-amber-50 to-orange-50",
                border: "border-amber-200",
                icon: "⚠️",
                iconBg: "bg-amber-100",
                iconColor: "text-amber-600",
                textColor: "text-amber-800",
                titleColor: "text-amber-900",
            },
            info: {
                bg: "bg-gradient-to-r from-blue-50 to-sky-50",
                border: "border-blue-200",
                icon: "ℹ️",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600",
                textColor: "text-blue-800",
                titleColor: "text-blue-900",
            },
        };

        const style =
            notificationStyles[notification.type] || notificationStyles.info;

        return (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300 ease-out">
                <div
                    className={`max-w-md w-full ${style.bg} ${style.border} border-2 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden`}
                >
                    <div className="p-6">
                        <div className="flex items-start space-x-4">
                            <div
                                className={`w-12 h-12 ${style.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
                            >
                                <span className="text-xl">{style.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                {notification.title && (
                                    <h3
                                        className={`text-lg font-bold ${style.titleColor} mb-2`}
                                    >
                                        {notification.title}
                                    </h3>
                                )}
                                <p
                                    className={`text-sm ${style.textColor} leading-relaxed break-words`}
                                >
                                    {notification.message}
                                </p>
                            </div>
                            <button
                                onClick={dismissNotification}
                                className={`w-8 h-8 ${style.iconColor} hover:bg-white/50 rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0`}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>
            </div>
        );
    };

    const [namHocList, setNamHocList] = useState([]);
    const [selectedNamHocId, setSelectedNamHocId] = useState(""); 
    const [managerInfo, setManagerInfo] = useState(null);

    const [statsData, setStatsData] = useState({
        total_ke_khai_bm: 0,
        pending_bm: 0,
        approved_bm: 0,
        rejected_bm: 0,
        total_hours_approved_bm: 0,
        average_hours_per_teacher_bm: 0,
        activity_stats_bm: {
            giang_day_final: 0,
            giang_day_final_percentage: 0,
            nckh_final: 0,
            nckh_final_percentage: 0,
            congtac_khac_gd: 0,
            congtac_khac_gd_percentage: 0,
            coithi_chamthi_dh: 0,
            coithi_chamthi_dh_percentage: 0,
            gd_xa_truong: 0,
            gd_xa_truong_percentage: 0,
        },
        top_giang_viens_bm: [],
        time_trend_bm: [],
    });
    
    useEffect(() => {
        fetchInitialFilters();
    }, []);

    useEffect(() => {
        if (managerInfo) {
            fetchStatisticsData();
        }
    }, [selectedNamHocId, managerInfo]);

    const fetchInitialFilters = async () => {
        setIsLoadingInitial(true);
        const token = localStorage.getItem("token");
        try {
            const [managerRes, namHocRes] = await Promise.all([
                axios.get("/api/manager/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get("/api/manager/nam-hoc-list", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            setManagerInfo(managerRes.data);
            const nhs = namHocRes.data || [];
            setNamHocList(nhs);

            const currentNamHoc = nhs.find((nh) => nh.la_nam_hien_hanh === 1);
            if (currentNamHoc) {
                setSelectedNamHocId(currentNamHoc.id.toString());
            }

            showNotification(
                "success",
                "Tải dữ liệu thành công!",
                "Hệ thống đã sẵn sàng"
            );
        } catch (err) {
            showNotification(
                "error",
                "Không thể tải dữ liệu bộ lọc ban đầu.",
                "Lỗi khởi tạo"
            );
            setError("Lỗi tải dữ liệu bộ lọc.");
        } finally {
            setIsLoadingInitial(false);
        }
    };

    const fetchStatisticsData = async () => {
        if (!managerInfo) return;

        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        try {
            const params = {
                nam_hoc_id: selectedNamHocId,
            };
            const response = await axios.get("/api/manager/statistics", {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            setStatsData(
                response.data || {
                    total_ke_khai_bm: 0,
                    approved_bm: 0,
                    pending_bm: 0,
                    rejected_bm: 0,
                    total_hours_approved_bm: 0,
                    average_hours_per_teacher_bm: 0,
                    activity_stats_bm: {},
                    top_giang_viens_bm: [],
                    time_trend_bm: [],
                }
            );
        } catch (err) {
            showNotification(
                "error",
                err.response?.data?.message || "Lỗi tải dữ liệu thống kê.",
                "Lỗi tải dữ liệu"
            );
            setError(
                err.response?.data?.message || "Lỗi tải dữ liệu thống kê."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const activityPieData = useMemo(() => {
        const { activity_stats_bm } = statsData;
        if (!activity_stats_bm || Object.keys(activity_stats_bm).length === 0)
            return { labels: [], datasets: [] };

        const labels = [
            "GD Lớp, ĐG, Khác GD, Khảo thí (ThS,TS)",
            "Hướng dẫn QĐ",
            "Coi thi, Chấm thi ĐH",
            "NCKH & CT Khác ra KHCN",
            "GD Xa trường",
        ];
        const dataValues = [
            activity_stats_bm.giang_day_final || 0,
            activity_stats_bm.huong_dan_final || 0,
            activity_stats_bm.coithi_chamthi_dh || 0,
            activity_stats_bm.nckh_final || 0,
            activity_stats_bm.gd_xa_truong || 0,
        ];
        
        const filteredLabels = [];
        const filteredDataValues = [];
        const backgroundColors = [
            "rgba(54, 162, 235, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)",
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
            datasets: [
                {
                    data: filteredDataValues,
                    backgroundColor: filteredBackgroundColors,
                    hoverOffset: 4,
                },
            ],
        };
    }, [statsData.activity_stats_bm]);

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right",
                labels: { padding: 15, boxWidth: 12 },
            },
            title: {
                display: true,
                text: "Phân bổ Giờ chuẩn theo Loại hình (Đã duyệt)",
            },
        },
    };

    const topGiangViensBarData = useMemo(() => {
        return {
            labels: statsData.top_giang_viens_bm.map(
                (gv) => `${gv.ho_ten} (${gv.ma_gv})`
            ),
            datasets: [
                {
                    label: "Tổng giờ chuẩn đã duyệt",
                    data: statsData.top_giang_viens_bm.map(
                        (gv) => gv.total_hours
                    ),
                    backgroundColor: "rgba(75, 192, 192, 0.7)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
            ],
        };
    }, [statsData.top_giang_viens_bm]);

    const topGiangViensOptions = {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: "Top Giảng viên có Giờ chuẩn cao nhất (Đã duyệt)",
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                title: { display: true, text: "Giờ chuẩn" },
            },
        },
    };

    const timeTrendLineData = useMemo(() => {
        const sortedTimeTrend = [...statsData.time_trend_bm].sort((a, b) =>
            (a.period || "").localeCompare(b.period || "")
        );
        return {
            labels: sortedTimeTrend.map((item) => item.period),
            datasets: [
                {
                    label: "Tổng giờ chuẩn duyệt",
                    data: sortedTimeTrend.map((item) => item.total_hours),
                    borderColor: "rgb(255, 99, 132)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    fill: true,
                    tension: 0.3,
                    yAxisID: "y_hours",
                },
                {
                    label: "Số GV kê khai",
                    data: sortedTimeTrend.map((item) => item.teacher_count),
                    borderColor: "rgb(54, 162, 235)",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    fill: true,
                    tension: 0.3,
                    yAxisID: "y_teachers",
                },
            ],
        };
    }, [statsData.time_trend_bm]);

    const timeTrendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" },
            title: {
                display: true,
                text: "Xu hướng Kê khai qua các Năm học (Đã duyệt)",
            },
        },
        scales: {
            y_hours: {
                type: "linear",
                display: true,
                position: "left",
                title: { display: true, text: "Tổng Giờ Chuẩn" },
            },
            y_teachers: {
                type: "linear",
                display: true,
                position: "right",
                grid: { drawOnChartArea: false },
                title: { display: true, text: "Số Giảng viên" },
                min: 0,
            },
        },
    };

    const topGiangVienColumns = [
        {
            title: "Hạng",
            dataIndex: "rank",
            key: "rank",
            width: 80,
            render: (text, record, index) => index + 1,
        },
        { title: "Mã GV", dataIndex: "ma_gv", key: "ma_gv", width: 120 },
        { title: "Họ tên", dataIndex: "ho_ten", key: "ho_ten" },
        {
            title: "Tổng giờ duyệt",
            dataIndex: "total_hours",
            key: "total_hours",
            width: 150,
            align: "right",
            render: (text) => (
                <Text strong>{parseFloat(text || 0).toFixed(2)}</Text>
            ),
        },
    ];

    if (isLoadingInitial) {
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
                            Đang tải thống kê
                        </h2>
                        <p className="text-lg text-gray-600 max-w-md mx-auto">
                            Vui lòng chờ trong giây lát, chúng tôi đang phân
                            tích dữ liệu cho bạn...
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

    if (isLoading && !statsData.top_giang_viens_bm.length) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex justify-center items-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-200/50 mx-auto">
                        <Spin size="large" />
                    </div>
                    <Text className="text-lg text-gray-600">
                        Đang tải dữ liệu thống kê...
                    </Text>
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
            {renderNotification()}

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/8 to-indigo-400/8 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 p-6 space-y-6">
                <Card
                    className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl"
                    style={{ borderRadius: "16px" }}
                >
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
                                    <Title
                                        level={2}
                                        style={{ margin: 0 }}
                                        className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent"
                                    >
                                        Thống kê Khối lượng Công việc
                                    </Title>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                        <Text type="secondary">
                                            Xuất báo cáo và dữ liệu thống kê cho bộ môn
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
                                style={{ width: "100%", marginTop: 8 }}
                                size="large"
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    option.children
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                className="custom-select"
                            >
                                {namHocList.map((nh) => (
                                    <Option
                                        key={nh.id}
                                        value={nh.id.toString()}
                                    >
                                        {nh.ten_nam_hoc}
                                        {nh.la_nam_hien_hanh ? (
                                            <Tag
                                                color="green"
                                                style={{ marginLeft: 5 }}
                                            >
                                                Hiện hành
                                            </Tag>
                                        ) : null}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Button
                                icon={<SyncOutlined />}
                                onClick={fetchStatisticsData}
                                loading={isLoading}
                                size="large"
                                style={{ marginTop: 8 }}
                                className="custom-button"
                            >
                                Tải lại toàn bộ thống kê
                            </Button>
                        </Col>
                    </Row>
                </Card>{" "}
                {isLoading && statsData.top_giang_viens_bm.length === 0 ? (
                    <div className="space-y-6">
                        <Row gutter={[24, 24]} className="mb-8">
                            {[1, 2, 3, 4].map((i) => (
                                <Col xs={24} md={12} lg={6} key={i}>
                                    <Card
                                        className="bg-white/80 backdrop-blur-sm border border-gray-200/50 h-full"
                                        style={{ borderRadius: "16px" }}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-8 bg-gray-300 rounded animate-pulse w-20"></div>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        <Row gutter={[24, 24]} className="mb-8">
                            <Col xs={24} lg={10}>
                                <Card
                                    className="bg-white/80 backdrop-blur-sm border border-gray-200/50 h-full"
                                    style={{ borderRadius: "20px" }}
                                >
                                    <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                                        <div className="text-center space-y-3">
                                            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} lg={14}>
                                <Card
                                    className="bg-white/80 backdrop-blur-sm border border-gray-200/50 h-full"
                                    style={{ borderRadius: "20px" }}
                                >
                                    <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                                        <div className="text-center space-y-3">
                                            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded w-40 mx-auto animate-pulse"></div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                ) : !statsData || statsData.total_ke_khai_bm === 0 ? (
                    <Card
                        className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg"
                        style={{ borderRadius: "20px" }}
                    >
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <BarChartOutlined className="text-3xl text-gray-400" />
                            </div>
                            <Title level={3} className="text-gray-600 mb-4">
                                Chưa có dữ liệu thống kê
                            </Title>
                            <Text className="text-gray-500 text-lg">
                                Không có dữ liệu thống kê cho lựa chọn hiện tại.
                                Vui lòng thử lại với năm học khác.
                            </Text>
                            <div className="mt-6">
                                <Button
                                    type="primary"
                                    icon={<SyncOutlined />}
                                    onClick={fetchStatisticsData}
                                    loading={isLoading}
                                    size="large"
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 border-none shadow-lg hover:shadow-xl"
                                    style={{ borderRadius: "12px" }}
                                >
                                    Thử lại
                                </Button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <>
                        <Row gutter={[24, 24]} className="mb-8">
                            <Col xs={24} md={12} lg={6}>
                                <Card
                                    className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 h-full"
                                    style={{ borderRadius: "16px" }}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <FileTextOutlined className="text-white text-lg" />
                                        </div>
                                        <Statistic
                                            title="Tổng Kê khai"
                                            value={statsData.total_ke_khai_bm}
                                            valueStyle={{
                                                color: "#1f2937",
                                                fontSize: "24px",
                                                fontWeight: "bold",
                                            }}
                                        />
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                                <Card
                                    className="bg-white/80 backdrop-blur-sm border border-emerald-200/50 hover:shadow-lg transition-all duration-300 h-full"
                                    style={{ borderRadius: "16px" }}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <CheckCircleOutlined className="text-white text-lg" />
                                        </div>
                                        <Statistic
                                            title="Đã duyệt"
                                            value={statsData.approved_bm}
                                            valueStyle={{
                                                color: "#059669",
                                                fontSize: "24px",
                                                fontWeight: "bold",
                                            }}
                                        />
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                                <Card
                                    className="bg-white/80 backdrop-blur-sm border border-amber-200/50 hover:shadow-lg transition-all duration-300 h-full"
                                    style={{ borderRadius: "16px" }}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <ClockCircleOutlined className="text-white text-lg" />
                                        </div>
                                        <Statistic
                                            title="Chờ duyệt"
                                            value={statsData.pending_bm}
                                            valueStyle={{
                                                color: "#d97706",
                                                fontSize: "24px",
                                                fontWeight: "bold",
                                            }}
                                        />
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                                <Card
                                    className="bg-white/80 backdrop-blur-sm border border-purple-200/50 hover:shadow-lg transition-all duration-300 h-full"
                                    style={{ borderRadius: "16px" }}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <BarChartOutlined className="text-white text-lg" />
                                        </div>
                                        <Statistic
                                            title="Tổng giờ duyệt"
                                            value={
                                                statsData.total_hours_approved_bm
                                            }
                                            precision={2}
                                            suffix="h"
                                            valueStyle={{
                                                color: "#7c3aed",
                                                fontSize: "24px",
                                                fontWeight: "bold",
                                            }}
                                        />
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        <Row gutter={[24, 24]} className="mb-8">
                            <Col xs={24} lg={10}>
                                <Card
                                    className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg h-full"
                                    style={{ borderRadius: "20px" }}
                                    title={
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                                                <PieChartOutlined className="text-white text-sm" />
                                            </div>
                                            <span className="font-semibold text-gray-800">
                                                Phân bổ Giờ chuẩn theo Loại hình
                                            </span>
                                        </div>
                                    }
                                    headStyle={{
                                        borderBottom: "1px solid #e2e8f0",
                                        padding: "20px 24px",
                                    }}
                                >
                                    {" "}
                                    {statsData.activity_stats_bm &&
                                    Object.values(
                                        statsData.activity_stats_bm
                                    ).some((val) => val > 0) ? (
                                        <div
                                            style={{ height: 350 }}
                                            className="flex items-center justify-center chart-container"
                                        >
                                            <Pie
                                                data={activityPieData}
                                                options={pieOptions}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col justify-center items-center py-16">
                                            <Empty
                                                description="Không có dữ liệu phân bổ giờ"
                                                image={
                                                    Empty.PRESENTED_IMAGE_SIMPLE
                                                }
                                            />
                                        </div>
                                    )}
                                </Card>
                            </Col>
                            <Col xs={24} lg={14}>
                                <Card
                                    className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg h-full"
                                    style={{ borderRadius: "20px" }}
                                    title={
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                <TrophyOutlined className="text-white text-sm" />
                                            </div>
                                            <span className="font-semibold text-gray-800">
                                                Top Giảng viên xuất sắc
                                            </span>
                                        </div>
                                    }
                                    headStyle={{
                                        borderBottom: "1px solid #e2e8f0",
                                        padding: "20px 24px",
                                    }}
                                >
                                    {" "}
                                    {statsData.top_giang_viens_bm &&
                                    statsData.top_giang_viens_bm.length > 0 ? (
                                        <div
                                            style={{ height: 350 }}
                                            className="flex items-center justify-center chart-container"
                                        >
                                            <Bar
                                                data={topGiangViensBarData}
                                                options={topGiangViensOptions}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col justify-center items-center py-16">
                                            <Empty
                                                description="Không có dữ liệu xếp hạng giảng viên"
                                                image={
                                                    Empty.PRESENTED_IMAGE_SIMPLE
                                                }
                                            />
                                        </div>
                                    )}
                                </Card>
                            </Col>
                        </Row>

                        {statsData.top_giang_viens_bm &&
                            statsData.top_giang_viens_bm.length > 0 && (
                                <Card
                                    className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg mb-8"
                                    style={{ borderRadius: "20px" }}
                                    title={
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                                <TeamOutlined className="text-white text-sm" />
                                            </div>
                                            <span className="font-semibold text-gray-800">
                                                Danh sách Top Giảng viên
                                            </span>
                                        </div>
                                    }
                                    headStyle={{
                                        borderBottom: "1px solid #e2e8f0",
                                        padding: "20px 24px",
                                    }}
                                >
                                    <Table
                                        columns={topGiangVienColumns}
                                        dataSource={statsData.top_giang_viens_bm.map(
                                            (gv, index) => ({
                                                ...gv,
                                                key: index,
                                                rank: index + 1,
                                            })
                                        )}
                                        pagination={{ pageSize: 5 }}
                                        className="elegant-table"
                                        size="middle"
                                    />
                                </Card>
                            )}

                        {statsData.time_trend_bm &&
                            statsData.time_trend_bm.length > 0 && (
                                <Card
                                    className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg"
                                    style={{ borderRadius: "20px" }}
                                    title={
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                <TrendingUpOutlined className="text-white text-sm" />
                                            </div>
                                            <span className="font-semibold text-gray-800">
                                                Xu hướng Kê khai qua các Năm học
                                            </span>
                                        </div>
                                    }
                                    headStyle={{
                                        borderBottom: "1px solid #e2e8f0",
                                        padding: "20px 24px",
                                    }}
                                >
                                    {" "}
                                    <div
                                        style={{ height: 400 }}
                                        className="p-4 chart-container"
                                    >
                                        <Line
                                            data={timeTrendLineData}
                                            options={timeTrendOptions}
                                        />
                                    </div>
                                </Card>
                            )}
                    </>
                )}{" "}
                <style jsx>{`
                    @keyframes slideInFromRight {
                        from {
                            opacity: 0;
                            transform: translateX(100%);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    @keyframes slideOutToRight {
                        from {
                            opacity: 1;
                            transform: translateX(0);
                        }
                        to {
                            opacity: 0;
                            transform: translateX(100%);
                        }
                    }

                    .animate-in {
                        animation: slideInFromRight 0.3s ease-out;
                    }

                    .animate-out {
                        animation: slideOutToRight 0.3s ease-in;
                    }

                    .slide-in-from-right-full {
                        animation: slideInFromRight 0.3s ease-out;
                    }

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

                    .elegant-table .ant-table-thead > tr > th {
                        background: linear-gradient(
                            180deg,
                            #ffffff 0%,
                            #f8fafc 100%
                        ) !important;
                        border: none !important;
                        border-bottom: 1px solid #e2e8f0 !important;
                        font-weight: 600 !important;
                        font-size: 13px !important;
                        color: #374151 !important;
                        padding: 16px 12px !important;
                        position: relative !important;
                        white-space: nowrap !important;
                    }

                    .elegant-table .ant-table-thead > tr > th::before {
                        content: "";
                        position: absolute;
                        bottom: -1px;
                        left: 0;
                        width: 100%;
                        height: 1px;
                        background: linear-gradient(
                            90deg,
                            transparent 0%,
                            #3b82f6 50%,
                            transparent 100%
                        );
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    }

                    .elegant-table .ant-table-thead > tr > th:hover::before {
                        opacity: 1;
                    }

                    .elegant-table .ant-table-tbody > tr > td {
                        border: none !important;
                        border-bottom: 1px solid #f1f5f9 !important;
                        padding: 12px !important;
                        font-size: 13px !important;
                        transition: all 0.2s ease !important;
                        background: transparent !important;
                    }

                    .elegant-table .ant-table-tbody > tr {
                        transition: all 0.2s ease !important;
                    }

                    .elegant-table .ant-table-tbody > tr:hover > td {
                        background: #f8fafc !important;
                        border-bottom-color: #e2e8f0 !important;
                    }

                    .elegant-table .ant-table-tbody > tr:hover {
                        transform: translateY(-1px) !important;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
                    }

                    .elegant-table .ant-table-tbody > tr:last-child > td {
                        border-bottom: none !important;
                    }

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

                    .ant-card-head-title {
                        font-weight: 600 !important;
                        color: #374151 !important;
                    }

                    .ant-card {
                        transition: all 0.3s ease !important;
                    }

                    .ant-card:hover {
                        transform: translateY(-2px) !important;
                        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08) !important;
                    }

                    .ant-btn {
                        transition: all 0.3s ease !important;
                    }

                    .ant-btn:hover:not(.ant-btn-loading) {
                        transform: translateY(-1px) !important;
                    }

                    .ant-spin-dot {
                        font-size: 24px !important;
                    }

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

                    @keyframes gentleFadeIn {
                        from {
                            opacity: 0;
                            transform: scale(0.98);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }

                    .ant-card {
                        animation: subtleSlideIn 0.3s ease-out !important;
                    }

                    .chart-container {
                        transition: all 0.3s ease !important;
                    }

                    .chart-container:hover {
                        transform: scale(1.02) !important;
                    }

                    @media (max-width: 768px) {
                        .elegant-table .ant-table-tbody > tr > td {
                            padding: 8px 6px !important;
                            font-size: 12px !important;
                        }

                        .elegant-table .ant-table-thead > tr > th {
                            padding: 12px 8px !important;
                            font-size: 12px !important;
                        }

                        .ant-statistic-content {
                            font-size: 20px !important;
                        }
                    }

                    @keyframes shimmer {
                        0% {
                            background-position: -468px 0;
                        }
                        100% {
                            background-position: 468px 0;
                        }
                    }

                    .animate-pulse {
                        background: linear-gradient(
                            90deg,
                            #f0f0f0 25%,
                            #e0e0e0 50%,
                            #f0f0f0 75%
                        );
                        background-size: 400% 100%;
                        animation: shimmer 1.5s infinite;
                    }
                `}</style>
            </div>
        </div>
    );
}

export default ManagerStatistics;