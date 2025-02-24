import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
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
        <div>
            {user ? (
                <div>
                    <h1>Bienvenido, {user.name}!</h1>
                    <button onClick={logout}>Cerrar sesión</button>
                    <button onClick={() => navigate("/provider-form")}>
                     Nueva Mercaderia +
                    </button>

                  
                    <h2>Mercaderia</h2>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Proveedor</th>
                                <th>Peso Total</th>
                                <th>Cantidad de Cabezas</th>
                                <th>Fecha de Carga</th>
                                <th>Hora Declarada</th>
                                <th>Hora de Carga</th>
                                <th>Número de Remito</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.supplier}</td>
                                    <td>{product.total_weight}</td>
                                    <td>{product.head_quantity}</td>
                                    <td>{product.actual_date}</td>
                                    <td>{product.time_hours}</td>
                                    <td>{new Date(product.createdAt).toLocaleTimeString()}</td>
                                    <td>{product.remit_number}</td>
                                    <td>
                                        <button onClick={() => handleEdit(product.id,product.remit_number)}>✏️ Editar</button>
                                        <button onClick={() => handleDelete(product.id)}>❌ Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <h1>No estás logueado</h1>
            )}
        </div>
    );
};

export default Dashboard;
