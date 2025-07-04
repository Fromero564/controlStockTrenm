import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from 'sweetalert2';
import Select from 'react-select';
import Navbar from "../../components/Navbar.jsx";
import "../../assets/styles/providerForm.css";

const ProviderForm = () => {
    const [tipoIngreso, setTipoIngreso] = useState("romaneo");
    const API_URL = import.meta.env.VITE_API_URL;
    const [errorCorteDuplicado, setErrorCorteDuplicado] = useState(false);
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
        if (id && cortes.length > 0) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`${API_URL}/chargeUpdateBillDetails/${id}`);
                    const data = await response.json();


                    setTipoIngreso(data.tipo_ingreso);
                    setUltimoRegistroFactura(data.internal_number);


                    if (Array.isArray(data.detalles)) {
                        const cortesMapeados = data.detalles.map(corte => {
                            const producto = cortes.find(p => p.nombre === corte.tipo || p.id === corte.tipo);
                            return {
                                id: corte.id,
                                tipo: corte.tipo,
                                nombre: producto?.nombre || corte.tipo,
                                cantidad: Number(corte.cantidad) || 0,
                                cabezas: Number(corte.cabezas) || 0,
                                cod: producto?.id || "",
                                categoria: producto?.categoria || ""
                            };
                        });
                        setCortesAgregados(cortesMapeados);
                        console.log("Cortes cargados:", cortesMapeados);
                    }


                    if (Array.isArray(data.congelados)) {
                        const congeladosMapeados = data.congelados.map(cong => {
                            const producto = cortes.find(p => p.nombre === cong.tipo || p.id === cong.tipo);
                            return {
                                id: cong.id,
                                tipo: cong.tipo,
                                nombre: producto?.nombre || cong.tipo,
                                cantidad: Number(cong.cantidad) || 0,
                                unidades: Number(cong.peso || cong.weight) || 0,


                                cod: producto?.id || "",
                                categoria: producto?.categoria || ""
                            };
                        });
                        setCongeladosAgregados(congeladosMapeados);
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
    }, [id, cortes]);


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
        const sinCortes = cortesAgregados.length === 0;
        const hayCongelados = congeladosAgregados.length > 0;

        if (sinCortes && hayCongelados) {
            setFormState(prev => ({ ...prev, pesoTotal: "0" }));
        }
    }, [cortesAgregados, congeladosAgregados]);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await fetch(`${API_URL}/product-name`);
                const data = await response.json();

                console.log(" Productos recibidos:", data);

                const productos = Array.isArray(data)
                    ? data
                        .filter(producto =>
                            ["externo", "ambos"].includes(
                                producto.product_general_category?.toLowerCase()
                            )
                        )
                        .map(producto => ({
                            id: producto.id,
                            nombre: producto.product_name,
                            categoria: producto.product_category,
                            general: producto.product_general_category,
                            cantidad: 0,
                        }))
                    : [];

                console.log(" Productos filtrados:", productos);

                setCortes(productos);
            } catch (err) {
                console.error(" Error al obtener productos:", err);
            }
        };
        fetchProductos()
    }, []);

    const opciones = cortes.map(corte => ({
        value: corte.id,
        label: corte.nombre
    }));

    const handleCorteChange = (e) => {
        const { name, value } = e.target;
        setNuevoCorte({ ...nuevoCorte, [name]: value });
    };

    const handleCongeladoChange = (e) => {
        const { name, value } = e.target;
        setNuevoCongelado({ ...nuevoCongelado, [name]: value });
    };

    const agregarCorte = () => {
        const seleccion = opciones.find(o => o.value === nuevoCorte.tipo);
        if (!seleccion || !nuevoCorte.cantidad || !nuevoCorte.cabezas) return;

        const productoSeleccionado = cortes.find(c => c.id === seleccion.value);
        if (!productoSeleccionado) {
            console.error("Producto seleccionado no encontrado en cortes.");
            return;
        }

        const nuevo = {
            tipo: seleccion.value, // ID para el backend
            nombre: seleccion.label, // Nombre legible para mostrar
            cantidad: nuevoCorte.cantidad,
            cabezas: nuevoCorte.cabezas,
            cod: seleccion.value,
            categoria: productoSeleccionado.categoria
        };

        if (cortesAgregados.some(c => c.tipo === nuevo.tipo)) {
            setErrorCorteDuplicado(true);
            return;
        }

        setCortesAgregados([...cortesAgregados, nuevo]);
        setNuevoCorte({ tipo: "", cantidad: "", cabezas: "" });
        setErrorCorteDuplicado(false);
    };


    const agregarCongelado = () => {
        if (!nuevoCongelado.tipo || nuevoCongelado.cantidad <= 0) return;

        const existe = congeladosAgregados.some(item => item.cod === nuevoCongelado.tipo);
        if (existe) {
            setErrorCongeladoDuplicado(true);
            return;
        }

        const producto = cortes.find(p => p.id === nuevoCongelado.tipo);
        if (!producto) {
            console.error("Producto no encontrado.");
            return;
        }

        const nuevoCongeladoCompleto = {
            tipo: producto.nombre,
            cantidad: Number(nuevoCongelado.cantidad),
            unidades: Number(nuevoCongelado.unidades),
            cod: producto.id,
            categoria: producto.categoria
        };

        setCongeladosAgregados([...congeladosAgregados, nuevoCongeladoCompleto]);
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

    const eliminarCongelado = async (index) => {
        const congelado = congeladosAgregados[index];

        const confirmacion = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el producto congelado.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacion.isConfirmed) return;

        if (congelado.id) {
            try {
                const response = await fetch(`${API_URL}/delete-bill-detail/${congelado.id}`, {
                    method: "DELETE"
                });

                if (!response.ok) throw new Error("Error al eliminar en backend");
            } catch (err) {
                console.error("Error eliminando congelado en backend:", err);
                Swal.fire('Error', 'No se pudo eliminar en el backend', 'error');
                return;
            }
        }

        setCongeladosAgregados(congeladosAgregados.filter((_, i) => i !== index));
        Swal.fire('Eliminado', 'El producto fue eliminado exitosamente.', 'success');
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            cortesAgregados.length === 0 &&
            (!mostrarCongelados || congeladosAgregados.length === 0)
        ) {
            Swal.fire('Error', 'Debe agregar al menos cortes comunes o productos congelados', 'error');
            return;
        }

        if (!formState.proveedor || formState.proveedor.trim() === "") {
            Swal.fire('Error', 'Debe seleccionar un proveedor', 'error');
            return;
        }

        const pesoTotalNumber = Number(formState.pesoTotal);
        const sinCortes = cortesAgregados.length === 0;
        const hayCongelados = congeladosAgregados.length > 0;

        if (
            isNaN(pesoTotalNumber) ||
            (pesoTotalNumber <= 0 && !(sinCortes && hayCongelados))
        ) {
            Swal.fire('Error', 'Debe ingresar un peso total válido', 'error');
            return;
        }


        const romaneoNumber = Number(formState.romaneo);
        if (isNaN(romaneoNumber) || romaneoNumber <= 0) {
            Swal.fire('Error', 'Debe ingresar un número de romaneo válido', 'error');
            return;
        }

        // Validar cortes y congelados completos:
        for (const [i, corte] of cortesAgregados.entries()) {
            if (!corte.tipo || !corte.cod || !corte.cantidad || !corte.categoria) {
                Swal.fire('Error', `Faltan datos en corte número ${i + 1}`, 'error');
                return;
            }
        }

        for (const [i, congelado] of congeladosAgregados.entries()) {
            if (!congelado.tipo || congelado.cantidad == null || congelado.unidades == null) {
                Swal.fire('Error', `Faltan datos en producto congelado número ${i + 1}`, 'error');
                return;
            }
        }


        const totalCantidadCortes = cortesAgregados.reduce((sum, corte) => sum + Number(corte.cantidad), 0);
        const totalCantidadCongelados = congeladosAgregados.reduce((sum, item) => sum + Number(item.cantidad), 0);
        const totalCantidad = totalCantidadCortes;

        const totalCabezas = cortesAgregados.reduce((sum, corte) => sum + Number(corte.cabezas), 0);

        const totalPesoCongelado = congeladosAgregados.reduce(
            (sum, item) => sum + Number(item.unidades || 0),
            0
        );

        const formData = {
            proveedor: formState.proveedor.trim(),
            pesoTotal: pesoTotalNumber,
            romaneo: romaneoNumber,
            cantidad: totalCantidad,
            cabezas: totalCabezas,
            cortes: cortesAgregados,
            tipoIngreso: tipoIngreso,
            congelados: mostrarCongelados ? congeladosAgregados : [],
            fresh_quantity: totalCantidadCongelados,
            fresh_weight: totalPesoCongelado
        };

        console.log("Datos a enviar:", formData);

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
                    : navigate(`/meat-manual-income/${productoId}`);
            } else {
                const errorText = await response.text();
                console.error("Error al enviar los datos. Status:", response.status);
                console.error("Respuesta del servidor:", errorText);
                Swal.fire('Error', `No se pudo enviar: ${errorText}`, 'error');
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            Swal.fire('Error', 'Error en la solicitud al servidor', 'error');
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
                                    name="tipoIngreso"
                                    value={val}
                                    checked={tipoIngreso === val}
                                    onChange={() => setTipoIngreso(val)}
                                />
                                <label>{val.toLocaleUpperCase()}</label>
                            </div>
                        ))}
                    </div>

                    <div className="provider-remit-romaneo">
                        <label className="label-provider-form">
                            PROVEEDOR:
                            <select
                                className="input"
                                value={formState.proveedor}
                                onChange={(e) => setFormState({ ...formState, proveedor: e.target.value })}
                            >
                                <option value="">Seleccionar proveedor</option>
                                {providers.map(provider => (
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
                            Otros productos
                        </label>
                    </div>

                    {/* CORTES */}
                    <div className="cortes-section">
                        <div className="corte-card">
                            {errorCorteDuplicado && <p style={{ color: "red" }}>Ya existe.</p>}
                            <div className="input-group">
                                <label>TIPO</label>
                                <Select
                                    options={opciones}
                                    value={opciones.find(o => o.value === nuevoCorte.tipo) || null}
                                    onChange={(selected) => setNuevoCorte({ ...nuevoCorte, tipo: selected?.value || "" })}
                                    placeholder="Producto"
                                    isClearable
                                />
                            </div>
                            <div className="input-group">
                                <label>CANTIDAD</label>
                                <input type="number" name="cantidad" value={nuevoCorte.cantidad} onChange={handleCorteChange} />
                            </div>
                            <div className="input-group">
                                <label>CABEZAS</label>
                                <input type="number" name="cabezas" value={nuevoCorte.cabezas} onChange={handleCorteChange} />
                            </div>
                            <button type="button" onClick={agregarCorte} className="btn-add">+</button>
                        </div>

                        {cortesAgregados.map((corte, i) => (
                            <div key={i} className="corte-card">
                                <div className="input-group"><label>TIPO</label><input readOnly value={corte.nombre
                                } /></div>
                                <div className="input-group"><label>CANTIDAD</label><input readOnly value={corte.cantidad} /></div>
                                <div className="input-group"><label>CABEZAS</label><input readOnly value={corte.cabezas} /></div>
                                <button type="button" onClick={() => eliminarCorte(i)} className="btn-delete">×</button>
                            </div>
                        ))}
                    </div>

                    {/* CONGELADOS */}
                    {mostrarCongelados && (
                        <div className="cortes-section">
                            <h4>OTROS PRODUCTOS</h4>
                            <div className="corte-card">
                                {errorCongeladoDuplicado && <p style={{ color: "red" }}>Ya existe.</p>}
                                <div className="input-group">
                                    <label>TIPO</label>
                                    <Select
                                        options={opciones}
                                        value={opciones.find(o => o.value === nuevoCongelado.tipo) || null}
                                        onChange={(selected) => setNuevoCongelado({ ...nuevoCongelado, tipo: selected?.value || "" })}
                                        placeholder="Producto"
                                        isClearable
                                    />
                                </div>
                                <div className="input-group">
                                    <label>CANTIDAD</label>
                                    <input type="number" name="cantidad" value={nuevoCongelado.cantidad} onChange={handleCongeladoChange} />
                                </div>
                                <div className="input-group">
                                    <label>PESO</label>
                                    <input type="number" name="unidades" value={nuevoCongelado.unidades} onChange={handleCongeladoChange} />
                                </div>
                                <button type="button" onClick={agregarCongelado} className="btn-add">+</button>
                            </div>

                            {congeladosAgregados.map((item, i) => (
                                <div key={i} className="corte-card">
                                    <div className="input-group"><label>TIPO</label><input readOnly value={item.tipo} /></div>
                                    <div className="input-group"><label>CANTIDAD</label><input readOnly value={item.cantidad} /></div>
                                    <div className="input-group"><label>PESO</label><input readOnly value={item.unidades} /></div>
                                    <button type="button" className="btn-delete" onClick={() => eliminarCongelado(i)}>×</button>
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
