import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserPlus, LogOut, Bed } from 'lucide-react';
import './AdminNavbar.css';

const WardNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <nav className="admin-navbar">
            <div className="navbar-brand">
                <Bed size={24} className="brand-icon" />
                <span>Ward Terminal</span>
            </div>

            <div className="navbar-menu">
                <NavLink to="/ward" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/ward/create-patient" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <UserPlus size={20} />
                    <span>Admit Patient</span>
                </NavLink>

                <div className="nav-dropdown">
                    <div className="nav-item">
                        <UserPlus size={20} />
                        <span>Assign Staff</span>
                    </div>
                    <div className="dropdown-content">
                        <NavLink to="/ward/assign-doctor">Doctor</NavLink>
                        <NavLink to="/ward/assign-nurse">Nurse</NavLink>
                    </div>
                </div>
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

export default WardNavbar;
