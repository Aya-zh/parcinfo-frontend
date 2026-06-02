import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import Sidebar from '../components/Sidebar';
import {
  FiHome, FiChevronDown, FiBell, FiSearch, FiCheck, FiX
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function DetailDemande() {
  const navigate = useNavigate();
  const { id } = useParams();
  const nom = localStorage.getItem('nom');
  const role = localStorage.getItem('role');
  const { notifCount } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);

  const getRoleLabel = () => {
    switch (role) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      case 'RESPONSABLE': return 'Responsable';
      case 'BENEFICIAIRE': return 'Bénéficiaire';
      default: return 'Utilisateur';
    }
  };

  useEffect(() => {
    api.get(`/api/demandes/${id}`)
      .then(res => { setDemande(res.data); setLoading(false); })
      .catch(() => navigate('/demandes'));
  }, [id]);

  const getStatutClass = (statut) => {
    const map = {
      EN_ATTENTE: 'mat-badge-orange',
      VALIDEE: 'mat-badge-green',
      APPROUVEE: 'mat-badge-green',
      REJETEE: 'mat-badge-red',
      REFUSEE: 'mat-badge-red',
      ANNULEE: 'mat-badge-red',
      TRAITEE: 'mat-badge-blue',
    };
    return map[statut] || '';
  };

  const getStatutLabel = (statut) => {
    const map = {
      EN_ATTENTE: 'En attente',
      VALIDEE: 'Validée',
      APPROUVEE: 'Approuvée',
      REJETEE: 'Rejetée',
      REFUSEE: 'Refusée',
      ANNULEE: 'Annulée',
      TRAITEE: 'Traitée',
    };
    return map[statut] || statut;
  };

  const getPrioriteClass = (p) => {
    const map = { FAIBLE: 'mat-badge-green', MOYENNE: 'mat-badge-orange', HAUTE: 'mat-badge-red' };
    return map[p] || '';
  };

  const handleValider = async () => {
    try {
      await api.put(`/api/demandes/${id}/valider`);
      setDemande(prev => ({ ...prev, statut: 'VALIDEE' }));
    } catch { alert('Erreur lors de la validation'); }
  };

  const handleRejeter = async () => {
    try {
      await api.put(`/api/demandes/${id}/rejeter`);
      setDemande(prev => ({ ...prev, statut: 'REJETEE' }));
    } catch { alert('Erreur lors du rejet'); }
  };

  const handleAnnuler = async () => {
    if (window.confirm('Annuler cette demande ?')) {
      try {
        await api.put(`/api/demandes/${id}/annuler`);
        navigate('/demandes');
      } catch { alert("Erreur lors de l'annulation"); }
    }
  };

  if (loading) return (
    <div className="db-root" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#64748b' }}>Chargement...</span>
    </div>
  );

  return (
    <div className="db-root">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeLabel="Demandes" />

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
              <h1 className="mat-title">Détail de la Demande</h1>
              <div className="mat-breadcrumb">
                <FiHome size={13} />
                <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/dashboard')}>Accueil</span>
                <span className="mat-sep">/</span>
                <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/demandes')}>Demandes</span>
                <span className="mat-sep">/</span>
                <span className="mat-bc-active">Détail</span>
              </div>
            </div>
          </div>

          <div className="mat-form-card">

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
                  {demande.objet}
                </h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span className={`mat-badge ${getStatutClass(demande.statut)}`}>{getStatutLabel(demande.statut)}</span>
                  <span className={`mat-badge ${getPrioriteClass(demande.priorite)}`}>{demande.priorite}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {(role === 'RESPONSABLE' || role === 'ADMINISTRATEUR') && demande.statut === 'EN_ATTENTE' && (
                  <>
                    <button onClick={handleValider} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
                      color: '#22C55E', padding: '8px 16px', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                    }}>
                      <FiCheck size={15} /> Valider
                    </button>
                    <button onClick={handleRejeter} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                      color: '#EF4444', padding: '8px 16px', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                    }}>
                      <FiX size={15} /> Rejeter
                    </button>
                  </>
                )}
                {(role === 'ADMINISTRATEUR' || role === 'BENEFICIAIRE') && demande.statut === 'EN_ATTENTE' && (
                  <button onClick={handleAnnuler} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                    color: '#EF4444', padding: '8px 16px', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                  }}>
                    <FiX size={15} /> Annuler
                  </button>
                )}
              </div>
            </div>

            <div className="mat-form-section-title">Informations générales</div>
            <div className="mat-form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="mat-form-group">
                <label>Date de demande</label>
                <div style={{ color: '#e2e8f0', fontSize: '14px', padding: '10px 0' }}>{demande.dateDemande || '—'}</div>
              </div>
              <div className="mat-form-group">
                <label>Priorité</label>
                <div style={{ padding: '10px 0' }}>
                  <span className={`mat-badge ${getPrioriteClass(demande.priorite)}`}>{demande.priorite}</span>
                </div>
              </div>
              <div className="mat-form-group">
                <label>Statut</label>
                <div style={{ padding: '10px 0' }}>
                  <span className={`mat-badge ${getStatutClass(demande.statut)}`}>{getStatutLabel(demande.statut)}</span>
                </div>
              </div>
            </div>

            <div className="mat-form-section-title">Description</div>
            <div style={{
              background: '#060D1F', border: '1px solid #1A2B4A', borderRadius: '8px',
              padding: '16px', color: '#CBD5E1', fontSize: '14px', lineHeight: '1.6', marginBottom: '1.5rem'
            }}>
              {demande.description || 'Aucune description'}
            </div>

            <div className="mat-form-section-title">Personnes concernées</div>
            <div className="mat-form-grid">
              <div className="mat-form-group">
                <label>Bénéficiaire</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: '700', color: '#fff'
                  }}>
                    {demande.beneficiaire?.nom?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
                      {demande.beneficiaire?.nom} {demande.beneficiaire?.prenom}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{demande.beneficiaire?.email}</div>
                  </div>
                </div>
              </div>

              <div className="mat-form-group">
                <label>Responsable</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: '700', color: '#fff'
                  }}>
                    {demande.responsable?.nom?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
                      {demande.responsable?.nom} {demande.responsable?.prenom}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{demande.responsable?.email}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mat-form-actions">
              <button className="mat-btn-cancel" onClick={() => navigate('/demandes')}>
                ← Retour aux demandes
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}