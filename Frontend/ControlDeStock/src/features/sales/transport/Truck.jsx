import { useEffect, useState } from "react";
import "../../../assets/styles/trucks.css";


export default function Truck({ open, mode = "create", initial = {}, onCancel, onSave }) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");

  useEffect(() => {
    setBrand(initial?.brand || "");
    setModel(initial?.model || "");
    setPlate(initial?.plate || "");
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const b = brand.trim();
    const m = model.trim();
    const p = plate.trim().toUpperCase();
    if (!b || !m || !p) return alert("Completá marca, modelo y patente.");
    await Promise.resolve(onSave?.({ id: initial?.id, brand: b, model: m, plate: p }));
  };

  return (
    <div className="tck-modal">
      <div className="tck-modal-card">
        <div className="tck-modal-title">{mode === "edit" ? "EDITAR CAMIÓN" : "NUEVO CAMIÓN"}</div>
        <form onSubmit={handleSubmit}>
          <label className="tck-label">Marca</label>
          <input className="tck-input" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Marca" />

          <label className="tck-label">Modelo</label>
          <input className="tck-input" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Modelo" />

          <label className="tck-label">Patente</label>
          <input className="tck-input" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="Patente" />

          <div className="tck-modal-actions">
            <button type="submit" className="tck-btn tck-btn-primary">Guardar</button>
            <button type="button" className="tck-btn tck-btn-light" onClick={onCancel}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
