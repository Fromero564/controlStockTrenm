import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import './styles/alltares.css';
import Navbar from "./Navbar";

const Alltares = () => {
    const navigate = useNavigate();
    const [tares, setTares] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetch("http://localhost:3000/allTares")
            .then((response) => response.json())
            .then((data) => setTares(data))
            .catch((error) => console.error("Error al obtener taras:", error));
    }, []);

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
            <div className="alltares-container">
                <h2 className="title">Taras</h2>

                <div className="top-bar">
                    <div className="search-section">
                        <label htmlFor="search">BUSCAR</label>
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
                                    <button className="edit-button" onClick={() => console.log("Editar", tare.id)}>
                                        <FontAwesomeIcon icon={faPen} />
                                    </button>
                                    <button className="delete-button" onClick={() => console.log("Eliminar", tare.id)}>
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
