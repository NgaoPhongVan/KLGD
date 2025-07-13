import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserManagement from '../components/Admin/UserManagement';
import KhoaManagement from '../components/Admin/KhoaManagement';
import BoMonManagement from '../components/Admin/BoMonManagement';
import NamHocManagement from '../components/Admin/NamHocManagement';
import HocKyManagement from '../components/Admin/HocKyManagement';
import KeKhaiThoiGianManagement from '../components/Admin/KeKhaiThoiGianManagement';
import DinhMucCaNhanManagement from '../components/Admin/DinhMucCaNhanManagement';
import DmHeSoChungManagement from '../components/Admin/DmHeSoChungManagement';
import LuongGiangVienManagement from '../components/Admin/LuongGiangVienManagement';
import MienGiamDinhMucManagement from '../components/Admin/MienGiamDinhMucManagement';

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeModule, setActiveModule] = useState('users');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [authChecking, setAuthChecking] = useState(true);
    const [adminInfo, setAdminInfo] = useState(null);
    const [welcomePopupVisible, setWelcomePopupVisible] = useState(false);
    const [welcomeAnimationComplete, setWelcomeAnimationComplete] = useState(false);

    useEffect(() => {
        if (!isLoading && !authChecking && adminInfo) {
            const timer1 = setTimeout(() => {
                setWelcomePopupVisible(true);
                const timer2 = setTimeout(() => {
                    setWelcomeAnimationComplete(true);
                }, 100);
                
                const timer3 = setTimeout(() => {
                    dismissWelcomePopup();
                }, 6000);

                return () => {
                    clearTimeout(timer2);
                    clearTimeout(timer3);
                };
            }, 300);

            return () => clearTimeout(timer1);
        }
    }, [isLoading, authChecking, adminInfo]);

    const dismissWelcomePopup = () => {
        setWelcomeAnimationComplete(false);
        setTimeout(() => {
            setWelcomePopupVisible(false);
        }, 500);
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
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        role: "admin"
                    }
                });
                
                if (!response.data.success || !response.data.hasRole) {
                    localStorage.removeItem("token");
                    navigate("/login", { 
                        state: { 
                            message: "Bạn không có quyền truy cập trang quản trị hệ thống" 
                        } 
                    });
                    return;
                }
                
                fetchAdminInfo();
            } catch (error) {
                localStorage.removeItem("token");
                navigate("/login", { 
                    state: { 
                        message: "Phiên đăng nhập hết hạn hoặc không hợp lệ" 
                    } 
                });
            } finally {
                setAuthChecking(false);
            }
        };
        
        verifyAuth();
    }, [navigate]);

    const fetchAdminInfo = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("/api/admin/profile", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setAdminInfo(response.data);
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                localStorage.removeItem("token");
                navigate("/login", { 
                    state: { 
                        message: "Không thể truy cập thông tin quản trị viên" 
                    } 
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const modules = [
        { 
            id: 'users', 
            label: 'Quản lý người dùng', 
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', 
            component: <UserManagement /> 
        },
        { 
            id: 'khoa', 
            label: 'Quản lý khoa', 
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', 
            component: <KhoaManagement /> 
        },
        { 
            id: 'bomon', 
            label: 'Quản lý bộ môn', 
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', 
            component: <BoMonManagement /> 
        },
        { 
            id: 'namhoc', 
            label: 'Quản lý năm học', 
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 
            component: <NamHocManagement /> 
        },
        { 
            id: 'hocky', 
            label: 'Quản lý học kỳ', 
            icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z', 
            component: <HocKyManagement /> 
        },
        { 
            id: 'kekhaithoigian', 
            label: 'Quản lý thời gian kê khai', 
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 
            component: <KeKhaiThoiGianManagement /> 
        },
        { 
            id: 'dinhmuccanhan', 
            label: 'Quản lý định mức cá nhân', 
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 
            component: <DinhMucCaNhanManagement /> 
        },
        { 
            id: 'dmhesochung', 
            label: 'Quản lý hệ số chung', 
            icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', 
            component: <DmHeSoChungManagement /> 
        },
        { 
            id: 'luonggiangvien', 
            label: 'Quản lý lương giảng viên', 
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', 
            component: <LuongGiangVienManagement /> 
        },
        { 
            id: 'miengiamdinhmuc', 
            label: 'Quản lý miễn giảm định mức', 
            icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', 
            component: <MienGiamDinhMucManagement /> 
        },
    ];

    if (authChecking || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50/50 to-indigo-50/30 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-400/8 to-indigo-400/8 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-20 w-56 h-56 bg-gradient-to-r from-violet-400/8 to-purple-400/8 rounded-full blur-3xl animate-float-delayed"></div>
                </div>
                
                <div className="relative z-10">
                    <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/20 max-w-sm w-full mx-4 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="relative mb-6">
                                <div className="w-16 h-16 relative flex justify-center items-center">
                                    <div className="absolute w-full h-full border-3 border-purple-200/30 rounded-full"></div>
                                    <div className="absolute w-10 h-10 border-t-2 border-indigo-400 rounded-full animate-spin-reverse"></div>
                                    <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-full shadow-lg flex items-center justify-center">
                                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                    {authChecking ? "Đang xác thực..." : "Đang tải Dashboard"}
                                </h3>
                                <p className="text-gray-600 text-xs leading-relaxed max-w-xs">
                                    {authChecking
                                        ? "Hệ thống đang xác thực quyền quản trị của bạn"
                                        : "Hệ thống đang chuẩn bị dữ liệu quản trị"}
                                </p>
                            </div>
                            
                            <div className="w-full">
                                <div className="h-1.5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-violet-500 rounded-full animate-loading-wave"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(180deg); }
                    }
                    @keyframes float-delayed {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-15px) rotate(-180deg); }
                    }
                    @keyframes spin-reverse {
                        from { transform: rotate(360deg); }
                        to { transform: rotate(0deg); }
                    }
                    @keyframes loading-wave {
                        0% { transform: translateX(-100%); }
                        50% { transform: translateX(0%); }
                        100% { transform: translateX(100%); }
                    }
                    .animate-float { animation: float 6s ease-in-out infinite; }
                    .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
                    .animate-spin-reverse { animation: spin-reverse 2s linear infinite; }
                    .animate-loading-wave { animation: loading-wave 2s ease-in-out infinite; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-purple-50 via-slate-50/50 to-indigo-50/30 overflow-hidden font-sans relative">
            <aside className={`fixed lg:relative inset-y-0 left-0 z-50 transform transition-all duration-500 ease-out ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 ${
                sidebarCollapsed ? "w-20" : "w-72"
            } bg-white/95 backdrop-blur-xl border-r border-white/20 shadow-2xl flex flex-col h-screen overflow-hidden`}>
                
                <div className="absolute -right-4 top-24 hidden lg:block z-10">
                    <button 
                        onClick={toggleSidebar}
                        className="w-8 h-8 bg-white/90 backdrop-blur-xl rounded-full shadow-lg border border-white/20 text-purple-600 hover:text-purple-700 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 hover:shadow-xl active:scale-95 flex items-center justify-center"
                    >
                        <svg className={`h-4 w-4 transition-transform duration-500 ${sidebarCollapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
                
                <div className={`${sidebarCollapsed ? "px-4 py-6" : "px-6 py-6"} relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600 text-white overflow-hidden`}>
                    <div className="absolute inset-0 opacity-15">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    </div>
                    
                    <div className={`relative z-10 flex ${sidebarCollapsed ? "justify-center" : "items-center space-x-4"}`}>
                        <div className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 flex items-center justify-center group hover:scale-110 transition-transform duration-300">
                            <svg className="mx-auto h-7 w-7 text-white transform transition-transform duration-700 ease-out group-hover:rotate-[360deg]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex flex-col">
                                <h1 className="text-base font-bold tracking-wide leading-tight">Đại học Thủy Lợi</h1>
                                <p className="text-sm font-medium text-purple-200 tracking-wide">Hệ thống Quản trị</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <nav className="flex-1 py-6 px-4 overflow-y-auto bg-gradient-to-b from-white/80 to-white/95 backdrop-blur-sm">
                    {!sidebarCollapsed && (
                        <div className="mb-6 px-3">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Quản trị hệ thống</h2>
                        </div>
                    )}
                    
                    <ul className="space-y-3">
                        {modules.map((module) => (
                            <li key={module.id}>
                                <button
                                    onClick={() => {
                                        setActiveModule(module.id);
                                        if (window.innerWidth < 1024) setSidebarOpen(false);
                                    }}
                                    className={`w-full group flex items-center ${
                                        sidebarCollapsed ? "justify-center px-3" : "px-4"
                                    } py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                                        activeModule === module.id
                                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200 transform scale-105"
                                            : "text-gray-700 hover:bg-gray-100/80 hover:text-purple-600 hover:scale-105 hover:shadow-md"
                                    }`}
                                    title={module.label}
                                >
                                    {activeModule === module.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/90 to-indigo-500/90 animate-gradient-x"></div>
                                    )}
                                    
                                    <div className={`${sidebarCollapsed ? "" : "mr-4"} relative z-10 transition-transform duration-300 group-hover:scale-110`}>
                                        <div className={`w-5 h-5 ${activeModule === module.id ? "text-white" : "text-purple-600 group-hover:text-purple-700"}`}>
                                            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d={module.icon} />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {!sidebarCollapsed && (
                                        <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                                            {module.label}
                                        </span>
                                    )}
                                    
                                    {sidebarCollapsed && (
                                        <div className="absolute left-full ml-6 bg-white/95 backdrop-blur-xl shadow-xl rounded-xl py-3 px-4 text-sm text-gray-700 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 z-50 border border-white/20">
                                            {module.label}
                                        </div>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                
                <div className={`border-t border-gray-100/50 ${sidebarCollapsed ? "p-4" : "p-0"} bg-white/50 backdrop-blur-sm`}>
                    {sidebarCollapsed ? (
                        <div className="relative group flex justify-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-0.5 shadow-lg cursor-pointer group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                <div className="bg-white rounded-xl w-full h-full flex items-center justify-center">
                                    <span className="text-purple-600 font-bold text-sm">
                                        {adminInfo?.ho_ten?.charAt(0) || "A"}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="absolute left-full bottom-0 ml-6 bg-white/95 backdrop-blur-xl shadow-xl rounded-xl py-3 px-2 text-sm text-gray-700 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 z-50 border border-white/20">
                                <div className="px-4 py-2">
                                    <div className="font-bold text-gray-800 mb-1">
                                        {adminInfo?.ho_ten || "Quản trị viên"}
                                    </div>
                                    <div className="text-purple-600 text-sm">
                                        Hệ thống quản trị
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
                                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm rounded-xl mx-4 mb-4 mt-3 overflow-hidden shadow-md border border-gray-100/50">
                            <div className="p-4 pb-3">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-0.5 shadow-lg">
                                        <div className="bg-white rounded-xl w-full h-full flex items-center justify-center">
                                            <span className="text-purple-600 font-bold text-base">
                                                {adminInfo?.ho_ten?.charAt(0) || "A"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-gray-800 truncate">
                                            {adminInfo?.ho_ten || "Quản trị viên"}
                                        </h3>
                                        <p className="text-sm text-purple-600 truncate mt-1">
                                            Hệ thống quản trị
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
                                    <svg className="h-5 w-5 mr-2 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4 shadow-md">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                                            modules.find(m => m.id === activeModule)?.icon || modules[0].icon
                                        } />
                                    </svg>
                                </div>

                                <span className="relative">
                                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                        {modules.find(m => m.id === activeModule)?.label || 'Dashboard'}
                                    </span>
                                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"></div>
                                </span>
                            </h1>
                        </div>
                        
                        <div className="hidden sm:flex items-center">
                            <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 rounded-xl border border-purple-100 shadow-md backdrop-blur-sm">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h4a3 3 0 003 3v1" />
                                    </svg>
                                </div>
                                <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
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
                            {modules.find(module => module.id === activeModule)?.component}
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
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-r from-purple-400/8 to-indigo-400/8 rounded-full -mr-12 -mt-12"></div>
                                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-r from-violet-400/8 to-purple-400/8 rounded-full -ml-10 -mb-10"></div>
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
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-xl border-2 border-white/50">
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
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce shadow-lg"></div>
                                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg"></div>
                                    <div className="absolute top-1/2 -right-2 w-1 h-1 bg-pink-400 rounded-full animate-ping"></div>
                                </div>

                                <div className="mb-5">
                                    <div className="bg-gradient-to-r from-purple-50/80 via-indigo-50/80 to-violet-50/80 backdrop-blur-sm p-3 rounded-lg border border-purple-200/20 mb-3 shadow-lg max-w-md mx-auto">
                                        <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                            Xin chào, {adminInfo?.ho_ten || "Quản trị viên"}! 👋
                                        </h2>
                                        <p className="text-xs text-gray-600 font-medium mt-1">
                                            Chào mừng đến với hệ thống quản trị khối lượng giảng dạy
                                        </p>
                                    </div>
                                    <div className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 rounded-full shadow-sm">
                                        <span className="text-xs font-semibold text-purple-700">
                                            🏫 Đại học Thủy Lợi
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-5 max-w-2xl">
                                    {[{
                                        icon: (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        ),
                                        title: "Quản lý người dùng",
                                        desc: "Quản lý giảng viên & quản lý",
                                        color: "from-blue-50 to-indigo-50 border-blue-200/50"
                                    },
                                    {
                                        icon: (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        ),
                                        title: "Quản lý khoa - bộ môn",
                                        desc: "Cấu hình cơ cấu tổ chức",
                                        color: "from-emerald-50 to-green-50 border-emerald-200/50"
                                    },
                                    {
                                        icon: (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                        ),
                                        title: "Định mức & hệ số",
                                        desc: "Cấu hình quy định hệ thống",
                                        color: "from-purple-50 to-pink-50 border-purple-200/50"
                                    },
                                    {
                                        icon: (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        ),
                                        title: "Thời gian kê khai",
                                        desc: "Thiết lập chu kỳ báo cáo",
                                        color: "from-orange-50 to-yellow-50 border-orange-200/50"
                                    }].map((feature, index) => (
                                        <div
                                            key={index}
                                            className={`bg-gradient-to-br ${feature.color} backdrop-blur-sm p-3 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 group hover:scale-105 cursor-pointer`}
                                        >
                                            <div className="text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                                                {feature.icon}
                                            </div>
                                            
                                            <div className="text-left">
                                                <h4 className="flex justify-center text-xs font-bold text-gray-800 mb-1 group-hover:text-purple-700 transition-colors duration-300">
                                                    {feature.title}
                                                </h4>
                                                <p className="flex justify-center text-xs text-gray-600 leading-relaxed">
                                                    {feature.desc}
                                                </p>
                                            </div>

                                            <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="w-4 h-4 bg-white/80 rounded-full flex items-center justify-center">
                                                    <svg className="w-2 h-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="w-full flex items-center justify-center gap-4 mb-5 p-3 bg-gradient-to-r from-gray-50/80 via-white/80 to-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50 max-w-md mx-auto">
                                    <div className="text-center">
                                        <div className="flex justify-center mb-1">
                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div className="text-sm font-bold text-purple-600 mb-1">Quản trị</div>
                                        <div className="text-xs text-gray-600 font-medium">Toàn quyền</div>
                                    </div>
                                    <div className="w-px h-5 bg-gray-300"></div>
                                    <div className="text-center">
                                        <div className="flex justify-center mb-1">
                                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div className="text-sm font-bold text-emerald-600 mb-1">Bảo mật</div>
                                        <div className="text-xs text-gray-600 font-medium">An toàn cao</div>
                                    </div>
                                    <div className="w-px h-5 bg-gray-300"></div>
                                    <div className="text-center">
                                        <div className="flex justify-center mb-1">
                                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div className="text-sm font-bold text-indigo-600 mb-1">Hiệu quả</div>
                                        <div className="text-xs text-gray-600 font-medium">Tự động hóa</div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md mx-auto">
                                    <button
                                        onClick={dismissWelcomePopup}
                                        className="flex-1 py-2.5 px-5 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/30 hover:scale-105 active:scale-95 group"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            <span className="text-sm">Bắt đầu quản trị</span>
                                            <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            dismissWelcomePopup();
                                            setActiveModule("users");
                                        }}
                                        className="flex-1 py-2.5 px-5 bg-white border-2 border-purple-200 text-purple-600 font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-purple-50 hover:border-purple-300 hover:scale-105 active:scale-95 group"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="text-sm">Quản lý ngay</span>
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
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes gradient-x {
                        0%, 100% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                    }
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(180deg); }
                    }
                    @keyframes float-delayed {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-15px) rotate(-180deg); }
                    }

                    .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
                    .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 3s ease infinite; }
                    .animate-float { animation: float 6s ease-in-out infinite; }
                    .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; animation-delay: 2s; }
                `}</style>
            </main>
        </div>
    );
}

export default AdminDashboard;