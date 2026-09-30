import React, { useState } from 'react';
import api from '../api';
import './AdminForms.css';
import { Building } from 'lucide-react';

const CreateHospitalWard = () => {
    const [formData, setFormData] = useState({
        ward_id: '',
        beds: '',
        username: '',
        password: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const payload = {
                ...formData,
                ward_id: parseInt(formData.ward_id, 10),
                beds: parseInt(formData.beds, 10)
            };
            const response = await api.post('/hospital/wards', payload);
            setStatus({ type: 'success', message: response.data.message || 'Ward created successfully!' });
            setFormData({ ward_id: '', beds: '', username: '', password: '' });
        } catch (err) {
            console.error(err);
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Failed to create ward.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="admin-form-header">
                <h2 className="admin-form-title">Add New Ward</h2>
                <p className="admin-form-subtitle">Register a new ward in your hospital and issue terminal credentials.</p>
            </div>

            {status.message && (
                <div className={`alert-message alert-${status.type}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Ward ID / Number</label>
                        <input type="number" name="ward_id" className="admin-form-input" value={formData.ward_id} onChange={handleChange} required min="1" placeholder="e.g. 1" />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Total Beds</label>
                        <input type="number" name="beds" className="admin-form-input" value={formData.beds} onChange={handleChange} required min="0" placeholder="e.g. 50" />
                    </div>
                </div>

                <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600', marginBottom: '1rem' }}>Ward Terminal Credentials</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">System Username</label>
                        <input type="text" name="username" className="admin-form-input" value={formData.username} onChange={handleChange} required placeholder="e.g. ward1_login" />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Initial Password</label>
                        <input type="password" name="password" className="admin-form-input" value={formData.password} onChange={handleChange} required minLength="6" placeholder="Min 6 characters" />
                    </div>
                </div>

                <button type="submit" className="admin-btn-submit" disabled={loading}>
                    <Building size={18} /> {loading ? 'Creating...' : 'Create Ward'}
                </button>
            </form>
        </div>
    );
};

export default CreateHospitalWard;
