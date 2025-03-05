import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import "./styles/login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    const data = await res.json();
    if (res.ok) {
      const { token, rol } = data;
      login(username, token, rol);
      alert("Usuario Loggeado correctamente");
      navigate("/dashboard");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="form-container">
        <h2 className="form-title">INICIO DE SESIÓN</h2>
        <label className="label">USUARIO</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="input"
        />
        <label className="label">CONTRASEÑA</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
        />
        <button type="submit" className="submit-button">INGRESAR</button>
      </form>
    </div>
  );
};

export default Login;