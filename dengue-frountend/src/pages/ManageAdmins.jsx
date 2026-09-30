import React, { useState, useEffect } from 'react';
import api from '../api';
import './ManageStyles.css';
import { Search, Edit2, Trash2, X } from 'lucide-react';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const { data } = await api.get('/admin/admins');
            setAdmins(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this admin account?")) return;
        try {
            await api.delete(`/admin/admins/${id}`);
            setAdmins(admins.filter(a => a.id !== id));
        } catch (err) {
            alert("Error deleting admin.");
            console.error(err);
        }
    };

    const openEditModal = (admin) => {
        setEditingAdmin({ ...admin });
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditingAdmin(null);
        setEditModalOpen(false);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingAdmin(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/admin/admins/${editingAdmin.id}`, { username: editingAdmin.username });
            setAdmins(admins.map(a => (a.id === data.id ? { ...a, ...data } : a)));
            closeEditModal();
        } catch (err) {
            alert("Error updating admin");
            console.error(err);
        }
    };

    const filteredAdmins = admins.filter(a =>
        a.id.toString().includes(searchTerm) ||
        a.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="manage-container">
            <div className="manage-header">
                <div className="manage-title">
                    <h2>Manage Administrators</h2>
                    <p>View, edit, or remove system administrators</p>
                </div>
                <div className="search-bar">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by ID or Username..."
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
                            <th>Username</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : filteredAdmins.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No admins found.</td></tr>
                        ) : (
                            filteredAdmins.map(a => (
                                <tr key={a.id}>
                                    <td><strong>#{a.id}</strong></td>
                                    <td>{a.username}</td>
                                    <td><span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e2e8f0', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{a.role}</span></td>
                                    <td>{new Date(a.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon btn-edit" title="Edit" onClick={() => openEditModal(a)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon btn-delete" title="Delete" onClick={() => handleDelete(a.id)}>
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
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>Edit Administrator</h3>
                            <button className="btn-close" onClick={closeEditModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Username</label>
                                    <input type="text" name="username" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={editingAdmin.username || ''} onChange={handleEditChange} required />
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

export default ManageAdmins;
