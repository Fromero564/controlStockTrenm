import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import "./styles/providerForm.css";

const ProviderForm = () => {
    const [tipoIngreso, setTipoIngreso] = useState("romaneo");
    const [providers, setProviders] = useState([]);
    const [cortes, setCortes] = useState([]);
    const [cortesAgregados, setCortesAgregados] = useState([]);
    const [ultimoRegistroFactura,setUltimoRegistroFactura]=useState([]);
    const [nuevoCorte, setNuevoCorte] = useState({
        tipo: "",
        cantidad: 0,
        cabezas: 0,
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3000/allProviders")
            .then((response) => response.json())
            .then((data) => setProviders(data))
            .catch((error) => console.error("Error al obtener productos:", error));
    }, []);

    useEffect(() => {
        fetch("http://localhost:3000/last-provider-bill")
            .then((response) => response.json())
            .then((data) => {
            
                const nuevoNumero = data?.id ? data.id + 1 : 1;
                setUltimoRegistroFactura(nuevoNumero);
            })
            .catch((error) => console.error("Error al obtener ultima factura:", error));
    }, []);
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
            }
        };

        fetchProductos();
    }, []);

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
        if (existe) return; 
    
        setCortesAgregados([...cortesAgregados, nuevoCorte]);
        setNuevoCorte({ tipo: "", cantidad: 0, cabezas: 0 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalCantidad = cortesAgregados.reduce((sum, corte) => sum + Number(corte.cantidad), 0);
        const totalCabezas = cortesAgregados.reduce((sum, corte) => sum + Number(corte.cabezas), 0);

        const formData = {
            proveedor: e.target.proveedor.value,
            pesoTotal: e.target.pesoTotal.value,
            romaneo: e.target.romaneo.value,
            cantidad: totalCantidad,
            cabezas: totalCabezas,
            cortes: cortesAgregados,
            tipoIngreso: tipoIngreso,
        };

        try {
            const response = await fetch("http://localhost:3000/uploadProduct", {
                method: "POST",
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
    const eliminarCorte = (index) => {
        const nuevosCortes = cortesAgregados.filter((_, i) => i !== index);
        setCortesAgregados(nuevosCortes);
    };
    return (
        <div>
            <Navbar />
            <div className="">
                <form onSubmit={handleSubmit} className="form-container-provider">
                    <h2 className="form-title">INGRESAR MERCADERIA</h2>

                    <label className="label-provider-form">
                        TIPO DE INGRESO
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
                    </label>
                    <div className="provider-remit-romaneo">
                        <label className="label-provider-form">
                            PROVEEDOR:
                            <select name="proveedor" className="input">
                                {providers.map((provider) => (
                                    <option key={provider.id} value={provider.provider_name}>
                                        {provider.provider_name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="label-provider-form">
                            Nº COMPROBANTE ROMANEO:
                            <input type="number" name="romaneo" className="input" />
                        </label>
                    </div>
                    {
                        <div className="cortes-section">


                            <div className="corte-card">
                                <div className="input-group">
                                    <label>TIPO</label>
                                    <select name="tipo" value={nuevoCorte.tipo} onChange={handleCorteChange}>
                                        <option value="">Seleccionar corte</option>
                                        {cortes.map((corte) => (
                                            <option key={corte.id} value={corte.nombre}>{corte.nombre}</option>
                                        ))}
                                    </select>
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
                        <input type="number" name="pesoTotal" className="input" />
                    </label>

                    <label className="label-provider-form">
                       SU COMPRABANTE INTERNO ES:
                        <input type="number" name="pesoFinal" className="input"   value={ultimoRegistroFactura} disabled/>
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
