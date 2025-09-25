// src/views/sales/ListOrders.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../assets/styles/listOrders.css";
import Navbar from "../../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faEye, faFileExcel, faPlus, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;
const ORDERS_URL = `${API_URL}/all-orders`;
const DELETE_ORDER_URL = (id) => `${API_URL}/delete-order/${id}`;
const ORDER_HEADER_URL = (id) => `${API_URL}/get-order-by-id/${id}`;
const ORDER_LINES_URL = (id) => `${API_URL}/get-all-products-by-order/${id}`;

const ListOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewHeader, setPreviewHeader] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(ORDERS_URL);
        const json = await res.json();
        setOrders(Array.isArray(json) ? json : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const normalize = (s) =>
    String(s ?? "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const passDate = filterDate ? o.date_order === filterDate : true;
      const passClient = filterClient ? normalize(o.client_name).includes(normalize(filterClient)) : true;
      return passDate && passClient;
    });
  }, [orders, filterDate, filterClient]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageData = filtered.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setPage(1);
  }, [filterDate, filterClient, pageSize]);

  const formatDateDMYShort = (isoDate) => {
    if (!isoDate) return "—";
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${String(y).slice(2)}`;
  };

  const exportCSV = () => {
    const headers = ["FECHA", "CLIENTE", "VENDEDOR", "LISTA", "COND_VENTA", "COND_COBRO"];
    const rows = filtered.map((o) => [
      formatDateDMYShort(o.date_order),
      o.client_name ?? "",
      o.salesman_name ?? "",
      o.price_list ?? "",
      o.sell_condition ?? "",
      o.payment_condition ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r
          .map((c) => {
            const s = String(c ?? "");
            return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(";")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const checkBeforeGenerate = async (id) => {
    try {
      const res = await fetch(ORDER_HEADER_URL(id));
      if (res.ok) return true;
      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        await Swal.fire({
          icon: "warning",
          title: "Orden ya generada",
          text: data?.msg || "La orden ya fue generada y no puede volver a generarse.",
          confirmButtonText: "Entendido",
        });
        return false;
      }
      if (res.status === 404) {
        await Swal.fire({ icon: "error", title: "No encontrada", text: "No se encontró la orden." });
        return false;
      }
      await Swal.fire({ icon: "error", title: "Error", text: "No se pudo verificar el estado de la orden." });
      return false;
    } catch {
      await Swal.fire({ icon: "error", title: "Error de red", text: "No se pudo conectar con el servidor." });
      return false;
    }
  };

  const handleGenerate = async (row) => {
    const ok = await checkBeforeGenerate(row.id);
    if (!ok) return;
    navigate(`/generate-sales-order/${row.id}`);
  };

  const handleView = async (row) => {
    setShowPreview(true);
    setPreviewLoading(true);
    setPreviewHeader(null);
    setPreviewRows([]);

    try {
      let header = row;
      try {
        const h = await fetch(ORDER_HEADER_URL(row.id));
        if (h.ok) header = await h.json();
      } catch {}

      const r = await fetch(ORDER_LINES_URL(row.id));
      const lines = await r.json();

      const parsed = (Array.isArray(lines) ? lines : []).map((it) => ({
        product_cod: it.product_cod ?? it.product_id ?? "",
        product_name: it.product_name ?? "",
        precio: Number(it.precio || 0),
        cantidad: Number(it.cantidad || 0),
        tipo_medida: it.tipo_medida ?? it.unit_measure ?? "",
      }));

      setPreviewHeader(header);
      setPreviewRows(parsed);
    } catch {
      Swal.fire("Error", "No se pudo obtener el detalle del pedido.", "error");
      setShowPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleEdit = (row) => navigate(`/sales-orders-new/${row.id}`);

  const handleDelete = async (row) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar?",
      text: `Se eliminará el pedido #${row.id}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!isConfirmed) return;

    setDeletingId(row.id);
    try {
      const res = await fetch(DELETE_ORDER_URL(row.id), { method: "DELETE" });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        await Swal.fire("No permitido", data?.msg || "La orden ya fue generada y no puede eliminarse.", "warning");
        return;
      }
      if (res.status === 404) {
        await Swal.fire("No encontrada", "El pedido no existe.", "info");
        setOrders((prev) => prev.filter((o) => o.id !== row.id));
        return;
      }
      if (!res.ok) throw new Error();

      await Swal.fire("Eliminado", "Pedido eliminado correctamente.", "success");
      setOrders((prev) => prev.filter((o) => o.id !== row.id));
    } catch {
      await Swal.fire("Error", "No se pudo eliminar el pedido.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // ====== Head y filas (sin columna DESTINO) ======
  const TableHeader = () => (
    <div className="oa-table-head">
      <div>N°</div>
      <div>FECHA</div>
      <div>CLIENTE</div>
      <div className="oa-col-actions">ACCIONES</div>
    </div>
  );

  const Row = ({ item }) => (
    <div className="oa-table-row">
      <div>{item.id}</div>
      <div>{formatDateDMYShort(item.date_order)}</div>
      <div className="oa-ellipsis" title={item.client_name}>{item.client_name}</div>
      <div className="oa-actions">
        {item?.order_check ? (
          <button className="oa-btn oa-danger" disabled>Orden generada</button>
        ) : (
          <button className="oa-btn oa-btn-primary" onClick={() => handleGenerate(item)}>Generar orden</button>
        )}
        <button className="oa-icon-btn oa-view" title="Ver" onClick={() => handleView(item)}>
          <FontAwesomeIcon icon={faEye} />
        </button>
        <button
          className="oa-icon-btn oa-edit"
          title={item?.order_check ? "No se puede editar: ya generada" : "Editar"}
          onClick={() => handleEdit(item)}
          disabled={Boolean(item?.order_check)}
          style={Boolean(item?.order_check) ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
        >
          <FontAwesomeIcon icon={faPen} />
        </button>
        <button
          className="oa-icon-btn oa-danger"
          title={item?.order_check ? "No se puede eliminar: ya generada" : "Eliminar"}
          onClick={() => handleDelete(item)}
          disabled={Boolean(item?.order_check) || deletingId === item.id}
          style={Boolean(item?.order_check) || deletingId === item.id ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />

      {/* estilos mínimos para el modal */}
      <style>{`
        .preview-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999}
        .preview-card{background:#fff;border-radius:16px;max-width:980px;width:96%;max-height:90vh;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.25)}
        .preview-head{padding:16px 20px;border-bottom:1px solid #e6e8ee;display:flex;align-items:center;justify-content:space-between}
        .preview-title{font-weight:700;font-size:18px}
        .preview-close{border:0;background:transparent;cursor:pointer;font-size:18px}
        .preview-body{padding:16px 20px;overflow:auto}
        .grid-kv{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:12px}
        .kv{padding:10px;border:1px solid #edf0f6;border-radius:10px;background:#fafbff}
        .kv b{display:block;font-size:11px;color:#7b8190;margin-bottom:4px}
        .oa-mini-table{border:1px solid #e6e8ee;border-radius:10px;overflow:hidden}
        .oa-mini-head,.oa-mini-row{display:grid;grid-template-columns:100px 1fr 120px 110px 90px}
        .oa-mini-head{background:#f5f7fb;font-weight:700}
        .oa-mini-head>div,.oa-mini-row>div{padding:10px 12px;border-bottom:1px solid #eef1f6}
        .oa-mini-empty{padding:14px;text-align:center;color:#8a90a2}
      `}</style>

      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate("/sales-panel")}>
          ⬅ Volver
        </button>
      </div>

      <div className="oa-wrapper">
        <div className="oa-tabs">
          <NavLink to="/list-orders" className={({isActive}) => `oa-tab ${isActive ? "active" : ""}`}>Pedidos</NavLink>
          <NavLink to="/available-stock" className={({isActive}) => `oa-tab ${isActive ? "active" : ""}`}>Disponibilidad</NavLink>
        </div>

        <div className="oa-toolbar">
          <div className="oa-filter-group">
            <div className="oa-filter">
              <label>Fecha</label>
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            </div>
            <div className="oa-filter">
              <label>Cliente</label>
              <input type="text" placeholder="Cliente" value={filterClient} onChange={(e) => setFilterClient(e.target.value)} />
            </div>
            <button className="oa-btn" onClick={() => setPage(1)}>
              <FontAwesomeIcon icon={faSearch} />
              <span style={{ marginLeft: 8 }}>Buscar</span>
            </button>
          </div>

          <div className="oa-right-buttons">
            <button className="oa-btn oa-success" onClick={exportCSV}>
              <FontAwesomeIcon icon={faFileExcel} />
              <span style={{ marginLeft: 8 }}>Exportar filas</span>
            </button>

            <button className="oa-btn oa-primary" onClick={() => navigate("/sales-orders-new")}>
              <FontAwesomeIcon icon={faPlus} />
              <span style={{ marginLeft: 8 }}>Nuevo pedido</span>
            </button>
          </div>
        </div>

        <div className="oa-card">
          <div className="oa-table">
            <TableHeader />
            {loading ? (
              <div className="oa-empty">Cargando...</div>
            ) : pageData.length === 0 ? (
              <div className="oa-empty">No hay registros</div>
            ) : (
              pageData.map((it) => <Row key={it.id} item={it} />)
            )}
          </div>

          <div className="oa-pagination">
            <div className="oa-page-size">
              <span>Mostrar</span>
              <select value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value, 10))}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>registros por página</span>
            </div>

            <div className="oa-pages">
              <button className="oa-page-btn" disabled={currentPage === 1} onClick={() => setPage(1)}>«</button>
              <button className="oa-page-btn" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                .map((n) => (
                  <button key={n} className={`oa-page-btn ${n === currentPage ? "active" : ""}`} onClick={() => setPage(n)}>
                    {n}
                  </button>
                ))}
              <button className="oa-page-btn" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>›</button>
              <button className="oa-page-btn" disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>»</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal preview */}
      {showPreview && (
        <div className="preview-backdrop" onClick={() => setShowPreview(false)}>
          <div className="preview-card" onClick={(e) => e.stopPropagation()}>
            <div className="preview-head">
              <div className="preview-title">Orden de Venta(visualización)</div>
              <button className="preview-close" onClick={() => setShowPreview(false)} title="Cerrar">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="preview-body">
              {previewLoading ? (
                <div className="oa-mini-empty">Cargando datos…</div>
              ) : (
                <>
                  <div className="grid-kv">
                    <div className="kv"><b>N° COMPROBANTE</b><span>{previewHeader?.id ?? "—"}</span></div>
                    <div className="kv"><b>FECHA</b><span>{formatDateDMYShort(previewHeader?.date_order)}</span></div>
                    <div className="kv"><b>CLIENTE</b><span>{previewHeader?.client_name ?? "—"}</span></div>
                    <div className="kv"><b>VENDEDOR</b><span>{previewHeader?.salesman_name ?? "—"}</span></div>
                    <div className="kv"><b>LISTA DE PRECIO</b><span>{previewHeader?.price_list ?? "—"}</span></div>
                    <div className="kv"><b>COND. DE VENTA</b><span>{previewHeader?.sell_condition ?? "—"}</span></div>
                    <div className="kv"><b>COND. DE COBRO</b><span>{previewHeader?.payment_condition ?? "—"}</span></div>
                    <div className="kv"><b>OBSERVACIÓN</b><span>{previewHeader?.observation_order ?? "—"}</span></div>
                  </div>

                  <div className="oa-mini-table">
                    <div className="oa-mini-head">
                      <div>CÓDIGO</div>
                      <div>CORTE</div>
                      <div>PRECIO</div>
                      <div>CANTIDAD</div>
                      <div>TIPO</div>
                    </div>

                    {previewRows.length === 0 ? (
                      <div className="oa-mini-empty">La orden no tiene productos.</div>
                    ) : (
                      previewRows.map((p, idx) => (
                        <div key={idx} className="oa-mini-row">
                          <div>{p.product_cod || "—"}</div>
                          <div>{p.product_name}</div>
                          <div>${p.precio.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          <div>{p.cantidad}</div>
                          <div>{p.tipo_medida || "—"}</div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOrders;
