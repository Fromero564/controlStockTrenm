import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import "../../assets/styles/allWarehousesList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AllWarehousesList = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await fetch(`${API_URL}/all-warehouses`);
                const data = await res.json();
                setWarehouses(data);
            } catch (error) {
                console.error("Error al cargar depósitos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWarehouses();
    }, []);

    const eliminarWarehouse = async (id) => {
        const resultado = await Swal.fire({
            title: "¿Eliminar depósito?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!resultado.isConfirmed) return;

        try {
            const res = await fetch(`${API_URL}/deleteWarehouse/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.mensaje || "No se pudo eliminar el depósito");
            }

            setWarehouses((prev) => prev.filter((w) => w.id !== id));

            await Swal.fire("Eliminado", data?.mensaje || "Depósito eliminado correctamente.", "success");
        } catch (err) {
            console.error("Error al eliminar depósito:", err);
            Swal.fire("Error", err.message || "Ocurrió un error al eliminar el depósito.", "error");
        }
    };


    const filteredWarehouses = warehouses.filter((w) =>
        w.Warehouse_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <Navbar />
             <div style={{ margin: "20px" }}>
                <button className="boton-volver" onClick={() => navigate(-1)}>
                    ⬅ Volver
                </button>
            </div>
            <div className="warehouses-container">
                <h1 className="warehouses-title">Depósitos Registrados</h1>
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="warehouses-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />


                {loading ? (
                    <p className="warehouses-loading">Cargando...</p>
                ) : (
                    <table className="warehouses-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWarehouses.map((w) => (
                                <tr key={w.id}>
                                    <td>{w.id}</td>
                                    <td>{w.Warehouse_name}</td>
                                    <td>
                                        <div className="warehouses-actions">
                                            <button
                                                className="warehouses-btn-icon warehouses-btn-edit"
                                                onClick={() => navigate(`/warehouse-load/${w.id}`)}
                                            >
                                                <FontAwesomeIcon icon={faPen} />
                                            </button>
                                            <button
                                                className="warehouses-btn-icon warehouses-btn-delete"
                                                onClick={() => eliminarWarehouse(w.id)}
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredWarehouses.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="warehouses-empty-message">
                                        No se encontraron depósitos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AllWarehousesList;
