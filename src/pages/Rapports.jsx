import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import {
  FiBell, FiChevronDown, FiChevronLeft, FiChevronRight,
  FiHome, FiAlertTriangle, FiSettings, FiSearch, FiPlus, FiTrash2
} from 'react-icons/fi';
import { HiOutlineDesktopComputer } from 'react-icons/hi';
import { MdOutlineAssignment, MdOutlineNotifications, MdOutlineDashboard } from 'react-icons/md';
import { TbReportAnalytics, TbDeviceDesktop } from 'react-icons/tb';
import { BsTools, BsFileText, BsPeople } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 7;

export default function Rapports() {
  const navigate = useNavigate();
  const nom = localStorage.getItem('nom');
  const prenom = localStorage.getItem('prenom');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const { notifCount } = useAuth();
  const userId = localStorage.getItem('userId');

  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({
    titre: '',
    type: '',
    format: 'PDF',
  });

  const menuItems = [
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
      default: return 'Utilisateur';
    }
  };

  const fetchRapports = async () => {
    try {
      const res = await api.get('/api/rapports');
      setRapports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRapports();
  }, []);

  const totalPages = Math.ceil(rapports.length / ITEMS_PER_PAGE);
  const paginated = rapports.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce rapport ?')) {
      try {
        await api.delete(`/api/rapports/${id}`);
        setRapports(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleGenerer = async (e) => {
    e.preventDefault();
    if (!form.titre.trim() || !form.type.trim()) {
      alert('Titre et type sont obligatoires');
      return;
    }
    try {
      setFormLoading(true);
      const payload = {
        titre: form.titre,
        type: form.type,
        format: form.format,
        responsable: { id: parseInt(userId) },
      };
      await api.post('/api/rapports/generer', payload);
      setShowForm(false);
      setForm({ titre: '', type: '', format: 'PDF' });
      fetchRapports();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setFormLoading(false);
    }
  };

  const getTypeClass = (type) => {
    const map = {
      MATERIELS: 'mat-badge-blue',
      AFFECTATIONS: 'mat-badge-green',
      PANNES: 'mat-badge-red',
      MAINTENANCES: 'mat-badge-orange',
    };
    return map[type] || 'mat-badge-blue';
  };

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
              className={`db-nav-item ${item.label === 'Rapports' ? 'db-nav-active' : ''}`}
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

        <div className="db-content">
          <div className="mat-header">
            <div>
              <h1 className="mat-title">Rapports</h1>
              <div className="mat-breadcrumb">
                <FiHome size={13} />
                <span style={{ cursor: 'pointer', color: '#3B82F6' }}
                  onClick={() => navigate('/dashboard')}>Accueil</span>
                <span className="mat-sep">/</span>
                <span className="mat-bc-active">Rapports</span>
              </div>
            </div>
            <button className="mat-btn-add" onClick={() => setShowForm(!showForm)}>
              <FiPlus size={18} /> Générer un rapport
            </button>
          </div>

          {/* Formulaire génération */}
          {showForm && (
            <div className="mat-form-card">
              <form onSubmit={handleGenerer}>
                <div className="mat-form-section-title">Nouveau rapport</div>
                <div className="mat-form-grid">

                  <div className="mat-form-group">
                    <label>Titre <span className="mat-required">*</span></label>
                    <input
                      value={form.titre}
                      onChange={e => setForm(prev => ({ ...prev, titre: e.target.value }))}
                      placeholder="Ex: Rapport mensuel matériels"
                    />
                  </div>

                  <div className="mat-form-group">
                    <label>Type <span className="mat-required">*</span></label>
                    <select
                      value={form.type}
                      onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="">-- Choisir un type --</option>
                      <option value="MATERIELS">Matériels</option>
                      <option value="AFFECTATIONS">Affectations</option>
                      <option value="PANNES">Pannes</option>
                      <option value="MAINTENANCES">Maintenances</option>
                    </select>
                  </div>

                  <div className="mat-form-group">
                    <label>Format</label>
                    <select
                      value={form.format}
                      onChange={e => setForm(prev => ({ ...prev, format: e.target.value }))}
                    >
                      <option value="PDF">PDF</option>
                      <option value="EXCEL">Excel</option>
                      <option value="CSV">CSV</option>
                    </select>
                  </div>

                </div>
                <div className="mat-form-actions">
                  <button type="button" className="mat-btn-cancel" onClick={() => setShowForm(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="mat-btn-save" disabled={formLoading}>
                    {formLoading ? 'Génération...' : 'Générer'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="mat-table-wrap">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Chargement...</div>
            ) : (
              <table className="mat-table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Type</th>
                    <th>Format</th>
                    <th>Date génération</th>
                    <th>Responsable</th>
                    {role === 'ADMINISTRATEUR' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        Aucun rapport trouvé
                      </td>
                    </tr>
                  ) : paginated.map((r, i) => (
                    <tr key={r.id || i}>
                      <td style={{ color: '#fff', fontWeight: '600' }}>{r.titre}</td>
                      <td>
                        <span className={`mat-badge ${getTypeClass(r.type)}`}>{r.type}</span>
                      </td>
                      <td>
                        <span className="mat-badge mat-badge-blue">{r.format}</span>
                      </td>
                      <td>{r.dateGeneration || '—'}</td>
                      <td>{r.responsable ? `${r.responsable.nom} ${r.responsable.prenom}` : '—'}</td>
                      {role === 'ADMINISTRATEUR' && (
                        <td>
                          <div className="mat-actions">
                            <button className="mat-action-btn mat-action-delete"
                              onClick={() => handleDelete(r.id)}>
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && rapports.length > 0 && (
            <div className="mat-pagination">
              <span className="mat-pag-info">
                Affichage {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, rapports.length)} sur {rapports.length}
              </span>
              <div className="mat-pag-btns">
                <button className="mat-pag-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}>
                  <FiChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p}
                    className={`mat-pag-btn ${currentPage === p ? 'mat-pag-active' : ''}`}
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
