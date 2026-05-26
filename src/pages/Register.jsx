import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
import api from '../api/axios';
import laptopImg from '../images/laptop.png';
import '../styles/Login.css';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: 'BENEFICIAIRE',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/api/auth/register', form);
      setSuccess('Compte créé avec succès ! Redirection...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.erreur || 'Erreur lors de la création du compte.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">

      <div className="lp-left">
        <div className="lp-topbar">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <polygon points="9,1 17,5 17,13 9,17 1,13 1,5" fill="#2563EB" />
            <text x="9" y="13" textAnchor="middle" fill="white"
              fontSize="9" fontWeight="800" fontFamily="Segoe UI, sans-serif">P</text>
          </svg>
          <span className="lp-brand">
            Parc<span style={{ color: '#3B82F6', fontWeight: '800' }}>IT</span>
          </span>
          <span className="lp-tagline">Piloté. Sécurisé. Optimisé.</span>
        </div>
        <img src={laptopImg} alt="infrastructure" className="lp-hero-img" />
      </div>

      <div className="lp-right">
        <div className="lp-card">

          <div className="lp-logo">
            <svg width="46" height="46" viewBox="0 0 46 46">
              <polygon points="23,2 42,12 42,34 23,44 4,34 4,12" fill="#2563EB" />
              <text x="23" y="30" textAnchor="middle" fill="white"
                fontSize="21" fontWeight="800" fontFamily="Segoe UI, sans-serif">P</text>
            </svg>
            <span className="lp-logo-text">
              Parc<span style={{ color: '#3B82F6', fontWeight: '900', fontSize: '28px' }}>IT</span>
            </span>
          </div>

          <h1 className="lp-title">Créer un compte</h1>
          <p className="lp-subtitle">Rejoignez ParcIT dès maintenant</p>

          {error && <div className="lp-error">{error}</div>}

          {success && (
            <div style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.4)',
              borderRadius: '8px', padding: '10px 14px',
              marginBottom: '1rem', color: '#22C55E', fontSize: '13px'
            }}>
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="lp-form">

            {/* Nom + Prénom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="lp-field">
                <FiUser className="lp-field-icon" size={18} />
                <input
                  type="text"
                  name="nom"
                  placeholder="Nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="lp-field">
                <FiUser className="lp-field-icon" size={18} />
                <input
                  type="text"
                  name="prenom"
                  placeholder="Prénom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="lp-field">
              <FiMail className="lp-field-icon" size={18} />
              <input
                type="email"
                name="email"
                placeholder="Adresse e-mail"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Mot de passe */}
            <div className="lp-field">
              <FiLock className="lp-field-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="motDePasse"
                placeholder="Mot de passe"
                value={form.motDePasse}
                onChange={handleChange}
                required
              />
              <span className="lp-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </span>
            </div>

            {/* Rôle */}
            <div className="lp-field">
              <select
  name="role"
  value={form.role}
  onChange={handleChange}
  style={{
    width: '100%',
    background: '#0D1B33',
    border: '1px solid #1A2B4A',
    borderRadius: '10px',
    padding: '14px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  }}
>
  <option value="BENEFICIAIRE">Bénéficiaire</option>
  <option value="TECHNICIEN">Technicien</option>
</select>
            </div>

            <button type="submit" className="lp-btn-primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>

          </form>

          <p className="lp-register" style={{ marginTop: '1rem' }}>
            Déjà un compte ?{' '}
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Se connecter
            </a>
          </p>

        </div>

        <div className="lp-footer">
          <span>© 2024 ParcInfo. Tous droits réservés.</span>
          <span className="lp-lang">🌐 FR ▾</span>
        </div>
      </div>

    </div>
  );
}

export default Register;
