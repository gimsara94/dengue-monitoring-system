import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Activity } from 'lucide-react';

const VolumesModal = ({ isOpen, onClose, date, timeSlot, bedNo, hospital_id, ward_id, onSaveSuccess, existingData, activeField }) => {
    const [formData, setFormData] = useState({
        oral_ml: '',
        n_saline_ml: '',
        dextran_40_ml: '',
        tetrastarch_ml: '',
        blood_ml: '',
        other_ml: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef({});

    useEffect(() => {
        if (isOpen) {
            setFormData({
                oral_ml: existingData?.oral_ml ?? '',
                n_saline_ml: existingData?.n_saline_ml ?? '',
                dextran_40_ml: existingData?.dextran_40_ml ?? '',
                tetrastarch_ml: existingData?.tetrastarch_ml ?? '',
                blood_ml: existingData?.blood_ml ?? '',
                other_ml: existingData?.other_ml ?? ''
            });
            setError('');
            if (activeField && inputRefs.current[activeField]) {
                setTimeout(() => {
                    inputRefs.current[activeField]?.focus();
                }, 100);
            }
        }
    }, [isOpen, existingData, activeField]);

    if (!isOpen) return null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = {
            chart_date: date,
            chart_time: `${timeSlot}:00`
        };

        let hasData = false;
        ['oral_ml', 'n_saline_ml', 'dextran_40_ml', 'tetrastarch_ml', 'blood_ml', 'other_ml'].forEach(field => {
            if (formData[field].trim() !== '') {
                payload[field] = parseInt(formData[field]);
                hasData = true;
            }
        });

        if (!hasData) {
            setError('Please enter at least one fluid volume.');
            setLoading(false);
            return;
        }

        try {
            const endpoint = (hospital_id && ward_id)
                ? `/charts/staff/${hospital_id}/${ward_id}/volumes/${bedNo}`
                : `/charts/ward/volumes/${bedNo}`;
            await api.post(endpoint, payload);
            onSaveSuccess();
            onClose();
            setFormData({ oral_ml: '', n_saline_ml: '', dextran_40_ml: '', tetrastarch_ml: '', blood_ml: '', other_ml: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save volumes data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2><Activity size={20} /> Add Volumes</h2>
                    <br />
                    <span className="modal-subtitle">Recording for {date} at {timeSlot}</span>
                </div>

                {error && <div className="alert-message alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="admin-form-label">Oral (ml)</label>
                        <input
                            type="number"
                            name="oral_ml"
                            ref={el => inputRefs.current['oral_ml'] = el}
                            value={formData.oral_ml}
                            onChange={handleChange}
                            className="admin-form-input"
                            placeholder="e.g. 100"
                        />
                    </div>
                    <div>
                        <label className="admin-form-label">Normal Saline (ml)</label>
                        <input
                            type="number"
                            name="n_saline_ml"
                            ref={el => inputRefs.current['n_saline_ml'] = el}
                            value={formData.n_saline_ml}
                            onChange={handleChange}
                            className="admin-form-input"
                            placeholder="e.g. 500"
                        />
                    </div>
                    <div>
                        <label className="admin-form-label">40% Dextran (ml)</label>
                        <input
                            type="number"
                            name="dextran_40_ml"
                            ref={el => inputRefs.current['dextran_40_ml'] = el}
                            value={formData.dextran_40_ml}
                            onChange={handleChange}
                            className="admin-form-input"
                            placeholder="e.g. 50"
                        />
                    </div>
                    <div>
                        <label className="admin-form-label">Tetrastarch (ml)</label>
                        <input
                            type="number"
                            name="tetrastarch_ml"
                            ref={el => inputRefs.current['tetrastarch_ml'] = el}
                            value={formData.tetrastarch_ml}
                            onChange={handleChange}
                            className="admin-form-input"
                            placeholder="e.g. 200"
                        />
                    </div>
                    <div>
                        <label className="admin-form-label">Blood (ml)</label>
                        <input
                            type="number"
                            name="blood_ml"
                            ref={el => inputRefs.current['blood_ml'] = el}
                            value={formData.blood_ml}
                            onChange={handleChange}
                            className="admin-form-input"
                            placeholder="e.g. 250"
                        />
                    </div>
                    <div>
                        <label className="admin-form-label">Other (ml)</label>
                        <input
                            type="number"
                            name="other_ml"
                            ref={el => inputRefs.current['other_ml'] = el}
                            value={formData.other_ml}
                            onChange={handleChange}
                            className="admin-form-input"
                            placeholder="e.g. 50"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="admin-btn-cancel" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="admin-btn-submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Data'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VolumesModal;
