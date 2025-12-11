
import '../css/App.css'; // Importa el archivo CSS
import React from 'react';
// 1. Importar useNavigate para la navegación
import { useNavigate } from 'react-router-dom';
// Nota: Deberías importar también el CSS de tu archivo App.css

const Landing = () => {
    // 2. Inicializar el hook de navegación
    const navigate = useNavigate();

    // Función para manejar el clic y redirigir
    const handleNavigation = () => {
        navigate('/register');
    };

    return (
        <div className="codechallenge-page">
            <header className="navbar">
                <div className="logo">
                    <span className="logo-icon">{"<>"}</span> CodeChallenge
                </div>
                <div className="nav-actions">
                    {/* 3. Botón "Iniciar sesión" usa la función de navegación */}
                    <button className="btn-secondary" onClick={handleNavigation}>
                        Iniciar sesión
                    </button>
                    
                    {/* 3. Botón "Registrarse" también usa la función de navegación */}
                    <button className="btn-primary" onClick={handleNavigation}>
                        Registrarse
                    </button>
                </div>
            </header>

            <main>
                <section className="hero-section">
                    <div className="hero-content">
                        <h1>Eleva tus Habilidades de Programación</h1>
                        <p>La plataforma para probar y mejorar tus habilidades con retos diarios y un sistema de ranking competitivo.</p>
                        <div className="hero-actions">
                            {/* Botón "Registrarse Gratis" también usa la función de navegación */}
                            <button className="btn-primary" onClick={handleNavigation}>
                                Registrarse Gratis
                            </button>
                            <button className="btn-text">Ver retos</button>
                        </div>
                    </div>
                    <div className="hero-image">
                        
                    </div>
                </section>

                <section className="benefits-section">
                    <h2>Descubre los Beneficios Clave</h2>
                    <p className="benefits-description">Nuestra plataforma está diseñada para ayudarte a crecer como desarrollador de una manera divertida y efectiva.</p>

                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <div className="benefit-icon">🗓️</div>
                            <h3>Retos Diarios</h3>
                            <p>Enfrentate a nuevos desafíos de codificación todos los días para mantener tus habilidades afiladas.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">📊</div>
                            <h3>Sistema de Ranking</h3>
                            <p>Compite con otros programadores y sube en la clasificación para demostrar tu talento.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">🏆</div>
                            <h3>Gamificación</h3>
                            <p>Gana puntos, insignias y logros a medida que resuelves problemas y alcanzas nuevas metas.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="footer-links">
                    <a href="#">Acerca de</a>
                    <a href="#">Contacto</a>
                    <a href="#">Términos de servicio</a>
                    <a href="#">Política de Privacidad</a>
                </div>
                <div className="social-media">
                    <a href="#">🐦</a>
                    <a href="#">🔗</a>
                    <a href="#">🐙</a>
                </div>
                <p className="copyright">© 2024 CodeChallenge. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default Landing;