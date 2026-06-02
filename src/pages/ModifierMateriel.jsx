import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import Sidebar from '../components/Sidebar';
import { FiHome, FiChevronDown, FiBell, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function ModifierMateriel() {
  const navigate = useNavigate();
  const { id } = useParams();
  const nom = localStorage.getItem('nom');
  const role = localStorage.getItem('role');
  const { notifCount } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    codeInventaire: '', marque: '', categorie: '', modele: '', numeroSerie: '',
    description: '', fournisseur: '', localisation: '', commentaire: '',
    etat: 'DISPONIBLE', dateAcquisition: '', dateGarantie: '', valeur: '',
  });

  const getRoleLabel = () => {
    switch (role) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      case 'RESPONSABLE': return 'Responsable';
      case 'TECHNICIEN': return 'Technicien';
      default: return 'Utilisateur';
    }
  };

  useEffect(() => {
    api.get(`/api/materiels/${id}`)
      .then(res => {
        const m = res.data;
        setForm({ codeInventaire: m.codeInventaire || '', marque: m.marque || '', categorie: m.categorie || '', modele: m.modele || '', numeroSerie: m.numeroSerie || '', description: m.description || '', fournisseur: m.fournisseur || '', localisation: m.localisation || '', commentaire: m.commentaire || '', etat: m.etat || 'DISPONIBLE', dateAcquisition: m.dateAcquisition || '', dateGarantie: m.dateGarantie || '', valeur: m.valeur || '' });
      })
      .catch(() => { alert("Matériel introuvable."); navigate('/materiels'); })
      .finally(() => setFetching(false));
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.codeInventaire.trim()) e.codeInventaire = 'Le code inventaire est obligatoire';
    if (!form.marque.trim()) e.marque = 'La marque est obligatoire';
    if (!form.categorie.trim()) e.categorie = 'La catégorie est obligatoire';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    try {
      setLoading(true);
      await api.put(`/api/materiels/${id}`, { ...form, valeur: parseFloat(form.valeur) || 0, dateAcquisition: form.dateAcquisition || null, dateGarantie: form.dateGarantie || null });
      navigate('/materiels');
    } catch (err) { alert(err.response?.data?.message || err.response?.data || 'Erreur lors de la modification'); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="db-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#64748b' }}>Chargement...</span></div>;

  return (
    <div className="db-root">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeLabel="Matériels" />
      <main className="db-main">
        <header className="db-topbar">
          <div className="db-search"><span style={{ color: '#64748b', fontSize: 14 }}>Modifier un matériel</span></div>
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
            <h1 className="mat-title">Modifier un Matériel</h1>
            <div className="mat-breadcrumb">
              <FiHome size={13} />
              <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/dashboard')}>Accueil</span>
              <span className="mat-sep">/</span>
              <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/materiels')}>Matériels</span>
              <span className="mat-sep">/</span>
              <span className="mat-bc-active">Modifier</span>
            </div>
          </div></div>
          <div className="mat-form-card">
            <form onSubmit={handleSubmit}>
              <div className="mat-form-section-title">Informations générales</div>
              <div className="mat-form-grid">
                <div className="mat-form-group">
                  <label>Code inventaire <span className="mat-required">*</span></label>
                  <input name="codeInventaire" value={form.codeInventaire} onChange={handleChange} placeholder="Ex: INV-001" className={errors.codeInventaire ? 'mat-input-error' : ''} />
                  {errors.codeInventaire && <span className="mat-error-msg">{errors.codeInventaire}</span>}
                </div>
                <div className="mat-form-group">
                  <label>Marque <span className="mat-required">*</span></label>
                  <input name="marque" value={form.marque} onChange={handleChange} placeholder="Ex: Dell" className={errors.marque ? 'mat-input-error' : ''} />
                  {errors.marque && <span className="mat-error-msg">{errors.marque}</span>}
                </div>
                <div className="mat-form-group">
                  <label>Modèle</label>
                  <input name="modele" value={form.modele} onChange={handleChange} placeholder="Ex: Latitude 5520" />
                </div>
                <div className="mat-form-group">
                  <label>Catégorie <span className="mat-required">*</span></label>
                  <select name="categorie" value={form.categorie} onChange={handleChange} className={errors.categorie ? 'mat-input-error' : ''}>
                    <option value="">-- Choisir --</option>
                    <option value="Ordinateur">Ordinateur</option>
                    <option value="Imprimante">Imprimante</option>
                    <option value="Réseau">Réseau</option>
                    <option value="Serveur">Serveur</option>
                    <option value="Téléphonie">Téléphonie</option>
                    <option value="Bureautique">Bureautique</option>
                    <option value="Énergie">Énergie</option>
                    <option value="Autre">Autre</option>
                  </select>
                  {errors.categorie && <span className="mat-error-msg">{errors.categorie}</span>}
                </div>
                <div className="mat-form-group">
                  <label>Numéro de série</label>
                  <input name="numeroSerie" value={form.numeroSerie} onChange={handleChange} placeholder="Ex: SN123456" />
                </div>
                <div className="mat-form-group">
                  <label>État</label>
                  <select name="etat" value={form.etat} onChange={handleChange}>
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="AFFECTE">Affecté</option>
                    <option value="EN_PANNE">En Panne</option>
                    <option value="EN_MAINTENANCE">En Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="mat-form-section-title" style={{ marginTop: '1.75rem' }}>Détails supplémentaires</div>
              <div className="mat-form-grid">
                <div className="mat-form-group"><label>Fournisseur</label><input name="fournisseur" value={form.fournisseur} onChange={handleChange} placeholder="Ex: Tech Maroc" /></div>
                <div className="mat-form-group"><label>Localisation</label><input name="localisation" value={form.localisation} onChange={handleChange} placeholder="Ex: Bureau 3" /></div>
                <div className="mat-form-group"><label>Valeur (DH)</label><input type="number" name="valeur" value={form.valeur} onChange={handleChange} placeholder="Ex: 8500" min="0" step="0.01" /></div>
                <div className="mat-form-group"><label>Date d'acquisition</label><input type="date" name="dateAcquisition" value={form.dateAcquisition} onChange={handleChange} /></div>
                <div className="mat-form-group"><label>Date de garantie</label><input type="date" name="dateGarantie" value={form.dateGarantie} onChange={handleChange} /></div>
                <div className="mat-form-group" style={{ gridColumn: '1 / -1' }}><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} placeholder="Description du matériel..." rows={3} /></div>
                <div className="mat-form-group" style={{ gridColumn: '1 / -1' }}><label>Commentaire</label><textarea name="commentaire" value={form.commentaire} onChange={handleChange} placeholder="Commentaire interne..." rows={2} /></div>
              </div>
              <div className="mat-form-actions">
                <button type="button" className="mat-btn-cancel" onClick={() => navigate('/materiels')}><FiX size={16} /> Annuler</button>
                <button type="submit" className="mat-btn-save" disabled={loading}><FiSave size={16} /> {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}