import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import "./styles/providerForm.css";

const ProviderForm = () => {
    const [tipoIngreso, setTipoIngreso] = useState("romaneo");
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();



        const formData = {
            proveedor: e.target.proveedor.value,
            pesoTotal: e.target.pesoTotal.value,
            unidadPeso: e.target.unidadPeso.value,
            cabezas: e.target.cabezas.value,
            romaneo: e.target.romaneo.value,
            comprobanteInterno: e.target.comprobanteInterno.value,
            tipoIngreso: tipoIngreso,
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
                const data = await response.json();
                console.log("Respuesta del backend:", data);
                const productoId = data.id;
                const romaneo = formData.romaneo;

                if (tipoIngreso === "romaneo") {
                    navigate(`/meat-income/${productoId}/${romaneo}`);
                } else {
                    navigate(`/meat-manual-icome/${productoId}`);
                }
              
            } else {
                console.error("Error al enviar los datos");
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };

    const handleRadioChange = (e) => {
        setTipoIngreso(e.target.value);
    };
    return (
        <div>
            <Navbar />
            <div className="provider-form">

                <form onSubmit={handleSubmit} className="form-container">
                    <h2 className="form-title">INGRESAR MERCADERIA</h2>
                    <label className="label">
                        Proveedor:
                        <select name="proveedor" className="input">
                            <option value="Monsanto">Monsanto</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </label>
                    <label className="label">
                        Peso total declarado en romaneo:
                        <div className="peso-container">
                            <input type="text" name="pesoTotal" className="input" />
                            <select name="unidadPeso" className="input">
                                <option value="kg">Kg</option>
                                <option value="g">Gramos</option>
                                <option value="lb">Libras</option>
                            </select>
                        </div>
                    </label>

                    <label className="label">
                        Cabezas:
                        <input type="number" name="cabezas" className="input" />
                    </label>
                    <label className="label">
                        Cantidad de animales
                        <input type="number" name="cantAnimales" className="input" />
                    </label>

                    <label className="label">
                        Nº comprobante romaneo:
                        <input type="number" name="romaneo" className="input" />
                    </label>
                    <label className="label">
                        Nº comprobante interno:
                        <input type="number" name="comprobanteInterno" className="input" />
                    </label>
                    <fieldset>
                        <legend>Tipo de ingreso:</legend>

                        <div>
                            <input
                                type="radio"
                                id="romaneo_check"
                                name="tipoIngreso"
                                value="romaneo"
                                checked={tipoIngreso === "romaneo"}
                                onChange={handleRadioChange}
                            />
                            <label htmlFor="romaneo_check">Romaneo</label>
                        </div>

                        <div>
                            <input
                                type="radio"
                                id="manual_check"
                                name="tipoIngreso"
                                value="manual"
                                checked={tipoIngreso === "manual"}
                                onChange={handleRadioChange}
                            />
                            <label htmlFor="manual_check">Manual</label>
                        </div>
                    </fieldset>


                    <button type="submit">
                        {tipoIngreso === "romaneo" ? "Cargar" : "Cargar y completar carga manual"}
                    </button>
                    <button type="button" onClick={() => navigate("/operator-panel")}>Cancelar</button>
                </form>
            </div>
        </div>
    );
};

export default ProviderForm;
