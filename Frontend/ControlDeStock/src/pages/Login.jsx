import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const { user, loading, login } = useContext(AuthContext);
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/login`, {
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
    <div className="loginv2-container">
      <form onSubmit={handleSubmit} className="loginv2-form">
        <h2 className="loginv2-title">INICIO DE SESIÓN</h2>

        <label className="loginv2-label">USUARIO</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="loginv2-input"
        />

        <label className="loginv2-label">CONTRASEÑA</label>
        <div className="loginv2-password-wrap">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="loginv2-input loginv2-input--password"
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="loginv2-password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
          />
        </div>

        <button type="submit" className="loginv2-submit">INGRESAR</button>
      </form>
    </div>
  );
};

export default Login;
