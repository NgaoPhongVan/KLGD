import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
    const [clickCount, setClickCount] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    
    // Get user's role from localStorage if available
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

    // Get appropriate dashboard route based on user role
    const getDashboardRoute = () => {
        const role = getUserRole();
        if (role === 1) return '/admin/dashboard';
        if (role === 2) return '/manager/dashboard';
        if (role === 3) return '/lecturer/dashboard';
        return '/login';
    };
    
    // Countdown timer effect
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            navigate(getDashboardRoute());
        }
    }, [countdown, navigate]);
    
    // Mouse tracking for parallax effect
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height
        });
    };
    
    // Easter egg click handler
    const handleEasterEgg = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        
        if (newCount === 5) {
            setShowConfetti(true);
            setTimeout(() => {
                setShowConfetti(false);
                setClickCount(0);
            }, 3000);
        }
    };
    
    return (
        <div 
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Floating orbs with parallax */}
                <div 
                    className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-xl animate-float"
                    style={{ 
                        transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)` 
                    }}
                />
                <div 
                    className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-teal-400/20 rounded-full blur-xl animate-float-delayed"
                    style={{ 
                        transform: `translate(${-mousePosition.x * 40}px, ${-mousePosition.y * 40}px)` 
                    }}
                />
                <div 
                    className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-xl animate-pulse"
                    style={{ 
                        transform: `translate(${mousePosition.y * 20}px, ${mousePosition.x * 20}px)` 
                    }}
                />
                
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="h-full w-full" style={{
                        backgroundImage: `
                            linear-gradient(90deg, #6366f1 1px, transparent 1px),
                            linear-gradient(#6366f1 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px'
                    }} />
                </div>
            </div>

            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-3 h-3 rounded-full animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>
            )}
            
            {/* Main Content */}
            <div className="relative z-10 max-w-4xl w-full">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12 hover:shadow-indigo-100/50 transition-all duration-500">
                    <div className="text-center mb-12">
                        {/* Animated 404 */}
                        <div className="relative inline-block group cursor-pointer" onClick={handleEasterEgg}>
                            <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition-all duration-700 transform hover:scale-110 select-none">
                                404
                            </div>
                            
                            {/* Floating decorations */}
                            <div className="absolute -top-4 -left-4 text-4xl animate-bounce">✨</div>
                            <div className="absolute -top-2 -right-2 text-3xl animate-pulse">🚀</div>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-2xl animate-ping">💫</div>
                            
                            {/* Click counter hint */}
                            {clickCount > 0 && (
                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-indigo-500 font-medium animate-fade-in">
                                    {clickCount}/5 🎯
                                </div>
                            )}
                        </div>
                        
                        {/* Title with gradient */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Oops! Trang không tồn tại
                            </span>
                        </h1>
                        
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                            Có vẻ như bạn đang tìm kiếm một trang không tồn tại. Đừng lo lắng, 
                            <span className="font-semibold text-indigo-600"> hãy quay về trang chủ </span>
                            hoặc khám phá các tính năng khác của hệ thống.
                        </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <Link 
                            to={getDashboardRoute()}
                            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <span className="relative flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Về Trang Chủ
                            </span>
                        </Link>
                        
                        <button 
                            onClick={() => navigate(-1)} 
                            className="group px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <span className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Quay Lại
                            </span>
                        </button>
                    </div>
                    
                    {/* Auto-redirect Notice */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 relative overflow-hidden">
                        <div 
                            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                            style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                        />
                        <div className="flex items-center justify-center">
                            <div className="flex items-center text-blue-700">
                                <div className="relative mr-3">
                                    <div className="w-8 h-8 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                                <span className="text-sm font-medium">
                                    Tự động chuyển hướng sau 
                                    <span className="mx-2 px-3 py-1 bg-blue-500 text-white rounded-full font-bold text-lg min-w-[3rem] inline-block text-center">
                                        {countdown}
                                    </span>
                                    giây
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="mt-8 text-center text-gray-500">
                    <p className="font-medium">© Đại học Thủy Lợi - Hệ thống quản lý khối lượng công việc</p>
                    <p className="mt-2 text-sm">Liên hệ quản trị viên nếu bạn gặp sự cố kỹ thuật</p>
                </div>
            </div>
            
            {/* Enhanced CSS Animations */}
            <style jsx="true">{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(-3deg); }
                }
                @keyframes confetti {
                    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
                @keyframes fade-in {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite 2s;
                }
                .animate-confetti {
                    animation: confetti 3s linear forwards;
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default NotFound;
