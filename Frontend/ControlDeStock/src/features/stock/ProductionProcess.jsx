import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import '../../assets/styles/productionprocess.css';

const ProductionProcess = () => {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    // Productos (tipos)
    const [cortes, setCortes] = useState([]);

    // Tares
    const [tares, setTares] = useState([]);

    // Estado formulario principal (cortes)
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

    // Estado formulario "Piezas a despostar"
    const [despostarTipo, setDespostarTipo] = useState("");
    const [despostarCantidad, setDespostarCantidad] = useState("");
    const [piezasDespostar, setPiezasDespostar] = useState([]);

    // Carga de cortes y tares
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await fetch(`${API_URL}/product-name`);
                const data = await response.json();
                const productosConCantidad = data.map((producto) => ({
                    id: producto.id,
                    nombre: producto.product_name,
                    cantidad: 0,
                }));
                setCortes(productosConCantidad);
            } catch (err) {
                console.error("Error al obtener los productos:", err);
            }
        };
        fetchProductos();
    }, []);

    useEffect(() => {
        const fetchTares = async () => {
            try {
                const response = await fetch(`${API_URL}/allTares`);
                const data = await response.json();
                const tarasConIndex = data.map((item) => ({
                    id: item.id,
                    nombre: item.tare_name,
                    peso: item.tare_weight,
                }));
                setTares(tarasConIndex);
            } catch (err) {
                console.error("Error al obtener las taras:", err);
            }
        };
        fetchTares();
    }, []);

    // Funciones formulario principal
    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = parseFloat(value);
        if (name !== "tipo") newValue = isNaN(newValue) ? "" : Math.abs(newValue);
        setFormData((prev) => ({
            ...prev,
            [name]: name === "tipo" ? value : newValue,
        }));
    };

    const agregarCorte = () => {
        if (!formData.tipo || formData.cantidad === "" || formData.pesoBruto === "" || formData.tara === "") {
            alert("Por favor, complete todos los campos antes de agregar.");
            return;
        }

        const pesoNeto = +(formData.pesoBruto - formData.tara).toFixed(2);
        const promedio = formData.cantidad > 0 ? +(pesoNeto / formData.cantidad).toFixed(2) : 0;

        const nuevoCorte = {
            ...formData,
            pesoNeto,
            promedio,
        };

        setCortesAgregados([...cortesAgregados, nuevoCorte]);

        setFormData({
            tipo: "",
            promedio: 0,
            cantidad: 0,
            pesoBruto: 0,
            tara: 0,
            pesoNeto: 0,
        });
        setTaraSeleccionadaId("");
    };

    const eliminarCorte = (index) => {
        setCortesAgregados(cortesAgregados.filter((_, i) => i !== index));
    };

    const calcularPromedio = () => {
        const pesoNeto = formData.pesoBruto - formData.tara;
        const cantidad = formData.cantidad;
        return cantidad > 0 ? (pesoNeto / cantidad).toFixed(2) : "0.00";
    };

    // Funciones formulario "Piezas a despostar"
    const agregarPiezaDespostar = () => {
        if (!despostarTipo || despostarCantidad === "" || despostarCantidad <= 0) {
            alert("Complete el tipo y cantidad válidos para agregar.");
            return;
        }

        const nuevaPieza = {
            tipo: despostarTipo,
            cantidad: parseInt(despostarCantidad, 10),
        };

        setPiezasDespostar([...piezasDespostar, nuevaPieza]);

        setDespostarTipo("");
        setDespostarCantidad("");
    };

    const eliminarPiezaDespostar = (index) => {
        setPiezasDespostar(piezasDespostar.filter((_, i) => i !== index));
    };

 const handleSubmitPiezasDespostar = async () => {
    if (piezasDespostar.length === 0) {
        alert("No hay piezas para enviar.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/update-product-stock`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ piezas: piezasDespostar }),
        });

        if (!response.ok) throw new Error("Error al actualizar stock.");

        await response.json();
        alert("Stock actualizado correctamente.");
        setPiezasDespostar([]);
    } catch (error) {
        console.error(error);
        alert("Error al actualizar el stock.");
    }
};

    // Guardar cortes principal
    const handleGuardar = async () => {
        if (cortesAgregados.length === 0) {
            alert("No hay cortes agregados para guardar.");
            return;
        }

        try {
            for (const corte of cortesAgregados) {
                const response = await fetch(`${API_URL}/uploadProcessMeat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(corte),
                });
                if (!response.ok) throw new Error("Error al guardar los cortes");
            }
            alert("Cortes guardados correctamente.");
            setCortesAgregados([]);
            navigate("/operator-panel");
        } catch (err) {
            console.error("Error al enviar los cortes:", err);
            alert("Ocurrió un error al guardar los cortes.");
        }
    };

    return (
     
    <>
        <Navbar />
        <div className="pp-main-container">
            {/* FORMULARIO PIEZAS A DESPOSTAR */}
            <section className="pp-despostar-section">
                <h2>Piezas a Despostar</h2>
                <div className="pp-form-group">
                    <div>
                        <label>TIPO</label>
                        <select
                            value={despostarTipo}
                            onChange={(e) => setDespostarTipo(e.target.value)}
                        >
                            <option value="">Seleccionar</option>
                            {cortes.map((corte) => (
                                <option key={corte.id} value={corte.nombre}>
                                    {corte.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>CANTIDAD</label>
                        <input
                            type="number"
                            min="1"
                            value={despostarCantidad}
                            onChange={(e) => setDespostarCantidad(e.target.value)}
                        />
                    </div>
                    <div className="pp-boton-agregar-wrapper">
                        <button type="button" className="pp-btn-agregar" onClick={agregarPiezaDespostar}>
                            +
                        </button>
                    </div>
                </div>

                {/* Lista de piezas despostar */}
                <div className="pp-piezas-despostar-lista">
                    {piezasDespostar.length === 0 && <p>No hay piezas agregadas.</p>}
                    {piezasDespostar.map((pieza, index) => (
                        <div key={index} className="pp-pieza-despostar-item">
                            <span><strong>Tipo:</strong> {pieza.tipo}</span>
                            <span><strong>Cantidad:</strong> {pieza.cantidad}</span>
                            <button
                                type="button"
                                className="pp-btn-eliminar"
                                onClick={() => eliminarPiezaDespostar(index)}
                            >
                                X
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    className="pp-btn-guardar"
                    onClick={handleSubmitPiezasDespostar}
                >
                    Enviar piezas a despostar
                </button>
            </section>

            {/* FORMULARIO PRINCIPAL (CORTE) */}
            <section className="pp-cortes-section">
                <h1>Proceso Productivo</h1>
                <div className="pp-content-wrapper">
                    <div className="pp-formulario-corte">
                        <div className="pp-form-group">
                            <div>
                                <label>TIPO</label>
                                <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                                    <option value="">Seleccionar</option>
                                    {cortes.map((corte) => (
                                        <option key={corte.id} value={corte.nombre}>
                                            {corte.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>CANTIDAD</label>
                                <input
                                    type="number"
                                    name="cantidad"
                                    value={formData.cantidad}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                />
                            </div>
                            <div>
                                <label>PESO BRUTO</label>
                                <input
                                    type="number"
                                    name="pesoBruto"
                                    value={formData.pesoBruto}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                />
                            </div>
                            <div>
                                <label>TARA</label>
                                <select
                                    name="tara"
                                    value={taraSeleccionadaId}
                                    onChange={(e) => {
                                        const selected = tares.find((t) => t.id === parseInt(e.target.value));
                                        setTaraSeleccionadaId(e.target.value);
                                        setFormData((prev) => ({
                                            ...prev,
                                            tara: selected?.peso || 0,
                                        }));
                                    }}
                                    required
                                >
                                    <option value="">Seleccionar</option>
                                    {tares.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.nombre} ({t.peso} kg)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>PESO NETO</label>
                                <input
                                    type="number"
                                    value={(formData.pesoBruto - formData.tara).toFixed(2)}
                                    disabled
                                />
                            </div>
                            <div>
                                <label>PROMEDIO</label>
                                <input type="text" value={calcularPromedio()} disabled />
                            </div>
                            <div className="pp-boton-agregar-wrapper">
                                <button className="pp-btn-agregar" onClick={agregarCorte}>
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Tabla visible solo en pantallas grandes */}
                        <div className="pp-cortes-tabla">
                            <div className="pp-corte-encabezado">
                                <div><strong>TIPO</strong></div>
                                <div><strong>CANTIDAD</strong></div>
                                <div><strong>PESO BRUTO</strong></div>
                                <div><strong>TARA</strong></div>
                                <div><strong>PESO NETO</strong></div>
                                <div><strong>PROMEDIO</strong></div>
                                <div><strong>ACCIONES</strong></div>
                            </div>

                            {cortesAgregados.map((corte, index) => (
                                <div key={index} className="pp-corte-mostrado">
                                    <div>{corte.tipo}</div>
                                    <div>{corte.cantidad}</div>
                                    <div>{corte.pesoBruto}</div>
                                    <div>{corte.tara}</div>
                                    <div>{(corte.pesoBruto - corte.tara).toFixed(2)}</div>
                                    <div>{corte.promedio.toFixed(2)}</div>
                                    <div>
                                        <button className="pp-btn-eliminar" onClick={() => eliminarCorte(index)}>X</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tarjetas responsive para pantallas chicas */}
                        <div className="pp-cortes-tarjetas">
                            {cortesAgregados.map((corte, index) => (
                                <div key={index} className="pp-corte-tarjeta">
                                    <p><strong>Tipo:</strong> {corte.tipo}</p>
                                    <p><strong>Cantidad:</strong> {corte.cantidad}</p>
                                    <p><strong>Peso Bruto:</strong> {corte.pesoBruto}</p>
                                    <p><strong>Tara:</strong> {corte.tara}</p>
                                    <p><strong>Peso Neto:</strong> {(corte.pesoBruto - corte.tara).toFixed(2)}</p>
                                    <p><strong>Promedio:</strong> {corte.promedio.toFixed(2)}</p>
                                    <button className="pp-btn-eliminar" onClick={() => eliminarCorte(index)}>Eliminar</button>
                                </div>
                            ))}
                        </div>

                        <div className="pp-total-peso">
                            <strong>Total Peso Neto:</strong>{" "}
                            {cortesAgregados.reduce((acc, item) => acc + (item.pesoBruto - item.tara), 0).toFixed(2)} kg
                        </div>

                        <button className="pp-btn-guardar" onClick={handleGuardar}>
                            Guardar y terminar carga
                        </button>
                    </div>
                </div>
            </section>
        </div>
    </>


    );
};

export default ProductionProcess;
