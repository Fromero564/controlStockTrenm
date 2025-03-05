import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { user, userRol, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div>
            <div>
                <h1>Bienvenido, {user?.name || "Usuario"}!</h1>
                <p>Rol: {userRol ? userRol : "Cargando..."}</p>
                <button onClick={logout}>Cerrar sesión</button>
                <button >Configuracion</button>
            </div>
            <div>

                <button onClick={()=>navigate("/administrative-panel")}>Administrativo</button>
            </div>
            <div>

                <button onClick={() => navigate("/operator-panel")}>Operario</button>
            </div>
        </div>
    );
};

export default Dashboard;
