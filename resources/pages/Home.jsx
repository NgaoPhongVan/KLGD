import React from 'react';
import Logout from '../components/Auth/Logout';

function Home() {
    const user = JSON.parse(localStorage.getItem('user')) || {};

    return (
        <div style={{ padding: '20px' }}>
            <h1>Xin chào, {user.ho_ten || 'Người dùng'}</h1>
            <p>Vai trò: {user.vai_tro === 1 ? 'Admin' : user.vai_tro === 2 ? 'Manager' : 'Giảng viên'}</p>
            <Logout />
        </div>
    );
}

export default Home;