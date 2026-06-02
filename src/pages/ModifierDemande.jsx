import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import Sidebar from '../components/Sidebar';
import { FiHome, FiChevronDown, FiBell, FiSearch, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function ModifierDemande() {
  const navigate = useNavigate();
  const { id } = useParams();
  const nom = localStorage.getItem('nom');
  const role = localStorage.getItem('role');
  const { notifCount } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [responsables, setResponsables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({ objet: '', description: '', priorite: 'MOYENNE', idResponsable: '', beneficiaireId: '' });

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
      .then(res => {
        const d = res.data;
        setForm({ objet: d.objet || '', description: d.description || '', priorite: d.priorite || 'MOYENNE', idResponsable: d.responsable?.id || '', beneficiaireId: d.beneficiaire?.id || '' });
        setFetching(false);
      })
      .catch(() => navigate('/demandes'));
    api.get('/api/utilisateurs')
      .then(res => setResponsables(res.data.filter(u => u.role === 'RESPONSABLE' || u.role === 'ADMINISTRATEUR')))
      .catch(() => {});
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.objet.trim()) e.objet = "L'objet est obligatoire";
    if (!form.description.trim()) e.description = "La description est obligatoire";
    if (!form.idResponsable) e.idResponsable = "Le responsable est obligatoire";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    try {
      setLoading(true);
      await api.put(`/api/demandes/${id}`, { objet: form.objet, description: form.description, priorite: form.priorite, beneficiaire: { id: parseInt(form.beneficiaireId) }, responsable: { id: parseInt(form.idResponsable) } });
      navigate('/demandes');
    } catch (err) { alert(err.response?.data?.message || err.response?.data || 'Erreur lors de la modification'); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="db-root" style={{ alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#64748b' }}>Chargement...</span></div>;

  return (
    <div className="db-root">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeLabel="Demandes" />
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
            <h1 className="mat-title">Modifier la Demande</h1>
            <div className="mat-breadcrumb">
              <FiHome size={13} />
              <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/dashboard')}>Accueil</span>
              <span className="mat-sep">/</span>
              <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/demandes')}>Demandes</span>
              <span className="mat-sep">/</span>
              <span className="mat-bc-active">Modifier</span>
            </div>
          </div></div>
          <div className="mat-form-card">
            <form onSubmit={handleSubmit}>
              <div className="mat-form-section-title">Informations de la demande</div>
              <div className="mat-form-grid">
                <div className="mat-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Objet <span className="mat-required">*</span></label>
                  <input name="objet" value={form.objet} onChange={handleChange} placeholder="Ex: Demande ordinateur portable" className={errors.objet ? 'mat-input-error' : ''} />
                  {errors.objet && <span className="mat-error-msg">{errors.objet}</span>}
                </div>
                <div className="mat-form-group">
                  <label>Priorité</label>
                  <select name="priorite" value={form.priorite} onChange={handleChange}>
                    <option value="FAIBLE">Faible</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="HAUTE">Haute</option>
                  </select>
                </div>
                <div className="mat-form-group">
                  <label>Responsable <span className="mat-required">*</span></label>
                  <select name="idResponsable" value={form.idResponsable} onChange={handleChange} className={errors.idResponsable ? 'mat-input-error' : ''}>
                    <option value="">-- Sélectionner un responsable --</option>
                    {responsables.map(r => <option key={r.id} value={r.id}>{r.nom} {r.prenom} — {r.role}</option>)}
                  </select>
                  {errors.idResponsable && <span className="mat-error-msg">{errors.idResponsable}</span>}
                </div>
                <div className="mat-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description <span className="mat-required">*</span></label>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Décrivez votre demande..." rows={4} className={errors.description ? 'mat-input-error' : ''} />
                  {errors.description && <span className="mat-error-msg">{errors.description}</span>}
                </div>
              </div>
              <div className="mat-form-actions">
                <button type="button" className="mat-btn-cancel" onClick={() => navigate('/demandes')}><FiX size={16} /> Annuler</button>
                <button type="submit" className="mat-btn-save" disabled={loading}><FiSave size={16} /> {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}