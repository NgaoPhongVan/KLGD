import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ ho_ten: '', email: '', trang_thai: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const response = await axios.get('/api/manager/users', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsers(response.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.put(`/api/manager/users/${editingId}`, form, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchUsers();
        setForm({ ho_ten: '', email: '', trang_thai: '' });
        setEditingId(null);
    };

    const handleEdit = (user) => {
        setForm(user);
        setEditingId(user.id);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Quản lý Người dùng trong Đơn vị</h2>
            {editingId && (
                <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
                    <input value={form.ho_ten} onChange={e => setForm({ ...form, ho_ten: e.target.value })} placeholder="Họ tên" required />
                    <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" required />
                    <select value={form.trang_thai} onChange={e => setForm({ ...form, trang_thai: e.target.value })} required>
                        <option value="1">Hoạt động</option>
                        <option value="0">Khóa</option>
                    </select>
                    <button type="submit" style={{ background: '#007bff', color: 'white' }}>Cập nhật</button>
                </form>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd' }}>Mã GV</th>
                        <th style={{ border: '1px solid #ddd' }}>Họ tên</th>
                        <th style={{ border: '1px solid #ddd' }}>Email</th>
                        <th style={{ border: '1px solid #ddd' }}>Trạng thái</th>
                        <th style={{ border: '1px solid #ddd' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td style={{ border: '1px solid #ddd' }}>{user.ma_gv}</td>
                            <td style={{ border: '1px solid #ddd' }}>{user.ho_ten}</td>
                            <td style={{ border: '1px solid #ddd' }}>{user.email}</td>
                            <td style={{ border: '1px solid #ddd' }}>{user.trang_thai ? 'Hoạt động' : 'Khóa'}</td>
                            <td style={{ border: '1px solid #ddd' }}>
                                <button onClick={() => handleEdit(user)}>Sửa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserManagement;