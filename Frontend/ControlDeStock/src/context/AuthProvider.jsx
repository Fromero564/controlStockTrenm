import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRol, setUserRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (res.status === 401 || res.status === 403) {
        logout();
      } else {
        const data = await res.json();
        
        const username = data.username || data.user?.user;
        const rol = data.rol || data.user?.rol;
  
        if (username && rol) {
          setUser({ name: username });
          setUserRol(rol);
        } else {
          logout();
        }
      }
    } catch (error) {
      logout();
      console.log("Error en Auth", error);
    } finally {
      setLoading(false);
    }
  };
  const login = (username, token, rol) => {
    localStorage.setItem("token", token);
    setUser({ name: username });
    setUserRol(rol);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setUserRol(null);
  };

  return (
    <AuthContext.Provider value={{ user, userRol, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
