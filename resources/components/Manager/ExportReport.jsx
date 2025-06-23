import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    message,
    Spin,
    Radio,
    InputNumber,
    Tooltip,
    Divider,
    Tag
} from 'antd';
import {
    DownloadOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    EyeOutlined,
    CalendarOutlined,
    FilterOutlined,
    InfoCircleOutlined,
    ExportOutlined,
    DashboardOutlined,
    SyncOutlined,
    SearchOutlined
} from '@ant-design/icons';

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
    const [exportFormat, setExportFormat] = useState('excel');

    useEffect(() => {
        fetchNamHocList();
    }, []);

    const fetchNamHocList = async () => {
        setIsLoadingNamHoc(true);
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get("/api/manager/nam-hoc-list", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const namHocs = response.data || [];
            setNamHocList(namHocs);
            
            // Auto-select current academic year
            const currentNamHoc = namHocs.find(nh => nh.la_nam_hien_hanh === 1);
            if (currentNamHoc) {
                setSelectedNamHocId(currentNamHoc.id.toString());
                form.setFieldsValue({ nam_hoc_id: currentNamHoc.id.toString() });
            }
        } catch (error) {
            message.error("Không thể tải danh sách năm học.");
        } finally {
            setIsLoadingNamHoc(false);
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
                    preview: 'true'
                }
            });
            
            setPreviewData(response.data);
            message.success("Đã tải xem trước thành công!");
        } catch (error) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error("Lỗi khi tải xem trước dữ liệu.");
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
            
            message.loading({ content: 'Đang xuất báo cáo...', key: 'exporting', duration: 0 });
            
            const response = await axios.get("/api/manager/export-report", {
                headers: { Authorization: `Bearer ${token}` },
                params: values,
                responseType: 'blob'
            });
            
            // Handle file download
            const contentType = response.headers['content-type'];
            const contentDisposition = response.headers['content-disposition'];
            
            let fileName = `BaoCaoKeKhai_${Date.now()}`;
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1].replace(/['"]/g, '');
                }
            }
            
            // Determine file extension
            if (values.format === 'excel') {
                fileName = fileName.endsWith('.xlsx') ? fileName : fileName + '.xlsx';
            } else if (values.format === 'pdf') {
                fileName = fileName.endsWith('.zip') ? fileName : fileName + '.zip';
            }
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            message.success({ content: 'Xuất báo cáo thành công!', key: 'exporting', duration: 3 });
        } catch (error) {
            console.error('Export error:', error);
            if (error.response?.data?.message) {
                message.error({ content: error.response.data.message, key: 'exporting', duration: 5 });
            } else {
                message.error({ content: 'Lỗi khi xuất báo cáo.', key: 'exporting', duration: 5 });
            }
        } finally {
            setIsExporting(false);
        }
    };

    // Add a function to render preview data as HTML table
    const renderPreviewTable = (data) => {
        if (!data || data.length === 0) return <div>Không có dữ liệu để hiển thị</div>;

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 elegant-preview-table">
                    <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                        <tr>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">STT</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Mã GV</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Họ đệm</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Tên</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Học hàm</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Học vị</th>
                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Định mức KHCN</th>
                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Định mức GD</th>
                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Thực hiện KHCN</th>
                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Thực hiện GD</th>
                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">GD xa trường</th>
                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Số tiết vượt</th>
                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Mức lương CB</th>
                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">HD LA</th>
                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">HD LV</th>
                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">HD ĐA/KL</th>
                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Thành tiền</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-gray-50/50 hover:bg-blue-50/50'}>
                                <td className="border border-gray-300 px-4 py-3 text-center font-medium">{index + 1}</td>
                                <td className="border border-gray-300 px-4 py-3 font-medium text-blue-600">{item.ma_gv || 'N/A'}</td>
                                <td className="border border-gray-300 px-4 py-3">{item.ho_dem || ''}</td>
                                <td className="border border-gray-300 px-4 py-3 font-medium">{item.ten || ''}</td>
                                <td className="border border-gray-300 px-4 py-3">{item.hoc_ham || ''}</td>
                                <td className="border border-gray-300 px-4 py-3">{item.hoc_vi || ''}</td>
                                <td className="border border-gray-300 px-4 py-3 text-right font-mono">{Number(item.dinhmuc_khcn || 0).toFixed(2)}</td>
                                <td className="border border-gray-300 px-4 py-3 text-right font-mono">{Number(item.dinhmuc_gd || 0).toFixed(2)}</td>
                                <td className="border border-gray-300 px-4 py-3 text-right font-mono">{Number(item.thuc_hien_khcn || 0).toFixed(2)}</td>
                                <td className="border border-gray-300 px-4 py-3 text-right font-mono">{Number(item.thuc_hien_gd || 0).toFixed(2)}</td>
                                <td className="border border-gray-300 px-4 py-3 text-right font-mono">{Number(item.gd_xa_truong || 0).toFixed(2)}</td>
                                <td className="border border-gray-300 px-4 py-3 text-right font-mono">{Number(item.so_tiet_vuot || 0).toFixed(2)}</td>
                                <td className="border border-gray-300 px-4 py-3 text-right font-mono">{Number(item.muc_luong_co_ban || 0).toLocaleString('vi-VN')}</td>
                                <td className="border border-gray-300 px-4 py-3 text-right font-mono">{item.hd_la || 0}</td>
                                <td className="border border-gray-300 px-4 py-3 text-right font-mono">{item.hd_lv || 0}</td>
                                <td className="border border-gray-300 px-4 py-3 text-right font-mono">{item.hd_da_kl || 0}</td>
                                <td className="border border-gray-300 px-4 py-3 text-right font-bold text-emerald-600 font-mono">
                                    {Number(item.thanh_tien || 0).toLocaleString('vi-VN')}
                                </td>
                                <td className="border border-gray-300 px-4 py-3">
                                    <Tag 
                                        color={
                                            item.trang_thai === 3 ? 'green' : 
                                            item.trang_thai === 1 ? 'blue' : 
                                            item.trang_thai === 4 ? 'orange' : 'default'
                                        }
                                        className="rounded-lg"
                                    >
                                        {item.trang_thai === 3 ? 'Đã duyệt' : 
                                         item.trang_thai === 1 ? 'Chờ duyệt' : 
                                         item.trang_thai === 4 ? 'BM trả lại' : 'Nháp'}
                                    </Tag>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    if (isLoadingNamHoc) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex justify-center items-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-200/50 mx-auto">
                        <Spin size="large" />
                    </div>
                    <Text className="text-lg text-gray-600">Đang tải dữ liệu xuất báo cáo...</Text>
                </div>
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
                                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-3 group-hover:rotate-0 transition-all duration-500 ease-out">
                                        <ExportOutlined className="text-3xl text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full border-3 border-white shadow-lg animate-bounce"></div>
                                    <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full border-2 border-white shadow-md"></div>
                                </div>
                                <div className="space-y-3">
                                    <Title level={1} style={{ margin: 0 }} className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-slate-700 to-gray-800 bg-clip-text text-transparent">
                                        Xuất Báo cáo Bộ môn
                                    </Title>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-pulse"></div>
                                            <Text type="secondary" className="text-base">
                                                Xuất báo cáo tổng hợp khối lượng công việc toàn diện
                                            </Text>
                                        </div>
                                        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-white/60 rounded-full border border-emerald-200/50">
                                            <DownloadOutlined className="text-emerald-500 text-sm" />
                                            <Text className="text-sm font-medium text-gray-700">
                                                Export System
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Export Configuration Form */}
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            format: 'excel',
                            trang_thai: '',
                            font_size: 10,
                            paper_size: 'a4'
                        }}
                        className="space-y-6"
                    >
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                        <FilterOutlined className="text-white text-sm" />
                                    </div>
                                    <Title level={4} className="mb-0 text-gray-800">
                                        Cấu hình xuất báo cáo
                                    </Title>
                                </div>
                            </div>

                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        name="nam_hoc_id"
                                        label={
                                            <span className="flex items-center space-x-2 font-medium text-gray-700">
                                                <CalendarOutlined className="text-blue-500" />
                                                <span>Năm học <Text type="danger">*</Text></span>
                                            </span>
                                        }
                                        rules={[{ required: true, message: 'Vui lòng chọn năm học!' }]}
                                        style={{marginBottom: 0}}
                                    >
                                        <Select
                                            placeholder="Chọn năm học"
                                            size="large"
                                            showSearch
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                            className="custom-select"
                                            onChange={(value) => setSelectedNamHocId(value)}
                                        >
                                            {namHocList.map(nh => (
                                                <Option key={nh.id} value={nh.id.toString()}>
                                                    <div className="flex items-center justify-between">
                                                        <span>{nh.ten_nam_hoc}</span>
                                                        {nh.la_nam_hien_hanh && (
                                                            <Tag color="green" size="small">Hiện tại</Tag>
                                                        )}
                                                    </div>
                                                </Option>
                                            ))}
                                        </Select>
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
                                        style={{marginBottom: 0}}
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
                                        style={{marginBottom: 0}}
                                    >
                                        <Select
                                            mode="tags"
                                            placeholder="Nhập tên hoặc mã GV"
                                            size="large"
                                            className="custom-select"
                                            tokenSeparators={[',']}
                                            maxTagCount={2}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        <Divider className="border-gray-200/60" />

                        {/* Enhanced Format Selection */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                                        <DownloadOutlined className="text-white text-sm" />
                                    </div>
                                    <Title level={4} className="mb-0 text-gray-800">
                                        Định dạng xuất báo cáo
                                    </Title>
                                </div>
                            </div>

                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="format"
                                        rules={[{ required: true }]}
                                    >
                                        <Radio.Group
                                            size="large"
                                            onChange={(e) => setExportFormat(e.target.value)}
                                            className="w-full"
                                        >
                                            <Space direction="vertical" className="w-full">
                                                <Radio 
                                                    value="excel" 
                                                    className="w-full p-4 border-2 border-gray-200/60 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-300"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                                            <FileExcelOutlined className="text-white text-lg" />
                                                        </div>
                                                        <div>
                                                            <Text strong className="text-gray-800 text-base">Excel (.xlsx)</Text>
                                                            <br />
                                                            <Text type="secondary" className="text-sm">1 file với nhiều sheet, dễ dàng xử lý dữ liệu</Text>
                                                        </div>
                                                    </div>
                                                </Radio>
                                                <Radio 
                                                    value="pdf" 
                                                    className="w-full p-4 border-2 border-gray-200/60 rounded-xl hover:border-red-300 hover:bg-red-50/50 transition-all duration-300"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                                                            <FilePdfOutlined className="text-white text-lg" />
                                                        </div>
                                                        <div>
                                                            <Text strong className="text-gray-800 text-base">PDF (.zip)</Text>
                                                            <br />
                                                            <Text type="secondary" className="text-sm">Nhiều file PDF trong 1 thư mục nén, sẵn sàng in ấn</Text>
                                                        </div>
                                                    </div>
                                                </Radio>
                                            </Space>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>

                                {exportFormat === 'pdf' && (
                                    <Col xs={24} md={12}>
                                        <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200/50">
                                            <Title level={5} className="mb-4 text-gray-700">Tùy chọn PDF</Title>
                                            <Space direction="vertical" className="w-full" size="large">
                                                <Form.Item
                                                    name="font_size"
                                                    label={<Text strong>Cỡ chữ PDF</Text>}
                                                    style={{marginBottom: 0}}
                                                >
                                                    <InputNumber
                                                        min={8}
                                                        max={16}
                                                        size="large"
                                                        className="w-full custom-input-number"
                                                        addonAfter="px"
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    name="paper_size"
                                                    label={<Text strong>Khổ giấy</Text>}
                                                    style={{marginBottom: 0}}
                                                >
                                                    <Select size="large" className="custom-select">
                                                        <Option value="a4">A4 (210 × 297 mm)</Option>
                                                        <Option value="a3">A3 (297 × 420 mm)</Option>
                                                        <Option value="letter">Letter (216 × 279 mm)</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Space>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="flex justify-center space-x-6 pt-6">
                            <Button
                                type="default"
                                icon={<EyeOutlined />}
                                size="large"
                                onClick={handlePreview}
                                loading={isPreviewing}
                                disabled={!selectedNamHocId}
                                className="px-8 h-12 bg-white/80 border-blue-200/60 hover:border-blue-400 hover:bg-blue-50/80 shadow-lg hover:shadow-xl transition-all duration-300"
                                style={{ borderRadius: '12px' }}
                            >
                                <span className="font-medium">Xem trước</span>
                            </Button>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                size="large"
                                onClick={handleExport}
                                loading={isExporting}
                                disabled={!selectedNamHocId}
                                className="px-8 h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-none shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                style={{ borderRadius: '12px' }}
                            >
                                <span className="font-medium">Xuất báo cáo</span>
                            </Button>
                        </div>
                    </Form>
                </Card>

                {/* Enhanced Report Structure Information */}
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg" style={{ borderRadius: '20px' }}>
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <InfoCircleOutlined className="text-white text-sm" />
                        </div>
                        <Title level={4} className="mb-0 text-gray-800">Cấu trúc báo cáo</Title>
                    </div>
                    
                    <Alert
                        message="Báo cáo tổng hợp bao gồm các phần sau:"
                        type="info"
                        showIcon
                        className="rounded-xl mb-6 border-blue-200/60 bg-blue-50/80"
                    />
                    
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8}>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">1</span>
                                    </div>
                                    <Text strong className="text-blue-700 text-base">BẢNG TỔNG HỢP KHỐI LƯỢNG TÍNH VƯỢT GIỜ</Text>
                                </div>
                                <Paragraph type="secondary" className="text-sm mb-0 leading-relaxed">
                                    Trang đầu tiên chứa thông tin vượt giờ, đơn giá và thành tiền của từng giảng viên
                                </Paragraph>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border-l-4 border-emerald-500 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">2</span>
                                    </div>
                                    <Text strong className="text-emerald-700 text-base">BẢNG TỔNG HỢP KHỐI LƯỢNG CÔNG TÁC</Text>
                                </div>
                                <Paragraph type="secondary" className="text-sm mb-0 leading-relaxed">
                                    Trang thứ hai chứa tổng hợp khối lượng công việc theo các hạng mục
                                </Paragraph>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">3</span>
                                    </div>
                                    <Text strong className="text-purple-700 text-base">CHI TIẾT TỪNG GIẢNG VIÊN</Text>
                                </div>
                                <Paragraph type="secondary" className="text-sm mb-0 leading-relaxed">
                                    Các trang tiếp theo chứa kê khai chi tiết của từng giảng viên
                                </Paragraph>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Enhanced Preview Data */}
                {previewData && (
                    <Card className="bg-white/80 backdrop-blur-sm border border-emerald-200/50 shadow-lg" style={{ borderRadius: '20px' }}>
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                                <EyeOutlined className="text-white text-sm" />
                            </div>
                            <Title level={4} className="mb-0 text-gray-800">
                                Xem trước dữ liệu ({previewData.total_records} bản ghi)
                            </Title>
                        </div>
                        
                        <Alert
                            message={`Dự kiến xuất ${previewData.total_records} bản ghi kê khai`}
                            type="success"
                            showIcon
                            className="mb-6 rounded-xl border-emerald-200/60 bg-emerald-50/80"
                        />
                        
                        <div className="mb-4">
                            <Title level={5} className="text-gray-700 mb-4 flex items-center space-x-2">
                                <span>📊</span>
                                <span>Bảng tổng hợp khối lượng tính vượt giờ (Hiển thị {Math.min(previewData.reportData?.length || 0, 10)} bản ghi đầu tiên):</span>
                            </Title>
                            <div className="bg-gray-50/80 rounded-2xl p-6 border-2 border-dashed border-gray-300/60 max-h-96 overflow-auto">
                                {previewData.reportData && previewData.reportData.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border-collapse border border-gray-300 elegant-preview-table">
                                            <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                                                <tr>
                                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">STT</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Mã GV</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Họ đệm</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Tên</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Học hàm</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Học vị</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Định mức KHCN</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Định mức GD</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Thực hiện KHCN</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Thực hiện GD</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">GD xa trường</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Số tiết vượt</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Mức lương CB</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">HD LA</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">HD LV</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">HD ĐA/KL</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Thành tiền</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewData.reportData.slice(0, 10).map((item, index) => (
                                                    <tr key={index} className={index % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-gray-50/50 hover:bg-blue-50/50'}>
                                                        <td className="border border-gray-300 px-4 py-3 text-center font-medium">{index + 1}</td>
                                                        <td className="border border-gray-300 px-4 py-3 font-medium text-blue-600">{item.ma_gv || 'N/A'}</td>
                                                        <td className="border border-gray-300 px-4 py-3">{item.ho_dem || ''}</td>
                                                        <td className="border border-gray-300 px-4 py-3 font-medium">{item.ten || ''}</td>
                                                        <td className="border border-gray-300 px-4 py-3">{item.hoc_ham || ''}</td>
                                                        <td className="border border-gray-300 px-4 py-3">{item.hoc_vi || ''}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-right font-mono">{Number(item.dinhmuc_khcn || 0).toFixed(2)}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-right font-mono">{Number(item.dinhmuc_gd || 0).toFixed(2)}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-right font-mono">{Number(item.thuc_hien_khcn || 0).toFixed(2)}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-right font-mono">{Number(item.thuc_hien_gd || 0).toFixed(2)}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-right font-mono">{Number(item.gd_xa_truong || 0).toFixed(2)}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-right font-mono">{Number(item.so_tiet_vuot || 0).toFixed(2)}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-right font-mono">{Number(item.muc_luong_co_ban || 0).toLocaleString('vi-VN')}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-right font-mono">{item.hd_la || 0}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-right font-mono">{item.hd_lv || 0}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-right font-mono">{item.hd_da_kl || 0}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-right font-bold text-emerald-600 font-mono">
                                                            {Number(item.thanh_tien || 0).toLocaleString('vi-VN')}
                                                        </td>
                                                        <td className="border border-gray-300 px-4 py-3">
                                                            <Tag 
                                                                color={
                                                                    item.trang_thai === 3 ? 'green' : 
                                                                    item.trang_thai === 1 ? 'blue' : 
                                                                    item.trang_thai === 4 ? 'orange' : 'default'
                                                                }
                                                                className="rounded-lg"
                                                            >
                                                                {item.trang_thai === 3 ? 'Đã duyệt' : 
                                                                 item.trang_thai === 1 ? 'Chờ duyệt' : 
                                                                 item.trang_thai === 4 ? 'BM trả lại' : 'Nháp'}
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
                                        <p className="text-lg">Không có dữ liệu để hiển thị</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {previewData.reportData && previewData.reportData.length > 10 && (
                            <Alert
                                message={`Và ${previewData.reportData.length - 10} bản ghi khác sẽ được bao gồm trong báo cáo đầy đủ`}
                                type="info"
                                showIcon
                                className="rounded-xl border-blue-200/60 bg-blue-50/80"
                            />
                        )}
                    </Card>
                )}

                {/* Enhanced Custom Styles */}
                <style>{`
                    /* Enhanced Form Controls */
                    .custom-select .ant-select-selector {
                        border-radius: 12px !important;
                        border: 2px solid #e2e8f0 !important;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important;
                        transition: all 0.3s ease !important;
                        background: rgba(255, 255, 255, 0.8) !important;
                        backdrop-filter: blur(8px) !important;
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

                    .custom-input-number .ant-input-number {
                        border-radius: 12px !important;
                        border: 2px solid #e2e8f0 !important;
                        transition: all 0.3s ease !important;
                    }

                    .custom-input-number .ant-input-number:hover {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
                    }

                    .custom-input-number .ant-input-number-focused {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
                    }

                    /* Enhanced Radio Styling */
                    .ant-radio-wrapper {
                        transition: all 0.3s ease !important;
                    }

                    .ant-radio-wrapper:hover {
                        transform: translateY(-2px) !important;
                        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
                    }

                    .ant-radio-checked + .ant-radio-wrapper {
                        background: rgba(16, 185, 129, 0.05) !important;
                        border-color: #10b981 !important;
                    }

                    /* Enhanced Preview Table */
                    .elegant-preview-table {
                        border-radius: 12px !important;
                        overflow: hidden !important;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
                    }

                    .elegant-preview-table th {
                        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
                        transition: all 0.2s ease !important;
                    }

                    .elegant-preview-table tbody tr {
                        transition: all 0.2s ease !important;
                    }

                    .elegant-preview-table tbody tr:hover {
                        transform: translateY(-1px) !important;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1) !important;
                    }

                    /* Card enhancements */
                    .ant-card {
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }

                    .ant-card:hover {
                        transform: translateY(-2px) !important;
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
                        .elegant-preview-table th,
                        .elegant-preview-table td {
                            padding: 8px 4px !important;
                            font-size: 12px !important;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}

export default ExportReport;
