import { useParams,useNavigate } from "react-router-dom";

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
    const [formData, setFormData] = useState({
        tipo: "",
        cabeza: 0,
        cantidad: 0,
        pesoBruto: 0,
        tara: 0,
        garron: "",
    });

 


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
    const handleGuardar = async () => {
        if (cortesAgregados.length === 0) {
            alert("No hay cortes agregados para guardar.");
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:3000/addProducts/${data.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cortesAgregados),
            });
    
            if (!response.ok) throw new Error("Error al guardar los cortes");
    
            alert("Cortes guardados correctamente.");
            setCortesAgregados([]); 
        } catch (err) {
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
                            <label>Tipo</label>
                            <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                                <option value="">Seleccionar</option>
                                {cortes.map((corte) => (
                                    <option key={corte.id} value={corte.nombre}>{corte.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Garron</label>
                            <input type="text" name="garron" value={formData.garron} onChange={handleChange} required />
                        </div>
                        <div>
                            <label>Cabeza</label>
                            <input type="number" name="cabeza" min="0" value={formData.cabeza} onChange={handleChange} required />
                        </div>
                        <div>
                            <label>Cantidad</label>
                            <input type="number" name="cantidad" min="0" value={formData.cantidad} onChange={handleChange} required />
                        </div>



                        <div>
                            <label>Peso Bruto</label>
                            <input type="number" name="pesoBruto" min="0" value={formData.pesoBruto} onChange={handleChange} required />
                        </div>
                        <div>
                            <label>Tara</label>
                            <input type="number" name="tara" min="0" value={formData.tara} onChange={handleChange} required />
                        </div>
                    </div>

                    <button className="btn-agregar" onClick={agregarCorte}>Agregar pieza +</button>

                    <div className="cortes-lista">
                        <div className="corte-encabezado">
                            <div><strong>Tipo</strong></div>
                            <div><strong>Garrón</strong></div>
                            <div><strong>Cabeza</strong></div>
                            <div><strong>Cantidad</strong></div>
                            <div><strong>Peso Bruto</strong></div>
                            <div><strong>Tara</strong></div>
                            <div><strong>Peso Neto</strong></div>
                            <div><strong>Acciones</strong></div>
                        </div>

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





                    <div className="total-peso">
                        <strong>Total Peso Neto:</strong> {cortesAgregados.reduce((acc, item) => acc + (item.pesoBruto - item.tara), 0).toFixed(2)} kg
                    </div>
                </div>

                <button className="btn-guardar" onClick={handleGuardar}>
                    Guardar todo
                </button>
            </div>
        </div>
    );
};

export default MeatManualIncome;