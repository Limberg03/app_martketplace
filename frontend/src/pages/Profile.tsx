import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faEnvelope, faCamera, faSave,
  faExclamationCircle, faPhone, faInfoCircle,
  faCheckCircle, faSpinner, faCrown
} from '@fortawesome/free-solid-svg-icons';

const API_BASE = 'http://127.0.0.1:8000';

const Profile: React.FC = () => {
  const { user, updateProfile, uploadPhoto } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName]           = useState(user?.nombre || '');
  const [email, setEmail]         = useState(user?.correo || '');
  const [telefono, setTelefono]   = useState(user?.telefono || '');
  const [descripcion, setDesc]    = useState(user?.descripcion || '');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);

  if (!user) return <Navigate to="/login" />;

  // Foto de perfil — URL completa o iniciales
  const avatarSrc = user.foto_url ? `${API_BASE}${user.foto_url}` : null;
  const initials  = user.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('La foto no debe superar 2MB'); return; }
    setPhotoLoading(true);
    const ok = await uploadPhoto(file);
    setPhotoLoading(false);
    if (!ok) setError('Error al subir la foto');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const ok = await updateProfile({ nombre: name, correo: email, telefono, descripcion });
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError('Error al guardar. Verifique que el correo no esté en uso.');
    }
  };

  const planColor = user.plan_suscripcion === 'PREMIUM' ? '#f59e0b' : 'var(--primary)';
  const planLabel = user.plan_suscripcion === 'PREMIUM' ? 'PREMIUM ⭐' : 'BÁSICO';

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Mi Perfil</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Gestiona tu información personal y preferencias de cuenta.
          </p>
        </div>

        {/* Notificación guardado */}
        {saved && (
          <div className="animate-fade-in" style={{
            background: 'rgba(16,185,129,0.15)', border: '1px solid var(--success)',
            borderRadius: '12px', padding: '14px 20px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success)'
          }}>
            <FontAwesomeIcon icon={faCheckCircle} />
            ¡Perfil actualizado correctamente!
          </div>
        )}
        {error && (
          <div className="animate-fade-in" style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
            borderRadius: '12px', padding: '14px 20px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444'
          }}>
            <FontAwesomeIcon icon={faExclamationCircle} />
            {error}
          </div>
        )}

        <div className="glass-card">
          <form onSubmit={handleSave}>

            {/* Foto de perfil */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '36px' }}>
              <div
                onClick={handlePhotoClick}
                style={{
                  width: '110px', height: '110px', borderRadius: '50%',
                  background: avatarSrc ? 'transparent' : 'var(--gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', cursor: 'pointer',
                  border: '3px solid var(--primary)', overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                {photoLoading ? (
                  <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '32px', color: 'white' }} />
                ) : avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '36px', color: 'white', fontWeight: 700 }}>{initials}</span>
                )}
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.2s',
                  borderRadius: '50%'
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                >
                  <FontAwesomeIcon icon={faCamera} style={{ color: 'white', fontSize: '22px' }} />
                </div>
              </div>
              <input
                ref={fileInputRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handlePhotoChange}
              />
              <div>
                <h3 style={{ marginBottom: '4px' }}>{user.nombre}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '10px' }}>
                  Haz clic en la foto para cambiarla. JPG, PNG o WEBP · máx. 2MB
                </p>
                <span style={{
                  padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                  background: `${planColor}22`, color: planColor, border: `1px solid ${planColor}44`
                }}>
                  <FontAwesomeIcon icon={faCrown} style={{ marginRight: '6px' }} />
                  Plan {planLabel}
                </span>
              </div>
            </div>

            {/* Nombre y Correo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nombre completo</label>
                <div style={{ position: 'relative' }}>
                  <FontAwesomeIcon icon={faUser} style={{
                    position: 'absolute', left: '16px', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-secondary)'
                  }} />
                  <input
                    type="text" className="form-control" required
                    value={name} onChange={e => setName(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Correo electrónico</label>
                <div style={{ position: 'relative' }}>
                  <FontAwesomeIcon icon={faEnvelope} style={{
                    position: 'absolute', left: '16px', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-secondary)'
                  }} />
                  <input
                    type="email" className="form-control" required
                    value={email} onChange={e => setEmail(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>
            </div>

            {/* Teléfono */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Teléfono <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(opcional)</span></label>
              <div style={{ position: 'relative' }}>
                <FontAwesomeIcon icon={faPhone} style={{
                  position: 'absolute', left: '16px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-secondary)'
                }} />
                <input
                  type="tel" className="form-control"
                  value={telefono} onChange={e => setTelefono(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  placeholder="+591 70000000"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">
                Descripción corta <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(opcional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <FontAwesomeIcon icon={faInfoCircle} style={{
                  position: 'absolute', left: '16px', top: '18px', color: 'var(--text-secondary)'
                }} />
                <textarea
                  className="form-control" rows={3} maxLength={200}
                  value={descripcion} onChange={e => setDesc(e.target.value)}
                  style={{ paddingLeft: '44px', resize: 'vertical' }}
                  placeholder={user.rol === 'VENDEDOR'
                    ? 'Ej: Desarrollador full-stack especializado en sistemas de gestión...'
                    : 'Ej: Dueño de negocio buscando soluciones digitales para mi empresa...'}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {descripcion.length}/200 caracteres
              </p>
            </div>

            {/* Rol — solo lectura */}
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label">Rol en la plataforma</label>
              <div style={{ position: 'relative' }}>
                <FontAwesomeIcon icon={faUser} style={{
                  position: 'absolute', left: '16px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-secondary)'
                }} />
                <input
                  type="text" className="form-control"
                  value={user.rol === 'VENDEDOR' ? 'Desarrollador / Vendedor' : 'Comprador / Empresa'}
                  disabled style={{ opacity: 0.6, cursor: 'not-allowed', paddingLeft: '44px' }}
                />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FontAwesomeIcon icon={faExclamationCircle} />
                El rol no puede cambiarse una vez registrado.
              </p>
            </div>

            {/* Botón guardar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit" className="btn btn-primary"
                disabled={saving}
                style={{ minWidth: '180px', padding: '14px 28px' }}
              >
                {saving ? (
                  <><FontAwesomeIcon icon={faSpinner} spin /> Guardando...</>
                ) : (
                  <><FontAwesomeIcon icon={faSave} /> Guardar cambios</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
