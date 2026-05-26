import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import {
  FiSearch, FiPlus, FiEye, FiEdit2, FiTrash2,
  FiBell, FiChevronDown, FiChevronLeft,
  FiChevronRight, FiHome, FiAlertTriangle, FiSettings
} from 'react-icons/fi';
import { HiOutlineDesktopComputer } from 'react-icons/hi';
import { MdOutlineAssignment, MdOutlineNotifications, MdOutlineDashboard } from 'react-icons/md';
import { TbReportAnalytics, TbDeviceDesktop } from 'react-icons/tb';
import { BsTools, BsFileText, BsPeople } from 'react-icons/bs';

const ITEMS_PER_PAGE = 7;

export default function Pannes() {
  const navigate = useNavigate();
  const nom = localStorage.getItem('nom');
  const prenom = localStorage.getItem('prenom');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');

  const [pannes, setPannes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const menuItems = [
    { icon: <MdOutlineDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <HiOutlineDesktopComputer size={20} />, label: 'Matériels', path: '/materiels' },
    { icon: <MdOutlineAssignment size={20} />, label: 'Affectations', path: '/affectations' },
    { icon: <FiAlertTriangle size={20} />, label: 'Pannes', path: '/pannes' },
    { icon: <BsTools size={18} />, label: 'Maintenances', path: '/maintenances' },
    { icon: <BsFileText size={18} />, label: 'Demandes', path: '/demandes' },
    { icon: <BsPeople size={20} />, label: 'Utilisateurs', path: '/utilisateurs' },
    { icon: <MdOutlineNotifications size={22} />, label: 'Notifications', path: '/notifications', badge: 3 },
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

  const getStatutClass = (statut) => {
    const map = {
      EN_ATTENTE: 'mat-badge-orange',
      EN_COURS: 'mat-badge-blue',
      RESOLU: 'mat-badge-green',
      ESCALADEE: 'mat-badge-red',
    };
    return map[statut] || '';
  };

  const getStatutLabel = (statut) => {
    const map = {
      EN_ATTENTE: 'En attente',
      EN_COURS: 'En cours',
      RESOLU: 'Résolu',
      ESCALADEE: 'Escaladée',
    };
    return map[statut] || statut;
  };

  const getGraviteClass = (gravite) => {
    const map = {
      FAIBLE: 'mat-badge-green',
      MOYENNE: 'mat-badge-orange',
      HAUTE: 'mat-badge-red',
    };
    return map[gravite] || '';
  };

  useEffect(() => {
    api.get('/api/pannes')
      .then(res => { setPannes(res.data); setFiltered(res.data); setLoading(false); })
      .catch(() => { setError("Impossible de charger les pannes."); setLoading(false); });
  }, []);

  useEffect(() => {
    let result = pannes;
    if (activeFilter !== 'Tous') {
      const map = {
        'En attente': 'EN_ATTENTE',
        'En cours': 'EN_COURS',
        'Résolu': 'RESOLU',
        'Escaladée': 'ESCALADEE',
      };
      result = result.filter(p => p.statut === map[activeFilter]);
    }
    if (search) {
      result = result.filter(p =>
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.materiel?.marque?.toLowerCase().includes(search.toLowerCase()) ||
        p.beneficiaire?.nom?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
    setCurrentPage(1);
  }, [search, activeFilter, pannes]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette panne ?')) {
      try {
        await api.delete(`/api/pannes/${id}`);
        setPannes(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  return (
    <div className="db-root">

      {/* ── SIDEBAR ── */}
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
              className={`db-nav-item ${item.label === 'Pannes' ? 'db-nav-active' : ''}`}
              onClick={() => navigate(item.path)}
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

      {/* ── MAIN ── */}
      <main className="db-main">

        {/* ── TOPBAR ── */}
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
            <div className="db-topbar-user">
              <div className="db-topbar-avatar" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                {nom ? nom.charAt(0).toUpperCase() : 'A'}
              </div>
              <span>{getRoleLabel()}</span>
              <FiChevronDown size={14} />
            </div>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <div className="db-content">

          {/* ── HEADER PAGE ── */}
          <div className="mat-header">
            <div>
              <h1 className="mat-title">Gestion des Pannes</h1>
              <div className="mat-breadcrumb">
                <FiHome size={13} />
                <span style={{ cursor: 'pointer', color: '#3B82F6' }}
                  onClick={() => navigate('/dashboard')}>Accueil</span>
                <span className="mat-sep">/</span>
                <span className="mat-bc-active">Pannes</span>
              </div>
            </div>
          </div>

          {/* ── TOOLBAR ── */}
          <div className="mat-toolbar">
            <div className="mat-search">
              <FiSearch size={16} color="#64748b" />
              <input
                placeholder="Rechercher une panne..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="mat-btn-add" onClick={() => navigate('/pannes/ajouter')}>
              <FiPlus size={18} /> Signaler une panne
            </button>
          </div>

          {/* ── FILTERS ── */}
          <div className="mat-filters">
            {['Tous', 'En attente', 'En cours', 'Résolu', 'Escaladée'].map(f => (
              <button
                key={f}
                className={`mat-filter-btn ${activeFilter === f ? 'mat-filter-active' : ''}`}
                style={{
                  border: activeFilter === f ? 'none' :
                    f === 'En attente' ? '1px solid #F59E0B' :
                    f === 'En cours' ? '1px solid #3B82F6' :
                    f === 'Résolu' ? '1px solid #22C55E' :
                    f === 'Escaladée' ? '1px solid #EF4444' :
                    '1px solid #1A2B4A',
                  color: activeFilter === f ? '#fff' :
                    f === 'En attente' ? '#F59E0B' :
                    f === 'En cours' ? '#3B82F6' :
                    f === 'Résolu' ? '#22C55E' :
                    f === 'Escaladée' ? '#EF4444' :
                    '#64748b',
                  background: activeFilter === f ? '#2563EB' : 'transparent',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* ── TABLE ── */}
          <div className="mat-table-wrap">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                Chargement...
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>
                {error}
              </div>
            ) : (
              <table className="mat-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Matériel</th>
                    <th>Bénéficiaire</th>
                    <th>Gravité</th>
                    <th>Statut</th>
                    <th>Date signalement</th>
                    <th>Date résolution</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        Aucune panne trouvée
                      </td>
                    </tr>
                  ) : paginated.map((p, i) => (
                    <tr key={p.id || i}>
                      <td style={{ color: '#fff', fontWeight: '500' }}>{p.description}</td>
                      <td>{p.materiel?.marque} {p.materiel?.modele}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: `hsl(${i * 60 + 200}, 70%, 40%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0
                          }}>
                            {p.beneficiaire?.nom?.charAt(0)}{p.beneficiaire?.prenom?.charAt(0)}
                          </div>
                          <span>{p.beneficiaire?.nom} {p.beneficiaire?.prenom}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`mat-badge ${getGraviteClass(p.niveauGravite)}`}>
                          {p.niveauGravite}
                        </span>
                      </td>
                      <td>
                        <span className={`mat-badge ${getStatutClass(p.statut)}`}>
                          {getStatutLabel(p.statut)}
                        </span>
                      </td>
                      <td>{p.dateSignalement}</td>
                      <td>{p.dateResolution || '—'}</td>
                      <td>
                        <div className="mat-actions">
                          <button className="mat-action-btn mat-action-view"
                            onClick={() => navigate(`/pannes/${p.id}`)}>
                            <FiEye size={15} />
                          </button>
                          {(role === 'ADMINISTRATEUR' || role === 'TECHNICIEN') && (
                            <>
                              <button className="mat-action-btn mat-action-edit"
                                onClick={() => navigate(`/pannes/modifier/${p.id}`)}>
                                <FiEdit2 size={15} />
                              </button>
                              <button className="mat-action-btn mat-action-delete"
                                onClick={() => handleDelete(p.id)}>
                                <FiTrash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── PAGINATION ── */}
          {!loading && !error && filtered.length > 0 && (
            <div className="mat-pagination">
              <span className="mat-pag-info">
                Affichage {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length}
              </span>
              <div className="mat-pag-btns">
                <button className="mat-pag-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}>
                  <FiChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`mat-pag-btn ${currentPage === p ? 'mat-pag-active' : ''}`}
                    onClick={() => setCurrentPage(p)}>
                    {p}
                  </button>
                ))}
                <button className="mat-pag-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}>
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}