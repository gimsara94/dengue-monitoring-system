import React, { useState } from 'react';
import api from '../api';
import './AdminForms.css';
import { UserPlus } from 'lucide-react';

const CreateNurse = () => {
    const [formData, setFormData] = useState({
        name: '',
        telephone: '',
        nic_no: '',
        address: '',
        email: '',
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
            await api.post('/admin/nurses', formData);
            setStatus({ type: 'success', message: 'Nurse registered successfully!' });
            setFormData({ name: '', telephone: '', nic_no: '', address: '', email: '', username: '', password: '' });
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Error creating nurse.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-form-container">
            <div className="admin-form-header">
                <h2 className="admin-form-title">Register Nurse</h2>
                <p className="admin-form-subtitle">Add a new nursing staff member.</p>
            </div>

            {status.message && (
                <div className={`alert-message alert-${status.type}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="admin-form-group">
                    <label className="admin-form-label">Full Name</label>
                    <input type="text" name="name" className="admin-form-input" value={formData.name} onChange={handleChange} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Telephone</label>
                        <input type="tel" name="telephone" className="admin-form-input" value={formData.telephone} onChange={handleChange} required />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">NIC Number</label>
                        <input type="text" name="nic_no" className="admin-form-input" value={formData.nic_no} onChange={handleChange} required />
                    </div>
                </div>
                <div className="admin-form-group">
                    <label className="admin-form-label">Address</label>
                    <input type="text" name="address" className="admin-form-input" value={formData.address} onChange={handleChange} required />
                </div>
                <div className="admin-form-group">
                    <label className="admin-form-label">Email</label>
                    <input type="email" name="email" className="admin-form-input" value={formData.email} onChange={handleChange} required />
                </div>

                <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">System Username</label>
                        <input type="text" name="username" className="admin-form-input" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Initial Password</label>
                        <input type="password" name="password" className="admin-form-input" value={formData.password} onChange={handleChange} required minLength="6" />
                    </div>
                </div>

                <button type="submit" className="admin-btn-submit" disabled={loading}>
                    <UserPlus size={18} /> {loading ? 'Registering...' : 'Register Nurse'}
                </button>
            </form>
        </div>
    );
};

export default CreateNurse;
