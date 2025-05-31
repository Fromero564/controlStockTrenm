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
    const [providers, setProviders] = useState([]);
    const [cortes, setCortes] = useState([]);
    const [cortesAgregados, setCortesAgregados] = useState([]);
    const [ultimoRegistroFactura, setUltimoRegistroFactura] = useState([]);
    const [formState, setFormState] = useState({
        proveedor: "",
        pesoTotal: "",
        romaneo: ""
    });
    const [nuevoCorte, setNuevoCorte] = useState({
        tipo: "",
        cantidad: 0,
        cabezas: 0,
    });

    const navigate = useNavigate();

    const { id } = useParams();

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`${API_URL}/chargeUpdateBillDetails/${id}`);
                    const data = await response.json();

                    console.log(data)
                    setTipoIngreso(data.tipo_ingreso);
                    setUltimoRegistroFactura(data.internal_number);
                    const cortesMapeados = data.detalles.map(corte => ({
                        id: corte.id,
                        tipo: corte.tipo || "",
                        cantidad: Number(corte.cantidad) || 0,
                        cabezas: Number(corte.cabezas) || 0
                    }));
                    setCortesAgregados(cortesMapeados);


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
                    const response = await fetch(`${API_URL}/delete-bill-detail/${corte.id}`, {
                        method: "DELETE"
                    });

                    if (!response.ok) {
                        throw new Error("Error al eliminar el corte en el backend");
                    }
                } catch (err) {
                    console.error("Error eliminando en backend:", err);
                    Swal.fire('Error', 'No se pudo eliminar el corte en el backend', 'error');
                    return;
                }
            }

            const nuevosCortes = cortesAgregados.filter((_, i) => i !== index);
            setCortesAgregados(nuevosCortes);

            Swal.fire('Eliminado', 'El corte fue eliminado exitosamente.', 'success');
        }
    };



    useEffect(() => {
        fetch(`${API_URL}/allProviders`)
            .then((response) => response.json())
            .then((data) => {
                const lista = Array.isArray(data) ? data : data.providers || [];
                setProviders(lista);
            })
            .catch((error) => console.error("Error al obtener productos:", error));
    }, []);

    useEffect(() => {
        if (!id) {
            fetch(`${API_URL}/last-provider-bill`)
                .then((response) => response.json())
                .then((data) => {
                    const nuevoNumero = data?.id ? data.id + 1 : 1;
                    setUltimoRegistroFactura(nuevoNumero);
                })
                .catch((error) => console.error("Error al obtener ultima factura:", error));
        }
    }, [id]);
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await fetch(`${API_URL}/product-primary-name`);
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
            }
        };

        fetchProductos();
    }, []);
    const opciones = cortes.map(corte => ({
        value: corte.nombre,
        label: corte.nombre
    }));
    const handleCorteChange = (e) => {
        const { name, value } = e.target;
        setNuevoCorte({
            ...nuevoCorte,
            [name]: value,
        });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalCantidad = cortesAgregados.reduce((sum, corte) => sum + Number(corte.cantidad), 0);
        const totalCabezas = cortesAgregados.reduce((sum, corte) => sum + Number(corte.cabezas), 0);

        const formData = {
            proveedor: formState.proveedor,
            pesoTotal: formState.pesoTotal,
            romaneo: formState.romaneo,
            cantidad: totalCantidad,
            cabezas: totalCabezas,
            cortes: cortesAgregados,
            tipoIngreso: tipoIngreso,
        };

        try {
            const response = await fetch(id
                ? `${API_URL}/update-provider-bill/${id}`
                : `${API_URL}/uploadProduct`, {

                method: id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                const data = await response.json();
                const productoId = data.id;
                const romaneo = formData.romaneo;

                if (tipoIngreso === "romaneo") {
                    navigate('/meat-load');
                } else {
                    navigate(`/meat-manual-icome/${productoId}`);
                }

            } else {
                console.error("Error al enviar los datos");
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };

    const handleRadioChange = (e) => {
        setTipoIngreso(e.target.value);
    };
    // const eliminarCorte = (index) => {
    //     const nuevosCortes = cortesAgregados.filter((_, i) => i !== index);
    //     setCortesAgregados(nuevosCortes);
    // };
    return (
        <div>
            <Navbar />
            <div className="new-register-container">
                <form onSubmit={handleSubmit} className="form-container-provider">
                    <h2 className="form-title">{id ? "Editar Registro" : "Nuevo Registro"}</h2>
                    <div className="title-remit-div">
                        <label className="label-provider-form">
                            TIPO DE INGRESO 
                        </label>
                         <label className="label-provider-form">
                          N° COMPROBANTE:  {ultimoRegistroFactura}
                         </label>
                    </div>
                    <div className="radio-buttons">
                        <div className="radius-style">
                            <input
                                type="radio"
                                id="romaneo_check"
                                name="tipoIngreso"
                                value="romaneo"
                                checked={tipoIngreso === "romaneo"}
                                onChange={handleRadioChange}
                            />
                            <label htmlFor="romaneo_check">Romaneo</label>
                        </div>

                        <div className="radius-style">
                            <input
                                type="radio"
                                id="manual_check"
                                name="tipoIngreso"
                                value="manual"
                                checked={tipoIngreso === "manual"}
                                onChange={handleRadioChange}
                            />
                            <label htmlFor="manual_check">Manual</label>
                        </div>
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
                    {
                        <div className="cortes-section">


                            <div className="corte-card">
                                <div className="input-group">
                                    <label>TIPO</label>
                                    {errorProductoDuplicado && (
                                        <p style={{ color: "red", marginBottom: "5px" }}>
                                            Este producto ya fue agregado.
                                        </p>
                                    )}
                                    <Select
                                        options={opciones}
                                        onChange={(selected) =>
                                            setNuevoCorte({ ...nuevoCorte, tipo: selected?.value || "" })
                                        }
                                        value={opciones.find(o => o.value === nuevoCorte.tipo) || null}
                                        placeholder={"Producto"}
                                        isClearable
                                    />
                                </div>
                                <div className="input-group">
                                    <label>CANTIDAD</label>
                                    <input
                                        type="number"
                                        name="cantidad"
                                        value={nuevoCorte.cantidad}
                                        onChange={handleCorteChange}
                                        min="0"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>CABEZAS</label>
                                    <input
                                        type="number"
                                        name="cabezas"
                                        value={nuevoCorte.cabezas}
                                        onChange={handleCorteChange}
                                        min="0"
                                    />
                                </div>
                                <button type="button" onClick={agregarCorte} className="btn-add">
                                    +
                                </button>


                            </div>
                            {cortesAgregados.map((corte, index) => (
                                <div key={index} className="corte-card">
                                    <div className="input-group">
                                        <label>TIPO</label>
                                        <input type="text" value={corte.tipo} readOnly />
                                    </div>
                                    <div className="input-group">
                                        <label>CANTIDAD</label>
                                        <input type="number" value={corte.cantidad} readOnly />
                                    </div>
                                    <div className="input-group">
                                        <label>CABEZAS</label>
                                        <input type="number" value={corte.cabezas} readOnly />
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-delete"
                                        onClick={() => eliminarCorte(index)}
                                    >
                                        ×
                                    </button>
                                </div>

                            ))}
                        </div>

                    }

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
