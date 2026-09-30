import React, { useState, useEffect } from 'react';
import api from '../api';
import './ManageStyles.css';
import { Search, Edit2, Trash2, X } from 'lucide-react';

const ManageNurses = () => {
    const [nurses, setNurses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingNurse, setEditingNurse] = useState(null);

    useEffect(() => {
        fetchNurses();
    }, []);

    const fetchNurses = async () => {
        try {
            const { data } = await api.get('/admin/nurses');
            setNurses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this nurse?")) return;
        try {
            await api.delete(`/admin/nurses/${id}`);
            setNurses(nurses.filter(n => n.id !== id));
        } catch (err) {
            alert("Error deleting nurse.");
            console.error(err);
        }
    };

    const openEditModal = (nurse) => {
        setEditingNurse({ ...nurse });
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditingNurse(null);
        setEditModalOpen(false);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingNurse(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/admin/nurses/${editingNurse.id}`, editingNurse);
            setNurses(nurses.map(n => (n.id === data.id ? { ...n, ...data } : n)));
            closeEditModal();
        } catch (err) {
            alert("Error updating nurse");
            console.error(err);
        }
    };

    const filteredNurses = nurses.filter(n =>
        n.id.toString().includes(searchTerm) ||
        n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.nic_no && n.nic_no.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="manage-container">
            <div className="manage-header">
                <div className="manage-title">
                    <h2>Manage Nurses</h2>
                    <p>View, edit, or remove nurse records</p>
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
                        ) : filteredNurses.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>No nurses found.</td></tr>
                        ) : (
                            filteredNurses.map(n => (
                                <tr key={n.id}>
                                    <td><strong>#{n.id}</strong></td>
                                    <td>{n.name}</td>
                                    <td>{n.nic_no}</td>
                                    <td>{n.telephone}</td>
                                    <td>{n.email}</td>
                                    <td>{n.username}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon btn-edit" title="Edit" onClick={() => openEditModal(n)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon btn-delete" title="Delete" onClick={() => handleDelete(n.id)}>
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
                            <h3>Edit Nurse</h3>
                            <button className="btn-close" onClick={closeEditModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                                    <input type="text" name="name" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={editingNurse.name || ''} onChange={handleEditChange} required />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Telephone</label>
                                    <input type="text" name="telephone" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={editingNurse.telephone || ''} onChange={handleEditChange} required />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Address</label>
                                    <input type="text" name="address" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={editingNurse.address || ''} onChange={handleEditChange} required />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                                    <input type="email" name="email" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={editingNurse.email || ''} onChange={handleEditChange} required />
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

export default ManageNurses;
