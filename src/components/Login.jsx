import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';

// Hardcoded SHA-256 hashes of credentials to avoid storing plaintext in the JS bundle
// "itadmin" -> 227077d16a0a05a21f64eda409cda762ad34f86b6770b410d7cf347bfdafeaf9
// "123@ITADMIN" -> f0b53761084d6f5b101df983eea57655bbccf5960b71247b861390a064fe0f4b
const HASHED_USERNAME = '227077d16a0a05a21f64eda409cda762ad34f86b6770b410d7cf347bfdafeaf9';
const HASHED_PASSWORD = 'f0b53761084d6f5b101df983eea57655bbccf5960b71247b861390a064fe0f4b';

// Helper to compute SHA-256 hash using native Web Crypto API
async function computeSha256(string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(bytes => bytes.toString(16).padStart(2, '0')).join('');
}

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      setLoading(false);
      triggerShake();
      return;
    }

    try {
      const hashedInputUser = await computeSha256(username.trim().toLowerCase());
      const hashedInputPass = await computeSha256(password);

      if (hashedInputUser === HASHED_USERNAME && hashedInputPass === HASHED_PASSWORD) {
        onLoginSuccess(rememberMe);
      } else {
        setError('Invalid username or password.');
        triggerShake();
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
      
      <div className={`login-card ${shake ? 'shake-animation' : ''}`}>
        <div className="login-card-header">
          <div className="login-logo-circle">MM</div>
          <h2>MiniMines</h2>
          <p>Secure Portal Login</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error-alert">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <div className="login-input-container">
              <User size={16} className="login-input-icon" />
              <input
                id="login-username"
                type="text"
                className="form-control login-input"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="login-input-container">
              <Lock size={16} className="login-input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control login-input"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="login-extra-options">
            <label className="login-remember-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="login-checkbox"
              />
              Keep me logged in
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <Sparkles size={16} />
                Authenticate
              </>
            )}
          </button>
        </form>

        <div className="login-card-footer">
          <p>MiniMines Cleantech Solutions Private Limited</p>
        </div>
      </div>
    </div>
  );
}
