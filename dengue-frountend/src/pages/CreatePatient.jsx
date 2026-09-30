import React, { useState } from 'react';
import api from '../api';
import './AdminForms.css';
import { UserPlus } from 'lucide-react';

const CreatePatient = () => {
    const [formData, setFormData] = useState({
        name: '',
        b_day: '',
        nic: '',
        telephone: '',
        address: '',
        bed_no: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const payload = {
                ...formData,
                bed_no: parseInt(formData.bed_no, 10)
            };
            const response = await api.post('/ward/patients', payload);
            setStatus({ type: 'success', message: response.data.message || 'Patient admitted successfully!' });
            setFormData({ name: '', b_day: '', nic: '', telephone: '', address: '', bed_no: '' });
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Error admitting patient.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="admin-form-header">
                <h2 className="admin-form-title">Admit Patient</h2>
                <p className="admin-form-subtitle">Register and admit a new patient to a vacant bed in your ward.</p>
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
                        <label className="admin-form-label">Date of Birth</label>
                        <input type="date" name="b_day" className="admin-form-input" value={formData.b_day} onChange={handleChange} required />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">NIC Number</label>
                        <input type="text" name="nic" className="admin-form-input" value={formData.nic} onChange={handleChange} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Telephone</label>
                        <input type="tel" name="telephone" className="admin-form-input" value={formData.telephone} onChange={handleChange} />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Assign Bed Number</label>
                        <input type="number" name="bed_no" className="admin-form-input" value={formData.bed_no} onChange={handleChange} required min="1" placeholder="e.g. 5" />
                    </div>
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-label">Address</label>
                    <input type="text" name="address" className="admin-form-input" value={formData.address} onChange={handleChange} />
                </div>

                <button type="submit" className="admin-btn-submit" disabled={loading}>
                    <UserPlus size={18} /> {loading ? 'Admitting...' : 'Admit Patient'}
                </button>
            </form>
        </div>
    );
};

export default CreatePatient;
