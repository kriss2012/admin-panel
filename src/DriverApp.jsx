import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import DriverLogin from './pages/DriverLogin';
import DriverDashboard from './pages/DriverDashboard';

export default function DriverApp() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return unsub;
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading driver panel...</p>
        </div>
    );

    if (!user) return <DriverLogin />;

    return (
        <Routes>
            <Route path="/" element={<DriverDashboard user={user} />} />
            <Route path="*" element={<Navigate to="/driver" />} />
        </Routes>
    );
}
