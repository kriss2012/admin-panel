import { useState } from 'react';
import { ref, set, push } from 'firebase/database';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, secondaryAuth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import QRCodeGenerator from '../components/QRCodeGenerator';

export default function AddTravel() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        route: 'Pachora → Jalgaon',
        driverName: '',
        phone: '',
        driverEmail: '',
        driverPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdTravel, setCreatedTravel] = useState(null); // show QR after creation

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Save current admin user
        const adminUser = auth.currentUser;

        try {
            // 1. Create driver Firebase account using secondaryAuth to keep admin logged in
            const driverCred = await createUserWithEmailAndPassword(
                secondaryAuth, form.driverEmail, form.driverPassword
            );
            const driverId = driverCred.user.uid;

            // 2. Re-sign in as admin (creating driver logs you out)
            // We generate travelId first via push
            const travelsRef = ref(db, 'travels');
            const newTravelRef = push(travelsRef);
            const travelId = newTravelRef.key;

            // 3. Save travel data
            await set(newTravelRef, {
                name: form.name,
                route: form.route,
                driverName: form.driverName,
                phone: form.phone,
                driverId,
                driverEmail: form.driverEmail,
                driverPassword: form.driverPassword,
                isOnline: false,
                lastSeen: null,
                location: null,
                createdAt: Date.now(),
            });

            // 4. Save driver profile
            await set(ref(db, `drivers/${driverId}`), {
                name: form.driverName,
                phone: form.phone,
                email: form.driverEmail,
                password: form.driverPassword,
                travelId,
                createdAt: Date.now(),
            });

            setCreatedTravel({ travelId, ...form });

            // Reset form
            setForm({
                name: '', route: 'Pachora → Jalgaon',
                driverName: '', phone: '', driverEmail: '', driverPassword: '',
            });
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('This driver email is already registered.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">➕ Add New Travel</h1>
                    <p className="page-subtitle">Register a travel operator and generate their QR code</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/admin')}>← Back to Dashboard</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                {/* Form */}
                <div className="card">
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--primary)' }}>
                        🚌 Travel Details
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Travel / Bus Name *</label>
                            <input
                                className="form-input"
                                name="name"
                                placeholder="e.g. Shivam Travels, Sai Travels"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Route *</label>
                            <select className="form-input" name="route" value={form.route} onChange={handleChange}>
                                <option>Pachora → Jalgaon</option>
                                <option>Jalgaon → Pachora</option>
                                <option>Pachora ↔ Jalgaon (Both ways)</option>
                            </select>
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Driver Name *</label>
                                <input
                                    className="form-input"
                                    name="driverName"
                                    placeholder="Full name"
                                    value={form.driverName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Driver Phone</label>
                                <input
                                    className="form-input"
                                    name="phone"
                                    placeholder="10-digit number"
                                    value={form.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8, marginBottom: 16 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14 }}>
                                🔐 Driver Login Credentials (for app login)
                            </h3>
                            <div className="form-group">
                                <label className="form-label">Driver Email *</label>
                                <input
                                    className="form-input"
                                    name="driverEmail"
                                    type="email"
                                    placeholder="driver@travels.com"
                                    value={form.driverEmail}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Driver Password * (min 6 chars)</label>
                                <input
                                    className="form-input"
                                    name="driverPassword"
                                    type="password"
                                    placeholder="Create a password for driver"
                                    value={form.driverPassword}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 16,
                            }}>⚠️ {error}</div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                            disabled={loading}
                        >
                            {loading ? '⏳ Creating travel...' : '🚌 Create Travel & Generate QR'}
                        </button>
                    </form>
                </div>

                {/* QR Code panel */}
                <div className="card" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--primary)' }}>
                        📱 QR Code
                    </h2>
                    {createdTravel ? (
                        <QRCodeGenerator travel={createdTravel} />
                    ) : (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', padding: 40, color: 'var(--text-muted)',
                        }}>
                            <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>📱</div>
                            <p style={{ fontSize: 14 }}>QR code will appear here<br />after creating the travel</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
