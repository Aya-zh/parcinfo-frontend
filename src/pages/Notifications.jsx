import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import {
  FiBell, FiChevronDown, FiChevronLeft, FiChevronRight,
  FiHome, FiAlertTriangle, FiSettings, FiSearch, FiCheck
} from 'react-icons/fi';
import { HiOutlineDesktopComputer } from 'react-icons/hi';
import { MdOutlineAssignment, MdOutlineNotifications, MdOutlineDashboard } from 'react-icons/md';
import { TbReportAnalytics, TbDeviceDesktop } from 'react-icons/tb';
import { BsTools, BsFileText, BsPeople } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const navigate = useNavigate();
  const nom = localStorage.getItem('nom');
  const prenom = localStorage.getItem('prenom');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const { notifCount } = useAuth();
  const userId = localStorage.getItem('userId');

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const  menuItems = [
    { icon: <MdOutlineDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <HiOutlineDesktopComputer size={20} />, label: 'Matériels', path: '/materiels' },
    { icon: <MdOutlineAssignment size={20} />, label: 'Affectations', path: '/affectations' },
    { icon: <FiAlertTriangle size={20} />, label: 'Pannes', path: '/pannes' },
    { icon: <BsTools size={18} />, label: 'Maintenances', path: '/maintenances' },
    { icon: <BsFileText size={18} />, label: 'Demandes', path: '/demandes' },
    { icon: <BsPeople size={20} />, label: 'Utilisateurs', path: '/utilisateurs' },
    { icon: <MdOutlineNotifications size={22} />, label: 'Notifications', path: '/notifications', badge: notifCount },
    { icon: <TbReportAnalytics size={20} />, label: 'Rapports', path: '/rapports' },
  ];

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
  const url = role === 'ADMINISTRATEUR'
    ? '/api/notifications'
    : `/api/notifications/utilisateur/${userId}`;

  api.get(url)
    .then(res => { setNotifications(res.data); setLoading(false); })
    .catch(() => setLoading(false));
}, []);

  const handleMarquerLue = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/lire`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarquerToutesLues = async () => {
    try {
      const nonLues = notifications.filter(n => !n.lu);
      await Promise.all(nonLues.map(n => api.put(`/api/notifications/${n.id}/lire`)));
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const nonLuesCount = notifications.filter(n => !n.lu).length;

  return (
    <div className="db-root">

      {/* ── SIDEBAR ── */}
      <aside className={`db-sidebar ${sidebarOpen ? '' : 'db-sidebar-closed'}`}>
        <div className="db-sidebar-logo">
          <div className="db-logo-icon"><TbDeviceDesktop size={22} color="#fff" /></div>
          {sidebarOpen && (
            <div>
              <div className="db-logo-title">ParcInfo</div>
              <div className="db-logo-sub">Gestion de Parc Informatique</div>
            </div>
          )}
          <button className="db-collapse-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
          </button>
        </div>
        <nav className="db-nav">
          {menuItems.map((item) => (
            <div key={item.label}
              className={`db-nav-item ${item.label === 'Notifications' ? 'db-nav-active' : ''}`}
              onClick={() => navigate(item.path)}>
              <span className="db-nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="db-nav-label">{item.label}</span>}
              {sidebarOpen && item.badge && <span className="db-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>
        <div className="db-sidebar-bottom">
          <div className="db-nav-item" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>
            <span className="db-nav-icon"><FiSettings size={20} /></span>
            {sidebarOpen && <span className="db-nav-label">Déconnexion</span>}
          </div>
          {sidebarOpen && (
            <div className="db-user-card">
              <div className="db-user-avatar" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                {nom ? nom.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <div className="db-user-name">{nom} {prenom}</div>
                <div className="db-user-email">{email}</div>
              </div>
              <FiChevronDown size={14} color="#64748b" />
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="db-main">
        <header className="db-topbar">
          <div className="db-search">
            <FiSearch size={16} color="#64748b" />
            <input placeholder="Rechercher..." />
            <span className="db-search-kbd">Ctrl+K</span>
          </div>
          <div className="db-topbar-right">
            <div className="db-notif-btn">
              <FiBell size={20} />
              {nonLuesCount > 0 && <span className="db-notif-badge">{nonLuesCount}</span>}
            </div>
            <div className="db-topbar-user">
              <div className="db-topbar-avatar" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                {nom ? nom.charAt(0).toUpperCase() : 'A'}
              </div>
              <span>{getRoleLabel()}</span>
              <FiChevronDown size={14} />
            </div>
          </div>
        </header>

        <div className="db-content">
          <div className="mat-header">
            <div>
              <h1 className="mat-title">Notifications</h1>
              <div className="mat-breadcrumb">
                <FiHome size={13} />
                <span style={{ cursor: 'pointer', color: '#3B82F6' }}
                  onClick={() => navigate('/dashboard')}>Accueil</span>
                <span className="mat-sep">/</span>
                <span className="mat-bc-active">Notifications</span>
              </div>
            </div>
            {nonLuesCount > 0 && (
              <button
                onClick={handleMarquerToutesLues}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)',
                  color: '#3B82F6', padding: '8px 16px', borderRadius: '8px',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                }}
              >
                <FiCheck size={15} /> Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              background: '#0D1B33', border: '1px solid #1A2B4A', borderRadius: '12px',
              padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
              <span style={{ color: '#64748b', fontSize: '12px' }}>Total</span>
              <span style={{ color: '#fff', fontSize: '24px', fontWeight: '800' }}>{notifications.length}</span>
            </div>
            <div style={{
              background: '#0D1B33', border: '1px solid #1A2B4A', borderRadius: '12px',
              padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
              <span style={{ color: '#64748b', fontSize: '12px' }}>Non lues</span>
              <span style={{ color: '#EF4444', fontSize: '24px', fontWeight: '800' }}>{nonLuesCount}</span>
            </div>
            <div style={{
              background: '#0D1B33', border: '1px solid #1A2B4A', borderRadius: '12px',
              padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
              <span style={{ color: '#64748b', fontSize: '12px' }}>Lues</span>
              <span style={{ color: '#22C55E', fontSize: '24px', fontWeight: '800' }}>
                {notifications.length - nonLuesCount}
              </span>
            </div>
          </div>

          {/* Liste */}
          <div style={{
            background: '#0D1B33', border: '1px solid #1A2B4A',
            borderRadius: '14px', overflow: 'hidden'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Chargement...</div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                Aucune notification
              </div>
            ) : notifications.map((n, i) => (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px 20px',
                borderBottom: i < notifications.length - 1 ? '1px solid #1A2B4A' : 'none',
                background: n.lu ? 'transparent' : 'rgba(59,130,246,0.05)',
                transition: 'background 0.2s'
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                  background: n.lu ? 'rgba(100,116,139,0.15)' : 'rgba(59,130,246,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: n.lu ? '#64748b' : '#3B82F6'
                }}>
                  <FiBell size={18} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    color: n.lu ? '#94a3b8' : '#fff',
                    fontSize: '14px', fontWeight: n.lu ? '400' : '600'
                  }}>
                    {n.message}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>
                    {n.dateEnvoi || '—'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  {!n.lu && (
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: '#3B82F6', display: 'inline-block'
                    }} />
                  )}
                  {n.lu ? (
                    <span style={{
                      fontSize: '11px', color: '#22C55E', fontWeight: '500'
                    }}>Lu</span>
                  ) : (
                    <button
                      onClick={() => handleMarquerLue(n.id)}
                      style={{
                        background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                        color: '#3B82F6', padding: '4px 12px', borderRadius: '6px',
                        cursor: 'pointer', fontSize: '12px', fontWeight: '500'
                      }}
                    >
                      Marquer lu
                    </button>
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
