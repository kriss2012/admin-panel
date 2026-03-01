import { useState, useEffect, useRef } from 'react';
import { ref, get, update } from 'firebase/database';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';

export default function DriverDashboard({ user }) {
    const [driverInfo, setDriverInfo] = useState(null);
    const [isOnline, setIsOnline] = useState(false);
    const [statusText, setStatusText] = useState('Fetching details...');
    const [loading, setLoading] = useState(true);
    const watchIdRef = useRef(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const snap = await get(ref(db, `drivers/${user.uid}`));
                if (snap.exists()) {
                    setDriverInfo(snap.val());
                    setStatusText('Offline');
                } else {
                    setStatusText('Driver account not found.');
                }
            } catch (error) {
                setStatusText('Error fetching details.');
            }
            setLoading(false);
        };
        fetchDetails();

        return () => stopTracking(); // cleanup on unmount
    }, [user.uid]);

    const startTracking = async () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        if (!driverInfo || !driverInfo.travelId) return;

        setStatusText('Requesting GPS access...');
        setIsOnline(true);

        try {
            // Set initial state to online
            await update(ref(db, `travels/${driverInfo.travelId}`), {
                isOnline: true,
                lastSeen: Date.now()
            });

            const watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    const { latitude, longitude, speed } = position.coords;

                    try {
                        await update(ref(db, `travels/${driverInfo.travelId}`), {
                            isOnline: true,
                            lastSeen: Date.now(),
                            location: {
                                latitude,
                                longitude,
                                speed: speed || 0,
                                timestamp: Date.now()
                            }
                        });
                        setStatusText('🟢 Sharing Live Location');
                    } catch (err) {
                        setStatusText('Error updating location');
                    }
                },
                (error) => {
                    setStatusText(`GPS Error: ${error.message}`);
                    setIsOnline(false);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0, // Force fresh GPS ping, no cache
                    timeout: 20000 // Give it 20s to find actual GPS satellites
                }
            );

            watchIdRef.current = watchId;
        } catch (err) {
            setStatusText('Error going online.');
            setIsOnline(false);
        }
    };

    const stopTracking = async () => {
        setIsOnline(false);
        setStatusText('Offline');
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (driverInfo && driverInfo.travelId) {
            try {
                await update(ref(db, `travels/${driverInfo.travelId}`), {
                    isOnline: false,
                    lastSeen: Date.now()
                });
            } catch (e) {
                console.error("Failed to update status to offline");
            }
        }
    };

    const toggleStatus = () => {
        if (isOnline) {
            stopTracking();
        } else {
            startTracking();
        }
    };

    const handleLogout = async () => {
        await stopTracking();
        await signOut(auth);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--bg-main)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <header style={{
                padding: '16px 24px',
                backgroundColor: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 24 }}>👨‍✈️</div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 16, color: 'var(--text-main)' }}>{driverInfo?.name || 'Driver'}</h1>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>ID: {driverInfo?.travelId || 'N/A'}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                >
                    Logout
                </button>
            </header>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{
                    width: '100%',
                    maxWidth: 400,
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 24,
                    padding: 32,
                    textAlign: 'center',
                    boxShadow: isOnline ? '0 0 40px rgba(16, 185, 129, 0.15)' : 'none',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px auto',
                        border: `4px solid ${isOnline ? '#10b981' : '#64748b'}`,
                        transition: 'all 0.3s ease'
                    }}>
                        <span style={{ fontSize: 48 }}>{isOnline ? '🚌' : '😴'}</span>
                    </div>

                    <h2 style={{ fontSize: 20, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
                        {statusText}
                    </h2>

                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                        {isOnline ?
                            'Keep this tab open while driving to broadcast your live location to students.' :
                            'Go online when you start your journey from Pachora to Jalgaon or vice-versa.'}
                    </p>

                    <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#b45309', padding: '12px', borderRadius: 8, fontSize: 11, marginBottom: 24, textAlign: 'left' }}>
                        <strong>⚠️ Accuracy Note:</strong> For exact tracking, please run this on a mobile phone with GPS enabled. Laptops and PCs often estimate locations based on Internet Provider (Wi-Fi), which can mistakenly report cities hours away.
                    </div>

                    <button
                        onClick={toggleStatus}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: 100,
                            border: 'none',
                            backgroundColor: isOnline ? 'var(--red)' : 'var(--primary)',
                            color: '#white',
                            fontSize: 18,
                            fontWeight: 700,
                            cursor: 'pointer',
                            color: '#fff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                        }}
                    >
                        {isOnline ? (
                            <><span>⏹️</span> Go Offline</>
                        ) : (
                            <><span>▶️</span> Go Online</>
                        )}
                    </button>
                    {isOnline && (
                        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <span className="spinner" style={{ width: 12, height: 12, borderTopColor: '#10b981' }}></span> Wait for GPS coordinates...
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}
