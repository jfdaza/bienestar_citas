import { useState } from "react";
import {
  User, Mail, LogOut, ChevronDown,
  Settings, HelpCircle, Shield, Edit3, X, Save, Phone
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";

function EditProfileModal({ profile, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '400px', margin: '0 1rem' }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #F3F4F6',
        }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            Editar perfil
          </h3>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '6px',
              color: '#6B7280',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Avatar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '1.5rem' 
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #39A900 0%, #2F8F00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 700,
              position: 'relative',
            }}>
              {formData.full_name.charAt(0).toUpperCase() || "A"}
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}>
                <Edit3 size={12} color="#39A900" />
              </div>
            </div>
          </div>

          {/* Name field */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.5rem',
            }}>
              Nombre completo
            </label>
            <div style={{ position: 'relative' }}>
              <User 
                size={16} 
                color="#9CA3AF" 
                style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)' 
                }} 
              />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#39A900'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          </div>

          {/* Phone field */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.5rem',
            }}>
              Teléfono
            </label>
            <div style={{ position: 'relative' }}>
              <Phone 
                size={16} 
                color="#9CA3AF" 
                style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)' 
                }} 
              />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Opcional"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#39A900'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          </div>

          {/* Read-only fields */}
          <div style={{ 
            padding: '0.75rem', 
            background: '#F9FAFB', 
            borderRadius: '8px',
            marginBottom: '1.5rem',
          }}>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#9CA3AF',
              fontWeight: 500,
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Información de cuenta
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0.35rem 0',
              fontSize: '0.8125rem',
              color: '#6B7280',
            }}>
              <Mail size={14} />
              <span>{profile?.email}</span>
            </div>
            {profile?.document_number && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.35rem 0',
                fontSize: '0.8125rem',
                color: '#6B7280',
              }}>
                <Shield size={14} />
                <span>Doc: {profile.document_number}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              style={{ flex: 1 }}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1 }}
              disabled={isSaving}
            >
              <Save size={16} />
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProfileMenu({ profile, signOut, totalAppointments }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savedProfile, setSavedProfile] = useState(null);

  const displayProfile = savedProfile || profile;
  const userName = displayProfile?.full_name || "Aprendiz";
  const userEmail = displayProfile?.email || "correo@sena.edu.co";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleSaveProfile = async (formData) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      setSavedProfile({ ...displayProfile, ...formData });
      setShowEditModal(false);
      toast.success("Perfil actualizado correctamente");
    } catch (err) {
      toast.error(err.message || "Error al guardar el perfil");
    }
  };

  return (
    <>
      <div style={{ 
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {/* Profile Header */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #39A900 0%, #2F8F00 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 700,
          }}>
            {userInitial}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1rem',
              fontWeight: 600,
              color: '#374151',
            }}>
              {userName}
            </h3>
            <p style={{ 
              margin: '0.25rem 0 0',
              fontSize: '0.8125rem',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}>
              <Mail size={14} />
              {userEmail}
            </p>
          </div>

          <div style={{ 
            color: '#6B7280',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          }}>
            <ChevronDown size={20} />
          </div>
        </div>

        {/* Stats Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          padding: '0 1.5rem 1rem',
        }}>
          <div style={{
            padding: '0.75rem',
            background: '#F0FDF4',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700,
              color: '#39A900',
            }}>
              {totalAppointments || 0}
            </div>
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#6B7280',
              fontWeight: 500,
            }}>
              Total citas
            </div>
          </div>
          <div style={{
            padding: '0.75rem',
            background: '#EFF6FF',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700,
              color: '#3B82F6',
            }}>
              {displayProfile?.role || 'Aprendiz'}
            </div>
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#6B7280',
              fontWeight: 500,
            }}>
              Rol
            </div>
          </div>
        </div>

        {/* Expandable Menu */}
        {isOpen && (
          <div style={{
            borderTop: '1px solid #F3F4F6',
            padding: '0.75rem',
          }}>
            {/* User Info */}
            <div style={{
              padding: '0.75rem 1rem',
              marginBottom: '0.5rem',
            }}>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#9CA3AF',
                fontWeight: 500,
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Información de la cuenta
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.5rem 0',
                fontSize: '0.875rem',
                color: '#374151',
              }}>
                <User size={16} color="#6B7280" />
                <span style={{ fontWeight: 500 }}>{userName}</span>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.5rem 0',
                fontSize: '0.875rem',
                color: '#374151',
              }}>
                <Mail size={16} color="#6B7280" />
                <span>{userEmail}</span>
              </div>

              {displayProfile?.document_number && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem 0',
                  fontSize: '0.875rem',
                  color: '#374151',
                }}>
                  <Shield size={16} color="#6B7280" />
                  <span>Doc: {displayProfile.document_number}</span>
                </div>
              )}
            </div>

            {/* Menu Options */}
            <div style={{ 
              borderTop: '1px solid #F3F4F6',
              paddingTop: '0.5rem',
            }}>
              <button
                onClick={() => setShowEditModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#374151',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <Edit3 size={18} color="#6B7280" />
                Editar perfil
              </button>

              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#374151',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <Settings size={18} color="#6B7280" />
                Configuración
              </button>

              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#374151',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <HelpCircle size={18} color="#6B7280" />
                Ayuda y soporte
              </button>

              <div style={{ 
                borderTop: '1px solid #F3F4F6',
                marginTop: '0.5rem',
                paddingTop: '0.5rem',
              }}>
                <button
                  onClick={signOut}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#EF4444',
                    fontWeight: 500,
                    textAlign: 'left',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={displayProfile}
          onSave={handleSaveProfile}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
