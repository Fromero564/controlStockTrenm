import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import "../../assets/styles/warehousesStockView.css";
import Swal from "sweetalert2";

const WarehouseStockView = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [unassignedStock, setUnassignedStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    id_warehouse: "",
    product_name: "",
    quantity: 0,
  });
  const [editForm, setEditForm] = useState({
    id_warehouse: "",
    product_name: "",
    new_quantity: 0,
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [wareRes, stockRes, unassignedRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/all-warehouses`),
          fetch(`${API_URL}/warehouse-stock`),
          fetch(`${API_URL}/warehouse-stock-unassigned`),
          fetch(`${API_URL}/all-products-stock`)
        ]);

        const [wareData, stockData, unassigned, productList] = await Promise.all([
          wareRes.json(),
          stockRes.json(),
          unassignedRes.json(),
          productsRes.json()
        ]);

        setWarehouses(wareData);
        setStockData(stockData);
        setUnassignedStock(unassigned);
        setProducts(productList);
      } catch (err) {
        console.error("Error al cargar datos de almacenes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleAssignStock = async () => {
    const { id_warehouse, product_name, quantity } = form;

    if (!id_warehouse || !product_name || quantity <= 0) {
      return Swal.fire("Error", "Todos los campos son obligatorios.", "error");
    }

    try {
      const res = await fetch(`${API_URL}/warehouse-stock-assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_warehouse, product_name, quantity }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensaje || "Error al asignar.");

      Swal.fire("Éxito", data.mensaje, "success");
      setForm({ id_warehouse: "", product_name: "", quantity: 0 });

      const [stockRes, unassignedRes] = await Promise.all([
        fetch(`${API_URL}/warehouse-stock`),
        fetch(`${API_URL}/warehouse-stock-unassigned`),
      ]);
      setStockData(await stockRes.json());
      setUnassignedStock(await unassignedRes.json());
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleUpdateStock = async () => {
    const { id_warehouse, product_name, new_quantity } = editForm;

    if (!id_warehouse || !product_name || new_quantity < 0) {
      return Swal.fire("Error", "Datos inválidos para actualizar.", "error");
    }

    try {
      const res = await fetch(`${API_URL}/warehouse-stock-update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_warehouse, product_name, new_quantity }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensaje || "Error al actualizar.");

      Swal.fire("Éxito", data.mensaje, "success");
      setEditing(false);
      setEditForm({ id_warehouse: "", product_name: "", new_quantity: 0 });

      const [stockRes, unassignedRes] = await Promise.all([
        fetch(`${API_URL}/warehouse-stock`),
        fetch(`${API_URL}/warehouse-stock-unassigned`),
      ]);
      setStockData(await stockRes.json());
      setUnassignedStock(await unassignedRes.json());
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div>
      <Navbar />
       <div style={{ margin: "20px" }}>
                <button className="boton-volver" onClick={() => navigate(-1)}>
                    ⬅ Volver
                </button>
            </div>
      <div className="warehouse-stock-container">
        <h1>Stock por Almacén</h1>

        <div className="stock-form">
          <h3>Asignar producto a almacén</h3>
          <select
            value={form.id_warehouse}
            onChange={(e) => setForm({ ...form, id_warehouse: e.target.value })}
          >
            <option value="">Seleccionar almacén</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.Warehouse_name}</option>
            ))}
          </select>

          <select
            value={form.product_name}
            onChange={(e) => setForm({ ...form, product_name: e.target.value })}
          >
            <option value="">Seleccionar producto</option>
            {products.map((p, i) => (
              <option key={i} value={p.product_name}>{p.product_name}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Cantidad"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
          />

          <button onClick={handleAssignStock}>Asignar</button>
        </div>

        {editing && (
          <div className="stock-form">
            <h3>Editar stock en almacén</h3>
            <select value={editForm.id_warehouse} disabled>
              <option>{warehouses.find(w => w.id == editForm.id_warehouse)?.Warehouse_name}</option>
            </select>

            <select value={editForm.product_name} disabled>
              <option>{editForm.product_name}</option>
            </select>

            <input
              type="number"
              placeholder="Nueva cantidad"
              value={editForm.new_quantity}
              onChange={(e) =>
                setEditForm({ ...editForm, new_quantity: parseInt(e.target.value) || 0 })
              }
            />

            <button onClick={handleUpdateStock}>Actualizar</button>
            <button onClick={() => setEditing(false)}>Cancelar</button>
          </div>
        )}

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            {warehouses.map((wh) => (
              <div key={wh.id} className="warehouse-section">
                <h2>{wh.Warehouse_name}</h2>
                <table className="warehouse-stock-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockData
                      .filter((item) => item.id_warehouse === wh.id)
                      .map((item, i) => (
                        <tr key={i}>
                          <td>{item.product_name}</td>
                          <td>
                            {item.quantity}
                            <button
                              style={{ marginLeft: "10px" }}
                              onClick={() => {
                                setEditForm({
                                  id_warehouse: item.id_warehouse,
                                  product_name: item.product_name,
                                  new_quantity: item.quantity,
                                });
                                setEditing(true);
                              }}
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ))}

            <div className="unassigned-section">
              <h2>Productos sin asignar</h2>
              <table className="warehouse-stock-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Total General</th>
                    <th>Asignado</th>
                    <th>Sin asignar</th>
                  </tr>
                </thead>
                <tbody>
                  {unassignedStock.map((item, i) => (
                    <tr key={i}>
                      <td>{item.product_name}</td>
                      <td>{item.total_general}</td>
                      <td>{item.asignado}</td>
                      <td>{item.sin_asignar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WarehouseStockView;
