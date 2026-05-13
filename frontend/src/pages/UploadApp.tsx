import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload, faFileCode, faImage, faTimes,
  faSpinner, faPlus, faCheckCircle, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.0.0.1:8000/api';

interface Categoria { id: number; nombre: string; icono: string; }

const TECH_SUGERIDAS = ['React', 'Vue', 'Angular', 'Python', 'FastAPI', 'Node.js',
  'Laravel', 'Django', 'PostgreSQL', 'MySQL', 'MongoDB', 'Java', 'Spring', 'Flutter'];

const UploadApp: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [titulo, setTitulo]         = useState('');
  const [descripcion, setDesc]      = useState('');
  const [precio, setPrecio]         = useState('');
  const [categoriaId, setCatId]     = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tecnologias, setTechs]     = useState<string[]>([]);
  const [techInput, setTechInput]   = useState('');
  const [zipFile, setZipFile]       = useState<File | null>(null);
  const [imagenes, setImagenes]     = useState<File[]>([]);
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [error, setError]           = useState('');
  const [exito, setExito]           = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/apps/categorias`)
      .then(r => r.json())
      .then(setCategorias)
      .catch(() => {});
  }, []);

  if (!user || user.rol !== 'VENDEDOR') return <Navigate to="/marketplace" />;

  // ── Tecnologías (chips) ──────────────────────────────────────────────────
  const addTech = (tech: string) => {
    const t = tech.trim();
    if (t && !tecnologias.includes(t)) setTechs(prev => [...prev, t]);
    setTechInput('');
  };
  const removeTech = (t: string) => setTechs(prev => prev.filter(x => x !== t));
  const handleTechKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTech(techInput); }
  };

  // ── Imágenes ─────────────────────────────────────────────────────────────
  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImagenes(prev => [...prev, ...files].slice(0, 5));
  };
  const removeImage = (idx: number) => setImagenes(prev => prev.filter((_, i) => i !== idx));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!zipFile) { setError('Debes subir el archivo de código fuente (.zip).'); return; }
    if (!categoriaId) { setError('Selecciona una categoría.'); return; }
    if (tecnologias.length === 0) { setError('Agrega al menos una tecnología.'); return; }

    setUploading(true);
    setProgress(10);

    const form = new FormData();
    form.append('titulo', titulo);
    form.append('descripcion', descripcion);
    form.append('tecnologia', tecnologias.join(', '));
    form.append('precio_venta', precio);
    form.append('categoria_id', categoriaId);
    form.append('vendedor_id', user.id.toString());
    form.append('codigo_zip', zipFile);
    imagenes.forEach(img => form.append('imagenes', img));

    // Simular progreso visual
    const interval = setInterval(() => setProgress(p => Math.min(p + 10, 85)), 400);

    try {
      const res = await fetch(`${API_URL}/apps/`, { method: 'POST', body: form });
      clearInterval(interval);
      setProgress(100);

      if (res.ok) {
        setExito(true);
        setTimeout(() => navigate('/portfolio'), 2500);
      } else {
        const data = await res.json();
        setError(data.detail || 'Error al subir la aplicación.');
        setProgress(0);
      }
    } catch {
      clearInterval(interval);
      setError('No se pudo conectar con el servidor.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  if (exito) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px', textAlign: 'center' }}>
      <div className="animate-fade-in">
        <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '80px', color: 'var(--success)', marginBottom: '24px' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>¡App subida exitosamente!</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px' }}>
          Tu aplicación está en revisión. Te avisaremos cuando esté activa en el marketplace.
        </p>
        <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '0.9rem' }}>
          Redirigiendo a tu portafolio...
        </p>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Subir Nueva Aplicación</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '36px' }}>
          Comparte tu proyecto y monetiza tu trabajo académico.
        </p>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
            borderRadius: '10px', padding: '14px 18px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444'
          }}>
            <FontAwesomeIcon icon={faExclamationCircle} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card">

          {/* Título */}
          <div className="form-group">
            <label className="form-label">Título del proyecto *</label>
            <input type="text" className="form-control" required
              value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder="ej. Sistema de Gestión Farmacéutica" />
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label className="form-label">Descripción técnica *</label>
            <textarea className="form-control" required rows={4}
              value={descripcion} onChange={e => setDesc(e.target.value)}
              placeholder="Describe qué hace tu software y qué problema resuelve..." />
          </div>

          {/* Categoría + Precio */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Categoría *</label>
              <select className="form-control" required
                value={categoriaId} onChange={e => setCatId(e.target.value)}
                style={{ appearance: 'none' }}>
                <option value="">-- Seleccionar categoría --</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Precio de venta (Bs.) *</label>
              <input type="number" className="form-control" required min="0" step="0.01"
                value={precio} onChange={e => setPrecio(e.target.value)}
                placeholder="ej. 250.00" />
            </div>
          </div>

          {/* Tecnologías con chips */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label">Tecnologías *</label>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '8px',
              border: '1px solid var(--border-color)', borderRadius: '10px',
              padding: '10px 14px', background: 'var(--surface)',
              minHeight: '52px', alignItems: 'center'
            }}>
              {tecnologias.map(t => (
                <span key={t} style={{
                  background: 'rgba(59,130,246,0.15)', color: 'var(--primary)',
                  border: '1px solid rgba(59,130,246,0.3)', borderRadius: '20px',
                  padding: '4px 12px', fontSize: '0.85rem', display: 'flex',
                  alignItems: 'center', gap: '6px'
                }}>
                  {t}
                  <button type="button" onClick={() => removeTech(t)} style={{
                    background: 'none', border: 'none', color: 'inherit',
                    cursor: 'pointer', padding: '0', lineHeight: 1
                  }}>
                    <FontAwesomeIcon icon={faTimes} style={{ fontSize: '0.75rem' }} />
                  </button>
                </span>
              ))}
              <input
                type="text" value={techInput}
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={handleTechKey}
                placeholder={tecnologias.length === 0 ? "Escribe y presiona Enter o coma..." : ""}
                style={{ border: 'none', outline: 'none', background: 'transparent',
                  color: 'var(--text-primary)', flex: 1, minWidth: '150px' }}
              />
            </div>
            {/* Sugerencias */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {TECH_SUGERIDAS.filter(t => !tecnologias.includes(t)).slice(0, 8).map(t => (
                <button key={t} type="button" onClick={() => addTech(t)} style={{
                  background: 'var(--surface-hover)', border: '1px solid var(--border-color)',
                  borderRadius: '16px', padding: '3px 10px', fontSize: '0.78rem',
                  color: 'var(--text-secondary)', cursor: 'pointer'
                }}>
                  <FontAwesomeIcon icon={faPlus} style={{ marginRight: '4px', fontSize: '0.65rem' }} />
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Archivos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '8px' }}>

            {/* ZIP */}
            <label style={{
              border: `2px dashed ${zipFile ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '12px', padding: '28px 20px', textAlign: 'center',
              cursor: 'pointer', display: 'block',
              background: zipFile ? 'rgba(59,130,246,0.05)' : 'transparent',
              transition: 'all 0.2s'
            }}>
              <input type="file" accept=".zip,.rar" onChange={e => setZipFile(e.target.files?.[0] || null)}
                style={{ display: 'none' }} />
              <FontAwesomeIcon icon={faFileCode}
                style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '12px' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>
                {zipFile ? zipFile.name : 'Código fuente (.zip / .rar)'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {zipFile ? `${(zipFile.size / 1024 / 1024).toFixed(2)} MB` : 'Haz clic para seleccionar'}
              </div>
            </label>

            {/* Imágenes */}
            <label style={{
              border: `2px dashed ${imagenes.length > 0 ? '#8b5cf6' : 'var(--border-color)'}`,
              borderRadius: '12px', padding: '28px 20px', textAlign: 'center',
              cursor: 'pointer', display: 'block',
              background: imagenes.length > 0 ? 'rgba(139,92,246,0.05)' : 'transparent',
              transition: 'all 0.2s'
            }}>
              <input type="file" accept="image/png,image/jpeg,image/webp"
                multiple onChange={handleImages} style={{ display: 'none' }} />
              <FontAwesomeIcon icon={faImage}
                style={{ fontSize: '32px', color: '#8b5cf6', marginBottom: '12px' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>
                {imagenes.length > 0 ? `${imagenes.length} imagen(es) seleccionada(s)` : 'Capturas de pantalla'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Hasta 5 imágenes · JPG, PNG, WEBP
              </div>
            </label>
          </div>

          {/* Miniaturas de imágenes seleccionadas */}
          {imagenes.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
              {imagenes.map((img, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img
                    src={URL.createObjectURL(img)} alt={`preview-${i}`}
                    style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  />
                  <button type="button" onClick={() => removeImage(i)} style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    background: '#ef4444', border: 'none', borderRadius: '50%',
                    width: '18px', height: '18px', color: 'white',
                    cursor: 'pointer', fontSize: '0.65rem', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Barra de progreso */}
          {uploading && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Subiendo archivos...</span>
                <span>{progress}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: 'var(--gradient)', borderRadius: '4px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          )}

          {/* Botón publicar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button type="submit" className="btn btn-primary"
              disabled={uploading} style={{ padding: '14px 32px' }}>
              {uploading
                ? <><FontAwesomeIcon icon={faSpinner} spin /> Subiendo...</>
                : <><FontAwesomeIcon icon={faUpload} /> Publicar Aplicación</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadApp;
