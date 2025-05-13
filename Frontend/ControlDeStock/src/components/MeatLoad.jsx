import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import Navbar from "./Navbar.jsx";
import Swal from "sweetalert2";
import "./styles/meatLoad.css";

const MeatLoad = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState(""); // AGREGADO
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetch("http://localhost:3000/allproducts")
            .then((response) => response.json())
            .then((data) => setProducts(data))
            .catch((error) => console.error("Error al obtener productos:", error));
    }, []);

    const handleEdit = (id, internalNumber) => {
        navigate(`/meat-income/${id}/${internalNumber}`);
    };

    const handleDelete = (id, numeroRomaneo) => {
        Swal.fire({
            title: "Eliminar ingreso",
            html: `Vas a eliminar el ingreso con <strong>N° Romaneo ${numeroRomaneo}</strong> ¿Estás seguro?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar ingreso",
            cancelButtonText: "No, cancelar",
            customClass: {
                popup: "custom-popup",
                confirmButton: "custom-confirm-button",
                cancelButton: "custom-cancel-button"
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`http://localhost:3000/products/${id}`, {
                    method: "DELETE",
                })
                    .then((response) => {
                        if (response.ok) {
                            setProducts(products.filter((product) => product.id !== id));
                            Swal.fire("Eliminado", "El ingreso ha sido eliminado.", "success");
                        } else {
                            Swal.fire("Error", "No se pudo eliminar el ingreso.", "error");
                        }
                    })
                    .catch((error) => console.error("Error al eliminar:", error));
            }
        });
    };

    // FILTRO POR N° INGRESO (id)
    const filteredProducts = products.filter((product) =>
        product.id.toString().includes(search)
    );

    // PAGINACIÓN
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container">
            <h2>Mercaderías</h2>
                <div className="header">
                   
                    <div className="search-section">
                        <label htmlFor="search">N°Comprobante</label>
                        <div className="search-input-label">
                        <input
                            type="text"
                            id="search"
                            placeholder="Buscar por N°Comprobante"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="search-input"
                        />
                        <button className="search-button" onClick={() => setCurrentPage(1)}>Buscar</button>
                        </div>
                    </div>

                    
                    <button className="new-button" onClick={() => navigate("/provider-form")}>
                        Nueva Ingreso +
                    </button>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>N°Comprobante</th>
                            <th>Proveedor</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>N° Romaneo</th>
                            <th>Estado de Carga</th>
                            <th>Peso recepción Romaneo</th>
                            <th>Cabezas</th>
                            <th>Peso Recepcion</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProducts.map((product) => (
                            <tr key={product.id} className={product.income_state === "manual" ? "red-row" : ""}>
                                <td>{product.id}</td>
                                <td>{product.supplier}</td>
                                <td>{new Date(product.createdAt).toLocaleDateString("es-ES")}</td>
                                <td>{new Date(product.createdAt).toLocaleTimeString()}</td>
                                <td>{product.romaneo_number}</td>
                                <td>{product.check_state ? "Romaneo" : "Manual"}</td>
                                <td>{product.total_weight}</td>
                                <td>{product.head_quantity}</td>
                                <td>{product.final_weight}</td>
                                <td>
                                    <button className="edit-button" onClick={() => handleEdit(product.id, product.internal_number)}>
                                        <FontAwesomeIcon icon={faPen} />
                                    </button>
                                    <button className="delete-button" onClick={() => handleDelete(product.id, product.romaneo_number)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination">
                    <button onClick={goToPrevPage} disabled={currentPage === 1}>
                        ← Anterior
                    </button>
                    <span>Página <strong>{currentPage}</strong> de <strong>{totalPages || 1}</strong></span>
                    <button onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                        Siguiente →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MeatLoad;
