import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdministrativePanel = () => {
   const navigate = useNavigate();
   return (
      <div>
         <h2>Panel Administrativo</h2>

         <button onClick={() => navigate("/provider-list")}>Lista de proveedores</button>
         <button onClick={() => navigate("/provider-load")}>Cargar Proveedor</button>
         <button onClick={() => navigate("/product-load")}>Cargar Producto</button>
         <button onClick={() => navigate("/dashboard")}>Volver al dashboard</button>
      </div>
   )
}

export default AdministrativePanel;