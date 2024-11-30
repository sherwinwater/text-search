import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

const AdminPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const adminStatus = localStorage.getItem('isAdmin');
        if (adminStatus) {
            setIsAuthenticated(true);
        }
    }, []);

    return isAuthenticated ? (
        <AdminDashboard onLogout={() => setIsAuthenticated(false)} />
    ) : (
        <AdminLogin onLogin={() => setIsAuthenticated(true)} />
    );
};

export default AdminPage;