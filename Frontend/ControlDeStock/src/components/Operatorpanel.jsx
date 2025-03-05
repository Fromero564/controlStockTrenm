import {useNavigate } from "react-router-dom";

const OperatorPanel = ()=>{

    const navigate = useNavigate();
    return(
        <div>
            <h2>Panel Operaciones</h2>
            <button onClick={()=>navigate("/meat-load")}>Ingreso Mercaderia</button>
            <button onClick={()=>console.log("Boton a completar")}>Desposte</button>
            <button onClick={()=>console.log("Boton a completar")}>Consultar Stock</button>
            <button onClick={()=>console.log("Boton a completar")}>Proveedores</button>
            <button onClick={()=>console.log("Boton a completar")}>Productos & subproductos (Carga)</button>
            <button onClick={()=>navigate("/dashboard")}>Volver al dashboard</button>
        </div>
    );
}


export default OperatorPanel;