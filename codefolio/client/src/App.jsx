import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Public from './pages/Public.jsx';

const Guard = ({ children }) => (localStorage.getItem('token') ? children : <Navigate to="/login" replace />);

export default function App() {
  // On a Pro custom domain the server sets window.__CF_USER__, so "/" shows that user's portfolio.
  const customUser = window.__CF_USER__;
  return (
    <Routes>
      <Route path="/" element={customUser ? <Public username={customUser} /> : <Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
      <Route path="/user/:username" element={<Public />} />
      <Route path="/:username" element={<Public />} />
    </Routes>
  );
}
