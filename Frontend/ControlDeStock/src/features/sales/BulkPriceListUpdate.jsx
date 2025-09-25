import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../assets/styles/bulkPriceList.css";

const BASE = import.meta.env.VITE_API_URL;

export default function BulkPriceListUpdate() {
  const navigate = useNavigate();
  const [listsRaw, setListsRaw] = useState([]);
  const [productMaps, setProductMaps] = useState({}); // { [listNumber]: products[] }
  const [selected, setSelected] = useState([]); // list_numbers elegidos
  const [selectAll, setSelectAll] = useState(false);

  // parámetros de aumento
  const [target, setTarget] = useState("costo"); // costo | sin_iva | con_iva
  const [mode, setMode] = useState("percent");  // percent | fixed
  const [amount, setAmount] = useState(10);     // número (%, o monto)
  const [roundToInt, setRoundToInt] = useState(false);
  const [showScope, setShowScope] = useState("all"); // reservado para futuros filtros

  // carga listas (números + nombres)
  useEffect(() => {
    (async () => {
      const r = await fetch(`${BASE}/all-price-list`);
      const data = await r.json();
      setListsRaw(Array.isArray(data) ? data : []);
    })();
  }, []);

  // opciones (dedupe por número y usar nombre real más frecuente)
  const listOptions = useMemo(() => {
    const byNum = new Map();
    for (const row of listsRaw) {
      const num = Number(row.list_number);
      if (!Number.isFinite(num)) continue;
      const name = (row.name || "").trim();
      if (!byNum.has(num)) byNum.set(num, { number: num, names: {} });
      if (name) byNum.get(num).names[name] = (byNum.get(num).names[name] || 0) + 1;
    }
    const arr = [...byNum.entries()].map(([number, rec]) => {
      let nm = "";
      let max = 0;
      for (const k in rec.names) if (rec.names[k] > max) { max = rec.names[k]; nm = k; }
      return { number, name: nm || `(sin nombre)` };
    });
    arr.sort((a,b)=>a.number-b.number);
    return arr;
  }, [listsRaw]);

  // 🔎 mapa rápido número -> nombre para usar en subtítulos de las tablas
  const nameByNumber = useMemo(() => {
    const m = {};
    for (const o of listOptions) m[o.number] = o.name;
    return m;
  }, [listOptions]);

  const toggleAll = () => {
    const v = !selectAll;
    setSelectAll(v);
    setSelected(v ? listOptions.map(o => o.number) : []);
  };

  const toggleOne = (num) => {
    setSelected((prev) =>
      prev.includes(num) ? prev.filter(n=>n!==num) : [...prev, num]
    );
  };

  // fetch productos de las listas elegidas (para vista previa)
  useEffect(() => {
    (async () => {
      const need = selected.filter(n => !productMaps[n]);
      if (!need.length) return;
      const copy = { ...productMaps };
      for (const n of need) {
        const r = await fetch(`${BASE}/price-list/${n}`);
        const data = await r.json(); // { ok, products[] }
        copy[n] = data?.products || [];
      }
      setProductMaps(copy);
    })();
  }, [selected]); // eslint-disable-line

  // combinar productos (por lista)
  const previewRows = useMemo(() => {
    // produce: [{ list_number, product_id, product_name, unidad, old: {costo,sin,con}, neu: {..} }]
    const rows = [];
    const apply = (val) => {
      if (mode === "percent") return val + (val * (Number(amount)||0))/100;
      return val + (Number(amount) || 0);
    };
    const rounder = (v) => roundToInt ? Math.round(v) : Number(v.toFixed(2));

    for (const ln of selected) {
      const items = productMaps[ln] || [];
      for (const p of items) {
        const costo = Number(p.costo || 0);
        const sin = Number(p.precio_sin_iva || 0);
        const con = Number(p.precio_con_iva || 0);

        let newCosto = costo, newSin = sin, newCon = con;
        if (target === "costo") newCosto = rounder(apply(costo));
        if (target === "sin_iva") newSin = rounder(apply(sin));
        if (target === "con_iva") newCon = rounder(apply(con));

        rows.push({
          list_number: ln,
          product_id: p.product_id ?? null,
          product_name: p.product_name,
          unidad: p.unidad_venta || "",
          old: { costo, sin, con },
          neu: { costo: newCosto, sin: newSin, con: newCon },
        });
      }
    }
    return rows;
  }, [selected, productMaps, target, mode, amount, roundToInt]);

  // agrupar por lista para la tabla
  const rowsByList = useMemo(() => {
    const m = new Map();
    for (const r of previewRows) {
      if (!m.has(r.list_number)) m.set(r.list_number, []);
      m.get(r.list_number).push(r);
    }
    return [...m.entries()].sort((a,b)=>a[0]-b[0]);
  }, [previewRows]);

  // 🔁 volver a pedir productos para ver el impacto recién guardado
  const reloadSelectedLists = async () => {
    const copy = { ...productMaps };
    for (const n of selected) {
      const r = await fetch(`${BASE}/price-list/${n}`);
      const data = await r.json();
      copy[n] = data?.products || [];
    }
    setProductMaps(copy);
  };

  // aplicar cambios (PUT bulk)
  const handleApply = async () => {
    if (!selected.length) {
      alert("Elegí al menos una lista");
      return;
    }
    const payload = {
      lists: selected,
      target,            // costo | sin_iva | con_iva
      mode,              // percent | fixed
      amount: Number(amount),
      round: !!roundToInt,
    };
    const r = await fetch(`${BASE}/bulk-update-price-lists`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!r.ok || data?.ok === false) {
      alert(data?.msg || "No se pudo actualizar");
      return;
    }
 
    await reloadSelectedLists();
    setAmount(0);
    alert("Listas actualizadas correctamente");
  };

  return (
    <div className="bulk-root">
      <Navbar />
      <div style={{ margin: "20px" }}>
                <button className="boton-volver" onClick={() => navigate("/price-list-general")}>
                    ⬅ Volver
                </button>
            </div>
      <div className="bulk-card">
        <div className="bulk-head">
        
          <h1>Modificación masiva de listas de precio</h1>
        </div>

        <div className="bulk-grid">
          <div className="bulk-block">
            <div className="bulk-row">
              <label className="bulk-check">
                <input type="checkbox" checked={selectAll} onChange={toggleAll} />
                Seleccionar todas
              </label>
            </div>
            <div className="bulk-tags">
              {listOptions.map(o => (
                <button
                  key={o.number}
                  className={`bulk-tag ${selected.includes(o.number) ? "is-on" : ""}`}
                  onClick={() => toggleOne(o.number)}
                >
                  {o.number} — {o.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bulk-block">
            <div className="bulk-row">
              <span className="bulk-label">Aumentar sobre</span>
              <div className="bulk-seg">
                <button className={target==="costo"?"on":""} onClick={()=>setTarget("costo")}>Costo</button>
                <button className={target==="sin_iva"?"on":""} onClick={()=>setTarget("sin_iva")}>Precio S/IVA</button>
                <button className={target==="con_iva"?"on":""} onClick={()=>setTarget("con_iva")}>Precio C/IVA</button>
              </div>
            </div>

            <div className="bulk-row">
              <span className="bulk-label">Tipo de aumento</span>
              <div className="bulk-seg">
                <button className={mode==="percent"?"on":""} onClick={()=>setMode("percent")}>Porcentaje</button>
                <button className={mode==="fixed"?"on":""} onClick={()=>setMode("fixed")}>Monto fijo</button>
              </div>
              <input
                className="bulk-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e)=>setAmount(e.target.value)}
              />
              <label className="bulk-check" title="Redondear al entero más cercano">
                <input type="checkbox" checked={roundToInt} onChange={(e)=>setRoundToInt(e.target.checked)} />
                Redondear
              </label>
            </div>

            <div className="bulk-actions">
              <button className="bulk-apply" onClick={handleApply} disabled={!selected.length}>
                Aplicar a {selected.length} lista(s)
              </button>
            </div>
          </div>
        </div>

        {/* Vista previa */}
        {rowsByList.length ? (
          rowsByList.map(([ln, items]) => (
            <div key={ln} className="bulk-tableWrap">
              {/* 👇 muestra número + nombre real */}
              <div className="bulk-subtitle">
                {ln} — {nameByNumber[ln] || "(sin nombre)"}
              </div>
              <table className="bulk-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Unidad</th>
                    <th>Cost. actual</th>
                    <th>Cost. nuevo</th>
                    <th>S/IVA actual</th>
                    <th>S/IVA nuevo</th>
                    <th>C/IVA actual</th>
                    <th>C/IVA nuevo</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r, idx) => (
                    <tr key={`${r.product_id}-${idx}`}>
                      <td>{r.product_name}</td>
                      <td><span className="bulk-pill">{r.unidad || "—"}</span></td>
                      <td>{r.old.costo.toFixed(2)}</td>
                      <td className={r.old.costo !== r.neu.costo ? "diff" : ""}>{r.neu.costo.toFixed(2)}</td>
                      <td>{r.old.sin.toFixed(2)}</td>
                      <td className={r.old.sin !== r.neu.sin ? "diff" : ""}>{r.neu.sin.toFixed(2)}</td>
                      <td>{r.old.con.toFixed(2)}</td>
                      <td className={r.old.con !== r.neu.con ? "diff" : ""}>{r.neu.con.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <div className="bulk-empty">Elegí una o varias listas para previsualizar cambios.</div>
        )}
      </div>
    </div>
  );
}
