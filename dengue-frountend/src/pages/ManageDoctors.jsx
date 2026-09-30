import React, { useState, useEffect } from 'react';
import api from '../api';
import './ManageStyles.css';
import { Search, Edit2, Trash2, X } from 'lucide-react';

const ManageDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const { data } = await api.get('/admin/doctors');
            setDoctors(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this doctor?")) return;
        try {
            await api.delete(`/admin/doctors/${id}`);
            setDoctors(doctors.filter(d => d.id !== id));
        } catch (err) {
            alert("Error deleting doctor.");
            console.error(err);
        }
    };

    const openEditModal = (doctor) => {
        setEditingDoctor({ ...doctor });
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditingDoctor(null);
        setEditModalOpen(false);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingDoctor(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/admin/doctors/${editingDoctor.id}`, editingDoctor);
            setDoctors(doctors.map(d => (d.id === data.id ? { ...d, ...data } : d)));
            closeEditModal();
        } catch (err) {
            alert("Error updating doctor");
            console.error(err);
        }
    };

    const filteredDoctors = doctors.filter(d =>
        d.id.toString().includes(searchTerm) ||
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.nic_no && d.nic_no.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="manage-container">
            <div className="manage-header">
                <div className="manage-title">
                    <h2>Manage Doctors</h2>
                    <p>View, edit, or remove doctor records</p>
                </div>
                <div className="search-bar">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by ID, Name or NIC..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>NIC No</th>
                            <th>Telephone</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : filteredDoctors.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>No doctors found.</td></tr>
                        ) : (
                            filteredDoctors.map(d => (
                                <tr key={d.id}>
                                    <td><strong>#{d.id}</strong></td>
                                    <td>{d.name}</td>
                                    <td>{d.nic_no}</td>
                                    <td>{d.telephone}</td>
                                    <td>{d.email}</td>
                                    <td>{d.username}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon btn-edit" title="Edit" onClick={() => openEditModal(d)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon btn-delete" title="Delete" onClick={() => handleDelete(d.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Edit Doctor</h3>
                            <button className="btn-close" onClick={closeEditModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                {/* Only allow editing certain fields, strictly per the backend controller updateDoctor */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                                    <input type="text" name="name" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={editingDoctor.name || ''} onChange={handleEditChange} required />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Telephone</label>
                                    <input type="text" name="telephone" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={editingDoctor.telephone || ''} onChange={handleEditChange} required />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Address</label>
                                    <input type="text" name="address" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={editingDoctor.address || ''} onChange={handleEditChange} required />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                                    <input type="email" name="email" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={editingDoctor.email || ''} onChange={handleEditChange} required />
                                </div>
                                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '0.375rem', fontSize: '0.875rem', color: '#64748b' }}>
                                    <em>Note: NIC, Roles, and Login credentials cannot be edited via this panel.</em>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeEditModal}>Cancel</button>
                                <button type="submit" className="btn-save">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageDoctors;
