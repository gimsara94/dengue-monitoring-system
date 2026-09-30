import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './WardDashboard.css';
import { Search, AlertCircle, BedDouble } from 'lucide-react';

const WardDashboard = () => {
    const [wardInfo, setWardInfo] = useState(null);
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [wardRes, patRes] = await Promise.all([
                api.get('/ward/my-ward'),
                api.get('/ward/my-patients')
            ]);
            setWardInfo(wardRes.data.ward);
            setPatients(patRes.data.patients || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleCritical = async (bed_no, currentState) => {
        try {
            const res = await api.put(`/ward/patients/${bed_no}/critical`, { is_critical: !currentState });
            // Update local state
            setPatients(patients.map(p =>
                p.bed_no === bed_no ? { ...p, is_critical: !currentState } : p
            ));
        } catch (err) {
            alert('Failed to update critical state');
        }
    };

    const handleViewChart = (bed_no, patient) => {
        navigate(`/ward/patient/${bed_no}`, { state: { patient } });
    };

    if (loading) return <div className="loading">Loading Ward Terminal...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!wardInfo) return <div className="error-message">Ward data unavailable.</div>;

    // Generate grid based on total beds
    const totalBeds = wardInfo.beds || 0;

    // Create an array mapping bed numbers to patients
    const activeBedMap = {};
    patients.forEach(p => {
        // Only if not discharged (the API already filters it, but good to be safe)
        if (!p.is_discharged) {
            activeBedMap[p.bed_no] = p;
        }
    });

    // Create sequence of beds from 1 to totalBeds
    const allBeds = Array.from({ length: totalBeds }, (_, i) => ({
        bed_no: (i + 1).toString(),
        patient: activeBedMap[(i + 1).toString()] || null
    }));

    // Filter by search term
    const displayedBeds = allBeds.filter(bed => {
        if (!searchTerm) return true;

        // Match bed number exactly or part of it
        if (bed.bed_no.includes(searchTerm)) return true;

        // Match patient name if occupied
        if (bed.patient && bed.patient.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;

        return false;
    });

    // Calculate stats
    const occupiedCount = patients.length;
    const criticalCount = patients.filter(p => p.is_critical).length;
    const availableCount = totalBeds - occupiedCount;

    return (
        <div className="ward-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>{wardInfo.hospital_name} - Ward {wardInfo.ward_id}</h1>
                    <p className="subtitle">Real-time bed occupancy and patient monitoring</p>
                </div>

                <div className="ward-stats-pills">
                    <div className="pill occupied">Occupied: <strong>{occupiedCount}</strong></div>
                    <div className="pill available">Available: <strong>{availableCount}</strong></div>
                    <div className="pill critical">Critical: <strong>{criticalCount}</strong></div>
                </div>
            </div>

            <div className="toolbar">
                <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Bed Number or Patient Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="beds-grid">
                {displayedBeds.length === 0 ? (
                    <div className="no-results">No beds found matching your search.</div>
                ) : (
                    displayedBeds.map(bed => (
                        <div
                            key={`bed-${bed.bed_no}`}
                            className={`bed-card ${bed.patient ? 'occupied' : 'empty'} ${bed.patient?.is_critical ? 'critical-alert' : ''}`}
                        >
                            <div className="bed-header">
                                <span className="bed-number">Bed {bed.bed_no}</span>
                                {bed.patient?.is_critical && (
                                    <span className="critical-badge"><AlertCircle size={14} /> CRITICAL</span>
                                )}
                            </div>

                            <div className="bed-body">
                                {bed.patient ? (
                                    <>
                                        <h3 className="patient-name">{bed.patient.name}</h3>
                                        <div className="patient-details">
                                            <p><strong>Age:</strong> {bed.patient.age} yrs</p>
                                            <p><strong>NIC:</strong> {bed.patient.nic}</p>
                                        </div>
                                        <div className="bed-actions">
                                            <button
                                                className={`btn-toggle-critical ${bed.patient.is_critical ? 'active' : ''}`}
                                                onClick={() => handleToggleCritical(bed.bed_no, bed.patient.is_critical)}
                                            >
                                                {bed.patient.is_critical ? 'Mark Stable' : 'Mark Critical'}
                                            </button>
                                            <button
                                                className="admin-btn-submit"
                                                style={{ marginTop: '0.5rem', width: '100%' }}
                                                onClick={() => handleViewChart(bed.bed_no, bed.patient)}
                                            >
                                                View Chart
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-state">
                                        <BedDouble size={32} className="empty-icon" />
                                        <p>Available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WardDashboard;
