import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash} from "@fortawesome/free-solid-svg-icons";
import './styles/clientList.css'
import Navbar from "./Navbar";

const ClientList = ()=>{
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetch("http://localhost:3000/allClients")
            .then((response) => response.json())
            .then((data) => setClients(data))
            .catch((error) => console.error("Error al obtener productos:", error));
    }, []);

    const filteredClients = clients.filter((client) =>
        client.id.toString().toLowerCase().includes(search.toLowerCase())
    );

    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);


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
    return(<>
   
   <div>
            <Navbar />
            <div className="container">
            <h2>Clientes</h2>
                <div className="header">
                    
                    <div className="search-section">
                        <label htmlFor="search">BUSCAR CÓDIGO CLIENTE</label>
                        <div className="search-input-label">
                        <input
                            type="text"
                            id="search"
                            placeholder="Buscar código cliente"
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

                    <button className="new-button" onClick={() => navigate("/client-load")}>
                        Nuevo Cliente +
                    </button>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                        <th>Código del Cliente</th>
                            <th>Nombre</th>             
                            <th>Tipo de Identificación</th>
                            <th>Numero de Identificación</th>
                            <th>Condición IVA</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Domicilio</th>
                            <th>País</th>
                            <th>Provincia</th>
                            <th>Localidad</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentClients.map((client) => (
                            <tr key={client.id}>
                                <td>{client.id}</td>
                                <td>{client.client_name}</td>
                                <td>{client.client_type_id}</td>
                                <td>{client.client_id_number}</td>
                                <td>{client.client_iva_condition}</td>
                                <td>{client.client_email}</td>
                                <td>{client.client_phone}</td>
                                <td>{client.client_adress}</td>
                                <td>{client.client_country}</td>
                                <td>{client.client_province}</td>
                                <td>{client.client_location}</td>
                                <td>{client.client_state ? "ACTIVO" : "INACTIVO"}</td>
                                <td>
                                    <button className="edit-button" onClick={() => console.log("Editar")}>
                                        <FontAwesomeIcon icon={faPen} />
                                    </button>
                                    <button className="delete-button" onClick={() => console.log("Eliminar")}>
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
        </div>
    </>)
}

export default ClientList;