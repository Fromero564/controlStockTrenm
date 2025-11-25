import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import "../../assets/styles/listProductionProcess.css";

const API_URL = import.meta.env.VITE_API_URL;

const ListProductionProcess = () => {
  const navigate = useNavigate();

  // Datos base
  const [processes, setProcesses] = useState([]);
  const [groupedProcesses, setGroupedProcesses] = useState({}); // process_number -> rows
  const [processNumberBills, setProcessNumberBills] = useState({}); // process_number -> [bill_id,...]
  const [clientByBill, setClientByBill] = useState({}); // bill_id -> supplier/cliente

  // 🔹 Ingreso al proceso (por número de proceso)
  // { [process_number]: [ { type, quantity }, ... ] }
  const [inputByProcess, setInputByProcess] = useState({});

  // Filtros
  const [searchTerm, setSearchTerm] = useState(""); // Nº proceso
  const [fromDate, setFromDate] = useState(""); // yyyy-mm-dd
  const [toDate, setToDate] = useState(""); // yyyy-mm-dd

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ---------- Fetch: datos ----------
  useEffect(() => {
    fetchProcesses();
    fetchProcessNumbers();
    // eslint-disable-next-line
  }, []);

  // 1) Procesos productivos (panel)
  const fetchProcesses = async () => {
    try {
      const res = await fetch(`${API_URL}/all-process-products`);
      const data = await res.json();

      // Agrupar por Nº de proceso
      const grouped = data.reduce((acc, p) => {
        const key = p.process_number;
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
      }, {});

      setProcesses(data);
      setGroupedProcesses(grouped);
    } catch (error) {
      console.error("Error al obtener procesos:", error);
    }
  };

  // 2) Tabla pivote: Nº proceso -> bill_ids
  const fetchProcessNumbers = async () => {
    try {
      const res = await fetch(`${API_URL}/all-process-number`);
      const data = await res.json();
      const grouped = data.reduce((acc, row) => {
        if (!acc[row.process_number]) acc[row.process_number] = [];
        acc[row.process_number].push(row.bill_id);
        return acc;
      }, {});
      setProcessNumberBills(grouped);
    } catch (error) {
      console.error("Error al obtener process numbers:", error);
    }
  };

  // 3) Cuando tengamos bill_ids por proceso, buscamos clientes por cada bill_id
  useEffect(() => {
    const loadClients = async () => {
      try {
        const allBillIds = new Set(
          Object.values(processNumberBills).flat().filter(Boolean)
        );

        // Evitar volver a pedir los que ya tenemos
        const idsToFetch = Array.from(allBillIds).filter(
          (id) => clientByBill[id] === undefined
        );

        if (idsToFetch.length === 0) return;

        const entries = await Promise.all(
          idsToFetch.map(async (billId) => {
            try {
              const res = await fetch(`${API_URL}/find-remit/${billId}`);
              if (!res.ok) return [billId, null];
              const remit = await res.json();

              const supplier = remit?.supplier ?? null;
              return [billId, supplier];
            } catch {
              return [billId, null];
            }
          })
        );

        const map = {};
        for (const [id, supplier] of entries) map[id] = supplier;
        setClientByBill((prev) => ({ ...prev, ...map }));
      } catch (e) {
        console.error("Error cargando clientes:", e);
      }
    };

    loadClients();
  }, [processNumberBills]); // eslint-disable-line

  // 4) 🔹 Armar INGRESO al proceso por número de proceso,
  // usando bill-details-readonly de cada bill_id
  useEffect(() => {
    const buildInputs = async () => {
      const result = {};

      const entries = Object.entries(processNumberBills); // [[procNum, [billIds]], ...]

      for (const [procNum, billIds] of entries) {
        const agg = {}; // { type: totalQuantity }

        for (const billId of billIds || []) {
          try {
            const res = await fetch(
              `${API_URL}/bill-details-readonly/${billId}`
            );
            if (!res.ok) continue;
            const details = await res.json();
            (Array.isArray(details) ? details : []).forEach((d) => {
              const type = String(d.type || "").trim();
              const qty = Number(d.quantity || 0);
              if (!type || !qty) return;
              agg[type] = (agg[type] || 0) + qty;
            });
          } catch (e) {
            console.error(
              "Error al obtener detalles de bill para proceso",
              procNum,
              "bill",
              billId,
              e
            );
          }
        }

        result[procNum] = Object.entries(agg).map(([type, quantity]) => ({
          type,
          quantity,
        }));
      }

      setInputByProcess(result);
    };

    if (Object.keys(processNumberBills).length > 0) {
      buildInputs();
    } else {
      setInputByProcess({});
    }
  }, [processNumberBills]);

  // ---------- Filtros (Nº proceso + fechas) ----------
  const applyFilters = () => {
    const term = searchTerm.trim();

    // Filtrar en base a la lista completa de procesos
    const filteredRows = processes.filter((p) => {
      // Nº de proceso
      const byTerm = term ? p.process_number.toString().includes(term) : true;

      // Fechas (createdAt)
      const byDate = (() => {
        if (!fromDate && !toDate) return true;
        const created = new Date(p.createdAt);
        if (isNaN(created)) return false;

        let ok = true;
        if (fromDate) {
          const from = new Date(`${fromDate}T00:00:00`);
          ok = ok && created >= from;
        }
        if (toDate) {
          const to = new Date(`${toDate}T23:59:59`);
          ok = ok && created <= to;
        }
        return ok;
      })();

      return byTerm && byDate;
    });

    // Re-agrupar por Nº de proceso tras el filtro
    const grouped = filteredRows.reduce((acc, p) => {
      const key = p.process_number;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});

    setGroupedProcesses(grouped);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");

    const grouped = processes.reduce((acc, p) => {
      const key = p.process_number;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});

    setGroupedProcesses(grouped);
    setCurrentPage(1);
  };

  // ---------- Helpers ----------
  const handleView = (process_number) => {
    navigate(`/production-process/details/${process_number}`);
  };

  const handleDelete = async (process_number) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text:
        "Esta acción eliminará TODOS los procesos de este número de proceso y actualizará el stock.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(
          `${API_URL}/delete-process-by-process-number/${process_number}`,
          { method: "DELETE" }
        );

        if (res.ok) {
          Swal.fire(
            "Eliminado",
            "Los procesos fueron eliminados y el stock actualizado.",
            "success"
          );
          fetchProcesses();
          fetchProcessNumbers();
          setCurrentPage(1);
        } else {
          const error = await res.json();
          Swal.fire(
            "Error",
            error.mensaje || "No se pudo eliminar los procesos.",
            "error"
          );
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "No se pudo eliminar los procesos.", "error");
      }
    }
  };

  const handleEdit = (process_number) => {
    window.location.href = `/production-process/${process_number}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    if (isNaN(date)) return "Fecha inválida";
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Lista de Nº de proceso visibles con filtros aplicados
  const uniqueProcessNumbers = useMemo(
    () => Object.keys(groupedProcesses),
    [groupedProcesses]
  );

  // Paginación
  const totalPages = Math.max(
    1,
    Math.ceil(uniqueProcessNumbers.length / itemsPerPage)
  );
  const paginatedProcessNumbers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return uniqueProcessNumbers.slice(start, start + itemsPerPage);
  }, [uniqueProcessNumbers, currentPage]);

  // ---------- Render ----------
  return (
    <div className="production-process-container">
      <Navbar />

      <div style={{ margin: "20px" }}>
        <button
          className="boton-volver"
          onClick={() => navigate("/operator-panel")}
        >
          ⬅ Volver
        </button>
      </div>

      {/* Filtros */}
      <div className="production-process-search">
        <div className="pp-field">
          <label>Número de proceso</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Nº de proceso"
          />
        </div>

        <div className="pp-field">
          <label>Desde</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="pp-field">
          <label>Hasta</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className="pp-actions">
          <button onClick={applyFilters} className="pp-btn pp-btn-search">
            Aplicar filtros
          </button>
          <button onClick={clearFilters} className="pp-btn pp-btn-reset">
            Limpiar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <table className="production-process-table">
        <thead>
          <tr>
            <th>Número de proceso</th>
            <th>Fecha</th>
            <th>Comprobantes asociados</th>
            <th>Proveedor(es)</th>
            <th>Ingreso productivo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProcessNumbers.map((procNum) => {
            const rows = groupedProcesses[procNum];
            const first = rows?.[0];

            // Comprobantes (cuántos y/o ids)
            const bills = processNumberBills[procNum] || [];
            const comprobantesLabel = bills.length > 0 ? bills.length : 0;

            // Clientes únicos a partir de bill_ids -> clientByBill
            const uniqueClients = Array.from(
              new Set(
                bills
                  .map((id) => clientByBill[id])
                  .filter((x) => x && String(x).trim() !== "")
              )
            );

            const inputs = inputByProcess[procNum] || [];

            return (
              <tr key={procNum}>
                <td>{procNum}</td>
                <td>{formatDate(first?.createdAt)}</td>
                <td>{comprobantesLabel}</td>
                <td>
                  {uniqueClients.length > 0
                    ? uniqueClients.join(", ")
                    : "—"}
                </td>
                <td>
                  {inputs.length > 0 ? (
                    inputs.map((item, idx) => (
                      <div key={idx}>
                        {item.type} — {item.quantity}
                      </div>
                    ))
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <button
                    className="pp-btn pp-btn-view"
                    onClick={() => handleView(procNum)}
                    title="Ver detalles"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    className="pp-btn pp-btn-edit"
                    onClick={() => handleEdit(procNum)}
                    title="Editar proceso"
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    className="pp-btn pp-btn-delete"
                    onClick={() => handleDelete(procNum)}
                    title="Eliminar proceso"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            );
          })}

          {paginatedProcessNumbers.length === 0 && (
            <tr>
              <td colSpan="6">No hay procesos para mostrar.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginación */}
      {uniqueProcessNumbers.length > 0 && (
        <nav className="pp-pagination" aria-label="Paginación de procesos">
          <button
            className="pp-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ← Anterior
          </button>

          <div className="pp-page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
              // Mostrar primeras/últimas y vecinas
              if (
                n === 1 ||
                n === totalPages ||
                Math.abs(n - currentPage) <= 1
              ) {
                return (
                  <button
                    key={n}
                    className={`pp-page-btn ${n === currentPage ? "active" : ""}`}
                    onClick={() => setCurrentPage(n)}
                  >
                    {n}
                  </button>
                );
              }
              if (
                (n === currentPage - 2 && n > 1) ||
                (n === currentPage + 2 && n < totalPages)
              ) {
                return (
                  <span key={`ellipsis-${n}`} className="pp-ellipsis">
                    …
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            className="pp-page-btn"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
          >
            Siguiente →
          </button>
        </nav>
      )}
    </div>
  );
};

export default ListProductionProcess;
