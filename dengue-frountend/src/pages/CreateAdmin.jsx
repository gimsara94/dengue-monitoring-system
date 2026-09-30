import React, { useState } from 'react';
import api from '../api';
import './AdminForms.css';
import { ShieldCheck } from 'lucide-react';

const CreateAdmin = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await api.post('/admin/admin', formData);
            setStatus({ type: 'success', message: 'Admin account created successfully!' });
            setFormData({ username: '', password: '' });
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Error creating admin.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-form-container" style={{ maxWidth: '450px' }}>
            <div className="admin-form-header">
                <h2 className="admin-form-title">Create Admin</h2>
                <p className="admin-form-subtitle">Provision an account with administrative privileges.</p>
            </div>

            {status.message && (
                <div className={`alert-message alert-${status.type}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="admin-form-group">
                    <label className="admin-form-label">Username</label>
                    <input type="text" name="username" className="admin-form-input" value={formData.username} onChange={handleChange} required />
                </div>
                <div className="admin-form-group">
                    <label className="admin-form-label">Password</label>
                    <input type="password" name="password" className="admin-form-input" value={formData.password} onChange={handleChange} required minLength="6" />
                </div>
                <button type="submit" className="admin-btn-submit" disabled={loading}>
                    <ShieldCheck size={18} /> {loading ? 'Creating...' : 'Create Admin'}
                </button>
            </form>
        </div>
    );
};

export default CreateAdmin;
