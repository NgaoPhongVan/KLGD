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
    UserOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    FilterOutlined,
    CloseCircleOutlined,
    SettingOutlined,
    DownloadOutlined,
    DollarOutlined,
    BankOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Text, Title } = Typography;
const { TextArea } = Input;

function LuongGiangVienManagement() {
    const [form] = Form.useForm();
    const [luongList, setLuongList] = useState([]);
    const [nguoiDungList, setNguoiDungList] = useState([]);
    const [namHocList, setNamHocList] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filterNamHoc, setFilterNamHoc] = useState("");
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
            fetchLuong(1, pagination.per_page, searchValue, filterNamHoc);
        }, 500),
        [pagination.per_page, filterNamHoc]
    );

    useEffect(() => {
        fetchNguoiDung();
        fetchNamHoc();
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
            fetchLuong(1, pagination.per_page, "", filterNamHoc);
        }
        
        return () => {
            if (debouncedSearch.cancel) {
                debouncedSearch.cancel();
            }
        };
    }, [searchTerm, debouncedSearch, pagination.per_page]);

    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            current_page: 1,
        }));
        fetchLuong(1, pagination.per_page, searchTerm, filterNamHoc);
    }, [filterNamHoc]);

    const fetchLuong = async (page = pagination.current_page, perPage = pagination.per_page, search = searchTerm, namHocFilter = filterNamHoc) => {
        setIsLoading(true);
        try {
            const params = {
                per_page: perPage,
                page: page,
            };

            if (search && search.trim() !== "") {
                params.search_gv = search.trim();
            }

            if (namHocFilter) {
                params.nam_hoc_id = namHocFilter;
            }

            const response = await axios.get("/api/admin/luong-giang-vien", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: params,
            });

            setLuongList(response.data.data || []);
            setPagination({
                current_page: response.data.pagination?.current_page || page,
                per_page: response.data.pagination?.per_page || perPage,
                total: response.data.pagination?.total || 0,
                last_page: response.data.pagination?.last_page || 1,
                from: response.data.pagination?.from || null,
                to: response.data.pagination?.to || null,
            });
        } catch (error) {
            console.error("Error fetching luong data:", error);
            if (error.response?.status === 401) {
                message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            } else if (error.response?.status === 403) {
                message.error("Bạn không có quyền truy cập chức năng này.");
            } else if (error.response?.status === 422) {
                message.error("Dữ liệu tìm kiếm không hợp lệ.");
            } else if (error.response?.status >= 500) {
                message.error("Lỗi máy chủ. Vui lòng thử lại sau.");
            } else {
                message.error("Không thể tải dữ liệu lương giảng viên");
            }
            setLuongList([]);
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }
    };

    const fetchNguoiDung = async () => {
        try {
            const response = await axios.get("/api/admin/users", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: {
                    per_page: 1000,
                },
            });
            setNguoiDungList(response.data.data.filter(u => parseInt(u.vai_tro) === 3));
        } catch (error) {
            message.error("Không thể tải dữ liệu người dùng");
        }
    };

    const fetchNamHoc = async () => {
        try {
            const response = await axios.get("/api/admin/nam-hoc", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: {
                    per_page: 100,
                },
            });
            setNamHocList(response.data.data);
        } catch (error) {
            console.error('Error fetching nam hoc:', error);
            message.error("Không thể tải dữ liệu năm học");
        }
    };

    const handlePageChange = (page, pageSize) => {
        setPagination((prev) => ({
            ...prev,
            current_page: page,
            per_page: pageSize,
        }));
        fetchLuong(page, pageSize, searchTerm, filterNamHoc);
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
        fetchLuong(1, pagination.per_page, "", filterNamHoc);
    };

    const clearAll = () => {
        setSearchTerm("");
        setFilterNamHoc("");
        setIsSearching(false);
        setPagination((prev) => ({
            ...prev,
            current_page: 1,
        }));
        fetchLuong(1, pagination.per_page, "", "");
    };    const handleSubmit = async (values) => {
        setIsLoading(true);
        try {
            const submitData = {
                ...values,
                muc_luong_co_ban: values.muc_luong_co_ban || 0,
                tong_gio_chuan_thuc_hien: values.tong_gio_chuan_thuc_hien || 0,
                so_gio_vuot_muc: values.so_gio_vuot_muc || 0,
                don_gia_gio_vuot_muc: values.don_gia_gio_vuot_muc || 0,
                tong_tien_luong_vuot_gio: values.tong_tien_luong_vuot_gio || 0,
                thanh_tien_nam: values.thanh_tien_nam || 0,
            };

            if (editingId) {
                await axios.put(`/api/admin/luong-giang-vien/${editingId}`, submitData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                message.success("Cập nhật lương giảng viên thành công");
            } else {
                await axios.post("/api/admin/luong-giang-vien", submitData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                message.success("Thêm lương giảng viên mới thành công");
            }
            fetchLuong();
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
    };    const handleEdit = (luong) => {
        form.setFieldsValue({
            nguoi_dung_id: luong.nguoi_dung_id?.toString() || "",
            nam_hoc_id: luong.nam_hoc_id?.toString() || "",
            muc_luong_co_ban: luong.muc_luong_co_ban,
            tong_gio_chuan_thuc_hien: luong.tong_gio_chuan_thuc_hien,
            so_gio_vuot_muc: luong.so_gio_vuot_muc,
            don_gia_gio_vuot_muc: luong.don_gia_gio_vuot_muc,
            tong_tien_luong_vuot_gio: luong.tong_tien_luong_vuot_gio,
            thanh_tien_nam: luong.thanh_tien_nam,
            ghi_chu: luong.ghi_chu,
        });
        setEditingId(luong.id);
    };

    const handleDelete = (id) => {
        if (!id) {
            message.error("Không thể xác định lương cần xóa");
            return;
        }
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!deletingId) {
            message.error("Không thể xác định lương cần xóa");
            return;
        }

        setIsDeleting(true);
        
        try {
            await axios.delete(`/api/admin/luong-giang-vien/${deletingId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            
            message.success("Xóa lương giảng viên thành công");
            setDeleteModalVisible(false);
            setDeletingId(null);
            await fetchLuong();
            
        } catch (error) {
            console.error("Delete error:", error);
            
            let errorMessage = "Có lỗi xảy ra khi xóa lương giảng viên";
            
            if (error.response?.status === 401) {
                errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
            } else if (error.response?.status === 403) {
                errorMessage = "Bạn không có quyền xóa lương này.";
            } else if (error.response?.status === 404) {
                errorMessage = "Lương không tồn tại hoặc đã được xóa.";
                await fetchLuong();
            } else if (error.response?.status === 422) {
                errorMessage = error.response?.data?.message || "Không thể xóa lương này!";
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
        formData.append("file", file);        try {
            const response = await axios.post("/api/admin/luong-giang-vien/import", formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            message.success(response.data.message);
            fetchLuong();
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
    };    const downloadSampleFile = () => {
        const csvHeaders = [
            'nguoi_dung_id',
            'nam_hoc_id',
            'muc_luong_co_ban',
            'tong_gio_chuan_thuc_hien',
            'so_gio_vuot_muc',
            'don_gia_gio_vuot_muc',
            'tong_tien_luong_vuot_gio',
            'thanh_tien_nam',
            'ghi_chu'
        ];

        const sampleData = [
            [
                '1',
                '1',
                '15000000',
                '300',
                '10',
                '150000',
                '1500000',
                '16500000',
                'Lương năm học 2024-2025'
            ],
            [
                '2',
                '1',
                '12000000',
                '280',
                '5',
                '150000',
                '750000',
                '12750000',
                'Lương năm học 2024-2025'
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
        link.setAttribute('download', 'mau_luong_giang_vien.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        message.success('Đã tải xuống file mẫu thành công!');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount || 0);
    };    const calculateTotalSalary = (luong) => {
        const mucLuongCoBan = parseFloat(luong.muc_luong_co_ban) || 0;
        const tongGioChuan = parseFloat(luong.tong_gio_chuan_thuc_hien) || 0;
        const soGioVuot = parseFloat(luong.so_gio_vuot_muc) || 0;
        const donGiaGioVuot = parseFloat(luong.don_gia_gio_vuot_muc) || 0;
        const tongTienVuotGio = parseFloat(luong.tong_tien_luong_vuot_gio) || 0;
        const thanhTienNam = parseFloat(luong.thanh_tien_nam) || 0;

        if (thanhTienNam > 0) {
            return thanhTienNam;
        }

        const tienVuotGio = soGioVuot * donGiaGioVuot;
        const total = mucLuongCoBan + tienVuotGio;

        return total;
    };

    const columns = [
        {
            title: 'Thông tin giảng viên',
            key: 'giang_vien_info',
            width: 250,
            render: (_, record) => (
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center border border-blue-200/50">
                        <UserOutlined className="text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <Text className="text-sm font-medium text-gray-800 block truncate">
                            {record.nguoi_dung?.ho_ten || 'N/A'}
                        </Text>
                        <Text className="text-xs text-gray-500 block truncate">
                            Mã: {record.nguoi_dung?.ma_gv || 'N/A'}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Năm học',
            dataIndex: ['nam_hoc', 'ten_nam_hoc'],
            key: 'nam_hoc',
            width: 100,
            render: (namHoc) => (
                <Tag color="blue" className="font-medium">
                    {namHoc || 'N/A'}
                </Tag>
            ),
        },        {
            title: 'Lương cơ bản',
            dataIndex: 'muc_luong_co_ban',
            key: 'muc_luong_co_ban',
            width: 130,
            align: 'right',
            render: (value) => (
                <div className="flex items-center justify-end space-x-1">
                    <BankOutlined className="text-green-500 text-xs" />
                    <Text className="font-semibold text-green-600 text-xs">
                        {formatCurrency(value)}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Giờ chuẩn',
            dataIndex: 'tong_gio_chuan_thuc_hien',
            key: 'tong_gio_chuan_thuc_hien',
            width: 80,
            align: 'center',
            render: (value) => (
                <Tag color="blue" className="font-medium">
                    {value || 0}h
                </Tag>
            ),
        },
        {
            title: 'Giờ vượt',
            dataIndex: 'so_gio_vuot_muc',
            key: 'so_gio_vuot_muc',
            width: 80,
            align: 'center',
            render: (value) => (
                <Text className="text-xs font-medium text-purple-600">
                    {value || 0}h
                </Text>
            ),
        },
        {
            title: 'Tổng lương',
            key: 'tong_luong',
            width: 150,
            align: 'right',
            render: (_, record) => (
                <div className="flex items-center justify-end space-x-1">
                    <DollarOutlined className="text-emerald-500 text-xs" />
                    <Text className="font-bold text-emerald-600 text-sm">
                        {formatCurrency(calculateTotalSalary(record))}
                    </Text>
                </div>
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-8 space-y-6">
                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <DollarOutlined className="text-2xl text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-md"></div>
                            </div>
                            <div className="space-y-2">
                                <Title level={2} style={{ margin: 0 }} className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
                                    Quản lý lương giảng viên
                                </Title>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                    <Text type="secondary" className="text-sm">Quản lý thông tin lương và phụ cấp giảng viên</Text>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <span>Dashboard</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-emerald-600 font-medium">Lương giảng viên</span>
                        </div>
                    </div>
                </Card>

                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                <SearchOutlined className="text-white text-lg" />
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>Tìm kiếm và lọc lương</Title>
                                <Text type="secondary" className="text-sm">Tìm kiếm theo tên giảng viên hoặc lọc theo năm học</Text>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <Row gutter={[24, 24]}>
                            <Col xs={24} lg={16}>
                                <Input
                                    size="large"
                                    placeholder="Tìm kiếm theo tên giảng viên, mã giảng viên..."
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
                                    placeholder="Lọc theo năm học"
                                    value={filterNamHoc}
                                    onChange={setFilterNamHoc}
                                    allowClear
                                    className="custom-select w-full"
                                >
                                    <Option value="">Tất cả năm học</Option>
                                    {namHocList.map((namHoc) => (
                                        <Option key={namHoc.id} value={namHoc.id}>
                                            {namHoc.ten_nam_hoc}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>
                        
                        {(searchTerm || filterNamHoc) && (
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                    {isSearching ? "Đang tìm kiếm..." : 
                                     searchTerm ? `Tìm kiếm với từ khóa: "${searchTerm}"` : ""}
                                    {searchTerm && filterNamHoc && " • "}
                                    {filterNamHoc && `Lọc theo năm học: ${namHocList.find(k => k.id == filterNamHoc)?.ten_nam_hoc || ""}`}
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
                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-emerald-50 via-green-50/50 to-teal-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                {editingId ? <EditOutlined className="text-white text-lg" /> : <PlusOutlined className="text-white text-lg" />}
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {editingId ? "Chỉnh sửa thông tin lương" : "Thêm thông tin lương mới"}
                                </Title>
                                <Text type="secondary" className="text-sm">
                                    {editingId ? "Cập nhật thông tin lương giảng viên" : "Nhập thông tin lương cho giảng viên"}
                                </Text>
                            </div>
                        </div>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        size="large"
                        className="space-y-6"
                    >
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<Text strong>Giảng viên</Text>}
                                    name="nguoi_dung_id"
                                    rules={[{ required: true, message: "Vui lòng chọn giảng viên!" }]}
                                >
                                    <Select
                                        placeholder="Chọn giảng viên"
                                        showSearch
                                        filterOption={(input, option) => {
                                            const user = nguoiDungList.find(u => u.id == option.value);
                                            if (!user) return false;
                                            const searchText = `${user.ho_ten} ${user.ma_gv}`.toLowerCase();
                                            return searchText.includes(input.toLowerCase());
                                        }}
                                        className="custom-select"
                                    >
                                        {nguoiDungList.map((user) => (
                                            <Option key={user.id} value={user.id}>
                                                {user.ho_ten} ({user.ma_gv})
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<Text strong>Năm học</Text>}
                                    name="nam_hoc_id"
                                    rules={[{ required: true, message: "Vui lòng chọn năm học!" }]}
                                >
                                    <Select placeholder="Chọn năm học" className="custom-select">
                                        {namHocList.map((namHoc) => (
                                            <Option key={namHoc.id} value={namHoc.id}>
                                                {namHoc.ten_nam_hoc}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<Text strong>Mức lương cơ bản (VNĐ)</Text>}
                                    name="muc_luong_co_ban"
                                    rules={[{ required: true, message: "Vui lòng nhập mức lương cơ bản!" }]}
                                >
                                    <InputNumber
                                        placeholder="Nhập mức lương cơ bản"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        min={0}
                                        className="w-full"
                                    />
                                </Form.Item>
                            </Col>
                            {/* <Col xs={24} md={12}>
                                <Form.Item
                                    label={<Text strong>Tổng giờ chuẩn thực hiện</Text>}
                                    name="tong_gio_chuan_thuc_hien"
                                >
                                    <InputNumber
                                        placeholder="Nhập số giờ chuẩn"
                                        min={0}
                                        step={0.1}
                                        precision={1}
                                        className="w-full"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<Text strong>Số giờ vượt mức</Text>}
                                    name="so_gio_vuot_muc"
                                >
                                    <InputNumber
                                        placeholder="Nhập số giờ vượt mức"
                                        min={0}
                                        step={0.1}
                                        precision={1}
                                        className="w-full"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<Text strong>Đơn giá giờ vượt mức (VNĐ)</Text>}
                                    name="don_gia_gio_vuot_muc"
                                >
                                    <InputNumber
                                        placeholder="Nhập đơn giá giờ vượt"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        min={0}
                                        className="w-full"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<Text strong>Tổng tiền lương vượt giờ (VNĐ)</Text>}
                                    name="tong_tien_luong_vuot_gio"
                                >
                                    <InputNumber
                                        placeholder="Nhập tổng tiền vượt giờ"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        min={0}
                                        className="w-full"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<Text strong>Thành tiền năm (VNĐ)</Text>}
                                    name="thanh_tien_nam"
                                >
                                    <InputNumber
                                        placeholder="Nhập thành tiền năm"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        min={0}
                                        className="w-full"
                                    />
                                </Form.Item>
                            </Col> */}
                            <Col xs={24}>
                                <Form.Item label={<Text strong>Ghi chú</Text>} name="ghi_chu">
                                    <TextArea
                                        placeholder="Nhập ghi chú (tùy chọn)"
                                        rows={3}
                                        className="custom-input"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider />

                        <div className="flex justify-end space-x-3">
                            {editingId && (
                                <Button
                                    onClick={() => {
                                        form.resetFields();
                                        setEditingId(null);
                                    }}
                                    size="large"
                                    className="px-6"
                                >
                                    Hủy chỉnh sửa
                                </Button>
                            )}
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isLoading}
                                size="large"
                                icon={editingId ? <EditOutlined /> : <PlusOutlined />}
                                className="px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-0 rounded-xl shadow-lg hover:shadow-xl"
                            >
                                {editingId ? "Cập nhật lương" : "Thêm lương"}
                            </Button>
                        </div>
                    </Form>
                </Card>

                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-orange-50 via-yellow-50/50 to-amber-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                    <UploadOutlined className="text-white text-lg" />
                                </div>
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>Nhập dữ liệu từ Excel</Title>
                                    <Text type="secondary" className="text-sm">Tải lên file Excel để nhập hàng loạt</Text>
                                </div>
                            </div>
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={downloadSampleFile}
                                className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-orange-600 hover:from-orange-100 hover:to-amber-100 hover:border-orange-300 hover:text-orange-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                Tải file mẫu
                            </Button>
                        </div>
                    </div>

                    <Row gutter={[24, 24]} align="middle">
                        <Col xs={24} lg={16}>
                            <Upload {...uploadProps} className="w-full">
                                <Button
                                    icon={<UploadOutlined />}
                                    size="large"
                                    className="w-full h-16 border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-xl bg-gray-50 hover:bg-gray-100"
                                >
                                    <div>
                                        <div className="text-base font-medium">
                                            {file ? `Đã chọn: ${file.name}` : "Chọn file Excel"}
                                        </div>
                                        <div className="text-sm text-gray-500">Hỗ trợ .xlsx, .xls, .csv</div>
                                    </div>
                                </Button>
                            </Upload>

                            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex items-start">
                                    <InfoCircleOutlined className="text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                                    <div className="text-xs text-orange-800 flex-1">
                                        <Text strong className="block">Định dạng hỗ trợ: .xlsx, .xls, .csv</Text>
                                        <Text className="block mt-1">File phải có cấu trúc đúng với các cột: nguoi_dung_id, nam_hoc_id, muc_luong_co_ban, tong_gio_chuan_thuc_hien, so_gio_vuot_muc, don_gia_gio_vuot_muc, tong_tien_luong_vuot_gio, thanh_tien_nam, ghi_chu</Text>
                                        <Text className="text-orange-700 mt-2 block">
                                            <strong>Lưu ý:</strong> ID phải tồn tại trong hệ thống
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} lg={8}>
                            <Button
                                type="primary"
                                onClick={handleImport}
                                loading={isLoading}
                                disabled={!file}
                                size="large"
                                className="w-full h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 border-0 rounded-xl shadow-lg hover:shadow-xl"
                                icon={<UploadOutlined />}
                            >
                                Nhập dữ liệu
                            </Button>
                        </Col>
                    </Row>
                </Card>

                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-indigo-50 via-purple-50/50 to-pink-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                    <DollarOutlined className="text-white text-lg" />
                                </div>
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>Danh sách lương giảng viên</Title>
                                    <Text type="secondary" className="text-sm">
                                        {searchTerm || filterNamHoc ? (
                                            `${pagination.total} kết quả ${searchTerm ? 'tìm kiếm' : 'lọc'}`
                                        ) : (
                                            `${pagination.total} bản ghi trong hệ thống`
                                        )}
                                    </Text>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {(searchTerm || filterNamHoc) && (
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
                                    onClick={() => fetchLuong()}
                                    loading={isLoading}
                                    className="px-4 py-2 h-9 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-600 hover:from-emerald-100 hover:to-teal-100 hover:border-emerald-300 hover:text-emerald-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                    icon={<SettingOutlined />}
                                >
                                    Làm mới
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Spin spinning={isLoading}>
                        <Table
                            columns={columns}
                            dataSource={luongList}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 1200 }}
                            className="custom-table"
                            locale={{
                                emptyText: (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <DollarOutlined className="text-2xl text-gray-400" />
                                        </div>
                                        <Text className="text-gray-500 font-medium text-lg block">
                                            {searchTerm ? `Không tìm thấy lương với từ khóa "${searchTerm}"` : 
                                             filterNamHoc ? "Không có lương nào trong năm học này" : 
                                             "Chưa có dữ liệu lương"}
                                        </Text>
                                        <Text className="text-gray-400 text-sm">
                                            {searchTerm || filterNamHoc ? (
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
                                                "Thêm thông tin lương mới để bắt đầu"
                                            )}
                                        </Text>
                                    </div>
                                )
                            }}
                        />
                    </Spin>

                    {pagination.total > 0 && (
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                                Hiển thị <Text strong>{pagination.from}</Text> đến <Text strong>{pagination.to}</Text> trên <Text strong>{pagination.total}</Text> bản ghi
                                {(searchTerm || filterNamHoc) && (
                                    <span className="ml-2 text-emerald-600">
                                        ({searchTerm && `tìm kiếm: "${searchTerm}"`}
                                        {searchTerm && filterNamHoc && " • "}
                                        {filterNamHoc && `năm học: ${namHocList.find(k => k.id == filterNamHoc)?.ten_nam_hoc || ""}`})
                                    </span>
                                )}
                            </div>
                            <Pagination
                                current={pagination.current_page}
                                total={pagination.total}
                                pageSize={pagination.per_page}
                                onChange={handlePageChange}
                                showSizeChanger
                                showQuickJumper
                                pageSizeOptions={['5', '10', '20', '50']}
                                showTotal={(total, range) => `${range[0]}-${range[1]} trên ${total} mục`}
                                className="custom-pagination"
                            />
                        </div>
                    )}
                </Card>

                <Modal
                    title={
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <ExclamationCircleOutlined className="text-red-600 text-lg" />
                            </div>
                            <span>Xác nhận xóa</span>
                        </div>
                    }
                    open={deleteModalVisible}
                    onOk={confirmDelete}
                    onCancel={cancelDelete}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{
                        danger: true,
                        loading: isDeleting,
                        className: "bg-red-600 hover:bg-red-700 border-0 rounded-lg"
                    }}
                    cancelButtonProps={{
                        className: "border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800 rounded-lg"
                    }}
                    centered
                    width={450}
                >
                    <p className="text-gray-600 mt-4">
                        Bạn có chắc chắn muốn xóa thông tin lương này? 
                        Hành động này không thể hoàn tác.
                    </p>
                </Modal>            
                <style>{`
                    .custom-select .ant-select-selector {
                        border-radius: 8px !important;
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.2s ease !important;
                    }
                    
                    .custom-select .ant-select-selector:hover {
                        border-color: #10b981 !important;
                        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15) !important;
                    }
                    
                    .custom-input.ant-input {
                        border-radius: 8px !important;
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.2s ease !important;
                    }
                    
                    .custom-input.ant-input:hover, 
                    .custom-input.ant-input:focus {
                        border-color: #10b981 !important;
                        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15) !important;
                    }
                    
                    .custom-table .ant-table {
                        border-radius: 12px !important;
                        overflow: hidden !important;
                    }
                    
                    .custom-table .ant-table-thead > tr > th {
                        background: linear-gradient(to right, #f8fafc, rgba(16, 185, 129, 0.05)) !important;
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
                        background: rgba(16, 185, 129, 0.05) !important;
                    }
                    
                    .ant-btn-primary {
                        border-radius: 12px !important;
                        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }
                    
                    .ant-btn-primary:hover {
                        transform: translateY(-1px) !important;
                        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35) !important;
                    }
                    
                    .custom-pagination .ant-pagination-item-active {
                        background: linear-gradient(to right, #10b981, #059669) !important;
                        border-color: #10b981 !important;
                    }
                    
                    .ant-input-number {
                        border-radius: 8px !important;
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.2s ease !important;
                    }
                    
                    .ant-input-number:hover, 
                    .ant-input-number:focus {
                        border-color: #10b981 !important;
                        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15) !important;
                    }
                    
                    .ant-upload-btn {
                        border-radius: 12px !important;
                        transition: all 0.2s ease !important;
                    }
                    
                    .ant-upload-btn:hover {
                        border-color: #f59e0b !important;
                        background-color: #fef3c7 !important;
                    }
                `}</style>
            </div>
        </div>
    );
}

export default LuongGiangVienManagement;