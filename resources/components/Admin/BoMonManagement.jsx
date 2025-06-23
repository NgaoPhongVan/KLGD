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
    Tooltip
} from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    ApartmentOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    FilterOutlined,
    CloseCircleOutlined,
    SettingOutlined,
    DownloadOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Text, Title } = Typography;
const { confirm } = Modal;

function BoMonManagement() {
    const [form] = Form.useForm();
    const [boMonList, setBoMonList] = useState([]);
    const [khoaList, setKhoaList] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filterKhoa, setFilterKhoa] = useState("");
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
            fetchBoMon(1, pagination.per_page, searchValue, filterKhoa);
        }, 500),
        [pagination.per_page, filterKhoa]
    );

    useEffect(() => {
        fetchKhoa();
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
            fetchBoMon(1, pagination.per_page, "", filterKhoa);
        }
        
        return () => {
            if (debouncedSearch.cancel) {
                debouncedSearch.cancel();
            }
        };
    }, [searchTerm, debouncedSearch, pagination.per_page]);

    // Separate useEffect for filter changes
    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            current_page: 1,
        }));
        fetchBoMon(1, pagination.per_page, searchTerm, filterKhoa);
    }, [filterKhoa]);

    const fetchBoMon = async (page = pagination.current_page, perPage = pagination.per_page, search = searchTerm, khoaFilter = filterKhoa) => {
        setIsLoading(true);
        try {
            const params = {
                per_page: perPage,
                page: page,
            };

            if (search && search.trim() !== "") {
                params.search = search.trim();
            }

            if (khoaFilter) {
                params.khoa_id = khoaFilter;
            }

            const response = await axios.get("/api/admin/bo-mon", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: params,
            });

            setBoMonList(response.data.data || []);
            setPagination({
                current_page: response.data.pagination?.current_page || page,
                per_page: response.data.pagination?.per_page || perPage,
                total: response.data.pagination?.total || 0,
                last_page: response.data.pagination?.last_page || 1,
                from: response.data.pagination?.from || null,
                to: response.data.pagination?.to || null,
            });
        } catch (error) {
            console.error("Error fetching departments:", error);
            if (error.response?.status === 401) {
                message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            } else if (error.response?.status === 403) {
                message.error("Bạn không có quyền truy cập chức năng này.");
            } else if (error.response?.status === 422) {
                message.error("Dữ liệu tìm kiếm không hợp lệ.");
            } else if (error.response?.status >= 500) {
                message.error("Lỗi máy chủ. Vui lòng thử lại sau.");
            } else {
                message.error("Không thể tải dữ liệu bộ môn");
            }
            setBoMonList([]);
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }
    };

    const fetchKhoa = async () => {
        try {
            const response = await axios.get("/api/admin/khoa", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: {
                    per_page: 100,
                },
            });
            setKhoaList(response.data.data || []);
        } catch (error) {
            console.error("Error fetching faculties:", error);
            message.error("Không thể tải dữ liệu khoa");
        }
    };

    const handlePageChange = (page, pageSize) => {
        setPagination((prev) => ({
            ...prev,
            current_page: page,
            per_page: pageSize,
        }));
        fetchBoMon(page, pageSize, searchTerm, filterKhoa);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
    };

    const clearSearch = () => {
        setSearchTerm("");
        setIsSearching(false);
        setPagination((prev) => ({
            ...prev,
            current_page: 1,
        }));
        fetchBoMon(1, pagination.per_page, "", filterKhoa);
    };

    const clearFilter = () => {
        setFilterKhoa("");
    };

    const clearAll = () => {
        setSearchTerm("");
        setFilterKhoa("");
        setIsSearching(false);
        setPagination((prev) => ({
            ...prev,
            current_page: 1,
        }));
        fetchBoMon(1, pagination.per_page, "", "");
    };

    const handleSubmit = async (values) => {
        setIsLoading(true);
        try {
            if (editingId) {
                await axios.put(`/api/admin/bo-mon/${editingId}`, values, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                message.success("Cập nhật bộ môn thành công");
            } else {
                await axios.post("/api/admin/bo-mon", values, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                message.success("Thêm bộ môn mới thành công");
            }
            fetchBoMon();
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

    const handleEdit = (boMon) => {
        form.setFieldsValue({
            ma_bo_mon: boMon.ma_bo_mon,
            ten_bo_mon: boMon.ten_bo_mon,
            khoa_id: boMon.khoa_id?.toString() || "",
        });
        setEditingId(boMon.id);
    };

    const handleDelete = (id) => {
        console.log("handleDelete called with id:", id); // Debug log
        
        if (!id) {
            console.error("ID is null or undefined");
            message.error("Không thể xác định bộ môn cần xóa");
            return;
        }

        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        console.log("Confirm delete clicked, deleting ID:", deletingId); // Debug log
        
        if (!deletingId) {
            message.error("Không thể xác định bộ môn cần xóa");
            return;
        }

        setIsDeleting(true);
        
        try {
            console.log("Making DELETE request to:", `/api/admin/bo-mon/${deletingId}`); // Debug log
            
            const response = await axios.delete(`/api/admin/bo-mon/${deletingId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            
            console.log("Delete response:", response); // Debug log
            message.success("Xóa bộ môn thành công");
            
            // Close modal and reset state
            setDeleteModalVisible(false);
            setDeletingId(null);
            
            // Refresh data after successful deletion
            await fetchBoMon();
            
        } catch (error) {
            console.error("Delete error:", error);
            
            let errorMessage = "Có lỗi xảy ra khi xóa bộ môn";
            
            if (error.response?.status === 401) {
                errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
            } else if (error.response?.status === 403) {
                errorMessage = "Bạn không có quyền xóa bộ môn này.";
            } else if (error.response?.status === 404) {
                errorMessage = "Bộ môn không tồn tại hoặc đã được xóa.";
                // Refresh data to update the list
                await fetchBoMon();
            } else if (error.response?.status === 422) {
                errorMessage = error.response?.data?.message || "Không thể xóa bộ môn này vì đã có giảng viên liên kết!";
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
        console.log("Delete cancelled"); // Debug log
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
            const response = await axios.post("/api/admin/bo-mon/import", formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            message.success(response.data.message);
            fetchBoMon();
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
            return false; // Prevent auto upload
        },
        onRemove: () => {
            setFile(null);
        },
        fileList: file ? [file] : [],
    };

    const downloadSampleFile = () => {
        // Tạo dữ liệu mẫu CSV với cấu trúc đúng cho bộ môn
        const csvHeaders = [
            'ma_bo_mon',
            'ten_bo_mon',
            'khoa_id'
        ];

        // Dữ liệu mẫu với các giá trị ví dụ
        const sampleData = [
            [
                'CNTT',
                'Công nghệ Thông tin',
                '1'
            ],
            [
                'KTPM', 
                'Kỹ thuật Phần mềm',
                '1'
            ],
            [
                'HTTT',
                'Hệ thống Thông tin',
                '1'
            ],
            [
                'QTKD',
                'Quản trị Kinh doanh',
                '2'
            ],
            [
                'KT',
                'Kế toán',
                '2'
            ],
            [
                'XDDD',
                'Xây dựng Dân dụng',
                '3'
            ],
            [
                'XDGT',
                'Xây dựng Giao thông',
                '3'
            ]
        ];

        // Tạo nội dung CSV
        const csvContent = [
            csvHeaders.join(','),
            ...sampleData.map(row => row.join(','))
        ].join('\n');

        // Thêm BOM để hỗ trợ UTF-8 trong Excel
        const BOM = '\uFEFF';
        const finalContent = BOM + csvContent;

        // Tạo và tải xuống file
        const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'mau_danh_sach_bo_mon.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        message.success('Đã tải xuống file mẫu thành công!');
    };

    const columns = [
        {
            title: 'Thông tin bộ môn',
            key: 'bo_mon_info',
            width: 320,
            render: (_, record) => (
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center border border-purple-200/50">
                        <Text className="text-sm font-medium text-purple-600">
                            {record.ma_bo_mon?.charAt(0) || "B"}
                        </Text>
                    </div>
                    <div className="min-w-0 flex-1">
                        <Text className="text-sm font-medium text-gray-800 block truncate">
                            {record.ten_bo_mon}
                        </Text>
                        <Text className="text-xs text-gray-500 block truncate">
                            Mã: {record.ma_bo_mon}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Khoa',
            dataIndex: ['khoa', 'ten_khoa'],
            key: 'khoa',
            width: 200,
            render: (khoaName) => (
                <Tag color="blue" className="font-medium">
                    {khoaName || 'N/A'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => {
                console.log("Rendering action buttons for record:", record); // Debug log
                return (
                    <Space>
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log("Edit button clicked for:", record);
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
                                    console.log("Delete button clicked for record ID:", record.id);
                                    handleDelete(record.id);
                                }}
                                className="text-red-600 hover:bg-red-50"
                                disabled={isLoading}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 relative">
            {/* Enhanced background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-8 space-y-6">
                {/* Enhanced Header */}
                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <ApartmentOutlined className="text-2xl text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-md"></div>
                            </div>
                            <div className="space-y-2">
                                <Title level={2} style={{ margin: 0 }} className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
                                    Quản lý bộ môn
                                </Title>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                    <Text type="secondary">Quản lý danh sách bộ môn theo khoa</Text>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <span>Dashboard</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-purple-600 font-medium">Quản lý bộ môn</span>
                        </div>
                    </div>
                </Card>

                {/* Enhanced Search and Filter Section */}
                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                <SearchOutlined className="text-white text-lg" />
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>Tìm kiếm và lọc bộ môn</Title>
                                <Text type="secondary" className="text-sm">Tìm kiếm theo tên, mã bộ môn hoặc lọc theo khoa</Text>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <Row gutter={[24, 24]}>
                            <Col xs={24} lg={16}>
                                <Input
                                    size="large"
                                    placeholder="Tìm kiếm theo tên bộ môn, mã bộ môn..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="custom-input"
                                    allowClear={{
                                        clearIcon: searchTerm ? (
                                            <Button
                                                type="text"
                                                size="small"
                                                onClick={clearSearch}
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
                            <Col xs={24} lg={8}>
                                <Select
                                    size="large"
                                    placeholder="Lọc theo khoa"
                                    value={filterKhoa}
                                    onChange={setFilterKhoa}
                                    allowClear
                                    className="custom-select w-full"
                                >
                                    <Option value="">Tất cả khoa</Option>
                                    {khoaList.map((khoa) => (
                                        <Option key={khoa.id} value={khoa.id}>
                                            {khoa.ten_khoa}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>
                        
                        {(searchTerm || filterKhoa) && (
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                    {isSearching ? "Đang tìm kiếm..." : 
                                     searchTerm ? `Tìm kiếm với từ khóa: "${searchTerm}"` : ""}
                                    {searchTerm && filterKhoa && " • "}
                                    {filterKhoa && `Lọc theo khoa: ${khoaList.find(k => k.id == filterKhoa)?.ten_khoa || ""}`}
                                </div>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={clearAll}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Xóa tất cả bộ lọc
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Enhanced Form Section */}
                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-slate-50 via-purple-50/50 to-indigo-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                {editingId ? <EditOutlined className="text-white text-lg" /> : <PlusOutlined className="text-white text-lg" />}
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {editingId ? "Cập nhật thông tin bộ môn" : "Thêm bộ môn mới"}
                                </Title>
                                <Text type="secondary" className="text-sm">
                                    {editingId ? "Chỉnh sửa thông tin bộ môn hiện tại" : "Tạo bộ môn mới cho hệ thống"}
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
                                    name="ma_bo_mon"
                                    label={<Text strong>Mã bộ môn</Text>}
                                    rules={[{ required: true, message: 'Vui lòng nhập mã bộ môn' }]}
                                >
                                    <Input
                                        size="large"
                                        placeholder="Nhập mã bộ môn"
                                        className="custom-input"
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={8}>
                                <Form.Item
                                    name="ten_bo_mon"
                                    label={<Text strong>Tên bộ môn</Text>}
                                    rules={[{ required: true, message: 'Vui lòng nhập tên bộ môn' }]}
                                >
                                    <Input
                                        size="large"
                                        placeholder="Nhập tên bộ môn"
                                        className="custom-input"
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={8}>
                                <Form.Item
                                    name="khoa_id"
                                    label={<Text strong>Khoa</Text>}
                                    rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
                                >
                                    <Select
                                        size="large"
                                        placeholder="Chọn khoa"
                                        className="custom-select"
                                        showSearch
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {khoaList.map((khoa) => (
                                            <Option key={khoa.id} value={khoa.id}>
                                                {khoa.ten_khoa}
                                            </Option>
                                        ))}
                                    </Select>
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
                                className="px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0 rounded-xl shadow-lg hover:shadow-xl"
                            >
                                {editingId ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </div>
                    </Form>
                </Card>

                {/* Enhanced Import Section */}
                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-slate-50 via-emerald-50/50 to-teal-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                <UploadOutlined className="text-white text-lg" />
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>Nhập dữ liệu từ file</Title>
                                <Text type="secondary" className="text-sm">Tải lên file Excel hoặc CSV để thêm nhiều bộ môn</Text>
                            </div>
                        </div>
                    </div>

                    <Row gutter={[24, 24]} align="middle">
                        <Col xs={24} lg={16}>
                            <Upload {...uploadProps} maxCount={1}>
                                <Button
                                    size="large"
                                    icon={<UploadOutlined />}
                                    className="w-full h-12 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-xl"
                                >
                                    {file ? "Thay đổi file" : "Chọn file để tải lên"}
                                </Button>
                            </Upload>

                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start">
                                    <InfoCircleOutlined className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                                    <div className="text-xs text-blue-800 flex-1">
                                        <Text strong className="block">Định dạng hỗ trợ: .xlsx, .xls, .csv</Text>
                                        <Text className="block mt-1">File phải có cấu trúc đúng với các cột: ma_bo_mon, ten_bo_mon, khoa_id</Text>
                                        <div className="mt-3 flex items-center justify-between">
                                            <Text className="text-blue-700">
                                                <strong>Lưu ý:</strong> khoa_id phải tồn tại trong hệ thống (ID của khoa)
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

                            {/* Additional help section */}
                            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="flex items-start">
                                    <div className="w-4 h-4 bg-amber-400 rounded-full mt-0.5 mr-2 flex-shrink-0"></div>
                                    <div className="text-xs text-amber-800">
                                        <Text strong className="block">Hướng dẫn sử dụng file mẫu:</Text>
                                        <ul className="list-disc list-inside mt-1 space-y-1">
                                            <li>Tải xuống file mẫu để xem cấu trúc chính xác</li>
                                            <li>Thay thế dữ liệu mẫu bằng thông tin thực tế</li>
                                            <li>Đảm bảo khoa_id tương ứng với ID khoa trong hệ thống</li>
                                            <li>Mã bộ môn phải duy nhất và không trùng lặp</li>
                                            <li>Không thay đổi tên các cột</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Khoa reference section */}
                            {khoaList.length > 0 && (
                                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-start">
                                        <div className="w-4 h-4 bg-green-400 rounded-full mt-0.5 mr-2 flex-shrink-0"></div>
                                        <div className="text-xs text-green-800">
                                            <Text strong className="block">Danh sách ID khoa hiện tại:</Text>
                                            <div className="mt-2 grid grid-cols-2 gap-2">
                                                {khoaList.slice(0, 6).map((khoa) => (
                                                    <div key={khoa.id} className="flex items-center space-x-1">
                                                        <span className="font-mono text-green-700">{khoa.id}:</span>
                                                        <span className="truncate">{khoa.ten_khoa}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {khoaList.length > 6 && (
                                                <Text className="text-green-600 text-xs mt-1">
                                                    và {khoaList.length - 6} khoa khác...
                                                </Text>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-0 rounded-xl shadow-lg hover:shadow-xl"
                                >
                                    Nhập dữ liệu
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Enhanced BoMon Table */}
                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-slate-50 via-purple-50/50 to-indigo-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                    <ApartmentOutlined className="text-white text-lg" />
                                </div>
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>Danh sách bộ môn</Title>
                                    <Text type="secondary" className="text-sm">
                                        {searchTerm || filterKhoa ? (
                                            `${pagination.total} kết quả ${searchTerm ? 'tìm kiếm' : 'lọc'}`
                                        ) : (
                                            `${pagination.total} bộ môn trong hệ thống`
                                        )}
                                    </Text>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {(searchTerm || filterKhoa) && (
                                    <Button
                                        type="default"
                                        size="middle"
                                        onClick={clearAll}
                                        className="px-4 py-2 h-9 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-600 hover:from-red-100 hover:to-pink-100 hover:border-red-300 hover:text-red-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                        icon={<CloseCircleOutlined />}
                                    >
                                        Xóa bộ lọc
                                    </Button>
                                )}
                                
                                <Button
                                    type="default"
                                    size="middle"
                                    onClick={() => fetchBoMon()}
                                    loading={isLoading}
                                    className="px-4 py-2 h-9 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 hover:text-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                    icon={<SettingOutlined />}
                                >
                                    Làm mới
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={boMonList}
                        loading={isLoading}
                        pagination={false}
                        rowKey="id"
                        className="custom-table"
                        locale={{
                            emptyText: (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <ApartmentOutlined className="text-2xl text-gray-400" />
                                    </div>
                                    <Text className="text-gray-500 font-medium text-lg block">
                                        {searchTerm ? `Không tìm thấy bộ môn với từ khóa "${searchTerm}"` : 
                                         filterKhoa ? "Không có bộ môn nào thuộc khoa này" : 
                                         "Chưa có bộ môn nào"}
                                    </Text>
                                    <Text className="text-gray-400 text-sm">
                                        {searchTerm || filterKhoa ? (
                                            <>
                                                Thử điều chỉnh từ khóa tìm kiếm hoặc{" "}
                                                <Button 
                                                    type="link" 
                                                    size="small" 
                                                    onClick={clearAll}
                                                    className="p-0 h-auto"
                                                >
                                                    xóa bộ lọc
                                                </Button>
                                            </>
                                        ) : (
                                            "Thêm bộ môn mới để bắt đầu"
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
                                {(searchTerm || filterKhoa) && (
                                    <span className="ml-2 text-blue-600">
                                        ({searchTerm && `tìm kiếm: "${searchTerm}"`}
                                        {searchTerm && filterKhoa && " • "}
                                        {filterKhoa && `khoa: ${khoaList.find(k => k.id == filterKhoa)?.ten_khoa || ""}`})
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

                {/* Delete Confirmation Modal */}
                <Modal
                    title={
                        <div className="flex items-center">
                            <ExclamationCircleOutlined className="text-red-500 mr-2" />
                            <span>Xác nhận xóa bộ môn</span>
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
                    <p>Bạn có chắc chắn muốn xóa bộ môn này? Hành động này không thể hoàn tác.</p>
                </Modal>

                {/* Enhanced Custom Styles */}
                <style>{`
                    /* Base Ant Design Component Styles */
                    .custom-select .ant-select-selector {
                        border-radius: 8px !important;
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.2s ease !important;
                    }
                    
                    .custom-select .ant-select-selector:hover {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
                    }
                    
                    .custom-input.ant-input {
                        border-radius: 8px !important;
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.2s ease !important;
                    }
                    
                    .custom-input.ant-input:hover, 
                    .custom-input.ant-input:focus {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
                    }
                    
                    /* Table styling */
                    .custom-table .ant-table {
                        border-radius: 12px !important;
                        overflow: hidden !important;
                    }
                    
                    .custom-table .ant-table-thead > tr > th {
                        background: linear-gradient(to right, #f8fafc, rgba(59, 130, 246, 0.05)) !important;
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
                        background: rgba(59, 130, 246, 0.05) !important;
                    }
                    
                    /* Button styling enhancements */
                    .ant-btn-primary {
                        border-radius: 12px !important;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25) !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }
                    
                    .ant-btn-primary:hover {
                        transform: translateY(-1px) !important;
                        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35) !important;
                    }
                    
                    .ant-btn-default {
                        border-radius: 12px !important;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }
                    
                    .ant-btn-default:hover {
                        transform: translateY(-1px) !important;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
                    }
                    
                    /* Pagination styling */
                    .custom-pagination .ant-pagination-item {
                        border-radius: 8px !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                    
                    .custom-pagination .ant-pagination-item-active {
                        background: linear-gradient(to right, #3b82f6, #1d4ed8) !important;
                        border-color: #3b82f6 !important;
                    }
                    
                    .custom-pagination .ant-pagination-item-active a {
                        color: white !important;
                    }
                    
                    /* Upload styling */
                    .ant-upload-list-item {
                        border-radius: 8px !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                    
                    /* Form styling */
                    .ant-form-item-label > label {
                        font-weight: 500 !important;
                        color: #374151 !important;
                    }
                    
                    /* Tag styling */
                    .ant-tag {
                        border-radius: 6px !important;
                        font-weight: 500 !important;
                        padding: 2px 8px !important;
                    }
                `}</style>
            </div>
        </div>
    );
}

export default BoMonManagement;
