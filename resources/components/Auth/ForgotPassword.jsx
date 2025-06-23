import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await axios.post('/api/forgot-password', { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Enhanced background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-indigo-600/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-float-delayed"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
                
                {/* Additional floating elements */}
                <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400/30 rounded-full animate-bounce"></div>
                <div className="absolute bottom-20 right-20 w-3 h-3 bg-purple-400/40 rounded-full animate-ping"></div>
                <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-indigo-400/50 rounded-full animate-pulse"></div>
            </div>

            <div className="relative max-w-md w-full">
                {/* Main forgot password card */}
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 transition-all duration-300 hover:shadow-3xl">
                    
                    {/* Enhanced header with icon animation */}
                    <div className="text-center mb-8">
                        <div className="relative inline-block group">
                            {/* Main icon container */}
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:scale-105 animate-gentle-sway">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 text-white transition-all duration-700 group-hover:rotate-12 group-hover:scale-110"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            
                            {/* Enhanced animated accent with key icon */}
                            <div className="absolute -top-2 -right-2 flex items-center justify-center">
                                <div className="relative">
                                    {/* Animated ring */}
                                    <div className="absolute inset-0 w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-ping opacity-20"></div>
                                    
                                    {/* Main accent with key icon */}
                                    <div className="relative w-7 h-7 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center group-hover:animate-bounce">
                                        {/* Key icon */}
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 16.5H9v1.5H7.5V20H3v-4.5l8.257-8.257A6 6 0 0115 7z" />
                                        </svg>
                                        
                                        {/* Subtle glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full blur-sm opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h1 className="mt-6 text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Quên mật khẩu?
                        </h1>
                        <p className="mt-3 text-base font-medium text-gray-600 leading-relaxed">
                            Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu
                        </p>
                        <div className="mt-4 h-1 w-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mx-auto"></div>
                    </div>

                    {/* Enhanced form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group">
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600"
                            >
                                <span className="flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-2 transition-transform group-focus-within:scale-110"
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
                                    Địa chỉ email của bạn
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ten@example.com"
                                    className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400"
                                    required
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-focus-within:opacity-10 transition-opacity duration-200 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Enhanced success message */}
                        {message && (
                            <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 p-4 animate-fade-in">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                                            <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <h3 className="text-sm font-semibold text-emerald-800 mb-1">Email đã được gửi!</h3>
                                        <p className="text-sm text-emerald-700">{message}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Enhanced error message */}
                        {error && (
                            <div className="rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 p-4 animate-fade-in">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                                            <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <h3 className="text-sm font-semibold text-red-800 mb-1">Có lỗi xảy ra!</h3>
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Enhanced buttons */}
                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-amber-300 ${
                                    loading
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
                                            Đang gửi email...
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
                                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                />
                                            </svg>
                                            Gửi liên kết đặt lại
                                        </>
                                    )}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="w-full bg-white/70 backdrop-blur-sm border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-800 font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-gray-200 group"
                            >
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                        />
                                    </svg>
                                    Quay lại đăng nhập
                                </span>
                            </button>
                        </div>
                    </form>

                    {/* Enhanced helpful information */}
                    <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-semibold text-blue-800 mb-1">Lưu ý quan trọng</h3>
                                <p className="text-sm text-blue-700 leading-relaxed">
                                    Kiểm tra cả hộp thư chính và thư mục spam. Liên kết sẽ hết hạn sau 60 phút.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-500">
                            © 2024 Đại học Thủy Lợi. Tất cả quyền được bảo lưu.
                        </p>
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
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(-180deg); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                
                .animate-gentle-sway {
                    animation: gentle-sway 4s ease-in-out infinite;
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                
                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                    animation-delay: 2s;
                }
                
                .border-3 {
                    border-width: 3px;
                }
                
                .shadow-3xl {
                    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
                }
            `}</style>
        </div>
    );
}

export default ForgotPassword;