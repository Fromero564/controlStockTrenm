import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faXmark } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2';
import '../../assets/styles/providerList.css'
import Navbar from "../../components/Navbar.jsx";

const ProviderList = () => {
    const navigate = useNavigate();
    const [providers, setProviders] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
       fetch(`${API_URL}/allProviders`)
            .then((response) => response.json())
            .then((data) => setProviders(data))
            .catch((error) => console.error("Error al obtener productos:", error));
    }, []);

    const handleDelete = (provider) => {
        Swal.fire({
            title: `¿Eliminar proveedor "${provider.provider_name}"?`,
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${API_URL}/deleteProvider/${provider.id}`, {
                    method: 'DELETE'
                })
                    .then((res) => {
                        if (!res.ok) throw new Error("Error al eliminar");
                        // Quitar del estado
                        setProviders(prev => prev.filter(p => p.id !== provider.id));
                        Swal.fire('¡Eliminado!', 'El proveedor fue eliminado.', 'success');
                    })
                    .catch((err) => {
                        console.error(err);
                        Swal.fire('Error', 'No se pudo eliminar el proveedor.', 'error');
                    });
            }
        });
    };

  const filteredProviders = Array.isArray(providers)
  ? providers.filter((provider) =>
      provider.id.toString().toLowerCase().includes(search.toLowerCase())
    )
  : [];
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
                                <td>{provider.provider_name?.toUpperCase()}</td>
                                <td>{provider.provider_type_id?.toUpperCase()}</td>
                                <td>{provider.provider_id_number}</td>
                                <td>{provider.provider_iva_condition?.toUpperCase()}</td>
                                <td>{provider.provider_email?.toUpperCase()}</td>
                                <td>{provider.provider_phone}</td>
                                <td>{provider.provider_adress?.toUpperCase()}</td>
                                <td>{provider.provider_country?.toUpperCase()}</td>
                                <td>{provider.provider_province?.toUpperCase()}</td>
                                <td>{provider.provider_location?.toUpperCase()}</td>
                                <td>
                                    <button className="edit-button" onClick={() => navigate(`/provider-load/${provider.id}`)}>
                                        <FontAwesomeIcon icon={faPen} />
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(provider)}
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
        </div>
    )
}

export default ProviderList;