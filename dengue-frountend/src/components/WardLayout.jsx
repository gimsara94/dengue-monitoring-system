import React from 'react';
import { Outlet } from 'react-router-dom';
import WardNavbar from './WardNavbar';

const WardLayout = () => {
    return (
        <div className="admin-layout">
            <WardNavbar />
            <main className="admin-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default WardLayout;
