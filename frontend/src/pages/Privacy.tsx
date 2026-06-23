import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faUserLock, faDatabase, faMicrochip } from '@fortawesome/free-solid-svg-icons';

const Privacy: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#e2e8f0' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem', color: '#38bdf8' }}>
        Políticas de Privacidad y Seguridad
      </h1>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', borderBottom: '2px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faShieldHalved} style={{ color: '#059669', marginRight: '8px' }} /> 1. Políticas de Calidad
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1' }}>
          En <strong>NexusApp U.A.G.R.M.</strong> estamos comprometidos con la calidad del software. Implementamos un riguroso Plan de Aseguramiento de Calidad (SQAP) que evalúa automáticamente el código fuente subido mediante algoritmos de Inteligencia Artificial (LLMs). Las aplicaciones que demuestran arquitectura sólida, seguridad y buenas prácticas reciben el <strong>Sello Grado A</strong>, destacándose en nuestra plataforma.
        </p>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', borderBottom: '2px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faUserLock} style={{ color: '#3b82f6', marginRight: '8px' }} /> 2. Privacidad de la Información
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1' }}>
          Tus datos personales (nombre, correo electrónico, credenciales institucionales) son almacenados utilizando algoritmos de encriptación seguros. NexusApp no venderá, alquilará ni compartirá tu información personal con terceros para fines publicitarios.
        </p>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', borderBottom: '2px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faDatabase} style={{ color: '#ef4444', marginRight: '8px' }} /> 3. Tratamiento del Código Fuente
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1', marginBottom: '1rem' }}>
          Entendemos que el código fuente subido a la plataforma (archivos ZIP) es el activo más valioso de los vendedores. 
        </p>
        <ul style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1', paddingLeft: '1.5rem' }}>
          <li>El código se almacena en repositorios seguros protegidos. Solo los usuarios que han completado el pago tienen acceso de descarga al archivo original.</li>
          <li>Los extractos de código son analizados vectorialmente (ChromaDB) de forma aislada e indexada únicamente para mejorar la Búsqueda Semántica de la plataforma, sin exponer el núcleo del algoritmo públicamente.</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', borderBottom: '2px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faMicrochip} style={{ color: '#8b5cf6', marginRight: '8px' }} /> 4. Privacidad e Inteligencia Artificial
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1' }}>
          Las interacciones que realizas con el Asistente de IA (búsquedas por voz, recomendaciones o el Chatbot RAG) se procesan temporalmente para brindarte respuestas exactas. Los modelos lingüísticos no retienen tu historial de chat para entrenar redes neuronales globales, garantizando que tus dudas o ideas de emprendimiento queden confidenciales en el servidor local.
        </p>
      </section>
    </div>
  );
};

export default Privacy;
