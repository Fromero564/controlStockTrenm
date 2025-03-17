import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "./styles/meatmanualincome.css"

const MeatManualIncome = () => {
    const { remitoId } = useParams(); 
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/find-remit/${remitoId}`, {
                    method: "GET", 
                });

                if (!response.ok) {
                    throw new Error("Error en la solicitud");
                }

                const result = await response.json();
                setData(result);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [remitoId]);
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
    };
    
    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date) + " HS";
    };

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <Navbar/>
        <div className="main-container">
        <div>
        <h2>Detalle Mercadería</h2>
        <div className="mercaderia-container">
            <div className="mercaderia-info-row">
            <div><p className="label"> PROVEEDOR:</p><p>{data.supplier.toUpperCase()}</p></div>
            <div><p className="label"> TIPO DE INGRESO:</p><p>{data.income_state.toUpperCase()}</p></div>
            <div><p className="label">HORARIO:</p><p>{formatTime(data.createdAt)}</p></div>
            <div><p className="label">N° COMPROBANTE ROMANEO:</p><p>{data.romaneo_number}</p></div>
            </div>
            <div className="mercaderia-info-row">
            <div><p className="label"> PESO TOTAL DECLARADO EN ROMANEO:</p><p>{data.total_weight} KG</p></div>
            <div><p className="label"> CABEZAS:</p><p>{data.head_quantity}</p></div>
             <div><p className="label">FECHA DE INGRESO:</p><p>{formatDate(data.createdAt)}</p></div>
             <div><p className="label">STATUS:</p><p>{formatDate(data.createdAt)}</p></div>
             </div>          
        </div>
        <div>
        <h2>Piezas</h2>
                <button>Cargar Producto</button>
             </div>
           
        </div>
    </div>
    </div>
    );
};

export default MeatManualIncome;
