import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import {
  FiSearch, FiPlus, FiEye, FiEdit2, FiTrash2,
  FiBell, FiChevronDown, FiChevronLeft,
  FiChevronRight, FiHome, FiAlertTriangle,
  FiFileText, FiSettings
} from 'react-icons/fi';
import { HiOutlineDesktopComputer } from 'react-icons/hi';
import { MdOutlineAssignment, MdOutlineNotifications, MdOutlineDashboard } from 'react-icons/md';
import { TbReportAnalytics, TbDeviceDesktop } from 'react-icons/tb';
import { BsTools, BsFileText, BsPeople } from 'react-icons/bs';

const ITEMS_PER_PAGE = 7;

export default function Affectations() {
  const navigate = useNavigate();
  const nom = localStorage.getItem('nom');
  const prenom = localStorage.getItem('prenom');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  const [affectations, setAffectations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  useEffect(() => {
    api.get('/api/affectations')
      .then(res => {
        let data = res.data;
        if (role === 'BENEFICIAIRE') {
          data = data.filter(a => String(a.utilisateur?.id) === String(userId));
        }
        setAffectations(data);
        setFiltered(data);
      })
      .catch(() => {
        const demo = [
          { id: 1, utilisateur: { nom: 'Martin', prenom: 'Sara' }, materiel: { marque: 'Dell', modele: 'Latitude 5520', codeInventaire: 'MAT-001' }, dateAffectation: '2026-05-20', dateRetour: '2026-05-20', statut: 'TERMINEE', motif: 'Nouveau employé' },
          { id: 2, utilisateur: { nom: 'Martin', prenom: 'Sara' }, materiel: { marque: 'Dell', modele: 'Latitude 5520', codeInventaire: 'INV001' }, dateAffectation: '2026-05-21', dateRetour: null, statut: 'EN_COURS', motif: 'Travail projet' },
        ];
        setAffectations(demo);
        setFiltered(demo);
      });
  }, []);

  useEffect(() => {
    let result = affectations;
    if (activeFilter !== 'Tous') {
      const map = { 'En cours': 'EN_COURS', 'Terminée': 'TERMINEE', 'En attente': 'EN_ATTENTE' };
      result = result.filter(a => a.statut === map[activeFilter]);
    }
    if (search) {
      result = result.filter(a =>
        a.utilisateur?.nom?.toLowerCase().includes(search.toLowerCase()) ||
        a.utilisateur?.prenom?.toLowerCase().includes(search.toLowerCase()) ||
        a.materiel?.marque?.toLowerCase().includes(search.toLowerCase()) ||
        a.materiel?.codeInventaire?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
    setCurrentPage(1);
  }, [search, activeFilter, affectations]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getStatutLabel = (statut) => {
    const map = { EN_COURS: 'En cours', TERMINEE: 'Terminée', EN_ATTENTE: 'En attente', ANNULEE: 'Annulée' };
    return map[statut] || statut;
  };

  const getStatutClass = (statut) => {
    const map = { EN_COURS: 'mat-badge-green', TERMINEE: 'mat-badge-blue', EN_ATTENTE: 'mat-badge-orange', ANNULEE: 'mat-badge-red' };
    return map[statut] || '';
  };

  const getInitiales = (nom, prenom) => {
    return `${nom?.charAt(0) || ''}${prenom?.charAt(0) || ''}`.toUpperCase();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette affectation ?')) {
      await api.delete(`/api/affectations/${id}`);
      setAffectations(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleTerminer = async (id) => {
    if (window.confirm('Terminer cette affectation ?')) {
      await api.put(`/api/affectations/${id}/terminer`);
      const res = await api.get('/api/affectations');
      let data = res.data;
      if (role === 'BENEFICIAIRE') {
        data = data.filter(a => a.utilisateur?.id === parseInt(userId));
      }
      setAffectations(data);
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
              className={`db-nav-item ${item.label === 'Affectations' ? 'db-nav-active' : ''}`}
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

          <div className="mat-header">
            <div>
              <h1 className="mat-title">
                {role === 'BENEFICIAIRE' ? 'Mes Affectations' : 'Gestion des Affectations'}
              </h1>
              <div className="mat-breadcrumb">
                <FiHome size={13} />
                <span
                  style={{ cursor: 'pointer', color: '#3B82F6' }}
                  onClick={() => navigate('/dashboard')}
                >Accueil</span>
                <span className="mat-sep">/</span>
                <span className="mat-bc-active">Affectations</span>
              </div>
            </div>
          </div>

          <div className="mat-toolbar">
            <div className="mat-search">
              <FiSearch size={16} color="#64748b" />
              <input
                placeholder="Rechercher une affectation..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {role !== 'BENEFICIAIRE' && (
              <button className="mat-btn-add" onClick={() => navigate('/affectations/ajouter')}>
                <FiPlus size={18} /> Nouvelle affectation
              </button>
            )}
          </div>

          <div className="mat-filters">
            {['Tous', 'En cours', 'Terminée', 'En attente'].map(f => (
              <button
                key={f}
                className={`mat-filter-btn ${activeFilter === f ? 'mat-filter-active' : ''}`}
                style={{
                  border: activeFilter === f ? 'none' :
                    f === 'En cours' ? '1px solid #22C55E' :
                    f === 'Terminée' ? '1px solid #3B82F6' :
                    f === 'En attente' ? '1px solid #F59E0B' :
                    '1px solid #1A2B4A',
                  color: activeFilter === f ? '#fff' :
                    f === 'En cours' ? '#22C55E' :
                    f === 'Terminée' ? '#3B82F6' :
                    f === 'En attente' ? '#F59E0B' :
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

          <div className="mat-table-wrap">
            <table className="mat-table">
              <thead>
                <tr>
                  <th>Bénéficiaire</th>
                  <th>Matériel</th>
                  <th>Code inventaire</th>
                  <th>Date affectation</th>
                  <th>Date retour</th>
                  <th>Motif</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((a, i) => (
                  <tr key={a.id || i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: `hsl(${i * 60 + 200}, 70%, 40%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0
                        }}>
                          {getInitiales(a.utilisateur?.nom, a.utilisateur?.prenom)}
                        </div>
                        <span>{a.utilisateur?.nom} {a.utilisateur?.prenom}</span>
                      </div>
                    </td>
                    <td>{a.materiel?.marque} {a.materiel?.modele}</td>
                    <td className="mat-code">{a.materiel?.codeInventaire}</td>
                    <td>{a.dateAffectation}</td>
                    <td>{a.dateRetour || '—'}</td>
                    <td>{a.motif || '—'}</td>
                    <td>
                      <span className={`mat-badge ${getStatutClass(a.statut)}`}>
                        {getStatutLabel(a.statut)}
                      </span>
                    </td>
                    <td>
                      <div className="mat-actions">
                        <button className="mat-action-btn mat-action-view"
                          onClick={() => navigate(`/affectations/${a.id}`)}>
                          <FiEye size={15} />
                        </button>
                        {role === 'BENEFICIAIRE' ? (
                          a.statut === 'EN_COURS' && (
                            <button
                              className="mat-action-btn mat-action-edit"
                              onClick={() => handleTerminer(a.id)}
                              title="Demander retour"
                            >
                              ↩
                            </button>
                          )
                        ) : (
                          <>
                            <button className="mat-action-btn mat-action-edit"
                              onClick={() => navigate(`/affectations/modifier/${a.id}`)}>
                              <FiEdit2 size={15} />
                            </button>
                            <button className="mat-action-btn mat-action-delete"
                              onClick={() => handleDelete(a.id)}>
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
          </div>

          <div className="mat-pagination">
            <span className="mat-pag-info">
              Affichage {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length}
            </span>
            <div className="mat-pag-btns">
              <button className="mat-pag-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`mat-pag-btn ${currentPage === p ? 'mat-pag-active' : ''}`}
                  onClick={() => setCurrentPage(p)}>
                  {p}
                </button>
              ))}
              <button className="mat-pag-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}