import { Routes, Route } from 'react-router-dom';
import AdminApp from './AdminApp';
import DriverApp from './DriverApp';
import PublicMap from './pages/PublicMap';
import LandingPage from './pages/LandingPage';
import './index.css';

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/map" element={<PublicMap />} />
            <Route path="/driver/*" element={<DriverApp />} />
            <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
    );
}

export default App;
