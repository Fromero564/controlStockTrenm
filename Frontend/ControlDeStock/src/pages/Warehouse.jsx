import { useEffect, useState } from "react";

const WarehouseManager = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [stockGeneral, setStockGeneral] = useState([]);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [form, setForm] = useState({ name: "", location: "" });
  const [asignados, setAsignados] = useState({});

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/warehouses`).then(res => res.json()).then(setWarehouses);
    fetch(`${API_URL}/all-products-stock`).then(res => res.json()).then(setStockGeneral);
    fetch(`${API_URL}/warehouse-stock-summary`).then(res => res.json()).then(data => {
      const map = {};
      data.forEach(item => {
        map[item.product_stock_id] = item.total_assigned;
      });
      setAsignados(map);
    });
  }, []);

  const verStock = (id) => {
    setSelectedWarehouse(id);
    fetch(`${API_URL}/warehouse-stock/${id}`)
      .then(res => res.json())
      .then(setWarehouseStock);
  };

  const crearAlmacen = async () => {
    const res = await fetch(`${API_URL}/warehouses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const nuevo = await res.json();
    setWarehouses([...warehouses, nuevo]);
    setForm({ name: "", location: "" });
  };

  const asignarStock = async (product_stock_id, quantity) => {
    await fetch(`${API_URL}/warehouse-stock/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        warehouse_id: selectedWarehouse,
        product_stock_id,
        quantity
      })
    });
    verStock(selectedWarehouse);
  };

  return (
    <div className="almacen-container">
      <h1>Gestión de Almacenes</h1>

      <div>
        <h2>Crear nuevo almacén</h2>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre" />
        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ubicación" />
        <button onClick={crearAlmacen}>Crear</button>
      </div>

      <div>
        <h2>Almacenes</h2>
        {warehouses.map(alm => (
          <div key={alm.id}>
            <strong>{alm.name}</strong> - {alm.location}
            <button onClick={() => verStock(alm.id)}>Ver Stock</button>
          </div>
        ))}
      </div>

      {selectedWarehouse && (
        <>
          <h3>Stock del almacén seleccionado</h3>
          <ul>
            {warehouseStock.map((item, i) => (
              <li key={i}>{item.product?.product_name} → {item.quantity}</li>
            ))}
          </ul>

          <h3>Asignar producto desde el stock general</h3>
          {stockGeneral.map((item, i) => {
            const asignado = asignados[item.id] || 0;
            const disponible = item.product_quantity - asignado;
            return (
              <div key={i}>
                {item.product_name} (Total: {item.product_quantity}, Asignado: {asignado}, Disponible: {disponible})
                <button
                  onClick={() => asignarStock(item.id, 1)}
                  disabled={disponible < 1}
                >
                  Asignar 1
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default WarehouseManager;
