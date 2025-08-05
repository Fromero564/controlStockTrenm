import React, { useState, useEffect } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";
import '../../assets/styles/loadNewPriceList.css';

const API_URL = import.meta.env.VITE_API_URL;
const PRODUCTOS_URL = `${API_URL}/all-products-availables`;
const CLIENTES_URL = `${API_URL}/allclients`;

const ITEMS_PER_PAGE = 5;

const LoadNewPriceList = () => {
    const [nombreLista, setNombreLista] = useState("");
    const [clientesOptions, setClientesOptions] = useState([]);
    const [clientesSeleccionados, setClientesSeleccionados] = useState([]);
    const [productos, setProductos] = useState([]);
    const [checkedProducts, setCheckedProducts] = useState({});
    const [precios, setPrecios] = useState({});
    const [pagina, setPagina] = useState(1);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        fetch(CLIENTES_URL)
            .then(res => res.json())
            .then(data => {
                setClientesOptions(
                    data.map(cliente => ({
                        value: cliente.id,
                        label: cliente.client_name
                    }))
                );
            });
    }, []);

    useEffect(() => {
        fetch(PRODUCTOS_URL)
            .then(res => res.json())
            .then(data => {
                setProductos(data);
                const preciosIniciales = {};
                const checksIniciales = {};
                data.forEach(p => {
                    preciosIniciales[p.id] = { costo: 0, sinIva: 0, conIva: 0 };
                    checksIniciales[p.id] = true;
                });
                setPrecios(preciosIniciales);
                setCheckedProducts(checksIniciales);
            });
    }, []);

    const handleCheck = (id) => {
        setCheckedProducts({ ...checkedProducts, [id]: !checkedProducts[id] });
    };

    const handlePrecioChange = (id, field, value) => {
        let newValue = value;
        if (field === "sinIva") {
            const sinIva = parseFloat(value) || 0;
            const conIva = +(sinIva * 1.105).toFixed(2);
            setPrecios({
                ...precios,
                [id]: {
                    ...precios[id],
                    sinIva: newValue,
                    conIva: conIva
                }
            });
        } else {
            setPrecios({
                ...precios,
                [id]: {
                    ...precios[id],
                    [field]: newValue
                }
            });
        }
    };

    const productosFiltrados = productos.filter(p =>
        p.product_name.toLowerCase().includes(busqueda.toLowerCase())
    );
    const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE);
    const productosPagina = productosFiltrados.slice((pagina - 1) * ITEMS_PER_PAGE, pagina * ITEMS_PER_PAGE);

    const handlePaginaChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPaginas) setPagina(newPage);
    };

    const handleCancelar = () => window.history.back();

    const handleEnviar = async () => {
        if (!nombreLista.trim()) {
            Swal.fire("Error", "Debe ingresar un nombre de lista", "error");
            return;
        }

        const clientsIds = clientesSeleccionados.map(c => c.value);

        const productosSeleccionados = productos
            .filter(p => checkedProducts[p.id])
            .map(p => ({
                id: p.id,
                name: p.product_name,
                unidad_venta: p.category?.category_name === "PRINCIPAL" ? "UN" : "KG",
                costo: parseFloat(precios[p.id]?.costo) || 0,
                precio_sin_iva: parseFloat(precios[p.id]?.sinIva) || 0,
                precio_con_iva: parseFloat(precios[p.id]?.conIva) || 0
            }));

        if (productosSeleccionados.length === 0) {
            Swal.fire("Error", "Debe seleccionar al menos un producto", "error");
            return;
        }

        const hayCero = productosSeleccionados.some(
            p =>
                p.costo === 0 ||
                p.precio_sin_iva === 0 ||
                p.precio_con_iva === 0
        );

        if (hayCero) {
            const { isConfirmed } = await Swal.fire({
                title: "Hay productos con valores en $0",
                text: "¿Desea continuar de todos modos?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, continuar",
                cancelButtonText: "No, cancelar"
            });

            if (!isConfirmed) return;
        }

        try {
            const response = await fetch(`${API_URL}/create-new-price-list`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: nombreLista,
                    clients: clientsIds,
                    products: productosSeleccionados
                })
            });
            const data = await response.json();
            if (data.ok) {
                await Swal.fire("¡Éxito!", "¡Lista creada correctamente!", "success");
                window.history.back();
            } else {
                Swal.fire("Error", data.msg || "Error al crear la lista", "error");
            }
        } catch (err) {
            Swal.fire("Error", "Error al enviar los datos", "error");
        }
    };

    return (
        <div className="price-list-bg">
            <Navbar />
            <div className="price-list-container">
                <button className="price-list-volver-btn" onClick={handleCancelar}>⬅ Volver</button>
                <h2 className="price-list-title">NUEVA DE LISTA DE PRECIO</h2>
                <div className="price-list-form-row">
                    <div className="price-list-form-group">
                        <label className="price-list-label">NOMBRE LISTA</label>
                        <input
                            type="text"
                            value={nombreLista}
                            onChange={e => setNombreLista(e.target.value)}
                            placeholder="Nombre"
                            className="price-list-input"
                        />
                    </div>
                    <div className="price-list-form-group" style={{ flex: 2 }}>
                        <label className="price-list-label">ASOCIAR CLIENTE/S</label>
                        <Select
                            isMulti
                            value={clientesSeleccionados}
                            onChange={setClientesSeleccionados}
                            options={clientesOptions}
                            classNamePrefix="react-select"
                            placeholder="Agregar"
                            className="price-list-select"
                        />
                    </div>
                </div>

                <div className="price-list-buscar-row">
                    <label className="price-list-label">BUSCAR</label>
                    <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                        <input
                            className="price-list-buscar-input"
                            placeholder="Buscar producto..."
                            value={busqueda}
                            onChange={e => {
                                setBusqueda(e.target.value);
                                setPagina(1);
                            }}
                        />
                        <button className="price-list-buscar-btn" tabIndex={-1} disabled>
                            Buscar
                        </button>
                    </div>
                </div>

                <div className="price-list-table-container">
                    <table className="price-list-table">
                        <thead className="price-list-table-head">
                            <tr>
                                <th className="price-list-th">ACCIÓN</th>
                                <th className="price-list-th" style={{ textAlign: "left" }}>PRODUCTO</th>
                                <th className="price-list-th">UNIDAD DE VENTA</th>
                                <th className="price-list-th">COSTO</th>
                                <th className="price-list-th">PRECIO S/IVA</th>
                                <th className="price-list-th">PRECIO C/IVA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productosPagina.map((prod, idx) => (
                                <tr key={prod.id} className={idx % 2 === 0 ? "price-list-tr-par" : "price-list-tr-impar"}>
                                    <td className="price-list-td">
                                        <input
                                            type="checkbox"
                                            className="price-list-checkbox"
                                            checked={checkedProducts[prod.id] || false}
                                            onChange={() => handleCheck(prod.id)}
                                        />
                                    </td>
                                    <td className="price-list-td price-list-product-name">{prod.product_name}</td>
                                    <td className="price-list-td price-list-unit">
                                        {prod.category?.category_name === "PRINCIPAL"
                                            ? "Unidad (Pieza)"
                                            : "Kilogramo (kg)"
                                        }
                                    </td>
                                    <td className="price-list-td">
                                        <input
                                            type="number"
                                            min={0}
                                            value={precios[prod.id]?.costo ?? 0}
                                            onChange={e => handlePrecioChange(prod.id, "costo", e.target.value)}
                                            className="price-list-price-input"
                                        />
                                    </td>
                                    <td className="price-list-td">
                                        <input
                                            type="number"
                                            min={0}
                                            value={precios[prod.id]?.sinIva ?? 0}
                                            onChange={e => handlePrecioChange(prod.id, "sinIva", e.target.value)}
                                            className="price-list-price-input"
                                        />
                                    </td>
                                    <td className="price-list-td">
                                        <input
                                            type="number"
                                            min={0}
                                            value={precios[prod.id]?.conIva ?? 0}
                                            className="price-list-price-input"
                                            readOnly
                                            tabIndex={-1}
                                            style={{ background: "#f7f7f7", color: "#666", cursor: "not-allowed" }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="price-list-pagination">
                        <button
                            className="price-list-pagination-btn"
                            onClick={() => handlePaginaChange(pagina - 1)}
                            disabled={pagina === 1}
                        >Anterior</button>
                        <span className="price-list-pagination-info">
                            Página {pagina} de {totalPaginas}
                        </span>
                        <button
                            className="price-list-pagination-btn"
                            onClick={() => handlePaginaChange(pagina + 1)}
                            disabled={pagina === totalPaginas}
                        >Siguiente</button>
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 28 }}>
                    <button
                        className="price-list-pagination-btn"
                        style={{ background: "#fff", border: "1.5px solid #1172B8", color: "#1172B8" }}
                        onClick={handleCancelar}
                        type="button"
                    >Cancelar</button>
                    <button
                        className="price-list-pagination-btn"
                        style={{ background: "#1172B8", color: "#fff", border: "none" }}
                        onClick={handleEnviar}
                        type="button"
                    >Enviar</button>
                </div>
            </div>
        </div>
    );
}

export default LoadNewPriceList;
