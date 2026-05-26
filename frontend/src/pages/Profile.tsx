import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faEnvelope, faCamera, faSave,
  faExclamationCircle, faPhone, faInfoCircle,
  faCheckCircle, faSpinner, faCrown, faRocket, faRobot, faCode, faChartLine
} from '@fortawesome/free-solid-svg-icons';

const API_BASE = 'http://127.0.0.1:8000';

const Profile: React.FC = () => {
  const { user, updateProfile, uploadPhoto, updateLocalUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName]           = useState(user?.nombre || '');
  const [email, setEmail]         = useState(user?.correo || '');
  const [telefono, setTelefono]   = useState(user?.telefono || '');
  const [descripcion, setDesc]    = useState(user?.descripcion || '');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [loadingPremium, setLoadingPremium] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Mostrar mensaje si vuelve de Stripe
  const isPremiumSuccess = new URLSearchParams(location.search).get('premium') === 'true';

  useEffect(() => {
    const upgradeUser = async () => {
      if (isPremiumSuccess && user && user.plan_suscripcion !== 'PREMIUM') {
        try {
          await fetch(`${API_BASE}/api/stripe/simulate-upgrade/${user.id}`, { method: 'POST' });
          updateLocalUser({ plan_suscripcion: 'PREMIUM' });
          navigate('/perfil', { replace: true });
        } catch (e) {
          console.error(e);
        }
      }
    };
    upgradeUser();
  }, [isPremiumSuccess, user]);

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
  const planLabel = user.plan_suscripcion === 'PREMIUM' ? 'PREMIUM ' : 'BÁSICO';

  const handleUpgrade = async () => {
    setLoadingPremium(true);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/create-subscription-session?usuario_id=${user.id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setError('Error al iniciar el pago.');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoadingPremium(false);
    }
  };

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

        {/* Notificación de Stripe Premium */}
        {isPremiumSuccess && (
          <div className="animate-fade-in" style={{
            background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b',
            borderRadius: '12px', padding: '14px 20px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', fontWeight: 600
          }}>
            <FontAwesomeIcon icon={faCheckCircle} />
            ¡Felicidades! Ahora eres un usuario PREMIUM. Tu cuenta se actualizará en breve.
          </div>
        )}

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <span style={{
                    padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                    background: `${planColor}22`, color: planColor, border: `1px solid ${planColor}44`
                  }}>
                    <FontAwesomeIcon icon={faCrown} style={{ marginRight: '6px' }} />
                    Plan {planLabel}
                  </span>
                  
                  {user.plan_suscripcion !== 'PREMIUM' && (
                    <button 
                      type="button"
                      onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 12px', borderColor: '#3b82f6', color: '#3b82f6', borderRadius: '20px' }}
                    >
                      Mejorar a PREMIUM
                    </button>
                  )}
                </div>
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

        {/* Pricing Cards */}
        {user.plan_suscripcion !== 'PREMIUM' && (
          <div id="pricing-section" style={{ marginTop: '60px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Elige el plan ideal para ti</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Desbloquea el poder total de la Inteligencia Artificial y lleva tu negocio al siguiente nivel.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {/* Plan Basico */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease'
              }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Básico</h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Gratis</div>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Acceso esencial a la plataforma.</p>
                </div>
                
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '16px' }}>Incluye:</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)' }}>
                    {user.rol === 'VENDEDOR' ? (
                      <>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--text-secondary)' }}/> Portafolio máx. 5 apps</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--text-secondary)' }}/> 1 Optimización de precio/día</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--text-secondary)' }}/> 1 Manual autogenerado/mes</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--text-secondary)' }}/> Sin sello de calidad IA</li>
                      </>
                    ) : (
                      <>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--text-secondary)' }}/> 3 Consultas IA/día (Búsqueda)</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--text-secondary)' }}/> 5 Preguntas técnicas RAG/app</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--text-secondary)' }}/> Soporte estándar</li>
                      </>
                    )}
                  </ul>
                </div>
                <button className="btn btn-outline" style={{ marginTop: '24px', width: '100%', borderColor: 'rgba(255,255,255,0.2)', cursor: 'default' }} disabled>
                  Tu plan actual
                </button>
              </div>

              {/* Plan Premium */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(20,25,35,0.8) 0%, rgba(10,12,18,0.9) 100%)',
                border: '1px solid #3b82f6',
                borderRadius: '16px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 40px -10px rgba(59,130,246,0.3)',
                transform: 'scale(1.02)'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #d946ef)' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <span style={{ background: '#ffffff', color: '#000000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Recomendado
                  </span>
                </div>

                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '8px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FontAwesomeIcon icon={faCrown} style={{ color: '#fbbf24' }}/> PREMIUM
                  </h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffffff' }}>10 USD<span style={{ fontSize: '1rem', color: '#9ca3af', fontWeight: 'normal' }}>/mes</span></div>
                  <p style={{ color: '#9ca3af', marginTop: '8px' }}>Poder ilimitado y posicionamiento.</p>
                </div>
                
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '16px', color: '#ffffff' }}>Incluye todo lo básico, y:</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#e5e7eb' }}>
                    {user.rol === 'VENDEDOR' ? (
                      <>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><FontAwesomeIcon icon={faRocket} style={{ color: '#3b82f6' }}/> Portafolio Ilimitado</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><FontAwesomeIcon icon={faChartLine} style={{ color: '#3b82f6' }}/> 10 Optimizaciones de precio/día</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><FontAwesomeIcon icon={faCode} style={{ color: '#3b82f6' }}/> 10 Manuales autogenerados/mes</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><FontAwesomeIcon icon={faCrown} style={{ color: '#fbbf24' }}/> Sello de Calidad IA (Grado A)</li>
                      </>
                    ) : (
                      <>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><FontAwesomeIcon icon={faRobot} style={{ color: '#3b82f6' }}/> 20 Consultas IA/día (Búsqueda)</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><FontAwesomeIcon icon={faCode} style={{ color: '#3b82f6' }}/> Consultas ilimitadas RAG al código</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><FontAwesomeIcon icon={faCrown} style={{ color: '#fbbf24' }}/> Recomendaciones de alta precisión</li>
                      </>
                    )}
                  </ul>
                </div>
                <button 
                  onClick={handleUpgrade}
                  disabled={loadingPremium}
                  className="btn btn-primary" 
                  style={{ 
                    marginTop: '24px', 
                    width: '100%', 
                    padding: '16px',
                    background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                >
                  {loadingPremium ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Mejorar a PREMIUM'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
