import React, { useState } from 'react';
import api from '../api';
import { Activity } from 'lucide-react';

const LabsModal = ({ isOpen, onClose, date, timeSlot, bedNo, hospital_id, ward_id, onSaveSuccess, activeField }) => {
    const [formData, setFormData] = useState({
        pcv_percentage: '',
        plt_count: '',
        wbc_total: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = {
            chart_date: date,
            chart_time: timeSlot + ':00',
        };

        Object.keys(formData).forEach(key => {
            if (formData[key] !== '') {
                payload[key] = parseFloat(formData[key]);
            }
        });

        if (Object.keys(payload).length <= 2) {
            setError('Please enter at least one lab value.');
            setLoading(false);
            return;
        }

        try {
            const endpoint = (hospital_id && ward_id)
                ? `/charts/staff/${hospital_id}/${ward_id}/labs/${bedNo}`
                : `/charts/ward/labs/${bedNo}`;
            await api.post(endpoint, payload);
            setFormData({ pcv_percentage: '', plt_count: '', wbc_total: '' });
            onSaveSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving labs');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Activity size={20} color="#86198f" /> Record Labs
                </h3>
                <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>Entry for {date} @ {timeSlot}</p>

                {error && <div className="alert-message alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(!activeField || activeField === 'pcv_percentage') && (
                        <div>
                            <label className="admin-form-label">PCV %</label>
                            <input type="number" step="0.1" name="pcv_percentage" className="admin-form-input" value={formData.pcv_percentage} onChange={handleChange} min="0" max="100" />
                        </div>
                    )}

                    {(!activeField || activeField === 'plt_count') && (
                        <div>
                            <label className="admin-form-label">Plt /mm³</label>
                            <input type="number" name="plt_count" className="admin-form-input" value={formData.plt_count} onChange={handleChange} min="0" />
                        </div>
                    )}

                    {(!activeField || activeField === 'wbc_total') && (
                        <div>
                            <label className="admin-form-label">WBC Total</label>
                            <input type="number" step="0.1" name="wbc_total" className="admin-form-input" value={formData.wbc_total} onChange={handleChange} min="0" />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="admin-btn-submit" style={{ background: 'white', color: '#475569', border: '1px solid #cbd5e1' }} onClick={() => { setError(''); onClose(); }}>Cancel</button>
                        <button type="submit" className="admin-btn-submit" style={{ backgroundColor: '#86198f' }} disabled={loading}>{loading ? 'Saving...' : 'Save Labs'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LabsModal;
