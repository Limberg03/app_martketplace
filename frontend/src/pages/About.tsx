import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faEye, faStar } from '@fortawesome/free-solid-svg-icons';

const About: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#e2e8f0' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem', color: '#38bdf8' }}>
        Acerca de NexusApp U.A.G.R.M.
      </h1>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', borderBottom: '2px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faBullseye} style={{ color: '#ef4444', marginRight: '8px' }} /> Nuestra Misión
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1' }}>
          Desarrollar una plataforma digital innovadora, segura y confiable que potencie el emprendimiento tecnológico dentro de la <strong>Universidad Autónoma Gabriel René Moreno (U.A.G.R.M.)</strong>. 
          A través del uso de tecnología moderna como Machine Learning, arquitecturas web escalables y mecanismos de pago automatizados, nos comprometemos a ofrecer un espacio donde estudiantes y docentes puedan publicar, descubrir y comercializar aplicaciones académicas de manera transparente y eficiente.
        </p>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', borderBottom: '2px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faEye} style={{ color: '#3b82f6', marginRight: '8px' }} /> Nuestra Visión
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1' }}>
          Ser la plataforma líder de emprendimiento digital académico dentro de la <strong>Universidad Autónoma Gabriel René Moreno (U.A.G.R.M.)</strong> y a futuro, en otras instituciones de educación superior del país y la región. Buscamos ser un referente en la integración de tecnología, innovación y educación, promoviendo un ecosistema donde el talento universitario se transforma en soluciones tecnológicas útiles, seguras y de alto valor.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', borderBottom: '2px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faStar} style={{ color: '#f59e0b', marginRight: '8px' }} /> Nuestros Valores
        </h2>
        <ul style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#38bdf8' }}>Compromiso con la Universidad:</strong> Comprendemos las necesidades tecnológicas y académicas de la U.A.G.R.M. y de sus distintas facultades, por lo que trabajamos para ofrecer una solución que promueva la excelencia educativa, la innovación digital y el emprendimiento estudiantil mediante el uso responsable y eficiente de la tecnología.
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#38bdf8' }}>Calidad Técnica y Funcional:</strong> Buscamos la excelencia en cada componente del sistema, garantizando que AppSwap cumpla con los más altos estándares de seguridad, rendimiento, escalabilidad y usabilidad.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default About;
