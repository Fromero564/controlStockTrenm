import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRol, setUserRol] = useState(null);
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
          setUserRol(data.rol);
        } else if (data.user) {
          // Si la respuesta tiene `user`, viene de /profile
          setUser({ name: data.user.user });
          setUserRol(data.user.rol);
        } else {
          // logout();
          console.log("Error en refresh")
        }
      }
    } catch (error) {
      // logout();
      console.log("Error en Auth")
    } finally {
      setLoading(false);
    }
  };

  const login = (username, token, rol) => {
    localStorage.setItem("token", token);
    setUser({ name: username });
    setUserRol(rol);
  };

  // const logout = () => {
  //   localStorage.removeItem("token");
  //   setUser(null);
  //   setUserRol(null); 
  // };

  return (
    <AuthContext.Provider value={{ user, userRol, login, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
