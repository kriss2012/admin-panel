import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from './firebase';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AddTravel from './pages/AddTravel';
import ManageTravels from './pages/ManageTravels';
import Sidebar from './components/Sidebar';

export default function AdminApp() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (u) {
                // Check if user is an admin
                const snap = await get(ref(db, `admin/${u.uid}`));
                if (snap.exists()) {
                    setUser(u);
                    setIsAdmin(true);
                } else {
                    setUser(null);
                    setIsAdmin(false);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading admin panel...</p>
        </div>
    );

    if (!user || !isAdmin) return <AdminLogin />;

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar user={user} />
            <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/add-travel" element={<AddTravel />} />
                    <Route path="/manage" element={<ManageTravels />} />
                    <Route path="*" element={<Navigate to="/admin" />} />
                </Routes>
            </main>
        </div>
    );
}
