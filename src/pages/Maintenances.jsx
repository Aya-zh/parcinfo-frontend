import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import Sidebar from '../components/Sidebar';
import {
  FiSearch, FiPlus, FiEye, FiEdit2, FiTrash2,
  FiBell, FiChevronDown, FiChevronLeft,
  FiChevronRight, FiHome
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 7;

export default function Maintenances() {
  const navigate = useNavigate();
  const nom = localStorage.getItem('nom');
  const role = localStorage.getItem('role');
  const { notifCount } = useAuth();

  const [maintenances, setMaintenances] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRoleLabel = () => {
    switch (role) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      case 'TECHNICIEN': return 'Technicien';
      default: return 'Utilisateur';
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'Préventive': return 'mat-badge-blue';
      case 'Corrective': return 'mat-badge-orange';
      case 'Curative': return 'mat-badge-red';
      default: return 'mat-badge-green';
    }
  };

  const getStatutClass = (dateFin) => dateFin ? 'mat-badge-green' : 'mat-badge-orange';
  const getStatutLabel = (dateFin) => dateFin ? 'Terminée' : 'En cours';

  useEffect(() => {
    api.get('/api/maintenances')
      .then(res => { setMaintenances(res.data); setFiltered(res.data); setLoading(false); })
      .catch(() => { setError("Impossible de charger les maintenances."); setLoading(false); });
  }, []);

  useEffect(() => {
    let result = maintenances;
    if (activeFilter === 'En cours') result = result.filter(m => !m.dateFin);
    else if (activeFilter === 'Terminée') result = result.filter(m => m.dateFin);
    else if (activeFilter === 'Préventive') result = result.filter(m => m.type === 'Préventive');
    else if (activeFilter === 'Corrective') result = result.filter(m => m.type === 'Corrective');
    if (search) {
      result = result.filter(m =>
        m.description?.toLowerCase().includes(search.toLowerCase()) ||
        m.materiel?.marque?.toLowerCase().includes(search.toLowerCase()) ||
        m.technicien?.nom?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
    setCurrentPage(1);
  }, [search, activeFilter, maintenances]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette maintenance ?')) {
      try {
        await api.delete(`/api/maintenances/${id}`);
        setMaintenances(prev => prev.filter(m => m.id !== id));
      } catch { alert("Erreur lors de la suppression."); }
    }
  };

  return (
    <div className="db-root">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeLabel="Maintenances" />

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
              <h1 className="mat-title">Gestion des Maintenances</h1>
              <div className="mat-breadcrumb">
                <FiHome size={13} />
                <span style={{ cursor: 'pointer', color: '#3B82F6' }}
                  onClick={() => navigate('/dashboard')}>Accueil</span>
                <span className="mat-sep">/</span>
                <span className="mat-bc-active">Maintenances</span>
              </div>
            </div>
          </div>

          <div className="mat-toolbar">
            <div className="mat-search">
              <FiSearch size={16} color="#64748b" />
              <input placeholder="Rechercher une maintenance..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {(role === 'ADMINISTRATEUR' || role === 'TECHNICIEN') && (
              <button className="mat-btn-add" onClick={() => navigate('/maintenances/ajouter')}>
                <FiPlus size={18} /> Nouvelle maintenance
              </button>
            )}
          </div>

          <div className="mat-filters">
            {['Tous', 'En cours', 'Terminée', 'Préventive', 'Corrective'].map(f => (
              <button key={f}
                className={`mat-filter-btn ${activeFilter === f ? 'mat-filter-active' : ''}`}
                style={{
                  border: activeFilter === f ? 'none' :
                    f === 'En cours' ? '1px solid #F59E0B' :
                    f === 'Terminée' ? '1px solid #22C55E' :
                    f === 'Préventive' ? '1px solid #3B82F6' :
                    f === 'Corrective' ? '1px solid #EF4444' :
                    '1px solid #1A2B4A',
                  color: activeFilter === f ? '#fff' :
                    f === 'En cours' ? '#F59E0B' :
                    f === 'Terminée' ? '#22C55E' :
                    f === 'Préventive' ? '#3B82F6' :
                    f === 'Corrective' ? '#EF4444' : '#64748b',
                  background: activeFilter === f ? '#2563EB' : 'transparent',
                  padding: '8px 20px', borderRadius: '8px',
                  fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                }}
                onClick={() => setActiveFilter(f)}>{f}</button>
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
                    <th>Type</th>
                    <th>Description</th>
                    <th>Matériel</th>
                    <th>Technicien</th>
                    <th>Date début</th>
                    <th>Date fin</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        Aucune maintenance trouvée
                      </td>
                    </tr>
                  ) : paginated.map((m, i) => (
                    <tr key={m.id || i}>
                      <td>
                        <span className={`mat-badge ${getTypeClass(m.type)}`}>{m.type}</span>
                      </td>
                      <td style={{ color: '#fff', fontWeight: '500' }}>{m.description}</td>
                      <td>{m.materiel?.marque} {m.materiel?.modele}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: `hsl(${i * 60 + 200}, 70%, 40%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0
                          }}>
                            {m.technicien?.nom?.charAt(0)}{m.technicien?.prenom?.charAt(0)}
                          </div>
                          <span>{m.technicien?.nom} {m.technicien?.prenom}</span>
                        </div>
                      </td>
                      <td>{m.dateDebut}</td>
                      <td>{m.dateFin || '—'}</td>
                      <td>
                        <span className={`mat-badge ${getStatutClass(m.dateFin)}`}>
                          {getStatutLabel(m.dateFin)}
                        </span>
                      </td>
                      <td>
                        <div className="mat-actions">
                          <button className="mat-action-btn mat-action-view"
                            onClick={() => navigate(`/maintenances/${m.id}`)}>
                            <FiEye size={15} />
                          </button>
                          {(role === 'ADMINISTRATEUR' || role === 'TECHNICIEN') && (
                            <>
                              <button className="mat-action-btn mat-action-edit"
                                onClick={() => navigate(`/maintenances/modifier/${m.id}`)}>
                                <FiEdit2 size={15} />
                              </button>
                              <button className="mat-action-btn mat-action-delete"
                                onClick={() => handleDelete(m.id)}>
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
                  <button key={p}
                    className={`mat-pag-btn ${currentPage === p ? 'mat-pag-active' : ''}`}
                    onClick={() => setCurrentPage(p)}>{p}</button>
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