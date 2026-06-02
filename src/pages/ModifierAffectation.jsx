import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import Sidebar from '../components/Sidebar';
import { FiHome, FiChevronDown, FiBell, FiSearch, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function ModifierAffectation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const nom = localStorage.getItem('nom');
  const role = localStorage.getItem('role');
  const { notifCount } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [materiels, setMateriels] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    idMateriel: '', idUtilisateur: '', idResponsable: '',
    dateAffectation: '', dateRetour: '', statut: 'EN_COURS', motif: '',
  });

  const getRoleLabel = () => {
    switch (role) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      case 'RESPONSABLE': return 'Responsable';
      default: return 'Utilisateur';
    }
  };

  useEffect(() => {
    api.get(`/api/affectations/${id}`)
      .then(res => {
        const a = res.data;
        setForm({ idMateriel: a.materiel?.id || '', idUtilisateur: a.utilisateur?.id || '', idResponsable: a.responsable?.id || '', dateAffectation: a.dateAffectation || '', dateRetour: a.dateRetour || '', statut: a.statut || 'EN_COURS', motif: a.motif || '' });
      })
      .catch(() => { alert("Affectation introuvable."); navigate('/affectations'); })
      .finally(() => setFetching(false));
    api.get('/api/materiels').then(res => setMateriels(res.data)).catch(() => {});
    api.get('/api/utilisateurs').then(res => {
      const tous = res.data;
      const b = tous.filter(u => u.role === 'BENEFICIAIRE' || u.role === 'UTILISATEUR');
      const r = tous.filter(u => u.role === 'RESPONSABLE' || u.role === 'ADMINISTRATEUR');
      setUtilisateurs(b.length > 0 ? b : tous);
      setResponsables(r.length > 0 ? r : tous);
    }).catch(() => {});
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put(`/api/affectations/${id}`, {
        idMateriel: parseInt(form.idMateriel), idUtilisateur: parseInt(form.idUtilisateur),
        idResponsable: parseInt(form.idResponsable), dateAffectation: form.dateAffectation,
        dateRetour: form.dateRetour || null, statut: form.statut, motif: form.motif,
      });
      navigate('/affectations');
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.erreur || d?.message || 'Erreur lors de la modification');
    } finally { setLoading(false); }
  };

  const inputStyle = { background: '#0D1B33', border: '1px solid #1A2B4A', borderRadius: '10px', padding: '13px 16px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%' };
  const labelStyle = { fontSize: '14px', color: '#94a3b8', fontWeight: '500' };

  if (fetching) return <div className="db-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#64748b' }}>Chargement...</span></div>;

  return (
    <div className="db-root">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeLabel="Affectations" />
      <main className="db-main">
        <header className="db-topbar">
          <div className="db-search"><FiSearch size={16} color="#64748b" /><input placeholder="Rechercher..." /><span className="db-search-kbd">Ctrl+K</span></div>
          <div className="db-topbar-right">
            <div className="db-notif-btn"><FiBell size={20} />{notifCount > 0 && <span className="db-notif-badge">{notifCount}</span>}</div>
            <div className="db-topbar-user">
              <div className="db-topbar-avatar" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>{nom ? nom.charAt(0).toUpperCase() : 'A'}</div>
              <span>{getRoleLabel()}</span><FiChevronDown size={14} />
            </div>
          </div>
        </header>
        <div className="db-content">
          <div className="mat-header"><div>
            <h1 className="mat-title">Modifier Affectation</h1>
            <div className="mat-breadcrumb">
              <FiHome size={13} />
              <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/dashboard')}>Accueil</span>
              <span className="mat-sep">/</span>
              <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/affectations')}>Affectations</span>
              <span className="mat-sep">/</span>
              <span className="mat-bc-active">Modifier</span>
            </div>
          </div></div>
          <div style={{ background: '#0A1628', border: '1px solid #1A2B4A', borderRadius: '14px', padding: '32px', maxWidth: '700px' }}>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#f87171', fontSize: '14px' }}>⚠ {error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Matériel *</label>
                <select name="idMateriel" value={form.idMateriel} onChange={handleChange} required style={inputStyle}>
                  <option value="">-- Sélectionner un matériel --</option>
                  {materiels.map(m => <option key={m.id} value={m.id}>{m.codeInventaire} — {m.marque} {m.modele} ({m.etat})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Bénéficiaire *</label>
                <select name="idUtilisateur" value={form.idUtilisateur} onChange={handleChange} required style={inputStyle}>
                  <option value="">-- Sélectionner un bénéficiaire --</option>
                  {utilisateurs.map(u => <option key={u.id} value={u.id}>{u.nom} {u.prenom} — {u.email}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Responsable *</label>
                <select name="idResponsable" value={form.idResponsable} onChange={handleChange} required style={inputStyle}>
                  <option value="">-- Sélectionner un responsable --</option>
                  {responsables.map(r => <option key={r.id} value={r.id}>{r.nom} {r.prenom} — {r.role}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={labelStyle}>Date d'affectation *</label>
                  <input type="date" name="dateAffectation" value={form.dateAffectation} onChange={handleChange} required style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={labelStyle}>Date de retour prévue</label>
                  <input type="date" name="dateRetour" value={form.dateRetour} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Statut</label>
                <select name="statut" value={form.statut} onChange={handleChange} style={inputStyle}>
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINEE">Terminée</option>
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="ANNULEE">Annulée</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Motif *</label>
                <textarea name="motif" value={form.motif} onChange={handleChange} required rows={3} placeholder="Raison de l'affectation..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => navigate('/affectations')} style={{ flex: 1, padding: '13px', background: 'transparent', border: '1px solid #1A2B4A', borderRadius: '10px', color: '#64748b', fontSize: '15px', cursor: 'pointer' }}><FiX size={16} /> Annuler</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><FiSave size={16} />{loading ? 'Enregistrement...' : 'Enregistrer les modifications'}</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}