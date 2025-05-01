import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import './styles/Tareload.css';

const Tareload = () => {
    const [tare, setTare] = useState({});
    const [mensaje, setMensaje] = useState(null);
    const navigate = useNavigate();
 


    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            tareName: e.target.tareName.value,
            tareWeight: parseFloat(e.target.tareWeight.value),
        };

        try {
            const response = await fetch("http://localhost:3000/tareLoad", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Carga exitosa:", data);
                setTare(formData);
                setMensaje("✅ Tara cargada correctamente.");
                e.target.reset();
            } else {
                setMensaje("❌ Error al cargar la tara.");
                console.error("Error en el servidor");
            }
        } catch (error) {
            setMensaje("❌ Error en la solicitud.");
            console.error("Error en la solicitud:", error);
        }

        // Limpiar el mensaje después de unos segundos (opcional)
        setTimeout(() => setMensaje(null), 3000);
    };

    return (
        <>
            <Navbar />
       

            {mensaje && <p>{mensaje}</p>}
            <div className="tara-form-container">
                <h1 className="tara-form-title">NUEVA TARA</h1>

                {mensaje && <p className="tara-form-message">{mensaje}</p>}

                <form className="tara-form" onSubmit={handleSubmit}>
                    <label htmlFor="tareName" className="tara-label">NOMBRE</label>
                    <input type="text" name="tareName" id="tareName" placeholder="Nombre" required className="tara-input" />

                    <label htmlFor="tareWeight" className="tara-label">PESO KG</label>
                    <input type="number" name="tareWeight" id="tareWeight" placeholder="Peso Kg" step="0.01" required className="tara-input" />

                    <div className="tara-form-buttons">
                        <button type="submit" className="tara-btn-primary">Agregar tara</button>
                        <button type="button" className="tara-btn-secondary" onClick={() => navigate("/operator-panel")}>Cancelar</button>
                    </div>
                </form>
            </div>

        </>
    );
};

export default Tareload;
