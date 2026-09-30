import React, { useState, useEffect } from 'react';
import api from '../api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalHospitals: 0,
        totalAdmittedPatients: 0,
        patientsByHospital: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBreakdown, setShowBreakdown] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/dashboard-stats');
            setStats(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard statistics.');
            // Fallback dummy data for visual testing before backend is fully hooked up
            setStats({
                totalHospitals: 5,
                totalAdmittedPatients: 142,
                patientsByHospital: [
                    { hospitalName: 'General Hospital', count: 45 },
                    { hospitalName: 'City Care', count: 32 },
                    { hospitalName: 'Metro Health', count: 65 }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading statistics...</div>;

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Dashboard Overview</h1>
                <p className="subtitle">Real-time statistics across all facilities</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon hospitals-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 21h18M5 21V7l8-4v18M13 3l8 4v14M9 11h4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>Registered Hospitals</h3>
                        <div className="stat-value">{stats.totalHospitals}</div>
                    </div>
                </div>

                <div className="stat-card clickable" onClick={() => setShowBreakdown(!showBreakdown)}>
                    <div className="stat-icon patients-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>Currently Admitted</h3>
                        <div className="stat-value">{stats.totalAdmittedPatients}</div>
                        <span className="stat-hint">Click to view breakdown</span>
                    </div>
                </div>
            </div>

            {showBreakdown && (
                <div className="breakdown-section">
                    <h2>Admitted Patients by Hospital</h2>
                    <div className="breakdown-list">
                        {stats.patientsByHospital.length === 0 ? (
                            <p>No admitted patients currently.</p>
                        ) : (
                            stats.patientsByHospital.map((item, idx) => (
                                <div key={idx} className="breakdown-item">
                                    <span className="breakdown-name">{item.hospitalName}</span>
                                    <span className="breakdown-count">{item.count} Patients</span>
                                    <div className="progress-bar-bg">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${Math.min(100, (item.count / Math.max(1, stats.totalAdmittedPatients)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
