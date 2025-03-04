import { useContext } from "react";
// import { AuthContext } from "../context/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";
import "./styles/providerForm.css";

const ProviderForm = () => {

    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();

  

        const formData = {
            proveedor: e.target.proveedor.value,
            pesoTotal: e.target.pesoTotal.value,
            unidadPeso: e.target.unidadPeso.value,
            cabezas: e.target.cabezas.value,
            fecha: e.target.fecha.value,
            horario: e.target.horario.value,
            remito: e.target.remito.value,
        };

        try {
            const response = await fetch("http://localhost:3000/uploadProduct", {
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
    };
  
    return (
        <div className="provider-form">
        <form onSubmit={handleSubmit} className="form-container">
        <h2 className="form-title">INGRESAR MERCADERIA</h2>
            <label className="label">
                Proveedor:
                <select name="proveedor"  className="input">
                    <option value="Monsanto">Monsanto</option>
                    <option value="Otro">Otro</option>
                </select>
            </label>
            <label className="label">
                    Peso Total:
                    <div className="peso-container">
                        <input type="text" name="pesoTotal" className="input"/>
                        <select name="unidadPeso" className="input">
                            <option value="kg">Kg</option>
                            <option value="g">Gramos</option>
                            <option value="lb">Libras</option>
                        </select>
                    </div>
                </label>

            <label className="label">
                Cabezas:
                <input type="number" name="cabezas"  className="input" />
            </label>
            <label className="label">
                Cantidad de animales
                <input type="number" name="cantAnimales"  className="input" />
            </label>
           
            <label className="label">
                Nº Remito:
                <input type="number" name="remito"  className="input" />
            </label>
            <button type="submit" onClick={()=> navigate("/operator-panel")}>Cargar</button>
            <button type="button" onClick={()=> navigate("/operator-panel")}>Cancelar</button>
        </form>
        </div>
    );
};

export default ProviderForm;
