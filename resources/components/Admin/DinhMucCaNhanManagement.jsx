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
    InputNumber,
} from "antd";
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
    FileTextOutlined,
    BookOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Text, Title } = Typography;
const { confirm } = Modal;

function DinhMucCaNhanManagement() {
    const [form] = Form.useForm();
    const [dinhMucList, setDinhMucList] = useState([]);
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
            fetchDinhMuc(1, pagination.per_page, searchValue, filterNamHoc);
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
            fetchDinhMuc(1, pagination.per_page, "", filterNamHoc);
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
        fetchDinhMuc(1, pagination.per_page, searchTerm, filterNamHoc);
    }, [filterNamHoc]);

    const fetchDinhMuc = async (
        page = pagination.current_page,
        perPage = pagination.per_page,
        search = searchTerm,
        namHocFilter = filterNamHoc
    ) => {
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

            const response = await axios.get("/api/admin/dinh-muc-ca-nhan", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: params,
            });

            setDinhMucList(response.data.data || []);
            setPagination({
                current_page: response.data.pagination?.current_page || page,
                per_page: response.data.pagination?.per_page || perPage,
                total: response.data.pagination?.total || 0,
                last_page: response.data.pagination?.last_page || 1,
                from: response.data.pagination?.from || null,
                to: response.data.pagination?.to || null,
            });
        } catch (error) {
            console.error("Error fetching định mức:", error);
            if (error.response?.status === 401) {
                message.error(
                    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                );
            } else if (error.response?.status === 403) {
                message.error("Bạn không có quyền truy cập chức năng này.");
            } else if (error.response?.status === 422) {
                message.error("Dữ liệu tìm kiếm không hợp lệ.");
            } else if (error.response?.status >= 500) {
                message.error("Lỗi máy chủ. Vui lòng thử lại sau.");
            } else {
                message.error("Không thể tải dữ liệu định mức cá nhân");
            }
            setDinhMucList([]);
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
            console.error("Error fetching users:", error);
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
            setNamHocList(response.data.data || []);
        } catch (error) {
            console.error("Error fetching nam hoc:", error);
            message.error("Không thể tải dữ liệu năm học");
        }
    };

    const handlePageChange = (page, pageSize) => {
        setPagination((prev) => ({
            ...prev,
            current_page: page,
            per_page: pageSize,
        }));
        fetchDinhMuc(page, pageSize, searchTerm, filterNamHoc);
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
        fetchDinhMuc(1, pagination.per_page, "", filterNamHoc);
    };

    const clearFilter = () => {
        setFilterNamHoc("");
    };

    const clearAll = () => {
        setSearchTerm("");
        setFilterNamHoc("");
        setIsSearching(false);
        setPagination((prev) => ({
            ...prev,
            current_page: 1,
        }));
        fetchDinhMuc(1, pagination.per_page, "", "");
    };

    const handleSubmit = async (values) => {
        setIsLoading(true);
        try {
            if (editingId) {
                await axios.put(
                    `/api/admin/dinh-muc-ca-nhan/${editingId}`,
                    values,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );
                message.success("Cập nhật định mức cá nhân thành công");
            } else {
                await axios.post("/api/admin/dinh-muc-ca-nhan", values, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                });
                message.success("Thêm định mức cá nhân mới thành công");
            }
            fetchDinhMuc();
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

    const handleEdit = (dinhMuc) => {
        form.setFieldsValue({
            nguoi_dung_id: dinhMuc.nguoi_dung_id?.toString() || "",
            nam_hoc_id: dinhMuc.nam_hoc_id?.toString() || "",
            dinh_muc_gd: dinhMuc.dinh_muc_gd,
            dinh_muc_khcn: dinhMuc.dinh_muc_khcn,
            ghi_chu: dinhMuc.ghi_chu,
        });
        setEditingId(dinhMuc.id);
    };

    const handleDelete = (id) => {
        if (!id) {
            message.error("Không thể xác định định mức cần xóa");
            return;
        }
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!deletingId) {
            message.error("Không thể xác định định mức cần xóa");
            return;
        }

        setIsDeleting(true);

        try {
            await axios.delete(`/api/admin/dinh-muc-ca-nhan/${deletingId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            message.success("Xóa định mức cá nhân thành công");
            setDeleteModalVisible(false);
            setDeletingId(null);
            await fetchDinhMuc();
        } catch (error) {
            console.error("Delete error:", error);

            let errorMessage = "Có lỗi xảy ra khi xóa định mức cá nhân";

            if (error.response?.status === 401) {
                errorMessage =
                    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
            } else if (error.response?.status === 403) {
                errorMessage = "Bạn không có quyền xóa định mức này.";
            } else if (error.response?.status === 404) {
                errorMessage = "Định mức không tồn tại hoặc đã được xóa.";
                await fetchDinhMuc();
            } else if (error.response?.status === 422) {
                errorMessage =
                    error.response?.data?.message ||
                    "Không thể xóa định mức này!";
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
            const response = await axios.post(
                "/api/admin/dinh-muc-ca-nhan/import",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            message.success(response.data.message);
            fetchDinhMuc();
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
            const isValidType =
                file.type ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                file.type === "application/vnd.ms-excel" ||
                file.type === "text/csv";
            if (!isValidType) {
                message.error("Chỉ hỗ trợ file Excel (.xlsx, .xls) và CSV!");
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
            "nguoi_dung_id",
            "nam_hoc_id",
            "dinh_muc_gd",
            "dinh_muc_khcn",
            "ghi_chu",
        ];

        const sampleData = [
            ["1", "1", "300", "100", "Định mức chuẩn cho giảng viên"],
            ["2", "1", "350", "120", "Định mức cho giảng viên cao cấp"],
            ["3", "1", "280", "80", "Định mức cho giảng viên mới"],
        ];

        const csvContent = [
            csvHeaders.join(","),
            ...sampleData.map((row) => row.join(",")),
        ].join("\n");

        const BOM = "\uFEFF";
        const finalContent = BOM + csvContent;

        const blob = new Blob([finalContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", "mau_dinh_muc_ca_nhan.csv");
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        message.success("Đã tải xuống file mẫu thành công!");
    };

    const columns = [
        {
            title: "Thông tin giảng viên",
            key: "giang_vien_info",
            width: 300,
            render: (_, record) => (
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center border border-green-200/50">
                        <UserOutlined className="text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <Text className="text-sm font-medium text-gray-800 block truncate">
                            {record.nguoi_dung?.ho_ten || "N/A"}
                        </Text>
                        <Text className="text-xs text-gray-500 block truncate">
                            Mã: {record.nguoi_dung?.ma_gv || "N/A"}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: "Năm học",
            dataIndex: ["nam_hoc", "ten_nam_hoc"],
            key: "nam_hoc",
            width: 120,
            render: (namHoc) => (
                <Tag color="blue" className="font-medium">
                    {namHoc || "N/A"}
                </Tag>
            ),
        },
        {
            title: "Định mức GD",
            dataIndex: "dinh_muc_gd",
            key: "dinh_muc_gd",
            width: 220,
            render: (value) => (
                <div className="flex items-center space-x-1">
                    <BookOutlined className="text-orange-500 text-xs" />
                    <Text className="font-medium text-orange-600">
                        {value || 0} giờ
                    </Text>
                </div>
            ),
        },
        {
            title: "Định mức KHCN",
            dataIndex: "dinh_muc_khcn",
            key: "dinh_muc_khcn",
            width: 220,
            render: (value) => (
                <div className="flex items-center space-x-1">
                    <FileTextOutlined className="text-purple-500 text-xs" />
                    <Text className="font-medium text-purple-600">
                        {value || 0} giờ
                    </Text>
                </div>
            ),
        },
        {
            title: "Ghi chú",
            dataIndex: "ghi_chu",
            key: "ghi_chu",
            width: 200,
            render: (ghiChu) => (
                <Text
                    className="text-xs text-gray-600"
                    ellipsis={{ tooltip: ghiChu }}
                >
                    {ghiChu || "Không có ghi chú"}
                </Text>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/40 relative">
            {/* Enhanced background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-green-400/5 to-emerald-400/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-teal-400/5 to-cyan-400/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-8 space-y-6">
                {/* Enhanced Header */}
                <Card
                    className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <FileTextOutlined className="text-2xl text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full border-2 border-white shadow-md"></div>
                            </div>
                            <div className="space-y-2">
                                <Title
                                    level={2}
                                    style={{ margin: 0 }}
                                    className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent"
                                >
                                    Quản lý định mức cá nhân
                                </Title>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    <Text type="secondary">
                                        Quản lý định mức giảng dạy và KHCN theo
                                        giảng viên
                                    </Text>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <span>Dashboard</span>
                            <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                            <span className="text-green-600 font-medium">
                                Định mức cá nhân
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Enhanced Search and Filter Section */}
                <Card
                    className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="bg-gradient-to-r from-slate-50 via-green-50/50 to-emerald-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                <SearchOutlined className="text-white text-lg" />
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    Tìm kiếm và lọc định mức
                                </Title>
                                <Text type="secondary" className="text-sm">
                                    Tìm kiếm theo tên giảng viên hoặc lọc theo
                                    năm học
                                </Text>
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
                                        ) : null,
                                    }}
                                    prefix={
                                        <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center mr-2">
                                            <SearchOutlined className="text-gray-500 text-xs" />
                                        </div>
                                    }
                                    suffix={
                                        isSearching && <Spin size="small" />
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
                                        <Option
                                            key={namHoc.id}
                                            value={namHoc.id}
                                        >
                                            {namHoc.ten_nam_hoc}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>

                        {(searchTerm || filterNamHoc) && (
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                    {isSearching
                                        ? "Đang tìm kiếm..."
                                        : searchTerm
                                        ? `Tìm kiếm với từ khóa: "${searchTerm}"`
                                        : ""}
                                    {searchTerm && filterNamHoc && " • "}
                                    {filterNamHoc &&
                                        `Lọc theo năm học: ${
                                            namHocList.find(
                                                (k) => k.id == filterNamHoc
                                            )?.ten_nam_hoc || ""
                                        }`}
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
                <Card
                    className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="bg-gradient-to-r from-slate-50 via-green-50/50 to-emerald-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                {editingId ? (
                                    <EditOutlined className="text-white text-lg" />
                                ) : (
                                    <PlusOutlined className="text-white text-lg" />
                                )}
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {editingId
                                        ? "Cập nhật định mức cá nhân"
                                        : "Thêm định mức cá nhân mới"}
                                </Title>
                                <Text type="secondary" className="text-sm">
                                    {editingId
                                        ? "Chỉnh sửa định mức hiện tại"
                                        : "Tạo định mức mới cho giảng viên"}
                                </Text>
                            </div>
                        </div>
                    </div>

                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="nguoi_dung_id"
                                    label={<Text strong>Giảng viên</Text>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn giảng viên",
                                        },
                                    ]}
                                >
                                    <Select
                                        size="large"
                                        placeholder="Chọn giảng viên"
                                        className="custom-select"
                                        showSearch
                                        filterOption={(input, option) => {
                                            const user = nguoiDungList.find(
                                                (u) => u.id == option.value
                                            );
                                            if (!user) return false;
                                            const searchText =
                                                `${user.ho_ten} ${user.ma_gv}`.toLowerCase();
                                            return searchText.includes(
                                                input.toLowerCase()
                                            );
                                        }}
                                    >
                                        {nguoiDungList.map((user) => (
                                            <Option
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {user.ho_ten} ({user.ma_gv})
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="nam_hoc_id"
                                    label={<Text strong>Năm học</Text>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn năm học",
                                        },
                                    ]}
                                >
                                    <Select
                                        size="large"
                                        placeholder="Chọn năm học"
                                        className="custom-select"
                                        showSearch
                                        filterOption={(input, option) =>
                                            option.children
                                                .toLowerCase()
                                                .indexOf(input.toLowerCase()) >=
                                            0
                                        }
                                    >
                                        {namHocList.map((namHoc) => (
                                            <Option
                                                key={namHoc.id}
                                                value={namHoc.id}
                                            >
                                                {namHoc.ten_nam_hoc}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={8}>
                                <Form.Item
                                    name="dinh_muc_gd"
                                    label={
                                        <Text strong>
                                            Định mức giảng dạy (giờ)
                                        </Text>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng nhập định mức giảng dạy",
                                        },
                                        {
                                            type: "number",
                                            min: 0,
                                            message:
                                                "Định mức phải lớn hơn hoặc bằng 0",
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        size="large"
                                        placeholder="Nhập định mức GD"
                                        className="w-full"
                                        min={0}
                                        step={0.1}
                                        precision={1}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={8}>
                                <Form.Item
                                    name="dinh_muc_khcn"
                                    label={
                                        <Text strong>Định mức KHCN (giờ)</Text>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng nhập định mức KHCN",
                                        },
                                        {
                                            type: "number",
                                            min: 0,
                                            message:
                                                "Định mức phải lớn hơn hoặc bằng 0",
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        size="large"
                                        placeholder="Nhập định mức KHCN"
                                        className="w-full"
                                        min={0}
                                        step={0.1}
                                        precision={1}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={8}>
                                <Form.Item
                                    name="ghi_chu"
                                    label={<Text strong>Ghi chú</Text>}
                                >
                                    <Input
                                        size="large"
                                        placeholder="Nhập ghi chú (tùy chọn)"
                                        className="custom-input"
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
                                icon={
                                    editingId ? (
                                        <EditOutlined />
                                    ) : (
                                        <PlusOutlined />
                                    )
                                }
                                className="px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 rounded-xl shadow-lg hover:shadow-xl"
                            >
                                {editingId ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </div>
                    </Form>
                </Card>

                {/* Enhanced Import Section */}
                <Card
                    className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                <UploadOutlined className="text-white text-lg" />
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    Nhập dữ liệu từ file
                                </Title>
                                <Text type="secondary" className="text-sm">
                                    Tải lên file Excel hoặc CSV để thêm nhiều
                                    định mức
                                </Text>
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
                                    {file
                                        ? "Thay đổi file"
                                        : "Chọn file để tải lên"}
                                </Button>
                            </Upload>

                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start">
                                    <InfoCircleOutlined className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                                    <div className="text-xs text-blue-800 flex-1">
                                        <Text strong className="block">
                                            Định dạng hỗ trợ: .xlsx, .xls, .csv
                                        </Text>
                                        <Text className="block mt-1">
                                            File phải có cấu trúc đúng với các
                                            cột: nguoi_dung_id, nam_hoc_id,
                                            dinh_muc_gd, dinh_muc_khcn, ghi_chu
                                        </Text>
                                        <div className="mt-3 flex items-center justify-between">
                                            <Text className="text-blue-700">
                                                <strong>Lưu ý:</strong> ID phải
                                                tồn tại trong hệ thống
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

                <Card
                    className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="bg-gradient-to-r from-slate-50 via-green-50/50 to-emerald-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md flex items-center justify-center mr-4">
                                    <FileTextOutlined className="text-white text-lg" />
                                </div>
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>
                                        Danh sách định mức cá nhân
                                    </Title>
                                    <Text type="secondary" className="text-sm">
                                        {searchTerm || filterNamHoc
                                            ? `${pagination.total} kết quả ${
                                                  searchTerm
                                                      ? "tìm kiếm"
                                                      : "lọc"
                                              }`
                                            : `${pagination.total} định mức trong hệ thống`}
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
                                    onClick={() => fetchDinhMuc()}
                                    loading={isLoading}
                                    className="px-4 py-2 h-9 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-600 hover:from-green-100 hover:to-emerald-100 hover:border-green-300 hover:text-green-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                    icon={<SettingOutlined />}
                                >
                                    Làm mới
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={dinhMucList}
                        loading={isLoading}
                        pagination={false}
                        rowKey="id"
                        className="custom-table"
                        locale={{
                            emptyText: (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <FileTextOutlined className="text-2xl text-gray-400" />
                                    </div>
                                    <Text className="text-gray-500 font-medium text-lg block">
                                        {searchTerm
                                            ? `Không tìm thấy định mức với từ khóa "${searchTerm}"`
                                            : filterNamHoc
                                            ? "Không có định mức nào trong năm học này"
                                            : "Chưa có định mức nào"}
                                    </Text>
                                    <Text className="text-gray-400 text-sm">
                                        {searchTerm || filterNamHoc ? (
                                            <>
                                                Thử điều chỉnh từ khóa tìm kiếm
                                                hoặc{" "}
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
                                            "Thêm định mức mới để bắt đầu"
                                        )}
                                    </Text>
                                </div>
                            ),
                        }}
                    />

                    {pagination.total > 0 && (
                        <div className="mt-6 flex justify-between items-center">
                            <Text type="secondary">
                                Hiển thị <Text strong>{pagination.from}</Text>{" "}
                                đến <Text strong>{pagination.to}</Text> trên{" "}
                                <Text strong>{pagination.total}</Text> kết quả
                                {(searchTerm || filterNamHoc) && (
                                    <span className="ml-2 text-green-600">
                                        (
                                        {searchTerm &&
                                            `tìm kiếm: "${searchTerm}"`}
                                        {searchTerm && filterNamHoc && " • "}
                                        {filterNamHoc &&
                                            `năm học: ${
                                                namHocList.find(
                                                    (k) => k.id == filterNamHoc
                                                )?.ten_nam_hoc || ""
                                            }`}
                                        )
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
                                showTotal={(total, range) =>
                                    `${range[0]}-${range[1]} trên ${total} mục`
                                }
                                className="custom-pagination"
                            />
                        </div>
                    )}
                </Card>

                <Modal
                    title={
                        <div className="flex items-center">
                            <ExclamationCircleOutlined className="text-red-500 mr-2" />
                            <span>Xác nhận xóa định mức</span>
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
                    <p>
                        Bạn có chắc chắn muốn xóa định mức cá nhân này? Hành
                        động này không thể hoàn tác.
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
                `}</style>
            </div>
        </div>
    );
}

export default DinhMucCaNhanManagement;
