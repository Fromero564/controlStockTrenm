import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import "../assets/styles/register.css";

const API_URL = import.meta.env.VITE_API_URL;

// Grupos de permisos
const permissionGroups = [
  {
    group: "Panel principal",
    description: "Acceso a las cards del dashboard",
    permissions: [
      {
        key: "dashboard.production",
        label: "Ver card Producción y stock",
      },
      {
        key: "dashboard.sales",
        label: "Ver card Ventas y pedidos",
      },
      {
        key: "dashboard.admin",
        label: "Ver card Administración y facturación",
      },
    ],
  },
  {
    group: "Producción y stock",
    description: "Sección Operador",
    permissions: [
      { key: "income.view", label: "Ver ingresos" },
      { key: "income.create", label: "Nuevo ingreso" },
      { key: "process.view", label: "Ver procesos productivos" },
      { key: "process.create", label: "Nuevo proceso productivo" },
      { key: "stock.view", label: "Ver stock general" },
      { key: "provider.view", label: "Ver proveedores" },
      { key: "provider.create", label: "Crear proveedores" },
      { key: "provider.edit", label: "Editar proveedores" },
      { key: "provider.delete", label: "Eliminar proveedores" },
      { key: "config.product", label: "Configurar productos" },
    ],
  },
  {
    group: "Ventas y pedidos",
    description: "Panel de ventas",
    permissions: [
      { key: "sales.orders.view", label: "Ver pedidos" },
      { key: "sales.orders.new", label: "Crear pedidos" },
      { key: "sales.finalOrders.view", label: "Ver órdenes de venta" },
      { key: "sales.finalOrders.new", label: "Crear órdenes de venta" },
      { key: "sales.remits.view", label: "Ver remitos" },
      { key: "sales.remits.new", label: "Crear remitos" },
      { key: "sales.clients.view", label: "Ver clientes" },
      { key: "sales.clients.new", label: "Crear clientes" },
      { key: "sales.sellers.view", label: "Ver vendedores" },
      { key: "sales.sellers.new", label: "Crear vendedores" },
      { key: "sales.pricelist.view", label: "Ver listas de precios" },
      { key: "sales.pricelist.new", label: "Crear listas de precios" },
      { key: "sales.routes.new", label: "Crear hoja de ruta" },
      { key: "sales.reports.view", label: "Ver reportes de ventas" },
    ],
  },
  {
    group: "Administración",
    description: "Panel administrativo",
    permissions: [
      { key: "admin.invoices.view", label: "Ver facturas" },
      { key: "admin.invoices.new", label: "Crear facturas" },
      { key: "admin.users.view", label: "Ver usuarios" },
      { key: "admin.users.new", label: "Crear usuarios" },
      { key: "admin.reports.view", label: "Ver reportes administrativos" },
    ],
  },
];

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const togglePermission = (permKey) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey)
        ? prev.filter((p) => p !== permKey)
        : [...prev, permKey]
    );
  };

  const toggleGroup = (groupPermissions, checked) => {
    setSelectedPermissions((prev) => {
      const set = new Set(prev);
      groupPermissions.forEach((p) => {
        if (checked) set.add(p.key);
        else set.delete(p.key);
      });
      return Array.from(set);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!role) {
      setError("Debes seleccionar un rol");
      return;
    }

    const userData = {
      username,
      role,
      password,
      permissions: selectedPermissions, // array de strings
    };

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error en el registro");
        return;
      }

      alert("Usuario registrado correctamente");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Hubo un error al registrar al usuario");
    }
  };

  return (
    <div>
      <Navbar />

      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        <h2>Nuevo usuario</h2>

        <div className="form-group">
          <label className="form-label">Usuario:</label>
          <input
            type="text"
            placeholder="Ingrese su nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Rol:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="form-select"
          >
            <option value="">Seleccione un rol</option>
            <option value="operario">Operario</option>
            <option value="administrativo">Administrativo</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Contraseña:</label>
          <input
            type="password"
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirmar Contraseña:</label>
          <input
            type="password"
            placeholder="Confirme su contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <hr />

        <h3 className="permissions-title">Permisos del usuario</h3>
        <p style={{ fontSize: "0.9rem", marginBottom: "10px" }}>
          Seleccioná qué acciones puede realizar este usuario.
        </p>

        <div className="permissions-container">
          {permissionGroups.map((group) => {
            const allSelected = group.permissions.every((p) =>
              selectedPermissions.includes(p.key)
            );
            const someSelected =
              !allSelected &&
              group.permissions.some((p) =>
                selectedPermissions.includes(p.key)
              );

            return (
              <div className="permission-group" key={group.group}>
                <div className="permission-group-header">
                  <div>
                    <strong>{group.group}</strong>
                    {group.description && (
                      <p className="permission-description">
                        {group.description}
                      </p>
                    )}
                  </div>
                  <label className="permission-check-all">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={(e) =>
                        toggleGroup(group.permissions, e.target.checked)
                      }
                    />
                    <span>Todo el grupo</span>
                  </label>
                </div>

                {/* 👇 FORZAMOS COLUMNA: UN PERMISO DEBAJO DEL OTRO */}
                <div
                  className="permission-group-body"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {group.permissions.map((perm) => (
                    <label
                      className="permission-item"
                      key={perm.key}
                      style={{ display: "block" }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                      />
                      <span style={{ marginLeft: "6px" }}>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button type="submit" className="submit-button">
            Registrarse
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
