import { useEffect, useState, useRef } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { supabaseAdmin } from "../../../lib/supabase";
import {
  Search,
  UserPlus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";

const ROLES = [
  { id: 1, name: "SUPERADMIN", label: "SuperAdmin" },
  { id: 2, name: "COORDINACION", label: "Coordinación" },
  { id: 3, name: "PSICOLOGIA", label: "Psicología" },
  { id: 4, name: "ENFERMERIA", label: "Enfermería" },
  { id: 5, name: "TRABAJO_SOCIAL", label: "Trabajo Social" },
  { id: 6, name: "APRENDIZ", label: "Aprendiz" },
];

export function UserManagement() {
  const { users, pagination, loading, fetchUsers, updateUserRole, deleteUser } = useAdmin();
  const [filters, setFilters] = useState({ search: "", role: "", page: 1 });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [dependencies, setDependencies] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchUsers(filters);
  }, [filters, fetchUsers]);

  useEffect(() => {
    const loadDeps = async () => {
      const { data } = await supabaseAdmin
        .from("dependencies")
        .select("id, name")
        .order("name");
      if (data) setDependencies(data);
    };
    loadDeps();
  }, []);

  const toggleUserStatus = (user) => {
    updateUserRole(user.id, {
      roleId: user.role_id,
      dependencyId: user.dependency_id,
      isActive: !user.is_active,
    });
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || "",
      document_number: user.document_number || "",
      role_id: user.role_id || 6,
      dependency_id: user.dependency_id || "",
      is_active: user.is_active ?? true,
    });
  };

  const closeEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await updateUserRole(editingUser.id, {
        roleId: editForm.role_id,
        dependencyId: editForm.dependency_id || null,
        isActive: editForm.is_active,
      });

      if (
        editForm.full_name !== editingUser.full_name ||
        editForm.document_number !== editingUser.document_number
      ) {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            full_name: editForm.full_name,
            document_number: editForm.document_number,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingUser.id);

        if (error) throw error;
      }

      closeEdit();
      await fetchUsers(filters);
    } catch (err) {
      console.error("Error guardando:", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters((f) => ({ ...f, page: newPage }));
  };

  const handleSearchChange = (value) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value, page: 1 }));
    }, 300);
  };

  return (
    <div className="admin-section">
      <header className="section-header">
        <h2>Gestión de Usuarios</h2>
      </header>
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <select
          value={filters.role}
          onChange={(e) =>
            setFilters((f) => ({ ...f, role: e.target.value, page: 1 }))
          }
        >
          <option value="">Todos los roles</option>
          {ROLES.map((r) => (
            <option key={r.id} value={r.name}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Dependencia</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="text-center">
                Cargando...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No se encontraron usuarios
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id} className={!u.is_active ? "inactive" : ""}>
                <td>
                  <div className="user-cell">
                    <div className="avatar">{u.full_name?.[0]}</div>
                    <div>
                      <div className="name">{u.full_name}</div>
                      <div className="email">
                        {u.email || u.document_number}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`role-badge ${u.roles?.name?.toLowerCase()}`}
                  >
                    {u.roles?.name}
                  </span>
                </td>
                <td>{u.dependencies?.name || "-"}</td>
                <td>
                  <button
                    onClick={() => toggleUserStatus(u)}
                    className={`status-toggle ${u.is_active ? "active" : "inactive"}`}
                  >
                    {u.is_active ? (
                      <CheckCircle size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    {u.is_active ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td>
                  <button
                    className="btn-icon"
                    onClick={() => openEdit(u)}
                    title="Editar usuario"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => setDeletingUser(u)}
                    title="Eliminar usuario"
                    style={{ color: '#DC2626' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="pagination">
        <span>Total: {pagination.total}</span>
        <div className="page-controls">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={pagination.page === i + 1 ? "active" : ""}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {editingUser && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Usuario</h3>
              <button className="modal-close" onClick={closeEdit}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="field">
                <label>Nombre completo</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) =>
                    handleEditChange("full_name", e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Número de documento</label>
                <input
                  type="text"
                  value={editForm.document_number}
                  onChange={(e) =>
                    handleEditChange("document_number", e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Rol</label>
                <select
                  value={editForm.role_id}
                  onChange={(e) =>
                    handleEditChange("role_id", Number(e.target.value))
                  }
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Dependencia</label>
                <select
                  value={editForm.dependency_id}
                  onChange={(e) =>
                    handleEditChange(
                      "dependency_id",
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                >
                  <option value="">Sin dependencia</option>
                  {dependencies.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Estado</label>
                <select
                  value={editForm.is_active ? "true" : "false"}
                  onChange={(e) =>
                    handleEditChange("is_active", e.target.value === "true")
                  }
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeEdit}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={saveEdit}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="modal-overlay" onClick={() => setDeletingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar Usuario</h3>
              <button className="modal-close" onClick={() => setDeletingUser(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: '1rem' }}>
                ¿Estás seguro de que deseas eliminar al usuario{' '}
                <strong>{deletingUser.full_name}</strong>?
              </p>
              <p style={{ color: '#DC2626', fontSize: '0.875rem' }}>
                Esta acción eliminará el usuario de la página y de la base de datos de Supabase permanentemente. No se puede deshacer.
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingUser(null)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                style={{ background: '#DC2626' }}
                onClick={async () => {
                  setDeleting(true);
                  await deleteUser(deletingUser.id);
                  setDeleting(false);
                  setDeletingUser(null);
                }}
                disabled={deleting}
              >
                {deleting ? "Eliminando..." : "Eliminar usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
