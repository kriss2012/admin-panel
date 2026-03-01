import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function DriverLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/driver'); // DriverApp will handle rendering the dashboard
        } catch (err) {
            setError('Invalid email or password. Please try again.');
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
            backgroundColor: 'var(--bg-main)',
            padding: 24
        }}>
            <div className="card" style={{ width: '100%', maxWidth: 400 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🚌</div>
                    <h1 style={{ fontSize: 24, margin: '0 0 8px 0', color: 'var(--text-main)' }}>Driver App</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Login to share your live location</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="driver@travels.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
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
                        style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16 }}
                        disabled={loading}
                    >
                        {loading ? '⏳ Logging in...' : 'Login'}
                    </button>
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <a href="/" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>← Back to Map</a>
                    </div>
                </form>
            </div>
        </div>
    );
}
