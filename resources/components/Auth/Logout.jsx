import React from 'react';
import axios from 'axios';

function Logout() {
    const handleLogout = async () => {
        try {
            await axios.post('/api/logout', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } catch (err) {
            console.error('Đăng xuất thất bại', err);
        }
    };

    return (
        <button
            onClick={handleLogout}
            style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none' }}
        >
            Đăng xuất
        </button>
    );
}

export default Logout;