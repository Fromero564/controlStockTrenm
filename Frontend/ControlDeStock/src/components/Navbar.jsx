import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faHouse } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/navbar.css";


const Navbar = () => {
    const { userlogout, logout, user } = useContext(AuthContext);

    return (
        <div className="navbar">
            <a href="/dashboard" className="navbar-inicio">
                <FontAwesomeIcon icon={faHouse} />
            </a>

            <div className="navbar-options">
                <a href="/registro">Nuevo Usuario</a>
                <a href="#">Configuración</a>
                <a href="#" onClick={logout}>
                    <p>{user?.name || "Usuario"}</p>
                    <FontAwesomeIcon icon={faSignOutAlt} />
                </a>
            </div>
        </div>
    )
}


export default Navbar;