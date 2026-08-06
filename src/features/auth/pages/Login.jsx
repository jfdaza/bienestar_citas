import { useState } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Leaf } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn(email, password);
    if (result.success) {
      navigate("/app");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="20" r="12" fill="#39A900"/>
            <path d="M50 35 L30 65 L40 65 L40 85 L60 85 L60 65 L70 65 Z" fill="#39A900"/>
            <path d="M25 55 L35 45 M75 55 L65 45" stroke="#39A900" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <h1 className="auth-logo-text">
            Bienvenido a Bienestar <span>SENA</span>
          </h1>
          <p className="auth-subtitle">
            Gestiona tus citas de bienestar de forma fácil, rápida y segura.
          </p>
        </div>

        <div className="auth-card">
          <h1>Inicia sesión para continuar</h1>
          <p className="auth-subtitle">
            Utilizamos proveedores seguros para proteger tu información.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.email@soy.sena.edu.co"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              Iniciar Sesión
            </button>
          </form>

          <div className="auth-privacy">
            <Shield size={20} />
            <p>
              <strong>Seguro y confiable</strong>
              Tu información está protegida y solo se utiliza para mejorar tu experiencia en Bienestar SENA.
            </p>
          </div>

          <p className="auth-footer">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="auth-link">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <p className="auth-terms">
          Al continuar, aceptas nuestros{" "}
          <a href="#">Términos de uso</a> y{" "}
          <a href="#">Política de privacidad</a>.
        </p>

        <div className="auth-info-box">
          <Leaf size={20} />
          <p>Sistema diseñado para el bienestar de la comunidad SENA.</p>
        </div>
      </div>
    </div>
  );
}
