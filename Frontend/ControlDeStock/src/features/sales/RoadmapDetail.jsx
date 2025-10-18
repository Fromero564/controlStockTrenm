import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const u = (p) => `${API_BASE}${p.startsWith("/") ? p : `/${p}`}`;


function fmtDate(d) {
  if (!d) return "-";
  const s = String(d);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); // "YYYY-MM-DD" (o "YYYY-MM-DDTHH:mm...")
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;      // dd/mm/yyyy (sin tocar TZ)
  // fallback si llega otro formato
  const dt = new Date(s);
  if (isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function RoadmapDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null); // { header, remits[] }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(u(`/roadmaps/${id}`));
        const json = await res.json();

        if (!json?.ok) throw new Error(json?.msg || "Error");
        const r = json.roadmap || {};

        // Normalizo por si el backend todavía no tiene created_at/destination_main
        const header = {
          id: r.id,
          created_at: r.created_at || r.createdAt || null,
          delivery_date: r.delivery_date || r.deliveryDate || null,
          destination: r.destination_main || r.destinations?.[0] || "-",
          driver: r.driver || "-",
          plate: r.truck_license_plate || "-",
        };

        const remits = Array.isArray(r.remit_options)
          ? r.remit_options.map((o) => ({
              receipt_number: o.receipt_number || o.value,
              client_name:
                o.client_name ||
                (typeof o.label === "string" ? o.label.split("—")[1]?.trim() : ""),
            }))
          : [];

        setData({ header, remits });
      } catch (e) {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => nav("/Roadmap-list")}>
          ⬅ Volver
        </button>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 8px" }}>
        <h1 className="rm-title" style={{ marginTop: 4 }}>
          DETALLE HOJA DE RUTA
        </h1>

        {/* HEADER */}
        <div
          className="rm-card"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(160px, 1fr))",
            gap: 16,
            marginTop: 16,
            padding: 16,
          }}
        >
          <HeaderItem
            label="FECH CREACIÓN"
            value={loading ? "…" : fmtDate(data?.header?.created_at)}
          />
          <HeaderItem
            label="FECH REPARTO"
            value={loading ? "…" : fmtDate(data?.header?.delivery_date)}
          />
          <HeaderItem
            label="DESTINO"
            value={loading ? "…" : (data?.header?.destination || "-")}
          />
          <HeaderItem
            label="CHOFER"
            value={loading ? "…" : (data?.header?.driver || "-")}
          />
          <HeaderItem
            label="PATENTE"
            value={loading ? "…" : (data?.header?.plate || "-")}
          />
        </div>

        {/* REMITOS ASOCIADOS */}
        <h4 style={{ color: "#0B4D75", fontWeight: 700, marginTop: 24, marginBottom: 8 }}>
          REMITOS ASOCIADOS
        </h4>

        <div
          className="rm-card"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
            gap: 12,
            padding: 12,
          }}
        >
          {loading ? (
            <div style={{ gridColumn: "1 / -1" }}>Cargando…</div>
          ) : (data?.remits?.length ?? 0) === 0 ? (
            <div style={{ gridColumn: "1 / -1" }}>Sin remitos asociados</div>
          ) : (
            data.remits.map((r, i) => (
              <div
                key={i}
                style={{
                  background: "#eef3f8",
                  borderRadius: 6,
                  padding: "10px 12px",
                  border: "1px solid #d8e3ee",
                  lineHeight: 1.3,
                }}
              >
                <div style={{ fontWeight: 700 }}>N° {r.receipt_number}</div>
                <div style={{ fontSize: 13 }}>{r.client_name || "-"}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function HeaderItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#0B4D75", fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 4 }}>{value}</div>
    </div>
  );
}
