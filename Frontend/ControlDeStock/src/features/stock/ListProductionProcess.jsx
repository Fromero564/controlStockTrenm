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
  const [groupedBills, setGroupedBills] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      const res = await fetch(`${API_URL}/all-process-products`);
      const data = await res.json();

      const grouped = data.reduce((acc, process) => {
        if (!acc[process.bill_id]) acc[process.bill_id] = [];
        acc[process.bill_id].push(process);
        return acc;
      }, {});

      setProcesses(data);
      setGroupedBills(grouped);
    } catch (error) {
      console.error("Error al obtener procesos:", error);
    }
  };

  const handleSearch = () => {
    const term = searchTerm.trim();
    const filtered = term
      ? processes.filter((p) => p.bill_id.toString().includes(term))
      : processes;

    const grouped = filtered.reduce((acc, process) => {
      if (!acc[process.bill_id]) acc[process.bill_id] = [];
      acc[process.bill_id].push(process);
      return acc;
    }, {});

    setGroupedBills(grouped);
    setCurrentPage(1);
  };

  const handleView = (bill_id) => {
    setSelectedBill(groupedBills[bill_id]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedBill(null);
    setShowModal(false);
  };
  const handleDelete = async (bill_id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará TODOS los procesos de este comprobante y actualizará el stock.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/delete-process-by-bill/${bill_id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          Swal.fire("Eliminado", "Los procesos fueron eliminados y el stock actualizado.", "success");
          fetchProcesses(); // recarga la lista
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
  const handleEdit = (bill_id) => {
    window.location.href = `/production-process/${bill_id}`;
  };


  const uniqueBillIds = Object.keys(groupedBills);
  const totalPages = Math.ceil(uniqueBillIds.length / itemsPerPage);
  const paginatedBillIds = uniqueBillIds.slice(
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
    }); // Formato dd/MM/yyyy
  };

  return (
    <div className="production-process-container">
      <Navbar />

      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>⬅ Volver</button>
      </div>
      <div className="production-process-search">
        <label>N° Comprobante</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por N° Comprobante"
        />
        <button onClick={handleSearch} className="pp-btn pp-btn-search">
          Buscar
        </button>
      </div>

      <table className="production-process-table">
        <thead>
          <tr>
            <th>N° Comprobante</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedBillIds.map((billId) => {
            const firstProcess = groupedBills[billId][0];
            return (
              <tr key={billId}>
                <td>{billId}</td>
                <td>{formatDate(firstProcess.createdAt)}</td>
                <td>
                  <button
                    className="pp-btn pp-btn-view"
                    onClick={() => handleView(billId)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    className="pp-btn pp-btn-edit"
                    onClick={() => handleEdit(firstProcess.bill_id)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>

                  <button
                    className="pp-btn pp-btn-delete"
                    onClick={() => handleDelete(firstProcess.bill_id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>

                </td>
              </tr>
            );
          })}

          {paginatedBillIds.length === 0 && (
            <tr>
              <td colSpan="3">No hay procesos para mostrar.</td>
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

      {showModal && selectedBill && (
        <div className="production-process-modal-overlay">
          <div className="production-process-modal">
            <h3>Detalles del Comprobante #{selectedBill[0].bill_id}</h3>
            {selectedBill.map((proc) => (
              <div key={proc.id} className="production-process-detail">
                <p>
                  <strong>Tipo:</strong> {proc.type}
                </p>
                <p>
                  <strong>Cantidad:</strong> {proc.quantity}
                </p>
                <p>
                  <strong>Peso Bruto:</strong> {proc.gross_weight}
                </p>
                <p>
                  <strong>Tara:</strong> {proc.tares}
                </p>
                <p>
                  <strong>Peso Neto:</strong> {proc.net_weight}
                </p>
                <hr />
              </div>
            ))}
            <button
              className="pp-btn pp-btn-close"
              onClick={handleCloseModal}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProductionProcess;
