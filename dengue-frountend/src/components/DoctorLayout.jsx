import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DoctorNavbar from './DoctorNavbar';

const DoctorLayout = () => {
    const location = useLocation();
    const currentWardName = location.state?.wardName || '';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
            <DoctorNavbar currentWardName={currentWardName} />
            <main style={{ flex: 1, padding: '2rem' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default DoctorLayout;
