import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import "./styles/providerForm.css";

const ProviderForm = () => {
    const [tipoIngreso, setTipoIngreso] = useState("romaneo");
    const [providers, setProviders] = useState([]);

    const navigate = useNavigate();


    useEffect(() => {
        fetch("http://localhost:3000/allProviders")
            .then((response) => response.json())
            .then((data) => setProviders(data))
            .catch((error) => console.error("Error al obtener productos:", error));
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();



        const formData = {
            proveedor: e.target.proveedor.value,
            pesoTotal: e.target.pesoTotal.value,
            cabezas: e.target.cabezas.value,
            romaneo: e.target.romaneo.value,
            pesoFinal: e.target.pesoFinal.value,
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

                <form onSubmit={handleSubmit} className="form-container-provider">
                    <h2 className="form-title">INGRESAR MERCADERIA</h2>


                    <label className="label-provider-form">
                        TIPO DE INGRESO
                        <div className="radio-buttons">
                            <div className="radius-style">
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

                            <div className="radius-style">
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
                        </div>
                    </label>
                    <label className="label-provider-form">
                        PROVEEDOR:
                        <select name="proveedor" className="input">
                            {providers.map((provider) => (
                                <option key={provider.id} value={provider.provider_name}>
                                    {provider.provider_name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="label-provider-form">
                        PESO TOTAL:
                        <input type="number" name="pesoTotal" className="input" />
                    </label>

                    <label className="label-provider-form">
                        CABEZAS:
                        <input type="number" name="cabezas" className="input" min="0" />
                    </label>
                    <label className="label-provider-form">
                        CANTIDAD DE ANIMALES:
                        <input type="number" name="cantAnimales" className="input" />
                    </label>

                    <label className="label-provider-form">
                        Nº COMPROBANTE ROMANEO:
                        <input type="number" name="romaneo" className="input" />
                    </label>

                    <label className="label-provider-form">
                        PESO FINAL:
                        <input type="number" name="pesoFinal" className="input" />
                    </label>

                    <div className="button-container">
                        <button type="submit" className="button-primary">
                            {tipoIngreso === "romaneo" ? "Agregar y continuar a pesaje" : "Cargar y completar carga manual"}
                        </button>
                        <button type="button" className="button-secondary" onClick={() => navigate("/operator-panel")}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProviderForm;
