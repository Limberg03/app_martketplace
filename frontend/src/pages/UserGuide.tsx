import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';

const UserGuide: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto', color: '#e2e8f0' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem', color: '#38bdf8' }}>
        <FontAwesomeIcon icon={faBookOpen} style={{ marginRight: '12px' }} /> Guía de Usuarios (NexusApp Marketplace)
      </h1>

      <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <h2 style={{ color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          1. ¿Cómo registrarse en la plataforma?
        </h2>
        <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
          Para comenzar a explorar o vender, necesitas una cuenta. Dirígete a la parte superior derecha de la pantalla y haz clic en <strong>Sign Up</strong>. 
          Deberás elegir si quieres ser un <strong>Comprador</strong> (para adquirir apps) o un <strong>Vendedor</strong> (para publicar tus propios proyectos). 
          Rellena tus datos y estarás listo para comenzar.
        </p>
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <h2 style={{ color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          2. ¿Cómo comprar usando Códigos QR?
        </h2>
        <ol style={{ lineHeight: '1.6', color: '#cbd5e1', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Navega por el catálogo y selecciona la aplicación que deseas.</li>
          <li style={{ marginBottom: '0.5rem' }}>Haz clic en el botón verde <strong>"Comprar con QR"</strong>.</li>
          <li style={{ marginBottom: '0.5rem' }}>Aparecerá un código QR en tu pantalla. Abre tu aplicación bancaria móvil favorita (Ej: Banco Unión, BNB, Fassil, etc.) y escanea el código.</li>
          <li style={{ marginBottom: '0.5rem' }}>Confirma el monto. La plataforma detectará automáticamente tu pago en unos segundos mediante el Webhook de Stripe.</li>
          <li style={{ marginBottom: '0.5rem' }}>¡Listo! La aplicación aparecerá inmediatamente en tu sección de <strong>Mis Compras</strong>.</li>
        </ol>
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <h2 style={{ color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          3. ¿Cómo publicar una Aplicación? (Para Vendedores)
        </h2>
        <p style={{ lineHeight: '1.6', color: '#cbd5e1', marginBottom: '1rem' }}>
          Si te registraste como vendedor, tienes acceso al botón <strong>"Subir App"</strong> en el menú superior. 
        </p>
        <ul style={{ lineHeight: '1.6', color: '#cbd5e1', paddingLeft: '1.5rem' }}>
          <li>Sube un archivo ZIP con el código fuente (Max 50MB).</li>
          <li>La Inteligencia Artificial leerá tu código automáticamente para extraer el nombre, las tecnologías usadas y generar un manual de instalación.</li>
          <li>Podrás revisar la sugerencia de precio que te da la IA en base al mercado, ajustarlo si deseas, y finalmente publicar la app.</li>
        </ul>
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <h2 style={{ color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          4. Progressive Web App (PWA)
        </h2>
        <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
          No necesitas descargar nuestra app de la PlayStore. Al entrar desde tu navegador móvil (Chrome o Safari), te aparecerá una opción que dice <strong>"Añadir a la pantalla de inicio"</strong>. Haz clic allí y la plataforma se instalará en tu celular como una aplicación nativa, lo que te permitirá recibir Notificaciones Push de tus ventas y navegar incluso sin conexión a internet.
        </p>
      </div>
    </div>
  );
};

export default UserGuide;
