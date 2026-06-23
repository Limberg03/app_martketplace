import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser, faEnvelope, faCrown, faTimes, faIdCard, faPhone, faRobot, faBook, faLightbulb, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://127.0.0.1:8000/api';

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${API_URL}/admin/usuarios?admin_id=${user.id}`)
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const filteredUsers = users.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', color: 'white' }}>Gestión de Usuarios</h1>
          <p style={{ color: '#94A3B8', margin: 0 }}>Visualiza y audita a los compradores y vendedores registrados.</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, correo o rol..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 48px', background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '16px 24px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Usuario</th>
              <th style={{ padding: '16px 24px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Rol</th>
              <th style={{ padding: '16px 24px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Plan</th>
              <th style={{ padding: '16px 24px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Fecha de Registro</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Cargando usuarios...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>No se encontraron usuarios.</td></tr>
            ) : (
              filteredUsers.map(u => (
                <tr 
                  key={u.id} 
                  onClick={() => setSelectedUser(u)}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <p style={{ margin: '0 0 4px 0', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FontAwesomeIcon icon={faUser} style={{ color: '#64748B' }} /> {u.nombre}
                    </p>
                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FontAwesomeIcon icon={faEnvelope} style={{ color: '#64748B' }} /> {u.correo}
                    </p>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                      background: u.rol === 'VENDEDOR' ? 'rgba(139,92,246,0.1)' : u.rol === 'ADMIN' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                      color: u.rol === 'VENDEDOR' ? '#8B5CF6' : u.rol === 'ADMIN' ? '#EF4444' : '#3B82F6'
                    }}>
                      {u.rol}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {u.plan_suscripcion === 'PREMIUM' ? (
                      <span style={{ color: '#F59E0B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FontAwesomeIcon icon={faCrown} /> Premium
                      </span>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>Básico</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#94A3B8' }}>
                    {new Date(u.fecha_registro).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detalles de Usuario */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div className="animate-fade-in" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', width: '100%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem' }}>
                <FontAwesomeIcon icon={faIdCard} style={{ color: '#3B82F6' }} /> Detalles del Usuario
              </h3>
              <button 
                onClick={() => setSelectedUser(null)} 
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.25rem' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'grid', gap: '20px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'white', fontWeight: 'bold' }}>
                  {selectedUser.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1.5rem' }}>{selectedUser.nombre}</h2>
                  <p style={{ margin: 0, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FontAwesomeIcon icon={faEnvelope} /> {selectedUser.correo}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ margin: '0 0 8px 0', color: '#64748B', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Rol Principal</p>
                  <p style={{ margin: 0, color: 'white', fontWeight: 600 }}>{selectedUser.rol}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ margin: '0 0 8px 0', color: '#64748B', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Plan de Suscripción</p>
                  <p style={{ margin: 0, color: selectedUser.plan_suscripcion === 'PREMIUM' ? '#F59E0B' : 'white', fontWeight: 600 }}>
                    {selectedUser.plan_suscripcion === 'PREMIUM' && <FontAwesomeIcon icon={faCrown} style={{ marginRight: '6px' }} />}
                    {selectedUser.plan_suscripcion}
                  </p>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ margin: '0 0 8px 0', color: '#64748B', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Acerca de</p>
                <p style={{ margin: 0, color: 'white', fontSize: '0.95rem', lineHeight: 1.5 }}>{selectedUser.descripcion || 'Sin descripción en el perfil.'}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94A3B8' }}>
                  <FontAwesomeIcon icon={faPhone} style={{ color: '#3B82F6', width: '20px' }} />
                  {selectedUser.telefono || 'No registrado'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94A3B8' }}>
                  <FontAwesomeIcon icon={faRobot} style={{ color: '#8B5CF6', width: '20px' }} />
                  Consultas IA: <strong style={{ color: 'white' }}>{selectedUser.consultas_ia}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94A3B8' }}>
                  <FontAwesomeIcon icon={faBook} style={{ color: '#10B981', width: '20px' }} />
                  Manuales generados: <strong style={{ color: 'white' }}>{selectedUser.manuales_generados_mes}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94A3B8' }}>
                  <FontAwesomeIcon icon={faLightbulb} style={{ color: '#F59E0B', width: '20px' }} />
                  Sugerencias IA: <strong style={{ color: 'white' }}>{selectedUser.sugerencias_precio_diarias}</strong>
                </div>
                {selectedUser.stripe_customer && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94A3B8', gridColumn: '1 / -1', marginTop: '8px' }}>
                    <FontAwesomeIcon icon={faCreditCard} style={{ color: '#6366F1', width: '20px' }} />
                    Cliente Stripe ID: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>{selectedUser.stripe_customer}</code>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
