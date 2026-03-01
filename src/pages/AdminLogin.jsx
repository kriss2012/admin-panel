import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../firebase';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const snap = await get(ref(db, `admins/${cred.user.uid}`));
            if (!snap.exists()) {
                await auth.signOut();
                setError('Access denied. This account does not have admin privileges.');
            }
        } catch (err) {
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/user-not-found') {
                setError('No account found with this email.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: 20,
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none',
            }}>
                <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
            </div>

            <div className="card" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 52, marginBottom: 12 }}>🚌</div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>
                        Pachora–Jalgaon Tracker
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Admin Panel — Sign In</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Admin Email</label>
                        <input
                            className="form-input"
                            type="email"
                            placeholder="admin@travels.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 8,
                            padding: '10px 14px',
                            fontSize: 13,
                            color: 'var(--red)',
                            marginBottom: 16,
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15 }}
                        disabled={loading}
                    >
                        {loading ? '⏳ Signing in...' : '🔐 Sign in as Admin'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
                    This panel is restricted to authorized administrators only.
                </p>
            </div>
        </div>
    );
}
