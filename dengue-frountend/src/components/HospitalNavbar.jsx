import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FilePlus, LogOut, Stethoscope, Building } from 'lucide-react';
import './AdminNavbar.css';

const HospitalNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <nav className="admin-navbar">
            <div className="navbar-brand">
                <Building size={24} className="brand-icon" />
                <span>Hospital Admin</span>
            </div>

            <div className="navbar-menu">
                <NavLink to="/hospital" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <div className="nav-dropdown">
                    <div className="nav-item">
                        <FilePlus size={20} />
                        <span>Add Resources</span>
                    </div>
                    <div className="dropdown-content">
                        <NavLink to="/hospital/create/ward"><Building size={16} /> Ward</NavLink>
                        <NavLink to="/hospital/create/doctor"><Stethoscope size={16} /> Doctor</NavLink>
                        <NavLink to="/hospital/create/nurse"><Users size={16} /> Nurse</NavLink>
                    </div>
                </div>

                <div className="nav-dropdown">
                    <div className="nav-item">
                        <Users size={20} />
                        <span>Manage Staff</span>
                    </div>
                    <div className="dropdown-content">
                        <NavLink to="/hospital/manage/doctors">Doctors</NavLink>
                        <NavLink to="/hospital/manage/nurses">Nurses</NavLink>
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

export default HospitalNavbar;
