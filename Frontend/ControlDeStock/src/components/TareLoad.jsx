import { useState } from "react";

const Tareload = () => {
    const [tare, setTare] = useState({});
    const [mensaje, setMensaje] = useState(null); 

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
            <h1>NUEVA TARA</h1>

            {mensaje && <p>{mensaje}</p>}

            <form onSubmit={handleSubmit}>
                <label htmlFor="tareName">Nombre</label>
                <input type="text" name="tareName" id="tareName" placeholder="Nombre" required />

                <label htmlFor="tareWeight">Peso Kg</label>
                <input type="number" name="tareWeight" id="tareWeight" placeholder="Peso Kg" step="0.01" required />

                <button type="submit">Cargar</button>
            </form>
        </>
    );
};

export default Tareload;
