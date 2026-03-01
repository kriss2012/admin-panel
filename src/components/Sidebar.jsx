import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/add-travel', label: 'Add Travel', icon: '➕' },
    { path: '/admin/manage', label: 'Manage Travels', icon: '🚌' },
];

export default function Sidebar({ user }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

    return (
        <aside style={{
            width: 240,
            background: 'var(--bg-card)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '0',
            minHeight: '100vh',
            flexShrink: 0,
        }}>
            {/* Logo */}
            <div style={{
                padding: '24px 20px 20px',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>🚌</span>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)', lineHeight: 1.2 }}>PACHORA–JALGAON</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>TRAVEL TRACKER</div>
                    </div>
                </div>
                <div style={{
                    marginTop: 12,
                    padding: '8px 10px',
                    background: 'var(--bg-card2)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'var(--text-muted)',
                }}>
                    <span style={{ display: 'block', fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>Admin Panel</span>
                    <span style={{ wordBreak: 'break-all' }}>{user?.email}</span>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '12px 12px' }}>
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin'}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 14px',
                            borderRadius: 8,
                            marginBottom: 4,
                            fontSize: 14,
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                            background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent',
                            transition: 'var(--transition)',
                            textDecoration: 'none',
                        })}
                    >
                        <span style={{ fontSize: 18 }}>{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
                <button
                    className="btn btn-danger"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>
            </div>
        </aside>
    );
}
