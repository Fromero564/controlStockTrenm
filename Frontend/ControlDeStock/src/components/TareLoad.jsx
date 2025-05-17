import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import './styles/Tareload.css';

const Tareload = () => {
    const [tare, setTare] = useState({ tareName: "", tareWeight: "" });
    const [mensaje, setMensaje] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams(); 
    const esEdicion = Boolean(id); 

    // Cargar datos de la tara si estamos en edición
    useEffect(() => {
        if (esEdicion) {
            // Traer datos de la tara para precargar formulario
            fetch(`http://localhost:3000/tareLoadFind/${id}`)
                .then(res => {
                    if (!res.ok) throw new Error("No se encontró la tara");
                    return res.json();
                })
                .then(data => {
                    setTare({ tareName: data.tare_name, tareWeight: data.tare_weight });
                })
                .catch(err => {
                    setMensaje("❌ Error al cargar la tara para editar.");
                    console.error(err);
                });
        }
    }, [id, esEdicion]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            tareName: e.target.tareName.value,
            tareWeight: parseFloat(e.target.tareWeight.value),
        };

        try {
            let response;
            if (esEdicion) {
                // Editar (PUT)
                response = await fetch(`http://localhost:3000/tare-edit/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            } else {
                
                response = await fetch("http://localhost:3000/tareLoad", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            }

            if (response.ok) {
                const data = await response.json();
                setMensaje(esEdicion ? "✅ Tara editada correctamente." : "✅ Tara cargada correctamente.");
                setTare({ tareName: "", tareWeight: "" });
                if (!esEdicion) e.target.reset();
            } else {
                setMensaje("❌ Error en el servidor.");
            }
        } catch (error) {
            setMensaje("❌ Error en la solicitud.");
            console.error(error);
        }

       navigate("/all-tares");
    };

    return (
        <>
            <Navbar />
            {mensaje && <p className="tara-form-message">{mensaje}</p>}
            <div className="tara-form-container">
                <h1 className="tara-form-title">{esEdicion ? "EDITAR TARA" : "NUEVA TARA"}</h1>
                <form className="tara-form" onSubmit={handleSubmit}>
                    <label htmlFor="tareName" className="tara-label">NOMBRE</label>
                    <input
                        type="text"
                        name="tareName"
                        id="tareName"
                        placeholder="Nombre"
                        required
                        className="tara-input"
                        defaultValue={tare.tareName}
                    />

                    <label htmlFor="tareWeight" className="tara-label">PESO KG</label>
                    <input
                        type="number"
                        name="tareWeight"
                        id="tareWeight"
                        placeholder="Peso Kg"
                        step="0.01"
                        required
                        className="tara-input"
                        defaultValue={tare.tareWeight}
                    />

                    <div className="tara-form-buttons">
                        <button type="submit" className="tara-btn-primary">
                            {esEdicion ? "Guardar cambios" : "Agregar tara"}
                        </button>
                        <button type="button" className="tara-btn-secondary" onClick={() => navigate("/operator-panel")}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Tareload;
