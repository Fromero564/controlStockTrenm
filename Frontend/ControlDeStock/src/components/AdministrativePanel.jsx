import { useContext} from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt} from "@fortawesome/free-solid-svg-icons";


const AdministrativePanel = () => {
   const { user, userRol, logout } = useContext(AuthContext);
   const navigate = useNavigate();
   return (
      <div>
          <div className="navbar">
                <a href="/dashboard" className="navbar-inicio">INICIO</a>
                <div className="navbar-options">
                    <a href="#">Configuración</a>
                    <a href="#" onClick={logout}>
                        <p>{user?.name || "Usuario"}</p>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                    </a>
                </div>
            </div>
         <h2>Panel Administrativo</h2>

         <button onClick={() => navigate("/provider-list")}>Lista de proveedores</button>
         <button onClick={() => navigate("/provider-load")}>Cargar Proveedor</button>
         <button onClick={() => navigate("/product-load")}>Cargar Producto</button>
         <button onClick={() => navigate("/dashboard")}>Volver al dashboard</button>
      </div>
   )
}

export default AdministrativePanel;