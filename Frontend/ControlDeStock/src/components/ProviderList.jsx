import { useEffect, useState } from "react";
import { useNavigate} from "react-router-dom"
const ProviderList = () => {
    const navigate = useNavigate();
      const [providers, setProviders] = useState([]);
    
        useEffect(() => {
            fetch("http://localhost:3000/allProviders")
                .then((response) => response.json())
                .then((data) => setProviders(data))
                .catch((error) => console.error("Error al obtener productos:", error));
        }, []);
    return (
        <div>
            <div className="container">
                <div className="header">
                    <h2>Proveedores</h2>
                    <button className="new-button" onClick={() => navigate("/administrative-panel")}>
                        Volver Panel Administrativo
                    </button>
                    <button className="new-button" onClick={() => navigate("/provider-load")}>
                        Nuevo Proveedor +
                    </button>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Código del proveedor</th>
                            <th>Tipo de Identificación</th>
                            <th>Numero de Identificación</th>
                            <th>Condición IVA</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Domicilio</th>
                            <th>País</th>
                            <th>Provincia</th>
                            <th>Localidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {providers.map((provider) => (
                            <tr key={provider.id}>
                                <td>{provider.provider_name}</td>
                                <td>{provider.provider_code}</td>
                                <td>{provider.provider_type_id}</td>
                                <td>{provider.provider_id_number}</td>
                                <td>{provider.provider_iva_condition}</td>
                                <td>{provider.provider_email}</td>
                                <td>{provider.provider_phone}</td>
                                <td>{provider.provider_adress}</td>
                                <td>{provider.provider_country}</td>
                                <td>{provider.provider_province}</td>
                                <td>{provider.provider_location}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ProviderList;