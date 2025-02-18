import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const res = await fetch("http://localhost:3000/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        await refreshToken();
      } else {
        const data = await res.json();
        if (data.username) {
          setUser({ name: data.username });
        } else {
          logout();
        }
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const res = await fetch("http://localhost:3000/refresh", {
        method: "GET",
      });

      if (!res.ok) throw new Error("No se pudo refrescar el token");

      const data = await res.json();
      localStorage.setItem("token", data.accessToken);
      await verifyToken(data.accessToken);
    } catch (error) {
      logout();
    }
  };

  const login = (username, token) => {
    localStorage.setItem("token", token);
    setUser({ name: username });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
