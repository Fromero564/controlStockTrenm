import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons"; 
import "./styles/meatLoad.css";

const MeatLoad = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/allproducts")
            .then((response) => response.json())
            .then((data) => setProducts(data))
            .catch((error) => console.error("Error al obtener productos:", error));
    }, []);

    const handleEdit = (id, remitNumber) => {
        console.log(`Editar producto con ID: ${id}`);
        navigate(`/meat-income/${id}/${remitNumber}`);
    };

    const handleDelete = (id) => {
        console.log(`Eliminar producto con ID: ${id}`);
    };

    return (
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
                        <th>Peso Inicial</th>
                        <th>Cabezas</th>
                        <th>N° Romaneo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.supplier}</td>
                            <td>{new Date(product.createdAt).toLocaleDateString("es-ES")}</td>
                            <td>{new Date(product.createdAt).toLocaleTimeString()}</td>
                            <td>{product.total_weight}</td>
                            <td>{product.head_quantity}</td>
                            <td>{product.remit_number}</td>
                            <td>
                                <button className="edit-button" onClick={() => handleEdit(product.id, product.remit_number)}>
                                    <FontAwesomeIcon icon={faPen} />
                                </button>
                                <button className="delete-button" onClick={() => handleDelete(product.id)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MeatLoad;
