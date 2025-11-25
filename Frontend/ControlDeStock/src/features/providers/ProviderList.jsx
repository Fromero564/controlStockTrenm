import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faXmark } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import "../../assets/styles/providerList.css";
import Navbar from "../../components/Navbar.jsx";

const ProviderList = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/allProviders`)
      .then((response) => response.json())
      .then((data) => setProviders(data))
      .catch((error) => console.error("Error al obtener proveedores:", error));
  }, []);

  const handleDelete = (provider) => {
    Swal.fire({
      title: `¿Eliminar proveedor "${provider.provider_name}"?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${API_URL}/deleteProvider/${provider.id}`, {
          method: "DELETE",
        })
          .then((res) => {
            if (!res.ok) throw new Error("Error al eliminar");
            setProviders((prev) => prev.filter((p) => p.id !== provider.id));
            Swal.fire("¡Eliminado!", "El proveedor fue eliminado.", "success");
          })
          .catch((err) => {
            console.error(err);
            Swal.fire("Error", "No se pudo eliminar el proveedor.", "error");
          });
      }
    });
  };

  const norm = (v) => (v ?? "").toString().toLowerCase().trim();
  const q = norm(search);

  const filteredProviders = Array.isArray(providers)
    ? providers.filter((p) => {
        const byCode = norm(p.id).includes(q);
        const byName = norm(p.provider_name).includes(q);
        const byCUIT = norm(p.provider_id_number).includes(q);
        const byEmail = norm(p.provider_email).includes(q);
        const byPhone = norm(p.provider_phone).includes(q);
        return q === "" || byCode || byName || byCUIT || byEmail || byPhone;
      })
    : [];

  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProviders = filteredProviders.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const onChangeSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="providers-root">
      <Navbar />
      <div className="topbar-wrap">
        <button
          className="boton-volver"
          onClick={() => navigate("/operator-panel")}
        >
          ⬅ Volver
        </button>
      </div>

      <div className="container providers-container">
        <div className="title-row">
          <h1>Proveedores</h1>
          <button
            className="new-button"
            onClick={() => navigate("/provider-load")}
          >
            Nuevo Proveedor +
          </button>
        </div>

        <div className="search-row">
          <label htmlFor="search">Buscar por código, nombre o CUIT</label>
          <div className="search-controls">
            <input
              type="text"
              id="search"
              placeholder="Ej: 12 | ACME | 20-12345678-3"
              value={search}
              onChange={onChangeSearch}
              className="search-input"
            />
            {search && (
              <button className="clear-button" onClick={clearSearch}>
                Limpiar
              </button>
            )}
            <button
              className="search-button"
              onClick={() => setCurrentPage(1)}
            >
              Buscar
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table providers-table">
            <thead>
              <tr>
                <th className="col-id">Código</th>
                <th className="col-name">Nombre</th>
                <th className="col-type">Tipo Id</th>
                <th className="col-doc">N° Identificación</th>
                <th className="col-iva">Condición IVA</th>
                <th className="col-email">Email</th>
                <th className="col-phone">Teléfono</th>
                <th className="col-address">Domicilio</th>
                <th className="col-country">País</th>
                <th className="col-province">Provincia</th>
                <th className="col-location">Localidad</th>
                <th className="col-actions">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {currentProviders.map((p) => {
                const inactive =
                  p.provider_state === false ||
                  p.provider_state === 0 ||
                  p.provider_state === "0";

                return (
                  <tr
                    key={p.id}
                    className={inactive ? "inactive-row" : ""}
                    style={
                      inactive
                        ? {
                            backgroundColor: "#ffe6e6",
                            color: "#777",
                          }
                        : {}
                    }
                  >
                    <td>{p.id}</td>

                    <td>
                      {p.provider_name?.toUpperCase()}{" "}
                      {inactive && (
                        <span
                          style={{
                            background: "#ff4d4d",
                            color: "#fff",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            marginLeft: "5px",
                          }}
                        >
                          INACTIVO
                        </span>
                      )}
                    </td>

                    <td>{p.provider_type_id?.toUpperCase()}</td>
                    <td>{p.provider_id_number}</td>
                    <td>{p.provider_iva_condition?.toUpperCase()}</td>
                    <td className="truncate">
                      {p.provider_email?.toUpperCase()}
                    </td>
                    <td>{p.provider_phone}</td>
                    <td className="truncate">
                      {p.provider_adress?.toUpperCase()}
                    </td>
                    <td>{p.provider_country?.toUpperCase()}</td>
                    <td>{p.provider_province?.toUpperCase()}</td>
                    <td>{p.provider_location?.toUpperCase()}</td>

                    <td>
                      <button
                        className="edit-button"
                        onClick={() =>
                          navigate(`/provider-load/${p.id}`)
                        }
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => handleDelete(p)}
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {currentProviders.length === 0 && (
                <tr>
                  <td colSpan={12} className="empty-cell">
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button onClick={goToPrevPage} disabled={currentPage === 1}>
            ← Anterior
          </button>
          <span>
            Página <strong>{currentPage}</strong> de{" "}
            <strong>{totalPages}</strong>
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderList;
