import React, { useState, useEffect } from 'react';
import api from '../api';
import './AdminForms.css';
import { Stethoscope } from 'lucide-react';

const AssignDoctor = () => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await api.get('/ward/doctors');
            setDoctors(response.data.doctors || []);
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: 'Failed to load doctors from the hospital.' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedDoctorId) {
            setStatus({ type: 'error', message: 'Please select a doctor to assign.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await api.post('/ward/assign-doctor', { doctor_id: parseInt(selectedDoctorId, 10) });
            setStatus({ type: 'success', message: response.data.message || 'Doctor assigned to ward successfully!' });
            setSelectedDoctorId(''); // reset selection
        } catch (err) {
            console.error(err);
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Failed to assign doctor.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="admin-form-header">
                <h2 className="admin-form-title">Assign Doctor</h2>
                <p className="admin-form-subtitle">Assign an existing hospital doctor to operate in this ward.</p>
            </div>

            {status.message && (
                <div className={`alert-message alert-${status.type}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="admin-form-group">
                    <label className="admin-form-label">Select Medical Officer</label>
                    <select
                        className="admin-form-input"
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        required
                    >
                        <option value="">-- Choose a Doctor --</option>
                        {doctors.map(doc => (
                            <option key={doc.id} value={doc.id}>
                                {doc.name} (ID: {doc.id})
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="admin-btn-submit" disabled={loading || doctors.length === 0}>
                    <Stethoscope size={18} /> {loading ? 'Assigning...' : 'Assign Doctor'}
                </button>

                {doctors.length === 0 && !status.message && (
                    <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
                        No available doctors found. The Hospital Admin must register doctors first.
                    </p>
                )}
            </form>
        </div>
    );
};

export default AssignDoctor;
