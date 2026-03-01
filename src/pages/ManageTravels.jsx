import { useState, useEffect } from 'react';
import { ref, onValue, remove, update } from 'firebase/database';
import { signInWithEmailAndPassword, updateEmail, updatePassword, signOut } from 'firebase/auth';
import { db, secondaryAuth } from '../firebase';
import QRCodeGenerator from '../components/QRCodeGenerator';

export default function ManageTravels() {
    const [travels, setTravels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTravel, setSelectedTravel] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [editTravel, setEditTravel] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const unsub = onValue(ref(db, 'travels'), (snap) => {
            const data = snap.val() || {};
            setTravels(Object.entries(data).map(([id, v]) => ({ id, ...v })));
            setLoading(false);
        });
        return unsub;
    }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = async (id) => {
        try {
            const travelToDelete = travels.find(t => t.id === id);
            await remove(ref(db, `travels/${id}`));
            if (travelToDelete && travelToDelete.driverId) {
                await remove(ref(db, `drivers/${travelToDelete.driverId}`));
            }
            showToast('Travel deleted successfully.');
            setConfirmDelete(null);
            if (selectedTravel?.id === id) setSelectedTravel(null);
        } catch (e) {
            showToast(e.message, 'error');
        }
    };

    const handleToggleActive = async (travel) => {
        const newStatus = !travel.active;
        await update(ref(db, `travels/${travel.id}`), { active: newStatus });
        showToast(`Travel ${newStatus ? 'activated' : 'deactivated'}.`);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const originalTravel = travels.find(t => t.id === editTravel.id);
            const emailChanged = originalTravel.driverEmail !== editTravel.driverEmail;
            const passwordChanged = originalTravel.driverPassword !== editTravel.driverPassword;

            if (emailChanged || passwordChanged) {
                if (!originalTravel.driverEmail || !originalTravel.driverPassword) {
                    throw new Error("Cannot update auth credentials because original ones are not stored. Please delete and recreate.");
                }

                // Login to secondary auth with old credentials
                const userCred = await signInWithEmailAndPassword(secondaryAuth, originalTravel.driverEmail, originalTravel.driverPassword);

                if (emailChanged) {
                    await updateEmail(userCred.user, editTravel.driverEmail);
                }
                if (passwordChanged) {
                    await updatePassword(userCred.user, editTravel.driverPassword);
                }

                await signOut(secondaryAuth);
            }

            // Update in DB
            await update(ref(db, `travels/${editTravel.id}`), {
                name: editTravel.name,
                route: editTravel.route,
                driverName: editTravel.driverName,
                phone: editTravel.phone,
                driverEmail: editTravel.driverEmail,
                driverPassword: editTravel.driverPassword
            });

            if (editTravel.driverId) {
                await update(ref(db, `drivers/${editTravel.driverId}`), {
                    name: editTravel.driverName,
                    phone: editTravel.phone,
                    email: editTravel.driverEmail,
                    password: editTravel.driverPassword
                });
            }

            setEditTravel(null);
            showToast('Travel updated successfully.');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const formatTime = (ts) => {
        if (!ts) return 'Never';
        return new Date(ts).toLocaleString('en-IN');
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">🚌 Manage Travels</h1>
                    <p className="page-subtitle">View, delete, or get QR codes for all travel operators</p>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <div className="spinner" />
                </div>
            ) : travels.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: 56 }}>🚌</div>
                    <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>No travels found. Add your first travel operator!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: selectedTravel ? '1fr 380px' : '1fr', gap: 20, alignItems: 'start' }}>
                    {/* Travel List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {travels.map(t => (
                            <div
                                key={t.id}
                                className="card"
                                style={{
                                    cursor: 'pointer',
                                    border: selectedTravel?.id === t.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                                    transition: 'var(--transition)',
                                    padding: '16px 20px',
                                }}
                                onClick={() => setSelectedTravel(t)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 44, height: 44,
                                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                        borderRadius: 10,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 22, flexShrink: 0,
                                    }}>🚌</div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                            <span style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</span>
                                            <span className={`badge badge-${t.isOnline ? 'online' : 'offline'}`}>
                                                {t.isOnline ? '🟢 Online' : '⚫ Offline'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                            🚗 {t.driverName} &nbsp;|&nbsp; 📍 {t.route} &nbsp;|&nbsp; 📞 {t.phone || 'N/A'}
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                                            📧 {t.driverEmail || 'N/A'} &nbsp;|&nbsp; 🔑 {t.driverPassword || 'N/A'}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                            Last seen: {formatTime(t.lastSeen)}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={e => { e.stopPropagation(); setEditTravel({ ...t }); }}
                                        >✏️</button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={e => { e.stopPropagation(); setSelectedTravel(t); }}
                                        >📱 QR</button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={e => { e.stopPropagation(); setConfirmDelete(t); }}
                                        >🗑️</button>
                                    </div>
                                </div>

                                {/* Location info if online */}
                                {t.isOnline && t.location && (
                                    <div style={{
                                        marginTop: 12, padding: '8px 12px',
                                        background: 'rgba(34,197,94,0.08)',
                                        border: '1px solid rgba(34,197,94,0.2)',
                                        borderRadius: 8, fontSize: 12, color: 'var(--green)',
                                        display: 'flex', gap: 16,
                                    }}>
                                        <span>📍 {t.location.lat?.toFixed(5)}, {t.location.lng?.toFixed(5)}</span>
                                        <span>🚀 {t.location.speed?.toFixed(0) || 0} km/h</span>
                                        <span>🧭 {t.location.heading?.toFixed(0) || 0}°</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* QR Panel */}
                    {selectedTravel && (
                        <div className="card" style={{ position: 'sticky', top: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 15 }}>📱 QR Code</h3>
                                <button
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
                                    onClick={() => setSelectedTravel(null)}
                                >✕</button>
                            </div>
                            <QRCodeGenerator travel={selectedTravel} compact />
                        </div>
                    )}
                </div>
            )}

            {/* Edit Travel Modal */}
            {editTravel && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: 20,
                }}>
                    <div className="card" style={{ maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>✏️ Edit Travel</h3>
                        <form onSubmit={handleSaveEdit}>
                            <div className="form-group">
                                <label className="form-label">Travel Name *</label>
                                <input className="form-input" required value={editTravel.name} onChange={e => setEditTravel({ ...editTravel, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Route *</label>
                                <select className="form-input" value={editTravel.route || ''} onChange={e => setEditTravel({ ...editTravel, route: e.target.value })}>
                                    <option>Pachora → Jalgaon</option>
                                    <option>Jalgaon → Pachora</option>
                                    <option>Pachora ↔ Jalgaon (Both ways)</option>
                                </select>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Driver Name *</label>
                                    <input className="form-input" required value={editTravel.driverName || ''} onChange={e => setEditTravel({ ...editTravel, driverName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Driver Phone</label>
                                    <input className="form-input" value={editTravel.phone || ''} onChange={e => setEditTravel({ ...editTravel, phone: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 14, marginBottom: 10 }}>Driver Credentials</h4>
                                <div className="form-group">
                                    <label className="form-label">Driver Email *</label>
                                    <input className="form-input" type="email" required value={editTravel.driverEmail || ''} onChange={e => setEditTravel({ ...editTravel, driverEmail: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Driver Password *</label>
                                    <input className="form-input" required minLength={6} value={editTravel.driverPassword || ''} onChange={e => setEditTravel({ ...editTravel, driverPassword: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setEditTravel(null)} disabled={isSaving}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: 20,
                }}>
                    <div className="card" style={{ maxWidth: 380, width: '100%', textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete Travel?</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                            Are you sure you want to delete <strong>{confirmDelete.name}</strong>?
                            This action cannot be undone. The driver's QR code will also stop working.
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete.id)}>🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
            )}
        </div>
    );
}
