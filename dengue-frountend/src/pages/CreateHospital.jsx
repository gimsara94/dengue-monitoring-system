import React, { useState } from 'react';
import api from '../api';
import './AdminForms.css';
import { Save } from 'lucide-react';

const CreateHospital = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        telephone: '',
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
            await api.post('/admin/hospital', formData);
            setStatus({ type: 'success', message: 'Hospital and Admin Login created successfully!' });
            setFormData({ name: '', address: '', telephone: '', email: '', username: '', password: '' });
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Error creating hospital.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-form-container">
            <div className="admin-form-header">
                <h2 className="admin-form-title">Register New Hospital</h2>
                <p className="admin-form-subtitle">Add a new hospital facility to the network.</p>
            </div>

            {status.message && (
                <div className={`alert-message alert-${status.type}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="admin-form-group">
                    <label className="admin-form-label">Hospital Name</label>
                    <input type="text" name="name" className="admin-form-input" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="admin-form-group">
                    <label className="admin-form-label">Address</label>
                    <input type="text" name="address" className="admin-form-input" value={formData.address} onChange={handleChange} required />
                </div>
                <div className="admin-form-group">
                    <label className="admin-form-label">Telephone</label>
                    <input type="tel" name="telephone" className="admin-form-input" value={formData.telephone} onChange={handleChange} required />
                </div>
                <div className="admin-form-group">
                    <label className="admin-form-label">Email</label>
                    <input type="email" name="email" className="admin-form-input" value={formData.email} onChange={handleChange} required />
                </div>

                <div style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>Hospital Admin Credentials</h3>
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-label">System Username</label>
                    <input type="text" name="username" className="admin-form-input" value={formData.username} onChange={handleChange} required />
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-label">Initial Password</label>
                    <input type="password" name="password" className="admin-form-input" value={formData.password} onChange={handleChange} required minLength="6" />
                </div>

                <button type="submit" className="admin-btn-submit" disabled={loading}>
                    <Save size={18} /> {loading ? 'Creating...' : 'Create Hospital'}
                </button>
            </form>
        </div>
    );
};

export default CreateHospital;
