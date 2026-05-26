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

export default function Materiels() {
  const navigate = useNavigate();
  const nom = localStorage.getItem('nom');
  const prenom = localStorage.getItem('prenom');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');

  const [materiels, setMateriels] = useState([]);
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

  const fetchMateriels = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/materiels');
      setMateriels(res.data);
      setFiltered(res.data);
      setError(null);
    } catch (err) {
      setError("Impossible de charger les matériels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateriels();
  }, []);

  useEffect(() => {
    let result = materiels;
    if (activeFilter !== 'Tous') {
      const map = {
        'Disponible': 'DISPONIBLE',
        'Affecté': 'AFFECTE',
        'En Panne': 'EN_PANNE',
        'En Maintenance': 'EN_MAINTENANCE'
      };
      result = result.filter(m => m.etat === map[activeFilter]);
    }
    if (search) {
      result = result.filter(m =>
        m.description?.toLowerCase().includes(search.toLowerCase()) ||
        m.codeInventaire?.toLowerCase().includes(search.toLowerCase()) ||
        m.marque?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
    setCurrentPage(1);
  }, [search, activeFilter, materiels]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getEtatLabel = (etat) => {
    const map = {
      DISPONIBLE: 'Disponible',
      AFFECTE: 'Affecté',
      EN_PANNE: 'En Panne',
      EN_MAINTENANCE: 'En Maintenance'
    };
    return map[etat] || etat;
  };

  const getEtatClass = (etat) => {
    const map = {
      DISPONIBLE: 'mat-badge-green',
      AFFECTE: 'mat-badge-blue',
      EN_PANNE: 'mat-badge-red',
      EN_MAINTENANCE: 'mat-badge-orange'
    };
    return map[etat] || '';
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce matériel ?')) {
      try {
        await api.delete(`/api/materiels/${id}`);
        setMateriels(prev => prev.filter(m => m.id !== id));
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
              className={`db-nav-item ${item.label === 'Matériels' ? 'db-nav-active' : ''}`}
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
              <div className="db-user-avatar">
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
            <input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="db-search-kbd">Ctrl+K</span>
          </div>
          <div className="db-topbar-right">
            <div className="db-notif-btn">
              <FiBell size={20} />
              <span className="db-notif-badge">3</span>
            </div>
            <div className="db-topbar-user">
              <div className="db-topbar-avatar">
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
              <h1 className="mat-title">Gestion des Matériels</h1>
              <div className="mat-breadcrumb">
                <FiHome size={13} />
                <span
                  style={{ cursor: 'pointer', color: '#3B82F6' }}
                  onClick={() => navigate('/dashboard')}
                >Accueil</span>
                <span className="mat-sep">/</span>
                <span className="mat-bc-active">Matériels</span>
              </div>
            </div>
          </div>

          {/* ── TOOLBAR ── */}
          <div className="mat-toolbar">
            <div className="mat-search">
              <FiSearch size={16} color="#64748b" />
              <input
                placeholder="Rechercher un matériel..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {role === 'ADMINISTRATEUR' && (
              <button className="mat-btn-add" onClick={() => navigate('/materiels/ajouter')}>
                <FiPlus size={18} /> Ajouter un matériel
              </button>
            )}
          </div>

          {/* ── FILTERS ── */}
          <div className="mat-filters">
            {['Tous', 'Disponible', 'Affecté', 'En Panne', 'En Maintenance'].map(f => (
              <button
                key={f}
                className={`mat-filter-btn ${activeFilter === f ? 'mat-filter-active' : ''} mat-filter-${f.toLowerCase().replace(/ /g, '-')}`}
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
                    <th>Code inventaire</th>
                    <th>Description</th>
                    <th>Marque / Modèle</th>
                    <th>Catégorie</th>
                    <th>État</th>
                    <th>Date acquisition</th>
                    <th>Valeur</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        Aucun matériel trouvé
                      </td>
                    </tr>
                  ) : paginated.map((m, i) => (
                    <tr key={m.id || i}>
                      <td className="mat-code">{m.codeInventaire}</td>
                      <td>{m.description}</td>
                      <td>{m.marque} / {m.modele}</td>
                      <td>{m.categorie}</td>
                      <td>
                        <span className={`mat-badge ${getEtatClass(m.etat)}`}>
                          {getEtatLabel(m.etat)}
                        </span>
                      </td>
                      <td>{m.dateAcquisition}</td>
                      <td>{m.valeur?.toLocaleString()} DH</td>
                      <td>
                        <div className="mat-actions">
                          <button
                            className="mat-action-btn mat-action-view"
                            onClick={() => navigate(`/materiels/${m.id}`)}
                          >
                            <FiEye size={15} />
                          </button>
                          {role === 'ADMINISTRATEUR' && (
                            <>
                              <button
                                className="mat-action-btn mat-action-edit"
                                onClick={() => navigate(`/materiels/modifier/${m.id}`)}
                              >
                                <FiEdit2 size={15} />
                              </button>
                              <button
                                className="mat-action-btn mat-action-delete"
                                onClick={() => handleDelete(m.id)}
                              >
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
                <button
                  className="mat-pag-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`mat-pag-btn ${currentPage === p ? 'mat-pag-active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="mat-pag-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
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