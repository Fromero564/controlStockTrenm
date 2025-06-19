// ...imports
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from 'sweetalert2';
import Select from 'react-select';
import Navbar from "../../components/Navbar.jsx";
import "../../assets/styles/providerForm.css";

const ProviderForm = () => {
    const [tipoIngreso, setTipoIngreso] = useState("romaneo");
    const API_URL = import.meta.env.VITE_API_URL;
    const [errorProductoDuplicado, setErrorProductoDuplicado] = useState(false);
    const [errorCongeladoDuplicado, setErrorCongeladoDuplicado] = useState(false);
    const [providers, setProviders] = useState([]);
    const [cortes, setCortes] = useState([]);
    const [cortesAgregados, setCortesAgregados] = useState([]);
    const [congeladosAgregados, setCongeladosAgregados] = useState([]);
    const [ultimoRegistroFactura, setUltimoRegistroFactura] = useState([]);
    const [mostrarCongelados, setMostrarCongelados] = useState(false);
    const [formState, setFormState] = useState({ proveedor: "", pesoTotal: "", romaneo: "" });

    const [nuevoCorte, setNuevoCorte] = useState({ tipo: "", cantidad: 0, cabezas: 0 });
    const [nuevoCongelado, setNuevoCongelado] = useState({ tipo: "", cantidad: 0, unidades: 0 });

    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`${API_URL}/chargeUpdateBillDetails/${id}`);
                    const data = await response.json();

                    setTipoIngreso(data.tipo_ingreso);
                    setUltimoRegistroFactura(data.internal_number);
                    const cortesMapeados = data.detalles.map(corte => ({
                        id: corte.id,
                        tipo: corte.tipo || "",
                        cantidad: Number(corte.cantidad) || 0,
                        cabezas: Number(corte.cabezas) || 0
                    }));
                    setCortesAgregados(cortesMapeados);

                    // Si hay congelados en la respuesta:
                    if (data?.congelados) {
                        setCongeladosAgregados(data.congelados);
                        setMostrarCongelados(true);
                    }

                    setFormState({
                        proveedor: data.proveedor,
                        pesoTotal: data.peso_total,
                        romaneo: data.romaneo
                    });
                } catch (error) {
                    console.error("Error al obtener datos para editar:", error);
                }
            };
            fetchData();
        }
    }, [id]);

    useEffect(() => {
        fetch(`${API_URL}/allProviders`)
            .then(res => res.json())
            .then(data => setProviders(Array.isArray(data) ? data : data.providers || []))
            .catch(err => console.error("Error al obtener proveedores:", err));
    }, []);

    useEffect(() => {
        if (!id) {
            fetch(`${API_URL}/last-provider-bill`)
                .then(res => res.json())
                .then(data => {
                    const nuevoNumero = data?.id ? data.id + 1 : 1;
                    setUltimoRegistroFactura(nuevoNumero);
                })
                .catch(err => console.error("Error al obtener última factura:", err));
        }
    }, [id]);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await fetch(`${API_URL}/product-name`);
                const data = await response.json();
                const productosConCantidad = data.map((nombre, index) => ({
                    id: index + 1,
                    nombre,
                    cantidad: 0,
                }));
                setCortes(productosConCantidad);
            } catch (err) {
                console.error("Error al obtener productos:", err);
            }
        };
        fetchProductos();
    }, []);

    const opciones = cortes.map(corte => ({ value: corte.nombre, label: corte.nombre }));

    const handleCorteChange = (e) => {
        const { name, value } = e.target;
        setNuevoCorte({ ...nuevoCorte, [name]: value });
    };

    const handleCongeladoChange = (e) => {
        const { name, value } = e.target;
        setNuevoCongelado({ ...nuevoCongelado, [name]: value });
    };

    const agregarCorte = () => {
        if (!nuevoCorte.tipo || nuevoCorte.cantidad <= 0) return;

        const existe = cortesAgregados.some(corte => corte.tipo === nuevoCorte.tipo);
        if (existe) {
            setErrorProductoDuplicado(true);
            return;
        }
        setCortesAgregados([...cortesAgregados, nuevoCorte]);
        setNuevoCorte({ tipo: "", cantidad: 0, cabezas: 0 });
        setErrorProductoDuplicado(false);
    };

    const agregarCongelado = () => {
        if (!nuevoCongelado.tipo || nuevoCongelado.cantidad <= 0) return;

        const existe = congeladosAgregados.some(item => item.tipo === nuevoCongelado.tipo);
        if (existe) {
            setErrorCongeladoDuplicado(true);
            return;
        }
        setCongeladosAgregados([...congeladosAgregados, nuevoCongelado]);
        setNuevoCongelado({ tipo: "", cantidad: 0, unidades: 0 });
        setErrorCongeladoDuplicado(false);
    };

    const eliminarCorte = async (index) => {
        const corte = cortesAgregados[index];
        const confirmacion = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el corte seleccionado.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirmacion.isConfirmed) {
            if (corte.id) {
                try {
                    const response = await fetch(`${API_URL}/delete-bill-detail/${corte.id}`, { method: "DELETE" });
                    if (!response.ok) throw new Error("Error al eliminar en backend");
                } catch (err) {
                    console.error("Error eliminando en backend:", err);
                    Swal.fire('Error', 'No se pudo eliminar en el backend', 'error');
                    return;
                }
            }
            setCortesAgregados(cortesAgregados.filter((_, i) => i !== index));
            Swal.fire('Eliminado', 'El corte fue eliminado exitosamente.', 'success');
        }
    };

    const eliminarCongelado = (index) => {
        setCongeladosAgregados(congeladosAgregados.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const totalCantidad = cortesAgregados.length > 0
            ? cortesAgregados.reduce((sum, corte) => sum + Number(corte.cantidad), 0)
            : congeladosAgregados.reduce((sum, item) => sum + Number(item.cantidad), 0);

        const totalCabezas = cortesAgregados.length > 0
            ? cortesAgregados.reduce((sum, corte) => sum + Number(corte.cabezas), 0)
            : 0;

        const formData = {
            proveedor: formState.proveedor,
            pesoTotal: formState.pesoTotal,
            romaneo: formState.romaneo,
            cantidad: totalCantidad,
            cabezas: totalCabezas,
            cortes: cortesAgregados,
            tipoIngreso: tipoIngreso,
            congelados: mostrarCongelados ? congeladosAgregados : [],
        };

        console.log("Enviando datos al backend:", formData);

        try {
            const response = await fetch(id
                ? `${API_URL}/update-provider-bill/${id}`
                : `${API_URL}/uploadProduct`, {
                method: id ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                const productoId = data.id;
                tipoIngreso === "romaneo"
                    ? navigate("/meat-load")
                    : navigate(`/meat-manual-icome/${productoId}`);
            } else {
                console.error("Error al enviar los datos");
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="new-register-container">
                <form onSubmit={handleSubmit} className="form-container-provider">
                    <h2 className="form-title">{id ? "Editar Registro" : "Nuevo Registro"}</h2>

                    <div className="title-remit-div">
                        <label className="label-provider-form">TIPO DE INGRESO</label>
                        <label className="label-provider-form">N° COMPROBANTE: {ultimoRegistroFactura}</label>
                    </div>

                    <div className="radio-buttons">
                        {["romaneo", "manual"].map((val) => (
                            <div className="radius-style" key={val}>
                                <input
                                    type="radio"
                                    id={`${val}_check`}
                                    name="tipoIngreso"
                                    value={val}
                                    checked={tipoIngreso === val}
                                    onChange={() => setTipoIngreso(val)}
                                />
                                <label htmlFor={`${val}_check`}>{val.charAt(0).toUpperCase() + val.slice(1)}</label>
                            </div>
                        ))}
                    </div>

                    <div className="provider-remit-romaneo">
                        <label className="label-provider-form">
                            PROVEEDOR:
                            <select
                                name="proveedor"
                                className="input"
                                value={formState.proveedor}
                                onChange={(e) => setFormState({ ...formState, proveedor: e.target.value })}
                            >
                                <option value="">Seleccionar proveedor</option>
                                {providers.map((provider) => (
                                    <option key={provider.id} value={provider.provider_name}>
                                        {provider.provider_name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="label-provider-form">
                            Nº COMPROBANTE ROMANEO:
                            <input
                                type="number"
                                name="romaneo"
                                className="input"
                                value={formState.romaneo}
                                onChange={(e) => setFormState({ ...formState, romaneo: e.target.value })}
                            />
                        </label>
                    </div>

                    <div className="checkbox-congelado">
                        <label>
                            <input
                                type="checkbox"
                                checked={mostrarCongelados}
                                onChange={(e) => setMostrarCongelados(e.target.checked)}
                            />
                            Productos congelados
                        </label>
                    </div>

                    {/* CORTES FRESCOS */}
                    <div className="cortes-section">
                        <div className="corte-card">
                            <div className="input-group">
                                <label>TIPO</label>
                                {errorProductoDuplicado && <p style={{ color: "red" }}>Este producto ya fue agregado.</p>}
                                <Select
                                    options={opciones}
                                    onChange={(selected) => setNuevoCorte({ ...nuevoCorte, tipo: selected?.value || "" })}
                                    value={opciones.find(o => o.value === nuevoCorte.tipo) || null}
                                    placeholder={"Producto"}
                                    isClearable
                                />
                            </div>
                            <div className="input-group">
                                <label>CANTIDAD</label>
                                <input type="number" name="cantidad" value={nuevoCorte.cantidad} onChange={handleCorteChange} min="0" />
                            </div>
                            <div className="input-group">
                                <label>CABEZAS</label>
                                <input type="number" name="cabezas" value={nuevoCorte.cabezas} onChange={handleCorteChange} min="0" />
                            </div>
                            <button type="button" onClick={agregarCorte} className="btn-add">+</button>
                        </div>

                        {cortesAgregados.map((corte, index) => (
                            <div key={index} className="corte-card">
                                <div className="input-group"><label>TIPO</label><input type="text" value={corte.tipo} readOnly /></div>
                                <div className="input-group"><label>CANTIDAD</label><input type="number" value={corte.cantidad} readOnly /></div>
                                <div className="input-group"><label>CABEZAS</label><input type="number" value={corte.cabezas} readOnly /></div>
                                <button type="button" className="btn-delete" onClick={() => eliminarCorte(index)}>×</button>
                            </div>
                        ))}
                    </div>

                    {/* CONGELADOS */}
                    {mostrarCongelados && (
                        <div className="cortes-section">
                            <h4>Congelados</h4>
                            <div className="corte-card">
                                {errorCongeladoDuplicado && <p style={{ color: "red" }}>Este producto ya fue agregado.</p>}
                                <div className="input-group">
                                    <label>TIPO</label>
                                    <Select
                                        options={opciones}
                                        onChange={(selected) => setNuevoCongelado({ ...nuevoCongelado, tipo: selected?.value || "" })}
                                        value={opciones.find(o => o.value === nuevoCongelado.tipo) || null}
                                        placeholder={"Producto"}
                                        isClearable
                                    />
                                </div>
                                <div className="input-group">
                                    <label>CANTIDAD</label>
                                    <input type="number" name="cantidad" value={nuevoCongelado.cantidad} onChange={handleCongeladoChange} min="0" />
                                </div>
                                <div className="input-group">
                                    <label>PESO</label>
                                    <input type="number" name="unidades" value={nuevoCongelado.unidades} onChange={handleCongeladoChange} min="0" />
                                </div>
                                <button type="button" onClick={agregarCongelado} className="btn-add">+</button>
                            </div>

                            {congeladosAgregados.map((item, index) => (
                                <div key={index} className="corte-card">
                                    <div className="input-group"><label>TIPO</label><input type="text" value={item.tipo} readOnly /></div>
                                    <div className="input-group"><label>KG</label><input type="number" value={item.cantidad} readOnly /></div>
                                    <div className="input-group"><label>UNIDADES</label><input type="number" value={item.unidades} readOnly /></div>
                                    <button type="button" className="btn-delete" onClick={() => eliminarCongelado(index)}>×</button>
                                </div>
                            ))}
                        </div>
                    )}

                    <label className="label-provider-form">
                        PESO DECLARADO EN ROMANEO (KG):
                        <input
                            type="number"
                            name="pesoTotal"
                            step="0.01"
                            className="input"
                            min="0"
                            value={formState.pesoTotal}
                            onChange={(e) => setFormState({ ...formState, pesoTotal: e.target.value })}
                        />
                    </label>

                    <div className="button-container">
                        <button type="submit" className="button-primary">
                            {tipoIngreso === "romaneo" ? "Agregar y continuar a pesaje" : "Cargar y completar carga manual"}
                        </button>
                        <button type="button" className="button-secondary" onClick={() => navigate("/operator-panel")}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProviderForm;
