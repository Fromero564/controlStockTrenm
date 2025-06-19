import { useEffect, useState } from "react";
import '../assets/styles/modalViewMeatBillQuantity.css';

const API_URL = import.meta.env.VITE_API_URL;

const ViewMeatBillQuantity = ({ id, onClose }) => {
    const [remito, setRemito] = useState(null);
    const [observacion, setObservacion] = useState(null);
    const [cortesStock, setCortesStock] = useState([]);

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    

                    const response = await fetch(`${API_URL}/chargeUpdateBillDetails/${id}`);
                    const data = await response.json();
                    setRemito(data);

                

                    if (data.tipo_ingreso === 'manual') {
                        const stockResponse = await fetch(`${API_URL}/allProductsStock`);
                        const stockData = await stockResponse.json();
                       

                        const cortesDelRemito = stockData.filter(
                            item => parseInt(item.id_bill_suppliers) === parseInt(data.internal_number)
                        );
                       
                        setCortesStock(cortesDelRemito);
                    }

                    const obsResponse = await fetch(`${API_URL}/allObservations`);
                    const obsData = await obsResponse.json();
                  

                    const observacionDelRemito = obsData.find(
                        obs => parseInt(obs.id) === parseInt(data.internal_number)
                    );

                   
                    setObservacion(observacionDelRemito?.observation || null);
                } catch (error) {
                    console.error("Error al obtener datos para visualizar remito:", error);
                }
            };

            fetchData();
        }
    }, [id]);

    if (!remito) return <p>Cargando datos del remito...</p>;

    return (
        <div className="view-remito-modal-wrapper">
            <div className="view-remito-modal-content">
                <button className="modal-close-button" onClick={onClose}>×</button>

                <h2>Remito #{remito.internal_number}</h2>
                <p><strong>Proveedor:</strong> {remito.proveedor}</p>
                <p><strong>Peso total:</strong> {remito.peso_total}</p>
                <p><strong>Romaneo:</strong> {remito.romaneo}</p>
                <p><strong>Tipo de ingreso:</strong> {remito.tipo_ingreso}</p>

                <h3>Detalle de Cortes declarados en Remito</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Cantidad</th>
                            <th>Cabezas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {remito.detalles.map((corte) => (
                            <tr key={corte.id}>
                                <td>{corte.tipo}</td>
                                <td>{corte.cantidad}</td>
                                <td>{corte.cabezas}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {remito.tipo_ingreso === 'manual' && cortesStock.length > 0 && (
                    <>
                        <h3>Cortes Ingresados Manualmente</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Garrón</th>
                                    <th>Nombre</th>
                                    <th>Cantidad</th>
                                    <th>Cabezas</th>
                                    <th>Peso Proveedor</th>
                                    <th>Peso Bruto</th>
                                    <th>Tara</th>
                                    <th>Peso Neto</th>
                                    <th>Merma</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cortesStock.map(corte => (
                                    <tr key={corte.id}>
                                        <td>{corte.products_garron}</td>
                                        <td>{corte.products_name}</td>
                                        <td>{corte.products_quantity}</td>
                                        <td>{corte.product_head}</td>
                                        <td>{corte.provider_weight}</td>
                                        <td>{corte.gross_weight}</td>
                                        <td>{corte.tare}</td>
                                        <td>{corte.net_weight}</td>
                                        <td>{corte.decrease}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
  <h3>Observación</h3>
                {/* Observación (si existe) */}
                {observacion && (
                    <div className="observacion-remito">
                      
                        <p>{observacion}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewMeatBillQuantity;
