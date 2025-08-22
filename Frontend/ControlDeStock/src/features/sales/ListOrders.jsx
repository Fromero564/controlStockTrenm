import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../assets/styles/listOrders.css';
import Navbar from "../../components/Navbar";
import AvailableStockOrders from "../../components/AvailableStockOrders.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faEye, faFileExcel, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;
const ORDERS_URL = `${API_URL}/all-orders`;
const DELETE_ORDER_URL = (id) => `${API_URL}/delete-order/${id}`;

const ListOrders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pedidos");
  const [orders, setOrders] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterDestino, setFilterDestino] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  const getDestino = (o) => o.destination ?? o.destino ?? o.city ?? o._destino ?? "";

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const passDate = filterDate ? o.date_order === filterDate : true;
      const passClient = filterClient ? normalize(o.client_name).includes(normalize(filterClient)) : true;
      const passDestino = filterDestino ? normalize(getDestino(o)).includes(normalize(filterDestino)) : true;
      return passDate && passClient && passDestino;
    });
  }, [orders, filterDate, filterClient, filterDestino]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageData = filtered.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setPage(1);
  }, [filterDate, filterClient, filterDestino, pageSize]);

  const formatDateDMYShort = (isoDate) => {
    if (!isoDate) return "—";
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${String(y).slice(2)}`;
  };

  const exportCSV = () => {
    const headers = ["FECHA", "CLIENTE", "DESTINO", "VENDEDOR", "LISTA", "COND_VENTA", "COND_COBRO"];
    const rows = filtered.map((o) => [
      formatDateDMYShort(o.date_order),
      o.client_name ?? "",
      getDestino(o) || "",
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
      const res = await fetch(`${API_URL}/get-order-by-id/${id}`);
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
        await Swal.fire({
          icon: "error",
          title: "No encontrada",
          text: "No se encontró la orden.",
        });
        return false;
      }
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo verificar el estado de la orden.",
      });
      return false;
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Error de red",
        text: "No se pudo conectar con el servidor.",
      });
      return false;
    }
  };

  const handleGenerate = async (row) => {
    const ok = await checkBeforeGenerate(row.id);
    if (!ok) return;
    navigate(`/generate-sales-order/${row.id}`);
  };

  const handleView = (row) => Swal.fire("Ver", `Pedido #${row.id}`, "info");

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
        setOrders(prev => prev.filter(o => o.id !== row.id));
        return;
      }
      if (!res.ok) throw new Error();

      await Swal.fire("Eliminado", "Pedido eliminado correctamente.", "success");
      setOrders(prev => prev.filter(o => o.id !== row.id));
    } catch (e) {
      await Swal.fire("Error", "No se pudo eliminar el pedido.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const TableHeader = () => (
    <div className="oa-table-head">
      <div>FECHA</div>
      <div>CLIENTE</div>
      <div>DESTINO</div>
      <div className="oa-col-actions">ACCIONES</div>
    </div>
  );

  const Row = ({ item }) => (
    <div className="oa-table-row">
      <div>{formatDateDMYShort(item.date_order)}</div>
      <div className="oa-ellipsis" title={item.client_name}>{item.client_name}</div>
      <div className="oa-ellipsis" title="—">—</div>
      <div className="oa-actions">
        {item?.order_check ? (
          <button className="oa-btn oa-danger" disabled>
            Orden generada
          </button>
        ) : (
          <button className="oa-btn oa-btn-primary" onClick={() => handleGenerate(item)}>
            Generar orden
          </button>
        )}

        <button
          className="oa-icon-btn oa-view"
          title="Ver"
          onClick={() => handleView(item)}
        >
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

  if (activeTab === "disponibilidad") {
    return <AvailableStockOrders />;
  }

  return (
    <div>
      <Navbar />
      <div className="oa-wrapper">
        <div className="oa-tabs">
          <button className={`oa-tab ${activeTab === "pedidos" ? "active" : ""}`} onClick={() => setActiveTab("pedidos")}>Pedidos</button>
          <button className={`oa-tab ${activeTab === "disponibilidad" ? "active" : ""}`} onClick={() => setActiveTab("disponibilidad")}>Disponibilidad</button>
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
            <div className="oa-filter">
              <label>Destino</label>
              <input type="text" placeholder="Destino" value={filterDestino} onChange={(e) => setFilterDestino(e.target.value)} />
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
          {loading ? (
            <div className="oa-loading">Cargando...</div>
          ) : (
            <>
              <div className="oa-table">
                <TableHeader />
                {pageData.length === 0 ? (
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
                    .slice(Math.max(0, currentPage - 3), Math.max(0, currentPage - 3) + 5)
                    .map((n) => (
                      <button key={n} className={`oa-page-btn ${n === currentPage ? "active" : ""}`} onClick={() => setPage(n)}>
                        {n}
                      </button>
                    ))}
                  <button className="oa-page-btn" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>›</button>
                  <button className="oa-page-btn" disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>»</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListOrders;
