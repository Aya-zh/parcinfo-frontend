import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import {
  FiAlertTriangle, FiBell, FiSettings, FiSearch,
  FiChevronDown, FiMoreHorizontal, FiSun, FiMoon,
  FiChevronLeft, FiChevronRight, FiCalendar
} from 'react-icons/fi';
import { HiOutlineUserGroup, HiOutlineDesktopComputer } from 'react-icons/hi';
import { MdOutlineAssignment, MdOutlineNotifications, MdOutlineDashboard } from 'react-icons/md';
import { TbReportAnalytics, TbDeviceDesktop } from 'react-icons/tb';
import { BsTools, BsFileText, BsPeople } from 'react-icons/bs';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const pannesDataStatic = [
  { day: '01', val: 6 }, { day: '04', val: 9 }, { day: '07', val: 14 },
  { day: '10', val: 8 }, { day: '13', val: 12 }, { day: '16', val: 10 },
  { day: '19', val: 5 }, { day: '22', val: 11 }, { day: '24', val: 8 }
];

const affectationsData = [
  { m: 'Jan', val: 18 }, { m: 'Fév', val: 22 }, { m: 'Mar', val: 28 },
  { m: 'Avr', val: 30 }, { m: 'Mai', val: 38 }, { m: 'Juin', val: 45 }
];

const dernieresPannesStatic = [
  { id: 'PC-023', desc: 'Écran noir', user: 'Jean Dupont', time: 'Il y a 1h', status: 'EN COURS', statusColor: '#F97316' },
  { id: 'PC-067', desc: 'Ne démarre plus', user: 'Marie Martin', time: 'Il y a 3h', status: 'EN ATTENTE', statusColor: '#EAB308' },
  { id: 'SRV-01', desc: 'Service inaccessible', user: 'Support IT', time: 'Il y a 5h', status: 'ESCALADÉE', statusColor: '#EF4444' },
  { id: 'PC-045', desc: 'Problème réseau', user: 'Thomas Bernard', time: 'Il y a 1j', status: 'RÉSOLU', statusColor: '#22C55E' },
];

const derniersMaterielsStatic = [
  { nom: 'Laptop Dell Latitude 5440', inv: 'INV-1248', date: '24 mai 2024' },
  { nom: 'Écran Lenovo ThinkVision', inv: 'INV-1247', date: '23 mai 2024' },
  { nom: 'PC HP EliteDesk 800 G9', inv: 'INV-1246', date: '22 mai 2024' },
  { nom: 'Imprimante HP LaserJet Pro', inv: 'INV-1245', date: '21 mai 2024' },
];

