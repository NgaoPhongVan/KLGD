import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import Login from '../components/Auth/Login';
import ForgotPassword from '../components/Auth/ForgotPassword';
import ResetPassword from '../components/Auth/ResetPassword';
import AdminDashboard from '../pages/AdminDashboard';
import ManagerDashboard from '../pages/ManagerDashboard';
import LecturerDashboard from '../pages/LecturerDashboard';
import KeKhaiGiangDayForm from "../components/Lecturer/KeKhaiGiangDayForm";
import ManagerStatistics from "../components/Manager/ManagerStatistics";
import NotFound from '../pages/NotFound';

// Wrapper component for KeKhaiHoatDong to handle navigation
function KeKhaiHoatDongWrapper() {
    const [searchParams] = useSearchParams();
    const source = searchParams.get('source');
    
    // Custom navigation handler
    const handleNavigation = () => {
        if (source === 'dashboard') {
            window.location.href = '/lecturer/dashboard';
        } else {
            window.location.href = '/lecturer/dashboard';
        }
    };

    return <LecturerDashboard setActiveTab={handleNavigation} inDashboard={false} />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
                <Route path="/" element={<Login />} />
                <Route
                    path="/lecturer/ke-khai"
                    element={<KeKhaiHoatDongWrapper />}
                />
                <Route path="/manager/statistics" element={<ManagerStatistics />} />
                {/* 404 Page - catch all unmatched routes */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

const root = createRoot(document.getElementById('app'));
root.render(<App />);