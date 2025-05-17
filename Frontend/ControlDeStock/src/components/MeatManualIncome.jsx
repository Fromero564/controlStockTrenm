import { useParams, useNavigate } from "react-router-dom";
import Select from 'react-select';
import Swal from 'sweetalert2';
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "./styles/meatmanualincome.css";

const MeatManualIncome = () => {
    const navigate = useNavigate();
    const { remitoId } = useParams();
    const [cantidad, setCantidad] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [cortes, setCortes] = useState([]);
    const [cortesAgregados, setCortesAgregados] = useState([]);
    const [tares, setTares] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [taraSeleccionadaId, setTaraSeleccionadaId] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        tipo: "",
        cabeza: 0,
        cantidad: 0,
        pesoProveedor: 0,
        pesoBruto: 0,
        tara: 0,
        garron: "",
        observaciones: "",
        observacionId: null,
    });
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

    useEffect(() => {
        const fetchCortesYaCargados = async () => {
            if (!data?.id) return;

            try {
                const response = await fetch(`http://localhost:3000/getProductsFromRemito/${data.id}`);
                if (!response.ok) throw new Error("No se pudieron obtener los cortes ya cargados");

                const result = await response.json();


                const mapearCorteDesdeBackend = (item) => ({
                    id: item.id,
                    tipo: item.products_name || "",
                    cabeza: item.product_head ?? 0,
                    cantidad: parseFloat(item.products_quantity) || 0,
                    pesoProveedor: parseFloat(item.provider_weight) || 0,
                    pesoBruto: parseFloat(item.gross_weight) || 0,
                    tara: parseFloat(item.tare) || 0,
                    garron: item.products_garron || "",
                    pesoNeto: (parseFloat(item.gross_weight) || 0) - (parseFloat(item.tare) || 0),
                });
                const cortesFormateados = result.cortes?.map(mapearCorteDesdeBackend) || [];
                setCortesAgregados(cortesFormateados);

                if (cortesFormateados.length > 0) {
                    setIsEditing(true);
                }


                if (result.observacion) {
                    setFormData((prev) => ({
                        ...prev,
                        observaciones: result.observacion.texto,
                        observacionId: result.observacion.id,
                    }));
                }

            } catch (err) {
                console.error("Error al obtener cortes ya cargados:", err);
            }
        };

        fetchCortesYaCargados();
    }, [data]);



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
        const fetchCantidad = async () => {
            try {
                const response = await fetch("http://localhost:3000/allProducts");
                const allData = await response.json();

                console.log("Data del remito:", data);
                console.log("Productos recibidos:", allData);

                const cortesDelRemito = allData.filter(item => item.id === data?.id);
                console.log("Filtrados por remito:", cortesDelRemito);

                const cantidadTotal = cortesDelRemito.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
                console.log("Cantidad total:", cantidadTotal);

                setCantidad(cantidadTotal);
            } catch (err) {
                console.error("Error al obtener cantidad:", err);
            }
        };

        if (data?.id) {
            fetchCantidad();
        }
    }, [data]);


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

    const handleGuardarObservacion = async () => {
        if (!formData.observacionId) {
            console.log('No hay ID de observación para actualizar');
            return;
        }

        try {
            const resultado = await actualizarObservacion(formData.observacionId, formData.observaciones);
            console.log('Observación actualizada:', resultado);
            alert('Observación guardada correctamente');
        } catch (error) {
            console.error('Error al guardar observación:', error);
            alert('Error al guardar la observación. Por favor, intente nuevamente.');
        }
    };



    const actualizarObservacion = async (observacionId, nuevoTexto) => {
        try {

            const response = await fetch(`http://localhost:3000/observations-edit/${observacionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ observation: nuevoTexto }),
            });

            if (!response.ok) {
                throw new Error('No se pudo actualizar la observación');
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Error al actualizar observación:', error);
            throw error;
        }
    };
    const opcionesCortes = cortes.map((corte) => ({
        value: corte.nombre,
        label: corte.nombre,
    }));

    const handleGuardar = async () => {
        setSaving(true);
        if (cortesAgregados.length === 0) {
            alert("No hay cortes agregados para guardar.");
            return;
        }

        try {

            const payload = {
                cortes: cortesAgregados,
                observacion: formData.observaciones?.trim() || null,
            };
            if (isEditing) {
                await handleGuardarObservacion()
                const payloadMeat = {
                    cortes: cortesAgregados,
                }
                // Lógica para edición
                const response = await fetch(`http://localhost:3000/meat-income-edit/${data.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payloadMeat),
                });

                if (!response.ok) throw new Error("Error al editar los cortes");

                const updatePayload = {
                    cantidad_animales_cargados: totalAnimalesCargados,
                    cantidad_cabezas_cargadas: totalCabezasCargadas,
                    peso_total_neto_cargado: totalKgNeto,
                };

                const updateResponse = await fetch(`http://localhost:3000/updateBillSupplier/${data.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatePayload),
                });

                if (!updateResponse.ok) throw new Error("Error al actualizar el remito");

                alert("Cortes editados correctamente.");
                setCortesAgregados([]);
                navigate("/operator-panel");

            } else {
                const response = await fetch(`http://localhost:3000/addProducts/${data.id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) throw new Error("Error al guardar los cortes");


                const updatePayload = {
                    cantidad_animales_cargados: totalAnimalesCargados,
                    cantidad_cabezas_cargadas: totalCabezasCargadas,
                    peso_total_neto_cargado: totalKgNeto,
                };

                const updateResponse = await fetch(`http://localhost:3000/updateBillSupplier/${data.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatePayload),
                });

                if (!updateResponse.ok) throw new Error("Error al actualizar el remito");

                alert("Cortes y datos de resumen guardados correctamente.");
                setCortesAgregados([]);
                navigate("/operator-panel");

            }
        } catch (err) {
            console.error("Error al guardar los datos:", err);
            alert("Ocurrió un error al guardar los datos.");
        }

        setSaving(false);
    };



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

        setFormData(prev => ({
            ...prev,
            tipo: "",
            cabeza: 0,
            cantidad: 0,
            pesoProveedor: 0,
            pesoBruto: 0,
            tara: 0,
            garron: "",
        }));
        setTaraSeleccionadaId("");
    };
    const eliminarCorteBD = async (id) => {
        const response = await fetch(`http://localhost:3000/provider-item-delete/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("No se pudo eliminar el corte");
        }
    };

    const eliminarCorte = async (index) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el corte de la lista.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            const corte = cortesAgregados[index];

            if (corte.id) {
                try {
                    await eliminarCorteBD(corte.id);
                } catch (error) {
                    console.error("Error al eliminar de la base de datos:", error);
                    return;
                }
            }

            setCortesAgregados(prev => prev.filter((_, i) => i !== index));

            Swal.fire('Eliminado', 'El corte ha sido eliminado.', 'success');
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR');
    };

    const sinFlecha = {
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null
    };



    const totalKgNeto = cortesAgregados.reduce((acc, item) => acc + item.pesoNeto, 0);
    const pesoTotalRomaneo = data?.total_weight ?? 0;
    const diferenciaPeso = totalKgNeto - pesoTotalRomaneo;
    const porcentajeDiferencia = pesoTotalRomaneo > 0 ? (diferenciaPeso / pesoTotalRomaneo) * 100 : 0;

    let colorDiferencia = "blue";
    if (porcentajeDiferencia < 0) colorDiferencia = "red";
    else if (porcentajeDiferencia > 0) colorDiferencia = "green";

    // Suma total de animales cargados (cantidad)
    const totalAnimalesCargados = cortesAgregados.reduce((acc, item) => acc + item.cantidad, 0);

    // Suma total de cabezas cargadas
    const totalCabezasCargadas = cortesAgregados.reduce((acc, item) => acc + item.cabeza, 0);

    const cortesPorPagina = 5;

    const cortesInvertidos = [...cortesAgregados].reverse();

    const indiceUltimoCorte = paginaActual * cortesPorPagina;
    const indicePrimerCorte = indiceUltimoCorte - cortesPorPagina;
    const cortesPaginados = cortesInvertidos.slice(indicePrimerCorte, indiceUltimoCorte);


    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!data) return <p>No se encontró el remito</p>;

    return (
        <div>
            <Navbar />
            <h1 className="title-mercaderia">Detalle Mercadería</h1>
            <div className="main-container">

                <div>

                    <div>
                        <div className="mercaderia-container">
                            <div className="mercaderia-info-row">
                                <div><p className="label">PROVEEDOR:</p><p>{data.supplier.toUpperCase()}</p></div>
                                <div><p className="label">TIPO DE INGRESO:</p><p>{data.income_state.toUpperCase()}</p></div>
                                <div><p className="label">HORARIO Y FECHA:</p><p>{formatTime(data.createdAt)}  {formatDate(data.createdAt)}</p></div>
                                <div><p className="label">N° COMPROBANTE ROMANEO:</p><p>{data.romaneo_number}</p></div>
                            </div>
                            <div className="mercaderia-info-row">
                                <div><p className="label">PESO TOTAL DECLARADO EN ROMANEO:</p><p>{data.total_weight} KG</p></div>
                                <div><p className="label">CANTIDAD CABEZAS:</p><p>{data.head_quantity}</p></div>
                                <div><p className="label">CANTIDAD ANIMALES:</p><p>{cantidad !== null ? cantidad : "..."}</p></div>
                                <div><p className="label">COMPROBANTE INTERNO:</p><p>{data.id}</p></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="formulario-corte">


                    <div className="form-group">
                        <div>
                            <label>TIPO</label>

                            <Select
                                className="custom-select"
                                components={sinFlecha}
                                classNamePrefix="mi-select"
                                options={opcionesCortes}
                                onChange={(selected) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        tipo: selected?.value || "",
                                    }))
                                }
                                value={opcionesCortes.find((o) => o.value === formData.tipo) || null}
                                placeholder=""
                                isClearable
                                menuPortalTarget={document.body}
                                styles={{
                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                    menuList: (base) => ({
                                        ...base,
                                        maxHeight: 150, // aprox. 5 ítems visibles
                                        overflowY: 'auto',
                                    }),
                                }}
                            />


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

                        {cortesPaginados.map((corte, index) => (
                            <div key={index + indicePrimerCorte} className="corte-mostrado">
                                <div><p className="dato">{corte.tipo}</p></div>
                                <div><p className="dato">{corte.garron}</p></div>
                                <div><p className="dato">{corte.cabeza}</p></div>
                                <div><p className="dato">{corte.cantidad}</p></div>
                                <div><p className="dato">{corte.pesoProveedor}</p></div>
                                <div><p className="dato">{corte.pesoBruto}</p></div>
                                <div><p className="dato">{corte.tara}</p></div>
                                <div><p className="dato">{corte.pesoNeto.toFixed(2)} kg</p></div>
                                <div>
                                    <button onClick={() => eliminarCorte(index + indicePrimerCorte)} className="btn-eliminar">X</button>
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <button
                                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                                disabled={paginaActual === 1}
                                style={{ marginRight: '1rem' }}
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPaginaActual(prev => (prev * cortesPorPagina < cortesAgregados.length ? prev + 1 : prev))}
                                disabled={paginaActual * cortesPorPagina >= cortesAgregados.length}
                            >
                                Siguiente
                            </button>
                        </div>
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
                                        <th>CANTIDAD</th>
                                        <th>CABEZAS</th>
                                        <th>KG NETO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cortesAgregados.map((corte, index) => (
                                        <tr key={index}>
                                            <td>{corte.tipo}</td>
                                            <td>{corte.cantidad}</td>
                                            <td>{corte.cabeza}</td>
                                            <td>{(corte.pesoNeto).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td><strong>Diferencia declarado en romaneo</strong></td>
                                        <td style={{ color: cantidad > totalAnimalesCargados ? 'red' : 'green' }}>
                                            {cantidad - totalAnimalesCargados}{' '}
                                            <span>
                                                (
                                                {cantidad > 0 ? (((cantidad - totalAnimalesCargados) / cantidad) * 100).toFixed(0) : 0}
                                                %)
                                            </span>
                                        </td>
                                        <td style={{ color: data.head_quantity > totalCabezasCargadas ? 'red' : 'green' }}>
                                            {data.head_quantity - totalCabezasCargadas}{' '}
                                            <span>
                                                (
                                                {((
                                                    ((data.head_quantity - totalCabezasCargadas) / data.head_quantity) *
                                                    100
                                                ).toFixed(0))}
                                                %)
                                            </span>
                                        </td>
                                        <td style={{ color: colorDiferencia }}>
                                            {diferenciaPeso.toFixed(2)}{' '}
                                            <span>
                                                (
                                                {porcentajeDiferencia > 0 ? '+' : ''}
                                                {porcentajeDiferencia.toFixed(2)}%
                                                )
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>

                            </table>
                        </div>

                        <label htmlFor="observaciones" style={{ display: 'block', marginTop: '1rem' }}>OBSERVACIONES</label>
                        <textarea
                            name="observaciones"
                            placeholder="Observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            style={{ width: '100%', minHeight: '80px', marginBottom: '1rem' }}
                        ></textarea>

                        <button
                            className="btn-agregar"
                            onClick={handleGuardar}
                            style={{ backgroundColor: '#007bff', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px' }}
                            disabled={saving}
                        >
                            {saving ? "Guardando..." : "Guardar y terminar carga"}
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default MeatManualIncome;