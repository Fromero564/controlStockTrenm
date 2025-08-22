
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faXmark } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import "../../assets/styles/clientList.css";
import Navbar from "../../components/Navbar.jsx";

const ClientList = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const CLIENTS_API = `${API_URL}/allclients`;       
  const SELLERS_API = `${API_URL}/all-sellers`;
  const PRICE_LISTS_API = `${API_URL}/all-price-list`;

  const [clients, setClients] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [priceLists, setPriceLists] = useState([]);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetch(CLIENTS_API)
      .then((r) => r.json())
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]));
  }, [CLIENTS_API]);

  useEffect(() => {
    fetch(SELLERS_API)
      .then((r) => r.json())
      .then((data) => setSellers(data?.sellers || []))
      .catch(() => setSellers([]));
  }, []);

  useEffect(() => {
    fetch(PRICE_LISTS_API)
      .then((r) => r.json())
      .then((data) => setPriceLists(Array.isArray(data) ? data : (data || [])))
      .catch(() => setPriceLists([]));
  }, []);

  const sellerById = useMemo(() => {
    const map = new Map();
    sellers.forEach((s) => map.set(s.id, s));
    return map;
  }, [sellers]);

 
  const priceListNamesByClient = useMemo(() => {
    const map = new Map();
    priceLists.forEach((pl) => {
      const clientId =
        pl.client_id ?? pl.client ?? pl.clientId ?? pl.clientID ?? null;
      const name = pl.name ?? pl.list_name ?? pl.price_list_name ?? "";
      if (!clientId || !name) return;
      const prev = map.get(clientId) || [];
      prev.push(name);
      map.set(clientId, prev);
    });
    // join por cliente
    const out = new Map();
    map.forEach((arr, k) => out.set(k, arr.join(", ")));
    return out;
  }, [priceLists]);

  const uniqueLocations = useMemo(() => {
    const set = new Set(clients.map((c) => c.client_location).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [clients]);

  const applyFilters = (list) => {
    let out = list;

    if (search.trim() !== "") {
      const q = search.toLowerCase();
      out = out.filter(
        (c) =>
          String(c.id).toLowerCase().includes(q) ||
          (c.client_name || "").toLowerCase().includes(q) ||
          (c.client_id_number ? String(c.client_id_number) : "").includes(q)
      );
    }

    if (stateFilter !== "all") {
      const wantActive = stateFilter === "active";
      out = out.filter((c) => Boolean(c.client_state) === wantActive);
    }

    if (locationFilter) {
      out = out.filter((c) => (c.client_location || "") === locationFilter);
    }

    // filtros de fechas: si tu API no devuelve fecha, dejalo preparado
    // if (fromDate) { ... }
    // if (toDate) { ... }

    return out;
  };

  const filtered = useMemo(
    () => applyFilters(clients),
    [clients, search, stateFilter, locationFilter, fromDate, toDate]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, stateFilter, locationFilter, rowsPerPage]);

  const handleDelete = (client) => {
    Swal.fire({
      title: `¿Eliminar cliente "${client.client_name}"?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${API_URL}/deleteClient/${client.id}`, { method: "DELETE" })
          .then((res) => {
            if (!res.ok) throw new Error("Error al eliminar");
            setClients((prev) => prev.filter((c) => c.id !== client.id));
            Swal.fire("¡Eliminado!", "El cliente fue eliminado.", "success");
          })
          .catch(() => {
            Swal.fire("Error", "No se pudo eliminar el cliente.", "error");
          });
      }
    });
  };

  const renderPager = () => {
    const maxButtons = 7;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    const buttons = [];
    for (let p = start; p <= end; p++) {
      buttons.push(
        <button
          key={p}
          className={`page-btn ${currentPage === p ? "active" : ""}`}
          onClick={() => setCurrentPage(p)}
          type="button"
        >
          {p}
        </button>
      );
    }
    return (
      <div className="pagination">
        <button
          type="button"
          className="page-btn"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          «
        </button>
        <button
          type="button"
          className="page-btn"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          ‹
        </button>
        {buttons}
        <button
          type="button"
          className="page-btn"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          ›
        </button>
        <button
          type="button"
          className="page-btn"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          »
        </button>
      </div>
    );
  };

  return (
    <div className="body-client-list">
      <Navbar />

      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>

      <div className="client-list-page">
        <h1 className="page-title">Clientes</h1>

        <div className="filters-card">
          <div className="filters-grid">
            <div className="filter-item">
              <label>Estado clientes</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <option value="all">Seleccionar</option>
                <option value="active">Activo</option>
                <option value="inactive">Baja</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Desde</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="filter-item">
              <label>Hasta</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className="filter-item">
              <label>Localidad</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">Seleccionar</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item search-wide">
              <label>Buscar</label>
              <input
                type="text"
                placeholder="Código, nombre o CUIT"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-actions">
              <button className="filter-btn" onClick={() => setCurrentPage(1)}>
                Filtrar
              </button>
              <button
                className="clear-btn"
                onClick={() => {
                  setSearch("");
                  setStateFilter("all");
                  setLocationFilter("");
                  setFromDate("");
                  setToDate("");
                }}
              >
                Limpiar
              </button>
              <button
                className="new-btn"
                onClick={() => navigate("/client-load")}
              >
                Nuevo cliente +
              </button>
            </div>
          </div>
        </div>

        <div className="table-card">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>CUIT</th>
                  <th>Vendedor</th>
                  <th>Localidad</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Cond. pago</th>
                  <th>M. cobro</th>
                  <th>Lista(s) de precio</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((c) => {
                  const seller = sellerById.get(c.client_seller);
                  const sellerLabel = seller ? seller.name : "-";
                  const priceListNames =
                    priceListNamesByClient.get(c.id) || "-";

                  return (
                    <tr key={c.id}>
                      <td className="code-cell">
                        {String(c.id).padStart(3, "0")}
                      </td>
                      <td className="name-cell">{c.client_name}</td>
                      <td>
                        <span
                          className={`badge ${
                            c.client_state ? "ok" : "low"
                          }`}
                        >
                          {c.client_state ? "Activo" : "Baja"}
                        </span>
                      </td>
                      <td>{c.client_id_number}</td>
                      <td>{sellerLabel}</td>
                      <td>{c.client_location}</td>
                      <td>{c.client_adress}</td>
                      <td>{c.client_phone}</td>
                      <td>{c.client_payment_condition || "-"}</td>
                      <td>{c.client_sale_condition || "-"}</td>
                      <td>{priceListNames}</td>
                      <td className="actions-cell">
                        <button
                          className="icon-btn edit"
                          onClick={() => navigate(`/client-load/${c.id}`)}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button
                          className="icon-btn delete"
                          onClick={() => handleDelete(c)}
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={12} className="empty-row">
                      No hay resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <div className="rows-picker">
              <span>Mostrar</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>registros por página</span>
            </div>
            {renderPager()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientList;
