import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState(null); // 'admin' or 'manager'

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    
    if (loginMode === 'admin' && password === 'admin123') {
      onLogin('admin');
    } else if (loginMode === 'manager' && password === 'manager123') {
      onLogin('manager');
    } else {
      alert(`Access Denied: Incorrect ${loginMode} Password`);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <h1>VestaStay</h1>
          <p>Premium Hospitality Management</p>
        </div>

        <div className="login-options">
          <button className="btn-guest" onClick={() => onLogin('user')}>
            Continue as Guest
          </button>
          
          <div className="divider"><span>OR</span></div>

          {!loginMode ? (
            <>
              <button className="btn-admin-toggle" onClick={() => setLoginMode('admin')}>
                Access Admin Portal
              </button>
              <button className="btn-manager-toggle" onClick={() => setLoginMode('manager')}>
                Access Manager Portal
              </button>
            </>
          ) : (
            <form onSubmit={handleAuthSubmit} className="admin-login-form">
              <h3 className="mode-label">{loginMode.toUpperCase()} LOGIN</h3>
              <input 
                type="password" 
                placeholder={`${loginMode.charAt(0).toUpperCase() + loginMode.slice(1)} Password`} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required 
              />
              <div className="form-actions">
                <button type="submit" className="btn-login">Login</button>
                <button type="button" className="btn-cancel" onClick={() => {setLoginMode(null); setPassword('');}}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;