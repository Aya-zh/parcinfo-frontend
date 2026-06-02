import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import Sidebar from '../components/Sidebar';
import {
  FiSearch, FiPlus, FiEye, FiEdit2, FiTrash2,
  FiBell, FiChevronDown, FiChevronLeft, FiChevronRight, FiHome
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 7;

export default function Materiels() {
  const navigate = useNavigate();
  const nom = localStorage.getItem('nom');
  const role = localStorage.getItem('role');
  const { notifCount } = useAuth();

  const [materiels, setMateriels] = useState([]);
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
      case 'RESPONSABLE': return 'Responsable';
      case 'TECHNICIEN': return 'Technicien';
      default: return 'Utilisateur';
    }
  };

  useEffect(() => {
    setLoading(true);
    api.get('/api/materiels')
      .then(res => { setMateriels(res.data); setFiltered(res.data); setLoading(false); })
      .catch(() => { setError("Impossible de charger les matériels."); setLoading(false); });
  }, []);

  useEffect(() => {
    let result = materiels;
    if (activeFilter !== 'Tous') {
      const map = { 'Disponible': 'DISPONIBLE', 'Affecté': 'AFFECTE', 'En Panne': 'EN_PANNE', 'En Maintenance': 'EN_MAINTENANCE' };
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

  const getEtatLabel = (etat) => ({ DISPONIBLE: 'Disponible', AFFECTE: 'Affecté', EN_PANNE: 'En Panne', EN_MAINTENANCE: 'En Maintenance' }[etat] || etat);
  const getEtatClass = (etat) => ({ DISPONIBLE: 'mat-badge-green', AFFECTE: 'mat-badge-blue', EN_PANNE: 'mat-badge-red', EN_MAINTENANCE: 'mat-badge-orange' }[etat] || '');

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce matériel ?')) {
      try {
        await api.delete(`/api/materiels/${id}`);
        setMateriels(prev => prev.filter(m => m.id !== id));
      } catch { alert("Erreur lors de la suppression."); }
    }
  };

  return (
    <div className="db-root">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeLabel="Matériels" />
      <main className="db-main">
        <header className="db-topbar">
          <div className="db-search">
            <FiSearch size={16} color="#64748b" />
            <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
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
              <h1 className="mat-title">Gestion des Matériels</h1>
              <div className="mat-breadcrumb">
                <FiHome size={13} />
                <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/dashboard')}>Accueil</span>
                <span className="mat-sep">/</span>
                <span className="mat-bc-active">Matériels</span>
              </div>
            </div>
          </div>
          <div className="mat-toolbar">
            <div className="mat-search">
              <FiSearch size={16} color="#64748b" />
              <input placeholder="Rechercher un matériel..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {role === 'ADMINISTRATEUR' && (
              <button className="mat-btn-add" onClick={() => navigate('/materiels/ajouter')}>
                <FiPlus size={18} /> Ajouter un matériel
              </button>
            )}
          </div>
          <div className="mat-filters">
            {['Tous', 'Disponible', 'Affecté', 'En Panne', 'En Maintenance'].map(f => (
              <button key={f}
                className={`mat-filter-btn ${activeFilter === f ? 'mat-filter-active' : ''} mat-filter-${f.toLowerCase().replace(/ /g, '-')}`}
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
                    <th>Code inventaire</th><th>Description</th><th>Marque / Modèle</th>
                    <th>Catégorie</th><th>État</th><th>Date acquisition</th><th>Valeur</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Aucun matériel trouvé</td></tr>
                  ) : paginated.map((m, i) => (
                    <tr key={m.id || i}>
                      <td className="mat-code">{m.codeInventaire}</td>
                      <td>{m.description}</td>
                      <td>{m.marque} / {m.modele}</td>
                      <td>{m.categorie}</td>
                      <td><span className={`mat-badge ${getEtatClass(m.etat)}`}>{getEtatLabel(m.etat)}</span></td>
                      <td>{m.dateAcquisition}</td>
                      <td>{m.valeur?.toLocaleString()} DH</td>
                      <td>
                        <div className="mat-actions">
                          <button className="mat-action-btn mat-action-view" onClick={() => navigate(`/materiels/${m.id}`)}><FiEye size={15} /></button>
                          {role === 'ADMINISTRATEUR' && (
                            <>
                              <button className="mat-action-btn mat-action-edit" onClick={() => navigate(`/materiels/modifier/${m.id}`)}><FiEdit2 size={15} /></button>
                              <button className="mat-action-btn mat-action-delete" onClick={() => handleDelete(m.id)}><FiTrash2 size={15} /></button>
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
              <span className="mat-pag-info">Affichage {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length}</span>
              <div className="mat-pag-btns">
                <button className="mat-pag-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><FiChevronLeft size={16} /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`mat-pag-btn ${currentPage === p ? 'mat-pag-active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
                ))}
                <button className="mat-pag-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><FiChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}