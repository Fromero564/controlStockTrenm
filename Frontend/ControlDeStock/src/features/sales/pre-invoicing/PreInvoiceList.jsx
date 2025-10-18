import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import "../../../assets/styles/preInvoiceList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen } from "@fortawesome/free-solid-svg-icons";

const API_URL = import.meta.env.VITE_API_URL || "";

// util: YYYY-MM-DD -> DD/MM/YY
const toDDMMYY = (iso) => {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${String(y).slice(2)}`;
};

const inRange = (date, from, to) => {
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
};

export default function PreInvoiceList() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [selectedDest, setSelectedDest] = useState("");
  const [prodFrom, setProdFrom] = useState("");
  const [prodTo, setProdTo] = useState("");
  const [delFrom, setDelFrom] = useState("");
  const [delTo, setDelTo] = useState("");

  const [rawRoadmaps, setRawRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/destinations`);
        if (!res.ok) return;
        const js = await res.json();
        const list = js?.data || js?.destinations || [];
        setDestinations(Array.isArray(list) ? list : []);
      } catch {}
    })();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedDest) q.set("destination_id", selectedDest);
      if (prodFrom) q.set("production_from", prodFrom);
      if (prodTo) q.set("production_to", prodTo);
      if (delFrom) q.set("delivery_from", delFrom);
      if (delTo) q.set("delivery_to", delTo);

      const url = `${API_URL}/roadmaps/date-groups?${q.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        setRawRoadmaps([]);
        return;
      }
      const js = await res.json();
      setRawRoadmaps(Array.isArray(js) ? js : js?.rows || []);
    } catch {
      setRawRoadmaps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const groupedRows = useMemo(() => {
    const normalized = rawRoadmaps.map((item) => {
      const production_date = (item.created_at || "").slice(0, 10);
      const delivery_date = (item.delivery_date || "").slice(0, 10);
      const destination_id = item.destination_id || "";
      return { production_date, delivery_date, destination_id };
    });

    const filtered = normalized.filter((r) => {
      const prodOk = (!prodFrom && !prodTo) || inRange(r.production_date, prodFrom, prodTo);
      const delOk = (!delFrom && !delTo) || inRange(r.delivery_date, delFrom, delTo);
      const destOk = !selectedDest || String(r.destination_id) === String(selectedDest);
      return prodOk && delOk && destOk;
    });

    const map = new Map();
    for (const r of filtered) {
      const key = `${r.production_date}|${r.delivery_date}`;
      if (!map.has(key)) {
        map.set(key, { production_date: r.production_date, delivery_date: r.delivery_date, count: 1 });
      } else {
        map.get(key).count += 1;
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      if (a.production_date > b.production_date) return -1;
      if (a.production_date < b.production_date) return 1;
      if (a.delivery_date > b.delivery_date) return -1;
      if (a.delivery_date < b.delivery_date) return 1;
      return 0;
    });
  }, [rawRoadmaps, prodFrom, prodTo, delFrom, delTo, selectedDest]);

  const total = groupedRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = groupedRows.slice(start, end);

  const onFilter = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const goPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const pageWindow = useMemo(() => {
    const visible = Math.min(5, totalPages);
    const startAt = Math.max(1, Math.min(page - 2, totalPages - (visible - 1)));
    return Array.from({ length: visible }, (_, i) => startAt + i);
  }, [page, totalPages]);

  return (
    <div className="pv-wrap">
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate("/sales-panel")}>
          ⬅ Volver
        </button>
      </div>

      <div className="pv-container">
        <h1 className="pv-title">PREFACTURACIONES</h1>

        <form className="pv-filters" onSubmit={onFilter}>
          <div className="pv-field">
            <label>FECHA DE PRODUCCIÓN</label>
            <div className="pv-range">
              <input type="date" value={prodFrom} onChange={(e) => setProdFrom(e.target.value)} />
              <input type="date" value={prodTo} onChange={(e) => setProdTo(e.target.value)} />
            </div>
          </div>

          <div className="pv-field">
            <label>FECHA DE ENTREGA</label>
            <div className="pv-range">
              <input type="date" value={delFrom} onChange={(e) => setDelFrom(e.target.value)} />
              <input type="date" value={delTo} onChange={(e) => setDelTo(e.target.value)} />
            </div>
          </div>

          <div className="pv-field">
            <label>DESTINO</label>
            <div className="pv-select">
              <select value={selectedDest} onChange={(e) => setSelectedDest(e.target.value)}>
                <option value="">Seleccionar</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.destination_name || d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="pv-btn" type="submit" disabled={loading}>
            {loading ? "Filtrando..." : "Filtrar"}
          </button>
        </form>

        <div className="pv-table">
          <div className="pv-thead">
            <div>FECHA DE PRODUCCIÓN</div>
            <div>FECHA DE ENTREGA</div>
            <div className="pv-actions">ACCIONES</div>
          </div>

          <div className="pv-tbody">
            {pageRows.length === 0 && !loading && <div className="pv-empty">Sin resultados</div>}

            {pageRows.map((r, idx) => (
              <div className="pv-row" key={`${r.production_date}-${r.delivery_date}-${idx}`}>
                <div>{toDDMMYY(r.production_date)}</div>
                <div>{toDDMMYY(r.delivery_date)}</div>
                <div className="pv-actions">
                  {/* Ver (modo lectura) */}
                  <button
                    className="pv-icon"
                    title="Ver"
                    onClick={() =>
                      navigate(`/pre-invoicing-detail/${r.production_date}/${r.delivery_date}?mode=view`)
                    }
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>

                  {/* Editar */}
                  <button
                    className="pv-icon"
                    title="Editar"
                    onClick={() =>
                      navigate(`/pre-invoicing-detail/${r.production_date}/${r.delivery_date}?mode=edit`)
                    }
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pv-footer">
          <div className="pv-page-size">
            <span>Mostrar</span>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[5, 10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>de {total} registros por página</span>
          </div>

          <div className="pv-pager">
            <button onClick={() => goPage(1)} disabled={page === 1}>
              {"«"}
            </button>
            <button onClick={() => goPage(page - 1)} disabled={page === 1}>
              {"‹"}
            </button>
            {pageWindow.map((p) => (
              <button key={p} className={p === page ? "active" : ""} onClick={() => goPage(p)}>
                {p}
              </button>
            ))}
            <button onClick={() => goPage(page + 1)} disabled={page === totalPages}>
              {"›"}
            </button>
            <button onClick={() => goPage(totalPages)} disabled={page === totalPages}>
              {"»"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
