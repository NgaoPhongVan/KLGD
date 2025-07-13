import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import NotFound from './pages/NotFound';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/manager/*" element={<ManagerDashboard />} />
                <Route path="/lecturer/*" element={<LecturerDashboard />} />
                <Route path="/" element={<Login />} />
                
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;
