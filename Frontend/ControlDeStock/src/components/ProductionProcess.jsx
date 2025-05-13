import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";


const ProductionProcess = () => {
    const navigate = useNavigate();
    const [cortes, setCortes] = useState([]);
    const [tares, setTares] = useState([]);
    const [cortesAgregados, setCortesAgregados] = useState([]);
    const [taraSeleccionadaId, setTaraSeleccionadaId] = useState("");
    const [formData, setFormData] = useState({
        tipo: "",
        promedio: 0,
        cantidad: 0,
        pesoBruto: 0,
        tara: 0,
        pesoNeto: 0,
    });

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await fetch("http://localhost:3000/product-name");
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
            }
        };

        fetchProductos();
    }, []);

    useEffect(() => {
        const fetchTares = async () => {
            try {
                const response = await fetch("http://localhost:3000/allTares");
                if (!response.ok) throw new Error("Error al cargar todas las taras");

                const data = await response.json();
                const tarasConIndex = data.map((item) => ({
                    id: item.id,
                    nombre: item.tare_name,
                    peso: item.tare_weight
                }));
                setTares(tarasConIndex);
            } catch (err) {
                console.error("Error al obtener las taras:", err);
                setError("Error al cargar las taras");
            }
        };

        fetchTares();
    }, []);
    const handleGuardar = async () => {
        if (cortesAgregados.length === 0) {
            alert("No hay cortes agregados para guardar.");
            return;
        }

        try {
            for (const corte of cortesAgregados) {
                const response = await fetch('http://localhost:3000/uploadProcessMeat', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        tipo: corte.tipo,
                        promedio: corte.promedio,
                        cantidad: corte.cantidad,
                        pesoBruto: corte.pesoBruto,
                        tara: corte.tara,
                        pesoNeto: corte.pesoNeto,
                    }),
                });
                if (!response.ok) throw new Error("Error al guardar los cortes");
            }    
          

            alert("Cortes guardados correctamente.");
            setCortesAgregados([]);
        } catch (err) {
            console.error("Error al enviar los cortes:", err);
            alert("Ocurrió un error al guardar los cortes.");
        }
        navigate("/operator-panel");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = parseFloat(value);

        if (name !== "tipo") {
            newValue = isNaN(newValue) ? "" : Math.abs(newValue);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: name === "tipo" ? value : newValue,
        }));
    };

    const agregarCorte = () => {
        if (!formData.tipo || formData.cabeza === "" || formData.cantidad === "" || formData.pesoBruto === "" || formData.tara === "") {
            alert("Por favor, complete todos los campos antes de agregar.");
            return;
        }
        const nuevoCorte = {
            ...formData,
            pesoNeto: formData.pesoBruto - formData.tara
        };
        setCortesAgregados([...cortesAgregados, nuevoCorte]);

    };

    const eliminarCorte = (index) => {
        setCortesAgregados(cortesAgregados.filter((_, i) => i !== index));
    };



    return (
        <>
            <Navbar />
            <div className="main-container">

                <div className="formulario-corte">


                    <div className="form-group">
                        <div>
                            <label>TIPO</label>
                            <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                                <option value="">Seleccionar</option>
                                {cortes.map((corte) => (
                                    <option key={corte.id} value={corte.nombre}>{corte.nombre}</option>
                                ))}
                            </select>
                        </div>
                     
                        <div>
                            <label>CANTIDAD</label>
                            <input type="number" name="cantidad" value={formData.cantidad} min="0" onChange={handleChange} required />
                        </div>

                        <div>
                            <label>PESO BRUTO </label>
                            <input type="number" name="pesoBruto" value={formData.pesoBruto} min="0" onChange={handleChange} required />
                        </div>
                         


                        <div>
                            <label>TARA</label>
                            <select
                                name="tara"
                                value={taraSeleccionadaId}
                                onChange={(e) => {
                                    const selected = tares.find(t => t.id === parseInt(e.target.value));
                                    setTaraSeleccionadaId(e.target.value);
                                    setFormData(prev => ({
                                        ...prev,
                                        tara: selected?.peso || 0
                                    }));
                                }}
                                required
                            >
                                <option value="">Seleccionar</option>
                                {tares.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre} ({t.peso} kg)</option>
                                ))}
                            </select>

                        </div>
                        <div>
                            <label>PESO NETO</label>
                            <input
                                type="number"
                                name="pesoNeto"
                                value={(formData.pesoBruto - formData.tara).toFixed(2)}
                                disabled
                            />
                        </div>
                        <div>
                            <label>PROMEDIO</label>
                            <input type="text" name="promedio" value={formData.promedio} onChange={handleChange} required />
                        </div>

                    </div>

                    <button className="btn-agregar" onClick={agregarCorte}>Agregar pieza +</button>
                    <div className="cortes-lista">
                        <div className="corte-encabezado">
                            <div><strong>TIPO</strong></div>
                           
                            <div><strong>CANTIDAD</strong></div>
                            <div><strong>PESO BRUTO</strong></div>
                            <div><strong>TARA</strong></div>
                            <div><strong>PESO NETO</strong></div>
                            <div><strong>ACCIONES</strong></div>
                            <div><strong>PROMEDIO</strong></div>
                        </div>

                        {cortesAgregados.map((corte, index) => (
                            <div key={index} className="corte-mostrado">
                                {/* TIPO */}
                                <div>
                                    <select value={corte.tipo} disabled>
                                        {cortes.map((opcion) => (
                                            <option key={opcion.id} value={opcion.nombre}>{opcion.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                             
                                {/* CANTIDAD */}
                                <div>
                                    <input type="number" value={corte.cantidad} disabled />
                                </div>

                                {/* PESO BRUTO */}
                                <div>
                                    <input type="number" value={corte.pesoBruto} disabled />
                                </div>

                                {/* TARA */}
                                <div>
                                    <select value={corte.taraSeleccionadaId} disabled>
                                        {tares.map((t) => (
                                            <option key={t.id} value={t.id}>{t.nombre} ({t.peso} kg)</option>
                                        ))}
                                    </select>
                                </div>

                                {/* PESO NETO */}
                                <div>
                                    <input type="number" value={(corte.pesoBruto - corte.tara).toFixed(2)} disabled />
                                </div>
                                   {/* PROMEDIO */}
                                   <div>
                                    <input type="text" value={corte.promedio} disabled />
                                </div>


                                {/* BOTÓN ELIMINAR */}
                                <div>
                                    <button onClick={() => eliminarCorte(index)} className="btn-eliminar">Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>




                    <div className="total-peso">
                        <strong>Total Peso Neto:</strong> {cortesAgregados.reduce((acc, item) => acc + (item.pesoBruto - item.tara), 0).toFixed(2)} kg
                    </div>
                </div>

                <button className="btn-guardar" onClick={handleGuardar}>
                    Guardar y terminar carga
                </button>
            </div>
        </>
    )
}

export default ProductionProcess;