import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
    Select, 
    Input, 
    Button, 
    Table, 
    Card, 
    Row, 
    Col,
    Form,
    Modal,
    Upload,
    message,
    Tag,
    Pagination,
    Spin,
    Typography,
    Space,
    Divider,
    Tooltip,
    InputNumber
} from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    SettingOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    FilterOutlined,
    CloseCircleOutlined,
    DownloadOutlined,
    CalculatorOutlined,
    NumberOutlined,
    FileTextOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Text, Title } = Typography;
const { TextArea } = Input;

function DmHeSoChungManagement() {
    const [form] = Form.useForm();
    const [heSoList, setHeSoList] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        from: null,
        to: null,
    });

    const debounce = (func, delay) => {
        let timeoutId;
        return function (...args) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    const debouncedSearch = useCallback(
        debounce((searchValue) => {
            setPagination((prev) => ({
                ...prev,
                current_page: 1,
            }));
            fetchHeSo(1, pagination.per_page, searchValue);
        }, 500),
        [pagination.per_page]
    );

    useEffect(() => {
        fetchHeSo();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() !== "") {
            setIsSearching(true);
            debouncedSearch(searchTerm.trim());
        } else {
            setIsSearching(false);
            setPagination((prev) => ({
                ...prev,
                current_page: 1,
            }));
            fetchHeSo(1, pagination.per_page, "");
        }
        
        return () => {
            if (debouncedSearch.cancel) {
                debouncedSearch.cancel();
            }
        };
    }, [searchTerm, debouncedSearch, pagination.per_page]);

    const fetchHeSo = async (page = pagination.current_page, perPage = pagination.per_page, search = searchTerm) => {
        setIsLoading(true);
        try {
            const params = {
                per_page: perPage,
                page: page,
            };

            if (search && search.trim() !== "") {
                params.search = search.trim();
            }

            const response = await axios.get("/api/admin/dm-he-so-chung", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: params,
            });

            setHeSoList(response.data.data || []);
            setPagination({
                current_page: response.data.pagination?.current_page || page,
                per_page: response.data.pagination?.per_page || perPage,
                total: response.data.pagination?.total || 0,
                last_page: response.data.pagination?.last_page || 1,
                from: response.data.pagination?.from || null,
                to: response.data.pagination?.to || null,
            });
        } catch (error) {
            console.error("Error fetching hệ số chung:", error);
            if (error.response?.status === 401) {
                message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            } else if (error.response?.status === 403) {
                message.error("Bạn không có quyền truy cập chức năng này.");
            } else if (error.response?.status === 422) {
                message.error("Dữ liệu tìm kiếm không hợp lệ.");
            } else if (error.response?.status >= 500) {
                message.error("Lỗi máy chủ. Vui lòng thử lại sau.");
            } else {
                message.error("Không thể tải dữ liệu hệ số chung");
            }
            setHeSoList([]);
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }
    };

    const handlePageChange = (page, pageSize) => {
        setPagination((prev) => ({
            ...prev,
            current_page: page,
            per_page: pageSize,
        }));
        fetchHeSo(page, pageSize, searchTerm);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
    };

    const clearAll = () => {
        setSearchTerm("");
        setIsSearching(false);
        setPagination((prev) => ({
            ...prev,
            current_page: 1,
        }));
        fetchHeSo(1, pagination.per_page, "");
    };

    const handleSubmit = async (values) => {
        setIsLoading(true);
        try {
            if (editingId) {
                await axios.put(`/api/admin/dm-he-so-chung/${editingId}`, values, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                message.success("Cập nhật hệ số chung thành công");
            } else {
                await axios.post("/api/admin/dm-he-so-chung", values, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                message.success("Thêm hệ số chung mới thành công");
            }
            fetchHeSo();
            form.resetFields();
            setEditingId(null);
        } catch (error) {
            const errorMessages = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join(" ")
                : error.response?.data?.message || "Có lỗi xảy ra";
            message.error(errorMessages);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (heSo) => {
        form.setFieldsValue({
            ma_he_so: heSo.ma_he_so,
            ten_he_so: heSo.ten_he_so,
            gia_tri: heSo.gia_tri,
            don_vi_tinh: heSo.don_vi_tinh,
            mo_ta: heSo.mo_ta,
        });
        setEditingId(heSo.id);
    };

    const handleDelete = (id) => {
        if (!id) {
            message.error("Không thể xác định hệ số cần xóa");
            return;
        }
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!deletingId) {
            message.error("Không thể xác định hệ số cần xóa");
            return;
        }

        setIsDeleting(true);
        
        try {
            await axios.delete(`/api/admin/dm-he-so-chung/${deletingId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            
            message.success("Xóa hệ số chung thành công");
            setDeleteModalVisible(false);
            setDeletingId(null);
            await fetchHeSo();
            
        } catch (error) {
            let errorMessage = "Có lỗi xảy ra khi xóa hệ số chung";
            
            if (error.response?.status === 401) {
                errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
            } else if (error.response?.status === 403) {
                errorMessage = "Bạn không có quyền xóa hệ số này.";
            } else if (error.response?.status === 404) {
                errorMessage = "Hệ số không tồn tại hoặc đã được xóa.";
                await fetchHeSo();
            } else if (error.response?.status === 409) {
                errorMessage = "Không thể xóa hệ số này vì đang được sử dụng ở nơi khác.";
            } else if (error.response?.status === 422) {
                errorMessage = error.response?.data?.message || "Không thể xóa hệ số này!";
            } else if (error.response?.status >= 500) {
                errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            message.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setDeleteModalVisible(false);
        setDeletingId(null);
    };

    const handleImport = async () => {
        if (!file) {
            message.error("Vui lòng chọn file để nhập");
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("/api/admin/dm-he-so-chung/import", formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            message.success(response.data.message);
            fetchHeSo();
            setFile(null);
        } catch (error) {
            const errorMessages = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join("; ")
                : error.response?.data?.message || "Có lỗi khi nhập file";
            message.error(errorMessages);
        } finally {
            setIsLoading(false);
        }
    };

    const uploadProps = {
        beforeUpload: (file) => {
            const isValidType = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                               file.type === 'application/vnd.ms-excel' ||
                               file.type === 'text/csv';
            if (!isValidType) {
                message.error('Chỉ hỗ trợ file Excel (.xlsx, .xls) và CSV!');
                return false;
            }
            setFile(file);
            return false;
        },
        onRemove: () => {
            setFile(null);
        },
        fileList: file ? [file] : [],
    };

    const downloadSampleFile = () => {
        const csvHeaders = [
            'ma_he_so',
            'ten_he_so',
            'gia_tri',
            'don_vi_tinh',
            'mo_ta'
        ];

        const sampleData = [
            [
                'HSL_CB',
                'Hệ số lương cơ bản',
                '1.86',
                'Lần',
                'Hệ số lương cơ bản cho giảng viên'
            ],
            [
                'PC_CV',
                'Phụ cấp chức vụ',
                '0.5',
                'Lần',
                'Phụ cấp chức vụ lãnh đạo'
            ],
            [
                'GIO_CHUAN',
                'Số giờ chuẩn năm',
                '300',
                'Giờ',
                'Số giờ giảng dạy chuẩn trong năm'
            ],
            [
                'HS_VUOT',
                'Hệ số giờ vượt',
                '1.5',
                'Lần',
                'Hệ số nhân cho giờ vượt định mức'
            ],
            [
                'LUONG_CB',
                'Lương cơ bản',
                '1800000',
                'VND',
                'Mức lương cơ bản theo quy định'
            ]
        ];

        const csvContent = [
            csvHeaders.join(','),
            ...sampleData.map(row => row.join(','))
        ].join('\n');

        const BOM = '\uFEFF';
        const finalContent = BOM + csvContent;

        const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'mau_he_so_chung.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        message.success('Đã tải xuống file mẫu thành công!');
    };

    const columns = [
        {
            title: 'Mã hệ số',
            dataIndex: 'ma_he_so',
            key: 'ma_he_so',
            width: 120,
            render: (maHeSo) => (
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center border border-orange-200/50">
                        <NumberOutlined className="text-orange-600 text-xs" />
                    </div>
                    <Text className="font-mono text-sm font-medium text-gray-800">
                        {maHeSo}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Tên hệ số',
            dataIndex: 'ten_he_so',
            key: 'ten_he_so',
            width: 250,
            render: (tenHeSo) => (
                <Text className="text-sm font-medium text-gray-800">
                    {tenHeSo}
                </Text>
            ),
        },
        {
            title: 'Giá trị',
            dataIndex: 'gia_tri',
            key: 'gia_tri',
            width: 120,
            align: 'right',
            render: (giaTri, record) => (
                <div className="text-right">
                    <Text className="text-sm font-semibold text-blue-600">
                        {new Intl.NumberFormat('vi-VN').format(giaTri)}
                    </Text>
                    {record.don_vi_tinh && (
                        <div className="text-xs text-gray-500 mt-1">
                            {record.don_vi_tinh}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'don_vi_tinh',
            key: 'don_vi_tinh',
            width: 100,
            render: (donViTinh) => (
                <Tag color="green" className="font-medium">
                    {donViTinh || 'N/A'}
                </Tag>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'mo_ta',
            key: 'mo_ta',
            width: 300,
            render: (moTa) => (
                <Text 
                    className="text-xs text-gray-600" 
                    ellipsis={{ tooltip: moTa }}
                >
                    {moTa || 'Không có mô tả'}
                </Text>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEdit(record);
                            }}
                            className="text-blue-600 hover:bg-blue-50"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(record.id);
                            }}
                            className="text-red-600 hover:bg-red-50"
                            disabled={isLoading}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-red-50/40 relative">
=            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-orange-400/5 to-red-400/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-amber-400/5 to-orange-400/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-8 space-y-6">
=                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <CalculatorOutlined className="text-2xl text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white shadow-md"></div>
                            </div>
                            <div className="space-y-2">
                                <Title level={2} style={{ margin: 0 }} className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
                                    Quản lý hệ số chung
                                </Title>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                    <Text type="secondary">Quản lý các hệ số và tham số chung của hệ thống</Text>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <span>Dashboard</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-orange-600 font-medium">Hệ số chung</span>
                        </div>
                    </div>
                </Card>

=                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-slate-50 via-orange-50/50 to-red-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                <SearchOutlined className="text-white text-lg" />
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>Tìm kiếm hệ số</Title>
                                <Text type="secondary" className="text-sm">Tìm kiếm theo mã, tên hệ số hoặc mô tả</Text>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <Row gutter={[24, 24]}>
                            <Col xs={24}>
                                <Input
                                    size="large"
                                    placeholder="Tìm kiếm theo mã hệ số, tên hệ số, mô tả..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="custom-input"
                                    allowClear={{
                                        clearIcon: searchTerm ? (
                                            <Button
                                                type="text"
                                                size="small"
                                                onClick={clearAll}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                ✕
                                            </Button>
                                        ) : null
                                    }}
                                    prefix={
                                        <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center mr-2">
                                            <SearchOutlined className="text-gray-500 text-xs" />
                                        </div>
                                    }
                                    suffix={
                                        isSearching && (
                                            <Spin size="small" />
                                        )
                                    }
                                />
                            </Col>
                        </Row>
                        
                        {searchTerm && (
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                    {isSearching ? "Đang tìm kiếm..." : 
                                     `Tìm kiếm với từ khóa: "${searchTerm}"`}
                                </div>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={clearAll}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Xóa tìm kiếm
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

=                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-slate-50 via-orange-50/50 to-red-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                {editingId ? <EditOutlined className="text-white text-lg" /> : <PlusOutlined className="text-white text-lg" />}
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {editingId ? "Cập nhật hệ số chung" : "Thêm hệ số chung mới"}
                                </Title>
                                <Text type="secondary" className="text-sm">
                                    {editingId ? "Chỉnh sửa thông tin hệ số" : "Tạo hệ số mới cho hệ thống"}
                                </Text>
                            </div>
                        </div>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Row gutter={[24, 24]}>
                            <Col xs={24} sm={8}>
                                <Form.Item
                                    name="ma_he_so"
                                    label={<Text strong>Mã hệ số</Text>}
                                    rules={[{ required: true, message: 'Vui lòng nhập mã hệ số' }]}
                                >
                                    <Input
                                        size="large"
                                        placeholder="Nhập mã hệ số (VD: HSL_CB)"
                                        className="custom-input"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={8}>
                                <Form.Item
                                    name="ten_he_so"
                                    label={<Text strong>Tên hệ số</Text>}
                                    rules={[{ required: true, message: 'Vui lòng nhập tên hệ số' }]}
                                >
                                    <Input
                                        size="large"
                                        placeholder="Nhập tên hệ số"
                                        className="custom-input"
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={8}>
                                <Form.Item
                                    name="gia_tri"
                                    label={<Text strong>Giá trị</Text>}
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập giá trị' },
                                        { type: 'number', message: 'Giá trị phải là số' }
                                    ]}
                                >
                                    <InputNumber
                                        size="large"
                                        placeholder="Nhập giá trị"
                                        className="w-full"
                                        step={0.01}
                                        precision={2}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={8}>
                                <Form.Item
                                    name="don_vi_tinh"
                                    label={<Text strong>Đơn vị tính</Text>}
                                >
                                    <Select
                                        size="large"
                                        placeholder="Chọn đơn vị tính"
                                        className="custom-select"
                                        allowClear
                                    >
                                        <Option value="Lần">Lần</Option>
                                        <Option value="Giờ">Giờ</Option>
                                        <Option value="VND">VND</Option>
                                        <Option value="Phần trăm">Phần trăm (%)</Option>
                                        <Option value="Ngày">Ngày</Option>
                                        <Option value="Tháng">Tháng</Option>
                                        <Option value="Năm">Năm</Option>
                                        <Option value="Điểm">Điểm</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={16}>
                                <Form.Item
                                    name="mo_ta"
                                    label={<Text strong>Mô tả</Text>}
                                >
                                    <TextArea
                                        size="large"
                                        placeholder="Nhập mô tả chi tiết về hệ số..."
                                        className="custom-input"
                                        rows={4}
                                        showCount
                                        maxLength={500}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider />

                        <div className="flex justify-end space-x-3">
                            {editingId && (
                                <Button
                                    size="large"
                                    onClick={() => {
                                        form.resetFields();
                                        setEditingId(null);
                                    }}
                                    className="px-6"
                                >
                                    Hủy
                                </Button>
                            )}
                            <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                loading={isLoading}
                                icon={editingId ? <EditOutlined /> : <PlusOutlined />}
                                className="px-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 border-0 rounded-xl shadow-lg hover:shadow-xl"
                            >
                                {editingId ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </div>
                    </Form>
                </Card>

=                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                <UploadOutlined className="text-white text-lg" />
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>Nhập dữ liệu từ file</Title>
                                <Text type="secondary" className="text-sm">Tải lên file Excel hoặc CSV để thêm nhiều hệ số</Text>
                            </div>
                        </div>
                    </div>

                    <Row gutter={[24, 24]} align="middle">
                        <Col xs={24} lg={16}>
                            <Upload {...uploadProps} maxCount={1}>
                                <Button
                                    size="large"
                                    icon={<UploadOutlined />}
                                    className="w-full h-12 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl"
                                >
                                    {file ? "Thay đổi file" : "Chọn file để tải lên"}
                                </Button>
                            </Upload>

                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start">
                                    <InfoCircleOutlined className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                                    <div className="text-xs text-blue-800 flex-1">
                                        <Text strong className="block">Định dạng hỗ trợ: .xlsx, .xls, .csv</Text>
                                        <Text className="block mt-1">File phải có cấu trúc đúng với các cột: ma_he_so, ten_he_so, gia_tri, don_vi_tinh, mo_ta</Text>
                                        <div className="mt-3 flex items-center justify-between">
                                            <Text className="text-blue-700">
                                                <strong>Lưu ý:</strong> Mã hệ số phải duy nhất và không trùng lặp
                                            </Text>
                                            <Button
                                                type="link"
                                                size="small"
                                                icon={<DownloadOutlined />}
                                                onClick={downloadSampleFile}
                                                className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                                            >
                                                Tải file mẫu
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} lg={8}>
                            <div className="space-y-3">
                                <Button
                                    type="default"
                                    size="large"
                                    icon={<DownloadOutlined />}
                                    onClick={downloadSampleFile}
                                    className="w-full h-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 hover:text-blue-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    Tải file mẫu CSV
                                </Button>
                                
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<UploadOutlined />}
                                    onClick={handleImport}
                                    disabled={!file}
                                    loading={isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-xl shadow-lg hover:shadow-xl"
                                >
                                    Nhập dữ liệu
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card>

=                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-slate-50 via-orange-50/50 to-red-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                    <CalculatorOutlined className="text-white text-lg" />
                                </div>
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>Danh sách hệ số chung</Title>
                                    <Text type="secondary" className="text-sm">
                                        {searchTerm ? (
                                            `${pagination.total} kết quả tìm kiếm`
                                        ) : (
                                            `${pagination.total} hệ số trong hệ thống`
                                        )}
                                    </Text>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {searchTerm && (
                                    <Button
                                        type="default"
                                        size="middle"
                                        onClick={clearAll}
                                        className="px-4 py-2 h-9 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-600 hover:from-red-100 hover:to-pink-100 hover:border-red-300 hover:text-red-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                        icon={<CloseCircleOutlined />}
                                    >
                                        Xóa tìm kiếm
                                    </Button>
                                )}
                                
                                <Button
                                    type="default"
                                    size="middle"
                                    onClick={() => fetchHeSo()}
                                    loading={isLoading}
                                    className="px-4 py-2 h-9 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 text-orange-600 hover:from-orange-100 hover:to-red-100 hover:border-orange-300 hover:text-orange-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                    icon={<SettingOutlined />}
                                >
                                    Làm mới
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={heSoList}
                        loading={isLoading}
                        pagination={false}
                        rowKey="id"
                        className="custom-table"
                        locale={{
                            emptyText: (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <CalculatorOutlined className="text-2xl text-gray-400" />
                                    </div>
                                    <Text className="text-gray-500 font-medium text-lg block">
                                        {searchTerm ? `Không tìm thấy hệ số với từ khóa "${searchTerm}"` : 
                                         "Chưa có hệ số nào"}
                                    </Text>
                                    <Text className="text-gray-400 text-sm">
                                        {searchTerm ? (
                                            <>
                                                Thử điều chỉnh từ khóa tìm kiếm hoặc{" "}
                                                <Button 
                                                    type="link" 
                                                    size="small" 
                                                    onClick={clearAll}
                                                    className="p-0 h-auto"
                                                >
                                                    xóa tìm kiếm
                                                </Button>
                                            </>
                                        ) : (
                                            "Thêm hệ số mới để bắt đầu"
                                        )}
                                    </Text>
                                </div>
                            )
                        }}
                    />

                    {pagination.total > 0 && (
                        <div className="mt-6 flex justify-between items-center">
                            <Text type="secondary">
                                Hiển thị <Text strong>{pagination.from}</Text> đến <Text strong>{pagination.to}</Text> trên <Text strong>{pagination.total}</Text> kết quả
                                {searchTerm && (
                                    <span className="ml-2 text-orange-600">
                                        (tìm kiếm: "{searchTerm}")
                                    </span>
                                )}
                            </Text>
                            <Pagination
                                current={pagination.current_page}
                                total={pagination.total}
                                pageSize={pagination.per_page}
                                showSizeChanger
                                showQuickJumper
                                onChange={handlePageChange}
                                showTotal={(total, range) => `${range[0]}-${range[1]} trên ${total} mục`}
                                className="custom-pagination"
                            />
                        </div>
                    )}
                </Card>

=                <Modal
                    title={
                        <div className="flex items-center">
                            <ExclamationCircleOutlined className="text-red-500 mr-2" />
                            <span>Xác nhận xóa hệ số</span>
                        </div>
                    }
                    open={deleteModalVisible}
                    onOk={confirmDelete}
                    onCancel={cancelDelete}
                    okText="Xóa"
                    cancelText="Hủy"
                    okType="danger"
                    confirmLoading={isDeleting}
                    centered
                    width={450}
                >
                    <p>Bạn có chắc chắn muốn xóa hệ số này? Hành động này không thể hoàn tác.</p>
                    <p className="text-amber-600 text-sm mt-2">
                        <strong>Lưu ý:</strong> Nếu hệ số đang được sử dụng ở nơi khác, việc xóa sẽ không thành công.
                    </p>
                </Modal>

=                <style>{`
                    .custom-select .ant-select-selector {
                        border-radius: 8px !important;
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.2s ease !important;
                    }
                    
                    .custom-select .ant-select-selector:hover {
                        border-color: #f97316 !important;
                        box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15) !important;
                    }
                    
                    .custom-input.ant-input, .custom-input.ant-input:focus {
                        border-radius: 8px !important;
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.2s ease !important;
                    }
                    
                    .custom-input.ant-input:hover, 
                    .custom-input.ant-input:focus {
                        border-color: #f97316 !important;
                        box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15) !important;
                    }
                    
                    .custom-table .ant-table {
                        border-radius: 12px !important;
                        overflow: hidden !important;
                    }
                    
                    .custom-table .ant-table-thead > tr > th {
                        background: linear-gradient(to right, #f8fafc, rgba(249, 115, 22, 0.05)) !important;
                        border-bottom: 1px solid #e5e7eb !important;
                        font-weight: 600 !important;
                        color: #374151 !important;
                        padding: 16px 20px !important;
                    }
                    
                    .custom-table .ant-table-tbody > tr > td {
                        padding: 16px 20px !important;
                        border-bottom: 1px solid #f3f4f6 !important;
                    }
                    
                    .custom-table .ant-table-tbody > tr:hover > td {
                        background: rgba(249, 115, 22, 0.05) !important;
                    }
                    
                    .ant-btn-primary {
                        border-radius: 12px !important;
                        box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25) !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }
                    
                    .ant-btn-primary:hover {
                        transform: translateY(-1px) !important;
                        box-shadow: 0 6px 20px rgba(249, 115, 22, 0.35) !important;
                    }
                    
                    .custom-pagination .ant-pagination-item-active {
                        background: linear-gradient(to right, #f97316, #ea580c) !important;
                        border-color: #f97316 !important;
                    }
                    
                    .ant-input-number {
                        border-radius: 8px !important;
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.2s ease !important;
                        width: 100%;
                    }
                    
                    .ant-input-number:hover, 
                    .ant-input-number:focus-within {
                        border-color: #f97316 !important;
                        box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15) !important;
                    }
                `}</style>
            </div>
        </div>
    );
}

export default DmHeSoChungManagement;