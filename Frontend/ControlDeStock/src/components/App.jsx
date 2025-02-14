// src/App.jsx
import { useState } from 'react';
import Login from './Login';
import Register from './Register';

const App = () => {
  const [isLogin, setIsLogin] = useState(true); 

  const toggleView = () => setIsLogin((prev) => !prev); 

  return (
    <div>
      <h1>{isLogin ? "Iniciar sesión" : "Registrarse"}</h1>
      
      {isLogin ? <Login /> : <Register />}
      
      <button onClick={toggleView}>
        {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
};

export default App;
