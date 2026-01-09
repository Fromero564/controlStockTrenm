import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);      // { name: '...' }
  const [userRol, setUserRol] = useState(null); // 'admin' | 'operario' | ...
  const [permissions, setPermissions] = useState([]); // ['income.view', ...]
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyToken = async (token) => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        // Token inválido o expirado
        logout();
        return;
      }

      const data = await res.json();

      const username = data.username || data.user?.user;
      const rol = data.rol || data.user?.rol;
      const permsFromApi =
        data.permissions || data.user?.permissions || [];

      if (username && rol) {
        setUser({ name: username });
        setUserRol(rol);
        setPermissions(
          Array.isArray(permsFromApi) ? permsFromApi : []
        );
      } else {
        logout();
      }
    } catch (error) {
      console.error("Error verificando token:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // login que se llama desde Login.jsx
  const login = (username, token, rol, perms = []) => {
    localStorage.setItem("token", token);
    setUser({ name: username });
    setUserRol(rol);
    setPermissions(Array.isArray(perms) ? perms : []);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setUserRol(null);
    setPermissions([]);
  };

  // helper para permisos finos
  const can = (perm) => permissions.includes(perm);

  return (
    <AuthContext.Provider
      value={{
        user,
        userRol,
        permissions,
        can,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
