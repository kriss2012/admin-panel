import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import L from 'leaflet';

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204098.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});

export default function PublicMap() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const fromCity = queryParams.get('from') || 'Pachora';
    const toCity = queryParams.get('to') || 'Jalgaon';

    const [travels, setTravels] = useState({});
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef({}); // Store markers by travel ID

    // Fallback coordinates (India - Maharashtra approximate)
    const defaultPosition = [20.75, 75.35];

    // Initialize Map only once
    useEffect(() => {
        if (!mapInstance.current && mapRef.current) {
            mapInstance.current = L.map(mapRef.current).setView(defaultPosition, 10);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Fetch Firebase Data
    useEffect(() => {
        const travelsRef = ref(db, 'travels');
        const unsub = onValue(travelsRef, (snapshot) => {
            if (snapshot.exists()) {
                setTravels(snapshot.val());
            } else {
                setTravels({});
            }
        });
        return () => unsub();
    }, []);

    // Sync Map Markers when data changes
    useEffect(() => {
        if (!mapInstance.current) return;

        const searchRoute1 = `${fromCity} → ${toCity}`;

        const activeBuses = Object.entries(travels).filter(([id, data]) => {
            if (!data.isOnline || !data.location) return false;

            const route = data.route || '';
            // Match exactly or bidirectional
            if (route.toLowerCase() === searchRoute1.toLowerCase()) return true;
            if (route.includes('Both ways') || route.includes('↔')) return true;

            // Allow all if search query is empty
            if (!queryParams.get('from') && !queryParams.get('to')) return true;

            return false;
        });

        const activeIds = new Set(activeBuses.map(([id]) => id));

        // 1. Remove markers that are no longer active
        Object.keys(markersRef.current).forEach(id => {
            if (!activeIds.has(id)) {
                mapInstance.current.removeLayer(markersRef.current[id]);
                delete markersRef.current[id];
            }
        });

        // 2. Add or Update existing markers
        activeBuses.forEach(([id, data]) => {
            const { latitude, longitude, speed, timestamp } = data.location;
            const latLng = [latitude, longitude];

            const popupContent = `
                <div style="min-width: 150px; font-family: 'Inter', sans-serif;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px;">${data.travelName}</h3>
                    <p style="margin: 4px 0; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                        <span style="color: #f97316;">👤</span> Driver: ${data.driverName}
                    </p>
                    <p style="margin: 4px 0; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                        <span style="color: #10b981;">🟢</span> Speed: ${speed ? Math.round(speed * 3.6) : 0} km/h
                    </p>
                    <p style="margin: 4px 0; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                        <span style="color: #f59e0b;">⏱️</span> Updated: ${new Date(timestamp).toLocaleTimeString()}
                    </p>
                </div>
            `;

            if (markersRef.current[id]) {
                // Update existing marker's position and popup
                markersRef.current[id].setLatLng(latLng);
                markersRef.current[id].getPopup().setContent(popupContent);
            } else {
                // Create new marker
                const marker = L.marker(latLng, { icon: busIcon })
                    .bindPopup(popupContent);

                marker.addTo(mapInstance.current);
                markersRef.current[id] = marker;
            }
        });

    }, [travels]);

    const activeCount = Object.values(travels).filter(data => data.isOnline && data.location).length;

    // Filter buses for the side panel
    const searchRoute1 = `${fromCity} → ${toCity}`;
    const activeBusesList = Object.entries(travels).map(([id, data]) => ({ id, ...data })).filter(data => {
        if (!data.isOnline || !data.location) return false;
        const route = data.route || '';
        if (route.toLowerCase() === searchRoute1.toLowerCase()) return true;
        if (route.includes('Both ways') || route.includes('↔')) return true;
        if (!queryParams.get('from') && !queryParams.get('to')) return true;
        return false;
    });

    const handleSwapRoute = () => {
        window.location.href = `/map?from=${encodeURIComponent(toCity)}&to=${encodeURIComponent(fromCity)}`;
    };

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
            <header style={{
                padding: '16px 24px',
                backgroundColor: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, backgroundColor: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
                        🚌
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 18, color: 'var(--text-main)' }}>Live Tracker</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{fromCity} → {toCity}</p>
                            <button
                                onClick={handleSwapRoute}
                                style={{
                                    background: 'var(--bg-main)', border: '1px solid var(--border)',
                                    borderRadius: 4, padding: '2px 6px', fontSize: 12, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-main)'
                                }}
                            >
                                ⇄ Swap
                            </button>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <a href="/" style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: 14, fontWeight: 600, marginRight: 12 }}>← Back to Home</a>
                    <a href="/driver" style={{ textDecoration: 'none', color: 'var(--primary)', fontSize: 14, fontWeight: 500 }}>Driver Login</a>
                    <a href="/admin" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>Admin</a>
                </div>
            </header>

            <div style={{ flex: 1, position: 'relative' }}>
                <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

                {activeBusesList.length === 0 && (
                    <div style={{
                        position: 'absolute',
                        bottom: 24,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'var(--bg-card)',
                        padding: '12px 24px',
                        borderRadius: 30,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        color: 'var(--text-main)',
                        fontSize: 14,
                        fontWeight: 500,
                        border: '1px solid var(--border)'
                    }}>
                        No buses are currently online for this route.
                    </div>
                )}

                {/* Active Buses Side Panel */}
                {activeBusesList.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: 24,
                        right: 24,
                        width: 320,
                        maxHeight: 'calc(100vh - 120px)',
                        overflowY: 'auto',
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: 12,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                                Active Buses ({activeBusesList.length})
                            </h3>
                        </div>
                        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {activeBusesList.map(bus => (
                                <div
                                    key={bus.id}
                                    style={{
                                        padding: 12, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer',
                                        transition: 'all 0.2s', backgroundColor: 'var(--bg-main)'
                                    }}
                                    onClick={() => {
                                        if (mapInstance.current && bus.location) {
                                            mapInstance.current.setView([bus.location.latitude, bus.location.longitude], 14);
                                            // Open the marker's popup
                                            if (markersRef.current[bus.id]) {
                                                markersRef.current[bus.id].openPopup();
                                            }
                                        }
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: 14, color: 'var(--primary)' }}>{bus.name}</h4>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <span>👤 Driver: {bus.driverName}</span>
                                        <span>🚀 Speed: {bus.location.speed ? Math.round(bus.location.speed * 3.6) : 0} km/h</span>
                                        <span>⏱️ Updated: {new Date(bus.location.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
