import {useState,useEffect} from "react";
import {useNavigate} from "react-router-dom"


const LoadNewProduct = ()=>{
    const navigate = useNavigate();
    const handleSubmit =async (e)=>{
        e.preventDefault();
        
        const formData = {
           nombre: e.target.productName.value,
           categoria:e.target.selectCategory.value
        };
        try {
            const response = await fetch("http://localhost:3000/product-load", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log("Datos enviados correctamente");
            } else {
                console.error("Error al enviar los datos");
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }

    }

    
  return (
    <div>
        <form onSubmit={handleSubmit}>
            <label htmlFor="productName">Nombre del Producto</label>
            <input type="text" name="productName" id="productName" />
            <select name="selectCategory" id="selectCategory">
                <option value="primario">Primario</option>
                <option value="principal">Principal</option>
                <option value="subproducto">Subproducto</option>
            </select>
          <button type="submit">Cargar</button>
          <button onClick={()=>navigate("/administrative-panel")}>Cancelar</button>
        </form>

    </div>
  )
}


export default LoadNewProduct;