import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Card,
    Typography,
    Button,
    Row,
    Col,
    Tag,
    Modal,
    Form,
    Input,
    notification,
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    IdcardOutlined,
    BankOutlined,
    HomeOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";

import KeKhaiGiangDayForm from "../components/Lecturer/KeKhaiGiangDayForm";
import KetQuaKeKhai from "../components/Lecturer/KetQuaKeKhai";
import ThongKe from "../components/Lecturer/ThongKe";
import KeHoachGiangDay from "../components/Lecturer/KeHoachGiangDay";

const { Title, Text } = Typography;

function LecturerDashboard({ setActiveTab: externalSetActiveTab, inDashboard = true, initialTab = "profile", keKhaiParams = null }) {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [welcomePopupVisible, setWelcomePopupVisible] = useState(false);
    const [welcomeAnimationComplete, setWelcomeAnimationComplete] =
        useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phoneForm] = Form.useForm();
    const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

    useEffect(() => {
        if (!isLoading && !authChecking && profile) {
            const timer1 = setTimeout(() => {
                setWelcomePopupVisible(true);
                const timer2 = setTimeout(() => {
                    setWelcomeAnimationComplete(true);
                }, 100);

                const timer3 = setTimeout(() => {
                    dismissWelcomePopup();
                }, 5000);

                return () => {
                    clearTimeout(timer2);
                    clearTimeout(timer3);
                };
            }, 300);

            return () => clearTimeout(timer1);
        }
    }, [isLoading, authChecking, profile]);

    const dismissWelcomePopup = () => {
        setWelcomeAnimationComplete(false);
        setTimeout(() => {
            setWelcomePopupVisible(false);
        }, 300);
    };

    useEffect(() => {
        const verifyAuth = async () => {
            setAuthChecking(true);
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get("/api/auth/verify-role", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        role: "lecturer",
                    },
                });

                if (!response.data.success || !response.data.hasRole) {
                    localStorage.removeItem("token");
                    navigate("/login", {
                        state: {
                            message:
                                "Bạn không có quyền truy cập trang giảng viên",
                        },
                    });
                    return;
                }

                fetchProfile();
            } catch (error) {
                localStorage.removeItem("token");
                navigate("/login", {
                    state: {
                        message: "Phiên đăng nhập hết hạn hoặc không hợp lệ",
                    },
                });
            } finally {
                setAuthChecking(false);
            }
        };

        verifyAuth();
    }, [navigate]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("/api/lecturer/profile", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setProfile(response.data);
        } catch (error) {
            if (
                error.response &&
                (error.response.status === 401 || error.response.status === 403)
            ) {
                localStorage.removeItem("token");
                navigate("/login", {
                    state: {
                        message: "Không thể truy cập thông tin giảng viên",
                    },
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleUpdatePhone = async (values) => {
        setIsUpdatingPhone(true);
        try {
            const response = await axios.put(
                "/api/lecturer/profile/phone",
                {
                    dien_thoai: values.dien_thoai,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            if (response.data.success) {
                notification.success({
                    message: response.data.message,
                    placement: "topRight",
                    duration: 3,
                });

                setProfile((prev) => ({
                    ...prev,
                    dien_thoai: response.data.data.dien_thoai,
                }));

                setIsEditingPhone(false);
                phoneForm.resetFields();
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(
                    error.response.data.errors
                ).flat();
                notification.error({
                    message: errorMessages.join(", "),
                    placement: "topRight",
                    duration: 3,
                });
            } else {
                notification.error({
                    message:
                        error.response?.data?.message ||
                        "Có lỗi xảy ra khi cập nhật số điện thoại",
                    placement: "topRight",
                    duration: 3,
                });
            }
        } finally {
            setIsUpdatingPhone(false);
        }
    };
    const handleCancelPhoneEdit = () => {
        setIsEditingPhone(false);
        phoneForm.resetFields();
    };

    const ModernAvatar = ({ name, size = 120 }) => {
        const initial = name?.charAt(0)?.toUpperCase() || "M";

        return (
            <div className="relative group cursor-pointer">
                <div className="transform transition-all duration-300 hover:scale-105">
                    <div
                        className="relative rounded-full bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg border-4 border-white overflow-hidden"
                        style={{ width: size, height: size }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span
                                className="text-white font-bold select-none"
                                style={{ fontSize: `${size * 0.4}px` }}
                            >
                                {initial}
                            </span>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-indigo-600/0 group-hover:from-blue-600/10 group-hover:to-indigo-600/10 transition-all duration-300"></div>
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-blue-200/0 group-hover:border-blue-200/50 transition-all duration-300"></div>
                </div>

                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg py-2 px-4 text-sm text-gray-700 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100">
                    <div className="text-center">
                        <div className="font-medium text-slate-700">
                            {name || "Quản lý"}
                        </div>
                    </div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white"></div>
                    </div>
                </div>
            </div>
        );
    };

    if (authChecking || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-50/30 flex items-center justify-center overflow-hidden relative">
                <div className="relative z-10">
                    <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/20 max-w-sm w-full mx-4 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="relative mb-6">
                                <div className="w-16 h-16 relative flex justify-center items-center">
                                    <div className="absolute w-full h-full border-3 border-indigo-200/30 rounded-full"></div>
                                    <div className="absolute w-full h-full border-t-3 border-r-3 border-indigo-500 rounded-full animate-spin"></div>
                                    <div className="absolute w-10 h-10 border-t-2 border-blue-400 rounded-full animate-spin-reverse"></div>
                                    <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-full shadow-lg flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
                                    {authChecking
                                        ? "Đang xác thực..."
                                        : "Đang tải dữ liệu"}
                                </h3>
                                <p className="text-gray-600 text-xs leading-relaxed max-w-xs">
                                    {authChecking
                                        ? "Hệ thống đang xác thực quyền truy cập của bạn"
                                        : "Hệ thống đang chuẩn bị dữ liệu, vui lòng đợi trong giây lát"}
                                </p>
                            </div>

                            <div className="w-full">
                                <div className="h-1.5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-teal-500 rounded-full animate-loading-wave"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes spin-reverse {
                        from {
                            transform: rotate(360deg);
                        }
                        to {
                            transform: rotate(0deg);
                        }
                    }
                    @keyframes loading-wave {
                        0% {
                            transform: translateX(-100%);
                        }
                        50% {
                            transform: translateX(0%);
                        }
                        100% {
                            transform: translateX(100%);
                        }
                    }
                    .animate-spin-reverse {
                        animation: spin-reverse 2s linear infinite;
                    }
                    .animate-loading-wave {
                        animation: loading-wave 2s ease-in-out infinite;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-50/30 overflow-hidden font-sans relative">
            <aside
                className={`fixed lg:relative inset-y-0 left-0 z-50 transform transition-all duration-500 ease-out ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0 ${
                    sidebarCollapsed ? "w-20" : "w-72"
                } bg-white/95 backdrop-blur-xl border-r border-white/20 shadow-2xl flex flex-col h-screen overflow-hidden`}
            >
                <div className="absolute -right-4 top-24 hidden lg:block z-10">
                    <button
                        onClick={toggleSidebar}
                        className="w-8 h-8 bg-white/90 backdrop-blur-xl rounded-full shadow-lg border border-white/20 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300 hover:shadow-xl active:scale-95 flex items-center justify-center"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 transition-transform duration-500 ${
                                sidebarCollapsed ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                            />
                        </svg>
                    </button>
                </div>

                <div
                    className={`${
                        sidebarCollapsed ? "px-4 py-6" : "px-6 py-6"
                    } relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-600 text-white overflow-hidden`}
                >
                    <div className="absolute inset-0 opacity-15">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    </div>

                    <div
                        className={`relative z-10 flex ${
                            sidebarCollapsed
                                ? "justify-center"
                                : "items-center space-x-4"
                        }`}
                    >
                        <div className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 flex items-center justify-center group hover:scale-110 transition-transform duration-300">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-white transform transition-transform duration-700 ease-out group-hover:rotate-[360deg]"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex flex-col">
                                <h1 className="text-base font-bold tracking-wide leading-tight">
                                    Đại học Thủy Lợi
                                </h1>
                                <p className="text-sm font-medium text-indigo-200 tracking-wide">
                                    Quản lý khối lượng
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 py-6 px-4 overflow-y-auto bg-gradient-to-b from-white/80 to-white/95 backdrop-blur-sm">
                    {!sidebarCollapsed && <div className="mb-6 px-3"></div>}

                    <ul className="space-y-3">
                        {[
                            {
                                id: "profile",
                                label: "Thông tin cá nhân",
                                icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                            },
                            {
                                id: "ke-khai",
                                label: "Kê khai hoạt động",
                                icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
                            },
                            {
                                id: "ket-qua-ke-khai",
                                label: "Kết quả kê khai",
                                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                            },
                            {
                                id: "thong-ke",
                                label: "Thống kê",
                                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                            },
                            {
                                id: "ke-hoach-giang-day",
                                label: "Kế hoạch giảng dạy",
                                icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                            },
                        ].map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full group flex items-center ${
                                        sidebarCollapsed
                                            ? "justify-center px-3"
                                            : "px-4"
                                    } py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                                        activeTab === item.id
                                            ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200 transform scale-105"
                                            : "text-gray-700 hover:bg-gray-100/80 hover:text-indigo-600 hover:scale-105 hover:shadow-md"
                                    }`}
                                    title={item.label}
                                >
                                    {activeTab === item.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/90 to-blue-500/90 animate-gradient-x"></div>
                                    )}

                                    <div
                                        className={`${
                                            sidebarCollapsed ? "" : "mr-4"
                                        } relative z-10 transition-transform duration-300 group-hover:scale-110`}
                                    >
                                        <div
                                            className={`w-5 h-5 ${
                                                activeTab === item.id
                                                    ? "text-white"
                                                    : "text-indigo-600 group-hover:text-indigo-700"
                                            }`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-full h-full"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d={item.icon}
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                    {!sidebarCollapsed && (
                                        <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                                            {item.label}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div
                    className={`border-t border-gray-100/50 ${
                        sidebarCollapsed ? "p-4" : "p-0"
                    } bg-white/50 backdrop-blur-sm`}
                >
                    {sidebarCollapsed ? (
                        <div className="relative group flex justify-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-0.5 shadow-lg cursor-pointer group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                <div className="bg-white rounded-xl w-full h-full flex items-center justify-center">
                                    <span className="text-indigo-600 font-bold text-sm">
                                        {profile?.ho_ten?.charAt(0) || "G"}
                                    </span>
                                </div>
                            </div>

                            <div className="absolute left-full bottom-0 ml-6 bg-white/95 backdrop-blur-xl shadow-xl rounded-xl py-3 px-2 text-sm text-gray-700 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 z-50 border border-white/20">
                                <div className="px-4 py-2">
                                    <div className="font-bold text-gray-800 mb-1">
                                        {profile?.ho_ten || "Giảng viên"}
                                    </div>
                                    <div className="text-indigo-600 text-sm">
                                        {profile?.bo_mon?.ten_bo_mon ||
                                            "Chưa có bộ môn"}
                                    </div>
                                </div>
                                <div className="h-px bg-gray-100 my-2"></div>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem("token");
                                        navigate("/login");
                                    }}
                                    className="flex items-center px-4 py-2 text-rose-600 hover:bg-rose-50 w-full text-left transition-colors rounded-lg mx-1"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm rounded-xl mx-4 mb-4 mt-3 overflow-hidden shadow-md border border-gray-100/50">
                            <div className="p-4 pb-3">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-0.5 shadow-lg">
                                        <div className="bg-white rounded-xl w-full h-full flex items-center justify-center">
                                            <span className="text-indigo-600 font-bold text-base">
                                                {profile?.ho_ten?.charAt(0) ||
                                                    "G"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-gray-800 truncate">
                                            {profile?.ho_ten || "Giảng viên"}
                                        </h3>
                                        <p className="text-sm text-indigo-600 truncate mt-1">
                                            {profile?.bo_mon?.ten_bo_mon ||
                                                "Chưa có bộ môn"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 py-3 bg-white/80 border-t border-gray-100/50">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem("token");
                                        navigate("/login");
                                    }}
                                    className="flex items-center justify-center w-full py-2.5 px-4 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all duration-300 rounded-lg group hover:shadow-md"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 mr-2 transition-transform group-hover:translate-x-0.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden transition-all duration-500 relative z-10">
                <header className="bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 h-18 flex items-center justify-between">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-800 flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center mr-4 shadow-md">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-indigo-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d={
                                                activeTab === "profile"
                                                    ? "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                    : activeTab === "ke-khai"
                                                    ? "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    : activeTab ===
                                                      "ket-qua-ke-khai"
                                                    ? "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 100 4h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                                    : activeTab === "thong-ke"
                                                    ? "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                                    : activeTab ===
                                                      "ke-hoach-giang-day"
                                                    ? "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                                    : "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                                            }
                                        />
                                    </svg>
                                </div>

                                <span className="relative">
                                    <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                        {activeTab === "profile"
                                            ? "Thông tin cá nhân"
                                            : activeTab === "ke-khai"
                                            ? "Kê khai hoạt động"
                                            : activeTab === "ket-qua-ke-khai"
                                            ? "Kết quả kê khai"
                                            : activeTab === "thong-ke"
                                            ? "Thống kê"
                                            : activeTab === "ke-hoach-giang-day"
                                            ? "Kế hoạch giảng dạy"
                                            : "Dashboard"}
                                    </span>
                                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full"></div>
                                </span>
                            </h1>
                        </div>

                        <div className="hidden sm:flex items-center">
                            <div className="flex items-center space-x-3 bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 rounded-xl border border-indigo-100 shadow-md backdrop-blur-sm">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm7-7l2 2 4-4m-6-4h6m-6 4h6"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                    {new Date().toLocaleDateString("vi-VN", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto py-8 px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="animate-slide-up">
                            {activeTab === "profile" ? (
                                <div className="space-y-6">
                                    <Card
                                        className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl"
                                        style={{ borderRadius: "16px" }}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-6">
                                                <div className="relative">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                                        <UserOutlined className="text-2xl text-white" />
                                                    </div>
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-md"></div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Title
                                                        level={2}
                                                        style={{ margin: 0 }}
                                                        className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent"
                                                    >Thông tin cá nhân
                                                    </Title>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                                        <Text type="secondary">Thông tin chi tiết về tài khoản và liên hệ</Text>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 p-8 rounded-2xl border border-gray-200/50 mb-6">
                                            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                                                <div className="relative">
                                                    <ModernAvatar
                                                        name={profile?.ho_ten}
                                                        size={120}
                                                    />

                                                    <div className="absolute -bottom-2 -right-2">
                                                        {profile?.trang_thai ===
                                                        1 ? (
                                                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                                                                <CheckCircleOutlined className="text-white text-lg" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                                                                <CloseCircleOutlined className="text-white text-lg" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1 text-center lg:text-left space-y-4">
                                                    <div>
                                                        <Title
                                                            level={3}
                                                            style={{
                                                                margin: 0,
                                                            }}
                                                            className="text-gray-800 mb-2"
                                                        >
                                                            {profile?.ho_ten ||
                                                                "Giảng viên"}
                                                        </Title>
                                                        <Text className="text-lg text-indigo-600 font-medium">
                                                            Mã GV:{" "}
                                                            {profile?.ma_gv ||
                                                                "Chưa cập nhật"}
                                                        </Text>
                                                    </div>

                                                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                                        <Tag
                                                            color="blue"
                                                            className="px-4 py-2 text-sm font-medium flex items-center"
                                                        >
                                                            <BankOutlined className="mr-2" />
                                                            {profile?.bo_mon
                                                                ?.ten_bo_mon ||
                                                                "Chưa có bộ môn"}
                                                        </Tag>
                                                        <Tag
                                                            color="purple"
                                                            className="px-4 py-2 text-sm font-medium flex items-center"
                                                        >
                                                            <HomeOutlined className="mr-2" />
                                                            {profile?.bo_mon
                                                                ?.khoa
                                                                ?.ten_khoa ||
                                                                "Chưa có khoa"}{" "}
                                                        </Tag>
                                                        {profile?.trang_thai ===
                                                        1 ? (
                                                            <Tag
                                                                color="success"
                                                                className="px-4 py-2 text-sm font-medium flex items-center"
                                                            >
                                                                <CheckCircleOutlined className="mr-2" />
                                                                Đang hoạt động
                                                            </Tag>
                                                        ) : (
                                                            <Tag
                                                                color="error"
                                                                className="px-4 py-2 text-sm font-medium flex items-center"
                                                            >
                                                                <CloseCircleOutlined className="mr-2" />
                                                                Tài khoản bị
                                                                khóa
                                                            </Tag>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Row gutter={[24, 24]}>
                                        <Col xs={24} lg={12}>
                                            <Card
                                                className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl h-full"
                                                style={{ borderRadius: "16px" }}
                                            >
                                                <div className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                                                    <Title
                                                        level={4}
                                                        style={{ margin: 0 }}
                                                        className="flex items-center"
                                                    >
                                                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                                            <MailOutlined className="text-indigo-600" />
                                                        </div>
                                                        Thông tin liên hệ
                                                    </Title>
                                                    <Text
                                                        type="secondary"
                                                        className="text-sm mt-2"
                                                    >
                                                        Thông tin cá nhân và
                                                        liên lạc
                                                    </Text>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="group">
                                                        <div className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100/50 hover:border-indigo-200/50 hover:shadow-md transition-all duration-300">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                                                                <MailOutlined className="text-indigo-600 text-lg" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Text className="block text-sm text-gray-500 mb-1">
                                                                    Địa chỉ
                                                                    email
                                                                </Text>
                                                                <Text className="text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                                                                    {profile?.email ||
                                                                        "Chưa cập nhật"}
                                                                </Text>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="group">
                                                        <div className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100/50 hover:border-emerald-200/50 hover:shadow-md transition-all duration-300">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                                                                <PhoneOutlined className="text-emerald-600 text-lg" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Text className="block text-sm text-gray-500 mb-1">
                                                                    Số điện
                                                                    thoại
                                                                </Text>
                                                                <Text className="text-base font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">
                                                                    {profile?.dien_thoai ||
                                                                        "Chưa cập nhật"}
                                                                </Text>
                                                            </div>
                                                            <div className="ml-3">
                                                                <Button
                                                                    type="text"
                                                                    icon={
                                                                        <EditOutlined />
                                                                    }
                                                                    size="small"
                                                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300 transition-all duration-300"
                                                                    onClick={() => {
                                                                        setIsEditingPhone(
                                                                            true
                                                                        );
                                                                        phoneForm.setFieldsValue(
                                                                            {
                                                                                dien_thoai:
                                                                                    profile?.dien_thoai ||
                                                                                    "",
                                                                            }
                                                                        );
                                                                    }}
                                                                    title="Chỉnh sửa số điện thoại"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Col>

                                        <Col xs={24} lg={12}>
                                            <Card
                                                className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl h-full"
                                                style={{ borderRadius: "16px" }}
                                            >
                                                <div className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                                                    <Title
                                                        level={4}
                                                        style={{ margin: 0 }}
                                                        className="flex items-center"
                                                    >
                                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                                            <IdcardOutlined className="text-purple-600" />
                                                        </div>
                                                        Thông tin công việc
                                                    </Title>
                                                    <Text
                                                        type="secondary"
                                                        className="text-sm mt-2"
                                                    >
                                                        Chi tiết về vị trí và
                                                        đơn vị
                                                    </Text>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100/50 hover:shadow-lg transition-all duration-300 group">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <Text className="text-sm font-medium text-indigo-600 uppercase tracking-wider">
                                                                Mã giảng viên
                                                            </Text>
                                                            <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                                <IdcardOutlined className="text-indigo-600" />
                                                            </div>
                                                        </div>
                                                        <Text className="text-2xl font-bold text-indigo-800">
                                                            {profile?.ma_gv ||
                                                                "Chưa cập nhật"}
                                                        </Text>
                                                    </div>

                                                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100/50 hover:shadow-lg transition-all duration-300 group">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <Text className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
                                                                Bộ môn
                                                            </Text>
                                                            <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                                <BankOutlined className="text-emerald-600" />
                                                            </div>
                                                        </div>
                                                        <Text className="text-lg font-bold text-emerald-800">
                                                            {profile?.bo_mon
                                                                ?.ten_bo_mon ||
                                                                "Chưa cập nhật"}
                                                        </Text>
                                                    </div>

                                                    <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100/50 hover:shadow-lg transition-all duration-300 group">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <Text className="text-sm font-medium text-purple-600 uppercase tracking-wider">
                                                                Khoa
                                                            </Text>
                                                            <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                                <HomeOutlined className="text-purple-600" />
                                                            </div>
                                                        </div>
                                                        <Text className="text-lg font-bold text-purple-800">
                                                            {profile?.bo_mon
                                                                ?.khoa
                                                                ?.ten_khoa ||
                                                                "Chưa cập nhật"}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <style>{`
                                        .ant-card {
                                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                                        }
                                        
                                        .ant-card:hover {
                                            transform: translateY(-2px) !important;
                                            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
                                        }
                                        
                                        .ant-avatar {
                                            transition: all 0.3s ease !important;
                                        }
                                          .ant-avatar:hover {
                                            transform: scale(1.05) !important;
                                        }
                                        
                                        .ant-tag {
                                            border-radius: 8px !important;
                                            font-weight: 500 !important;
                                            border: none !important;
                                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
                                            transition: all 0.3s ease !important;
                                        }
                                        
                                        .ant-tag:hover {
                                            transform: translateY(-1px) !important;
                                            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
                                        }
                                        
                                        .text-emerald-700 { color: #047857; }
                                        .text-emerald-600 { color: #059669; }
                                        .text-amber-700 { color: #b45309; }
                                        .text-amber-600 { color: #d97706; }
                                        .text-rose-700 { color: #be123c; }
                                        .text-rose-600 { color: #e11d48; }
                                        .text-gray-700 { color: #374151; }
                                        .text-gray-600 { color: #4b5563; }
                                    `}</style>
                                </div>
                            ) : activeTab === "ke-khai" ? (
                                <KeKhaiGiangDayForm 
                                    ma_gv={profile?.ma_gv} 
                                    keKhaiParams={keKhaiParams}
                                />
                            ) : activeTab === "ket-qua-ke-khai" ? (
                                <KetQuaKeKhai ma_gv={profile?.ma_gv} />
                            ) : activeTab === "thong-ke" ? (
                                <ThongKe ma_gv={profile?.ma_gv} />
                            ) : activeTab === "ke-hoach-giang-day" ? (
                                <KeHoachGiangDay ma_gv={profile?.ma_gv} />
                            ) : null}
                        </div>
                    </div>
                </div>

                {welcomePopupVisible && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-lg"
                            onClick={dismissWelcomePopup}
                        ></div>
                        <div
                            className={`relative bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl p-5 max-w-3xl w-full max-h-[85vh] overflow-y-auto transform transition-all duration-700 border border-white/30 ${
                                welcomeAnimationComplete
                                    ? "opacity-100 scale-100 rotate-0"
                                    : "opacity-0 scale-75 rotate-3"
                            }`}
                        >
                            <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-r from-indigo-400/8 to-blue-400/8 rounded-full -mr-12 -mt-12"></div>
                                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-r from-purple-400/8 to-pink-400/8 rounded-full -ml-10 -mb-10"></div>
                            </div>

                            <button
                                onClick={dismissWelcomePopup}
                                className="absolute top-3 right-3 w-8 h-8 bg-gray-100/90 hover:bg-gray-200/90 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-300 hover:scale-110 shadow-lg border border-gray-200/50 z-20"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="relative mb-5">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl border-2 border-white/50">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-8 w-8 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                            />
                                        </svg>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce shadow-lg"></div>
                                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg"></div>
                                    <div className="absolute top-1/2 -right-2 w-1 h-1 bg-pink-400 rounded-full animate-ping"></div>
                                </div>

                                <div className="mb-5">
                                    <div className="bg-gradient-to-r from-indigo-40/80 via-blue-50/80 to-purple-50/80 backdrop-blur-sm p-3 rounded-lg border border-indigo-200/20 mb-3 shadow-lg max-w-md mx-auto">
                                        <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                                            Xin chào,{" "}
                                            {profile?.ho_ten || "Giảng viên"}!
                                            👋
                                        </h2>
                                        <p className="text-xs text-gray-600 font-medium mt-1">
                                            Chào mừng đến với hệ thống quản lý
                                            khối lượng giảng dạy
                                        </p>
                                    </div>
                                    <div className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/50 rounded-full shadow-sm">
                                        <span className="text-xs font-semibold text-indigo-700">
                                            🏫 Đại học Thủy Lợi
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-5 max-w-2xl">
                                    {[
                                        {
                                            icon: (
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            ),
                                            title: "Kê khai hoạt động",
                                            desc: "Ghi nhận hoạt động giảng dạy",
                                            color: "from-blue-50 to-indigo-50 border-blue-200/50",
                                        },
                                        {
                                            icon: (
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 100 4h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                                    />
                                                </svg>
                                            ),
                                            title: "Theo dõi kết quả",
                                            desc: "Xem trạng thái kê khai",
                                            color: "from-emerald-50 to-green-50 border-emerald-200/50",
                                        },
                                        {
                                            icon: (
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                                    />
                                                </svg>
                                            ),
                                            title: "Thống kê chi tiết",
                                            desc: "Phân tích khối lượng công việc",
                                            color: "from-purple-50 to-pink-50 border-purple-200/50",
                                        },
                                    ].map((feature, index) => (
                                        <div
                                            key={index}
                                            className={`bg-gradient-to-br ${feature.color} backdrop-blur-sm p-3 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 group hover:scale-105 cursor-pointer`}
                                        >
                                            <div className="text-indigo-600 mb-2 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                                                {feature.icon}
                                            </div>

                                            <div className="text-left">
                                                <h4 className="flex justify-center text-xs font-bold text-gray-800 mb-1 group-hover:text-indigo-700 transition-colors duration-300">
                                                    {feature.title}
                                                </h4>
                                                <p className="flex justify-center text-xs text-gray-600 leading-relaxed">
                                                    {feature.desc}
                                                </p>
                                            </div>

                                            <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="w-4 h-4 bg-white/80 rounded-full flex items-center justify-center">
                                                    <svg
                                                        className="w-2 h-2 text-indigo-600"
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
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="w-full flex items-center justify-center gap-4 mb-5 p-3 bg-gradient-to-r from-gray-50/80 via-white/80 to-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50 max-w-md mx-auto">
                                    <div className="text-center">
                                        <div className="flex justify-center mb-1">
                                            <svg
                                                className="w-4 h-4 text-indigo-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="text-sm font-bold text-indigo-600 mb-1">
                                            Tiện lợi
                                        </div>
                                        <div className="text-xs text-gray-600 font-medium">
                                            Dễ sử dụng
                                        </div>
                                    </div>
                                    <div className="w-px h-5 bg-gray-300"></div>
                                    <div className="text-center">
                                        <div className="flex justify-center mb-1">
                                            <svg
                                                className="w-4 h-4 text-emerald-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.0"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="w-px h-5 bg-gray-300"></div>
                                    <div className="text-center">
                                        <div className="flex justify-center mb-1">
                                            <svg
                                                className="w-4 h-4 text-purple-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="text-sm font-bold text-purple-600 mb-1">
                                            Hiệu quả
                                        </div>
                                        <div className="text-xs text-gray-600 font-medium">
                                            Xử lý nhanh
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md mx-auto">
                                    <button
                                        onClick={dismissWelcomePopup}
                                        className="flex-1 py-2.5 px-5 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 hover:scale-105 active:scale-95 group"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <svg
                                                className="w-3.5 h-3.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                                />
                                            </svg>
                                            <span className="text-sm">
                                                Bắt đầu ngay
                                            </span>
                                            <svg
                                                className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                />
                                            </svg>
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            dismissWelcomePopup();
                                            setActiveTab("ke-khai");
                                        }}
                                        className="flex-1 py-2.5 px-5 bg-white border-2 border-indigo-200 text-indigo-600 font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-indigo-50 hover:border-indigo-300 hover:scale-105 active:scale-95 group"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <svg
                                                className="w-3.5 h-3.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                            <span className="text-sm">
                                                Kê khai ngay
                                            </span>
                                        </span>
                                    </button>
                                </div>

                                <button
                                    onClick={dismissWelcomePopup}
                                    className="mt-3 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-300 underline underline-offset-2"
                                >
                                    Bỏ qua hướng dẫn
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes slide-up {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @keyframes gradient-x {
                        0%, 100% {
                            background-position: 0% 50%;
                        }
                        50% {
                            background-position: 100% 50%;
                        }
                    }
                    @keyframes float {
                        0%, 100% {
                            transform: translateY(0px) rotate(0deg);
                        }
                        50% {
                            transform: translateY(-20px) rotate(180deg);
                        }
                    }
                    @keyframes float-delayed {
                        0%, 100% {
                            transform: translateY(0px) rotate(0deg);
                        }
                        50% {
                            transform: translateY(-15px) rotate(-180deg);
                        }
                    }

                    .animate-slide-up {
                        animation: slide-up 0.6s ease-out forwards;
                    }
                    .animate-gradient-x {
                        background-size: 200% 200%;
                        animation: gradient-x 3s ease infinite;
                    }
                    .animate-float {
                        animation: float 6s ease-in-out infinite;
                    }
                    .animate-float-delayed {
                        animation: float-delayed 8s ease-in-out infinite;
                        animation-delay: 2s;
                    }
                    .animate-spin-reverse {
                        animation: spin-reverse 2s linear infinite;
                    }
                    .animate-loading-wave {
                        animation: loading-wave 2s ease-in-out infinite;
                    }
                `}</style>
            </main>

            <Modal
                title={
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                            <PhoneOutlined className="text-emerald-600" />
                        </div>
                        <span className="text-lg font-semibold text-gray-800">
                            Chỉnh sửa số điện thoại
                        </span>
                    </div>
                }
                open={isEditingPhone}
                onCancel={handleCancelPhoneEdit}
                footer={null}
                className="phone-edit-modal"
                style={{ borderRadius: "16px" }}
                centered
            >
                <Form
                    form={phoneForm}
                    onFinish={handleUpdatePhone}
                    layout="vertical"
                    className="mt-4"
                >
                    <Form.Item
                        label={
                            <span className="text-sm font-medium text-gray-700">
                                Số điện thoại mới
                            </span>
                        }
                        name="dien_thoai"
                        rules={[
                            {
                                pattern: /^[0-9]{10,11}$/,
                                message: "Số điện thoại phải có 10-11 chữ số",
                            },
                        ]}
                    >
                        <Input
                            placeholder="Nhập số điện thoại (10-11 chữ số)"
                            prefix={<PhoneOutlined className="text-gray-400" />}
                            className="rounded-lg border-gray-200 hover:border-emerald-300 focus:border-emerald-500"
                            size="large"
                        />
                    </Form.Item>

                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            onClick={handleCancelPhoneEdit}
                            className="px-6 py-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-700 rounded-lg transition-all duration-300"
                            icon={<CloseOutlined />}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isUpdatingPhone}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 border-emerald-500 hover:border-emerald-600 rounded-lg transition-all duration-300"
                            icon={<SaveOutlined />}
                        >
                            {isUpdatingPhone ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            <style>{`
                .phone-edit-modal .ant-modal-content {
                    border-radius: 16px !important;
                    overflow: hidden;
                }
                
                .phone-edit-modal .ant-modal-header {
                    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
                    border-bottom: 1px solid #d1fae5;
                    padding: 20px 24px;
                }
                
                .phone-edit-modal .ant-modal-body {
                    padding: 24px;
                }
                
                .phone-edit-modal .ant-input-affix-wrapper {
                    border-radius: 8px !important;
                    transition: all 0.3s ease !important;
                }
                
                .phone-edit-modal .ant-input-affix-wrapper:hover {
                    border-color: #10b981 !important;
                    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1) !important;
                }
                
                .phone-edit-modal .ant-input-affix-wrapper-focused {
                    border-color: #10b981 !important;
                    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
                }
            `}</style>
        </div>
    );
}

export default LecturerDashboard;