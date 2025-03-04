import {useNavigate } from "react-router-dom";

const OperatorPanel = ()=>{

    const navigate = useNavigate();
    return(
        <div>
            <h2>Panel Operaciones</h2>
            <button onClick={()=>navigate("/meat-load")}>Ingreso Mercaderia</button>
            <button onClick={()=>navigate("/meat-load")}>Desposte</button>
            <button onClick={()=>navigate("/meat-load")}>Consultar Stock</button>
            <button onClick={()=>navigate("/meat-load")}>Proveedores</button>
            <button onClick={()=>navigate("/meat-load")}>Productos & subproductos (Carga)</button>
        </div>
    );
}


export default OperatorPanel;