import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../components/Navbar.jsx";
import Modal from "react-modal";
import ViewMeatBillQuantity from "../../components/ViewMeatBillQuantity.jsx";
import Swal from "sweetalert2";
import "../../assets/styles/meatLoad.css";

const MeatLoad = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [idParaVisualizar, setIdParaVisualizar] = useState(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetch(`${API_URL}/allproducts`)
            .then((response) => response.json())
            .then((data) => setProducts(data))
            .catch((error) => console.error("Error al obtener productos:", error));
    }, []);

    const handleEdit = (id) => {
        navigate(`/provider-form/${id}`);
    };
    const handleView = (id) => {
        setIdParaVisualizar(id);
        setModalIsOpen(true);
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
                fetch(`${API_URL}/products/${id}`, {
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

        <div className="body-meat-load">
            <Navbar />
            <div className="container">
                <h1>Mercaderías</h1>
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
                        Nuevo Ingreso +
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
                                <td>{product.total_weight}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="view-button" onClick={() => handleView(product.id)}>
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        <button className="edit-button" onClick={() => handleEdit(product.id)}>
                                            <FontAwesomeIcon icon={faPen} />
                                        </button>
                                        <button className="delete-button" onClick={() => handleDelete(product.id, product.romaneo_number)}>
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                    </div>
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
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Detalle del Ingreso"
                className="modal"
                overlayClassName="modal-overlay"
            >


                {idParaVisualizar && (
                    <ViewMeatBillQuantity
                        id={idParaVisualizar}
                        onClose={() => setModalIsOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default MeatLoad;
