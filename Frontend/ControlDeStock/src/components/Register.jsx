// src/components/Register.jsx
import { useState } from 'react';

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const userData = { username, password };

    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registro exitoso");
        // Aquí podrías redirigir al usuario a la página de login o a su perfil
      } else {
        setError(data.message || "Error en el registro");
      }
    } catch (error) {
      setError("Hubo un error al registrar al usuario");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Usuario:</label>
        <input
          type="text"
          placeholder="Ingrese su nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Contraseña:</label>
        <input
          type="password"
          placeholder="Ingrese su contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Confirmar Contraseña:</label>
        <input
          type="password"
          placeholder="Confirme su contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button type="submit">Registrarse</button>
    </form>
  );
};

export default Register;
