import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [travels, setTravels] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const travelsRef = ref(db, 'travels');
        const unsub = onValue(travelsRef, (snap) => {
            const data = snap.val() || {};
            const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
            setTravels(list);
            setLoading(false);
        });
        return unsub;
    }, []);

    const online = travels.filter(t => t.isOnline);
    const offline = travels.filter(t => !t.isOnline);

    const formatTime = (ts) => {
        if (!ts) return 'Never';
        const diff = Math.floor((Date.now() - ts) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">📊 Dashboard</h1>
                    <p className="page-subtitle">Real-time overview of all travels</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/admin/add-travel')}>
                    ➕ Add Travel
                </button>
            </div>

            {/* Stats cards */}
            <div className="grid-3" style={{ marginBottom: 28 }}>
                <div className="card" style={{ borderLeft: '3px solid var(--primary)' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>TOTAL TRAVELS</div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)' }}>{travels.length}</div>
                </div>
                <div className="card" style={{ borderLeft: '3px solid var(--green)' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>🟢 ONLINE NOW</div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--green)' }}>{online.length}</div>
                </div>
                <div className="card" style={{ borderLeft: '3px solid var(--border)' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>⚫ OFFLINE</div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-muted)' }}>{offline.length}</div>
                </div>
            </div>

            {/* Online Travels */}
            {online.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--green)' }}>
                        🟢 Online Buses ({online.length})
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {online.map(t => (
                            <TravelRow key={t.id} travel={t} formatTime={formatTime} />
                        ))}
                    </div>
                </div>
            )}

            {/* All Travels Table */}
            <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>All Travels</h2>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                        <div className="spinner" />
                    </div>
                ) : travels.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🚌</div>
                        <p style={{ color: 'var(--text-muted)' }}>No travels added yet.</p>
                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/admin/add-travel')}>
                            ➕ Add First Travel
                        </button>
                    </div>
                ) : (
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['Travel Name', 'Driver', 'Phone', 'Status', 'Last Seen', ''].map(h => (
                                        <th key={h} style={{
                                            padding: '12px 16px',
                                            textAlign: 'left',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: 'var(--text-muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {travels.map(t => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>{t.name}</td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{t.driverName}</td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 13 }}>{t.phone || '—'}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span className={`badge badge-${t.isOnline ? 'online' : 'offline'}`}>
                                                {t.isOnline ? '🟢 Online' : '⚫ Offline'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 13 }}>{formatTime(t.lastSeen)}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/manage')}>
                                                View & Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function TravelRow({ travel, formatTime }) {
    return (
        <div className="card" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '14px 18px',
            borderLeft: '3px solid var(--green)',
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{travel.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    Driver: {travel.driverName}
                </div>
            </div>
            {travel.location && (
                <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
                    <div>📍 {travel.location.lat?.toFixed(4)}, {travel.location.lng?.toFixed(4)}</div>
                    <div>🚀 {travel.location.speed?.toFixed(0) || 0} km/h</div>
                    <div>Updated: {formatTime(travel.location.updatedAt)}</div>
                </div>
            )}
        </div>
    );
}
