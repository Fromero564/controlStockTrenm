import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../components/Navbar";
import "../../assets/styles/listSellers.css";

const API_URL = import.meta.env.VITE_API_URL;

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

const ListSellers = () => {
    const navigate = useNavigate();
    const [sellers, setSellers] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetch(`${API_URL}/all-sellers`)
            .then(res => res.json())
            .then(data => setSellers(data.sellers || []));
    }, []);

    const filteredSellers = sellers.filter(seller => {
        const val = `${seller.code} ${seller.name} ${seller.province} ${seller.city}`.toLowerCase();
        return val.includes(search.toLowerCase());
    });

    const total = filteredSellers.length;
    const pages = Math.ceil(total / rowsPerPage);
    const paginated = filteredSellers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const goToPage = (page) => setCurrentPage(page);

    const handleDelete = (id, name) => {
        Swal.fire({
            title: "<strong>Dar de baja vendedor</strong>",
            html: `Vas a dar de baja al vendedor <b>${name}</b> ¿Estás seguro?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: 'Dar de baja vendedor',
            cancelButtonText: 'NO, cancelar',
            focusCancel: true,
            buttonsStyling: false,
            customClass: {
                popup: 'swal2-custom-popup',
                confirmButton: 'swal2-btn-confirm',
                cancelButton: 'swal2-btn-cancel'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${API_URL}/delete-seller/${id}`, {
                    method: "DELETE",
                })
                .then(res => res.json())
                .then(data => {
                    if (data.ok) {
                        Swal.fire({
                            icon: "success",
                            title: "Vendedor dado de baja",
                            showConfirmButton: false,
                            timer: 1400,
                            customClass: { popup: 'swal2-custom-popup' }
                        });
                        setSellers(sellers => sellers.filter(s => s.id !== id));
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "No se pudo eliminar el vendedor.",
                            customClass: { popup: 'swal2-custom-popup' }
                        });
                    }
                })
                .catch(() => {
                    Swal.fire({
                        icon: "error",
                        title: "Error de red",
                        text: "No se pudo conectar con el servidor.",
                        customClass: { popup: 'swal2-custom-popup' }
                    });
                });
            }
        });
    };

    const handleEdit = (id) => {
        navigate(`/edit-seller/${id}`);
    };

    return (
        <div>
            <Navbar />
                <div style={{ margin: "20px" }}>
                    <button className="boton-volver" onClick={() => navigate('/sales-panel')}>
                        ⬅ Volver
                    </button>
                </div>
            <div className="sellers-container">
                <div className="sellers-header">
                    <h2 className="sellers-title">Vendedores</h2>
                    <button className="btn-new-seller" onClick={() => navigate("/seller-new")}>
                        Nuevo Vendedor <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
            
                <div className="sellers-search-row">
                    <input
                        type="text"
                        placeholder="Buscar"
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="sellers-search-input"
                    />
                    <button className="sellers-search-btn">
                        Buscar
                    </button>
                </div>
                <div className="sellers-table-wrapper">
                    <table className="sellers-table">
                        <thead>
                            <tr>
                                <th>CÓDIGO</th>
                                <th>NOMBRE</th>
                                <th>PROVINCIA</th>
                                <th>LOCALIDAD</th>
                                <th>DOMICILIO</th>
                                <th>ESTADO</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", color: "#aaa" }}>
                                        No hay vendedores
                                    </td>
                                </tr>
                            )}
                            {paginated.map(seller => (
                                <tr key={seller.id}>
                                    <td>{seller.code.padStart(3, "0")}</td>
                                    <td>{seller.name?.toUpperCase()}</td>
                                    <td>{seller.province}</td>
                                    <td>{seller.city}</td>
                                    <td>
                                        {seller.street} {seller.number}
                                        {seller.floor ? `, Piso ${seller.floor}` : ""}
                                        {seller.office ? `, ${seller.office}` : ""}
                                    </td>
                                    <td style={{ fontWeight: "bold", color: seller.status ? "green" : "red" }}>
                                        {seller.status ? "ACTIVO" : "INACTIVO"}
                                    </td>
                                    <td>
                                        <button
                                            className="icon-btn edit-btn"
                                            title="Editar"
                                            onClick={() => handleEdit(seller.id)}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </button>
                                        <button
                                            className="icon-btn delete-btn"
                                            title="Dar de baja"
                                            onClick={() => handleDelete(seller.id, seller.name)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="sellers-pagination-row">
                    <div>
                        <select
                            className="sellers-page-select"
                            value={rowsPerPage}
                            onChange={e => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            {ROWS_PER_PAGE_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <span> de {total} registros por página</span>
                    </div>
                    <div className="sellers-pagination">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => goToPage(1)}
                        >&#171;</button>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => goToPage(currentPage - 1)}
                        >&#60;</button>
                        {Array.from({ length: pages }, (_, i) => i + 1)
                            .slice(
                                Math.max(0, currentPage - 3),
                                Math.min(pages, currentPage + 2)
                            )
                            .map(page => (
                                <button
                                    key={page}
                                    className={currentPage === page ? "active" : ""}
                                    onClick={() => goToPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        <button
                            disabled={currentPage === pages || pages === 0}
                            onClick={() => goToPage(currentPage + 1)}
                        >&#62;</button>
                        <button
                            disabled={currentPage === pages || pages === 0}
                            onClick={() => goToPage(pages)}
                        >&#187;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListSellers;
