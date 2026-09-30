import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../api';
import './WardDashboard.css'; // Reuse CSS
import { Search, AlertCircle, BedDouble } from 'lucide-react';

const NurseWardView = () => {
    const { hospital_id, ward_id } = useParams();
    const location = useLocation();
    const wardName = location.state?.wardName || `Ward ${ward_id}`;

    const [wardInfo, setWardInfo] = useState(null);
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch ward explicitly to know total beds
                const [wardRes, patRes] = await Promise.all([
                    api.get(`/staff/${hospital_id}/${ward_id}/info`),
                    api.get(`/staff/${hospital_id}/${ward_id}/patients`)
                ]);
                setWardInfo(wardRes.data.data);
                setPatients(patRes.data.data || []);
            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [hospital_id, ward_id]);

    const handleViewChart = (bed_no, patient) => {
        // Navigate relative to nurse layout
        navigate(`/nurse/ward/${hospital_id}/${ward_id}/patient/${bed_no}`, { state: { patient, wardName } });
    };

    if (loading) return <div className="loading">Loading Ward Terminal...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!wardInfo) return <div className="error-message">Ward data unavailable.</div>;

    // Generate grid based on total beds
    const totalBeds = wardInfo.beds || 0;

    // Create an array mapping bed numbers to patients
    const activeBedMap = {};
    patients.forEach(p => {
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
        if (bed.bed_no.includes(searchTerm)) return true;
        if (bed.patient && bed.patient.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;
        return false;
    });

    const occupiedCount = Object.keys(activeBedMap).length;
    const criticalCount = patients.filter(p => !p.is_discharged && p.is_critical).length;
    const availableCount = totalBeds - occupiedCount;

    return (
        <div className="ward-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>{wardInfo.hospital_name} - {wardName}</h1>
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
                                                disabled={true}
                                                style={{ cursor: 'not-allowed', opacity: 0.7 }}
                                                title="Nurses cannot change critical state"
                                            >
                                                {bed.patient.is_critical ? 'Critical' : 'Stable'}
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

export default NurseWardView;
