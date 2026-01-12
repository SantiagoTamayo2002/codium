import '../css/App.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroCodium from '../css/img/hero-codium.png';

const Landing = () => {
  const navigate = useNavigate();

  const goToRegister = () => navigate('/register');
  const goToLogin = () => navigate('/login');

  return (
    <div className="landing-container">

      {/* ===== NAVBAR ===== */}
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">&lt;/&gt;</span>
          <span className="logo-text">Codium</span>
        </div>

       
          <div className="hero-buttons">
  <button className="btn-primary" onClick={goToRegister}>
    Iniciar Sesión
  </button>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <main>
        <section className="hero">
          <div className="hero-text">
            <h1>
              Domina la Programación <br />
              <span>Retos Reales. Ranking Global.</span>
            </h1>

            <p>
              Codium es la plataforma donde desarrolladores ponen a prueba
              sus habilidades con retos diarios, gamificación y competencias reales.
            </p>

           
          </div>

          {/* 
            👉 IMAGEN PRINCIPAL (Hero Image)
            Aquí va:
            - Mockup de la plataforma
            - Dashboard con ranking
            - Código en pantalla
            Ejemplo:
            <img src="/images/hero-codium.png" alt="Plataforma Codium" />
          */}
          <div className="hero-image">
  <img src={heroCodium} alt="Plataforma Codium" />
</div>

        </section>

        {/* ===== BENEFICIOS ===== */}
        <section className="features">
          <h2>¿Por qué elegir Codium?</h2>
          <p className="section-subtitle">
            Diseñado por y para desarrolladores que buscan crecer profesionalmente.
          </p>

          <div className="features-grid">

            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Retos Inteligentes</h3>
              <p>
                Problemas reales de lógica, algoritmos y desarrollo backend/frontend.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Ranking Competitivo</h3>
              <p>
                Compite con otros programadores y demuestra tu nivel técnico.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏅</div>
              <h3>Gamificación</h3>
              <p>
                Insignias, logros y recompensas que impulsan tu aprendizaje.
              </p>
            </div>

          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-links">
          <a href="#">Acerca de</a>
          <a href="#">Contacto</a>
          <a href="#">Términos</a>
          <a href="#">Privacidad</a>
        </div>

        <div className="social-icons">
          {/* 
            👉 ICONOS REDES
            Puedes usar:
            - SVG
            - FontAwesome
            - React Icons
          */}
          <a href="#">🐦</a>
          <a href="#">💼</a>
          <a href="#">🐙</a>
        </div>

        <p className="copyright">
          © 2024 Codium. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
