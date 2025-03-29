import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "./styles/meatmanualincome.css";

const MeatManualIncome = () => {
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
        tara: 0
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
        setFormData((prev) => ({
            ...prev,
            [name]: name === "tipo" ? value : parseFloat(value) || 0
        }));
    };

    const agregarCorte = () => {
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
            tara: 0
        });
    };

    const eliminarCorte = (index) => {
        setCortesAgregados(cortesAgregados.filter((_, i) => i !== index));
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <Navbar />
            <div className="main-container">
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
                    </div>
                </div>
                </div>
                <div className="formulario-corte">
                    <label>Tipo</label>
                    <select name="tipo" value={formData.tipo} onChange={handleChange}>
                        <option value="">Seleccionar</option>
                        {cortes.map((corte) => (
                            <option key={corte.id} value={corte.nombre}>{corte.nombre}</option>
                        ))}
                    </select>

                    <div className="form-group">
                        <div>
                            <label>Cabeza</label>
                            <input type="number" name="cabeza" value={formData.cabeza} onChange={handleChange} />
                        </div>
                        <div>
                            <label>Cantidad</label>
                            <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <div>
                            <label>Peso Bruto</label>
                            <input type="number" name="pesoBruto" value={formData.pesoBruto} onChange={handleChange} />
                        </div>
                        <div>
                            <label>Tara</label>
                            <input type="number" name="tara" value={formData.tara} onChange={handleChange} />
                        </div>
                    </div>

                    <button className="btn-agregar" onClick={agregarCorte}>Agregar pieza +</button>

                    <table className="table-cortes">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Cabeza</th>
                                <th>Cantidad</th>
                                <th>Peso Bruto</th>
                                <th>Tara</th>
                                <th>Peso Neto</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cortesAgregados.map((corte, index) => (
                                <tr key={index}>
                                    <td>{corte.tipo}</td>
                                    <td>{corte.cabeza}</td>
                                    <td>{corte.cantidad}</td>
                                    <td>{corte.pesoBruto} kg</td>
                                    <td>{corte.tara} kg</td>
                                    <td>{(corte.pesoBruto - corte.tara).toFixed(2)} kg</td>
                                    <td>
                                        <button onClick={() => eliminarCorte(index)}>❌</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MeatManualIncome;