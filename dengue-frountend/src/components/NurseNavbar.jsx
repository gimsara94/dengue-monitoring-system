import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Cross, LogOut } from 'lucide-react';
import './AdminNavbar.css'; // Relies on shared styling

const NurseNavbar = ({ currentWardName }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <nav className="admin-navbar">
            <div className="navbar-brand">
                <Cross size={24} className="brand-icon" />
                <span>Nurse Terminal {currentWardName ? `- ${currentWardName}` : ''}</span>
            </div>

            <div className="navbar-menu">
                <NavLink to="/nurse" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} end>
                    <span>My Wards</span>
                </NavLink>
            </div>

            <div className="navbar-actions">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default NurseNavbar;
