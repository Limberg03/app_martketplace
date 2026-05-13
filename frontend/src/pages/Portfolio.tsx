import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit, faEye, faPlus, faTrash, faToggleOn, faToggleOff,
  faSave, faTimes, faSpinner, faCheckCircle, faExclamationCircle,
  faBoxOpen, faCrown
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.0.0.1:8000/api';
const LIMITE_BASIC = 5;

interface AppItem {
  id: number;
  titulo: string;
  descripcion: string;
  tecnologia: string;
  precio_venta: number;
  estado: string;
  visitas: number;
  sello_calidad: boolean;
  fecha_publicacion: string;
  ventas: number;
  ingresos: number;
}

interface EditForm {
  titulo: string;
  descripcion: string;
  precio_venta: string;
  tecnologia: string;
}

const estadoBadge = (estado: string) => {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    ACTIVA:      { color: 'var(--success)',  bg: 'rgba(16,185,129,0.12)', label: 'Activa' },
    INACTIVA:    { color: '#f59e0b',         bg: 'rgba(245,158,11,0.12)', label: 'Inactiva' },
    EN_REVISION: { color: '#6366f1',         bg: 'rgba(99,102,241,0.12)', label: 'En Revisión' },
  };
  const s = map[estado] || { color: 'var(--text-secondary)', bg: 'transparent', label: estado };
  return (
    <span style={{
      padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem',
      fontWeight: 700, background: s.bg, color: s.color
    }}>
      {s.label}
    </span>
  );
};

