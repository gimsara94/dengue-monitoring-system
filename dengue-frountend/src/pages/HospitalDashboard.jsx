import React, { useState, useEffect } from 'react';
import api from '../api';
import './AdminDashboard.css';

const HospitalDashboard = () => {
    const [stats, setStats] = useState({
        totalDoctors: 0,
        totalNurses: 0,
        totalAdmittedPatients: 0,
        patientsByWard: [],
        hospitalName: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBreakdown, setShowBreakdown] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/hospital/dashboard-stats');
            setStats(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard statistics.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading statistics...</div>;

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>{stats.hospitalName} Dashboard</h1>
                <p className="subtitle">Overview of your registered staff and facilities.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon hospitals-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>Registered Doctors</h3>
                        <div className="stat-value">{stats.totalDoctors}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon patients-icon" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>Registered Nurses</h3>
                        <div className="stat-value">{stats.totalNurses}</div>
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
                    <h2>Admitted Patients by Ward</h2>
                    <div className="breakdown-list">
                        {stats.patientsByWard.length === 0 ? (
                            <p>No admitted patients currently.</p>
                        ) : (
                            stats.patientsByWard.map((item, idx) => (
                                <div key={idx} className="breakdown-item">
                                    <span className="breakdown-name">{item.wardName}</span>
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

export default HospitalDashboard;
