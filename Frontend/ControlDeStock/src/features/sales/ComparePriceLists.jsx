import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../assets/styles/comparePriceLists.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";

const BASE = import.meta.env.VITE_API_URL;

export default function ComparePriceLists() {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch(`${BASE}/all-price-list`)
      .then((r) => r.json())
      .then((data) => setLists(Array.isArray(data) ? data : []))
      .catch(() => setLists([]));
  }, []);

  // ==== construir opciones usando el NOMBRE real ====
  // - agrupamos por list_number (Number para evitar "1" vs 1)
  // - elegimos el primer name no vacío (o el más frecuente si querés)
  const options = useMemo(() => {
    const byNum = new Map();
    for (const row of lists) {
      const num = Number(row.list_number);
      if (!Number.isFinite(num)) continue;
      const name = (row.name || "").trim();
      if (!byNum.has(num)) {
        byNum.set(num, { number: num, name: name || "" , names: {} });
      }
      // contemos frecuencia por si hay nombres distintos
      if (name) {
        byNum.get(num).names[name] = (byNum.get(num).names[name] || 0) + 1;
      }
    }
    // elegir el nombre más frecuente (si ninguno, queda vacío)
    const dedup = Array.from(byNum.values()).map((it) => {
      let chosen = it.name;
      let max = 0;
      for (const n in it.names) {
        if (it.names[n] > max) { max = it.names[n]; chosen = n; }
      }
      return { number: it.number, name: chosen };
    });
    dedup.sort((x, y) => x.number - y.number);
    return dedup.map(({ number, name }) => ({
      value: number,
      // mostramos “<número> — <nombre>” o “(Sin nombre)”
      label: name ? `${number} — ${name}` : `${number} — (Sin nombre)`,
    }));
  }, [lists]);

  // Si sólo hay una lista, autocompletamos para permitir comparar consigo misma
  useEffect(() => {
    if (options.length === 1) {
      const only = String(options[0].value);
      if (!a) setA(only);
      if (!b) setB(only);
    }
  }, [options, a, b]);

  const doCompare = async () => {
    const A = a || b;
    const B = b || a; // permite comparar consigo misma
    if (!A) return;

    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${BASE}/compare-price-lists/${A}/${B}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setDiff(data);
      setA(String(A));
      setB(String(B));
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (!diff?.rows) return [];
    const s = q.trim().toLowerCase();
    if (!s) return diff.rows;
    return diff.rows.filter(
      (r) =>
        String(r.product_name || "").toLowerCase().includes(s) ||
        String(r.product_id || "").includes(s)
    );
  }, [diff, q]);

  const fetchOneList = async (number) => {
    const r = await fetch(`${BASE}/price-list/${number}`);
    if (!r.ok) throw new Error("No se pudo traer la lista");
    return await r.json();
  };

  const handleEdit = async (number) => {
    try {
      const data = await fetchOneList(number);
      navigate("/edit-price-list", {
        state: { mode: "edit", listNumber: number, payload: data },
      });
    } catch {
      alert("No se pudo cargar la lista para editar");
    }
  };

  return (
    <div className="cpl-root">
      <Navbar />
         <div style={{ margin: "20px" }}>
                <button className="boton-volver" onClick={() => navigate("/price-list-general")}>
                    ⬅ Volver
                </button>
            </div>
      <div className="cpl-card">
        <div className="cpl-head">
         
          <h1>Comparar Precios</h1>
          <button className="cpl-refresh" onClick={() => { setDiff(null); setQ(""); }}>
            <FontAwesomeIcon icon={faArrowRotateRight}/> Reiniciar
          </button>
        </div>

        <div className="cpl-toolbar">
          <div className="cpl-pick">
            <label>Lista A</label>
            <select value={a} onChange={(e) => setA(e.target.value)}>
              <option value="">Elegir…</option>
              {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button className="cpl-edit" disabled={!a} onClick={() => handleEdit(Number(a))}>
              <FontAwesomeIcon icon={faPenToSquare}/> Editar A
            </button>
          </div>

          <div className="cpl-pick">
            <label>Lista B</label>
            <select value={b} onChange={(e) => setB(e.target.value)}>
              <option value="">Elegir…</option>
              {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button className="cpl-edit" disabled={!b} onClick={() => handleEdit(Number(b))}>
              <FontAwesomeIcon icon={faPenToSquare}/> Editar B
            </button>
          </div>

          <button className="cpl-compare" disabled={!a && !b} onClick={doCompare}>
            Comparar
          </button>
        </div>

        {loading && <div className="cpl-empty">Comparando…</div>}
        {err && <div className="cpl-error">Error: {String(err.message || err)}</div>}

        {diff && !loading && (
          <>
            <div className="cpl-summary">
              <div><strong>Lista A:</strong> {diff.a.number} — {diff.a.name || "—"}</div>
              <div><strong>Lista B:</strong> {diff.b.number} — {diff.b.name || "—"}</div>
              <div><strong>Productos (unión):</strong> {diff.rows.length}</div>
              <input className="cpl-search" placeholder="Filtrar producto…" value={q} onChange={(e)=>setQ(e.target.value)} />
            </div>

            <div className="cpl-tableWrap">
              <table className="cpl-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Unidad</th>
                    <th className="cpl-col">Costo A</th>
                    <th className="cpl-col">Costo B</th>
                    <th className="cpl-col">S/IVA A</th>
                    <th className="cpl-col">S/IVA B</th>
                    <th className="cpl-col">C/IVA A</th>
                    <th className="cpl-col">C/IVA B</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={`${row.product_id}-${row.product_name}`}>
                      <td>{row.product_name}</td>
                      <td className={`cpl-badge ${row.diff_unidad ? "cpl-diff" : ""}`}>
                        {row.unidad_a || "—"} / {row.unidad_b || "—"}
                      </td>
                      <td className={row.diff_costo ? "cpl-diff" : ""}>{row.costo_a ?? "—"}</td>
                      <td className={row.diff_costo ? "cpl-diff" : ""}>{row.costo_b ?? "—"}</td>
                      <td className={row.diff_sin ? "cpl-diff" : ""}>{row.sin_iva_a ?? "—"}</td>
                      <td className={row.diff_sin ? "cpl-diff" : ""}>{row.sin_iva_b ?? "—"}</td>
                      <td className={row.diff_con ? "cpl-diff" : ""}>{row.con_iva_a ?? "—"}</td>
                      <td className={row.diff_con ? "cpl-diff" : ""}>{row.con_iva_b ?? "—"}</td>
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
}
