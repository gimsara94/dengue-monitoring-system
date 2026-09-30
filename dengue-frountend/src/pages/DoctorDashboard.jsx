import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Building2 } from 'lucide-react';

const DoctorDashboard = () => {
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWards = async () => {
            try {
                const res = await api.get('/doctor/wards');
                setWards(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to initialize your assigned wards.');
            } finally {
                setLoading(false);
            }
        };
        fetchWards();
    }, []);

    if (loading) return <div>Checking Ward assignments...</div>;
    if (error) return <div className="alert-message alert-error">{error}</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ color: '#0f172a', marginBottom: '2rem' }}>My Assigned Wards</h1>

            {wards.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '4rem', background: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    You have not been assigned to any wards yet.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {wards.map(ward => (
                        <div
                            key={ward.id}
                            onClick={() => navigate(`/doctor/ward/${ward.hospital_id}/${ward.ward_id}`, { state: { wardName: ward.ward_name } })}
                            style={{
                                background: 'white',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.borderColor = '#1d4ed8';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                        >
                            <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', color: '#1d4ed8' }}>
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>{ward.ward_name}</h3>
                                <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>{ward.hospital_name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
