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
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 7;

export default function Demandes() {
  const navigate = useNavigate();
  const nom = localStorage.getItem('nom');
  const prenom = localStorage.getItem('prenom');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const { notifCount } = useAuth();

  const [demandes, setDemandes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      APPROUVEE: 'mat-badge-green',
      REFUSEE: 'mat-badge-red',
      EN_COURS: 'mat-badge-blue',
      TRAITEE: 'mat-badge-green',
    };
    return map[statut] || '';
  };

  const getStatutLabel = (statut) => {
    const map = {
      EN_ATTENTE: 'En attente',
      APPROUVEE: 'Approuvée',
      REFUSEE: 'Refusée',
      EN_COURS: 'En cours',
      TRAITEE: 'Traitée',
    };
    return map[statut] || statut;
  };

  const getPrioriteClass = (priorite) => {
    const map = {
      FAIBLE: 'mat-badge-green',
      MOYENNE: 'mat-badge-orange',
      HAUTE: 'mat-badge-red',
    };
    return map[priorite] || '';
  };

  useEffect(() => {
    api.get('/api/demandes')
      .then(res => { setDemandes(res.data); setFiltered(res.data); setLoading(false); })
      .catch(() => { setError("Impossible de charger les demandes."); setLoading(false); });
  }, []);

  useEffect(() => {
    let result = demandes;
    if (activeFilter !== 'Tous') {
      const map = {
        'En attente': 'EN_ATTENTE',
        'Approuvée': 'APPROUVEE',
        'Refusée': 'REFUSEE',
        'Traitée': 'TRAITEE',
      };
      result = result.filter(d => d.statut === map[activeFilter]);
    }
    if (search) {
      result = result.filter(d =>
        d.objet?.toLowerCase().includes(search.toLowerCase()) ||
        d.beneficiaire?.nom?.toLowerCase().includes(search.toLowerCase()) ||
        d.beneficiaire?.prenom?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
    setCurrentPage(1);
  }, [search, activeFilter, demandes]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette demande ?')) {
      try {
        await api.delete(`/api/demandes/${id}`);
        setDemandes(prev => prev.filter(d => d.id !== id));
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
              className={`db-nav-item ${item.label === 'Demandes' ? 'db-nav-active' : ''}`}
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
              {notifCount > 0 && <span className="db-notif-badge">{notifCount}</span>}
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

          <div className="mat-header">
            <div>
              <h1 className="mat-title">Gestion des Demandes</h1>
              <div className="mat-breadcrumb">
                <FiHome size={13} />
                <span style={{ cursor: 'pointer', color: '#3B82F6' }}
                  onClick={() => navigate('/dashboard')}>Accueil</span>
                <span className="mat-sep">/</span>
                <span className="mat-bc-active">Demandes</span>
              </div>
            </div>
          </div>

          <div className="mat-toolbar">
            <div className="mat-search">
              <FiSearch size={16} color="#64748b" />
              <input
                placeholder="Rechercher une demande..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="mat-btn-add" onClick={() => navigate('/demandes/ajouter')}>
              <FiPlus size={18} /> Nouvelle demande
            </button>
          </div>

          <div className="mat-filters">
            {['Tous', 'En attente', 'Approuvée', 'Refusée', 'Traitée'].map(f => (
              <button
                key={f}
                className={`mat-filter-btn ${activeFilter === f ? 'mat-filter-active' : ''}`}
                style={{
                  border: activeFilter === f ? 'none' :
                    f === 'En attente' ? '1px solid #F59E0B' :
                    f === 'Approuvée' ? '1px solid #22C55E' :
                    f === 'Refusée' ? '1px solid #EF4444' :
                    f === 'Traitée' ? '1px solid #3B82F6' :
                    '1px solid #1A2B4A',
                  color: activeFilter === f ? '#fff' :
                    f === 'En attente' ? '#F59E0B' :
                    f === 'Approuvée' ? '#22C55E' :
                    f === 'Refusée' ? '#EF4444' :
                    f === 'Traitée' ? '#3B82F6' :
                    '#64748b',
                  background: activeFilter === f ? '#2563EB' : 'transparent',
                  padding: '8px 20px', borderRadius: '8px',
                  fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                }}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="mat-table-wrap">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Chargement...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>{error}</div>
            ) : (
              <table className="mat-table">
                <thead>
                  <tr>
                    <th>Objet</th>
                    <th>Bénéficiaire</th>
                    <th>Responsable</th>
                    <th>Priorité</th>
                    <th>Statut</th>
                    <th>Date demande</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        Aucune demande trouvée
                      </td>
                    </tr>
                  ) : paginated.map((d, i) => (
                    <tr key={d.id || i}>
                      <td style={{ color: '#fff', fontWeight: '500' }}>{d.objet}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: `hsl(${i * 60 + 200}, 70%, 40%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0
                          }}>
                            {d.beneficiaire?.nom?.charAt(0)}{d.beneficiaire?.prenom?.charAt(0)}
                          </div>
                          <span>{d.beneficiaire?.nom} {d.beneficiaire?.prenom}</span>
                        </div>
                      </td>
                      <td>{d.responsable?.nom} {d.responsable?.prenom}</td>
                      <td>
                        <span className={`mat-badge ${getPrioriteClass(d.priorite)}`}>
                          {d.priorite}
                        </span>
                      </td>
                      <td>
                        <span className={`mat-badge ${getStatutClass(d.statut)}`}>
                          {getStatutLabel(d.statut)}
                        </span>
                      </td>
                      <td>{d.dateDemande}</td>
                      <td>
                        <div className="mat-actions">
                          <button className="mat-action-btn mat-action-view"
                            onClick={() => navigate(`/demandes/${d.id}`)}>
                            <FiEye size={15} />
                          </button>
                          {(role === 'ADMINISTRATEUR' || role === 'RESPONSABLE') && (
                            <>
                              <button className="mat-action-btn mat-action-edit"
                                onClick={() => navigate(`/demandes/modifier/${d.id}`)}>
                                <FiEdit2 size={15} />
                              </button>
                              <button className="mat-action-btn mat-action-delete"
                                onClick={() => handleDelete(d.id)}>
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
