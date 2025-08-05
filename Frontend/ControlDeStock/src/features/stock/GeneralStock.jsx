import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/generalStock.css";

const GeneralStock = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [stockAlert, setStockAlert] = useState("Todos");
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); 
    const navigate = useNavigate();


  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await fetch(`${API_URL}/all-products-stock`);
        const data = await response.json();
        setStockData(data);

        const uniqueCategories = [...new Set(data.map(item => item.product_category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error al obtener el stock:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  const filteredStock = stockData.filter((item) => {
    const matchCategory = selectedCategory === "Todas" || item.product_category === selectedCategory;

    let matchAlert = true;
    if (stockAlert === "Bajo stock") {
      matchAlert = item.product_quantity < item.min_stock;
    } else if (stockAlert === "Exceso stock") {
      matchAlert = item.product_quantity > item.max_stock;
    }

    const matchSearch = item.product_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchAlert && matchSearch;
  });

  const handleClearFilters = () => {
    setSelectedCategory("Todas");
    setStockAlert("Todos");
    setSearchQuery(""); 
  };

  return (
    <>
      <Navbar />
       <div style={{ margin: "20px" }}>
                <button className="boton-volver" onClick={() => navigate(-1)}>
                    ⬅ Volver
                </button>
            </div>
      <div className="stock-container">
        <h1 className="stock-title">Stock</h1>
        {/* <button onClick={() => navigate("/warehouse-stock")}>Ver por almacenes</button> */}

        <div className="filters">
          <label>
            Categoría:
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Todas">Todas</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label>
            Alerta de stock:
            <select
              value={stockAlert}
              onChange={(e) => setStockAlert(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Bajo stock">Bajo stock</option>
              <option value="Exceso stock">Exceso stock</option>
            </select>
          </label>

          <label>
            Buscar producto:
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nombre del producto"
            />
          </label>

          <button className="clear-button" onClick={handleClearFilters}>
            Limpiar filtros
          </button>
        </div>

        {loading ? (
          <p className="loading">Cargando...</p>
        ) : (
          <div className="table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>CÓDIGO</th>
                  <th>PRODUCTO</th>
                  <th>CANTIDAD</th>
                  <th>KG TOTAL</th>
                  <th>STOCK MÍNIMO</th>
                  <th>STOCK MÁXIMO</th>
                  <th>CATEGORÍA</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((item, index) => {
                  const quantityClass =
                    item.product_quantity < item.min_stock
                      ? "low-stock"
                      : item.product_quantity > item.max_stock
                      ? "high-stock"
                      : "";

                  return (
                    <tr key={index}>
                      <td>{item.product_cod}</td>
                      <td>{item.product_name}</td>
                      <td className={quantityClass}>{item.product_quantity}</td>
                      <td>{item.product_total_weight || 0}</td>
                      <td>{item.min_stock}</td>
                      <td>{item.max_stock}</td>
                      <td>{item.product_category}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default GeneralStock;
