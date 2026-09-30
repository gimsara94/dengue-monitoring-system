import React from 'react';
import { Outlet } from 'react-router-dom';
import HospitalNavbar from './HospitalNavbar';

const HospitalLayout = () => {
    return (
        <div className="admin-layout">
            <HospitalNavbar />
            <main className="admin-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default HospitalLayout;
