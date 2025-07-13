import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
    Card,
    Select,
    Button,
    Typography,
    Space,
    Row,
    Col,
    Form,
    Alert,
    Spin,
    Radio,
    InputNumber,
    Tooltip,
    Divider,
    Tag,
    Skeleton,
} from "antd";
import {
    DownloadOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    EyeOutlined,
    CalendarOutlined,
    FilterOutlined,
    InfoCircleOutlined,
    ExportOutlined,
    SyncOutlined,
    SearchOutlined,
    QuestionCircleOutlined,
    BarChartOutlined,
    TableOutlined,
    CloseOutlined
} from "@ant-design/icons";

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

function ExportReport() {
    const [form] = Form.useForm();
    const [namHocList, setNamHocList] = useState([]);
    const [selectedNamHocId, setSelectedNamHocId] = useState("");
    const [isLoadingNamHoc, setIsLoadingNamHoc] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [exportFormat, setExportFormat] = useState("excel");

    const [isInitialLoading, setIsInitialLoading] = useState(true);


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
    
            const style = notificationStyles[notification.type] || notificationStyles.info;
    
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
                                    <CloseOutlined className="text-sm" />
                                </button>
                            </div>
                        </div>
                        <div className="h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    </div>
                </div>
            );
    };

    useEffect(() => {
        fetchNamHocList();
    }, []);

    const fetchNamHocList = async () => {
        try {
            setIsLoadingNamHoc(true);
            setIsInitialLoading(true);

            const token = localStorage.getItem("token");
            const response = await axios.get("/api/manager/nam-hoc-list", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const namHocs = response.data || [];
            setNamHocList(namHocs);

            const currentNamHoc = namHocs.find(
                (nh) => nh.la_nam_hien_hanh === 1
            );
            if (currentNamHoc) {
                setSelectedNamHocId(currentNamHoc.id.toString());
                form.setFieldsValue({
                    nam_hoc_id: currentNamHoc.id.toString(),
                });
            }

            showNotification(
                "success",
                "Thành công",
                "Tải danh sách năm học"
            );
        } catch (error) {
            showNotification("error", "Lỗi", "Không thể tải danh sách năm học");
        } finally {
            setIsLoadingNamHoc(false);
            setTimeout(() => setIsInitialLoading(false), 800);
        }
    };

    const handlePreview = async () => {
        try {
            const values = await form.validateFields();
            setIsPreviewing(true);
            const token = localStorage.getItem("token");

            const response = await axios.get("/api/manager/export-report", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    ...values,
                    preview: "true",
                },
            });

            setPreviewData(response.data);
            showNotification(
                "success",
                "Thành công",
                "Đã tải xem trước"
            );
        } catch (error) {
            if (error.response?.data?.message) {
                showNotification("error", "Lỗi", error.response.data.message);
            } else {
                showNotification(
                    "error",
                    "Lỗi",
                    "Lỗi khi tải xem trước dữ liệu."
                );
            }
        } finally {
            setIsPreviewing(false);
        }
    };

    const handleExport = async () => {
        try {
            const values = await form.validateFields();
            setIsExporting(true);
            const token = localStorage.getItem("token");

            showNotification("info", "Đang xử lý", "Đang xuất báo cáo...", 0);

            const response = await axios.get("/api/manager/export-report", {
                headers: { Authorization: `Bearer ${token}` },
                params: values,
                responseType: "blob",
            });

            // Handle file download
            const contentType = response.headers["content-type"];
            const contentDisposition = response.headers["content-disposition"];

            let fileName = `BaoCaoKeKhai_${Date.now()}`;
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(
                    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
                );
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1].replace(/['"]/g, "");
                }
            }

            if (values.format === "excel") {
                fileName = fileName.endsWith(".xlsx") ? fileName : fileName + ".xlsx";
            } else if (values.format === "pdf") {
                fileName = fileName.endsWith(".zip") ? fileName : fileName + ".zip";
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showNotification(
                "success",
                "Thành công",
                "Xuất báo cáo thành công!"
            );
        } catch (error) {
            if (error.response?.data?.message) {
                showNotification("error", "Lỗi", error.response.data.message);
            } else {
                showNotification("error", "Lỗi", "Lỗi khi xuất báo cáo.");
            }
        } finally {
            setIsExporting(false);
        }
    };

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden flex items-center justify-center">
                 <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                 <div className="relative z-10 text-center space-y-8">
                    <div className="relative">
                         <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <ExportOutlined className="text-4xl text-white" />
                        </div>

                         <div className="absolute -top-2 -right-8 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-ping"></div>
                        <div className="absolute -bottom-2 -left-8 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse delay-300"></div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-slate-700 to-gray-800 bg-clip-text text-transparent">
                            Đang khởi tạo hệ thống xuất báo cáo
                        </h2>
                        <p className="text-lg text-gray-600 max-w-md mx-auto">
                            Vui lòng chờ trong giây lát, chúng tôi đang tải dữ
                            liệu cho bạn...
                        </p>
                    </div>

                     <div className="flex justify-center space-x-2">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.2}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isLoadingNamHoc) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex justify-center items-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-200/50 mx-auto">
                        <Spin size="large" />
                    </div>
                    <Text className="text-lg text-gray-600">
                        Đang tải dữ liệu xuất báo cáo...
                    </Text>
                </div>
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
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10" style={{ borderRadius: "24px" }} >
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
                                        Xuẩt báo cáo thống kê 
                                    </Title>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                        <Text type="secondary">
                                            Xuất báo cáo tổng hợp khối lượng công việc toàn diện
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{ format: "excel", trang_thai: "", font_size: 10, }}
                        className="space-y-6"
                    >
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                        <FilterOutlined className="text-white text-sm" />
                                    </div>
                                    <Title
                                        level={4}
                                        className="mb-0 text-gray-800"
                                    >
                                        Cấu hình xuất báo cáo
                                    </Title>
                                </div>
                            </div>{" "}
                            <Row gutter={[20, 20]}>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        name="nam_hoc_id"
                                        label={
                                            <span className="flex items-center space-x-2 font-medium text-gray-700">
                                                <CalendarOutlined className="text-blue-500" />
                                                <span> Năm học{" "} <Text type="danger">*</Text>
                                                </span>
                                            </span>
                                        }
                                        rules={[
                                            {
                                                required: true,
                                                message: "Vui lòng chọn năm học!",
                                            },
                                        ]}
                                        style={{ marginBottom: 0 }}
                                    >
                                        {isLoadingNamHoc ? (
                                            <Skeleton.Input
                                                active
                                                size="large"
                                                style={{ width: "100%", height: "40px", borderRadius: "8px", }}
                                            />
                                        ) : (
                                            <Select
                                                placeholder="Chọn năm học"
                                                size="large"
                                                className="custom-select"
                                                onChange={(value) => setSelectedNamHocId(value)}
                                            >
                                                {namHocList.map((nh) => (
                                                    <Option
                                                        key={nh.id}
                                                        value={nh.id.toString()}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span> {nh.ten_nam_hoc} </span>
                                                            {nh.la_nam_hien_hanh && (
                                                                <Tag color="green" size="small">Hiện tại</Tag>
                                                            )}
                                                        </div>
                                                    </Option>
                                                ))}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        name="trang_thai"
                                        label={
                                            <span className="flex items-center space-x-2 font-medium text-gray-700">
                                                <FilterOutlined className="text-purple-500" />
                                                <span>Trạng thái kê khai</span>
                                            </span>
                                        }
                                        style={{ marginBottom: 0 }}
                                    >
                                        <Select
                                            placeholder="Tất cả trạng thái"
                                            size="large"
                                            allowClear
                                            className="custom-select"
                                        >
                                            <Option value="">Tất cả</Option>
                                            <Option value="0">Nháp</Option>
                                            <Option value="1">Chờ phê duyệt</Option>
                                            <Option value="3">Đã phê duyệt</Option>
                                            <Option value="4">BM Trả lại</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        name="search"
                                        label={
                                            <span className="flex items-center space-x-2 font-medium text-gray-700">
                                                <SearchOutlined className="text-green-500" />
                                                <span>Tìm kiếm giảng viên</span>
                                            </span>
                                        }
                                        style={{ marginBottom: 0 }}
                                    >
                                        <Select
                                            mode="tags"
                                            placeholder="Nhập tên hoặc mã GV"
                                            size="large"
                                            className="custom-select"
                                            tokenSeparators={[","]}
                                            maxTagCount={2}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                        <Divider className="border-gray-200/60" />{" "}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                                        <DownloadOutlined className="text-white text-sm" />
                                    </div>
                                    <Title level={4} className="mb-0 text-gray-800">Định dạng xuất báo cáo</Title>
                                </div>
                            </div>

                            <Row gutter={[20, 20]}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="format"
                                        rules={[{ required: true }]}
                                    >
                                        <Radio.Group
                                            size="large"
                                            onChange={(e) =>
                                                setExportFormat(e.target.value)
                                            }
                                            className="w-full"
                                        >
                                            <Space
                                                direction="vertical"
                                                className="w-full"
                                            >
                                                <Radio
                                                    value="excel"
                                                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-300"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                                                            <FileExcelOutlined className="text-white" />
                                                        </div>
                                                        <div>
                                                            <Text
                                                                strong
                                                                className="text-gray-800"
                                                            >
                                                                Excel (.xlsx)
                                                            </Text>
                                                            <br />
                                                            <Text
                                                                type="secondary"
                                                                className="text-sm"
                                                            >
                                                                1 file với nhiều
                                                                sheet, dễ dàng
                                                                xử lý dữ liệu
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </Radio>
                                                <Radio
                                                    value="pdf"
                                                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50/50 transition-all duration-300"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                                                            <FilePdfOutlined className="text-white" />
                                                        </div>
                                                        <div>
                                                            <Text
                                                                strong
                                                                className="text-gray-800"
                                                            >
                                                                PDF (.zip)
                                                            </Text>
                                                            <br />
                                                            <Text
                                                                type="secondary"
                                                                className="text-sm"
                                                            >
                                                                Nhiều file PDF
                                                                trong 1 thư mục
                                                                nén, sẵn sàng in
                                                                ấn
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </Radio>
                                            </Space>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>{" "}
                                {exportFormat === "pdf" && (
                                    <Col xs={24} md={12}>
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} lg={14}>
                                                <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200/50">
                                                    <Title
                                                        level={5}
                                                        className="mb-3 text-gray-700"
                                                    >
                                                        Cấu hình font chữ PDF
                                                    </Title>
                                                    <Space
                                                        direction="vertical"
                                                        className="w-full"
                                                        size="middle"
                                                    >
                                                        <Form.Item
                                                            name="font_size"
                                                            label={
                                                                <Text strong>
                                                                    Cỡ chữ PDF
                                                                </Text>
                                                            }
                                                            style={{
                                                                marginBottom: 0,
                                                            }}
                                                        >
                                                            <InputNumber
                                                                min={8}
                                                                max={16}
                                                                size="large"
                                                                className="w-full custom-input-number"
                                                                addonAfter="px"
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    const fontSize =
                                                                        value ||
                                                                        10;
                                                                    form.setFieldsValue(
                                                                        {
                                                                            font_size: fontSize,
                                                                        }
                                                                    );
                                                                }}
                                                            />
                                                        </Form.Item>
                                                    </Space>
                                                </div>
                                            </Col>

                                            <Col xs={24} lg={10}>
                                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                    <Title
                                                        level={5}
                                                        className="mb-3 text-gray-700 text-center"
                                                    >
                                                        <span className="flex items-center justify-center space-x-2">
                                                            <EyeOutlined />
                                                            <span>
                                                                Xem trước cỡ chữ
                                                            </span>
                                                            <Tooltip title="Xem trước kích thước font chữ sẽ được sử dụng trong PDF">
                                                                <QuestionCircleOutlined className="text-gray-400 text-sm cursor-help" />
                                                            </Tooltip>
                                                        </span>
                                                    </Title>
                                                    <Form.Item
                                                        dependencies={["font_size"]}
                                                        noStyle
                                                    >
                                                        {({ getFieldValue }) => {
                                                            const fontSize = getFieldValue("font_size") || 10;

                                                            return (
                                                                <div className="flex flex-col items-center space-y-3">
                                                                    <div className="w-full h-48 bg-white border-2 border-gray-300 shadow-lg relative overflow-hidden rounded-lg p-3">
                                                                        <div className="text-center mb-2">
                                                                            <div 
                                                                                className="font-bold text-gray-800 text-xs leading-tight"
                                                                                style={{ fontSize: `${Math.min(Math.max(fontSize * 0.8, 8), 12)}px` }}
                                                                            >
                                                                                BẢNG TỔNG HỢP KHỐI LƯỢNG
                                                                            </div>
                                                                        </div>

                                                                        <div className="border border-gray-300 rounded text-xs mb-2">
                                                                            <div className="bg-gray-50 p-1 border-b border-gray-300">
                                                                                <div 
                                                                                    className="font-semibold text-gray-700 text-center leading-tight"
                                                                                    style={{ fontSize: `${Math.min(fontSize * 0.7, 10)}px` }}
                                                                                >
                                                                                    STT | Mã GV | Họ tên | Giờ
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {[1, 2].map(i => (
                                                                                <div key={i} className="p-1 border-b border-gray-200 last:border-b-0">
                                                                                    <div 
                                                                                        className="text-gray-600 leading-tight"
                                                                                        style={{ fontSize: `${Math.min(fontSize * 0.7, 10)}px` }}
                                                                                    >
                                                                                        {i} | GV00{i} | Nguyễn V.A | 320.5
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>

                                                                        <div 
                                                                            className="text-gray-600 leading-tight overflow-hidden"
                                                                            style={{ 
                                                                                fontSize: `${Math.min(fontSize * 0.7, 10)}px`,
                                                                                display: '-webkit-box',
                                                                                WebkitLineClamp: 3,
                                                                                WebkitBoxOrient: 'vertical'
                                                                            }}
                                                                        >
                                                                            Báo cáo này tổng hợp khối lượng công việc của các giảng viên trong năm học, 
                                                                            bao gồm giảng dạy, nghiên cứu khoa học và các hoạt động khác.
                                                                            Dữ liệu được trình bày theo định dạng PDF với font chữ đã cấu hình.
                                                                        </div>

                                                                        <div className="absolute bottom-1 right-1">
                                                                            <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                                                                                Preview
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-center">
                                                                        <Text className="text-sm text-gray-600 block font-medium">
                                                                            Cỡ chữ: {fontSize}px
                                                                        </Text>
                                                                        <Text className="text-xs text-gray-500 block">
                                                                            PDF xuất theo chiều dọc
                                                                        </Text>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }}
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                )}
                            </Row>
                        </div>
                        <div className="flex justify-center space-x-4 pt-4">
                            <Button
                                type="default"
                                icon={
                                    isPreviewing ? (
                                        <SyncOutlined spin />
                                    ) : (
                                        <EyeOutlined />
                                    )
                                }
                                size="large"
                                onClick={handlePreview}
                                loading={isPreviewing}
                                disabled={!selectedNamHocId || isPreviewing || isExporting}
                                className="px-6 h-10 bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-300 font-medium"
                                style={{ borderRadius: "8px" }}
                            >
                                <span className="font-medium">
                                    {isPreviewing ? "Đang tải..." : "Xem trước"}
                                </span>
                            </Button>
                            <Button
                                type="primary"
                                icon={
                                    isExporting ? (
                                        <SyncOutlined spin />
                                    ) : (
                                        <DownloadOutlined />
                                    )
                                }
                                size="large"
                                onClick={handleExport}
                                loading={isExporting}
                                disabled={!selectedNamHocId || isPreviewing || isExporting}
                                className="px-6 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                                style={{ borderRadius: "8px" }}
                            >
                                <span className="font-medium">
                                    {isExporting
                                        ? "Đang xuất..."
                                        : "Xuất báo cáo"}
                                </span>
                            </Button>{" "}
                        </div>
                    </Form>
                </Card>
                <Card
                    className="border-0 shadow-lg bg-white/90 backdrop-blur-sm"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <InfoCircleOutlined className="text-white text-sm" />
                        </div>
                        <Title level={4} className="mb-0 text-gray-800">
                            Cấu trúc báo cáo
                        </Title>
                    </div>

                    <Alert
                        message="Báo cáo tổng hợp bao gồm các phần sau:"
                        type="info"
                        showIcon
                        className="rounded-lg mb-4 border-blue-200 bg-blue-50"
                    />

                    <Row gutter={[20, 20]}>
                        <Col xs={24} md={8}>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-xs">
                                            1
                                        </span>
                                    </div>
                                    <Text strong className="text-blue-700">
                                        BẢNG TỔNG HỢP KHỐI LƯỢNG TÍNH VƯỢT GIỜ
                                    </Text>
                                </div>
                                <Text type="secondary" className="text-sm">
                                    Trang đầu tiên chứa thông tin vượt giờ, đơn
                                    giá và thành tiền của từng giảng viên
                                </Text>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-lg border-l-4 border-emerald-500 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-xs">
                                            2
                                        </span>
                                    </div>
                                    <Text strong className="text-emerald-700">
                                        BẢNG TỔNG HỢP KHỐI LƯỢNG CÔNG TÁC
                                    </Text>
                                </div>
                                <Text type="secondary" className="text-sm">
                                    Trang thứ hai chứa tổng hợp khối lượng công
                                    việc theo các hạng mục
                                </Text>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border-l-4 border-purple-500 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center space-x-3 mb-2">
                                    {" "}
                                    <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-xs">
                                            3
                                        </span>
                                    </div>
                                    <Text strong className="text-purple-700">
                                        CHI TIẾT TỪNG GIẢNG VIÊN
                                    </Text>
                                </div>
                                <Text type="secondary" className="text-sm">
                                    Các trang tiếp theo chứa kê khai chi tiết
                                    của từng giảng viên
                                </Text>
                            </div>
                        </Col>
                    </Row>
                </Card>
                {previewData ? (
                    <Card
                        className="border-0 shadow-lg bg-white/90 backdrop-blur-sm"
                        style={{ borderRadius: "16px" }}
                    >
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                                <EyeOutlined className="text-white text-sm" />
                            </div>
                            <Title level={4} className="mb-0 text-gray-800">
                                Xem trước dữ liệu ({previewData.total_records}{" "} bản ghi)
                            </Title>
                        </div>
                        <Alert
                            message={`Dự kiến xuất ${previewData.total_records} bản ghi kê khai`}
                            type="success"
                            showIcon
                            className="mb-4 rounded-lg border-emerald-200 bg-emerald-50"
                        />
                        <div className="mb-4">
                            <Title
                                level={5}
                                className="text-gray-700 mb-3 flex items-center space-x-2"
                            >
                                <TableOutlined />
                                <span>
                                    Bảng tổng hợp khối lượng tính vượt giờ (Hiển thị{" "}
                                    {Math.min( previewData.reportData?.length || 0, 10 )}{" "} bản ghi đầu tiên):
                                </span>
                            </Title>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-96 overflow-auto">
                                {previewData.reportData && previewData.reportData.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border-collapse border border-gray-300 elegant-preview-table">
                                            <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                                                <tr>
                                                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 text-sm">
                                                        STT
                                                    </th>
                                                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 text-sm">
                                                        Mã GV
                                                    </th>
                                                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 text-sm">
                                                        Họ đệm
                                                    </th>
                                                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 text-sm">
                                                        Tên
                                                    </th>
                                                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 text-sm">
                                                        Học hàm
                                                    </th>
                                                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 text-sm">
                                                        Học vị
                                                    </th>
                                                    <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700 text-sm">
                                                        Định mức KHCN
                                                    </th>
                                                    <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700 text-sm">
                                                        Định mức GD
                                                    </th>
                                                    <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700 text-sm">
                                                        Thực hiện KHCN
                                                    </th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
                                                        Thực hiện GD
                                                    </th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
                                                        GD xa trường
                                                    </th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
                                                        Số tiết vượt
                                                    </th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
                                                        Mức lương CB
                                                    </th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
                                                        HD LA
                                                    </th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
                                                        HD LV
                                                    </th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
                                                        HD ĐA/KL
                                                    </th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
                                                        Thành tiền
                                                    </th>
                                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                                                        Trạng thái
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewData.reportData
                                                    .slice(0, 10)
                                                    .map((item, index) => (
                                                        <tr
                                                            key={index}
                                                            className={
                                                                index % 2 === 0
                                                                    ? "bg-white hover:bg-blue-50/50"
                                                                    : "bg-gray-50/50 hover:bg-blue-50/50"
                                                            }
                                                        >
                                                            <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                                                                {index + 1}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 font-medium text-blue-600">
                                                                {item.ma_gv ||
                                                                    "N/A"}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3">
                                                                {item.ho_dem ||
                                                                    ""}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 font-medium">
                                                                {item.ten || ""}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3">
                                                                {item.hoc_ham ||
                                                                    ""}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3">
                                                                {item.hoc_vi ||
                                                                    ""}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 text-right font-mono">
                                                                {Number(
                                                                    item.dinhmuc_khcn ||
                                                                        0
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 text-right font-mono">
                                                                {Number(
                                                                    item.dinhmuc_gd ||
                                                                        0
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 text-right font-mono">
                                                                {Number(
                                                                    item.thuc_hien_khcn ||
                                                                        0
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 text-right font-mono">
                                                                {Number(
                                                                    item.thuc_hien_gd ||
                                                                        0
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 text-right font-mono">
                                                                {Number(
                                                                    item.gd_xa_truong ||
                                                                        0
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 text-right font-mono">
                                                                {Number(
                                                                    item.so_tiet_vuot ||
                                                                        0
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 text-right font-mono">
                                                                {Number(
                                                                    item.muc_luong_co_ban ||
                                                                        0
                                                                ).toLocaleString(
                                                                    "vi-VN"
                                                                )}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 text-right font-mono">
                                                                {item.hd_la ||
                                                                    0}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 text-right font-mono">
                                                                {item.hd_lv ||
                                                                    0}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 text-right font-mono">
                                                                {item.hd_da_kl ||
                                                                    0}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 text-right font-bold text-emerald-600 font-mono">
                                                                {Number(
                                                                    item.thanh_tien ||
                                                                        0
                                                                ).toLocaleString(
                                                                    "vi-VN"
                                                                )}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3">
                                                                <Tag
                                                                    color={
                                                                        item.trang_thai ===
                                                                        3
                                                                            ? "green"
                                                                            : item.trang_thai ===
                                                                              1
                                                                            ? "blue"
                                                                            : item.trang_thai ===
                                                                              4
                                                                            ? "orange"
                                                                            : "default"
                                                                    }
                                                                    className="rounded-lg"
                                                                >
                                                                    {item.trang_thai ===
                                                                    3
                                                                        ? "Đã duyệt"
                                                                        : item.trang_thai ===
                                                                          1
                                                                        ? "Chờ duyệt"
                                                                        : item.trang_thai ===
                                                                          4
                                                                        ? "BM trả lại"
                                                                        : "Nháp"}
                                                                </Tag>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <EyeOutlined className="text-6xl mb-4 text-gray-300" />
                                        <p className="text-lg">
                                            Không có dữ liệu để hiển thị
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>{" "}
                        {previewData.reportData &&
                            previewData.reportData.length > 10 && (
                                <Alert
                                    message={`Và ${
                                        previewData.reportData.length - 10
                                    } bản ghi khác sẽ được bao gồm trong báo cáo đầy đủ`}
                                    type="info"
                                    showIcon
                                    className="rounded-lg border-blue-200 bg-blue-50"
                                />
                            )}
                    </Card>
                ) : (
                    <Card
                        className="border-0 shadow-lg bg-white/90 backdrop-blur-sm"
                        style={{ borderRadius: "16px" }}
                    >
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                                <EyeOutlined className="text-3xl text-gray-400" />
                            </div>
                            <Title level={4} className="text-gray-600 mb-2">
                                Chưa có dữ liệu xem trước
                            </Title>
                            <Text className="text-gray-500 mb-4 block">
                                Nhấn nút "Xem trước" để tải và hiển thị dữ liệu
                                mẫu trước khi xuất báo cáo hoàn chỉnh.
                            </Text>
                            <Button
                                type="primary"
                                icon={<EyeOutlined />}
                                size="large"
                                onClick={handlePreview}
                                loading={isPreviewing}
                                disabled={!selectedNamHocId || isPreviewing}
                                className="px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0"
                                style={{ borderRadius: "8px" }}
                            >
                                Xem trước dữ liệu
                            </Button>
                        </div>
                    </Card>
                )}{" "}
                <style>{`
                    .custom-select .ant-select-selector {
                        border-radius: 8px !important;
                        border: 1px solid #d1d5db !important;
                        transition: all 0.2s ease !important;
                        background: #ffffff !important;
                    }
                    
                    .custom-select .ant-select-selector:hover {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1) !important;
                    }

                    .custom-select.ant-select-focused .ant-select-selector {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
                    }

                    .custom-input-number .ant-input-number {
                        border-radius: 8px !important;
                        border: 1px solid #d1d5db !important;
                        transition: all 0.2s ease !important;
                    }

                    .custom-input-number .ant-input-number:hover {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1) !important;
                    }

                    .custom-input-number .ant-input-number-focused {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
                    }

                    .ant-radio-wrapper {
                        transition: all 0.2s ease !important;
                    }

                    .ant-radio-wrapper:hover {
                        transform: translateY(-1px) !important;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
                    }

                    .ant-radio-checked + .ant-radio-wrapper {
                        background: rgba(16, 185, 129, 0.05) !important;
                        border-color: #10b981 !important;
                    }

                    .elegant-preview-table {
                        border-radius: 8px !important;
                        overflow: hidden !important;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
                    }

                    .elegant-preview-table th {
                        background: #f8fafc !important;
                        transition: all 0.2s ease !important;
                    }

                    .elegant-preview-table tbody tr {
                        transition: all 0.2s ease !important;
                    }

                    .elegant-preview-table tbody tr:hover {
                        background: #f8fafc !important;
                    }

                    .ant-card {
                        transition: all 0.2s ease !important;
                    }

                    .ant-card:hover {
                        transform: translateY(-1px) !important;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
                    }

                    .ant-btn {
                        transition: all 0.2s ease !important;
                    }

                    .ant-btn:hover {
                        transform: translateY(-1px) !important;
                    }

                    .ant-btn:active {
                        transform: translateY(0) !important;
                    }                    
                    @media (max-width: 768px) {
                        .elegant-preview-table th,
                        .elegant-preview-table td {
                            padding: 6px 4px !important;
                            font-size: 12px !important;
                        }
                    }

                    .pdf-preview-paper {
                        transition: all 0.3s ease !important;
                        position: relative !important;
                    }

                    .pdf-preview-paper:hover {
                        transform: scale(1.05) !important;
                        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
                    }

                    .pdf-preview-content {
                        animation: fadeInContent 0.5s ease-out !important;
                    }

                    @keyframes fadeInContent {
                        from {
                            opacity: 0;
                            transform: translateY(4px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .ant-radio-wrapper {
                        border-radius: 6px !important;
                        padding: 4px 8px !important;
                        margin: 0 !important;
                        transition: all 0.2s ease !important;
                    }

                    .ant-radio-wrapper:hover {
                        background: rgba(59, 130, 246, 0.05) !important;
                    }

                    .ant-radio-wrapper.ant-radio-wrapper-checked {
                        background: rgba(59, 130, 246, 0.1) !important;
                        border: 1px solid rgba(59, 130, 246, 0.2) !important;
                    }
                `}</style>
            </div>
        </div>
    );
}

export default ExportReport;