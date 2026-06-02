import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import Sidebar from '../components/Sidebar';
import {
  FiHome, FiChevronDown, FiBell, FiSearch
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function ModifierPanne() {
  const navigate = useNavigate();
  const { id } = useParams();
  const nom = localStorage.getItem('nom');
  const role = localStorage.getItem('role');
  const { notifCount } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [materiels, setMateriels] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    description: '', niveauGravite: 'MOYENNE', statut: 'EN_ATTENTE',
    idMateriel: '', idBeneficiaire: '', dateSignalement: '', dateResolution: '',
  });

  const getRoleLabel = () => {
    switch (role) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      case 'TECHNICIEN': return 'Technicien';
      default: return 'Utilisateur';
    }
  };

  useEffect(() => {
    api.get(`/api/pannes/${id}`)
      .then(res => {
        const p = res.data;
        setForm({
          description: p.description || '', niveauGravite: p.niveauGravite || 'MOYENNE',
          statut: p.statut || 'EN_ATTENTE', idMateriel: p.materiel?.id || '',
          idBeneficiaire: p.beneficiaire?.id || '', dateSignalement: p.dateSignalement || '',
          dateResolution: p.dateResolution || '',
        });
      })
      .catch(() => setError("Impossible de charger la panne."));
    api.get('/api/materiels').then(res => setMateriels(res.data)).catch(() => {});
    api.get('/api/utilisateurs')
      .then(res => setUtilisateurs(res.data.filter(u => u.role === 'BENEFICIAIRE')))
      .catch(() => {});
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await api.put(`/api/pannes/${id}`, {
        description: form.description, niveauGravite: form.niveauGravite,
        statut: form.statut, idMateriel: parseInt(form.idMateriel),
        idBeneficiaire: parseInt(form.idBeneficiaire),
      });
      setSuccess('Panne modifiée avec succès !');
      setTimeout(() => navigate('/pannes'), 1500);
    } catch (err) {
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.erreur || 'Erreur lors de la modification.');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    background: '#0D1B33', border: '1px solid #1A2B4A', borderRadius: '10px',
    padding: '13px 16px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%',
  };
  const labelStyle = { fontSize: '14px', color: '#94a3b8', fontWeight: '500' };

  return (
    <div className="db-root">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeLabel="Pannes" />
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
              <h1 className="mat-title">Modifier Panne</h1>
              <div className="mat-breadcrumb">
                <FiHome size={13} />
                <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/dashboard')}>Accueil</span>
                <span className="mat-sep">/</span>
                <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/pannes')}>Pannes</span>
                <span className="mat-sep">/</span>
                <span className="mat-bc-active">Modifier</span>
              </div>
            </div>
          </div>
          <div style={{ background: '#0A1628', border: '1px solid #1A2B4A', borderRadius: '14px', padding: '32px', maxWidth: '700px' }}>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#f87171', fontSize: '14px' }}>⚠ {error}</div>}
            {success && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#22C55E', fontSize: '14px' }}>✅ {success}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} required rows={3} placeholder="Décrivez la panne..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={labelStyle}>Niveau de gravité *</label>
                  <select name="niveauGravite" value={form.niveauGravite} onChange={handleChange} style={inputStyle}>
                    <option value="FAIBLE">Faible</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="HAUTE">Haute</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={labelStyle}>Statut *</label>
                  <select name="statut" value={form.statut} onChange={handleChange} style={inputStyle}>
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="RESOLU">Résolu</option>
                    <option value="ESCALADEE">Escaladée</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Matériel concerné *</label>
                <select name="idMateriel" value={form.idMateriel} onChange={handleChange} required style={inputStyle}>
                  <option value="">-- Sélectionner un matériel --</option>
                  {materiels.map(m => <option key={m.id} value={m.id}>{m.codeInventaire} — {m.marque} {m.modele}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Bénéficiaire *</label>
                <select name="idBeneficiaire" value={form.idBeneficiaire} onChange={handleChange} required style={inputStyle}>
                  <option value="">-- Sélectionner un bénéficiaire --</option>
                  {utilisateurs.map(u => <option key={u.id} value={u.id}>{u.nom} {u.prenom} — {u.email}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => navigate('/pannes')} style={{ flex: 1, padding: '13px', background: 'transparent', border: '1px solid #1A2B4A', borderRadius: '10px', color: '#64748b', fontSize: '15px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'Modification...' : 'Enregistrer les modifications'}</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}