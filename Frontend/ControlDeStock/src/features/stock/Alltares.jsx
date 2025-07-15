import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faXmark, faPlus } from "@fortawesome/free-solid-svg-icons";
import '../../assets/styles/alltares.css';
import Navbar from "../../components/Navbar.jsx";

const Alltares = () => {
    const navigate = useNavigate();
    const [tares, setTares] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetch(`${API_URL}/allTares`)
            .then((response) => response.json())
            .then((data) => setTares(data))
            .catch((error) => console.error("Error al obtener taras:", error));
    }, []);


    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar tara?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/tare-delete/${id}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    // Filtrar la tara eliminada del array
                    setTares(prevTares => prevTares.filter(tare => tare.id !== id));

                    Swal.fire('Eliminada', 'La tara fue eliminada correctamente.', 'success');
                } else {
                    Swal.fire('Error', 'No se pudo eliminar la tara.', 'error');
                }
            } catch (error) {
                console.error("Error al eliminar tara:", error);
                Swal.fire('Error', 'Error de red al intentar eliminar.', 'error');
            }
        }
    };


    // Filtrado por búsqueda
    const filteredTares = tares.filter((tare) =>
        tare.tare_name.toLowerCase().includes(search.toLowerCase())
    );

    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTares = filteredTares.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTares.length / itemsPerPage);

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
        <>
            <Navbar />
             <div style={{ margin: "20px" }}>
                <button className="boton-volver" onClick={() => navigate(-1)}>
                    ⬅ Volver
                </button>
            </div>
            <div className="alltares-container">
                <h1 className="title-taras">Taras</h1>

                <div className="top-bar">
                    <div className="search-section">
                        <label htmlFor="search">BUSCAR</label>
                        <div className="search-input-label">
                            <input
                                type="text"
                                id="search"
                                placeholder="Buscar por nombre de tara"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="search-input"
                            />
                            <button className="search-button">Buscar</button>
                        </div>
                    </div>
                    <button className="new-button" onClick={() => navigate("/tare-load")}>
                        Nueva tara <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>NOMBRE TARA</th>
                            <th>PESO TARA</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTares.map((tare) => (
                            <tr key={tare.id}>
                                <td>{tare.tare_name}</td>
                                <td>{tare.tare_weight}KG</td>
                                <td>
                                    <button className="edit-button" onClick={() => navigate(`/tare-load/${tare.id}`)}>
                                        <FontAwesomeIcon icon={faPen} />
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleEliminar(tare.id)}
                                    >
                                        <FontAwesomeIcon icon={faXmark} />
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
                    <span>
                        Página <strong>{currentPage}</strong> de{" "}
                        <strong>{totalPages || 1}</strong>
                    </span>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Siguiente →
                    </button>
                </div>
            </div>
        </>
    );
};

export default Alltares;
