import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider.jsx";
import ProviderForm from "./ProviderForm.jsx";

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    return (
        <div>
            {user ? (
                <div>
                    <h1>Bienvenido, {user.name}!</h1>
                    <button onClick={logout}>Cerrar sesión</button>
                </div>
            ) : (
                <h1>No estás logueado</h1>
            )}
            <ProviderForm />
        </div>

    )
}

export default Dashboard;