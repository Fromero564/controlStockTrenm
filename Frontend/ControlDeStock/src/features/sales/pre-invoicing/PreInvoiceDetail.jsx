// src/features/sales/pre-invoicing/PreInvoiceDetail.jsx
import { useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

export default function PreInvoiceDetail() {
  const { id } = useParams(); // :id = número de comprobante
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  const isPdf = sp.get("pdf") === "1";

  // ---- MODO VISUALIZAR (sin ?pdf=1): redirige a la vista real en solo lectura
  useEffect(() => {
    if (!id) return;
    if (!isPdf) {
      navigate(`/pre-invoicing/${encodeURIComponent(id)}?readonly=1`, {
        replace: true,
      });
    }
  }, [id, isPdf, navigate]);

  // ---- MODO PDF (con ?pdf=1): imprime y cierra
  useEffect(() => {
    if (!isPdf) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        setTimeout(() => {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          }
          setTimeout(() => window.close(), 500);
        }, 300);
      } catch {
        /* no-op */
      }
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [isPdf]);

  if (isPdf) {
    // Carga la vista real en solo lectura dentro del iframe
    const src = `/pre-invoicing/${encodeURIComponent(id)}?readonly=1`;
    return (
      <div style={{ margin: 0, padding: 0 }}>
        <iframe
          ref={iframeRef}
          title="PreInvoice PDF"
          src={src}
          style={{ border: 0, width: "100vw", height: "100vh" }}
        />
        <style>{`
          @media print {
            nav, .pv-header, .pv-pagination, .no-print { display: none !important; }
            body { background: #fff !important; }
          }
        `}</style>
      </div>
    );
  }

  // Mientras redirige (modo visualizar), no renderiza UI acá.
  return null;
}
