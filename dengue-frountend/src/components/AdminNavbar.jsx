import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FilePlus, LogOut, Building, ShieldCheck, Stethoscope } from 'lucide-react';
import './AdminNavbar.css';

const AdminNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <nav className="admin-navbar">
            <div className="navbar-brand">
                <ShieldCheck size={24} className="brand-icon" />
                <span>DengueMonitor Admin</span>
            </div>

            <div className="navbar-menu">
                <NavLink to="/admin" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <div className="nav-dropdown">
                    <div className="nav-item">
                        <FilePlus size={20} />
                        <span>Create</span>
                    </div>
                    <div className="dropdown-content">
                        <NavLink to="/admin/create/admin"><ShieldCheck size={16} /> Admin</NavLink>
                        <NavLink to="/admin/create/hospital"><Building size={16} /> Hospital</NavLink>
                    </div>
                </div>

                <div className="nav-dropdown">
                    <div className="nav-item">
                        <Users size={20} />
                        <span>Manage</span>
                    </div>
                    <div className="dropdown-content">
                        <NavLink to="/admin/manage/doctors">Doctors</NavLink>
                        <NavLink to="/admin/manage/nurses">Nurses</NavLink>
                        <NavLink to="/admin/manage/admins">Admins</NavLink>
                        <NavLink to="/admin/manage/hospitals">Hospitals</NavLink>
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

export default AdminNavbar;
