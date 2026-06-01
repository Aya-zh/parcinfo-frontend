import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiChevronLeft, FiChevronRight, FiChevronDown,
  FiAlertTriangle, FiSettings
} from 'react-icons/fi';
import { HiOutlineDesktopComputer } from 'react-icons/hi';
import { MdOutlineAssignment, MdOutlineNotifications, MdOutlineDashboard } from 'react-icons/md';
import { TbReportAnalytics, TbDeviceDesktop } from 'react-icons/tb';
import { BsTools, BsFileText, BsPeople } from 'react-icons/bs';

export default function Sidebar({ sidebarOpen, setSidebarOpen, activeLabel }) {
  const navigate = useNavigate();
  const { notifCount } = useAuth();
  const nom = localStorage.getItem('nom');
  const prenom = localStorage.getItem('prenom');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');

  const menuItems = [
    { icon: <MdOutlineDashboard size={20} />, label: 'Dashboard', path: '/dashboard', roles: ['ADMINISTRATEUR', 'RESPONSABLE', 'TECHNICIEN', 'BENEFICIAIRE'] },
    { icon: <HiOutlineDesktopComputer size={20} />, label: 'Matériels', path: '/materiels', roles: ['ADMINISTRATEUR', 'RESPONSABLE', 'TECHNICIEN'] },
    { icon: <MdOutlineAssignment size={20} />, label: 'Affectations', path: '/affectations', roles: ['ADMINISTRATEUR', 'RESPONSABLE', 'BENEFICIAIRE'] },
    { icon: <FiAlertTriangle size={20} />, label: 'Pannes', path: '/pannes', roles: ['ADMINISTRATEUR', 'TECHNICIEN', 'BENEFICIAIRE'] },
    { icon: <BsTools size={18} />, label: 'Maintenances', path: '/maintenances', roles: ['ADMINISTRATEUR', 'TECHNICIEN'] },
    { icon: <BsFileText size={18} />, label: 'Demandes', path: '/demandes', roles: ['ADMINISTRATEUR', 'RESPONSABLE', 'BENEFICIAIRE'] },
    { icon: <BsPeople size={20} />, label: 'Utilisateurs', path: '/utilisateurs', roles: ['ADMINISTRATEUR'] },
    { icon: <MdOutlineNotifications size={22} />, label: 'Notifications', path: '/notifications', badge: notifCount, roles: ['ADMINISTRATEUR', 'RESPONSABLE', 'TECHNICIEN', 'BENEFICIAIRE'] },
    { icon: <TbReportAnalytics size={20} />, label: 'Rapports', path: '/rapports', roles: ['ADMINISTRATEUR', 'RESPONSABLE'] },
  ].filter(item => item.roles.includes(role));

  return (
    <aside className={`db-sidebar ${sidebarOpen ? '' : 'db-sidebar-closed'}`}>
      <div className="db-sidebar-logo">
        <div className="db-logo-icon">
          <TbDeviceDesktop size={22} color="#fff" />
        </div>
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
          <div
            key={item.label}
            className={`db-nav-item ${item.label === activeLabel ? 'db-nav-active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="db-nav-icon">{item.icon}</span>
            {sidebarOpen && <span className="db-nav-label">{item.label}</span>}
            {sidebarOpen && item.badge > 0 && (
              <span className="db-badge">{item.badge}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="db-sidebar-bottom">
        <div className="db-nav-item" onClick={() => { localStorage.clear(); navigate('/login'); }}>
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
  );
}