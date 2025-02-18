const ProviderForm = () => {
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            proveedor: e.target.proveedor.value,
            pesoTotal: e.target.pesoTotal.value,
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
        <form onSubmit={handleSubmit}>
            <label>
                Proveedor:
                <select name="proveedor">
                    <option value="Monsanto">Monsanto</option>
                    <option value="Otro">Otro</option>
                </select>
            </label>
            <label>
                Peso Total:
                <input type="text" name="pesoTotal" />
            </label>
            <label>
                Cabezas:
                <input type="number" name="cabezas" />
            </label>
            <label>
                Fecha:
                <input type="date" name="fecha" />
            </label>
            <label>
                Horario:
                <input type="text" name="horario" />
            </label>
            <label>
                Nº Remito:
                <input type="number" name="remito" />
            </label>
            <button type="submit">Cargar</button>
            <button type="button" onClick={() => console.log("Operación cancelada")}>Cancelar</button>
        </form>
    );
};

export default ProviderForm;
