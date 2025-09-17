import { useEffect, useMemo, useState } from "react";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { useParams, useNavigate } from "react-router-dom";
import "../../assets/styles/roadmap.css";
import Navbar from "../../components/Navbar";

// Base URL desde .env, sin duplicar barras
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const u = (path) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

async function jget(path) {
  const r = await fetch(u(path));
  return r.json();
}
async function jpost(path, body) {
  const r = await fetch(u(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}
async function jput(path, body) {
  const r = await fetch(u(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

export default function Roadmap() {
  const { id } = useParams(); // si existe => edición
  const isEdit = !!id;
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);

  // form state
  const [deliveryDate, setDeliveryDate] = useState("");
  const [remits, setRemits] = useState([]); // [{value,label}]

  // Catálogos y selecciones
  const [destOptions, setDestOptions] = useState([]); // destinos
  const [destSel, setDestSel] = useState(null);       // destino único

  const [trucks, setTrucks] = useState([]);  // camiones
  const [truckSel, setTruckSel] = useState(null);

  const [drivers, setDrivers] = useState([]); // choferes
  const [driverSel, setDriverSel] = useState(null);

  // Mappers
  const mapDest = (d) => ({
    value: d.id,
    label: d.destination_name || d.name || d.destination || `#${d.id}`,
  });

  // SOLO patente como label
  const mapTruck = (t) => ({
    value: t.id,
    label: t.plate || t.license_plate || t.truck_plate || t.patente || String(t.id),
  });

  const mapDriver = (p) => ({
    value: p.id,
    label: [p.driver_name, p.driver_surname].filter(Boolean).join(" ").trim() || String(p.id),
  });

  // Carga catálogos (+ edición si corresponde)
  useEffect(() => {
    (async () => {
      const [dests, trs, drs] = await Promise.all([
        jget("/destinations"),
        jget("/trucks"),
        jget("/drivers"), // tu endpoint real
      ]);

      const destList = (dests?.destinations || dests?.data || dests || []).map(mapDest);
      setDestOptions(destList);

      const trucksArr = (trs?.data || trs?.trucks || trs || []).map(mapTruck);
      setTrucks(trucksArr);

      const driversArr = (drs?.drivers || drs?.data || drs || []).map(mapDriver);
      setDrivers(driversArr);

      // Edición
      if (!isEdit) return;

      const r = await jget(`/roadmaps/${id}`);
      if (!r?.ok) {
        alert(r?.msg || "No se pudo cargar el roadmap");
        return;
      }

      setDeliveryDate((r.roadmap?.delivery_date || "").slice(0, 10));
      setRemits(r.roadmap?.remit_options || []);

      // destino guardado como texto → match por label
      const names = r.roadmap?.destinations || [];
      if (names.length) {
        const name = names[0];
        const hit = destList.find((d) => d.label === name);
        if (hit) setDestSel(hit);
      }

      // patente exacta
      if (r.roadmap?.truck_license_plate) {
        const tHit = trucksArr.find((t) => t.label === r.roadmap.truck_license_plate);
        if (tHit) setTruckSel(tHit);
      }

      // chofer por nombre
      if (r.roadmap?.driver) {
        const dHit = driversArr.find((d) => d.label === r.roadmap.driver);
        if (dHit) setDriverSel(dHit);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  // Loader remoto de remitos (con fallback por N° exacto)
  const loadRemits = async (input) => {
    const term = String(input || "").trim();
    const chosen = new Set(remits.map((x) => x.value));

    try {
      const r = await jget(`/remits/options?search=${encodeURIComponent(term)}`);
      if (r?.ok && Array.isArray(r.options)) {
        return r.options.filter((o) => !chosen.has(o.value));
      }
    } catch {}

    if (!term) return [];
    const one = await jget(`/remits/by-receipt/${encodeURIComponent(term)}`);
    if (one?.header?.id) {
      const opt = {
        value: one.header.id,
        label: `N° ${one.header.receipt_number} — ${one.header.client_name || ""}`,
      };
      return chosen.has(opt.value) ? [] : [opt];
    }
    return [];
  };

  // Payload (incluye id + texto por compatibilidad)
  const payload = useMemo(
    () => ({
      delivery_date: deliveryDate,
      remit_ids: remits.map((r) => r.value),
      destination_ids: destSel?.value ? [destSel.value] : [],
      destination_names: [], // sin manual
      truck_id: truckSel?.value || null,
      truck_license_plate: truckSel?.label || null, // SOLO patente si tu tabla guarda texto
      driver_id: driverSel?.value || null,
      driver: driverSel?.label || null, // nombre completo
    }),
    [deliveryDate, remits, destSel, truckSel, driverSel]
  );

  const onSave = async () => {
    if (!deliveryDate) return alert("Elegí la fecha de reparto");
    if (!remits.length) return alert("Agregá al menos un remito");
    if (!destSel?.value) return alert("Seleccioná un destino");

    setSaving(true);
    const res = isEdit ? await jput(`/roadmaps/${id}`, payload) : await jpost("/roadmaps", payload);
    setSaving(false);

    if (res?.ok) {
      alert(isEdit ? "Roadmap actualizado" : "Roadmap creado");
      navigate(-1);
    } else {
      alert(res?.msg || "Error al guardar");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="rm-wrap">
        <h1 className="rm-title">{isEdit ? "Editar pedido" : "Asignar pedido"}</h1>

        <div className="rm-card">
          {/* REMITOS */}
          <label className="rm-label">Asociar Nº remitos</label>
          <AsyncSelect
            cacheOptions
            defaultOptions
            isMulti
            loadOptions={loadRemits}
            value={remits}
            onChange={(vals) => setRemits(vals || [])}
            placeholder="Buscar remitos por N° o cliente..."
            classNamePrefix="rs"
            className="rm-select"
            noOptionsMessage={() => "Sin resultados"}
          />

          <div className="rm-grid">
            {/* DESTINO */}
            <div className="rm-cell">
              <label className="rm-label">Destino</label>
              <Select
                options={destOptions}
                value={destSel}
                onChange={setDestSel}
                classNamePrefix="rs"
                className="rm-select"
                placeholder="Seleccionar destino…"
                isClearable
                noOptionsMessage={() => "Sin resultados"}
              />
            </div>

            {/* FECHA */}
            <div className="rm-cell">
              <label className="rm-label">Fecha de reparto</label>
              <input
                type="date"
                className="rm-input"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>

            {/* CAMIÓN */}
            <div className="rm-cell">
              <label className="rm-label">Patente camión</label>
              <Select
                options={trucks}
                value={truckSel}
                onChange={setTruckSel}
                classNamePrefix="rs"
                className="rm-select"
                placeholder="Seleccionar camión…"
                isClearable
                noOptionsMessage={() => "Sin resultados"}
              />
            </div>

            {/* CHOFER */}
            <div className="rm-cell">
              <label className="rm-label">Chofer</label>
              <Select
                options={drivers}
                value={driverSel}
                onChange={setDriverSel}
                classNamePrefix="rs"
                className="rm-select"
                placeholder="Seleccionar chofer…"
                isClearable
                noOptionsMessage={() => "Sin resultados"}
              />
            </div>
          </div>

          <div className="rm-actions">
            <button className="rm-btn primary" disabled={saving} onClick={onSave}>
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Asignar pedido"}
            </button>
            <button className="rm-btn" onClick={() => navigate(-1)}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
