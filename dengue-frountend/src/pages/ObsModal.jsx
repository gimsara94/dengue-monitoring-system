import React, { useState } from 'react';
import api from '../api';
import { Activity } from 'lucide-react';

const ObsModal = ({ isOpen, onClose, date, timeSlot, bedNo, hospital_id, ward_id, onSaveSuccess }) => {
    const [observationText, setObservationText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!observationText.trim()) {
            setError('Please enter an observation.');
            return;
        }

        setLoading(true);
        setError('');

        const payload = {
            chart_date: date,
            chart_time: timeSlot + ':00',
            observation_text: observationText.trim()
        };

        try {
            const endpoint = (hospital_id && ward_id)
                ? `/charts/staff/${hospital_id}/${ward_id}/observations/${bedNo}`
                : `/charts/ward/observations/${bedNo}`;
            await api.post(endpoint, payload);
            setObservationText('');
            onSaveSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving observation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Activity size={20} color="#166534" /> Record Observation
                </h3>
                <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>Entry for {date} @ {timeSlot}</p>

                {error && <div className="alert-message alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="admin-form-label">Observation / Action taken</label>
                        <textarea
                            className="admin-form-input"
                            rows="4"
                            value={observationText}
                            onChange={(e) => setObservationText(e.target.value)}
                            style={{ resize: 'vertical' }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="admin-btn-submit" style={{ background: 'white', color: '#475569', border: '1px solid #cbd5e1' }} onClick={() => { setError(''); onClose(); }}>Cancel</button>
                        <button type="submit" className="admin-btn-submit" style={{ backgroundColor: '#166534' }} disabled={loading}>{loading ? 'Saving...' : 'Save Observation'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ObsModal;
