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

    // Calcular los índices de los productos a mostrar en la página actual
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

    // Calcular total de páginas
    const totalPages = Math.ceil(products.length / itemsPerPage);

    // Cambiar de página
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
                <div className="header">
                    <h2>Mercaderías</h2>
                    <button className="new-button" onClick={() => navigate("/operator-panel")}>
                        Volver panel operario
                    </button>
                    <button className="new-button" onClick={() => navigate("/provider-form")}>
                        Nueva mercadería +
                    </button>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Proveedor</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Peso Total</th>
                            <th>Unidad de Peso</th>
                            <th>Cabezas</th>
                            <th>N° comprobante romaneo</th>
                            <th>N° comprobante interno</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProducts.map((product) => (
                            <tr key={product.id} className={product.income_state === "manual" ? "red-row" : ""}>
                                <td>{product.supplier}</td>
                                <td>{new Date(product.createdAt).toLocaleDateString("es-ES")}</td>
                                <td>{new Date(product.createdAt).toLocaleTimeString()}</td>
                                <td>{product.total_weight}</td>
                                <td>{product.unit_weight}</td>
                                <td>{product.head_quantity}</td>
                                <td>{product.romaneo_number}</td>
                                <td>{product.internal_number}</td>
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
                    <span>Página {currentPage} de {totalPages}</span>
                    <button onClick={goToNextPage} disabled={currentPage === totalPages}>
                        Siguiente →
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MeatLoad;
