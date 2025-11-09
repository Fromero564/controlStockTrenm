import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faTruck,
  faUserTie,
  faFileInvoice,
} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import "../../../assets/styles/preInvoiceCharge.css";

const API_URL = import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || "";

const toDDMMYY = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
};

const money = (n) =>
  new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

const nf2 = (n) =>
  Number(n || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const nf3 = (n) =>
  Number(n || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

export default function PreInvoiceCharge() {
  const navigate = useNavigate();
  const location = useLocation();
  const { receipt: receiptParam } = useParams();

  const urlReceipt =
    new URLSearchParams(location.search).get("receipt") || null;
  const editReceipt = receiptParam || urlReceipt || null;
  const isEditMode = Boolean(editReceipt);

  // 🔒 Solo lectura (si la URL trae ?readonly=1)
  const isReadOnly =
    new URLSearchParams(location.search).get("readonly") === "1";

  const [allRoadmapOptions, setAllRoadmapOptions] = useState([]);
  const [selectedRoadmaps, setSelectedRoadmaps] = useState([]);

  const [data, setData] = useState({ ok: true, roadmaps: [] });
  const [loadingData, setLoadingData] = useState(false);

  const [received, setReceived] = useState({});
  const [redirectMap, setRedirectMap] = useState({});

  const [clientsOptions, setClientsOptions] = useState([]);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupCtx, setPopupCtx] = useState(null);
  const [popupTo, setPopupTo] = useState("client");
  const [popupClientOpt, setPopupClientOpt] = useState(null);
  const [popupUnits, setPopupUnits] = useState("");
  const [popupKg, setPopupKg] = useState("");
  const [popupMaxUnits, setPopupMaxUnits] = useState(0);
  const [popupMaxKg, setPopupMaxKg] = useState(0);

  // ----- Título -----
  const title = useMemo(() => {
    if (isEditMode && isReadOnly) return `VISUALIZAR PREFACTURACIÓN #${editReceipt}`;
    if (isEditMode) return `EDITAR PREFACTURACIÓN #${editReceipt}`;
    if (!selectedRoadmaps.length) return "CARGAR PREFACTURACIÓN";
    if (selectedRoadmaps.length === 1) {
      const r = selectedRoadmaps[0];
      return `CARGAR PREFACTURACIÓN • ${r.label}`;
    }
    return `CARGAR PREFACTURACIÓN • ${selectedRoadmaps.length} hojas seleccionadas`;
  }, [selectedRoadmaps, isEditMode, isReadOnly, editReceipt]);

  // === Carga de opciones de hojas (solo alta) ===
  useEffect(() => {
    if (isEditMode) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/roadmaps?search=`);
        const raw = await res.json();
        const list = raw?.items || raw?.data || raw?.rows || raw || [];
        const arr = Array.isArray(list) ? list : [];

        const normalized = arr.map((r) => {
          const destinationsRaw =
            r.destinations || r.Destinations || r.destination || [];
          let destinations = [];
          if (Array.isArray(destinationsRaw)) {
            destinations = destinationsRaw
              .map((d) =>
                typeof d === "string"
                  ? d
                  : d?.destination || d?.name || d?.destination_name
              )
              .filter(Boolean);
          } else if (typeof destinationsRaw === "string") {
            destinations = [destinationsRaw];
          }

          return {
            id: r.id ?? r.roadmap_info_id ?? r.roadmapId,
            created_at: r.created_at || r.createdAt || r.created || null,
            delivery_date: r.delivery_date || r.deliveryDate || null,
            driver: r.driver || r.chofer || "",
            truck_license_plate: r.truck_license_plate || r.patente || "",
            destinations,
          };
        });

        const tentative = normalized.map((rm) => {
          const label = `#${rm.id} • ${toDDMMYY(rm.created_at)} → ${toDDMMYY(
            rm.delivery_date
          )} · ${(rm.destinations?.[0] || "s/dest").toUpperCase()} · ${
            rm.truck_license_plate || "camión?"
          }`;
          return { value: rm.id, label, meta: rm };
        });

        // Verifica cuáles tienen remitos visibles
        const ids = tentative.map((t) => t.value);
        const chunk = 25;
        const eligible = new Set();

        for (let i = 0; i < ids.length; i += chunk) {
          const slice = ids.slice(i, i + chunk);
          const url = `${API_URL}/preinvoices/detail/by-roadmaps?ids=${encodeURIComponent(
            slice.join(",")
          )}`;
          const r = await fetch(url);
          const js = await r.json();
          const roadmaps = js?.roadmaps || [];
          roadmaps.forEach((rd) => {
            const visibleRemits = (rd.remits || []).length;
            if (visibleRemits > 0) eligible.add(rd.roadmap_id || rd.id);
          });
        }

        const opts = tentative
          .filter((t) => eligible.has(t.value))
          .map(({ value, label }) => ({ value, label }));

        setAllRoadmapOptions(opts);
      } catch {
        setAllRoadmapOptions([]);
      }
    })();
  }, [isEditMode]);

  // === MODO EDICIÓN ===
  useEffect(() => {
    if (!isEditMode) return;
    let cancel = false;

    (async () => {
      try {
        setLoadingData(true);
        const r = await fetch(
          `${API_URL}/preinvoices/detail/by-receipt/${encodeURIComponent(
            editReceipt
          )}`
        );
        const js = await r.json();
        if (cancel) return;

        const header = js?.header || null;
        const items = Array.isArray(js?.items) ? js.items : [];
        const returns = Array.isArray(js?.returns) ? js.returns : [];

        if (!header) {
          setData({ ok: false, roadmaps: [] });
          setReceived({});
          setRedirectMap({});
          return;
        }

        // Armar remit y roadmap
        const remitItems = items.map((it) => {
          const unit = String(it.unit_measure || it.unidad_venta || "KG").toUpperCase();
          const qty = Number(it.expected_units ?? it.qty ?? 0);
          const kg = Number(it.expected_kg ?? it.net_weight ?? 0);
          const price = Number(it.unit_price ?? it.price ?? 0);

          return {
            id: it.id || it.item_id,
            final_remit_item_id: it.id || it.item_id,
            product_id: it.product_id,
            product_name: it.product_name || it.name || "",
            unit_measure: unit,
            qty,
            net_weight: kg,
            unit_price: price,
          };
        });

        const remit = {
          final_remit_id:
            header.final_remit_id || header.remit_id || header.receipt_number,
          receipt_number: header.receipt_number,
          order_id: header.order_id || null,
          client_name: header.client_name || "",
          destination: header.destination || "",
          generated_by: header.generated_by || "",
          price_list: header.price_list || "",
          sell_condition: header.sell_condition || "",
          payment_condition: header.payment_condition || "",
          total_items: remitItems.length,
          total_amount: Number(header.total_amount || 0),
          items: remitItems,
        };

        const roadmapRow = {
          roadmap_id: header.roadmap_id || header.roadmap_info_id || null,
          truck_license_plate:
            header.truck_license_plate || header.truck_plate || "",
          driver: header.driver || "",
          production_date: header.production_date || header.created_at || null,
          delivery_date: header.delivery_date || null,
          remits: [remit],
        };

        setData({ ok: true, roadmaps: [roadmapRow] });

        const base = {};
        items.forEach((it) => {
          const key = it.id || it.item_id;
          base[key] = {
            units: Number(it.received_units || it.units_received || 0),
            kg: Number(it.received_kg || it.kg_received || 0),
          };
        });
        setReceived(base);

        const mapRedir = {};
        returns.forEach((row) => {
          const key = Number(row.item_id || row.preinvoice_id);
          if (!mapRedir[key]) mapRedir[key] = { entries: [] };
          mapRedir[key].entries.push({
            type: row.reason === "client" ? "client" : "stock",
            client_name: row.client_name || null,
            units: Number(row.units_redirected || 0),
            kg: Number(row.kg_redirected || 0),
            ts: Date.parse(row.updated_at || row.created_at || Date.now()),
          });
        });
        setRedirectMap(mapRedir);

        if (roadmapRow.roadmap_id) {
          const label = `#${roadmapRow.roadmap_id} • ${toDDMMYY(
            roadmapRow.production_date
          )} → ${toDDMMYY(roadmapRow.delivery_date)} · ${(
            header.destination || "s/dest"
          ).toUpperCase()} · ${
            roadmapRow.truck_license_plate || "camión?"
          }`;
          const option = { value: roadmapRow.roadmap_id, label };
          setSelectedRoadmaps([option]);
          setAllRoadmapOptions((prev) => {
            const exists = prev.some((p) => p.value === option.value);
            return exists ? prev : [...prev, option];
          });
        }
      } catch {
        setData({ ok: false, roadmaps: [] });
        setReceived({});
        setRedirectMap({});
      } finally {
        if (!cancel) setLoadingData(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [isEditMode, editReceipt]);

  // === MODO ALTA ===
  useEffect(() => {
    if (isEditMode) return;

    let cancel = false;
    (async () => {
      const selectedIds = selectedRoadmaps.map((o) => o.value);
      if (!selectedIds.length) {
        setData({ ok: true, roadmaps: [] });
        setReceived({});
        setRedirectMap({});
        return;
      }

      setLoadingData(true);

      try {
        const urlDetail = `${API_URL}/preinvoices/detail/by-roadmaps?ids=${encodeURIComponent(
          selectedIds.join(",")
        )}&include_locked=1`;

        const res = await fetch(urlDetail);
        const js = await res.json();
        if (cancel) return;

        const roadmapsFiltered = (js?.roadmaps || []).map((r) => ({
          ...r,
          remits: (r.remits || []).filter(Boolean),
        }));

        setData({ ok: Boolean(js?.ok), roadmaps: roadmapsFiltered });

        const base = {};
        (roadmapsFiltered || [])
          .filter((r) => (r.remits || []).length > 0)
          .forEach((roadmap) => {
            (roadmap.remits || []).forEach((rm) => {
              (rm.items || []).forEach((it) => {
                base[it.id] = { units: 0, kg: 0 };
              });
            });
          });
        setReceived(base);

        const urlReturns = `${API_URL}/preinvoices/returns/by-roadmaps?ids=${encodeURIComponent(
          selectedIds.join(",")
        )}`;
        const r2 = await fetch(urlReturns);
        const js2 = await r2.json();
        if (js2?.ok && Array.isArray(js2.items)) {
          const mapRedir = {};
          js2.items.forEach((row) => {
            if (!mapRedir[row.item_id]) mapRedir[row.item_id] = { entries: [] };
            mapRedir[row.item_id].entries.push({
              type: row.reason === "client" ? "client" : "stock",
              client_name: row.client_name || null,
              units: Number(row.units_redirected || 0),
              kg: Number(row.kg_redirected || 0),
              ts: Date.parse(row.updated_at || row.created_at || Date.now()),
            });
          });
          setRedirectMap(mapRedir);
        } else {
          setRedirectMap({});
        }
      } catch {
        if (!cancel) {
          setData({ ok: false, roadmaps: [] });
          setReceived({});
          setRedirectMap({});
        }
      } finally {
        if (!cancel) setLoadingData(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [selectedRoadmaps, isEditMode]);

  // === Clientes posibles ===
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_URL}/allClients`);
        if (!r.ok) return;
        const js = await r.json();
        const list = Array.isArray(js) ? js : js?.data || [];
        const opts = list.map((c) => ({
          value: String(c.id),
          label: c.client_name || c.name || `ID ${c.id}`,
        }));
        setClientsOptions(opts);
      } catch {}
    })();
  }, []);

  const updateReceived = (itemId, field, value) => {
    if (isReadOnly) return; // 🔒 no modificar estado en solo lectura
    setReceived((prev) => ({
      ...prev,
      [itemId]: {
        units:
          field === "units"
            ? Number(value)
            : Number(prev[itemId]?.units || 0),
        kg: field === "kg" ? Number(value) : Number(prev[itemId]?.kg || 0),
      },
    }));
  };

  const shortagesForRemit = (rm) => {
    const out = [];
    (rm.items || []).forEach((it) => {
      const expU = Number(it.qty || it.expected_units || 0);
      const expK = Number(it.net_weight || it.expected_kg || 0);
      const rec = received[it.id] || { units: 0, kg: 0 };
      const missU = Math.max(0, expU - Number(rec.units || 0));
      const missK = Math.max(0, expK - Number(rec.kg || 0));
      if (missU > 0 || missK > 0) {
        out.push({
          item_id: it.id,
          product_id: it.product_id,
          product_name: it.product_name,
          unit_measure: it.unit_measure,
          expected_units: expU,
          expected_kg: expK,
          received_units: Number(rec.units || 0),
          received_kg: Number(rec.kg || 0),
          missing_units: missU,
          missing_kg: missK,
        });
      }
    });
    return out;
  };

  const calcPopupState = (ctx, to, clientOpt) => {
    if (!ctx) return { maxU: 0, maxK: 0, seedU: "", seedK: "" };
    const entries = redirectMap[ctx.shortage.item_id]?.entries || [];
    const targetName = to === "client" ? (clientOpt?.label || "") : null;
    const editIdx =
      to === "client"
        ? entries.findIndex(
            (e) => e.type === "client" && e.client_name === targetName
          )
        : entries.findIndex((e) => e.type === "stock");
    const others = entries.filter((_, i) => i !== editIdx);
    const othersU = others.reduce((a, e) => a + Number(e.units || 0), 0);
    const othersK = others.reduce((a, e) => a + Number(e.kg || 0), 0);
    const maxU = Math.max(0, Number(ctx.shortage.missing_units) - othersU);
    const maxK = Math.max(0, Number(ctx.shortage.missing_kg) - othersK);
    const seedU = editIdx >= 0 ? String(entries[editIdx].units ?? "") : "";
    const seedK = editIdx >= 0 ? String(entries[editIdx].kg ?? "") : "";
    return { maxU, maxK, seedU, seedK };
  };

  const openPopup = (rm, shortage) => {
    if (isReadOnly) return; // 🔒 no abrir popup en lectura
    const lastClientName = (redirectMap[shortage.item_id]?.entries || [])
      .slice()
      .reverse()
      .find((e) => e.type === "client")?.client_name;

    const lastOpt =
      clientsOptions.find((o) => o.label === lastClientName) || null;

    const remitOpt =
      clientsOptions.find(
        (o) =>
          (o.label || "").toLowerCase() ===
          String(rm.client_name || "").toLowerCase()
      ) || null;

    const initialClient = lastOpt || remitOpt || null;
    setPopupCtx({ remit: rm, shortage });
    setPopupTo("client");
    setPopupClientOpt(initialClient);
    setPopupOpen(true);
  };

  useEffect(() => {
    if (!popupOpen || !popupCtx) return;
    const { maxU, maxK, seedU, seedK } = calcPopupState(
      popupCtx,
      popupTo,
      popupClientOpt
    );
    setPopupMaxUnits(maxU);
    setPopupMaxKg(maxK);
    setPopupUnits(seedU);
    setPopupKg(seedK);
  }, [popupOpen, popupCtx, popupTo, popupClientOpt, redirectMap]);

  const clamp = (val, max) =>
    Math.min(Math.max(0, Number(val || 0)), Number(max || 0));

  const onUnitsChange = (e) =>
    setPopupUnits(String(clamp(e.target.value, popupMaxUnits)));
  const onKgChange = (e) =>
    setPopupKg(String(clamp(e.target.value, popupMaxKg)));

  const closePopup = () => {
    setPopupOpen(false);
    setPopupCtx(null);
    setPopupUnits("");
    setPopupKg("");
    setPopupClientOpt(null);
  };

  const confirmRedirect = async () => {
    if (isReadOnly) return; // 🔒 no confirmar en lectura
    if (!popupCtx) return;
    if (popupTo === "client" && !popupClientOpt) {
      alert("Seleccioná un cliente para redirigir.");
      return;
    }

    const units = clamp(popupUnits === "" ? 0 : popupUnits, popupMaxUnits);
    const kg = clamp(popupKg === "" ? 0 : popupKg, popupMaxKg);

    const payload = {
      roadmap_ids: selectedRoadmaps.map((o) => o.value),
      final_remit_id: popupCtx.remit.final_remit_id,
      item_id: popupCtx.shortage.item_id,
      to: popupTo,
      client_id: popupTo === "client" ? popupClientOpt?.value || null : null,
      client_name: popupTo === "client" ? popupClientOpt?.label || null : null,
      units,
      kg,
    };

    try {
      await fetch(`${API_URL}/preinvoices/redirect/by-roadmaps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setRedirectMap((prev) => {
        const list = prev[payload.item_id]?.entries || [];
        const idx =
          payload.to === "client"
            ? list.findIndex(
                (e) =>
                  e.type === "client" &&
                  e.client_name === payload.client_name
              )
            : list.findIndex((e) => e.type === "stock");

        let newList = [...list];

        if (Number(units) === 0 && Number(kg) === 0) {
          if (idx >= 0) newList.splice(idx, 1);
        } else if (idx >= 0) {
          newList[idx] = {
            ...newList[idx],
            units: Number(units),
            kg: Number(kg),
            ts: Date.now(),
          };
        } else {
          newList.push({
            type: payload.to,
            client_name: payload.client_name,
            units: Number(units),
            kg: Number(kg),
            ts: Date.now(),
          });
        }

        return {
          ...prev,
          [payload.item_id]: {
            entries: newList,
          },
        };
      });

      closePopup();
    } catch {
      closePopup();
    }
  };

  const saveAll = async () => {
    if (isReadOnly) return; // 🔒 no guardar en lectura
    const items = Object.entries(received).map(([itemId, v]) => ({
      id: Number(itemId),
      item_id: Number(itemId),
      received_units: Number(v?.units || 0),
      received_kg: Number(v?.kg || 0),
      units_received: Number(v?.units || 0),
      kg_received: Number(v?.kg || 0),
    }));

    if (items.length === 0) {
      alert("No hay nada para guardar.");
      return;
    }

    try {
      if (isEditMode) {
        const r = await fetch(
          `${API_URL}/preinvoices/edit/by-receipt/${encodeURIComponent(
            editReceipt
          )}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
          }
        );
        const js = await r.json();
        if (js?.ok) {
          window.location.reload();
        } else {
          alert(js?.msg || "No se pudo guardar.");
        }
      } else {
        const body = {
          roadmap_ids: selectedRoadmaps.map((o) => o.value),
          items: items.map((i) => ({
            item_id: i.item_id,
            units_received: i.units_received,
            kg_received: i.kg_received,
          })),
        };
        const r = await fetch(`${API_URL}/preinvoices/save/by-roadmaps`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const js = await r.json();
        if (js?.ok) {
          window.location.reload();
        } else {
          alert(js?.msg || "No se pudo guardar.");
        }
      }
    } catch {
      alert("No se pudo guardar.");
    }
  };

  return (
    <div className={`charge-wrap ${isReadOnly ? "readonly" : ""}`}>
      <Navbar />

      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate("/sales-panel")}>
          <FontAwesomeIcon icon={faArrowLeftLong} /> Volver
        </button>
      </div>

      <div className="charge-container">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ flexGrow: 1 }}>
            <h1 className="charge-title" style={{ margin: 0 }}>
              {title} {isReadOnly && <span style={{fontSize:12,color:"#6b7280"}}>(solo lectura)</span>}
            </h1>
            {!isEditMode && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: "#6b7280",
                  lineHeight: 1.4,
                }}
              >
                Seleccioná una o varias hojas de ruta. Se mostrarán abajo sólo
                aquellas con comprobantes disponibles para prefacturar.
              </div>
            )}
          </div>

          {!isEditMode && (
            <div style={{ minWidth: 320 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0B4D75",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Hojas de ruta
              </label>
              <Select
                isMulti
                isDisabled={isReadOnly}            // 🔒 deshabilitado en lectura
                classNamePrefix="charge-rs"
                options={allRoadmapOptions}
                value={selectedRoadmaps}
                onChange={(v) => !isReadOnly && setSelectedRoadmaps(v || [])}
                placeholder="Seleccionar hoja(s)…"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: 40,
                    borderRadius: 8,
                    borderColor: state.isFocused ? "#0a6baf" : "#d6dde6",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "#0a6baf",
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>
          )}
        </div>

        {!loadingData && data.roadmaps.length === 0 && (
          <div className="charge-empty">
            {isEditMode
              ? "No hay datos para este comprobante."
              : "No hay hojas seleccionadas (o no tienen comprobantes disponibles)."}
          </div>
        )}
        {loadingData && <div className="charge-empty">Cargando...</div>}

        {data.ok &&
          data.roadmaps.map((r) => (
            <div key={r.roadmap_id || "rm"} style={{ marginBottom: 24 }}>
              <div className="charge-table" style={{ marginBottom: 8 }}>
                <div className="charge-thead">ENCABEZADO</div>
                <div className="charge-tbody">
                  <div
                    className="charge-row"
                    style={{
                      gridTemplateColumns: "1fr 1fr 1fr",
                    }}
                  >
                    <div>
                      <FontAwesomeIcon icon={faTruck} /> Patente:{" "}
                      <b>
                        {r.truck_plate ||
                          r.truck_license_plate ||
                          r.truck ||
                          "-"}
                      </b>
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faUserTie} /> Chofer:{" "}
                      <b>{r.driver || "-"}</b>
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faFileInvoice} /> Hoja:{" "}
                      <b>{r.roadmap_id || "-"}</b> · Prod {toDDMMYY(r.production_date)} → Entrega{" "}
                      {toDDMMYY(r.delivery_date)}
                    </div>
                  </div>
                </div>
              </div>

              {(r.remits || []).map((rm) => {
                const shortages = shortagesForRemit(rm);
                const filas = (rm.items || []).length; // 👈 filas por pedido

                return (
                  <div
                    key={rm.final_remit_id}
                    className="charge-table"
                    style={{ marginBottom: 12 }}
                  >
                    <div
                      className="charge-thead"
                      style={{
                        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                      }}
                    >
                      <div>COMPROBANTE</div>
                      <div>CLIENTE</div>
                      <div>DESTINO</div>
                      <div>ORDEN</div>
                      <div style={{ textAlign: "right" }}>TOTALES</div>
                    </div>

                    <div className="charge-tbody">
                      <div
                        className="charge-row"
                        style={{
                          gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                        }}
                      >
                        <div>
                          #{rm.receipt_number || rm.final_remit_id}{" "}
                          <span style={{ color: "#7a8aa0" }}>
                            ({rm.generated_by || "—"})
                          </span>
                        </div>
                        <div>{rm.client_name || "-"}</div>
                        <div>{rm.destination || "-"}</div>
                        <div>{rm.order_id || "-"}</div>
                        <div style={{ textAlign: "right" }}>
                          {/* 👇 mostramos cantidad de filas del pedido, no cantidad de productos */}
                          Filas: <b>{filas}</b> · ${" "}
                          <b>{money(rm.total_amount ?? r.total_amount)}</b>
                        </div>
                      </div>

                      <div
                        className="charge-row"
                        style={{
                          display: "block",
                          padding: "0 0 12px",
                        }}
                      >
                        <div style={{ overflowX: "auto" }}>
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead
                              style={{
                                background: "#f0f5fb",
                              }}
                            >
                              <tr>
                                <th style={{ textAlign: "left", padding: "8px 10px" }}>CÓDIGO</th>
                                <th style={{ textAlign: "left", padding: "8px 10px" }}>PRODUCTO</th>
                                <th style={{ textAlign: "center", padding: "8px 10px" }}>UNIDAD</th>
                                <th style={{ textAlign: "right", padding: "8px 10px" }}>UNI.REM</th>
                                <th style={{ textAlign: "right", padding: "8px 10px" }}>UNI.RECEP</th>
                                <th style={{ textAlign: "right", padding: "8px 10px" }}>KG REM</th>
                                <th style={{ textAlign: "right", padding: "8px 10px" }}>KG RECEP</th>
                                <th style={{ textAlign: "right", padding: "8px 10px" }}>P. UNIT</th>
                                <th style={{ textAlign: "right", padding: "8px 10px" }}>TOTAL</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(rm.items || []).map((it) => {
                                const isKG =
                                  String(it.unit_measure || "")
                                    .toUpperCase()
                                    .trim() === "KG";
                                const total =
                                  Number(it.unit_price || 0) *
                                  (isKG
                                    ? Number(it.net_weight || it.expected_kg || 0)
                                    : Number(it.qty || it.expected_units || 0));
                                const rec =
                                  received[it.id] || {
                                    units: 0,
                                    kg: 0,
                                  };
                                const warnUnits =
                                  Number(rec.units || 0) < Number(it.qty || it.expected_units || 0);
                                const warnKg =
                                  Number(rec.kg || 0) < Number(it.net_weight || it.expected_kg || 0);

                                return (
                                  <tr key={it.id} style={{ borderTop: "1px solid #eef2f7" }}>
                                    <td style={{ padding: "8px 10px" }}>{it.product_id ?? ""}</td>
                                    <td style={{ padding: "8px 10px" }}>{it.product_name ?? ""}</td>
                                    <td style={{ padding: "8px 10px", textAlign: "center" }}>
                                      {it.unit_measure || "-"}
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right" }}>
                                      {Number(it.qty ?? it.expected_units ?? 0)}
                                    </td>
                                    <td style={{ padding: "6px 8px", textAlign: "right" }}>
                                      <input
                                        type="number"
                                        className={`charge-inp ${warnUnits ? "warn" : ""}`}
                                        min={0}
                                        step="1"
                                        value={rec.units ?? 0}
                                        disabled={isReadOnly} // 🔒
                                        onChange={(e) =>
                                          !isReadOnly && updateReceived(it.id, "units", e.target.value)
                                        }
                                        style={{ width: 90, textAlign: "right" }}
                                      />
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right" }}>
                                      {Number(it.net_weight ?? it.expected_kg ?? 0).toFixed(2)}
                                    </td>
                                    <td style={{ padding: "6px 8px", textAlign: "right" }}>
                                      <input
                                        type="number"
                                        className={`charge-inp ${warnKg ? "warn" : ""}`}
                                        min={0}
                                        step="0.01"
                                        value={rec.kg ?? 0}
                                        disabled={isReadOnly} // 🔒
                                        onChange={(e) =>
                                          !isReadOnly && updateReceived(it.id, "kg", e.target.value)
                                        }
                                        style={{ width: 110, textAlign: "right" }}
                                      />
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right" }}>
                                      {money(it.unit_price)}
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right" }}>
                                      {money(total)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {shortages.length > 0 && (
                        <div className="charge-row" style={{ display: "block", background: "#fff" }}>
                          <div style={{ padding: "10px 12px", color: "#4a4a4a", fontWeight: 700 }}>
                            Devoluciones
                          </div>
                          <div style={{ padding: "0 12px 12px" }}>
                            {shortages.map((s) => {
                              const logs = redirectMap[s.item_id]?.entries || [];
                              const assignedUnits = logs.reduce((a, e) => a + Number(e.units || 0), 0);
                              const assignedKg = logs.reduce((a, e) => a + Number(e.kg || 0), 0);
                              const remainingUnits = Math.max(0, Number(s.missing_units) - assignedUnits);
                              const remainingKg = Math.max(0, Number(s.missing_kg) - assignedKg);
                              const fullyAssigned = remainingUnits === 0 && remainingKg === 0;

                              const clientLines = logs
                                .filter((e) => e.type === "client" && (e.units || e.kg))
                                .map((e) => `Redirigió a ${e.client_name ?? "—"} ${nf3(e.kg)} KG, ${nf2(e.units)} UN`);

                              const stockKg = logs
                                .filter((e) => e.type === "stock")
                                .reduce((a, e) => a + Number(e.kg || 0), 0);
                              const stockUn = logs
                                .filter((e) => e.type === "stock")
                                .reduce((a, e) => a + Number(e.units || 0), 0);
                              const stockLine = stockKg > 0 || stockUn > 0
                                ? `Volvió a stock ${nf3(stockKg)} KG, ${nf2(stockUn)} UN`
                                : null;

                              const rightLines = [...clientLines, ...(stockLine ? [stockLine] : [])];

                              return (
                                <div
                                  key={s.item_id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    border: "1px solid #eef2f7",
                                    borderRadius: 10,
                                    padding: "10px 12px",
                                    margin: "8px 0",
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: 700 }}>{s.product_name}</div>
                                    <div style={{ fontSize: 12, color: "#7a8aa0", marginTop: 2 }}>
                                      Faltan: {nf2(remainingUnits)} UN · {nf3(remainingKg)} KG (Recibido{" "}
                                      {nf2(s.received_units)} UN · {nf3(s.received_kg)} KG de {nf2(s.expected_units)} UN ·{" "}
                                      {nf3(s.expected_kg)} KG)
                                    </div>
                                    {clientLines.length > 0 && (
                                      <div style={{ marginTop: 6 }}>
                                        {clientLines.map((line, i) => (
                                          <div key={i} className="charge-devol-line">
                                            {line}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {stockLine && <div className="charge-devol-line">{stockLine}</div>}
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-end",
                                      gap: 8,
                                    }}
                                  >
                                    {rightLines.length > 0 && (
                                      <div
                                        style={{
                                          fontSize: 12,
                                          color: "#2f4b66",
                                          background: "#f0f6ff",
                                          border: "1px solid #d6e6ff",
                                          padding: "6px 8px",
                                          borderRadius: 8,
                                          maxWidth: 260,
                                          textAlign: "right",
                                        }}
                                      >
                                        {rightLines.map((ln, i) => (
                                          <div key={i}>{ln}</div>
                                        ))}
                                      </div>
                                    )}

                                    {!isReadOnly && (
                                      <button
                                        className="charge-btn"
                                        disabled={fullyAssigned}
                                        onClick={() => openPopup(rm, s)}
                                      >
                                        {fullyAssigned ? "Redirigido" : "Redirigir"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
            marginTop: 16,
          }}
        >
          {!isReadOnly && (
            <button className="charge-btn" onClick={saveAll}>
              {isEditMode ? "Guardar cambios" : "Guardar toda la prefacturación"}
            </button>
          )}
        </div>
      </div>

      {/* Popup NO se muestra en solo lectura */}
      {!isReadOnly && popupOpen && popupCtx && (
        <div className="charge-popup-backdrop" onClick={closePopup}>
          <div className="charge-popup" onClick={(e) => e.stopPropagation()}>
            <div className="charge-popup-title">Redirigir faltante</div>

            <div className="charge-popup-row">
              <label>Destino</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className={`charge-btn ${popupTo === "client" ? "primary" : "ghost"}`}
                  onClick={() => setPopupTo("client")}
                >
                  Cliente
                </button>
                <button
                  className={`charge-btn ${popupTo === "stock" ? "primary" : "ghost"}`}
                  onClick={() => setPopupTo("stock")}
                >
                  Stock
                </button>
              </div>
            </div>

            {popupTo === "client" && (
              <div className="charge-popup-row">
                <label>Cliente</label>
                <Select
                  classNamePrefix="charge-rs"
                  options={clientsOptions}
                  value={popupClientOpt}
                  onChange={setPopupClientOpt}
                  placeholder="Seleccionar cliente…"
                />
              </div>
            )}

            <div className="charge-popup-row">
              <label>Unidades</label>
              <input type="number" min={0} step="1" value={popupUnits} onChange={onUnitsChange} />
            </div>

            <div className="charge-popup-row">
              <label>Kilos</label>
              <input type="number" min={0} step="0.01" value={popupKg} onChange={onKgChange} />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="charge-btn ghost" onClick={closePopup}>
                Cancelar
              </button>
              <button className="charge-btn" onClick={confirmRedirect}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
