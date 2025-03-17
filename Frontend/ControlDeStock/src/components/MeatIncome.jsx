import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./styles/meatIncome.css";

function MeatIncome() {
    const { id, remitoId } = useParams();
    const [cortes, setCortes] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await fetch("http://localhost:3000/product-primary-name"); 
                if (!response.ok) throw new Error("Error al cargar los productos");

                const data = await response.json();
             

              
                const productosConCantidad = data.map((nombre, index) => ({
                    id: index + 1, 
                    nombre,
                    cantidad: 0, 
                }));

                setCortes(productosConCantidad);
            } catch (err) {
                console.error("Error al obtener los productos:", err);
                setError("Error al cargar los productos");
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, []);

    const handleCantidadChange = (id, cantidad) => {
        const cantidadValida = cantidad === "" || cantidad == null ? 0 : parseInt(cantidad, 10);

        setCortes((prevCortes) =>
            prevCortes.map((corte) =>
                corte.id === id ? { ...corte, cantidad: cantidadValida } : corte
            )
        );
    };

    const handleSubmit = async () => {
        try {
            const productosNombres = cortes.map((corte) => corte.nombre).join(";"); 
            const productosCantidades = cortes.map((corte) => corte.cantidad).join(";"); 

            const payload = {
                id_received_suppliers: id,
                productos: productosNombres,
                cantidades: productosCantidades
            };


            const response = await fetch(`http://localhost:3000/addProducts/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    if (loading) return <p>Cargando productos...</p>;
    if (error) return <p>{error}</p>;

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
