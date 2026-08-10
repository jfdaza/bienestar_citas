import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../providers/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { supabase, supabaseAdmin } from "../../../lib/supabase";
import { Shield, ArrowLeft, Check } from "lucide-react";
import { useRateLimit, logSecurityEvent } from "../../../hooks/useSecurity";

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: "",
    last_name: "",
    document_type: "",
    document_number: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState("");
  
  // Rate limiting: máximo 3 registros por cada 10 minutos
  const { blocked, remainingTime, checkRateLimit } = useRateLimit(3, 600000);

  const { signUp, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    setFormData({
      full_name: "",
      last_name: "",
      document_type: "",
      document_number: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setValidationError("");
  };

  const checkDuplicates = async () => {
    const db = supabaseAdmin || supabase;
    const checks = [];

    if (formData.email) {
      checks.push(
        db
          .from("profiles")
          .select("id")
          .eq("email", formData.email)
          .limit(1),
      );
    }

    if (formData.document_number) {
      checks.push(
        db
          .from("profiles")
          .select("id")
          .eq("document_number", formData.document_number)
          .limit(1),
      );
    }

    const results = await Promise.all(checks);

    for (const { data, error } of results) {
      if (error) {
        console.error("Error verificando duplicados:", error.message);
        continue;
      }
      if (data && data.length > 0) return true;
    }

    return false;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.full_name || !formData.last_name) {
        setValidationError("Por favor completa tu nombre y apellido");
        return;
      }
      setValidationError("");
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setValidationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Verificar rate limiting
    if (blocked) {
      toast.error(`Demasiados intentos. Espera ${remainingTime} segundos.`, { duration: 5000 });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      setValidationError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setValidationError("La contraseña debe contener al menos una mayúscula");
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setValidationError("La contraseña debe contener al menos un número");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setValidationError("La contraseña debe contener al menos un carácter especial (!@#$%^&*)");
      return;
    }

    // Verificar rate limiting antes de continuar
    const canProceed = checkRateLimit(`register_${formData.email}`);
    if (!canProceed) {
      toast.error("Demasiados intentos de registro. Intenta más tarde.", { duration: 5000 });
      return;
    }

    try {
      const exists = await checkDuplicates();

      if (exists) {
        logSecurityEvent('register_duplicate', { email: formData.email }).catch(() => {});
        toast.error(
          "El correo o número de documento ya están registrados",
          { duration: 4000 },
        );
        clearForm();
        return;
      }

      const result = await signUp(formData.email || `${formData.document_number}@sena.edu.co`, formData.password, {
        full_name: `${formData.full_name} ${formData.last_name}`,
        document_number: formData.document_number,
        document_type: formData.document_type,
      });

      if (result.success) {
        logSecurityEvent('register_success', { email: formData.email }).catch(() => {});
        toast.success("¡Registro exitoso! Ya puedes iniciar sesión.");
        navigate("/login");
      } else {
        logSecurityEvent('register_failed', { email: formData.email, error: result.error }).catch(() => {});
        const msg = result.error || "Error al registrar usuario";
        if (
          msg.includes("429") ||
          msg.includes("rate") ||
          msg.includes("Too Many")
        ) {
          toast.error(
            "Demasiados intentos. Espera 3 minutos e intenta de nuevo.",
            { duration: 6000 },
          );
        } else {
          toast.error(msg);
        }
      }
    } catch (err) {
      console.error("Error en registro:", err);
      toast.error("Error inesperado: " + (err.message || "Inténtalo de nuevo"));
    }
  };

  const errorMessage = validationError || authError;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="20" r="12" fill="#39A900"/>
            <path d="M50 35 L30 65 L40 65 L40 85 L60 85 L60 65 L70 65 Z" fill="#39A900"/>
            <path d="M25 55 L35 45 M75 55 L65 45" stroke="#39A900" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <h1 className="auth-logo-text">
            Bienestar <span>SENA</span>
          </h1>
          <p className="auth-progress-text">Paso {step} de 2</p>
        </div>

        <div className="auth-progress">
          <div className="auth-progress-bar">
            <div className="auth-progress-fill" style={{ width: `${(step / 2) * 100}%` }} />
          </div>
        </div>

        <div className="auth-card">
          {step === 1 && (
            <>
              <h1>Completemos tus datos</h1>
              <p className="auth-subtitle">
                Necesitamos esta información para agendar tus citas y brindarte un mejor servicio.
              </p>

              {errorMessage && <div className="auth-error">{errorMessage}</div>}

              <div className="auth-form">
                <div className="field">
                  <label htmlFor="reg-name">Nombre</label>
                  <input
                    id="reg-name"
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Ingresa tu nombre"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="reg-lastname">Apellido</label>
                  <input
                    id="reg-lastname"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Ingresa tu apellido"
                    required
                  />
                </div>

                <div className="auth-privacy">
                  <Shield size={20} />
                  <p>
                    <strong>Tu información está protegida</strong>
                    Usamos tus datos únicamente para gestionar tus citas y mejorar tu experiencia en Bienestar SENA.
                  </p>
                </div>

                <button type="button" className="btn-primary" onClick={handleNext}>
                  Continuar
                </button>

                <p className="auth-terms">
                  No compartiremos tu información con terceros.
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1>Últimos datos para continuar</h1>
              <p className="auth-subtitle">
                Con esta información podremos identificarte y agendar tus citas sin inconvenientes.
              </p>

              {errorMessage && <div className="auth-error">{errorMessage}</div>}

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="reg-doctype">Tipo de documento</label>
                  <select
                    id="reg-doctype"
                    name="document_type"
                    value={formData.document_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona el tipo de documento</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PA">Pasaporte</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="reg-document">Número de documento</label>
                  <input
                    id="reg-document"
                    type="text"
                    name="document_number"
                    value={formData.document_number}
                    onChange={handleChange}
                    placeholder="Ingresa tu número de documento"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="reg-email">Correo electronico</label>
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tucorreo@ejemplo.com"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="reg-password">Contrasena</label>
                  <input
                    id="reg-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 especial"
                    required
                    minLength={8}
                  />
                </div>

                <div className="field">
                  <label htmlFor="reg-confirm-password">Confirmar contrasena</label>
                  <input
                    id="reg-confirm-password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repite tu contrasena"
                    required
                  />
                </div>

                <div className="auth-privacy">
                  <Shield size={20} />
                  <p>
                    <strong>Tu información está protegida</strong>
                    Usamos tus datos únicamente para gestionar tus citas y mejorar tu experiencia en Bienestar SENA.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button type="submit" className="btn-primary">
                    Registrarse
                  </button>
                  <button type="button" className="btn-secondary" onClick={handleBack}>
                    <ArrowLeft size={16} />
                    Atrás
                  </button>
                </div>

                <p className="auth-terms">
                  No compartiremos tu información con terceros.
                </p>
              </form>
            </>
          )}
        </div>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="auth-link">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
