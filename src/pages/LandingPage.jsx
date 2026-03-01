import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    const [fromCity, setFromCity] = useState('Pachora');
    const [toCity, setToCity] = useState('Jalgaon');

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/map?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}`);
    };

    return (
        <div style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-main)'
        }}>
            {/* Background ambient glows */}
            <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, borderRadius: '50%', pointerEvents: 'none' }} />
            {/* Top Navigation */}
            <header style={{
                padding: '16px 32px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 16,
                backgroundColor: 'transparent',
                zIndex: 10
            }}>
                <button
                    onClick={() => navigate('/driver')}
                    className="btn btn-secondary"
                    style={{ backgroundColor: 'var(--bg-card)', padding: '10px 20px', fontSize: 14 }}
                >
                    👨‍✈️ Driver Login
                </button>
                <button
                    onClick={() => navigate('/admin')}
                    className="btn btn-secondary"
                    style={{ backgroundColor: 'var(--bg-card)', padding: '10px 20px', fontSize: 14 }}
                >
                    🛡️ Admin Login
                </button>
            </header>

            {/* Hero Section */}
            <main style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 24px'
            }}>
                <div style={{
                    maxWidth: 850,
                    width: '100%',
                    textAlign: 'center',
                    animation: 'fadeIn 0.5s ease',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div style={{ fontSize: 72, marginBottom: 24, animation: 'bounce 2s infinite', filter: 'drop-shadow(0 10px 20px rgba(249,115,22,0.3))' }}>
                        🚌
                    </div>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 800,
                        background: 'linear-gradient(to right, #ffffff, #94a3b8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: 16,
                        letterSpacing: '-0.03em'
                    }}>
                        Live Bus Tracking
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: 'var(--text-muted)',
                        marginBottom: 48,
                        lineHeight: 1.6,
                        maxWidth: 600,
                        margin: '0 auto 48px auto'
                    }}>
                        Never miss your bus again. Track daily travels from Pachora to Jalgaon in real-time.
                    </p>

                    {/* Search Form */}
                    <form
                        onSubmit={handleSearch}
                        className="search-container"
                    >
                        <div className="search-input-group">
                            <span style={{ fontSize: 24, opacity: 0.8 }}>📍</span>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left' }}>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>From</label>
                                <input
                                    className="search-input"
                                    value={fromCity}
                                    onChange={(e) => setFromCity(e.target.value)}
                                    placeholder="Origin City"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => { const temp = fromCity; setFromCity(toCity); setToCity(temp); }}
                            className="swap-btn"
                            title="Swap locations"
                        >
                            ⇄
                        </button>

                        <div className="search-input-group">
                            <span style={{ fontSize: 24, opacity: 0.8 }}>🏁</span>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left' }}>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>To</label>
                                <input
                                    className="search-input"
                                    value={toCity}
                                    onChange={(e) => setToCity(e.target.value)}
                                    placeholder="Destination City"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary search-btn"
                        >
                            Search Travels
                        </button>
                    </form>
                </div>
            </main>

            {/* Custom inject CSS for simple animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .search-container {
                    background: rgba(30, 41, 59, 0.6);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    padding: 12px 12px 12px 32px;
                    border-radius: 100px;
                    display: flex;
                    align-items: center;
                    box-shadow: 0 24px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.08);
                    gap: 16px;
                    width: 100%;
                }
                .search-input-group {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    position: relative;
                }
                .search-input {
                    border: none;
                    background: transparent;
                    font-size: 18px;
                    color: white;
                    font-weight: 600;
                    outline: none;
                    width: 100%;
                }
                .search-input::placeholder {
                    color: rgba(255,255,255,0.2);
                }
                .swap-btn {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 50%;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 20px;
                    color: var(--text-muted);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    flex-shrink: 0;
                }
                .swap-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: white;
                    transform: rotate(180deg) scale(1.05);
                    border-color: rgba(255,255,255,0.2);
                }
                .search-btn {
                    border-radius: 100px;
                    padding: 0 36px;
                    font-size: 16px;
                    font-weight: 700;
                    height: 60px;
                    margin-left: 8px;
                    box-shadow: 0 4px 14px rgba(249,115,22,0.4);
                }
                @media (max-width: 768px) {
                    .search-container {
                        flex-direction: column;
                        border-radius: 32px;
                        padding: 32px;
                        gap: 24px;
                        align-items: stretch;
                        text-align: left;
                    }
                    .swap-btn {
                        align-self: center;
                        transform: rotate(90deg);
                    }
                    .swap-btn:hover {
                        transform: rotate(270deg) scale(1.05);
                    }
                    .search-btn {
                        width: 100%;
                        justify-content: center;
                        margin-top: 12px;
                        margin-left: 0;
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); filter: drop-shadow(0 10px 20px rgba(249,115,22,0.3)); }
                    50% { transform: translateY(-15px); filter: drop-shadow(0 25px 30px rgba(249,115,22,0.5)); }
                }
            `}} />
        </div>
    );
}
