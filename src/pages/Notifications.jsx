import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import Sidebar from '../components/Sidebar';
import { FiBell, FiChevronDown, FiHome, FiSearch, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const navigate = useNavigate();
  const nom = localStorage.getItem('nom');
  const role = localStorage.getItem('role');
  const { notifCount, setNotifCount } = useAuth();
  const userId = localStorage.getItem('userId');

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getRoleLabel = () => {
    switch (role) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      case 'RESPONSABLE': return 'Responsable';
      case 'TECHNICIEN': return 'Technicien';
      case 'BENEFICIAIRE': return 'Bénéficiaire';
      default: return 'Utilisateur';
    }
  };

  useEffect(() => {
    const url = role === 'ADMINISTRATEUR' ? '/api/notifications' : `/api/notifications/utilisateur/${userId}`;
    api.get(url)
      .then(res => { setNotifications(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleMarquerLue = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/lire`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
      setNotifCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const handleMarquerToutesLues = async () => {
    try {
      const nonLues = notifications.filter(n => !n.lu);
      await Promise.all(nonLues.map(n => api.put(`/api/notifications/${n.id}/lire`)));
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setNotifCount(0);
    } catch (err) { console.error(err); }
  };

  const nonLuesCount = notifications.filter(n => !n.lu).length;

  return (
    <div className="db-root">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeLabel="Notifications" />
      <main className="db-main">
        <header className="db-topbar">
          <div className="db-search"><FiSearch size={16} color="#64748b" /><input placeholder="Rechercher..." /><span className="db-search-kbd">Ctrl+K</span></div>
          <div className="db-topbar-right">
            <div className="db-notif-btn"><FiBell size={20} />{nonLuesCount > 0 && <span className="db-notif-badge">{nonLuesCount}</span>}</div>
            <div className="db-topbar-user">
              <div className="db-topbar-avatar" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>{nom ? nom.charAt(0).toUpperCase() : 'A'}</div>
              <span>{getRoleLabel()}</span><FiChevronDown size={14} />
            </div>
          </div>
        </header>
        <div className="db-content">
          <div className="mat-header">
            <div>
              <h1 className="mat-title">Notifications</h1>
              <div className="mat-breadcrumb">
                <FiHome size={13} />
                <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/dashboard')}>Accueil</span>
                <span className="mat-sep">/</span>
                <span className="mat-bc-active">Notifications</span>
              </div>
            </div>
            {nonLuesCount > 0 && (
              <button onClick={handleMarquerToutesLues} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', color: '#3B82F6', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                <FiCheck size={15} /> Tout marquer comme lu
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[{ label: 'Total', value: notifications.length, color: '#fff' }, { label: 'Non lues', value: nonLuesCount, color: '#EF4444' }, { label: 'Lues', value: notifications.length - nonLuesCount, color: '#22C55E' }].map(s => (
              <div key={s.label} style={{ background: '#0D1B33', border: '1px solid #1A2B4A', borderRadius: '12px', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>{s.label}</span>
                <span style={{ color: s.color, fontSize: '24px', fontWeight: '800' }}>{s.value}</span>
              </div>
            ))}
          </div>
          <div style={{ background: '#0D1B33', border: '1px solid #1A2B4A', borderRadius: '14px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Chargement...</div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Aucune notification</div>
            ) : notifications.map((n, i) => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderBottom: i < notifications.length - 1 ? '1px solid #1A2B4A' : 'none', background: n.lu ? 'transparent' : 'rgba(59,130,246,0.05)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, background: n.lu ? 'rgba(100,116,139,0.15)' : 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: n.lu ? '#64748b' : '#3B82F6' }}>
                  <FiBell size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: n.lu ? '#94a3b8' : '#fff', fontSize: '14px', fontWeight: n.lu ? '400' : '600' }}>{n.message}</div>
                  <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>{n.dateEnvoi || '—'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  {!n.lu && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />}
                  {n.lu ? (
                    <span style={{ fontSize: '11px', color: '#22C55E', fontWeight: '500' }}>Lu</span>
                  ) : (
                    <button onClick={() => handleMarquerLue(n.id)} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3B82F6', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>Marquer lu</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}