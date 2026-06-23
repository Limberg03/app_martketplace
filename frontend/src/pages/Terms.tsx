import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScaleBalanced, faFileContract, faCopyright, faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons';

const Terms: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#e2e8f0' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem', color: '#38bdf8' }}>
        Términos y Condiciones (Aspectos Legales)
      </h1>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', borderBottom: '2px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faScaleBalanced} style={{ color: '#ef4444', marginRight: '8px' }} /> 1. Introducción
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1' }}>
          El presente documento establece las condiciones legales que rigen el uso del Marketplace <strong>NexusApp (AppSwap)</strong>, desarrollado para la comunidad de la <strong>Universidad Autónoma Gabriel René Moreno (U.A.G.R.M.)</strong>. Al acceder o utilizar nuestra plataforma para la compra o venta de código fuente, aceptas estar legalmente sujeto a estos términos.
        </p>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', borderBottom: '2px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faCopyright} style={{ color: '#3b82f6', marginRight: '8px' }} /> 2. Propiedad Intelectual y Licencias
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1', marginBottom: '1rem' }}>
          Todas las aplicaciones y fragmentos de código fuente vendidos a través de esta plataforma son propiedad intelectual de sus respectivos desarrolladores (estudiantes o egresados).
        </p>
        <ul style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1', paddingLeft: '1.5rem' }}>
          <li><strong>Para Vendedores:</strong> Al subir tu código, garantizas que eres el autor original o posees los derechos necesarios para distribuirlo. Queda estrictamente prohibida la venta de proyectos plagiados o sujetos a licencias restrictivas de terceros que impidan su comercialización.</li>
          <li><strong>Para Compradores:</strong> Salvo que el vendedor especifique lo contrario, adquieres una licencia de <em>uso, modificación y estudio</em> del código. No se otorga el derecho de revender el código exacto en este u otros marketplaces sin modificaciones sustanciales.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', borderBottom: '2px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faMoneyCheckDollar} style={{ color: '#10b981', marginRight: '8px' }} /> 3. Transacciones y Pagos
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1' }}>
          Las transacciones económicas son procesadas de forma segura a través de pasarelas de pago certificadas (ej. Stripe). NexusApp retiene un porcentaje de comisión administrativa sobre cada venta para el mantenimiento de la infraestructura en la nube (AWS) y el motor de IA (Groq). No nos hacemos responsables de acuerdos monetarios realizados fuera de la plataforma.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', borderBottom: '2px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faFileContract} style={{ color: '#f59e0b', marginRight: '8px' }} /> 4. Responsabilidades
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1' }}>
          La Universidad y los administradores de NexusApp no asumen responsabilidad civil ni penal por defectos de software, vulnerabilidades, o daños derivados del uso del código comprado. El "Sello Grado A" emitido por nuestra IA es una evaluación automatizada de buenas prácticas, pero no constituye una garantía legal inquebrantable de funcionamiento sin fallos.
        </p>
      </section>
    </div>
  );
};

export default Terms;
