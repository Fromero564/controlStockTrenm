
import { useState } from 'react';
import Navbar from "../components/Navbar.jsx";
import { useNavigate } from 'react-router-dom';
import '../assets/styles/register.css';

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/dashboard');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const userData = { username, role, password };

    try {
      
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registro exitoso");

      } else {
        setError(data.message || "Error en el registro");
      }
    } catch (error) {
      setError("Hubo un error al registrar al usuario");
    }
  };

  return (
    <div>
      <Navbar />
      <form onSubmit={handleSubmit} className="register-form">
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

        {error && <div className="error-message">{error}</div>}

          <div className="button-group">
    <button type="submit" className="submit-button">Registrarse</button>
    <button type="button" className="cancel-button" onClick={handleCancel}>Cancelar</button>
  </div>
      </form>
    </div>
  );
};

export default Register;