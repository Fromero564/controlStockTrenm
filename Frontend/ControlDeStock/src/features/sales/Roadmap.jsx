import { useEffect, useMemo, useState } from "react";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../../assets/styles/roadmap.css";
import Navbar from "../../components/Navbar";

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

// >>> CAMBIO NUEVO: fecha de HOY en LOCAL (YYYY-MM-DD) <<<
const todayLocal = (() => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
})();

export default function Roadmap() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);

  // >>> CAMBIO NUEVO: inicializar con todayLocal (antes: "")
  const [deliveryDate, setDeliveryDate] = useState(todayLocal);
  const [remits, setRemits] = useState([]); // [{value,label}]

  const [destOptions, setDestOptions] = useState([]);
  const [destSel, setDestSel] = useState(null);

  const [trucks, setTrucks] = useState([]);
  const [truckSel, setTruckSel] = useState(null);

  const [drivers, setDrivers] = useState([]);
  const [driverSel, setDriverSel] = useState(null);

  const mapDest = (d) => ({
    value: d.id,
    label: d.destination_name || d.name || d.destination || `#${d.id}`,
  });

  const mapTruck = (t) => ({
    value: t.id,
    label:
      t.plate ||
      t.license_plate ||
      t.truck_plate ||
      t.patente ||
      String(t.id),
  });

  const mapDriver = (p) => ({
    value: p.id,
    label:
      [p.driver_name, p.driver_surname].filter(Boolean).join(" ").trim() ||
      String(p.id),
  });

  useEffect(() => {
    (async () => {
      try {
        const [dests, trs, drs] = await Promise.all([
          jget("/destinations"),
          jget("/trucks"),
          jget("/drivers"),
        ]);

        const destList = (dests?.destinations || dests?.data || dests || []).map(mapDest);
        setDestOptions(destList);

        const trucksArr = (trs?.data || trs?.trucks || trs || []).map(mapTruck);
        setTrucks(trucksArr);

        const driversArr = (drs?.drivers || drs?.data || drs || []).map(mapDriver);
        setDrivers(driversArr);

        if (!isEdit) return;

        const r = await jget(`/roadmaps/${id}`);
        if (!r?.ok) {
          Swal.fire("Error", r?.msg || "No se pudo cargar el roadmap", "error");
          return;
        }

        // Mantengo tu lógica: corto a YYYY-MM-DD al editar
        setDeliveryDate((r.roadmap?.delivery_date || "").slice(0, 10));
        setRemits(r.roadmap?.remit_options || []);

        const names = r.roadmap?.destinations || [];
        if (names.length) {
          const hit = destList.find((d) => d.label === names[0]);
          if (hit) setDestSel(hit);
        }

        if (r.roadmap?.truck_license_plate) {
          const tHit = trucksArr.find((t) => t.label === r.roadmap.truck_license_plate);
          if (tHit) setTruckSel(tHit);
        }

        if (r.roadmap?.driver) {
          const dHit = driversArr.find((d) => d.label === r.roadmap.driver);
          if (dHit) setDriverSel(dHit);
        }
      } catch (e) {
        Swal.fire("Error", "No se pudieron cargar los datos iniciales", "error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

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

  const payload = useMemo(
    () => ({
      delivery_date: deliveryDate,
      remit_ids: remits.map((r) => r.value),
      destination_ids: destSel?.value ? [destSel.value] : [],
      destination_names: [],
      truck_id: truckSel?.value || null,
      truck_license_plate: truckSel?.label || null,
      driver_id: driverSel?.value || null,
      driver: driverSel?.label || null,
    }),
    [deliveryDate, remits, destSel, truckSel, driverSel]
  );

  const onSave = async () => {
    if (!deliveryDate) {
      Swal.fire("Falta la fecha", "Elegí la fecha de reparto", "warning");
      return;
    }

    // >>> CAMBIO NUEVO: validar contra HOY LOCAL (antes usabas toISOString/UTC)
    if (deliveryDate < todayLocal) {
      Swal.fire("Fecha inválida", "No podés seleccionar una fecha pasada", "error");
      return;
    }

    if (!remits.length) {
      Swal.fire("Faltan remitos", "Agregá al menos un remito", "warning");
      return;
    }
    if (!destSel?.value) {
      Swal.fire("Falta el destino", "Seleccioná un destino", "warning");
      return;
    }

    setSaving(true);
    try {
      const res = isEdit
        ? await jput(`/roadmaps/${id}`, payload)
        : await jpost("/roadmaps", payload);
      setSaving(false);

      if (res?.ok) {
        const msgOk =
          res?.msg ||
          (isEdit
            ? "Hoja de ruta fue actualizado correctamente"
            : Array.isArray(res?.ids) && res.ids.length > 1
            ? `Se crearon ${res.ids.length} roadmaps`
            : "Hoja de ruta fue creado correctamente");
        Swal.fire("Éxito", msgOk, "success").then(() => navigate(-1));
      } else {
        Swal.fire(
          "Error",
          res?.msg || "Hubo un problema al guardar el roadmap",
          "error"
        );
      }
    } catch (e) {
      setSaving(false);
      Swal.fire("Error", "No se pudo comunicar con el servidor", "error");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="rm-wrap">
        <h1 className="rm-title">{isEdit ? "Editar pedido" : "Asignar pedido"}</h1>

        <div className="rm-card">
          <label className="rm-label">Asociar Nº remitos</label>
          <AsyncSelect
            cacheOptions
            defaultOptions
            isMulti
            loadOptions={loadRemits}
            value={remits}
            onChange={(vals) => setRemits(vals || [])}
            placeholder="Buscar remitos por N° o cliente."
            classNamePrefix="rs"
            className="rm-select"
            noOptionsMessage={() => "Sin resultados"}
          />

          <div className="rm-grid">
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

            <div className="rm-cell">
              <label className="rm-label">Fecha de reparto</label>
              <input
                type="date"
                className="rm-input"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                // >>> CAMBIO NUEVO: min en LOCAL (antes ISO/UTC)
                min={todayLocal}
              />
            </div>

            <div className="rm-cell">
              <label className="rm-label">Camión</label>
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
            <button
              className="rm-btn rm-btn--primary"
              disabled={saving}
              onClick={onSave}
            >
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear hoja de ruta"}
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
