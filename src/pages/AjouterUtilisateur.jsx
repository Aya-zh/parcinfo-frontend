import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Dashboard.css';
import '../styles/Materiels.css';
import Sidebar from '../components/Sidebar';
import {
  FiHome, FiChevronDown, FiBell, FiSearch,
  FiMail, FiLock, FiUser, FiEye, FiEyeOff
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function AjouterUtilisateur() {
  const navigate = useNavigate();
  const nom = localStorage.getItem('nom');
  const role = localStorage.getItem('role');
  const { notifCount } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: 'BENEFICIAIRE',
    service: '',
    bureau: '',
  });

  const getRoleLabel = () => {
    switch (role) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      default: return 'Utilisateur';
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/api/auth/register-admin', {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        motDePasse: form.motDePasse,
        role: form.role,
        service: form.service || null,
        bureau: form.bureau || null,
      });
      setSuccess('Utilisateur créé avec succès !');
      setTimeout(() => navigate('/utilisateurs'), 1500);
    } catch (err) {
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.message || errData?.erreur || 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: '#0D1B33', border: '1px solid #1A2B4A', borderRadius: '10px',
    padding: '13px 16px 13px 44px', color: '#fff', fontSize: '14px',
    outline: 'none', width: '100%',
  };

  const inputStyleNoIcon = {
    background: '#0D1B33', border: '1px solid #1A2B4A', borderRadius: '10px',
    padding: '13px 16px', color: '#fff', fontSize: '14px',
    outline: 'none', width: '100%',
  };

  const labelStyle = { fontSize: '14px', color: '#94a3b8', fontWeight: '500' };
  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' };
  const iconStyle = { position: 'absolute', left: '14px', top: '42px', color: '#3A5A7A', pointerEvents: 'none' };

  return (
    <div className="db-root">

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeLabel="Utilisateurs" />

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
              <h1 className="mat-title">Ajouter un Utilisateur</h1>
              <div className="mat-breadcrumb">
                <FiHome size={13} />
                <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/dashboard')}>Accueil</span>
                <span className="mat-sep">/</span>
                <span style={{ cursor: 'pointer', color: '#3B82F6' }} onClick={() => navigate('/utilisateurs')}>Utilisateurs</span>
                <span className="mat-sep">/</span>
                <span className="mat-bc-active">Ajouter</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#0A1628', border: '1px solid #1A2B4A', borderRadius: '14px', padding: '32px', maxWidth: '700px' }}>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#f87171', fontSize: '14px' }}>
                ⚠ {error}
              </div>
            )}

            {success && (
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#22C55E', fontSize: '14px' }}>
                ✅ {success}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Nom *</label>
                  <FiUser size={16} style={iconStyle} />
                  <input type="text" name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} required style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Prénom *</label>
                  <FiUser size={16} style={iconStyle} />
                  <input type="text" name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} required style={inputStyle} />
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Email *</label>
                <FiMail size={16} style={iconStyle} />
                <input type="email" name="email" placeholder="email@exemple.com" value={form.email} onChange={handleChange} required style={inputStyle} />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Mot de passe *</label>
                <FiLock size={16} style={iconStyle} />
                <input type={showPassword ? 'text' : 'password'} name="motDePasse" placeholder="••••••••" value={form.motDePasse} onChange={handleChange} required style={inputStyle} />
                <span onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '42px', cursor: 'pointer', color: '#64748b' }}>
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Rôle *</label>
                <select name="role" value={form.role} onChange={handleChange} style={inputStyleNoIcon}>
                  <option value="BENEFICIAIRE">Bénéficiaire</option>
                  <option value="TECHNICIEN">Technicien</option>
                  <option value="RESPONSABLE">Responsable</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={labelStyle}>Service</label>
                  <input type="text" name="service" placeholder="Ex: Informatique" value={form.service} onChange={handleChange} style={inputStyleNoIcon} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={labelStyle}>Bureau</label>
                  <input type="text" name="bureau" placeholder="Ex: Bureau 101" value={form.bureau} onChange={handleChange} style={inputStyleNoIcon} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => navigate('/utilisateurs')} style={{ flex: 1, padding: '13px', background: 'transparent', border: '1px solid #1A2B4A', borderRadius: '10px', color: '#64748b', fontSize: '15px', cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Création...' : "Créer l'utilisateur"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}