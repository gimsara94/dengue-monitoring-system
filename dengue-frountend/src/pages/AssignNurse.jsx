import React, { useState, useEffect } from 'react';
import api from '../api';
import './AdminForms.css';
import { Users } from 'lucide-react';

const AssignNurse = () => {
    const [nurses, setNurses] = useState([]);
    const [selectedNurseId, setSelectedNurseId] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNurses();
    }, []);

    const fetchNurses = async () => {
        try {
            const response = await api.get('/ward/nurses');
            setNurses(response.data.nurses || []);
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: 'Failed to load nurses from the hospital.' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedNurseId) {
            setStatus({ type: 'error', message: 'Please select a nurse to assign.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await api.post('/ward/assign-nurse', { nurse_id: parseInt(selectedNurseId, 10) });
            setStatus({ type: 'success', message: response.data.message || 'Nurse assigned to ward successfully!' });
            setSelectedNurseId(''); // reset selection
        } catch (err) {
            console.error(err);
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Failed to assign nurse.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="admin-form-header">
                <h2 className="admin-form-title">Assign Nurse</h2>
                <p className="admin-form-subtitle">Assign an existing hospital nurse to operate in this ward.</p>
            </div>

            {status.message && (
                <div className={`alert-message alert-${status.type}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="admin-form-group">
                    <label className="admin-form-label">Select Nursing Staff</label>
                    <select
                        className="admin-form-input"
                        value={selectedNurseId}
                        onChange={(e) => setSelectedNurseId(e.target.value)}
                        required
                    >
                        <option value="">-- Choose a Nurse --</option>
                        {nurses.map(nurse => (
                            <option key={nurse.id} value={nurse.id}>
                                {nurse.name} (ID: {nurse.id})
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="admin-btn-submit" disabled={loading || nurses.length === 0}>
                    <Users size={18} /> {loading ? 'Assigning...' : 'Assign Nurse'}
                </button>

                {nurses.length === 0 && !status.message && (
                    <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
                        No available nurses found. The Hospital Admin must register nurses first.
                    </p>
                )}
            </form>
        </div>
    );
};

export default AssignNurse;
