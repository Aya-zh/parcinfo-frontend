import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { BsMicrosoft } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import laptopImg from '../images/laptop.png';
import '../styles/Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      const msg = err.response?.data?.erreur || 'Email ou mot de passe incorrect.';
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
            Parc<span style={{color:'#3B82F6', fontWeight:'800'}}>IT</span>
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
              Parc<span style={{color:'#3B82F6', fontWeight:'900', fontSize:'28px'}}>IT</span>
            </span>
          </div>

          <h1 className="lp-title">Bienvenue</h1>
          <p className="lp-subtitle">Connectez-vous à votre espace</p>

          {error && <div className="lp-error">{error}</div>}

          <form onSubmit={handleSubmit} className="lp-form">
            <div className="lp-field">
              <FiMail className="lp-field-icon" size={18} />
              <input
                type="email"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="lp-field">
              <FiLock className="lp-field-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="lp-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </span>
            </div>

            <div className="lp-options">
              <label className="lp-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Se souvenir de moi
              </label>
              <a href="#" className="lp-forgot">Mot de passe oublié ?</a>
            </div>

            <button type="submit" className="lp-btn-primary" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="lp-divider"><span>ou</span></div>

          <button className="lp-btn-social">
            <FcGoogle size={20} /> Continuer avec Google
          </button>

          <button className="lp-btn-social lp-ms">
            <BsMicrosoft size={18} color="#F25022" /> Continuer avec Microsoft
          </button>

          <p className="lp-register">
            Pas de compte ?{' '}
            <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
              Créer un compte
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

export default Login;