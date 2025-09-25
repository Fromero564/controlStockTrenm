import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import "../../assets/styles/listProductionProcess.css";

const API_URL = import.meta.env.VITE_API_URL;

const ListProductionProcess = () => {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState([]);
  const [groupedProcesses, setGroupedProcesses] = useState({});
  const [processNumberBills, setProcessNumberBills] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchProcesses();
    fetchProcessNumbers();
    // eslint-disable-next-line
  }, []);

  // Trae los procesos productivos
  const fetchProcesses = async () => {
    try {
      const res = await fetch(`${API_URL}/all-process-products`);
      const data = await res.json();

      const grouped = data.reduce((acc, process) => {
        if (!acc[process.process_number]) acc[process.process_number] = [];
        acc[process.process_number].push(process);
        return acc;
      }, {});

      setProcesses(data);
      setGroupedProcesses(grouped);
    } catch (error) {
      console.error("Error al obtener procesos:", error);
    }
  };

  // Trae la tabla pivote process_number => [bill_id, ...]
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

  const handleSearch = () => {
    const term = searchTerm.trim();
    const filtered = term
      ? processes.filter((p) => p.process_number.toString().includes(term))
      : processes;

    const grouped = filtered.reduce((acc, process) => {
      if (!acc[process.process_number]) acc[process.process_number] = [];
      acc[process.process_number].push(process);
      return acc;
    }, {});

    setGroupedProcesses(grouped);
    setCurrentPage(1);
  };

  // 🚨 MODIFICADO: ahora navega a ProductionProcessDetails
  const handleView = (process_number) => {
    navigate(`/production-process/details/${process_number}`);
  };

  const handleDelete = async (process_number) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará TODOS los procesos de este número de proceso y actualizará el stock.",
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
          Swal.fire("Eliminado", "Los procesos fueron eliminados y el stock actualizado.", "success");
          fetchProcesses(); // recarga la lista
          fetchProcessNumbers(); // recarga la lista de bills asociados
        } else {
          const error = await res.json();
          Swal.fire("Error", error.mensaje || "No se pudo eliminar los procesos.", "error");
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

  const uniqueProcessNumbers = Object.keys(groupedProcesses);
  const totalPages = Math.ceil(uniqueProcessNumbers.length / itemsPerPage);
  const paginatedProcessNumbers = uniqueProcessNumbers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  return (
    <div className="production-process-container">
      <Navbar />

      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate("/operator-panel")}>⬅ Volver</button>
      </div>
      <div className="production-process-search">
        <label>Número de proceso</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por Número de proceso"
        />
        <button onClick={handleSearch} className="pp-btn pp-btn-search">
          Buscar
        </button>
      </div>

      <table className="production-process-table">
        <thead>
          <tr>
            <th>Número de proceso</th>
            <th>Fecha</th>
            <th>Comprobantes asociados</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProcessNumbers.map((processNumber) => {
            const firstProcess = groupedProcesses[processNumber][0];
            const comprobantes =
              processNumberBills[processNumber] && processNumberBills[processNumber].length
                ? processNumberBills[processNumber].join(", ")
                : "N/A";
            return (
              <tr key={processNumber}>
                <td>{processNumber}</td>
                <td>{formatDate(firstProcess.createdAt)}</td>
                <td>{comprobantes}</td>
                <td>
                  <button
                    className="pp-btn pp-btn-view"
                    onClick={() => handleView(processNumber)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    className="pp-btn pp-btn-edit"
                    onClick={() => handleEdit(firstProcess.process_number)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    className="pp-btn pp-btn-delete"
                    onClick={() => handleDelete(firstProcess.process_number)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            );
          })}

          {paginatedProcessNumbers.length === 0 && (
            <tr>
              <td colSpan="4">No hay procesos para mostrar.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="production-process-pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          ← Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};

export default ListProductionProcess;
