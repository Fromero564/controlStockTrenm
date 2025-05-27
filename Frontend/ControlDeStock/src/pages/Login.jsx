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

    
    const res = await fetch( `${API_URL}/login`, {
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
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="toggle-password-icon"
            onClick={() => setShowPassword((prev) => !prev)}
          />
        </div>
        <button type="submit" className="submit-button">INGRESAR</button>
      </form>
    </div>
  );
};

export default Login;