const Portfolio: React.FC = () => {
  const { user } = useAuth();
  const [apps, setApps]           = useState<AppItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState('');
  const [toastErr, setToastErr]   = useState('');

  // Modal editar
  const [editApp, setEditApp]     = useState<AppItem | null>(null);
  const [editForm, setEditForm]   = useState<EditForm>({ titulo: '', descripcion: '', precio_venta: '', tecnologia: '' });
  const [saving, setSaving]       = useState(false);

  // Modal eliminar
  const [deleteApp, setDeleteApp] = useState<AppItem | null>(null);
  const [deleting, setDeleting]   = useState(false);

  if (!user || user.rol !== 'VENDEDOR') return <Navigate to="/marketplace" />;

  const esBasic = user.plan_suscripcion === 'BASICO';
  const limiteAlcanzado = esBasic && apps.length >= LIMITE_BASIC;

  const showToast = (msg: string, err = false) => {
    if (err) setToastErr(msg); else setToast(msg);
    setTimeout(() => { setToast(''); setToastErr(''); }, 3500);
  };

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`${API_URL}/apps/portfolio/${user.id}`);
      if (res.ok) setApps(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  // ── Editar ───────────────────────────────────────────────────────────────
  const openEdit = (app: AppItem) => {
    setEditApp(app);
    setEditForm({
      titulo: app.titulo,
      descripcion: app.descripcion,
      precio_venta: app.precio_venta.toString(),
      tecnologia: app.tecnologia,
    });
  };

  const handleSaveEdit = async () => {
    if (!editApp) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/apps/${editApp.id}?seller_id=${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: editForm.titulo,
          descripcion: editForm.descripcion,
          precio_venta: parseFloat(editForm.precio_venta),
          tecnologia: editForm.tecnologia,
        }),
      });
      if (res.ok) {
        setEditApp(null);
        showToast('Aplicación actualizada correctamente');
        fetchPortfolio();
      } else {
        const d = await res.json();
        showToast(d.detail || 'Error al guardar', true);
      }
    } finally { setSaving(false); }
  };

  // ── Toggle Activa/Inactiva ────────────────────────────────────────────────
  const handleToggle = async (app: AppItem) => {
    const res = await fetch(`${API_URL}/apps/${app.id}/toggle?seller_id=${user.id}`, {
      method: 'PATCH'
    });
    if (res.ok) {
      const nuevo = app.estado === 'ACTIVA' ? 'Inactiva' : 'Activa';
      showToast(`App marcada como ${nuevo}`);
      fetchPortfolio();
    } else {
      showToast('Error al cambiar estado', true);
    }
  };

  // ── Eliminar ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteApp) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/apps/${deleteApp.id}?seller_id=${user.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeleteApp(null);
        showToast('Aplicación eliminada');
        fetchPortfolio();
      } else {
        const d = await res.json();
        setDeleteApp(null);
        showToast(d.detail || 'No se pudo eliminar', true);
      }
    } finally { setDeleting(false); }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>

      {/* Toasts */}
      {toast && (
        <div className="animate-fade-in" style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          background: 'rgba(16,185,129,0.9)', color: 'white',
          padding: '14px 20px', borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <FontAwesomeIcon icon={faCheckCircle} /> {toast}
        </div>
      )}
      {toastErr && (
        <div className="animate-fade-in" style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          background: 'rgba(239,68,68,0.9)', color: 'white',
          padding: '14px 20px', borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <FontAwesomeIcon icon={faExclamationCircle} /> {toastErr}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Mis Aplicaciones</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Gestiona tus apps publicadas.
            {esBasic && (
              <span style={{ marginLeft: '12px', color: '#f59e0b', fontSize: '0.88rem' }}>
                Plan BÁSICO: {apps.length}/{LIMITE_BASIC} apps
              </span>
            )}
          </p>
        </div>

        {limiteAlcanzado ? (
          <div style={{ position: 'relative' }}>
            <button className="btn btn-outline" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <FontAwesomeIcon icon={faPlus} /> Subir App
            </button>
            <div style={{
              position: 'absolute', right: 0, top: '110%', background: 'var(--surface)',
              border: '1px solid var(--border-color)', borderRadius: '10px',
              padding: '10px 14px', whiteSpace: 'nowrap', fontSize: '0.82rem',
              color: 'var(--text-secondary)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 10
            }}>
              <FontAwesomeIcon icon={faCrown} style={{ color: '#f59e0b', marginRight: '6px' }} />
              Actualiza a <strong>PREMIUM</strong> para subir más apps
            </div>
          </div>
        ) : (
          <Link to="/upload" className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} /> Subir App
          </Link>
        )}
      </div>

      {/* Tabla */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border-color)' }}>
              {['Aplicación', 'Tecnologías', 'Estado', 'Visitas', 'Ventas', 'Ingresos', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '10px' }} />
                Cargando tus aplicaciones...
              </td></tr>
            ) : apps.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}>
                <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: '40px', color: 'var(--text-secondary)', marginBottom: '16px', display: 'block' }} />
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Todavía no tienes aplicaciones publicadas.</p>
                <Link to="/upload" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                  <FontAwesomeIcon icon={faPlus} /> Subir mi primera app
                </Link>
              </td></tr>
            ) : apps.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>{app.titulo}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {new Date(app.fecha_publicacion).toLocaleDateString('es-BO')}
                  </div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {app.tecnologia.split(',').slice(0, 3).map(t => (
                      <span key={t} style={{
                        background: 'rgba(59,130,246,0.1)', color: 'var(--primary)',
                        borderRadius: '4px', padding: '2px 6px', fontSize: '0.72rem'
                      }}>{t.trim()}</span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '14px 18px' }}>{estadoBadge(app.estado)}</td>
                <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                  <FontAwesomeIcon icon={faEye} style={{ marginRight: '6px' }} />{app.visitas}
                </td>
                <td style={{ padding: '14px 18px' }}>{app.ventas}</td>
                <td style={{ padding: '14px 18px', color: 'var(--success)', fontWeight: 600 }}>
                  Bs. {app.ingresos.toFixed(2)}
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {/* Editar */}
                    <button onClick={() => openEdit(app)} className="btn btn-outline btn-sm"
                      title="Editar" style={{ padding: '6px 10px' }}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    {/* Toggle */}
                    <button onClick={() => handleToggle(app)} className="btn btn-outline btn-sm"
                      title={app.estado === 'ACTIVA' ? 'Desactivar' : 'Activar'}
                      style={{ padding: '6px 10px', color: app.estado === 'ACTIVA' ? 'var(--success)' : '#f59e0b' }}>
                      <FontAwesomeIcon icon={app.estado === 'ACTIVA' ? faToggleOn : faToggleOff} />
                    </button>
                    {/* Eliminar */}
                    <button onClick={() => setDeleteApp(app)} className="btn btn-outline btn-sm"
                      title="Eliminar" style={{ padding: '6px 10px', color: '#ef4444', borderColor: '#ef444440' }}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal Editar ──────────────────────────────────────────────────── */}
      {editApp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Editar: {editApp.titulo}</h3>
              <button onClick={() => setEditApp(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Título</label>
              <input type="text" className="form-control"
                value={editForm.titulo} onChange={e => setEditForm(f => ({ ...f, titulo: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-control" rows={3}
                value={editForm.descripcion} onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Precio (Bs.)</label>
                <input type="number" className="form-control" min="0" step="0.01"
                  value={editForm.precio_venta} onChange={e => setEditForm(f => ({ ...f, precio_venta: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tecnologías</label>
                <input type="text" className="form-control"
                  value={editForm.tecnologia} onChange={e => setEditForm(f => ({ ...f, tecnologia: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
              <button onClick={() => setEditApp(null)} className="btn btn-outline">Cancelar</button>
              <button onClick={handleSaveEdit} className="btn btn-primary" disabled={saving}>
                {saving ? <><FontAwesomeIcon icon={faSpinner} spin /> Guardando...</> : <><FontAwesomeIcon icon={faSave} /> Guardar</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Eliminar ─────────────────────────────────────────────────── */}
      {deleteApp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
            <FontAwesomeIcon icon={faTrash} style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }} />
            <h3 style={{ marginBottom: '12px' }}>¿Eliminar aplicación?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
              "<strong>{deleteApp.titulo}</strong>" se eliminará permanentemente. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteApp(null)} className="btn btn-outline">Cancelar</button>
              <button onClick={handleDelete} className="btn btn-primary"
                disabled={deleting} style={{ background: '#ef4444', borderColor: '#ef4444' }}>
                {deleting ? <><FontAwesomeIcon icon={faSpinner} spin /> Eliminando...</> : <><FontAwesomeIcon icon={faTrash} /> Sí, eliminar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
