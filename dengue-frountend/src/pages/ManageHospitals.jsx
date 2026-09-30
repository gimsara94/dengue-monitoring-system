import React, { useState, useEffect } from 'react';
import api from '../api';
import './ManageStyles.css';
import { Search, Edit2, Trash2, X } from 'lucide-react';

const ManageHospitals = () => {
    const [hospitals, setHospitals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingHospital, setEditingHospital] = useState(null);

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            const { data } = await api.get('/admin/hospitals');
            setHospitals(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this hospital?")) return;
        try {
            await api.delete(`/admin/hospitals/${id}`);
            setHospitals(hospitals.filter(h => h.id !== id));
        } catch (err) {
            alert("Error deleting hospital. It may have associated records.");
            console.error(err);
        }
    };

    const openEditModal = (hospital) => {
        setEditingHospital({ ...hospital });
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditingHospital(null);
        setEditModalOpen(false);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingHospital(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/admin/hospitals/${editingHospital.id}`, editingHospital);
            setHospitals(hospitals.map(h => (h.id === data.id ? data : h)));
            closeEditModal();
        } catch (err) {
            alert("Error updating hospital");
            console.error(err);
        }
    };

    const filteredHospitals = hospitals.filter(h =>
        h.id.toString().includes(searchTerm) ||
        h.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="manage-container">
            <div className="manage-header">
                <div className="manage-title">
                    <h2>Manage Hospitals</h2>
                    <p>View, edit, or remove hospital records</p>
                </div>
                <div className="search-bar">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by ID or Name..."
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
                            <th>Address</th>
                            <th>Telephone</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : filteredHospitals.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hospitals found.</td></tr>
                        ) : (
                            filteredHospitals.map(h => (
                                <tr key={h.id}>
                                    <td><strong>#{h.id}</strong></td>
                                    <td>{h.name}</td>
                                    <td>{h.address}</td>
                                    <td>{h.telephone}</td>
                                    <td>{h.email}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon btn-edit" title="Edit" onClick={() => openEditModal(h)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon btn-delete" title="Delete" onClick={() => handleDelete(h.id)}>
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
                            <h3>Edit Hospital</h3>
                            <button className="btn-close" onClick={closeEditModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Hospital Name</label>
                                    <input type="text" name="name" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={editingHospital.name || ''} onChange={handleEditChange} required />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Address</label>
                                    <input type="text" name="address" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={editingHospital.address || ''} onChange={handleEditChange} required />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Telephone</label>
                                    <input type="text" name="telephone" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={editingHospital.telephone || ''} onChange={handleEditChange} required />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                                    <input type="email" name="email" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={editingHospital.email || ''} onChange={handleEditChange} required />
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

export default ManageHospitals;
