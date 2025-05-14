import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash} from "@fortawesome/free-solid-svg-icons";
import './styles/providerList.css'
import Navbar from "./Navbar";

const ProviderList = () => {
    const navigate = useNavigate();
    const [providers, setProviders] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetch("http://localhost:3000/allProviders")
            .then((response) => response.json())
            .then((data) => setProviders(data))
            .catch((error) => console.error("Error al obtener productos:", error));
    }, []);

    const filteredProviders = providers.filter((provider) =>
        provider.id.toString().toLowerCase().includes(search.toLowerCase())
    );

    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProviders = filteredProviders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);


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
            <h1>Proveedores</h1>
                <div className="header">
                    
                    <div className="search-section">
                        <label htmlFor="search">BUSCAR CÓDIGO PROVEEDOR</label>
                        <div className="search-input-label">
                        <input
                            type="text"
                            id="search"
                            placeholder="Buscar código proveedor"
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

                    <button className="new-button" onClick={() => navigate("/provider-load")}>
                        Nuevo Proveedor +
                    </button>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                        <th>Código del proveedor</th>
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
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProviders.map((provider) => (
                            <tr key={provider.id}>
                                <td>{provider.id}</td>
                                <td>{provider.provider_name}</td>
                                <td>{provider.provider_type_id}</td>
                                <td>{provider.provider_id_number}</td>
                                <td>{provider.provider_iva_condition}</td>
                                <td>{provider.provider_email}</td>
                                <td>{provider.provider_phone}</td>
                                <td>{provider.provider_adress}</td>
                                <td>{provider.provider_country}</td>
                                <td>{provider.provider_province}</td>
                                <td>{provider.provider_location}</td>
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
    )
}

export default ProviderList;