import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NurseNavbar from './NurseNavbar';

const NurseLayout = () => {
    const location = useLocation();
    const currentWardName = location.state?.wardName || '';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
            <NurseNavbar currentWardName={currentWardName} />
            <main style={{ flex: 1, padding: '2rem' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default NurseLayout;
