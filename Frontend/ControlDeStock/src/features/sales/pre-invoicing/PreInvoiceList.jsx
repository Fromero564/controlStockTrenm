// src/features/sales/pre-invoicing/PreInvoiceList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen, faXmark, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import "../../../assets/styles/preInvoiceList.css";
import Navbar from "../../../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "";

const toDDMMYY = (val) => {
  if (!val) return "-";
  if (typeof val === "string") {
    const m = val.match(/^(\d{2})\/(\d{2})\/(\d{2,4})$/);
    if (m) return val;
  }
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
};

export default function PreInvoiceList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/preinvoices/history`, { credentials: "include" });
      const js = await res.json();
      setRows(js?.items || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = rows.slice(start, end);

  const pageWindow = useMemo(() => {
    const visible = Math.min(5, totalPages);
    const startAt = Math.max(1, Math.min(page - 2, totalPages - (visible - 1)));
    return Array.from({ length: visible }, (_, i) => startAt + i);
  }, [page, totalPages]);

  const handleDelete = async (receipt) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar prefacturación?",
      text: `Se eliminará la prefacturación #${receipt}. Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(
        `${API_URL}/preinvoices/by-receipt/${encodeURIComponent(receipt)}`,
        { method: "DELETE", credentials: "include" }
      );
      const js = await res.json();
      if (js?.ok) {
        await Swal.fire("Eliminada", "La prefacturación fue eliminada correctamente.", "success");
        fetchData();
      } else {
        Swal.fire("Error", js?.msg || "No se pudo eliminar la prefacturación.", "error");
      }
    } catch {
      Swal.fire("Error", "Ocurrió un problema al eliminar.", "error");
    }
  };

  // 👉 Abrir vista de detalle en modo PDF
  const handlePdf = (receipt) => {
    // abre una pestaña con /pre-invoicing-detail/:id?pdf=1
    window.open(`/pre-invoicing-detail/${encodeURIComponent(receipt)}?pdf=1`, "_blank");
  };

  return (
    <div className="pv-wrap">
      <Navbar />

      <div className="pv-header">
        <button className="pv-back" onClick={() => navigate("/sales-panel")}>
          ⬅ Volver
        </button>
      </div>

      <div className="pv-container">
        <h1 className="pv-title">PREFACTURACIONES</h1>

        <div className="pv-table">
          <div className="pv-thead">
            <div>COMPROBANTE</div>
            <div>CAMIÓN</div>
            <div>CLIENTE</div>
            <div>PRODUCCIÓN</div>
            <div>ITEMS</div>
            <div>IMPORTE</div>
            <div>DESTINO</div>
            <div>ENTREGA</div>
            <div>ACCIONES</div>
          </div>

          <div className="pv-tbody">
            {pageRows.length === 0 && !loading && (
              <div className="pv-empty">Sin resultados</div>
            )}

            {pageRows.map((r) => (
              <div className="pv-row" key={`${r.receipt_number}-${r.roadmap_id || ""}`}>
                <div>#{r.receipt_number}</div>
                <div>{r.truck_license_plate || "—"}</div>
                <div>{r.client_name || "—"}</div>
                <div>{toDDMMYY(r.production_ts)}</div>
                <div>{r.lines}</div>
                <div className="pv-num">
                  {Number(r.total_amount || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div>{r.destination || "—"}</div>
                <div>{toDDMMYY(r.delivery_date)}</div>

                <div className="pv-actions">
                  <button
                    className="pv-icon-btn btn-eye"
                    title="Ver detalle"
                    onClick={() => navigate(`/pre-invoicing-detail/${r.receipt_number}`)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    className="pv-icon-btn btn-edit"
                    title="Editar prefactura"
                    onClick={() => navigate(`/pre-invoicing/${r.receipt_number}`)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    className="pv-icon-btn btn-del"
                    title="Eliminar prefactura"
                    onClick={() => handleDelete(r.receipt_number)}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                  <button
                    className="pv-icon-btn btn-pdf"
                    title="Exportar a PDF"
                    onClick={() => handlePdf(r.receipt_number)}
                  >
                    <FontAwesomeIcon icon={faFilePdf} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pv-pagination">
          <button
            className="pv-page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            ←
          </button>
          {pageWindow.map((p) => (
            <button
              key={p}
              className={`pv-page-btn ${p === page ? "pv-active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="pv-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            →
          </button>

          <select
            className="pv-page-size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5 / pág</option>
            <option value={10}>10 / pág</option>
            <option value={20}>20 / pág</option>
          </select>
        </div>
      </div>
    </div>
  );
}
