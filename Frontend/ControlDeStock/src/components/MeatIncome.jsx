import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function MeatIncome() {
    const { id, remitoId } = useParams();


    const [cortes, setCortes] = useState([
        { id: 1, nombre: 'Capon', cantidad: 0 },
        { id: 2, nombre: 'Media Res Capon', cantidad: 0 },
        { id: 3, nombre: 'Media Res Chancha', cantidad: 0 },
        { id: 4, nombre: 'Media Res Padrillo', cantidad: 0 },
        { id: 5, nombre: 'Cabezas', cantidad: 0 },
    ]);


    const handleCantidadChange = (id, cantidad) => {

        const cantidadValida = cantidad === "" || cantidad == null ? 0 : cantidad;

        setCortes((prevCortes) =>
            prevCortes.map((corte) =>
                corte.id === id
                    ? { ...corte, cantidad: cantidadValida }
                    : corte
            )
        );
    };

    const handleSubmit = async () => {
        try {
            const payload = cortes.reduce((acc, corte) => {
                const key = corte.nombre.toLowerCase().replace(/\s+/g, '_') + '_stock';
                acc[key] = corte.cantidad ?? 0;
                return acc;
            }, { id_received_suppliers: id });

            console.log("Payload enviado:", payload);

            const response = await fetch(`http://localhost:3000/addProducts/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {

                const errorData = await response.json();
                console.error("Error en la respuesta del servidor:", errorData);
                return;
            }

            const data = await response.json();
            console.log('Datos guardados', data);
        } catch (error) {
            console.error('Error al guardar los datos', error);
        }
    };

    return (
        <div>
            <h1>Ingreso de Carne - Remito {remitoId}</h1>
            <div className="cards-container">
                {cortes.map((corte) => (
                    <div key={corte.id} className="card">
                        <h3>{corte.nombre}</h3>
                        <input
                            type="number"
                            min="0"
                            value={corte.cantidad}
                            onChange={(e) => handleCantidadChange(corte.id, e.target.value)}
                            placeholder="Cantidad"
                        />
                    </div>
                ))}
            </div>
            <button onClick={handleSubmit}>Guardar Ingreso</button>
        </div>
    );
}

export default MeatIncome;
