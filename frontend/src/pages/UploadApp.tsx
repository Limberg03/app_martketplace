import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFileCode, faImage, faTags, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UploadApp: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [tecnologia, setTecnologia] = useState('');
  
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Debes iniciar sesión");
      return;
    }
    if (!zipFile) {
      alert("Debes subir el código fuente (.zip o .rar)");
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('descripcion', descripcion);
      formData.append('tecnologia', tecnologia);
      formData.append('precio_venta', precio);
      formData.append('vendedor_id', user.id.toString());
      formData.append('codigo_zip', zipFile);
      
      if (imageFiles) {
        for (let i = 0; i < imageFiles.length; i++) {
          formData.append('imagenes', imageFiles[i]);
        }
      }

      const response = await fetch('http://127.0.0.1:8000/api/apps/', {
        method: 'POST',
        body: formData, // fetch automáticamente pone el boundary multipart/form-data
      });

      if (response.ok) {
        alert('¡Aplicación subida exitosamente! Pasará a revisión.');
        navigate('/portfolio');
      } else {
        const errorData = await response.json();
        alert('Error al subir: ' + (errorData.detail || 'Error desconocido'));
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Subir Nueva Aplicación</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Comparte tu proyecto de Taller de Grado y permítele a la IA sugerir un precio y documentarlo automáticamente.</p>

        <form onSubmit={handleSubmit} className="glass-card">
          <div className="form-group">
            <label className="form-label">Título del Proyecto</label>
            <input type="text" className="form-control" value={titulo} onChange={e => setTitulo(e.target.value)} required placeholder="ej. Sistema de Gestión Farmacéutica" />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción Técnica</label>
            <textarea className="form-control" value={descripcion} onChange={e => setDescripcion(e.target.value)} required rows={4} placeholder="Describe qué hace tu software y qué problema resuelve..."></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-group">
              <label className="form-label">Tecnologías (Lenguajes/Frameworks)</label>
              <div style={{ position: 'relative' }}>
                <FontAwesomeIcon icon={faTags} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input type="text" className="form-control" value={tecnologia} onChange={e => setTecnologia(e.target.value)} required style={{ paddingLeft: '44px' }} placeholder="React, Node, PostgreSQL" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Precio de Venta ($)</label>
              <input type="number" className="form-control" value={precio} onChange={e => setPrecio(e.target.value)} required placeholder="ej. 150.00" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
            <label style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', display: 'block', background: zipFile ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
              <input type="file" accept=".zip,.rar" onChange={e => setZipFile(e.target.files?.[0] || null)} style={{ display: 'none' }} required />
              <FontAwesomeIcon icon={faFileCode} style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '16px' }} />
              <h4 style={{ marginBottom: '8px' }}>{zipFile ? zipFile.name : 'Subir Código Fuente (.zip)'}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>La IA auditará la calidad de tu código.</p>
            </label>
            
            <label style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', display: 'block', background: imageFiles && imageFiles.length > 0 ? 'rgba(139, 92, 246, 0.05)' : 'transparent' }}>
              <input type="file" accept="image/png, image/jpeg" multiple onChange={e => setImageFiles(e.target.files)} style={{ display: 'none' }} required />
              <FontAwesomeIcon icon={faImage} style={{ fontSize: '32px', color: 'var(--accent)', marginBottom: '16px' }} />
              <h4 style={{ marginBottom: '8px' }}>{imageFiles && imageFiles.length > 0 ? `${imageFiles.length} imagen(es) seleccionada(s)` : 'Subir Capturas de Pantalla'}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Muestra la interfaz de tu software.</p>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '14px 32px' }} disabled={isUploading}>
              <FontAwesomeIcon icon={isUploading ? faSpinner : faUpload} spin={isUploading} /> 
              {isUploading ? ' Subiendo...' : ' Iniciar Análisis y Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadApp;
