import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();

    const getUserRole = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;

            const userString = localStorage.getItem('user');
            if (!userString) return null;

            const user = JSON.parse(userString);
            return user.vai_tro || null;
        } catch (error) {
            return null;
        }
    };

    const getDashboardRoute = () => {
        const role = getUserRole();
        if (role === 1) return '/admin/dashboard';
        if (role === 2) return '/manager/dashboard';
        if (role === 3) return '/lecturer/dashboard';
        return '/login';
    };

    useEffect(() => {
        navigate(getDashboardRoute());
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post("/api/login", {
                email,
                password,
            });
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            const vaiTro = response.data.user.vai_tro;
            if (vaiTro === 1) {
                window.location.href = "/admin/dashboard";
            } else if (vaiTro === 2) {
                window.location.href = "/manager/dashboard";
            } else {
                window.location.href = "/lecturer/dashboard";
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Đăng nhập thất bại"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-float gpu-accelerated"></div>
                <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-float-delayed gpu-accelerated"></div>
                <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-float-slow gpu-accelerated"></div>

                <div className="floating-element">
                    <div className="w-20 h-20 border border-white/10 rounded-lg rotate-45"></div>
                </div>
                <div className="floating-element">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full"></div>
                </div>
                <div className="floating-element">
                    <div className="w-12 h-12 border border-cyan-400/20 rounded-full"></div>
                </div>
            </div>

            <div className="relative max-w-7xl w-full">
                <div className="lg:hidden text-center mb-8 text-white animate-fade-in-up mobile-spacing">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        <img
                            src="/images/logo.png"
                            alt="Logo Trường Đại học Thủy Lợi"
                            className="mobile-logo object-contain bg-white/90 rounded-xl p-1 shadow-lg logo-hover"
                        />
                        <img
                            src="/images/logohsv.png"
                            alt="Logo Hội Sinh viên"
                            className="mobile-logo object-contain bg-white/90 rounded-xl p-1 shadow-lg logo-hover"
                        />
                        <img
                            src="/images/logodtn.png"
                            alt="Logo Đoàn Thanh niên"
                            className="mobile-logo object-contain bg-white/90 rounded-xl p-1 shadow-lg logo-hover"
                        />
                    </div>
                    <h1 className="mobile-text font-bold bg-gradient-to-r from-yellow-300 via-white to-cyan-300 bg-clip-text text-transparent mb-2 text-shimmer drop-shadow-lg">TRƯỜNG ĐẠI HỌC THỦY LỢI</h1>
                    <p className="text-blue-100 mb-2">Đoàn Thanh niên - Hội Sinh viên</p>
                    <p className="text-cyan-200">Hệ Thống Quản lý Khối lượng công tác</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="hidden lg:flex flex-col items-center justify-center space-y-8 text-white animate-slide-in-left">
                        <div className="flex items-center justify-center space-x-8 mb-8 animate-fade-in-up">
                            <div className="group relative gpu-accelerated">
                                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                                <img
                                    src="/images/logo.png"
                                    alt="Logo Trường Đại học Thủy Lợi"
                                    className="relative h-20 w-20 object-contain bg-white/90 rounded-2xl p-2 shadow-xl transform transition-all duration-500 hover:scale-110 hover:rotate-3 logo-hover focus-ring"
                                />
                            </div>
                            <div className="group relative gpu-accelerated">
                                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                                <img
                                    src="/images/logohsv.png"
                                    alt="Logo Hội Sinh viên"
                                    className="relative h-20 w-20 object-contain bg-white/90 rounded-2xl p-2 shadow-xl transform transition-all duration-500 hover:scale-110 hover:-rotate-3 logo-hover focus-ring"
                                />
                            </div>
                            <div className="group relative gpu-accelerated">
                                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                                <img
                                    src="/images/logodtn.png"
                                    alt="Logo Đoàn Thanh niên"
                                    className="relative h-20 w-20 object-contain bg-white/90 rounded-2xl p-2 shadow-xl transform transition-all duration-500 hover:scale-110 hover:rotate-3 logo-hover focus-ring"
                                />
                            </div>
                        </div>

                        <div className="text-center space-y-6 animate-slide-in-right">
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-300 via-white to-cyan-300 bg-clip-text text-transparent leading-tight text-shimmer drop-shadow-2xl university-title">
                                TRƯỜNG ĐẠI HỌC THỦY LỢI
                            </h1>
                            <p className="text-2xl font-semibold text-blue-100 tracking-wide">
                                Đoàn Thanh niên - Hội Sinh viên
                            </p>
                            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mx-auto animate-pulse"></div>
                            <p className="text-xl font-medium text-blue-200 mt-6">
                                Hệ Thống Quản lý Khối lượng công tác
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center lg:justify-end animate-slide-in-right">
                        <div className="relative max-w-md w-full">
                            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/30 transition-all duration-300 hover:shadow-3xl hover:bg-white/95">
                                <div className="text-center mb-8 animate-fade-in-up">
                                    <div className="relative inline-block group">
                                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-4 shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:scale-105 animate-gentle-sway">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-12 w-12 text-white transition-all duration-700 group-hover:rotate-12 group-hover:scale-110"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M12 14l9-5-9-5-9 5 9 5z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                                                />
                                            </svg>
                                        </div>

                                        <div className="absolute -top-2 -right-2 flex items-center justify-center">
                                            <div className="relative">
                                                <div className="absolute inset-0 w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full animate-ping opacity-20"></div>

                                                <div className="relative w-7 h-7 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center group-hover:animate-bounce">
                                                    <div className="w-2 h-2 bg-white rounded-full opacity-80 animate-pulse"></div>

                                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full blur-sm opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <h1 className="mt-4 text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                        Đăng nhập hệ thống
                                    </h1>
                                    <div className="mt-3 h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div className="space-y-5">
                                        <div className="group">
                                            <label
                                                htmlFor="email"
                                                className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600"
                                            >
                                                <span className="flex items-center">
                                                    <svg
                                                        className="w-4 h-4 mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                                        />
                                                    </svg>
                                                    Email của bạn
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) =>
                                                        setEmail(e.target.value)
                                                    }
                                                    placeholder="ten@example.com"
                                                    className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400"
                                                    required
                                                />
                                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-focus-within:opacity-10 transition-opacity duration-200 pointer-events-none"></div>
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label
                                                htmlFor="password"
                                                className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600"
                                            >
                                                <span className="flex items-center">
                                                    <svg
                                                        className="w-4 h-4 mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                        />
                                                    </svg>
                                                    Mật khẩu
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="password"
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) =>
                                                        setPassword(e.target.value)
                                                    }
                                                    placeholder="••••••••"
                                                    className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400"
                                                    required
                                                />
                                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-focus-within:opacity-10 transition-opacity duration-200 pointer-events-none"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end">
                                        <a
                                            href="/forgot-password"
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors duration-200 hover:underline"
                                        >
                                            Quên mật khẩu?
                                        </a>
                                    </div>

                                    {error && (
                                        <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-fade-in">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg
                                                        className="h-5 w-5 text-red-400"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-red-700">
                                                        {error}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:via-blue-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-300 btn-enhanced gpu-accelerated ${loading
                                                ? "opacity-75 cursor-not-allowed hover:transform-none"
                                                : ""
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="relative flex items-center justify-center">
                                            {loading ? (
                                                <>
                                                    <svg
                                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    Đang đăng nhập...
                                                </>
                                            ) : (
                                                <>
                                                    <svg
                                                        className="w-5 h-5 mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                                        />
                                                    </svg>
                                                    Đăng nhập
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </form>

                                <div className="mt-8 text-center">
                                    <p className="text-xs text-gray-500">
                                        © 2025 Đại học Thủy Lợi. Tất cả quyền được bảo lưu.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes gentle-sway {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(0.5deg); }
                    75% { transform: rotate(-0.5deg); }
                }
                
                @keyframes slide-in-left {
                    from { opacity: 0; transform: translateX(-100px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes slide-in-right {
                    from { opacity: 0; transform: translateX(100px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(10deg); }
                }
                
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-30px) rotate(-10deg); }
                }
                
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                }
                
                @keyframes sparkle {
                    0%, 100% { 
                        transform: scale(1) rotate(0deg);
                        opacity: 1;
                    }
                    50% { 
                        transform: scale(1.1) rotate(180deg);
                        opacity: 0.8;
                    }
                }
                
                @keyframes text-shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                
                .animate-gentle-sway {
                    animation: gentle-sway 4s ease-in-out infinite;
                }
                
                .animate-slide-in-left {
                    animation: slide-in-left 1s ease-out;
                }
                
                .animate-slide-in-right {
                    animation: slide-in-right 1s ease-out 0.3s both;
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 1s ease-out 0.6s both;
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                
                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                }
                
                .animate-float-slow {
                    animation: float-slow 10s ease-in-out infinite;
                }
                
                .logo-hover:hover {
                    animation: sparkle 0.6s ease-in-out;
                }
                
                .text-shimmer {
                    background: linear-gradient(
                        90deg, 
                        rgba(255, 235, 59, 0.9),
                        rgba(255, 255, 255, 0.95),
                        rgba(224, 247, 250, 0.9)
                    ) !important;
                    background-size: 200% 100% !important;
                    animation: text-shimmer 3s infinite;
                    -webkit-background-clip: text !important;
                    background-clip: text !important;
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.4),
                        0 0 20px rgba(255, 235, 59, 0.2),
                        0 1px 2px rgba(0, 0, 0, 0.2);

                    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
                }
                
                .university-title {
                    position: relative;
                }
                
                .university-title::before {
                    content: 'TRƯỜNG ĐẠI HỌC THỦY LỢI';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: -1;
                    background: linear-gradient(
                        90deg,
                        rgba(255, 235, 59, 0.3),
                        rgba(255, 255, 255, 0.4),
                        rgba(224, 247, 250, 0.3)
                    );
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    filter: blur(2px);
                    animation: glow-pulse 2s ease-in-out infinite alternate;
                }
                
                @keyframes glow-pulse {
                    from { 
                        filter: blur(2px) brightness(1);
                        transform: scale(1);
                    }
                    to { 
                        filter: blur(3px) brightness(1.2);
                        transform: scale(1.02);
                    }
                }
                
                .gpu-accelerated {
                    transform: translateZ(0);
                    backface-visibility: hidden;
                    perspective: 1000px;
                }
                
                .focus-ring:focus {
                    outline: 2px solid rgba(59, 130, 246, 0.6);
                    outline-offset: 2px;
                }
                
                .btn-enhanced::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.2),
                        transparent
                    );
                    transition: left 0.5s;
                }
                
                .btn-enhanced:hover::before {
                    left: 100%;
                }
                
                .floating-element {
                    position: absolute;
                    pointer-events: none;
                    opacity: 0.1;
                }
                
                .floating-element:nth-child(1) {
                    top: 10%;
                    left: 10%;
                    animation: float 6s ease-in-out infinite;
                }
                
                .floating-element:nth-child(2) {
                    top: 60%;
                    right: 10%;
                    animation: float-delayed 8s ease-in-out infinite;
                }
                
                .floating-element:nth-child(3) {
                    bottom: 20%;
                    left: 20%;
                    animation: float-slow 10s ease-in-out infinite;
                }
                
                .border-3 {
                    border-width: 3px;
                }
                
                @media (max-width: 768px) {
                    .mobile-spacing {
                        padding: 1rem;
                    }
                    
                    .mobile-text {
                        font-size: 1.5rem;
                        line-height: 1.4;
                    }
                    
                    .mobile-logo {
                        height: 3rem;
                        width: 3rem;
                    }
                }

                /* Màn hình lớn hơn điện thoại, nhỏ hơn laptop */
                @media (min-width: 769px) and (max-width: 1024px) {
                    .mobile-spacing {
                        padding: 2rem;
                    }

                    .mobile-text {
                        font-size: 1.8rem;
                        line-height: 1.6;
                    }

                    .mobile-logo {
                        height: 4rem;
                        width: 4rem;
                    }
                }

            `}</style>
        </div>
    );
}

export default Login;