const dernieresAffectationsStatic = [
  { nom: 'Jean Dupont', materiel: 'Laptop Dell Latitude 5440', date: '24 mai 2024', avatar: 'JD' },
  { nom: 'Marie Martin', materiel: 'PC HP EliteDesk 800 G9', date: '23 mai 2024', avatar: 'MM' },
  { nom: 'Thomas Bernard', materiel: 'Écran Lenovo ThinkVision', date: '22 mai 2024', avatar: 'TB' },
  { nom: 'Sophie Leroy', materiel: 'Imprimante HP LaserJet Pro', date: '21 mai 2024', avatar: 'SL' },
];

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const nom = localStorage.getItem('nom');
  const prenom = localStorage.getItem('prenom');
  const role = localStorage.getItem('role');

  const [stats, setStats] = useState({
    totalMateriels: 124, enPanne: 8, affectes: 29, totalUtilisateurs: 15,
    disponibles: 87, enMaintenance: 0, totalAffectations: 0, totalPannes: 0, totalDemandes: 0
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [pannes, setPannes] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [demandes, setDemandes] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    if (role === 'BENEFICIAIRE') {
      api.get('/api/pannes').then(res => {
        const mesPannes = res.data.filter(p => p.beneficiaire?.id === parseInt(userId));
        setPannes(mesPannes.slice(0, 4));
      }).catch(() => {});

      api.get('/api/affectations').then(res => {
        const mesAffectations = res.data.filter(a => a.utilisateur?.id === parseInt(userId));
        setAffectations(mesAffectations.slice(0, 4));
      }).catch(() => {});

      api.get('/api/demandes').then(res => {
        const mesDemandes = res.data.filter(d => d.beneficiaire?.id === parseInt(userId));
        setDemandes(mesDemandes.slice(0, 4));
      }).catch(() => {});

    } else {
      api.get('/api/dashboard').then(res => setStats(res.data)).catch(() => {});
      api.get('/api/pannes').then(res => setPannes(res.data.slice(0, 4))).catch(() => {});
      api.get('/api/materiels').then(res => setMateriels(res.data.slice(0, 4))).catch(() => {});
      api.get('/api/affectations').then(res => setAffectations(res.data.slice(0, 4))).catch(() => {});
      api.get('/api/demandes').then(res => setDemandes(res.data.slice(0, 4))).catch(() => {});
    }
  }, []);

  const pieData = [
    { name: 'Disponibles', value: stats.disponibles || 1, color: '#3B82F6' },
    { name: 'Affectés', value: stats.affectes || 1, color: '#06B6D4' },
    { name: 'En Panne', value: stats.enPanne || 1, color: '#EF4444' },
    { name: 'En Maintenance', value: stats.enMaintenance || 1, color: '#F59E0B' },
  ];

  const menuItems = [
    { icon: <MdOutlineDashboard size={20} />, label: 'Dashboard', path: '/dashboard', roles: ['ADMINISTRATEUR', 'RESPONSABLE', 'TECHNICIEN', 'BENEFICIAIRE'] },
    { icon: <HiOutlineDesktopComputer size={20} />, label: 'Matériels', path: '/materiels', roles: ['ADMINISTRATEUR', 'RESPONSABLE', 'TECHNICIEN'] },
    { icon: <MdOutlineAssignment size={20} />, label: 'Affectations', path: '/affectations', roles: ['ADMINISTRATEUR', 'RESPONSABLE', 'BENEFICIAIRE'] },
    { icon: <FiAlertTriangle size={20} />, label: 'Pannes', path: '/pannes', roles: ['ADMINISTRATEUR', 'TECHNICIEN', 'BENEFICIAIRE'] },
    { icon: <BsTools size={18} />, label: 'Maintenances', path: '/maintenances', roles: ['ADMINISTRATEUR', 'TECHNICIEN'] },
    { icon: <BsFileText size={18} />, label: 'Demandes', path: '/demandes', roles: ['ADMINISTRATEUR', 'RESPONSABLE', 'BENEFICIAIRE'] },
    { icon: <BsPeople size={20} />, label: 'Utilisateurs', path: '/utilisateurs', roles: ['ADMINISTRATEUR'] },
    { icon: <MdOutlineNotifications size={22} />, label: 'Notifications', path: '/notifications', badge: 3, roles: ['ADMINISTRATEUR', 'RESPONSABLE', 'TECHNICIEN', 'BENEFICIAIRE'] },
    { icon: <TbReportAnalytics size={20} />, label: 'Rapports', path: '/rapports', roles: ['ADMINISTRATEUR', 'RESPONSABLE'] },
  ].filter(item => item.roles.includes(role));

  const getRoleLabel = () => {
    switch (role) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      case 'RESPONSABLE': return 'Responsable';
      case 'TECHNICIEN': return 'Technicien';
      case 'BENEFICIAIRE': return 'Bénéficiaire';
      default: return 'Utilisateur';
    }
  };

  const getGreetingSub = () => {
    switch (role) {
      case 'BENEFICIAIRE': return 'Voici un aperçu de vos équipements et demandes';
      case 'TECHNICIEN': return 'Voici les interventions et maintenances en cours';
      case 'RESPONSABLE': return 'Voici un aperçu des affectations et demandes';
      default: return 'Voici un aperçu général de votre parc informatique';
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'EN_COURS': return '#F97316';
      case 'EN_ATTENTE': return '#EAB308';
      case 'ESCALADEE': return '#EF4444';
      case 'RESOLU': return '#22C55E';
      default: return '#64748b';
    }
  };

  const handleMenuClick = (item) => {
    setActiveMenu(item.label);
    navigate(item.path);
  };

  const renderStatCards = () => {
    if (role === 'BENEFICIAIRE') {
      return (
        <>
          <div className="db-card db-card-blue">
            <div className="db-card-top">
              <div className="db-card-icon db-icon-blue"><HiOutlineDesktopComputer size={24} /></div>
              <div className="db-card-info">
                <div className="db-card-label">Mes Matériels</div>
                <div className="db-card-value">{affectations.length}</div>
                <div className="db-card-trend" style={{ color: '#22C55E' }}>Affectés</div>
              </div>
            </div>
          </div>
          <div className="db-card db-card-purple">
            <div className="db-card-top">
              <div className="db-card-icon db-icon-purple"><FiAlertTriangle size={24} /></div>
              <div className="db-card-info">
                <div className="db-card-label">Mes Pannes</div>
                <div className="db-card-value">{pannes.length}</div>
                <div className="db-card-trend" style={{ color: '#A855F7' }}>Signalées</div>
              </div>
            </div>
          </div>
          <div className="db-card db-card-cyan">
            <div className="db-card-top">
              <div className="db-card-icon db-icon-cyan"><BsFileText size={24} /></div>
              <div className="db-card-info">
                <div className="db-card-label">Mes Demandes</div>
                <div className="db-card-value">{demandes.length}</div>
                <div className="db-card-trend" style={{ color: '#06B6D4' }}>En cours</div>
              </div>
            </div>
          </div>
          <div className="db-card db-card-blue2">
            <div className="db-card-top">
              <div className="db-card-icon db-icon-blue2"><MdOutlineNotifications size={24} /></div>
              <div className="db-card-info">
                <div className="db-card-label">Notifications</div>
                <div className="db-card-value">3</div>
                <div className="db-card-trend" style={{ color: '#3B82F6' }}>Non lues</div>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (role === 'TECHNICIEN') {
      return (
        <>
          <div className="db-card db-card-blue">
            <div className="db-card-top">
              <div className="db-card-icon db-icon-blue"><HiOutlineDesktopComputer size={24} /></div>
              <div className="db-card-info">
                <div className="db-card-label">Total Matériels</div>
                <div className="db-card-value">{stats.totalMateriels}</div>
                <div className="db-card-trend" style={{ color: '#22C55E' }}>Dans le parc</div>
              </div>
            </div>
            <div className="db-card-chart">
              <ResponsiveContainer width="100%" height={50}>
                <LineChart data={[{ v: 10 }, { v: 20 }, { v: 15 }, { v: 30 }, { v: 25 }, { v: 40 }]}>
                  <Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="db-card db-card-purple">
            <div className="db-card-top">
              <div className="db-card-icon db-icon-purple"><FiAlertTriangle size={24} /></div>
              <div className="db-card-info">
                <div className="db-card-label">Pannes En Attente</div>
                <div className="db-card-value">{stats.enPanne}</div>
                <div className="db-card-trend" style={{ color: '#EF4444' }}>À traiter</div>
              </div>
            </div>
            <div className="db-card-chart">
              <ResponsiveContainer width="100%" height={50}>
                <LineChart data={[{ v: 5 }, { v: 8 }, { v: 6 }, { v: 10 }, { v: 7 }, { v: 9 }]}>
                  <Line type="monotone" dataKey="v" stroke="#A855F7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="db-card db-card-cyan">
            <div className="db-card-top">
              <div className="db-card-icon db-icon-cyan"><BsTools size={24} /></div>
              <div className="db-card-info">
                <div className="db-card-label">Maintenances</div>
                <div className="db-card-value">{stats.totalMaintenances || 0}</div>
                <div className="db-card-trend" style={{ color: '#06B6D4' }}>Planifiées</div>
              </div>
            </div>
            <div className="db-card-chart">
              <ResponsiveContainer width="100%" height={50}>
                <LineChart data={[{ v: 3 }, { v: 5 }, { v: 4 }, { v: 7 }, { v: 6 }, { v: 8 }]}>
                  <Line type="monotone" dataKey="v" stroke="#06B6D4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="db-card db-card-blue2">
            <div className="db-card-top">
              <div className="db-card-icon db-icon-blue2"><HiOutlineDesktopComputer size={24} /></div>
              <div className="db-card-info">
                <div className="db-card-label">En Maintenance</div>
                <div className="db-card-value">{stats.enMaintenance}</div>
                <div className="db-card-trend" style={{ color: '#F59E0B' }}>En cours</div>
              </div>
            </div>
            <div className="db-card-chart">
              <ResponsiveContainer width="100%" height={50}>
                <LineChart data={[{ v: 1 }, { v: 2 }, { v: 1 }, { v: 3 }, { v: 2 }, { v: 2 }]}>
                  <Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="db-card db-card-blue">
          <div className="db-card-top">
            <div className="db-card-icon db-icon-blue"><HiOutlineDesktopComputer size={24} /></div>
            <div className="db-card-info">
              <div className="db-card-label">Total Matériels</div>
              <div className="db-card-value">{stats.totalMateriels}</div>
              <div className="db-card-trend" style={{ color: '#22C55E' }}>+12 ce mois</div>
            </div>
          </div>
          <div className="db-card-chart">
            <ResponsiveContainer width="100%" height={50}>
              <LineChart data={[{ v: 10 }, { v: 20 }, { v: 15 }, { v: 30 }, { v: 25 }, { v: 40 }]}>
                <Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="db-card db-card-purple">
          <div className="db-card-top">
            <div className="db-card-icon db-icon-purple"><FiAlertTriangle size={24} /></div>
            <div className="db-card-info">
              <div className="db-card-label">En Panne</div>
              <div className="db-card-value">{stats.enPanne}</div>
              <div className="db-card-trend" style={{ color: '#A855F7' }}>+2 ce mois</div>
            </div>
          </div>
          <div className="db-card-chart">
            <ResponsiveContainer width="100%" height={50}>
              <LineChart data={[{ v: 5 }, { v: 8 }, { v: 6 }, { v: 10 }, { v: 7 }, { v: 9 }]}>
                <Line type="monotone" dataKey="v" stroke="#A855F7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="db-card db-card-cyan">
          <div className="db-card-top">
            <div className="db-card-icon db-icon-cyan"><HiOutlineUserGroup size={24} /></div>
            <div className="db-card-info">
              <div className="db-card-label">Affectés</div>
              <div className="db-card-value">{stats.affectes}</div>
              <div className="db-card-trend" style={{ color: '#06B6D4' }}>+5 ce mois</div>
            </div>
          </div>
          <div className="db-card-chart">
            <ResponsiveContainer width="100%" height={50}>
              <LineChart data={[{ v: 15 }, { v: 20 }, { v: 18 }, { v: 25 }, { v: 22 }, { v: 29 }]}>
                <Line type="monotone" dataKey="v" stroke="#06B6D4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="db-card db-card-blue2">
          <div className="db-card-top">
            <div className="db-card-icon db-icon-blue2"><BsPeople size={24} /></div>
            <div className="db-card-info">
              <div className="db-card-label">Utilisateurs</div>
              <div className="db-card-value">{stats.totalUtilisateurs}</div>
              <div className="db-card-trend" style={{ color: '#3B82F6' }}>+3 ce mois</div>
            </div>
          </div>
          <div className="db-card-chart">
            <ResponsiveContainer width="100%" height={50}>
              <LineChart data={[{ v: 8 }, { v: 10 }, { v: 9 }, { v: 13 }, { v: 12 }, { v: 15 }]}>
                <Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="db-root">
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
              className={`db-nav-item ${activeMenu === item.label ? 'db-nav-active' : ''}`}
              onClick={() => handleMenuClick(item)}
            >
              <span className="db-nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="db-nav-label">{item.label}</span>}
              {sidebarOpen && item.badge && (
                <span className="db-badge">{item.badge}</span>
              )}
            </div>
          ))}
        </nav>

        <div className="db-sidebar-bottom">
          <div className="db-nav-item" onClick={logout}>
            <span className="db-nav-icon"><FiSettings size={20} /></span>
            {sidebarOpen && <span className="db-nav-label">Déconnexion</span>}
          </div>
          {sidebarOpen && (
            <div className="db-user-card">
              <div className="db-user-avatar" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                {nom ? nom.charAt(0).toUpperCase() : 'U'}
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
              <span className="db-notif-badge">3</span>
            </div>
            <div className="db-theme-toggle">
              <FiSun size={14} />
              <div className="db-toggle-track">
                <div className="db-toggle-thumb"></div>
              </div>
              <FiMoon size={14} />
            </div>
            <div className="db-topbar-user">
              <div className="db-topbar-avatar" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                {nom ? nom.charAt(0).toUpperCase() : 'U'}
              </div>
              <span>{getRoleLabel()}</span>
              <FiChevronDown size={14} />
            </div>
          </div>
        </header>

        <div className="db-content">
          <div className="db-greeting-row">
            <div>
              <h1 className="db-greeting">Bonjour, {nom} 👋</h1>
              <p className="db-greeting-sub">{getGreetingSub()}</p>
            </div>
            <div className="db-date-pill">
              <FiCalendar size={16} />
              <span>Aujourd'hui : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <FiChevronDown size={14} />
            </div>
          </div>

          <div className="db-cards">
            {renderStatCards()}
          </div>

          {role !== 'BENEFICIAIRE' && (
            <div className="db-charts-row">
              <div className="db-chart-box">
                <div className="db-chart-header">
                  <span>Répartition des matériels par état</span>
                  <FiMoreHorizontal size={18} color="#64748b" />
                </div>
                <div className="db-pie-content">
                  <div className="db-pie-wrap">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie data={pieData} cx={95} cy={95} innerRadius={60} outerRadius={90}
                          dataKey="value" strokeWidth={0}>
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="db-pie-center">
                      <div className="db-pie-total">{stats.totalMateriels}</div>
                      <div className="db-pie-label">Total</div>
                    </div>
                  </div>
                  <div className="db-pie-legend">
                    {pieData.map((d, i) => (
                      <div key={i} className="db-legend-item">
                        <span className="db-legend-dot" style={{ background: d.color }}></span>
                        <span className="db-legend-name">{d.name}</span>
                        <span className="db-legend-pct">
                          {stats.totalMateriels > 0 ? ((d.value / stats.totalMateriels) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="db-chart-box">
                <div className="db-chart-header">
                  <span>Évolution des pannes</span>
                  <FiMoreHorizontal size={18} color="#64748b" />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={pannesDataStatic}>
                    <XAxis dataKey="day" stroke="#334155" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis stroke="#334155" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0D1B33', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="val" stroke="#3B82F6" strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="db-chart-footer">
                  <span className="db-chart-legend-line"></span>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>Nombre de pannes</span>
                </div>
              </div>

              <div className="db-chart-box">
                <div className="db-chart-header">
                  <span>Affectations par mois</span>
                  <FiMoreHorizontal size={18} color="#64748b" />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={affectationsData}>
                    <XAxis dataKey="m" stroke="#334155" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis stroke="#334155" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0D1B33', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="val" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="db-chart-footer">
                  <span className="db-chart-legend-bar"></span>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>Nombre d'affectations</span>
                </div>
              </div>
            </div>
          )}

          <div className="db-bottom-row">
            <div className="db-table-box">
              <div className="db-table-header">
                <span>{role === 'BENEFICIAIRE' ? 'Mes pannes' : 'Dernières pannes'}</span>
                <span className="db-voir-tout" onClick={() => navigate('/pannes')}>Voir tout</span>
              </div>
              {(pannes.length > 0 ? pannes : dernieresPannesStatic).map((p, i) => (
                <div key={i} className="db-panne-item">
                  <div className="db-panne-icon-wrap" style={{ background: (p.statut ? getStatusColor(p.statut) : p.statusColor) + '22' }}>
                    <FiAlertTriangle size={16} style={{ color: p.statut ? getStatusColor(p.statut) : p.statusColor }} />
                  </div>
                  <div className="db-panne-info">
                    <div className="db-panne-title">{p.description || `${p.id} – ${p.desc}`}</div>
                    <div className="db-panne-sub">{p.niveauGravite ? `Gravité : ${p.niveauGravite}` : `Utilisateur : ${p.user}`}</div>
                  </div>
                  <div className="db-panne-right">
                    <span className="db-status-badge" style={{
                      background: (p.statut ? getStatusColor(p.statut) : p.statusColor) + '22',
                      color: p.statut ? getStatusColor(p.statut) : p.statusColor
                    }}>
                      {p.statut || p.status}
                    </span>
                    {p.time && <div className="db-panne-time">{p.time}</div>}
                  </div>
                </div>
              ))}
              <div className="db-voir-tous" onClick={() => navigate('/pannes')}>
                {role === 'BENEFICIAIRE' ? 'Voir mes pannes →' : 'Voir toutes les pannes →'}
              </div>
            </div>

            {role === 'BENEFICIAIRE' ? (
              <div className="db-table-box">
                <div className="db-table-header">
                  <span>Mes demandes</span>
                  <span className="db-voir-tout" onClick={() => navigate('/demandes')}>Voir tout</span>
                </div>
                {(demandes.length > 0 ? demandes : [
                  { objet: 'Demande ordinateur', statut: 'EN_ATTENTE', dateDemande: '22 mai 2026' },
                ]).map((d, i) => (
                  <div key={i} className="db-panne-item">
                    <div className="db-panne-icon-wrap" style={{ background: getStatusColor(d.statut) + '22' }}>
                      <BsFileText size={16} style={{ color: getStatusColor(d.statut) }} />
                    </div>
                    <div className="db-panne-info">
                      <div className="db-panne-title">{d.objet}</div>
                      <div className="db-panne-sub">{d.dateDemande}</div>
                    </div>
                    <div className="db-panne-right">
                      <span className="db-status-badge" style={{
                        background: getStatusColor(d.statut) + '22',
                        color: getStatusColor(d.statut)
                      }}>
                        {d.statut}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="db-voir-tous" onClick={() => navigate('/demandes')}>
                  Voir mes demandes →
                </div>
              </div>
            ) : (
              <div className="db-table-box">
                <div className="db-table-header">
                  <span>Derniers matériels ajoutés</span>
                  <span className="db-voir-tout" onClick={() => navigate('/materiels')}>Voir tout</span>
                </div>
                {(materiels.length > 0 ? materiels : derniersMaterielsStatic).map((m, i) => (
                  <div key={i} className="db-mat-item">
                    <div className="db-mat-icon-wrap">
                      <HiOutlineDesktopComputer size={20} color="#3B82F6" />
                    </div>
                    <div className="db-mat-info">
                      <div className="db-mat-title">{m.marque ? `${m.marque} ${m.modele}` : m.nom}</div>
                      <div className="db-mat-sub">{m.codeInventaire || m.inv}</div>
                    </div>
                    <div className="db-mat-date">{m.dateAcquisition || m.date}</div>
                  </div>
                ))}
                <div className="db-voir-tous" onClick={() => navigate('/materiels')}>
                  Voir tous les matériels →
                </div>
              </div>
            )}

            <div className="db-table-box">
              <div className="db-table-header">
                <span>{role === 'BENEFICIAIRE' ? 'Mes affectations' : 'Dernières affectations'}</span>
                <span className="db-voir-tout" onClick={() => navigate('/affectations')}>Voir tout</span>
              </div>
              {(affectations.length > 0 ? affectations : dernieresAffectationsStatic).map((a, i) => (
                <div key={i} className="db-aff-item">
                  <div className="db-aff-avatar" style={{ background: `hsl(${i * 60 + 200}, 70%, 40%)` }}>
                    {a.utilisateur?.nom?.charAt(0) || a.avatar?.charAt(0) || 'U'}
                  </div>
                  <div className="db-aff-info">
                    <div className="db-aff-name">
                      {a.utilisateur ? `${a.utilisateur.nom} ${a.utilisateur.prenom}` : a.nom}
                    </div>
                    <div className="db-aff-mat">
                      {a.materiel ? `${a.materiel.marque} ${a.materiel.modele}` : a.materiel}
                    </div>
                  </div>
                  <div className="db-aff-date">{a.dateAffectation || a.date}</div>
                </div>
              ))}
              <div className="db-voir-tous" onClick={() => navigate('/affectations')}>
                {role === 'BENEFICIAIRE' ? 'Voir mes affectations →' : 'Voir toutes les affectations →'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}