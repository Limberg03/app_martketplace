import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStore, faArrowLeft, faCheckCircle,
  faEnvelope, faKey, faLock, faSpinner, faEye, faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

const API_URL = 'http://127.0.0.1:8000/api';

type Step = 'email' | 'code' | 'done';

const RecoverPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');

  // Paso 1
  const [correo, setCorreo]         = useState('');
  const [sending, setSending]       = useState(false);
  const [sendError, setSendError]   = useState('');

  // Paso 2
  const [token, setToken]           = useState('');
  const [newPass, setNewPass]       = useState('');
  const [confirmPass, setConfirm]   = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [resetting, setResetting]   = useState(false);
  const [resetError, setResetError] = useState('');

  // ── Paso 1: solicitar código ──────────────────────────────────────────────
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError('');
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });
      const data = await res.json();
      if (res.ok) {
        // En desarrollo el token viene en la respuesta para pruebas
        if (data.codigo_recuperacion) {
          setToken(data.codigo_recuperacion); // Pre-llenamos para facilitar el demo
        }
        setStep('code');
      } else {
        setSendError(data.detail || 'Error al enviar el código');
      }
    } catch {
      setSendError('No se pudo conectar con el servidor');
    } finally {
      setSending(false);
    }
  };

  // ── Paso 2: cambiar contraseña ────────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (newPass.length < 6) { setResetError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (newPass !== confirmPass) { setResetError('Las contraseñas no coinciden'); return; }

    setResetting(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nueva_password: newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('done');
      } else {
        setResetError(data.detail || 'Código inválido o expirado');
      }
    } catch {
      setResetError('No se pudo conectar con el servidor');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="bg-glow"></div>

      <div className="auth-card glass-card animate-fade-in">
        <div className="auth-header">
          <Link to="/" className="brand" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <FontAwesomeIcon icon={faStore} className="brand-icon" style={{ fontSize: '32px' }} />
          </Link>

          {/* ── PASO 1: Email ── */}
          {step === 'email' && (
            <>
              <h1>Recuperar contraseña</h1>
              <p>Ingresa tu correo y te enviaremos un código de recuperación.</p>
            </>
          )}

          {/* ── PASO 2: Código + nueva contraseña ── */}
          {step === 'code' && (
            <>
              <h1>Ingresa el código</h1>
              <p>
                Enviamos un código de 6 dígitos a <strong>{correo}</strong>.
                Ingrésalo junto con tu nueva contraseña.
              </p>
            </>
          )}

          {/* ── PASO 3: Éxito ── */}
          {step === 'done' && (
            <>
              <FontAwesomeIcon
                icon={faCheckCircle}
                style={{ fontSize: '52px', color: 'var(--success)', margin: '0 auto 16px', display: 'block' }}
              />
              <h1>¡Contraseña actualizada!</h1>
              <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
            </>
          )}
        </div>

        {/* ── Formulario Paso 1 ── */}
        {step === 'email' && (
          <form onSubmit={handleRequestCode}>
            {sendError && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
                borderRadius: '8px', padding: '12px 16px', marginBottom: '20px',
                color: '#ef4444', fontSize: '0.9rem'
              }}>
                {sendError}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <div style={{ position: 'relative' }}>
                <FontAwesomeIcon icon={faEnvelope} style={{
                  position: 'absolute', left: '16px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-secondary)'
                }} />
                <input
                  id="recover-email"
                  type="email" className="form-control" required
                  placeholder="correo@ejemplo.com"
                  value={correo} onChange={e => setCorreo(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            <button
              type="submit" className="btn btn-primary"
              disabled={sending}
              style={{ width: '100%', padding: '14px', marginBottom: '16px' }}
            >
              {sending
                ? <><FontAwesomeIcon icon={faSpinner} spin /> Enviando...</>
                : <><FontAwesomeIcon icon={faEnvelope} /> Enviar código</>}
            </button>

            <Link to="/login" className="btn btn-outline" style={{ width: '100%', padding: '14px' }}>
              <FontAwesomeIcon icon={faArrowLeft} /> Volver al inicio de sesión
            </Link>
          </form>
        )}

        {/* ── Formulario Paso 2 ── */}
        {step === 'code' && (
          <form onSubmit={handleReset}>
            {resetError && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
                borderRadius: '8px', padding: '12px 16px', marginBottom: '20px',
                color: '#ef4444', fontSize: '0.9rem'
              }}>
                {resetError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Código de recuperación (6 dígitos)</label>
              <div style={{ position: 'relative' }}>
                <FontAwesomeIcon icon={faKey} style={{
                  position: 'absolute', left: '16px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-secondary)'
                }} />
                <input
                  id="recovery-token"
                  type="text" className="form-control" required
                  maxLength={6} pattern="\d{6}" placeholder="123456"
                  value={token} onChange={e => setToken(e.target.value)}
                  style={{ paddingLeft: '44px', letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.2rem' }}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                ⚠️ Modo demo: el código se completó automáticamente. En producción llegaría al correo.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Nueva contraseña</label>
              <div style={{ position: 'relative' }}>
                <FontAwesomeIcon icon={faLock} style={{
                  position: 'absolute', left: '16px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-secondary)'
                }} />
                <input
                  id="new-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-control" required minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={newPass} onChange={e => setNewPass(e.target.value)}
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
                }}>
                  <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar nueva contraseña</label>
              <div style={{ position: 'relative' }}>
                <FontAwesomeIcon icon={faLock} style={{
                  position: 'absolute', left: '16px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-secondary)'
                }} />
                <input
                  id="confirm-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-control" required
                  placeholder="Repite la contraseña"
                  value={confirmPass} onChange={e => setConfirm(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            <button
              type="submit" className="btn btn-primary"
              disabled={resetting}
              style={{ width: '100%', padding: '14px', marginBottom: '16px' }}
            >
              {resetting
                ? <><FontAwesomeIcon icon={faSpinner} spin /> Actualizando...</>
                : <><FontAwesomeIcon icon={faLock} /> Cambiar contraseña</>}
            </button>

            <button
              type="button" onClick={() => setStep('email')}
              className="btn btn-outline" style={{ width: '100%', padding: '14px' }}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Usar otro correo
            </button>
          </form>
        )}

        {/* ── Paso 3: Éxito ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              Ir al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecoverPassword;
