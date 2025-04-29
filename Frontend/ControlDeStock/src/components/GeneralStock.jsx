import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import "./styles/generalStock.css"; // Ruta actualizada al nuevo archivo CSS

const GeneralStock = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await fetch("http://localhost:3000/stock-available");
        const data = await response.json();
        setStockData(data);
      } catch (error) {
        console.error("Error al obtener el stock:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  return (
    <>
      <Navbar />
      <div className="stock-container">
        <h1 className="stock-title">Stock</h1>
        {loading ? (
          <p className="loading">Cargando...</p>
        ) : (
          <div className="table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>CANTIDAD</th>
                  <th>PRODUCTO</th>
                </tr>
              </thead>
              <tbody>
                {stockData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.quantity}</td>
                    <td>{item.type.toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default GeneralStock;
