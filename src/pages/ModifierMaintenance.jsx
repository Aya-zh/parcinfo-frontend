import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import {
  FiHome, FiChevronLeft, FiChevronRight, FiChevronDown,
  FiAlertTriangle, FiBell, FiSettings, FiSearch, FiSave, FiX
} from 'react-icons/fi';
import { HiOutlineDesktopComputer } from 'react-icons/hi';
import { MdOutlineAssignment, MdOutlineNotifications, MdOutlineDashboard } from 'react-icons/md';
import { TbReportAnalytics, TbDeviceDesktop } from 'react-icons/tb';
import { BsTools, BsFileText, BsPeople } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';

export default function ModifierMaintenance() {
  const navigate = useNavigate();
  const { id } = useParams();
  const nom = localStorage.getItem('nom');
  const prenom = localStorage.getItem('prenom');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const { notifCount } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [materiels, setMateriels] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    type: 'Préventive',
    description: '',
    dateDebut: '',
    dateFin: '',
    resultat: '',
    idMateriel: '',
    idTechnicien: '',
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
      case 'TECHNICIEN': return 'Technicien';
      default: return 'Utilisateur';
    }
  };

  useEffect(() => {
    // Charger la maintenance
    api.get(`/api/maintenances/${id}`)
      .then(res => {
        const m = res.data;
        setForm({
          type: m.type || 'Préventive',
          description: m.description || '',
          dateDebut: m.dateDebut || '',
          dateFin: m.dateFin || '',
          resultat: m.resultat || '',
          idMateriel: m.materiel?.id || '',
          idTechnicien: m.technicien?.id || '',
        });
      })
      .catch(() => {
        alert("Maintenance introuvable.");
        navigate('/maintenances');
      })
      .finally(() => setFetching(false));

    // Charger matériels
    api.get('/api/materiels')
      .then(res => setMateriels(res.data))
      .catch(() => {});

    // Charger techniciens
    api.get('/api/utilisateurs')
      .then(res => setTechniciens(res.data.filter(u => u.role === 'TECHNICIEN')))
      .catch(() => {});
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put(`/api/maintenances/${id}`, {
        type: form.type,
        description: form.description,
        dateDebut: form.dateDebut || null,
        dateFin: form.dateFin || null,
        resultat: form.resultat || null,
        materiel: { id: parseInt(form.idMateriel) },
        technicien: { id: parseInt(form.idTechnicien) },
      });
      navigate('/maintenances');
    } catch (err) {
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.erreur || 'Erreur lors de la modification.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: '#0D1B33',
    border: '1px solid #1A2B4A',
    borderRadius: '10px',
    padding: '13px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
  };

  const labelStyle = {
    fontSize: '14px',
    color: '#94a3b8',
    fontWeight: '500',
  };

  if (fetching) {
    return (
      <div className="db-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#64748b', fontSize: 16 }}>Chargement...</span>
      </div>
    );
  }

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
              className={`db-nav-item ${item.label === 'Maintenances' ? 'db-nav-active' : ''}`}
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
              <h1 className="mat-title">Modifier Maintenance</h1>
              <div className="mat-breadcrumb">
                <FiHome size={13} />
                <span style={{ cursor: 'pointer', color: '#3B82F6' }}
                  onClick={() => navigate('/dashboard')}>Accueil</span>
                <span className="mat-sep">/</span>
                <span style={{ cursor: 'pointer', color: '#3B82F6' }}
                  onClick={() => navigate('/maintenances')}>Maintenances</span>
                <span className="mat-sep">/</span>
                <span className="mat-bc-active">Modifier</span>
              </div>
            </div>
          </div>

          <div style={{
            background: '#0A1628',
            border: '1px solid #1A2B4A',
            borderRadius: '14px',
            padding: '32px',
            maxWidth: '700px',
          }}>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '8px', padding: '12px 16px',
                marginBottom: '20px', color: '#f87171', fontSize: '14px'
              }}>⚠ {error}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Type de maintenance *</label>
                <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
                  <option value="Préventive">Préventive</option>
                  <option value="Corrective">Corrective</option>
                  <option value="Curative">Curative</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  required rows={3} placeholder="Décrivez la maintenance..."
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Matériel *</label>
                <select name="idMateriel" value={form.idMateriel} onChange={handleChange} required style={inputStyle}>
                  <option value="">-- Sélectionner un matériel --</option>
                  {materiels.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.codeInventaire} — {m.marque} {m.modele}
                    </option>
                  ))}
                </select>
              </div>

              {role !== 'TECHNICIEN' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={labelStyle}>Technicien *</label>
                  <select name="idTechnicien" value={form.idTechnicien} onChange={handleChange} required style={inputStyle}>
                    <option value="">-- Sélectionner un technicien --</option>
                    {techniciens.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nom} {t.prenom} — {t.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={labelStyle}>Date début</label>
                  <input type="date" name="dateDebut" value={form.dateDebut}
                    onChange={handleChange} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={labelStyle}>Date fin</label>
                  <input type="date" name="dateFin" value={form.dateFin}
                    onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Résultat</label>
                <textarea name="resultat" value={form.resultat} onChange={handleChange}
                  rows={2} placeholder="Résultat de la maintenance..."
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => navigate('/maintenances')}
                  style={{
                    flex: 1, padding: '13px', background: 'transparent',
                    border: '1px solid #1A2B4A', borderRadius: '10px',
                    color: '#64748b', fontSize: '15px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}>
                  <FiX size={16} /> Annuler
                </button>
                <button type="submit" disabled={loading}
                  style={{
                    flex: 1, padding: '13px',
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    border: 'none', borderRadius: '10px',
                    color: '#fff', fontSize: '15px', fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}>
                  <FiSave size={16} />
                  {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
