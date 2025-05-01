import { useParams, useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "./styles/meatmanualincome.css";

const MeatManualIncome = () => {
    const navigate = useNavigate();
    const { remitoId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cortes, setCortes] = useState([]);
    const [cortesAgregados, setCortesAgregados] = useState([]);
    const [tares, setTares] = useState([]);
    const [taraSeleccionadaId, setTaraSeleccionadaId] = useState("");
    const [formData, setFormData] = useState({
        tipo: "",
        cabeza: 0,
        cantidad: 0,
        pesoProveedor: 0,
        pesoBruto: 0,
        tara: 0,
        garron: "",
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
            } finally {
                setLoading(false);
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
            } finally {
                setLoading(false);
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
            const payload = {
                cortes: cortesAgregados,
                observacion: formData.observaciones?.trim() || null,
            };
        
            const response = await fetch(`http://localhost:3000/addProducts/${data.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
        
            if (!response.ok) throw new Error("Error al guardar los datos");
            alert("Cortes guardados correctamente.");
            setCortesAgregados([]);
        } 
          
         catch (err) {
            console.error("Error al enviar los cortes:", err);
            alert("Ocurrió un error al guardar los cortes.");
        }
        navigate("/operator-panel");
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/find-remit/${remitoId}`);
                if (!response.ok) throw new Error("Error en la solicitud");

                const result = await response.json();
                setData(result);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [remitoId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        if (["tipo", "observaciones", "garron"].includes(name)) {
            // estos campos son texto
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        } else {
            // estos campos son números
            const numericValue = parseFloat(value);
            setFormData((prev) => ({
                ...prev,
                [name]: isNaN(numericValue) ? "" : Math.abs(numericValue),
            }));
        }
    };

    const agregarCorte = () => {
        if (!formData.tipo || formData.cabeza === "" || formData.cantidad === "" || formData.pesoBruto === "" || formData.tara === "" || formData.garron === "") {
            alert("Por favor, complete todos los campos antes de agregar.");
            return;
        }
        const nuevoCorte = {
            ...formData,
            pesoNeto: formData.pesoBruto - formData.tara
        };
        setCortesAgregados([...cortesAgregados, nuevoCorte]);

        setFormData({
            tipo: "",
            cabeza: 0,
            cantidad: 0,
            pesoProveedor: 0,
            pesoBruto: 0,
            tara: 0,
            garron: "",
        });
    };

    const eliminarCorte = (index) => {
        setCortesAgregados(cortesAgregados.filter((_, i) => i !== index));
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR');
    };

    const avergeDataDiference = (PesoRomaneo, PesoNeto) => {
        if (!PesoRomaneo || PesoRomaneo === 0) return NaN;
        const porcentaje = (PesoNeto * 100) / PesoRomaneo;
        return porcentaje - 100;
    }


    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!data) return <p>No se encontró el remito</p>;

    return (
        <div>
            <Navbar />
            <div className="main-container">
                <div>
                    <h2>Detalle Mercadería</h2>
                    <div>
                        <div className="mercaderia-container">
                            <div className="mercaderia-info-row">
                                <div><p className="label">PROVEEDOR:</p><p>{data.supplier.toUpperCase()}</p></div>
                                <div><p className="label">TIPO DE INGRESO:</p><p>{data.income_state.toUpperCase()}</p></div>
                                <div><p className="label">HORARIO:</p><p>{formatTime(data.createdAt)}</p></div>
                                <div><p className="label">N° COMPROBANTE ROMANEO:</p><p>{data.romaneo_number}</p></div>
                            </div>
                            <div className="mercaderia-info-row">
                                <div><p className="label">PESO TOTAL DECLARADO EN ROMANEO:</p><p>{data.total_weight} KG</p></div>
                                <div><p className="label">CANTIDAD CABEZAS:</p><p>{data.head_quantity}</p></div>
                                <div><p className="label">Fecha:</p><p>{formatDate(data.createdAt)}</p></div>
                                <div><p className="label">COMPROBANTE INTERNO:</p><p>{data.id}</p></div>
                            </div>
                        </div>
                    </div>
                </div>
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
                            <label>GARRON</label>
                            <input type="text" name="garron" value={formData.garron} onChange={handleChange} required />
                        </div>
                        <div>
                            <label>CABEZA</label>
                            <input type="number" name="cabeza" min="0" max="1" value={formData.cabeza} onChange={handleChange} required />
                        </div>
                        <div>
                            <label>CANTIDAD</label>
                            <input type="number" name="cantidad" min="0" max="1" value={formData.cantidad} onChange={handleChange} required />
                        </div>
                        <div>
                            <label>PESO PROVEEDOR </label>
                            <input type="number" name="pesoProveedor" min="0" value={formData.pesoProveedor} onChange={handleChange} required />
                        </div>


                        <div>
                            <label>PESO BRUTO BALANZA </label>
                            <input type="number" name="pesoBruto" min="0" value={formData.pesoBruto} onChange={handleChange} required />
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

                    </div>

                    <button className="btn-agregar" onClick={agregarCorte}>Agregar pieza +</button>

                    <div className="cortes-lista">
                        {/* <div className="corte-encabezado">
                            <div><strong>TIPO</strong></div>
                            <div><strong>GARRON</strong></div>
                            <div><strong>CABEZA</strong></div>
                            <div><strong>CANTIDAD</strong></div>
                            <div><strong>PESO DECLARADO PROVEEDOR</strong></div>
                            <div><strong>PESO BRUTO BALANZA</strong></div>
                            <div><strong>TARA</strong></div>
                            <div><strong>PESO NETO</strong></div>
                            <div><strong>ACCIONES</strong></div>
                        </div> */}

                        {cortesAgregados.map((corte, index) => (
                            <div key={index} className="corte-mostrado">
                                <div>
                                    <p className="dato">{corte.tipo}</p>
                                </div>
                                <div>
                                    <p className="dato">{corte.garron}</p>
                                </div>
                                <div>
                                    <p className="dato">{corte.cabeza}</p>
                                </div>
                                <div>
                                    <p className="dato">{corte.cantidad}</p>
                                </div>
                                <div>
                                    <p className="dato">{corte.pesoProveedor}</p>
                                </div>
                                <div>
                                    <p className="dato">{corte.pesoBruto}</p>
                                </div>
                                <div>
                                    <p className="dato">{corte.tara}</p>
                                </div>
                                <div>
                                    <p className="dato">{corte.pesoNeto.toFixed(2)} kg</p>
                                </div>
                                <div>
                                    <button onClick={() => eliminarCorte(index)} className="btn-eliminar">Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>


                </div>
                <div className="info-weight-observations">
                    <div>
                        <h3>RESUMEN</h3>
                        <div className="table-wrapper">
                            <table className="stock-table">
                                <thead>
                                    <tr>
                                        <th>TIPO</th>
                                        <th>PESO NETO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cortesAgregados.map((corte, index) => {
                                        const diferencia = avergeDataDiference(corte.pesoProveedor, corte.pesoNeto);
                                        const color = diferencia >= 0 ? "green" : "red";
                                        return (
                                            <tr key={index}>
                                                <td>{corte.tipo}</td>
                                                <td>
                                                    {corte.pesoNeto.toFixed(2)} kg{" "}
                                                    <span style={{ color }}>
                                                        ({diferencia.toFixed(1)}%)
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <textarea name="observaciones" id="" placeholder="Observaciones" value={formData.observaciones} onChange={handleChange}></textarea>


                        <button className="btn-agregar" onClick={handleGuardar}>
                            Guardar y terminar carga
                        </button>

                    </div>
                    <div>
                        <div className="total-peso">
                            <strong>Total Peso Neto:</strong> {cortesAgregados.reduce((acc, item) => acc + (item.pesoBruto - item.tara), 0).toFixed(2)} kg
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default MeatManualIncome;