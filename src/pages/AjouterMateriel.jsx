import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import {
  FiMonitor, FiBell, FiChevronDown, FiChevronLeft,
  FiChevronRight, FiHome, FiAlertTriangle, FiTool,
  FiFileText, FiSettings, FiSave, FiX
} from 'react-icons/fi';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { MdOutlineAssignment } from 'react-icons/md';

export default function AjouterMateriel() {
  const navigate = useNavigate();
  const nom = localStorage.getItem('nom');
  const prenom = localStorage.getItem('prenom');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    codeInventaire: '',
    marque: '',
    categorie: '',
    modele: '',
    numeroSerie: '',
    description: '',
    fournisseur: '',
    localisation: '',
    commentaire: '',
    etat: 'DISPONIBLE',
    dateAcquisition: '',
    dateGarantie: '',
    valeur: '',
  });

  const menuItems = [
    { icon: <FiMonitor size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FiMonitor size={20} />, label: 'Matériels', path: '/materiels' },
    { icon: <MdOutlineAssignment size={20} />, label: 'Affectations', path: '/affectations' },
    { icon: <FiAlertTriangle size={20} />, label: 'Pannes', path: '/pannes' },
    { icon: <FiTool size={20} />, label: 'Maintenances', path: '/maintenances' },
    { icon: <FiFileText size={20} />, label: 'Demandes', path: '/demandes' },
    { icon: <HiOutlineUserGroup size={20} />, label: 'Utilisateurs', path: '/utilisateurs' },
    { icon: <FiBell size={20} />, label: 'Notifications', path: '/notifications', badge: 3 },
    { icon: <FiFileText size={20} />, label: 'Rapports', path: '/rapports' },
  ];

  const getRoleLabel = () => {
    switch (role) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      case 'RESPONSABLE': return 'Responsable';
      case 'TECHNICIEN': return 'Technicien';
      default: return 'Utilisateur';
    }
  };

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
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      setLoading(true);
      const payload = {
        ...form,
        valeur: parseFloat(form.valeur) || 0,
        dateAcquisition: form.dateAcquisition || null,
        dateGarantie: form.dateGarantie || null,
      };
      await api.post('/api/materiels', payload);
      navigate('/materiels');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erreur lors de la création';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="db-root">

      {/* ── SIDEBAR ── */}
      <aside className={`db-sidebar ${sidebarOpen ? '' : 'db-sidebar-closed'}`}>
        <div className="db-sidebar-logo">
          <div className="db-logo-icon"><FiMonitor size={20} color="#fff" /></div>
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
              {sidebarOpen && item.badge && <span className="db-badge">{item.badge}</span>}
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
              <div className="db-user-avatar">{nom ? nom.charAt(0).toUpperCase() : 'A'}</div>
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
            <span style={{ color: '#64748b', fontSize: 14 }}>Ajouter un matériel</span>
          </div>
          <div className="db-topbar-right">
            <div className="db-notif-btn">
              <FiBell size={20} />
              <span className="db-notif-badge">3</span>
            </div>
            <div className="db-topbar-user">
              <div className="db-topbar-avatar">{nom ? nom.charAt(0).toUpperCase() : 'A'}</div>
              <span>{getRoleLabel()}</span>
              <FiChevronDown size={14} />
            </div>
          </div>
        </header>

        <div className="db-content">
          <div className="mat-header">
            <div>
              <h1 className="mat-title">Ajouter un Matériel</h1>
              <div className="mat-breadcrumb">
                <FiHome size={13} />
                <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/dashboard')}>Accueil</span>
                <span className="mat-sep">/</span>
                <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/materiels')}>Matériels</span>
                <span className="mat-sep">/</span>
                <span className="mat-bc-active">Ajouter</span>
              </div>
            </div>
          </div>

          <div className="mat-form-card">
            <form onSubmit={handleSubmit}>

              {/* ── SECTION 1 ── */}
              <div className="mat-form-section-title">Informations générales</div>
              <div className="mat-form-grid">

                <div className="mat-form-group">
                  <label>Code inventaire <span className="mat-required">*</span></label>
                  <input
                    name="codeInventaire"
                    value={form.codeInventaire}
                    onChange={handleChange}
                    placeholder="Ex: INV-001"
                    className={errors.codeInventaire ? 'mat-input-error' : ''}
                  />
                  {errors.codeInventaire && <span className="mat-error-msg">{errors.codeInventaire}</span>}
                </div>

                <div className="mat-form-group">
                  <label>Marque <span className="mat-required">*</span></label>
                  <input
                    name="marque"
                    value={form.marque}
                    onChange={handleChange}
                    placeholder="Ex: Dell"
                    className={errors.marque ? 'mat-input-error' : ''}
                  />
                  {errors.marque && <span className="mat-error-msg">{errors.marque}</span>}
                </div>

                <div className="mat-form-group">
                  <label>Modèle</label>
                  <input
                    name="modele"
                    value={form.modele}
                    onChange={handleChange}
                    placeholder="Ex: Latitude 5520"
                  />
                </div>

                <div className="mat-form-group">
                  <label>Catégorie <span className="mat-required">*</span></label>
                  <select
                    name="categorie"
                    value={form.categorie}
                    onChange={handleChange}
                    className={errors.categorie ? 'mat-input-error' : ''}
                  >
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
                  <input
                    name="numeroSerie"
                    value={form.numeroSerie}
                    onChange={handleChange}
                    placeholder="Ex: SN123456"
                  />
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

              {/* ── SECTION 2 ── */}
              <div className="mat-form-section-title" style={{ marginTop: '1.75rem' }}>Détails supplémentaires</div>
              <div className="mat-form-grid">

                <div className="mat-form-group">
                  <label>Fournisseur</label>
                  <input
                    name="fournisseur"
                    value={form.fournisseur}
                    onChange={handleChange}
                    placeholder="Ex: Tech Maroc"
                  />
                </div>

                <div className="mat-form-group">
                  <label>Localisation</label>
                  <input
                    name="localisation"
                    value={form.localisation}
                    onChange={handleChange}
                    placeholder="Ex: Bureau 3"
                  />
                </div>

                <div className="mat-form-group">
                  <label>Valeur (DH)</label>
                  <input
                    type="number"
                    name="valeur"
                    value={form.valeur}
                    onChange={handleChange}
                    placeholder="Ex: 8500"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="mat-form-group">
                  <label>Date d'acquisition</label>
                  <input
                    type="date"
                    name="dateAcquisition"
                    value={form.dateAcquisition}
                    onChange={handleChange}
                  />
                </div>

                <div className="mat-form-group">
                  <label>Date de garantie</label>
                  <input
                    type="date"
                    name="dateGarantie"
                    value={form.dateGarantie}
                    onChange={handleChange}
                  />
                </div>

                {/* Description — pleine largeur */}
                <div className="mat-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Description du matériel..."
                    rows={3}
                  />
                </div>

                {/* Commentaire — pleine largeur */}
                <div className="mat-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Commentaire</label>
                  <textarea
                    name="commentaire"
                    value={form.commentaire}
                    onChange={handleChange}
                    placeholder="Commentaire interne..."
                    rows={2}
                  />
                </div>

              </div>

              {/* ── ACTIONS ── */}
              <div className="mat-form-actions">
                <button type="button" className="mat-btn-cancel" onClick={() => navigate('/materiels')}>
                  <FiX size={16} /> Annuler
                </button>
                <button type="submit" className="mat-btn-save" disabled={loading}>
                  <FiSave size={16} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}