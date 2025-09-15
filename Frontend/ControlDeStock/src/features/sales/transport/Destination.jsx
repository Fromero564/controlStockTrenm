import { useEffect, useState } from "react";
import "../../../assets/styles/destinations.css";

export default function Destination({ open, mode = "create", initial = {}, onCancel, onSave }) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName((initial?.name ?? "").toString());
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return alert("Ingresá un nombre.");
    await Promise.resolve(onSave?.({ id: initial?.id, name: trimmed }));
  };

  return (
    <div className="dst-modal">
      <div className="dst-modal-card">
        <div className="dst-modal-title">{mode === "edit" ? "EDITAR DESTINO" : "NUEVO DESTINO"}</div>
        <form onSubmit={handleSubmit}>
          <label className="dst-label">Nombre</label>
          <input
            className="dst-input"
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <div className="dst-modal-actions">
            <button type="submit" className="dst-btn dst-btn-primary">Guardar</button>
            <button type="button" className="dst-btn dst-btn-light" onClick={onCancel}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
