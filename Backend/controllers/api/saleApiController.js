const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, fn, col, where } = require("sequelize");
const moment = require("moment");
const { stringify } = require("querystring");
const OrderProductsClient = require("../../src/config/models/OrderProductsClient");
const PDFDocument = require("pdfkit");

const Truck = db.Truck;
const Destination = db.Destination;
const billSupplier = db.BillSupplier;
const ProductSubproduct = db.ProductSubproduct;
const meatIncome = db.MeatIncome;
const billDetail = db.BillDetail;
const tare = db.Tare;
const ProductsAvailable = db.ProductsAvailable;
const ProcessMeat = db.ProcessMeat;
const ObservationsMeatIncome = db.ObservationsMeatIncome;
const ProductStock = db.ProductStock;
const OtherProductManual = db.OtherProductManual;
const ProductCategories = db.ProductCategories
const ProcessNumber = db.ProcessNumber;
const Seller = db.Seller;
const NewOrder = db.NewOrder;
const OrderProductClient = db.OrderProductClient;
const PriceList = db.PriceList;
const PriceListProduct = db.PriceListProduct;
const ProductsSellOrder = db.ProductsSellOrder;
const SaleCondition = db.SaleCondition;
const PaymentCondition = db.PaymentCondition;
const CutsHeader = db.CutsHeader;
const CutsDetail = db.CutsDetail;
const Driver = db.Driver;
const FinalRemit = db.FinalRemit;
const FinalRemitProduct = db.FinalRemitProduct;
const RoadmapInfo = db.RoadmapInfo;
const RoadmapInfoDestination = db.RoadmapInfoDestination;
const Preinvoice = db.Preinvoice;
const PreinvoiceReturn = db.PreinvoiceReturn;



async function packagingFor(orderId, productId) {
    const headers = await CutsHeader.findAll({
        where: { receipt_number: orderId, product_code: String(productId) },
        include: [{ model: CutsDetail, as: "details" }],
        order: [["id", "ASC"]],
    });

    const counts = {};
    for (const h of headers) {
        for (const d of (h.details || [])) {
            const k = String((d.packaging_type || "").trim() || "-");
            counts[k] = (counts[k] || 0) + 1;
        }
    }
    let best = "-"; let bestN = -1;
    Object.entries(counts).forEach(([k, n]) => { if (n > bestN) { best = k; bestN = n; } });
    return best;
}

async function checkFinalRemitExists(req, res) {
    try {
        const orderId = Number(req.query.order_id);
        if (!orderId) return res.status(400).json({ ok: false, msg: "order_id requerido" });

        // 1) Busco el header de remito para esa orden
        const header = await FinalRemit.findOne({
            where: { order_id: orderId },
            attributes: ["id"],
            order: [["id", "DESC"]],
        });

        if (!header) return res.json({ ok: true, exists: false });

        // 2) Reviso si tiene al menos un detalle
        const itemsCount = await FinalRemitProduct.count({
            where: { final_remit_id: header.id },
        });

        return res.json({ ok: true, exists: itemsCount > 0 });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ ok: false, msg: "Error verificando remito" });
    }
}


// Cantidad pedida (sum(qty_requested)) para una orden+producto
async function qtyRequestedOf(orderId, productId) {
    const n = await CutsHeader.sum("qty_requested", {
        where: { receipt_number: orderId, product_code: String(productId) },
    });
    return Number(n || 0);
}


const toNumber = (v) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return v;
    const n = parseFloat(String(v).replace(",", "."));
    return isNaN(n) ? 0 : n;
};

const toBool = (v) => {
    if (v === true) return true;
    if (v === false) return false;
    if (typeof v === "string") return v.toLowerCase() === "true" || v === "1";
    if (typeof v === "number") return v === 1;
    return false;
};


// Helper: devuelve DD/MM/YYYY sin corrimiento de zona horaria
function toDDMMYYYY(value) {
    if (!value) {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yy = d.getFullYear();
        return `${dd}/${mm}/${yy}`;
    }

    // 1) Si viene como string 'YYYY-MM-DD' o 'YYYY-MM-DDTHH:mm:ss...'
    if (typeof value === "string") {
        // intenta extraer el prefijo YYYY-MM-DD
        const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    }

    // 2) Si viene como Date
    if (value instanceof Date) {
        // usar *UTC* para no depender del huso horario
        const dd = String(value.getUTCDate()).padStart(2, "0");
        const mm = String(value.getUTCMonth() + 1).padStart(2, "0");
        const yy = value.getUTCFullYear();
        return `${dd}/${mm}/${yy}`;
    }

    // 3) Si viene como número (timestamp)
    const n = Number(value);
    if (!Number.isNaN(n)) {
        const d = new Date(n);
        const dd = String(d.getUTCDate()).padStart(2, "0");
        const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
        const yy = d.getUTCFullYear();
        return `${dd}/${mm}/${yy}`;
    }

    // 4) Último recurso: parsear con Date y formatear en UTC
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
        const dd = String(d.getUTCDate()).padStart(2, "0");
        const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
        const yy = d.getUTCFullYear();
        return `${dd}/${mm}/${yy}`;
    }

    // fallback
    return toDDMMYYYY(null);
}



const nf = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ni = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
function fmtMoney(v) { return nf.format(Number(v || 0)); }
function fmtQty(v) { return ni.format(Number(v || 0)); }

function drawHeader(doc, remit) {
    const left = 50;
    const top = 60;

    doc.font("Helvetica-Bold").fontSize(20).text("Remito", left, top);
    doc.font("Helvetica").fontSize(10).text(`N° ${remit.receipt_number}`, left, top + 24);

    // Fecha segura: YYYY-MM-DD -> DD/MM/YYYY (sin timezone shift)
    const raw = String(remit?.date_order || remit?.created_at || "");
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const shownDate = m ? `${m[3]}/${m[2]}/${m[1]}` : (() => {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yy = d.getFullYear();
        return `${dd}/${mm}/${yy}`;
    })();
    doc.text(`Fecha: ${shownDate}`, left, top + 38);

    const col1W = 220, col2W = 200, col3W = 140;
    const yBase = top + 62;

    let x = left;
    let y = yBase;

    doc.font("Helvetica-Bold").text("CLIENTE", x, y); y += 14;
    doc.font("Helvetica").text(remit.client_name || "-", x, y, { width: col1W }); y += 18;
    doc.font("Helvetica-Bold").text("VENDEDOR", x, y); y += 14;
    doc.font("Helvetica").text(remit.salesman_name || "-", x, y, { width: col1W });

    x = left + col1W; y = yBase;
    doc.font("Helvetica-Bold").text("LISTA DE PRECIO", x, y); y += 14;
    doc.font("Helvetica").text(remit.price_list || "-", x, y, { width: col2W }); y += 18;
    doc.font("Helvetica-Bold").text("COND. VENTA", x, y); y += 14;
    doc.font("Helvetica").text(remit.sell_condition || "-", x, y, { width: col2W });

    x = left + col1W + col2W; y = yBase;
    doc.font("Helvetica-Bold").text("COND. COBRO", x, y); y += 14;
    doc.font("Helvetica").text(remit.payment_condition || "-", x, y, { width: col3W }); y += 18;
    doc.font("Helvetica-Bold").text("ORDEN DE VENTA", x, y, { width: col3W, lineBreak: false, ellipsis: true }); y += 14;
    doc.font("Helvetica").text(String(remit.order_id ?? "-"), x, y, { width: col3W });

    const lineY = yBase + 70;
    doc.moveTo(left, lineY).lineTo(545, lineY).strokeColor("#cfd8e3").lineWidth(1).stroke();

    return lineY + 12;
}



function drawTable(doc, items, startY = 210) {
    const topY = startY + 10;

    const left = doc.page.margins.left || 40;
    const right = doc.page.margins.right || 40;
    const availableWidth = doc.page.width - left - right;

    const COLS = [
        { key: "product_id", title: "CÓDIGO", width: 50, align: "left" },
        { key: "product_name", title: "PRODUCTO", width: 135, align: "left" },
        { key: "packaging", title: "EMPAQUE", width: 70, align: "left" }, // 👈 NUEVA
        { key: "unit_measure", title: "UNIDAD", width: 45, align: "center" },
        { key: "qty", title: "CANT.", width: 55, align: "right" },
        { key: "net_weight", title: "P. NETO", width: 60, align: "right" },
        { key: "unit_price", title: "P. UNIT", width: 65, align: "right" },
        { key: "total", title: "P. TOTAL", width: 65, align: "right" },
    ];
    const sumW = COLS.reduce((a, c) => a + c.width, 0);
    if (sumW !== Math.round(availableWidth)) {
        COLS[COLS.length - 1].width += (availableWidth - sumW);
    }

    const rowHeight = 18;
    const headerHeight = 22;
    let y = topY;

    doc.moveTo(left, y).lineTo(left + availableWidth, y).strokeColor("#cfcfd1").lineWidth(1).stroke();
    y += 6;

    doc.font("Helvetica-Bold").fontSize(10);
    let x = left;
    COLS.forEach(col => {
        doc.text(col.title, x + 2, y, { width: col.width - 4, align: col.align, ellipsis: true, lineBreak: false });
        x += col.width;
    });
    y += headerHeight - 8;

    doc.moveTo(left, y).lineTo(left + availableWidth, y).strokeColor("#cfcfd1").lineWidth(1).stroke();
    y += 6;

    doc.font("Helvetica").fontSize(9);

    let totalFinal = 0;
    let totalItems = 0; // líneas
    let totalKg = 0;

    const needPage = (nextY) => nextY > (doc.page.height - doc.page.margins.bottom - 120);

    const redrawHeader = () => {
        doc.font("Helvetica").fontSize(9);
        let yy = Math.max(doc.y, doc.page.margins.top + 120);
        y = yy;

        doc.moveTo(left, y).lineTo(left + availableWidth, y).strokeColor("#cfcfd1").lineWidth(1).stroke();
        y += 6;
        doc.font("Helvetica-Bold").fontSize(10);
        let xx = left;
        COLS.forEach(col => {
            doc.text(col.title, xx + 2, y, { width: col.width - 4, align: col.align, ellipsis: true, lineBreak: false });
            xx += col.width;
        });
        y += headerHeight - 8;
        doc.moveTo(left, y).lineTo(left + availableWidth, y).strokeColor("#cfcfd1").lineWidth(1).stroke();
        y += 6;
        doc.font("Helvetica").fontSize(9);
    };

    items.forEach((it) => {
        const qty = Number(it.qty || 0);
        const netWeight = Number(it.net_weight || 0);
        const unitPrice = Number(it.unit_price || 0);
        const total = (it.total != null) ? Number(it.total) : unitPrice * qty;

        totalItems += 1;          // 👈 ítems = líneas
        totalKg += netWeight;
        totalFinal += total;

        if (needPage(y + rowHeight)) {
            doc.addPage();
            redrawHeader();
        }

        let xx = left;
        const cells = [
            String(it.product_id ?? ""),
            String(it.product_name ?? ""),
            String(it.packaging ?? "-"),                  // 👈 NUEVO
            String(it.unit_measure ?? ""),
            fmtQty(qty),
            nf.format(netWeight),
            fmtMoney(unitPrice),
            fmtMoney(total),
        ];

        cells.forEach((val, i) => {
            const col = COLS[i];
            doc.text(val, xx + 2, y, { width: col.width - 4, align: col.align, ellipsis: true });
            xx += col.width;
        });

        y += rowHeight;
        doc.moveTo(left, y).lineTo(left + availableWidth, y).strokeColor("#e6e6e8").lineWidth(0.5).stroke();
    });

    return { y: y + 20, totalFinal, totalItems, totalKg };
}

function drawFooter(doc, remit, y, totalFinal, totalItems, totalKg) {
    const left = 50;

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text(`TOTAL ÍTEMS: ${fmtQty(totalItems ?? remit.total_items ?? 0)}`, left, y);
    y += 16;
    doc.text(`TOTAL KG: ${nf.format(totalKg ?? remit.total_kg ?? 0)}`, left, y); // 👈 nuevo
    y += 16;
    doc.text(`TOTAL $: ${fmtMoney(totalFinal ?? remit.total_amount ?? 0)}`, left, y);

    if (remit.note) {
        y += 18;
        doc.font("Helvetica-Bold").text("OBSERVACIONES", left, y);
        y += 14;
        doc.font("Helvetica").text(remit.note, left, y, { width: 360 });
    }

    const boxY = y + 24;
    doc
        .roundedRect(370, boxY, 175, 70, 6)
        .strokeColor("#b8c6d8")
        .lineWidth(1)
        .stroke();
    doc.font("Helvetica").text("Recibí Conforme", 380, boxY + 8);
}




async function streamRemitPdfById(req, res) {
    try {
        const { id } = req.params;

        const remit = await FinalRemit.findByPk(id);
        if (!remit) return res.status(404).json({ ok: false, msg: "Remito no encontrado" });

        // Fecha del header: usa la fecha de la orden si existe
        const order = await NewOrder.findByPk(remit.order_id);

        const items = await FinalRemitProduct.findAll({
            where: { final_remit_id: id },
            order: [["id", "ASC"]],
        });

        // Construimos las filas usando qty_requested desde cuts_header
        const rows = await Promise.all(
            items.map(async (i) => {
                // Fallback de unidad si quedó null en la tabla final
                let unit_measure = i.unit_measure || null;
                if (!unit_measure) {
                    const pl = await PriceListProduct.findOne({
                        where: { product_id: String(i.product_id) },
                        order: [["id", "ASC"]],
                    });
                    unit_measure = pl?.unidad_venta || null; // "KG" | "UN" | null
                }

                // Empaque sugerido (más frecuente en los details)
                const pkg = await packagingFor(remit.order_id, i.product_id);

                // Cantidad a mostrar = sum(qty_requested) de cuts_header
                const qtyRequested = await CutsHeader.sum("qty_requested", {
                    where: { receipt_number: remit.order_id, product_code: String(i.product_id) },
                });

                const qty = Number(qtyRequested || 0);     // CANT. mostrada
                const net = Number(i.net_weight || 0);     // P. NETO (kg)
                const price = Number(i.unit_price || 0);
                const unit = String(unit_measure || "-").toUpperCase();

                const total = unit === "KG" ? price * net : price * qty;

                return {
                    product_id: i.product_id,
                    product_name: i.product_name,
                    packaging: pkg,                 // 👈 agregado
                    unit_measure: unit_measure || "-",
                    qty,
                    net_weight: net,
                    unit_price: price,
                    total,
                };
            })
        );

        // Encabezado a usar en el PDF (incluye fecha de la orden)
        const headerForPdf = {
            ...remit.toJSON(),
            date_order: order?.date_order || remit.created_at,
        };

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=remito_${remit.receipt_number}.pdf`);

        const doc = new PDFDocument({ margin: 40, size: "A4" });
        doc.pipe(res);

        const startY = drawHeader(doc, headerForPdf);
        const { y: afterY, totalFinal, totalItems, totalKg } = drawTable(doc, rows, startY); // 👈 ahora trae totalKg
        drawFooter(doc, headerForPdf, afterY, totalFinal, totalItems, totalKg);               // 👈 lo pasamos al footer

        doc.end();
    } catch (e) {
        console.error(e);
        if (!res.headersSent) {
            res.status(500).json({ ok: false, msg: "Error al generar PDF" });
        }
    }
}



async function buildRemitPreview(orderId) {
    const order = await NewOrder.findByPk(orderId);
    if (!order) throw new Error("Orden no encontrada");

    const lines = await ProductsSellOrder.findAll({
        where: { sell_order_id: orderId },
        order: [["id", "ASC"]],
    });

    const items = [];
    let totalItems = 0;       // ahora cuenta líneas/productos
    let totalAmount = 0;
    let totalKg = 0;          // suma de net_weight

    for (const l of lines) {
        const fallbackPrice = Number(l.product_price || 0);

        const priceRow = await PriceListProduct.findOne({
            where: { product_id: String(l.product_id) },
            order: [["id", "ASC"]],
        });

        const headers = await CutsHeader.findAll({
            where: { receipt_number: orderId, product_code: String(l.product_id) },
            include: [{ model: CutsDetail, as: "details" }],
            order: [["id", "ASC"]],
        });

        let qty_requested_total = 0;
        let units_count = 0;
        let gross_weight = 0;
        let net_weight = 0;

        for (const h of headers) {
            qty_requested_total += Number(h.qty_requested || 0);
            for (const d of (h.details || [])) {
                units_count += Number(d.units_count || 0);
                gross_weight += Number(d.gross_weight || 0);
                net_weight += Number(d.net_weight || 0);
            }
        }

        let packaging = "-";
        {
            const counts = {};
            for (const h of headers) {
                for (const d of (h.details || [])) {
                    const k = String((d.packaging_type || "").trim() || "-");
                    counts[k] = (counts[k] || 0) + 1;
                }
            }
            let bestN = -1;
            for (const [k, n] of Object.entries(counts)) {
                if (n > bestN) { packaging = k; bestN = n; }
            }
        }

        const unit_measure = priceRow?.unidad_venta || null; // "UN" | "KG"
        const unit_price = Number(priceRow?.price ?? fallbackPrice);

        const qty = qty_requested_total;

        const lineTotal =
            unit_measure === "KG"
                ? unit_price * Number(net_weight || 0)
                : unit_price * Number(qty || 0);

        items.push({
            product_id: l.product_id ?? null,
            product_name: l.product_name,
            packaging,
            unit_measure: unit_measure || "-",
            qty,
            net_weight,                   // va a su propia columna
            unit_price,
            total: lineTotal,
        });

        totalItems += 1;
        totalAmount += lineTotal;
        totalKg += Number(net_weight || 0);
    }

    const header = {
        receipt_number: order.id,
        date_order: order.date_order,
        client_name: order.client_name,
        salesman_name: order.salesman_name,
        price_list: order.price_list,
        sell_condition: order.sell_condition,
        payment_condition: order.payment_condition,
        order_id: order.id,
        total_items: totalItems,
        total_amount: totalAmount,
        total_kg: totalKg,
        note: order.observation_order || null,
    };

    return { header, items };
}



async function streamRemitPdfByOrder(req, res) {
    try {
        const { id } = req.params;

        const { header, items } = await buildRemitPreview(id);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=remito_${header.receipt_number}.pdf`);

        const doc = new PDFDocument({ margin: 40, size: "A4" });
        doc.pipe(res);

        const startY = drawHeader(doc, header);

        // 👇 ahora obtenemos totalKg desde drawTable
        const { y: afterY, totalFinal, totalItems, totalKg } = drawTable(doc, items, startY);

        // 👇 pasamos totalKg al footer y total_amount actualizado
        drawFooter(
            doc,
            { ...header, total_amount: totalFinal, total_kg: totalKg },
            afterY,
            totalFinal,
            totalItems,
            totalKg
        );

        doc.end();
    } catch (e) {
        console.error(e);
        res.status(500).json({ ok: false, msg: "Error al generar PDF" });
    }
}


const saleApiController = {
    getRemitPdf: streamRemitPdfById,
    getRemitPdfByOrder: streamRemitPdfByOrder,
    checkFinalRemitExists,
    createNewSeller: async (req, res) => {
        try {
            const {
                code,
                name,
                province,
                city,
                street,
                number,
                floor,
                office,
                status
            } = req.body;

            const newSeller = await Seller.create({
                code,
                name,
                province,
                city,
                street,
                number,
                floor,
                office,
                status: status === true || status === "true" ? true : false
            });

            return res.status(201).json({
                ok: true,
                seller: newSeller
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                msg: "Error al crear vendedor"
            });
        }
    },
    getAllSellers: async (req, res) => {
        try {
            const sellers = await Seller.findAll({
                order: [["name", "ASC"]]
            });

            return res.status(200).json({
                ok: true,
                sellers
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                msg: "Error al obtener los vendedores"
            });
        }
    },
    deleteSeller: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Seller.destroy({
                where: { id }
            });

            if (deleted) {
                return res.status(200).json({ ok: true, msg: "Vendedor eliminado" });
            } else {
                return res.status(404).json({ ok: false, msg: "Vendedor no encontrado" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al eliminar vendedor" });
        }
    },

    updateSeller: async (req, res) => {
        try {
            const { id } = req.params;
            const data = { ...req.body };

            if (data.status !== undefined) {
                data.status = data.status === true || data.status === "true" ? true : false;
            }

            const [updated] = await Seller.update(data, {
                where: { id }
            });

            if (updated) {
                const seller = await Seller.findByPk(id);
                return res.json({ ok: true, seller, msg: "Vendedor actualizado" });
            } else {
                return res.status(404).json({ ok: false, msg: "Vendedor no encontrado" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al actualizar vendedor" });
        }
    },

    getSellerById: async (req, res) => {
        try {
            const { id } = req.params;
            const seller = await Seller.findByPk(id);
            if (!seller) {
                return res.status(404).json({ ok: false, msg: "Vendedor no encontrado" });
            }
            return res.json({ ok: true, seller });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al obtener vendedor" });
        }
    },

    getAllOrders: async (req, res) => {
        try {
            const AllOrders = await NewOrder.findAll({});
            res.json(AllOrders);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al obtener ordenes" });
        }
    },

    createOrder: async (req, res) => {
        try {
            const {
                date_order,
                client_name,
                salesman_name,
                price_list,
                sell_condition,
                payment_condition,
                observation_order,
                products
            } = req.body;

            if (!date_order || !client_name || !salesman_name) {
                return res.status(400).json({ ok: false, msg: "Faltan datos obligatorios." });
            }

            const newOrder = await NewOrder.create({
                date_order,
                client_name,
                salesman_name,
                price_list,
                sell_condition,
                payment_condition,
                observation_order
            });

            if (Array.isArray(products) && products.length > 0) {
                const productsToSave = products.map(prod => ({
                    order_id: newOrder.id,
                    product_cod: prod.codigo,
                    product_name: prod.corte?.value?.product_name || '',
                    precio: prod.precio,
                    cantidad: prod.cantidad,
                    tipo_medida: prod.tipoMedida
                }));
                await OrderProductClient.bulkCreate(productsToSave);
            }

            return res.status(201).json({
                ok: true,
                order: newOrder
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                msg: "Error al crear la orden"
            });
        }
    },

    createPriceList: async (req, res) => {
        try {
            const { name, clients, products } = req.body;

            if (!name) {
                return res.status(400).json({ ok: false, msg: "El nombre es obligatorio." });
            }


            const lastList = await PriceList.findOne({
                order: [["list_number", "DESC"]]
            });
            const lastNumber = lastList ? lastList.list_number : 0;
            const nextListNumber = lastNumber + 1;


            if (!clients || !Array.isArray(clients) || clients.length === 0) {
                await PriceList.create({
                    list_number: nextListNumber,
                    name,
                    client_id: null
                });
            } else {
                const records = clients.map(clientId => ({
                    list_number: nextListNumber,
                    name,
                    client_id: clientId
                }));
                await PriceList.bulkCreate(records);
            }

            if (Array.isArray(products) && products.length > 0) {
                const productRecords = products.map(prod => ({
                    price_list_number: nextListNumber,
                    product_id: prod.product_id ?? prod.id,
                    product_name: prod.product_name ?? prod.name ?? null,
                    unidad_venta: prod.unidad_venta ?? prod.unidad ?? null,
                    costo: Number(prod.costo ?? 0),
                    precio_sin_iva: Number(prod.precio_sin_iva ?? 0),
                    precio_con_iva: Number(prod.precio_con_iva ?? 0),
                }));

                await PriceListProduct.bulkCreate(productRecords);
            }

            return res.status(201).json({
                ok: true,
                msg: "Lista y productos creados correctamente",
                list_number: nextListNumber
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al crear la lista de precios" });
        }
    },
    getAllPriceList: async (req, res) => {
        try {
            const PriceLists = await PriceList.findAll({});
            res.json(PriceLists);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al traer todas las listas de precios" });
        }
    },
    getAllPriceListProduct: async (req, res) => {
        try {
            const AllPriceListProducts = await PriceListProduct.findAll({});
            res.json(AllPriceListProducts);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al traer todas las listas productos con precios" });
        }
    },
    getAllOrdersContent: async (req, res) => {
        try {
            const AllOrdersContent = await OrderProductClient.findAll({});
            res.json(AllOrdersContent);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al traer todos los productos de las ordenes" });
        }
    },
    updateOrderProductQuantity: async (req, res) => {
        try {
            const { id } = req.params; // id del registro en order_products_client
            const { cantidad } = req.body;

            if (cantidad < 0) {
                return res.status(400).json({ ok: false, msg: "La cantidad no puede ser menor a 0" });
            }

            const [updated] = await OrderProductClient.update(
                { cantidad },
                { where: { id } }
            );

            if (updated) {
                const updatedRecord = await OrderProductClient.findByPk(id);
                return res.status(200).json({ ok: true, product: updatedRecord });
            } else {
                return res.status(404).json({ ok: false, msg: "Registro no encontrado" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al actualizar cantidad" });
        }
    },
    getSaleOrderbyId: async (req, res) => {
        const { id } = req.params;
        try {
            const saleOrder = await NewOrder.findByPk(id);
            if (!saleOrder) {
                return res.status(404).json({ ok: false, msg: "Orden no encontrada" });
            }

            if (saleOrder.order_check === true) {
                return res
                    .status(409) // Conflict
                    .json({ ok: false, msg: "La orden ya fue generada y no puede volver a generarse." });
            }

            return res.json(saleOrder);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al encontrar la orden" });
        }
    },

    getOrderProductbyId: async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ ok: false, msg: "Falta id" });

            const products = await OrderProductClient.findAll({
                where: { order_id: id },
                order: [["id", "ASC"]],
            });


            return res.status(200).json(products);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al encontrar los productos" });
        }
    },
    generateSalesOrder: async (req, res) => {
        const { id } = req.params;

        // Usá tu helper si ya lo tenés definido globalmente
        const toNumber = (v) => {
            const n = parseFloat(String(v ?? "").replace(",", "."));
            return isNaN(n) ? 0 : n;
        };

        const t = await sequelize.transaction();
        try {
            const header = await NewOrder.findByPk(id, { transaction: t });
            if (!header) {
                await t.rollback();
                return res.status(404).json({ ok: false, msg: "Orden no encontrada" });
            }

            const lines = await OrderProductClient.findAll({
                where: { order_id: id },
                transaction: t
            });

            if (!lines.length) {
                await t.rollback();
                return res.status(400).json({ ok: false, msg: "La orden no tiene productos" });
            }

            const noStock = [];
            const prepared = [];

            for (const ln of lines) {
                const code = ln.product_cod ?? ln.product_id ?? null;
                const name = ln.product_name ?? "";
                const requested = toNumber(ln.cantidad);
                const price = toNumber(ln.precio);

                // NOTA: seguimos consultando stock para validar, pero NO lo descontamos
                let stockRow = null;

                if (code != null) {
                    stockRow = await ProductStock.findOne({
                        where: { product_cod: code },
                        transaction: t,
                        // Podés quitar el lock si no vas a actualizar stock
                        // lock: t.LOCK.UPDATE
                    });
                }
                if (!stockRow) {
                    stockRow = await ProductStock.findOne({
                        where: { product_name: name },
                        transaction: t,
                        // lock: t.LOCK.UPDATE
                    });
                }

                const available = toNumber(stockRow?.product_quantity);

                if (!stockRow || available <= 0) {
                    noStock.push({ product_id: code, product_name: name });
                    continue;
                }

                // Si querés seguir “capando” al disponible, mantenemos Math.min
                const sendQty = Math.min(requested, available);

                prepared.push({ ln, stockRow, sendQty, price, code, name, available, requested });
            }

            if (noStock.length) {
                await t.rollback();
                return res.status(400).json({
                    ok: false,
                    msg: "Hay productos sin stock, no se puede generar la orden.",
                    noStock
                });
            }

            // Creamos las líneas de la orden de venta, PERO NO tocamos ProductStock
            for (const item of prepared) {
                await ProductsSellOrder.create({
                    sell_order_id: Number(id),
                    product_id: item.code ?? null,
                    product_name: item.name,
                    product_price: item.price,
                    product_quantity: item.sendQty
                }, { transaction: t });

                // ⛔️ Eliminado: NO descontamos stock
                // item.stockRow.product_quantity = Math.max(0, toNumber(item.stockRow.product_quantity) - item.sendQty);
                // await item.stockRow.save({ transaction: t });
            }

            // Marcar la orden como chequeada
            await NewOrder.update(
                { order_check: true },
                { where: { id }, transaction: t }
            );

            await t.commit();

            return res.status(201).json({
                ok: true,
                msg: "Orden generada correctamente.",
                items: prepared.map(p => ({
                    product_name: p.name,
                    solicitado: p.requested,
                    enviado: p.sendQty,
                    restante_en_stock: Math.max(0, p.available - p.sendQty)
                }))
            });
        } catch (error) {
            await t.rollback();
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al generar la orden" });
        }
    },

    updateOrder: async (req, res) => {
        const { id } = req.params;
        const {
            date_order,
            client_name,
            salesman_name,
            price_list,
            sell_condition,
            payment_condition,
            observation_order,
            products
        } = req.body;

        try {
            // Verificar si existe
            const order = await NewOrder.findByPk(id);
            if (!order) {
                return res.status(404).json({ ok: false, msg: "Orden no encontrada" });
            }

            // Actualizar encabezado
            await order.update({
                date_order,
                client_name,
                salesman_name,
                price_list,
                sell_condition,
                payment_condition,
                observation_order
            });

            // Eliminar productos actuales y volver a insertar
            await OrderProductClient.destroy({ where: { order_id: id } });

            if (Array.isArray(products) && products.length > 0) {
                const productsToSave = products.map(prod => ({
                    order_id: id,
                    product_cod: prod.codigo,
                    product_name: prod.corte?.value?.product_name || '',
                    precio: prod.precio,
                    cantidad: prod.cantidad,
                    tipo_medida: prod.tipoMedida
                }));
                await OrderProductClient.bulkCreate(productsToSave);
            }

            return res.json({ ok: true, msg: "Orden actualizada correctamente" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al actualizar la orden" });
        }
    },
    deleteOrder: async (req, res) => {
        const { id } = req.params;
        try {
            // si la orden ya fue generada, habrá registros en products_sell_order
            const vinculadas = await ProductsSellOrder.count({ where: { sell_order_id: id } });
            if (vinculadas > 0) {
                return res.status(409).json({
                    ok: false,
                    msg: "No se puede eliminar: la orden ya fue generada y tiene productos asociados."
                });
            }

            // (opcional) bloquear también por flag de header
            const header = await NewOrder.findByPk(id);
            if (!header) return res.status(404).json({ ok: false, msg: "Pedido no encontrado" });
            if (header.order_check === true) {
                return res.status(409).json({
                    ok: false,
                    msg: "No se puede eliminar: la orden ya fue generada (order_check = true)."
                });
            }

            // borrar líneas y luego header en transacción
            const t = await sequelize.transaction();
            try {
                await OrderProductClient.destroy({ where: { order_id: id }, transaction: t });
                const deleted = await NewOrder.destroy({ where: { id }, transaction: t });
                await t.commit();

                if (!deleted) return res.status(404).json({ ok: false, msg: "Pedido no encontrado" });
                return res.json({ ok: true, msg: "Pedido eliminado correctamente" });
            } catch (err) {
                await t.rollback();
                console.error(err);
                return res.status(500).json({ ok: false, msg: "Error al eliminar el pedido" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al eliminar el pedido" });
        }
    },

    getFinalOrdersGrouped: async (req, res) => {
        try {
            const page = Math.max(1, Number(req.query.page || 1));
            const pageSize = Math.max(1, Number(req.query.pageSize || 10));

            const status = String(req.query.status || "all");
            const number = req.query.number ? Number(req.query.number) : null;
            const client = req.query.client ? String(req.query.client) : null;
            const dateFrom = req.query.date_from || null;
            const dateTo = req.query.date_to || null;


            const whereHeader = {};
            if (status === "generated") whereHeader.order_check = true;
            if (status === "pending") whereHeader.order_check = false;
            if (number) whereHeader.id = number;
            if (client) whereHeader.client_name = { [Op.like]: `%${client}%` };
            if (dateFrom || dateTo) {
                whereHeader.date_order = {};
                if (dateFrom) whereHeader.date_order[Op.gte] = dateFrom;
                if (dateTo) whereHeader.date_order[Op.lte] = dateTo;
            }

            const { fn, col, literal } = sequelize;

            const { count, rows } = await NewOrder.findAndCountAll({
                attributes: [
                    "id",
                    "date_order",
                    "client_name",
                    "salesman_name",
                    "order_check",
                    [fn("MAX", col("order_weight_check")), "order_weight_check"],
                    [fn("SUM", col("lines.product_quantity")), "total_items"],
                    [fn("SUM", literal("lines.product_price * lines.product_quantity")), "total_amount"],
                ],
                include: [
                    {
                        model: ProductsSellOrder,
                        as: "lines",
                        attributes: [],
                        required: true,
                    },
                ],
                where: whereHeader,
                group: ["NewOrder.id"],
                order: [["id", "DESC"]],
                limit: pageSize,
                offset: (page - 1) * pageSize,
                subQuery: false,
                distinct: true,
            });

            const total = Array.isArray(count) ? count.length : count;
            const totalPages = Math.max(1, Math.ceil(total / pageSize));

            const data = rows.map(r => ({
                order_id: r.id,
                date_order: r.date_order,
                client_name: r.client_name,
                salesman_name: r.salesman_name,
                order_check: !!r.order_check,
                order_weight_check: !!Number(r.get("order_weight_check")),
                total_items: Number(r.get("total_items") || 0),
                total_amount: Number(r.get("total_amount") || 0),
            }));

            return res.json({ ok: true, page, pageSize, total, totalPages, rows: data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al obtener órdenes generadas" });
        }
    },
    getAllSaleConditions: async (req, res) => {
        try {
            const rows = await SaleCondition.findAll({ order: [["condition_name", "ASC"]] });
            return res.json({ ok: true, conditions: rows });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al listar condiciones" });
        }
    },

    getSaleConditionById: async (req, res) => {
        try {
            const { id } = req.params;
            const condition = await SaleCondition.findByPk(id);
            if (!condition) return res.status(404).json({ ok: false, msg: "Condición no encontrada" });
            return res.json({ ok: true, condition });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al obtener la condición" });
        }
    },

    createSaleCondition: async (req, res) => {
        try {
            const { condition_name } = req.body;
            if (!condition_name || !condition_name.trim()) {
                return res.status(400).json({ ok: false, msg: "El nombre es obligatorio" });
            }
            const created = await SaleCondition.create({ condition_name: condition_name.trim() });
            return res.status(201).json({ ok: true, condition: created });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al crear la condición" });
        }
    },

    updateSaleCondition: async (req, res) => {
        try {
            const { id } = req.params;
            const { condition_name } = req.body;
            if (!condition_name || !condition_name.trim()) {
                return res.status(400).json({ ok: false, msg: "El nombre es obligatorio" });
            }
            const [updated] = await SaleCondition.update(
                { condition_name: condition_name.trim() },
                { where: { id } }
            );
            if (!updated) return res.status(404).json({ ok: false, msg: "Condición no encontrada" });
            const condition = await SaleCondition.findByPk(id);
            return res.json({ ok: true, condition, msg: "Condición actualizada" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al actualizar la condición" });
        }
    },

    deleteSaleCondition: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await SaleCondition.destroy({ where: { id } });
            if (!deleted) return res.status(404).json({ ok: false, msg: "Condición no encontrada" });
            return res.json({ ok: true, msg: "Condición eliminada" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al eliminar la condición" });
        }
    },


    getAllPaymentConditions: async (req, res) => {
        try {
            const rows = await PaymentCondition.findAll({
                order: [["payment_condition", "ASC"]],
            });
            return res.json({ ok: true, paymentConditions: rows });
        } catch (e) {
            console.error(e);
            return res
                .status(500)
                .json({ ok: false, msg: "Error al listar condiciones de cobro" });
        }
    },

    getPaymentConditionById: async (req, res) => {
        try {
            const { id } = req.params;
            const item = await PaymentCondition.findByPk(id);
            if (!item)
                return res
                    .status(404)
                    .json({ ok: false, msg: "Condición no encontrada" });
            return res.json({ ok: true, paymentCondition: item });
        } catch (e) {
            console.error(e);
            return res
                .status(500)
                .json({ ok: false, msg: "Error al obtener la condición" });
        }
    },

    createPaymentCondition: async (req, res) => {
        try {
            const { payment_condition } = req.body;
            if (!payment_condition || !payment_condition.trim()) {
                return res
                    .status(400)
                    .json({ ok: false, msg: "El nombre es obligatorio" });
            }
            const created = await PaymentCondition.create({
                payment_condition: payment_condition.trim(),
            });
            return res.status(201).json({ ok: true, paymentCondition: created });
        } catch (e) {
            console.error(e);
            return res
                .status(500)
                .json({ ok: false, msg: "Error al crear la condición" });
        }
    },

    updatePaymentCondition: async (req, res) => {
        try {
            const { id } = req.params;
            const { payment_condition } = req.body;
            if (!payment_condition || !payment_condition.trim()) {
                return res
                    .status(400)
                    .json({ ok: false, msg: "El nombre es obligatorio" });
            }
            const [updated] = await PaymentCondition.update(
                { payment_condition: payment_condition.trim() },
                { where: { id } }
            );
            if (!updated)
                return res
                    .status(404)
                    .json({ ok: false, msg: "Condición no encontrada" });

            const item = await PaymentCondition.findByPk(id);
            return res.json({ ok: true, paymentCondition: item, msg: "Condición actualizada" });
        } catch (e) {
            console.error(e);
            return res
                .status(500)
                .json({ ok: false, msg: "Error al actualizar la condición" });
        }
    },

    deletePaymentCondition: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await PaymentCondition.destroy({ where: { id } });
            if (!deleted)
                return res
                    .status(404)
                    .json({ ok: false, msg: "Condición no encontrada" });
            return res.json({ ok: true, msg: "Condición eliminada" });
        } catch (e) {
            console.error(e);
            return res
                .status(500)
                .json({ ok: false, msg: "Error al eliminar la condición" });
        }
    },
    getSellOrderProducts: async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ ok: false, msg: "Falta id" });

            const rows = await ProductsSellOrder.findAll({
                where: { sell_order_id: id },
                order: [["id", "ASC"]],
            });

            return res.json({ ok: true, products: rows });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al traer productos de la orden" });
        }
    },


    updateSellOrderProductQuantity: async (req, res) => {
        try {
            const { id } = req.params;
            const { product_quantity } = req.body;

            const qty = Number(product_quantity);
            if (!id || isNaN(qty) || qty < 0) {
                return res.status(400).json({ ok: false, msg: "Cantidad inválida" });
            }

            const [updated] = await ProductsSellOrder.update(
                { product_quantity: qty },
                { where: { id } }
            );
            if (!updated) return res.status(404).json({ ok: false, msg: "Registro no encontrado" });

            const row = await ProductsSellOrder.findByPk(id);
            return res.json({ ok: true, product: row, msg: "Cantidad actualizada" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al actualizar cantidad" });
        }
    },


    setOrderWeightChecked: async (req, res) => {
        try {
            const { id } = req.params;
            const [updated] = await NewOrder.update(
                { order_weight_check: true },
                { where: { id } }
            );
            if (!updated) return res.status(404).json({ ok: false, msg: "Orden no encontrada" });
            return res.json({ ok: true, msg: "Orden marcada como pesada" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al marcar como pesada" });
        }
    },

    getOrderHeaderForWeighing: async (req, res) => {
        try {
            const { id } = req.params;
            const header = await NewOrder.findByPk(id);
            if (!header) return res.status(404).json({ ok: false, msg: "Orden no encontrada" });
            return res.json({ ok: true, header });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al obtener la orden" });
        }
    },
    saveOrderWeighing: async (req, res) => {
        const { id } = req.params;
        const { comment, items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ ok: false, msg: "No hay ítems para guardar." });
        }

        const t = await sequelize.transaction();
        try {
            const order = await NewOrder.findByPk(id, { transaction: t });
            if (!order) {
                await t.rollback();
                return res.status(404).json({ ok: false, msg: "Orden no encontrada." });
            }

            const createdHeaders = [];

            for (const it of items) {
                const unitPrice = Number(it.unit_price || 0);
                const qtyRequested = Number(it.qty_requested || 0);

                let totalTare = 0;
                let totalGross = 0;
                let totalNet = 0;
                let weighedPieces = 0;

                for (const d of (it.details || [])) {
                    const units = Number(d.units_count || 1);
                    const tare = Number(d.tare_weight || 0);
                    const gross = Number(d.gross_weight || 0);
                    const net = Math.max(0, gross - tare);

                    totalTare += tare;
                    totalGross += gross;
                    totalNet += net;
                    weighedPieces += Math.max(0, units);
                }

                const totalNetAdj = totalNet;
                const avg = weighedPieces > 0 ? totalNetAdj / weighedPieces : 0;
                const pending = Math.max(0, qtyRequested - weighedPieces);

                const headerRow = await CutsHeader.create(
                    {
                        receipt_number: Number(id),
                        product_code: String(it.product_id ?? ""),
                        product_name: String(it.product_name ?? ""),
                        unit_price: unitPrice,
                        qty_requested: qtyRequested,
                        qty_weighed: weighedPieces,
                        total_tare_weight: totalTare,
                        total_gross_weight: totalGross,
                        total_net_weight: totalNetAdj,
                        avg_weight: avg,
                        qty_pending: pending,
                    },
                    { transaction: t }
                );

                const toCreateDetails = (it.details || []).map((d, idx) => ({
                    receipt_number: Number(id),
                    header_id: headerRow.id,
                    sub_item: idx + 1,
                    packaging_type: String((d.packaging_type ?? d.empaque ?? it.packaging_type) || "").trim(),
                    units_count: Number(d.units_count || 1),
                    lot_number: d.lot_number ?? null,
                    tare_weight: Number(d.tare_weight || 0),
                    gross_weight: Number(d.gross_weight || 0),
                    net_weight: Math.max(0, Number(d.gross_weight || 0) - Number(d.tare_weight || 0)),
                }));


                if (toCreateDetails.length) {
                    await CutsDetail.bulkCreate(toCreateDetails, { transaction: t });
                }

                createdHeaders.push(headerRow);
            }

            if (typeof comment === "string") {
                await order.update({ observation_order: comment }, { transaction: t });
            }

            await t.commit();
            return res.status(201).json({ ok: true, headers: createdHeaders });
        } catch (e) {
            console.error(e);
            await t.rollback();
            return res.status(500).json({ ok: false, msg: "Error al guardar pesaje." });
        }
    },




    getOrderWeighing: async (req, res) => {
        try {
            const { id } = req.params;
            const headers = await CutsHeader.findAll({
                where: { receipt_number: id },
                include: [{ model: CutsDetail, as: "details" }]
            });
            return res.json({ ok: true, headers });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al leer pesaje." });
        }
    },
    createDriver: async (req, res) => {
        try {
            const { driver_name, driver_surname } = req.body;
            const stateInput = (req.body.status !== undefined) ? req.body.status : req.body.driver_state;
            const created = await Driver.create({
                driver_name: (driver_name || "").trim(),
                driver_surname: (driver_surname || "").trim(),
                driver_state: stateInput === undefined ? true : toBool(stateInput)
            });
            const out = created.toJSON();
            out.status = !!out.driver_state; // alias para el front
            return res.status(201).json({ ok: true, driver: out });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al crear chofer" });
        }
    },

    getDriverById: async (req, res) => {
        try {
            const { id } = req.params;
            const row = await Driver.findByPk(id);
            if (!row) return res.status(404).json({ ok: false, msg: "Chofer no encontrado" });
            const out = row.toJSON();
            out.status = !!out.driver_state; // alias para el front
            return res.json({ ok: true, driver: out });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al obtener chofer" });
        }
    },

    updateDriver: async (req, res) => {
        try {
            const { id } = req.params;
            const stateInput = (req.body.status !== undefined) ? req.body.status : req.body.driver_state;
            const data = {
                driver_name: (req.body.driver_name || "").trim(),
                driver_surname: (req.body.driver_surname || "").trim(),
            };
            if (stateInput !== undefined) data.driver_state = toBool(stateInput);

            const [updated] = await Driver.update(data, { where: { id } });
            if (!updated) return res.status(404).json({ ok: false, msg: "Chofer no encontrado" });

            const row = await Driver.findByPk(id);
            const out = row.toJSON();
            out.status = !!out.driver_state; // alias para el front
            return res.json({ ok: true, driver: out, msg: "Chofer actualizado" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al actualizar chofer" });
        }
    },



    getAllDrivers: async (_req, res) => {
        try {
            const rows = await Driver.findAll({ order: [["driver_name", "ASC"], ["driver_surname", "ASC"]] });
            const list = rows.map(r => {
                const o = r.toJSON();
                o.status = !!o.driver_state;
                return o;
            });
            return res.json({ ok: true, drivers: list });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al listar choferes" });
        }
    },


    deleteDriver: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Driver.destroy({ where: { id } });
            if (!deleted) return res.status(404).json({ ok: false, msg: "Chofer no encontrado" });
            return res.json({ ok: true, msg: "Chofer eliminado" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al eliminar chofer" });
        }
    },
    // Lee header + items de un remito por N° de comprobante
    getRemitByReceipt: async (req, res) => {
        try {
            const { receipt } = req.params; // número de comprobante

            // 1) Headers que matchean el comprobante
            const headers = await FinalRemit.findAll({
                where: { receipt_number: receipt },
                order: [["id", "DESC"]], // si hubiera más de uno, nos quedamos con el último
            });

            if (!headers.length) {
                return res.status(404).json({ ok: false, msg: "No existe remito con ese comprobante" });
            }

            const h = headers[0]; // header elegido

            // 2) Ítems del remito
            const rows = await FinalRemitProduct.findAll({
                where: { final_remit_id: h.id },
                order: [["id", "ASC"]],
            });

            // 3) Salida normalizada (números casteados)
            return res.json({
                ok: true,
                header: {
                    id: h.id,
                    order_id: h.order_id,
                    receipt_number: h.receipt_number,
                    client_name: h.client_name,
                    salesman_name: h.salesman_name,
                    price_list: h.price_list,
                    sell_condition: h.sell_condition,
                    payment_condition: h.payment_condition,
                    generated_by: h.generated_by,
                    note: h.note,
                    total_items: Number(h.total_items || 0),
                    total_amount: Number(h.total_amount || 0),
                    created_at: h.created_at,
                    updated_at: h.updated_at,
                },
                items: rows.map((i) => ({
                    id: i.id,
                    product_id: i.product_id,
                    product_name: i.product_name,
                    unit_price: Number(i.unit_price || 0),
                    qty: Number(i.qty || 0),
                    unit_measure: i.unit_measure || null,
                    gross_weight: Number(i.gross_weight || 0),
                    net_weight: Number(i.net_weight || 0),
                    avg_weight: Number(i.avg_weight || 0),
                    created_at: i.created_at,
                    updated_at: i.updated_at,
                })),
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error leyendo remito por comprobante" });
        }
    },


    // Preview/estado de remito para una orden (CANT. = sum(qty_requested))
    getRemitControlState: async (req, res) => {
        try {
            const { id } = req.params; // orderId

            // Helper: cantidad pedida para un producto en una orden
            const qtyRequestedOf = async (orderId, productId) => {
                const n = await CutsHeader.sum("qty_requested", {
                    where: { receipt_number: orderId, product_code: String(productId) },
                });
                return Number(n || 0);
            };

            // ¿Ya existe un remito final para esta orden?
            const existing = await FinalRemit.findOne({
                where: { order_id: id },
                include: [{ model: FinalRemitProduct, as: "items" }],
                order: [[{ model: FinalRemitProduct, as: "items" }, "id", "ASC"]],
            });

            // Tomamos la fecha original desde la orden
            const order = await NewOrder.findByPk(id);
            if (!order) return res.status(404).json({ ok: false, msg: "Orden no encontrada" });

            // 1) Ya hay remito → mostrar items en solo lectura
            if (existing) {
                let totalItems = 0;
                let totalAmount = 0;

                const items = await Promise.all(
                    (existing.items || []).map(async (it) => {
                        // unidad: preferir la guardada; si falta, buscar en la lista de precios
                        let unit_measure = it.unit_measure || null;
                        if (!unit_measure) {
                            const pl = await PriceListProduct.findOne({
                                where: { product_id: String(it.product_id) },
                                order: [["id", "ASC"]],
                            });
                            unit_measure = pl?.unidad_venta || null; // UN | KG
                        }

                        // CANT. mostrada = qty_requested desde cuts_header
                        const qtyDisplay = await qtyRequestedOf(existing.order_id, it.product_id);

                        const unit = String(unit_measure || "-").toUpperCase();
                        const net = Number(it.net_weight || 0);  // P. NETO real
                        const u$ = Number(it.unit_price || 0);

                        // Total: KG → $*kg ; UN → $*unidades (qty_requested)
                        const lineTotal = unit === "KG" ? (u$ * net) : (u$ * qtyDisplay);

                        totalItems += qtyDisplay;
                        totalAmount += lineTotal;

                        return {
                            product_id: it.product_id ?? null,
                            product_name: it.product_name,
                            unit_price: u$,
                            unit_measure,
                            qty: qtyDisplay,                // 👈 mostrar qty_requested
                            gross_weight: Number(it.gross_weight || 0),
                            net_weight: net,
                            avg_weight: Number(it.avg_weight || 0),
                            total: lineTotal,
                        };
                    })
                );

                const header = {
                    receipt_number: existing.receipt_number,
                    order_id: existing.order_id,
                    date_order: order.date_order, // usamos la fecha de la orden
                    client_name: existing.client_name,
                    salesman_name: existing.salesman_name,
                    price_list: existing.price_list,
                    sell_condition: existing.sell_condition,
                    payment_condition: existing.payment_condition,
                    generated_by: existing.generated_by,
                    note: existing.note || null,
                    total_items: totalItems,
                    total_amount: totalAmount,
                };

                return res.json({
                    ok: true,
                    readonly: true,
                    already_generated: true,
                    header,
                    items,
                });
            }

            // 2) No hay remito → armar PREVIEW desde cuts_* (también con qty_requested)
            const lines = await ProductsSellOrder.findAll({
                where: { sell_order_id: id },
                order: [["id", "ASC"]],
            });

            const items = [];
            let totalItems = 0;
            let totalAmount = 0;

            for (const l of lines) {
                const unit_price = Number(l.product_price || 0);

                const priceRow = await PriceListProduct.findOne({
                    where: { product_id: String(l.product_id) },
                    order: [["id", "ASC"]],
                });
                const unit_measure = priceRow?.unidad_venta || null; // "UN" | "KG" | null
                const isKG = String(unit_measure || "").toUpperCase() === "KG";

                // qty desde header; peso neto desde details
                const qty = await qtyRequestedOf(id, l.product_id);

                const detailAgg = await CutsDetail.findAll({
                    include: [{
                        model: CutsHeader,
                        as: "header",
                        where: { receipt_number: id, product_code: String(l.product_id) },
                        attributes: [],
                    }],
                    attributes: [],
                });
                // si no querés otro query, podés sumar net_weight con un findAll + reduce como ya venías

                // Para mantenerlo simple, sumamos con los headers+details clásicos:
                const headers = await CutsHeader.findAll({
                    where: { receipt_number: id, product_code: String(l.product_id) },
                    include: [{ model: CutsDetail, as: "details" }],
                    order: [["id", "ASC"]],
                });
                let net_weight = 0, units_count = 0;
                for (const h of headers) {
                    for (const d of (h.details || [])) {
                        units_count += Number(d.units_count || 0);
                        net_weight += Number(d.net_weight || 0);
                    }
                }

                const lineTotal = isKG ? unit_price * net_weight : unit_price * qty;

                items.push({
                    product_id: l.product_id ?? null,
                    product_name: l.product_name,
                    unit_price,
                    unit_measure,
                    qty,                 // 👈 qty_requested
                    net_weight,          // P. NETO
                    avg_weight: units_count > 0 ? net_weight / units_count : 0,
                    total: lineTotal,
                });

                totalItems += qty;
                totalAmount += lineTotal;
            }

            const header = {
                receipt_number: order.id,
                order_id: order.id,
                date_order: order.date_order,
                client_name: order.client_name,
                salesman_name: order.salesman_name,
                price_list: order.price_list,
                sell_condition: order.sell_condition,
                payment_condition: order.payment_condition,
                note: order.observation_order || null,
                total_items: totalItems,
                total_amount: totalAmount,
            };

            return res.json({ ok: true, readonly: false, header, items });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error en preview de remito" });
        }
    },


    createRemitFromOrder: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const note = (req.body?.note ?? null);

            // Evitar duplicado
            const exists = await FinalRemit.findOne({
                where: { order_id: id },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (exists) {
                await t.rollback();
                return res.status(400).json({ ok: false, msg: "La orden ya está remitada" });
            }

            const order = await NewOrder.findByPk(id, { transaction: t });
            if (!order) {
                await t.rollback();
                return res.status(404).json({ ok: false, msg: "Orden no encontrada" });
            }

            // Header
            const remit = await FinalRemit.create({
                order_id: order.id,
                receipt_number: order.id,
                client_name: order.client_name,
                salesman_name: order.salesman_name,
                price_list: order.price_list,
                sell_condition: order.sell_condition,
                payment_condition: order.payment_condition,
                generated_by: "system",
                note,
                total_items: 0,
                total_amount: 0,
            }, { transaction: t });

            // Detalle
            const lines = await ProductsSellOrder.findAll({
                where: { sell_order_id: id },
                order: [["id", "ASC"]],
                transaction: t,
            });

            const detailRows = [];
            let totalItems = 0;
            let totalAmount = 0;

            for (const l of lines) {
                const unit_price = Number(l.product_price || 0);

                const priceRow = await PriceListProduct.findOne({
                    where: { product_id: String(l.product_id) },
                    order: [["id", "ASC"]],
                    transaction: t,
                });
                const unit_measure = priceRow?.unidad_venta || null;
                const isKG = String(unit_measure || "").toUpperCase() === "KG";

                const headers = await CutsHeader.findAll({
                    where: { receipt_number: id, product_code: String(l.product_id) },
                    include: [{ model: CutsDetail, as: "details" }],
                    order: [["id", "ASC"]],
                    transaction: t,
                });

                let qty_requested_total = 0;
                let net_weight = 0;
                let gross_weight = 0;
                let units_count = 0;

                for (const h of headers) {
                    qty_requested_total += Number(h.qty_requested || 0);
                    for (const d of (h.details || [])) {
                        units_count += Number(d.units_count || 0);
                        gross_weight += Number(d.gross_weight || 0);
                        net_weight += Number(d.net_weight || 0);
                    }
                }

                const qty = qty_requested_total;
                const avg_weight = units_count > 0 ? net_weight / units_count : 0;
                const lineTotal = isKG ? unit_price * net_weight : unit_price * qty;

                detailRows.push({
                    final_remit_id: remit.id,
                    product_id: l.product_id ?? null,
                    product_name: l.product_name,
                    unit_price,
                    qty,
                    unit_measure,
                    gross_weight,
                    net_weight,
                    avg_weight,
                });

                totalItems += qty;
                totalAmount += lineTotal;

                // 🔥 Actualizar stock
                let stockRow = null;
                if (l.product_id != null) {
                    stockRow = await ProductStock.findOne({
                        where: { product_cod: String(l.product_id) },
                        transaction: t,
                        lock: t.LOCK.UPDATE,
                    });
                }
                if (!stockRow) {
                    stockRow = await ProductStock.findOne({
                        where: { product_name: l.product_name },
                        transaction: t,
                        lock: t.LOCK.UPDATE,
                    });
                }

                if (!stockRow) {
                    await t.rollback();
                    return res.status(400).json({
                        ok: false,
                        msg: `No existe stock para ${l.product_name} (id ${l.product_id ?? "-"})`,
                    });
                }

                const currentQty = Number(stockRow.product_quantity || 0);
                const currentKilos = Number(stockRow.product_total_weight || 0);

                const newQty = Math.max(0, currentQty - qty);
                const newKilos = Math.max(0, currentKilos - net_weight);

                await stockRow.update(
                    { product_quantity: newQty, product_total_weight: newKilos },
                    { transaction: t }
                );
            }

            if (detailRows.length) {
                await FinalRemitProduct.bulkCreate(detailRows, { transaction: t });
            }

            // Totales del header
            await remit.update({
                total_items: totalItems,
                total_amount: totalAmount,
            }, { transaction: t });

            await t.commit();
            return res.json({ ok: true, remit_id: remit.id });
        } catch (err) {
            console.error("createRemitFromOrder error:", err);
            try { await t.rollback(); } catch (_) { }
            return res.status(500).json({ ok: false, msg: "Error al generar remito" });
        }
    },


    // ===== DESTINOS =====
    getAllDestinations: async (req, res) => {
        try {
            const q = (req.query.q || "").trim().toLowerCase();
            const includeInactive = String(req.query.includeInactive || "0") === "1";

            const where = {};
            if (q) where.name = { [Op.like]: `%${q}%` };
            if (!includeInactive) where.is_active = true;

            const rows = await Destination.findAll({ where, order: [["name", "ASC"]] });

            // el front acepta {data:[]} o []
            return res.json({
                ok: true, data: rows.map(r => ({
                    id: r.id,
                    name: r.name,
                    is_active: !!r.is_active,
                    created_at: r.created_at,
                    updated_at: r.updated_at
                }))
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al listar destinos" });
        }
    },

    getDestinationById: async (req, res) => {
        try {
            const row = await Destination.findByPk(req.params.id);
            if (!row) return res.status(404).json({ ok: false, msg: "Destino no encontrado" });
            return res.json({
                ok: true,
                destination: {
                    id: row.id,
                    name: row.name,
                    is_active: !!row.is_active,
                    created_at: row.created_at,
                    updated_at: row.updated_at
                }
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al obtener destino" });
        }
    },

    createDestination: async (req, res) => {
        try {
            const name = (req.body.name || "").trim();
            if (!name) return res.status(400).json({ ok: false, msg: "El nombre es obligatorio" });

            const dup = await Destination.findOne({ where: { name } });
            if (dup) return res.status(409).json({ ok: false, msg: "Ya existe un destino con ese nombre" });

            const created = await Destination.create({ name, is_active: true });
            return res.status(201).json({
                ok: true,
                destination: {
                    id: created.id,
                    name: created.name,
                    is_active: !!created.is_active,
                    created_at: created.created_at,
                    updated_at: created.updated_at
                }
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al crear destino" });
        }
    },

    updateDestination: async (req, res) => {
        try {
            const { id } = req.params;
            const data = {};
            if (typeof req.body.name === "string") data.name = req.body.name.trim();
            if (typeof req.body.is_active !== "undefined") data.is_active = !!req.body.is_active;

            if (!data.name && typeof data.is_active === "undefined") {
                return res.status(400).json({ ok: false, msg: "Sin cambios para aplicar" });
            }

            if (data.name) {
                const dup = await Destination.findOne({ where: { name: data.name, id: { [Op.ne]: id } } });
                if (dup) return res.status(409).json({ ok: false, msg: "Ya existe un destino con ese nombre" });
            }

            const [updated] = await Destination.update(data, { where: { id } });
            if (!updated) return res.status(404).json({ ok: false, msg: "Destino no encontrado" });

            const row = await Destination.findByPk(id);
            return res.json({
                ok: true,
                destination: {
                    id: row.id,
                    name: row.name,
                    is_active: !!row.is_active,
                    created_at: row.created_at,
                    updated_at: row.updated_at
                },
                msg: "Destino actualizado"
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al actualizar destino" });
        }
    },

    deleteDestination: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Destination.destroy({ where: { id } });
            if (!deleted) return res.status(404).json({ ok: false, msg: "Destino no encontrado" });
            return res.json({ ok: true, msg: "Destino eliminado" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al eliminar destino" });
        }
    },



    getAllTrucks: async (req, res) => {
        try {
            const q = (req.query.q || "").trim().toLowerCase();
            const includeInactive = String(req.query.includeInactive || "0") === "1";
            const where = {};
            if (q) {
                where[Op.or] = [
                    { brand: { [Op.like]: `%${q}%` } },
                    { model: { [Op.like]: `%${q}%` } },
                    { plate: { [Op.like]: `%${q}%` } },
                ];
            }
            if (!includeInactive) where.is_active = true;

            const rows = await Truck.findAll({ where, order: [["model", "ASC"]] });
            return res.json({
                ok: true, data: rows.map(r => ({
                    id: r.id, brand: r.brand, model: r.model, plate: r.plate,
                    is_active: !!r.is_active, created_at: r.created_at, updated_at: r.updated_at
                }))
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al listar camiones" });
        }
    },

    getTruckById: async (req, res) => {
        try {
            const row = await Truck.findByPk(req.params.id);
            if (!row) return res.status(404).json({ ok: false, msg: "Camión no encontrado" });
            return res.json({
                ok: true, truck: {
                    id: row.id, brand: row.brand, model: row.model, plate: row.plate,
                    is_active: !!row.is_active, created_at: row.created_at, updated_at: row.updated_at
                }
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al obtener camión" });
        }
    },

    createTruck: async (req, res) => {
        try {
            const brand = (req.body.brand || "").trim();
            const model = (req.body.model || "").trim();
            const plate = (req.body.plate || "").trim().toUpperCase();
            if (!brand || !model || !plate) return res.status(400).json({ ok: false, msg: "Datos incompletos" });

            const dup = await Truck.findOne({ where: { plate } });
            if (dup) return res.status(409).json({ ok: false, msg: "Ya existe un camión con esa patente" });

            const created = await Truck.create({ brand, model, plate, is_active: true });
            return res.status(201).json({
                ok: true, truck: {
                    id: created.id, brand: created.brand, model: created.model, plate: created.plate,
                    is_active: !!created.is_active, created_at: created.created_at, updated_at: created.updated_at
                }
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al crear camión" });
        }
    },

    updateTruck: async (req, res) => {
        try {
            const { id } = req.params;
            const data = {};
            if (typeof req.body.brand === "string") data.brand = req.body.brand.trim();
            if (typeof req.body.model === "string") data.model = req.body.model.trim();
            if (typeof req.body.plate === "string") data.plate = req.body.plate.trim().toUpperCase();
            if (typeof req.body.is_active !== "undefined") data.is_active = !!req.body.is_active;

            if (!Object.keys(data).length) return res.status(400).json({ ok: false, msg: "Sin cambios" });

            if (data.plate) {
                const dup = await Truck.findOne({ where: { plate: data.plate, id: { [Op.ne]: id } } });
                if (dup) return res.status(409).json({ ok: false, msg: "Ya existe un camión con esa patente" });
            }

            const [updated] = await Truck.update(data, { where: { id } });
            if (!updated) return res.status(404).json({ ok: false, msg: "Camión no encontrado" });

            const row = await Truck.findByPk(id);
            return res.json({
                ok: true, truck: {
                    id: row.id, brand: row.brand, model: row.model, plate: row.plate,
                    is_active: !!row.is_active, created_at: row.created_at, updated_at: row.updated_at
                }, msg: "Camión actualizado"
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al actualizar camión" });
        }
    },

    deleteTruck: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Truck.destroy({ where: { id } });
            if (!deleted) return res.status(404).json({ ok: false, msg: "Camión no encontrado" });
            return res.json({ ok: true, msg: "Camión eliminado" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al eliminar camión" });
        }
    },
    // Buscar remitos para el select con search remoto (excluye los ya usados en roadmap_info_destinations)
    listRemitsOptions: async (req, res) => {
        try {
            const q = String(req.query.search || "").trim();
            const limit = Math.min(50, Number(req.query.limit || 20));

            // 1) Traer IDs de remitos ya asignados a alguna hoja de ruta
            const usedRows = await db.RoadmapInfoDestination.findAll({
                attributes: ["id_remit"],
                group: ["id_remit"],   // evitar duplicados
                raw: true,
            });
            const usedIds = usedRows.map(r => Number(r.id_remit)).filter(Boolean);

            // 2) Armar WHERE base
            const where = {};
            if (q) {
                where[Op.or] = [
                    { receipt_number: { [Op.like]: `%${q}%` } },
                    { client_name: { [Op.like]: `%${q}%` } },
                ];
            }
            // 3) Excluir remitos ya usados (solo si hay alguno)
            if (usedIds.length > 0) {
                where.id = { [Op.notIn]: usedIds };
            }

            // 4) Traer opciones
            const rows = await db.FinalRemit.findAll({
                where,
                order: [["id", "DESC"]],
                limit,
                attributes: ["id", "receipt_number", "client_name"],
                raw: true,
            });

            const options = rows.map(r => ({
                value: r.id,
                label: `N° ${r.receipt_number} — ${r.client_name || ""}`,
                receipt_number: r.receipt_number,
                client_name: r.client_name,
            }));

            return res.json({ ok: true, options });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error listando remitos" });
        }
    },


    createRoadmap: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const {
                delivery_date,
                remit_ids = [],
                destination_ids = [],
                destination_names = [],
                truck_id,
                truck_license_plate,
                driver_id,
                driver,
            } = req.body || {};

            if (!delivery_date) { await t.rollback(); return res.status(400).json({ ok: false, msg: "delivery_date es obligatorio" }); }
            if (!remit_ids.length) { await t.rollback(); return res.status(400).json({ ok: false, msg: "Seleccioná al menos un remito" }); }
            if (!destination_ids.length && !destination_names.length) { await t.rollback(); return res.status(400).json({ ok: false, msg: "Seleccioná un destino" }); }

            let plate = (truck_license_plate || "").trim();
            if (!plate && truck_id) {
                const tr = await Truck.findByPk(truck_id, { transaction: t });
                plate = tr?.plate || tr?.license_plate || tr?.truck_plate || tr?.patente || null;
            }

            let driverName = (driver || "").trim();
            if (!driverName && driver_id) {
                const d = await Driver.findByPk(driver_id, { transaction: t });
                driverName = [d?.driver_name, d?.driver_surname].filter(Boolean).join(" ").trim() || null;
            }

            const header = await RoadmapInfo.create({
                delivery_date,
                truck_license_plate: plate,
                driver: driverName,
            }, { transaction: t });

            const namesFromIds = destination_ids.length
                ? (await Destination.findAll({ where: { id: destination_ids }, transaction: t }))
                    .map(d => d.name || d.destination_name || d.destination)
                : [];
            const manualNames = (destination_names || []).map(s => String(s || "").trim()).filter(Boolean);
            const destNames = Array.from(new Set([...namesFromIds, ...manualNames])).filter(Boolean);

            const uniqRemits = Array.from(new Set(remit_ids.map(Number).filter(Boolean)));
            const createdRows = [];

            for (const r of uniqRemits) {
                const fr = await FinalRemit.findOne({
                    where: { [Op.or]: [{ id: r }, { order_id: r }, { receipt_number: r }] },
                    transaction: t
                });
                const client = fr?.client_name || "SIN ESPECIFICAR";

                for (const nm of destNames) {
                    const row = await RoadmapInfoDestination.create({
                        roadmap_info_id: header.id,
                        id_remit: r,
                        client_name: client,
                        destination: nm,
                    }, { transaction: t });
                    createdRows.push(row.id);
                }
            }

            await t.commit();
            return res.status(201).json({ ok: true, id: header.id, rows: createdRows, msg: "Roadmap creado" });
        } catch (e) {
            try { await t.rollback(); } catch { }
            return res.status(500).json({ ok: false, msg: "Error al crear roadmap" });
        }
    },



    getRoadmap: async (req, res) => {
        try {
            const { id } = req.params;

            const header = await RoadmapInfo.findByPk(id);
            if (!header) return res.status(404).json({ ok: false, msg: "Roadmap no encontrado" });

            const rows = await RoadmapInfoDestination.findAll({
                where: { roadmap_info_id: id },
                order: [["id", "ASC"]],
            });

            // Opciones de remitos (N° + Cliente)
            const remit_options = Array.from(
                new Map(
                    rows.map(r => [r.id_remit, {
                        value: r.id_remit,
                        label: `N° ${r.id_remit} — ${r.client_name || ""}`,
                        receipt_number: r.id_remit,
                        client_name: r.client_name || ""
                    }])
                ).values()
            );

            // Lista única de destinos y uno principal para el header
            const destinations = Array.from(new Set(rows.map(r => r.destination).filter(Boolean)));
            const destination_main = destinations[0] || null;

            return res.json({
                ok: true,
                roadmap: {
                    id: header.id,
                    created_at: header.created_at,               // 👈 agregado
                    delivery_date: header.delivery_date,
                    truck_license_plate: header.truck_license_plate,
                    driver: header.driver,
                    destination_main,                             // 👈 agregado (para el header)
                    destinations,                                 // por si mostrás varios
                    remit_options                                  // para la grilla de remitos
                },
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error leyendo roadmap" });
        }
    },



    updateRoadmap: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const {
                delivery_date,
                remit_ids = [],
                destination_ids = [],
                destination_names = [],
                truck_id,
                truck_license_plate,
                driver_id,
                driver,
            } = req.body || {};

            const header = await RoadmapInfo.findByPk(id, { transaction: t });
            if (!header) { await t.rollback(); return res.status(404).json({ ok: false, msg: "Roadmap no encontrado" }); }

            let plate = (truck_license_plate || header.truck_license_plate || "").trim();
            if (!plate && truck_id) {
                const tr = await Truck.findByPk(truck_id, { transaction: t });
                plate = tr?.license_plate || tr?.plate || tr?.truck_plate || plate;
            }

            let driverName = (driver || header.driver || "").trim();
            if (!driverName && driver_id) {
                const d = await Driver.findByPk(driver_id, { transaction: t });
                driverName = [d?.driver_name, d?.driver_surname].filter(Boolean).join(" ").trim() || driverName;
            }

            await header.update({
                delivery_date: delivery_date || header.delivery_date,
                truck_license_plate: plate || null,
                driver: driverName || null,
            }, { transaction: t });

            await RoadmapInfoDestination.destroy({ where: { roadmap_info_id: id }, transaction: t });

            const namesFromIds = destination_ids.length
                ? (await Destination.findAll({ where: { id: destination_ids }, transaction: t }))
                    .map(d => d.name || d.destination_name || d.destination)
                : [];
            const manualNames = (destination_names || []).map(s => String(s || "").trim()).filter(Boolean);
            const destNames = Array.from(new Set([...namesFromIds, ...manualNames])).filter(Boolean);

            const uniqRemits = Array.from(new Set(remit_ids.map(Number).filter(Boolean)));

            for (const r of uniqRemits) {
                const fr = await FinalRemit.findOne({
                    where: { [Op.or]: [{ id: r }, { order_id: r }, { receipt_number: r }] },
                    transaction: t
                });
                const client = fr?.client_name || "SIN ESPECIFICAR";

                for (const nm of destNames) {
                    await RoadmapInfoDestination.create({
                        roadmap_info_id: id,
                        id_remit: r,
                        client_name: client,
                        destination: nm,
                    }, { transaction: t });
                }
            }

            await t.commit();
            return res.json({ ok: true, msg: "Roadmap actualizado" });
        } catch (e) {
            try { await t.rollback(); } catch { }
            return res.status(500).json({ ok: false, msg: "Error actualizando roadmap" });
        }
    },

    listRoadmaps: async (req, res) => {
        try {
            const { q = "", page = 1, size = 10 } = req.query;
            const limit = Number(size);
            const offset = (Number(page) - 1) * limit;

            const { rows, count } = await RoadmapInfo.findAndCountAll({
                include: [{ model: RoadmapInfoDestination, as: "destinations" }],
                order: [["created_at", "DESC"]],
                limit,
                offset,
            });

            const data = rows.map(r => ({
                id: r.id,
                created_at: r.created_at,
                delivery_date: r.delivery_date,
                truck_license_plate: r.truck_license_plate,
                driver: r.driver,
                destination: r.destinations?.[0]?.destination || "-",
                destinationsCount: r.destinations?.length || 0,
            }));

            return res.json({
                ok: true,
                data,
                page: Number(page),
                size: limit,
                total: count,
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error listando roadmaps" });
        }
    },
    listRoadmapDateGroups: async (req, res) => {
        try {
            const listRoadmap = await RoadmapInfo.findAll({});
            return res.json(listRoadmap)

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al listar prefacturaciones (roadmaps)." });
        }
    },
    // Detalle de prefacturación por fechas (production_date = DATE(created_at), delivery_date)
    getPreinvoiceDetail: async (req, res) => {
        try {
            const { Op, fn, col, where } = require("sequelize");
            const production_date = String(req.query.production_date || "").slice(0, 10);
            const delivery_date = String(req.query.delivery_date || "").slice(0, 10);

            if (!production_date || !delivery_date) {
                return res.status(400).json({ ok: false, msg: "Faltan production_date y delivery_date (YYYY-MM-DD)" });
            }

            // 1) Roadmaps que matchean fechas
            const roadmaps = await RoadmapInfo.findAll({
                where: {
                    [Op.and]: [
                        where(fn("DATE", col("created_at")), production_date),
                        where(fn("DATE", col("delivery_date")), delivery_date)
                    ]
                },
                order: [["id", "ASC"]],
                attributes: ["id", "truck_license_plate", "driver", "delivery_date", "created_at"]
            });

            if (!roadmaps.length) {
                return res.json({ ok: true, production_date, delivery_date, roadmaps: [] });
            }

            const roadmapIds = roadmaps.map(r => r.id);

            // 2) Destinos de esos roadmaps (acá obtenemos los remitos finales por roadmap)
            const destinations = await RoadmapInfoDestination.findAll({
                where: { roadmap_info_id: { [Op.in]: roadmapIds } },
                order: [["id", "ASC"]],
                attributes: ["id", "roadmap_info_id", "id_remit", "client_name", "destination"]
            });

            // Agrupo destinos por roadmap_id
            const destByRoadmap = new Map();
            for (const d of destinations) {
                const key = d.roadmap_info_id;
                if (!destByRoadmap.has(key)) destByRoadmap.set(key, []);
                destByRoadmap.get(key).push(d);
            }

            // 3) Traigo headers de remitos y luego todos sus items de una
            const remitIds = destinations.map(d => d.id_remit).filter(Boolean);
            const remits = remitIds.length
                ? await FinalRemit.findAll({
                    where: { id: { [Op.in]: remitIds } },
                    attributes: [
                        "id", "order_id", "receipt_number", "client_name", "salesman_name", "generated_by",
                        "price_list", "sell_condition", "payment_condition", "total_items", "total_amount", "created_at"
                    ],
                    order: [["id", "ASC"]],
                })
                : [];

            const products = remitIds.length
                ? await FinalRemitProduct.findAll({
                    where: { final_remit_id: { [Op.in]: remitIds } },
                    order: [["id", "ASC"]],
                    attributes: [
                        "id", "final_remit_id", "product_id", "product_name",
                        "unit_measure", "qty", "net_weight", "unit_price", "gross_weight", "avg_weight"
                    ]
                })
                : [];

            // Indexo para armar respuesta rápido
            const remitById = new Map(remits.map(r => [r.id, r]));
            const itemsByRemit = new Map();
            for (const p of products) {
                if (!itemsByRemit.has(p.final_remit_id)) itemsByRemit.set(p.final_remit_id, []);
                itemsByRemit.get(p.final_remit_id).push({
                    id: p.id,
                    final_remit_item_id: p.id,
                    product_id: p.product_id,
                    product_name: p.product_name,
                    unit_measure: p.unit_measure,
                    qty: Number(p.qty || 0),
                    net_weight: Number(p.net_weight || 0),
                    unit_price: Number(p.unit_price || 0),
                    gross_weight: Number(p.gross_weight || 0),
                    avg_weight: Number(p.avg_weight || 0),
                    total: Number(p.unit_price || 0) * (String(p.unit_measure || "").toUpperCase() === "KG"
                        ? Number(p.net_weight || 0) : Number(p.qty || 0)),
                });
            }

            // 4) Armo salida agrupada por roadmap (camión)
            const out = roadmaps.map(r => {
                const dests = destByRoadmap.get(r.id) || [];
                const remitsForRoadmap = dests
                    .map(d => {
                        const h = remitById.get(d.id_remit);
                        if (!h) return null;
                        return {
                            final_remit_id: h.id,
                            receipt_number: h.receipt_number,
                            order_id: h.order_id,
                            client_name: h.client_name,
                            salesman_name: h.salesman_name,
                            generated_by: h.generated_by,
                            price_list: h.price_list,
                            sell_condition: h.sell_condition,
                            payment_condition: h.payment_condition,
                            destination: d.destination,
                            total_items: Number(h.total_items || 0),
                            total_amount: Number(h.total_amount || 0),
                            items: itemsByRemit.get(h.id) || []
                        };
                    })
                    .filter(Boolean);

                return {
                    roadmap_id: r.id,
                    truck_license_plate: r.truck_license_plate,
                    driver: r.driver,
                    production_date: String(r.created_at).slice(0, 10),
                    delivery_date: String(r.delivery_date).slice(0, 10),
                    remits: remitsForRoadmap
                };
            });

            return res.json({
                ok: true,
                production_date,
                delivery_date,
                roadmaps: out
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al armar detalle de prefacturaciones" });
        }
    },

    savePreinvoice: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const items = Array.isArray(req.body?.items) ? req.body.items : [];
            if (!items.length) {
                await t.rollback();
                return res.status(400).json({ ok: false, msg: "No hay ítems para guardar" });
            }

            const toInt = (v) => {
                const n = parseInt(String(v ?? "").trim(), 10);
                return Number.isFinite(n) ? n : null;
            };
            const toNum = (v, d = 0) => {
                if (v === null || v === undefined || v === "") return d;
                const n = parseFloat(String(v).replace(",", ".").trim());
                return Number.isFinite(n) ? n : d;
            };
            const getUnits = (it) => toNum(it.units_received ?? it.received_units ?? it.units);
            const getKg = (it) => toNum(it.kg_received ?? it.received_kg ?? it.kg);

            const results = [];

            for (const it of items) {
                const finalRemitItemId = toInt(it.item_id ?? it.final_remit_item_id ?? it.id);
                if (!finalRemitItemId) {
                    await t.rollback();
                    return res.status(400).json({ ok: false, msg: "Falta item_id (final_remit_item_id)" });
                }

                const units = getUnits(it);
                const kg = getKg(it);

                let row = await Preinvoice.findOne({
                    where: { final_remit_item_id: finalRemitItemId },
                    transaction: t,
                });

                if (!row) {
                    // CREATE: seteo expected_* desde el remito, NUNCA desde el payload
                    const frItem = await FinalRemitProduct.findOne({
                        where: { id: finalRemitItemId },
                        attributes: [
                            "final_remit_id", "qty", "net_weight",
                            "product_id", "product_name", "unit_measure"
                        ],
                        transaction: t,
                    });
                    if (!frItem) {
                        await t.rollback();
                        return res.status(404).json({ ok: false, msg: `No existe final_remit_item_id=${finalRemitItemId}` });
                    }

                    row = await Preinvoice.create(
                        {
                            final_remit_id: frItem.final_remit_id,
                            final_remit_item_id: finalRemitItemId,
                            product_id: it.product_id ?? frItem.product_id ?? null,
                            product_name: it.product_name ?? frItem.product_name ?? null,
                            unit_measure: it.unit_measure ?? frItem.unit_measure ?? null,
                            receipt_number: it.receipt_number ?? null,

                            // Esperados SIEMPRE desde el remito
                            expected_units: Number(frItem.qty ?? 0),
                            expected_kg: Number(frItem.net_weight ?? 0),

                            // Recibidos desde lo editado
                            received_units: units,
                            received_kg: kg,
                        },
                        { transaction: t }
                    );
                } else {
                    // UPDATE: SOLO recibidos; NO tocar expected_*
                    row.received_units = units;
                    row.received_kg = kg;

                    // metadatos opcionales si vienen
                    if (it.product_id !== undefined) row.product_id = toInt(it.product_id);
                    if (it.product_name !== undefined) row.product_name = it.product_name ?? null;
                    if (it.unit_measure !== undefined) row.unit_measure = it.unit_measure ?? null;
                    if (it.receipt_number !== undefined) row.receipt_number = it.receipt_number ?? null;

                    await row.save({ transaction: t });
                }

                results.push({
                    item_id: row.final_remit_item_id,
                    units_received: row.received_units ?? 0,
                    kg_received: row.received_kg ?? 0,
                });
            }

            await t.commit();
            return res.status(201).json({ ok: true, items: results, msg: "Prefacturación guardada" });
        } catch (e) {
            console.error(e);
            await t.rollback();
            return res.status(500).json({ ok: false, msg: "Error al guardar prefacturación" });
        }
    },





    readSavedPreinvoices: async (req, res) => {
        try {
            const production_date = String(req.query.production_date || "").slice(0, 10);
            const delivery_date = String(req.query.delivery_date || "").slice(0, 10);

            if (!production_date || !delivery_date) {
                return res.status(400).json({ ok: false, msg: "Faltan production_date y delivery_date (YYYY-MM-DD)" });
            }

            // 1) Roadmaps matching fechas
            const roadmaps = await RoadmapInfo.findAll({
                where: {
                    [Op.and]: [
                        where(fn("DATE", col("created_at")), production_date),
                        where(fn("DATE", col("delivery_date")), delivery_date),
                    ],
                },
                attributes: ["id"],
                order: [["id", "ASC"]],
            });
            if (!roadmaps.length) return res.json({ ok: true, items: [] });

            const roadmapIds = roadmaps.map(r => r.id);

            // 2) Destinos ⇒ remitos
            const dests = await RoadmapInfoDestination.findAll({
                where: { roadmap_info_id: { [Op.in]: roadmapIds } },
                attributes: ["id_remit"],
                order: [["id", "ASC"]],
            });
            const remitIds = dests.map(d => Number(d.id_remit)).filter(Boolean);
            if (!remitIds.length) return res.json({ ok: true, items: [] });

            // 3) Prefacturación ya guardada para esos remitos
            const saved = await Preinvoice.findAll({
                where: { final_remit_id: { [Op.in]: remitIds } },
                attributes: ["final_remit_item_id", "received_units", "received_kg"],
                order: [["id", "ASC"]],
            });

            const items = saved.map(p => ({
                item_id: Number(p.final_remit_item_id),
                units_received: Number(p.received_units || 0),
                kg_received: Number(p.received_kg || 0),
            }));

            return res.json({ ok: true, items });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al leer prefacturación guardada" });
        }
    },


    readPreinvoiceReturns: async (req, res) => {
        try {
            const production_date = String(req.query.production_date || "").slice(0, 10);
            const delivery_date = String(req.query.delivery_date || "").slice(0, 10);

            if (!production_date || !delivery_date) {
                return res.status(400).json({ ok: false, msg: "Faltan production_date y delivery_date (YYYY-MM-DD)" });
            }

            // 1) Roadmaps matching fechas
            const roadmaps = await RoadmapInfo.findAll({
                where: {
                    [Op.and]: [
                        where(fn("DATE", col("created_at")), production_date),
                        where(fn("DATE", col("delivery_date")), delivery_date),
                    ],
                },
                attributes: ["id"],
                order: [["id", "ASC"]],
            });
            if (!roadmaps.length) return res.json({ ok: true, items: [] });

            const roadmapIds = roadmaps.map(r => r.id);

            // 2) Destinos ⇒ remitos
            const dests = await RoadmapInfoDestination.findAll({
                where: { roadmap_info_id: { [Op.in]: roadmapIds } },
                attributes: ["id_remit"],
                order: [["id", "ASC"]],
            });
            const remitIds = dests.map(d => Number(d.id_remit)).filter(Boolean);
            if (!remitIds.length) return res.json({ ok: true, items: [] });

            // 3) Prefacturación con returns
            const rows = await Preinvoice.findAll({
                where: { final_remit_id: { [Op.in]: remitIds } },
                attributes: ["id", "final_remit_item_id"],
                include: [{ model: PreinvoiceReturn, as: "returns", required: false }],
                order: [["id", "ASC"]],
            });

            const items = [];
            for (const p of rows) {
                for (const r of (p.returns || [])) {
                    items.push({
                        item_id: Number(p.final_remit_item_id),
                        reason: r.reason === "STOCK" ? "stock" : "client",
                        client_name: r.client_name || null,
                        units_redirected: Number(r.units_redirected || 0),
                        kg_redirected: Number(r.kg_redirected || 0),
                        created_at: r.created_at,
                        updated_at: r.updated_at,
                    });
                }
            }

            return res.json({ ok: true, items });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al leer devoluciones de prefacturación" });
        }
    },


    // 4) Leer prefacturación simple por remit
    readPreinvoice: async (req, res) => {
        try {
            const remitId = Number(req.params.remit_id);
            if (!remitId) {
                return res.status(400).json({ ok: false, msg: "Falta remit_id" });
            }

            const rows = await Preinvoice.findAll({
                where: { final_remit_id: remitId },
                order: [["id", "ASC"]],
            });

            return res.json({ ok: true, rows });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al leer prefacturación" });
        }
    },


    savePreinvoiceRedirect: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const {
                final_remit_id,
                item_id,
                to,                 // 'client' | 'stock'
                client_id = null,
                client_name = null,
                units = 0,
                kg = 0,
            } = req.body || {};

            if (!item_id || !to) {
                await t.rollback();
                return res.status(400).json({ ok: false, msg: "Faltan item_id y/o destino (to)" });
            }

            // 1) Busco la fila de preinvoice a la que pertenece este item
            const pre = await Preinvoice.findOne({
                where: { final_remit_item_id: Number(item_id) },
                transaction: t,
            });

            if (!pre) {
                await t.rollback();
                return res.status(404).json({ ok: false, msg: "No existe la prefacturación para ese item" });
            }

            // 2) Normalizo razón a lo que guarda DB
            const reasonDB = to === "stock" ? "STOCK" : "REDIRECT";

            // 3) Busco si ya existe la misma redirección (mismo destino/cliente)
            const whereReturn = {
                preinvoice_id: pre.id,
                reason: reasonDB,
                ...(reasonDB === "REDIRECT" ? { client_name: client_name || null } : {}),
            };

            const existing = await PreinvoiceReturn.findOne({ where: whereReturn, transaction: t });

            // 4) Si llega 0 y 0 → borrar si existía
            if (Number(units) === 0 && Number(kg) === 0) {
                if (existing) await existing.destroy({ transaction: t });
                await t.commit();
                return res.json({ ok: true, msg: "Redirección eliminada" });
            }

            // 5) Upsert
            if (existing) {
                existing.client_id = client_id;
                existing.client_name = client_name;
                existing.units_redirected = Number(units);
                existing.kg_redirected = Number(kg);
                await existing.save({ transaction: t });
            } else {
                await PreinvoiceReturn.create(
                    {
                        preinvoice_id: pre.id,
                        client_id,
                        client_name,
                        units_redirected: Number(units),
                        kg_redirected: Number(kg),
                        reason: reasonDB,
                    },
                    { transaction: t }
                );
            }

            await t.commit();
            return res.status(201).json({ ok: true, msg: "Redirección registrada" });
        } catch (e) {
            console.error(e);
            await t.rollback();
            return res.status(500).json({ ok: false, msg: "Error al registrar redirección" });
        }
    },

    // GET /preinvoices/saved?production_date=YYYY-MM-DD&delivery_date=YYYY-MM-DD
    readSavedPreinvoicesV2: async (req, res) => {
        try {
            const production_date = String(req.query.production_date || "").slice(0, 10);
            const delivery_date = String(req.query.delivery_date || "").slice(0, 10);
            if (!production_date || !delivery_date) {
                return res.status(400).json({ ok: false, msg: "Faltan production_date y delivery_date (YYYY-MM-DD)" });
            }

            const roadmaps = await RoadmapInfo.findAll({
                where: {
                    [Op.and]: [
                        where(fn("DATE", col("created_at")), production_date),
                        where(fn("DATE", col("delivery_date")), delivery_date),
                    ],
                },
                attributes: ["id"],
                order: [["id", "ASC"]],
            });
            if (!roadmaps.length) return res.json({ ok: true, items: [] });

            const dests = await RoadmapInfoDestination.findAll({
                where: { roadmap_info_id: { [Op.in]: roadmaps.map(r => r.id) } },
                attributes: ["id_remit"],
            });
            const remitIds = dests.map(d => Number(d.id_remit)).filter(Boolean);
            if (!remitIds.length) return res.json({ ok: true, items: [] });

            const saved = await Preinvoice.findAll({
                where: { final_remit_id: { [Op.in]: remitIds } },
                attributes: ["final_remit_item_id", "received_units", "received_kg"],
                order: [["id", "ASC"]],
            });

            const items = saved.map(p => ({
                item_id: Number(p.final_remit_item_id),        // 👈 clave para mapear en el front
                units_received: Number(p.received_units || 0),
                kg_received: Number(p.received_kg || 0),
            }));

            return res.json({ ok: true, items });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al leer prefacturación guardada" });
        }
    },

    // GET /preinvoices/returns?production_date=YYYY-MM-DD&delivery_date=YYYY-MM-DD
    readPreinvoiceReturnsV2: async (req, res) => {
        try {
            const production_date = String(req.query.production_date || "").slice(0, 10);
            const delivery_date = String(req.query.delivery_date || "").slice(0, 10);
            if (!production_date || !delivery_date) {
                return res.status(400).json({ ok: false, msg: "Faltan production_date y delivery_date (YYYY-MM-DD)" });
            }

            const roadmaps = await RoadmapInfo.findAll({
                where: {
                    [Op.and]: [
                        where(fn("DATE", col("created_at")), production_date),
                        where(fn("DATE", col("delivery_date")), delivery_date),
                    ],
                },
                attributes: ["id"],
                order: [["id", "ASC"]],
            });
            if (!roadmaps.length) return res.json({ ok: true, items: [] });

            const dests = await RoadmapInfoDestination.findAll({
                where: { roadmap_info_id: { [Op.in]: roadmaps.map(r => r.id) } },
                attributes: ["id_remit"],
            });
            const remitIds = dests.map(d => Number(d.id_remit)).filter(Boolean);
            if (!remitIds.length) return res.json({ ok: true, items: [] });

            const rows = await Preinvoice.findAll({
                where: { final_remit_id: { [Op.in]: remitIds } },
                attributes: ["final_remit_item_id"],
                include: [{ model: PreinvoiceReturn, as: "returns", required: false }],
                order: [["id", "ASC"]],
            });

            const items = [];
            for (const p of rows) {
                for (const r of (p.returns || [])) {
                    items.push({
                        item_id: Number(p.final_remit_item_id),           // 👈 clave para mapear
                        reason: r.reason === "STOCK" ? "stock" : "client",
                        client_name: r.client_name || null,
                        units_redirected: Number(r.units_redirected || 0),
                        kg_redirected: Number(r.kg_redirected || 0),
                        created_at: r.created_at,
                        updated_at: r.updated_at,
                    });
                }
            }

            return res.json({ ok: true, items });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al leer devoluciones" });
        }
    },


    // GET /preinvoices/returns?production_date=YYYY-MM-DD&delivery_date=YYYY-MM-DD
    readPreinvoiceReturnsV2: async (req, res) => {
        try {
            const production_date = String(req.query.production_date || "").slice(0, 10);
            const delivery_date = String(req.query.delivery_date || "").slice(0, 10);
            if (!production_date || !delivery_date) {
                return res.status(400).json({ ok: false, msg: "Faltan production_date y delivery_date (YYYY-MM-DD)" });
            }

            const roadmaps = await RoadmapInfo.findAll({
                where: {
                    [Op.and]: [
                        where(fn("DATE", col("created_at")), production_date),
                        where(fn("DATE", col("delivery_date")), delivery_date),
                    ],
                },
                attributes: ["id"],
                order: [["id", "ASC"]],
            });
            if (!roadmaps.length) return res.json({ ok: true, items: [] });

            const dests = await RoadmapInfoDestination.findAll({
                where: { roadmap_info_id: { [Op.in]: roadmaps.map(r => r.id) } },
                attributes: ["id_remit"],
            });
            const remitIds = dests.map(d => Number(d.id_remit)).filter(Boolean);
            if (!remitIds.length) return res.json({ ok: true, items: [] });

            const rows = await Preinvoice.findAll({
                where: { final_remit_id: { [Op.in]: remitIds } },
                attributes: ["final_remit_item_id"],
                include: [{ model: PreinvoiceReturn, as: "returns", required: false }],
                order: [["id", "ASC"]],
            });

            const items = [];
            for (const p of rows) {
                for (const r of (p.returns || [])) {
                    items.push({
                        item_id: Number(p.final_remit_item_id),       // <— clave para mapear en el front
                        reason: r.reason === "STOCK" ? "stock" : "client",
                        client_name: r.client_name || null,
                        units_redirected: Number(r.units_redirected || 0),
                        kg_redirected: Number(r.kg_redirected || 0),
                        created_at: r.created_at,
                        updated_at: r.updated_at,
                    });
                }
            }

            return res.json({ ok: true, items });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error al leer devoluciones" });
        }
    },

    // POST /preinvoices/redirect
    // body: { item_id, to:'client'|'stock', client_id?, client_name?, units, kg }
    savePreinvoiceRedirect: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { item_id, to, client_id = null, client_name = null, units = 0, kg = 0 } = req.body || {};
            if (!item_id || !to) {
                await t.rollback();
                return res.status(400).json({ ok: false, msg: "Faltan item_id y/o destino (to)" });
            }

            const pre = await Preinvoice.findOne({
                where: { final_remit_item_id: Number(item_id) },
                transaction: t,
            });
            if (!pre) {
                await t.rollback();
                return res.status(404).json({ ok: false, msg: "No existe la prefacturación para ese item" });
            }

            const reasonDB = to === "stock" ? "STOCK" : "REDIRECT";
            const whereReturn = {
                preinvoice_id: pre.id,
                reason: reasonDB,
                ...(reasonDB === "REDIRECT" ? { client_name: client_name || null } : {}),
            };

            const existing = await PreinvoiceReturn.findOne({ where: whereReturn, transaction: t });

            if (Number(units) === 0 && Number(kg) === 0) {
                if (existing) await existing.destroy({ transaction: t });
                await t.commit();
                return res.json({ ok: true, msg: "Redirección eliminada" });
            }

            if (existing) {
                existing.client_id = client_id;
                existing.client_name = client_name;
                existing.units_redirected = Number(units);
                existing.kg_redirected = Number(kg);
                await existing.save({ transaction: t });
            } else {
                await PreinvoiceReturn.create(
                    {
                        preinvoice_id: pre.id,
                        client_id,
                        client_name,
                        units_redirected: Number(units),
                        kg_redirected: Number(kg),
                        reason: reasonDB,
                    },
                    { transaction: t }
                );
            }

            await t.commit();
            return res.status(201).json({ ok: true, msg: "Redirección registrada" });
        } catch (e) {
            console.error(e);
            await t.rollback();
            return res.status(500).json({ ok: false, msg: "Error al registrar redirección" });
        }
    },
    // ───────── Listas de precios: traer por número
    getPriceListByNumber: async (req, res) => {
        try {
            const number = Number(req.params.number);
            if (!number) return res.status(400).json({ ok: false, msg: "number requerido" });

            const headers = await PriceList.findAll({
                where: { list_number: number },
                order: [["id", "ASC"]],
            });

            const products = await PriceListProduct.findAll({
                where: { price_list_number: number },
                order: [["product_name", "ASC"]],
            });

            const name = headers[0]?.name || null;
            const clients = headers.map(h => h.client_id).filter(v => v !== null && v !== undefined);

            return res.json({
                ok: true,
                header: { number, name, clients },
                products,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al traer la lista" });
        }
    },

    // ───────── Listas de precios: comparar dos listas
    comparePriceLists: async (req, res) => {
        try {
            const a = Number(req.params.a);
            const b = Number(req.params.b);
            if (!a || !b) return res.status(400).json({ ok: false, msg: "Parámetros inválidos" });

            const [ha, hb] = await Promise.all([
                PriceList.findOne({ where: { list_number: a } }),
                PriceList.findOne({ where: { list_number: b } }),
            ]);

            const [pa, pb] = await Promise.all([
                PriceListProduct.findAll({ where: { price_list_number: a } }),
                PriceListProduct.findAll({ where: { price_list_number: b } }),
            ]);

            // Unimos por product_id si existe; si no, por product_name
            const keyOf = (p) => String(p.product_id ?? p.product_name);
            const mapA = new Map(pa.map(p => [keyOf(p), p]));
            const keys = new Set([...pa.map(keyOf), ...pb.map(keyOf)]);

            const rows = [];
            for (const k of keys) {
                const A = mapA.get(k) || null;
                const B = pb.find(x => keyOf(x) === k) || null;

                const row = {
                    product_id: A?.product_id ?? B?.product_id ?? null,
                    product_name: A?.product_name ?? B?.product_name ?? "",
                    unidad_a: A?.unidad_venta || null,
                    unidad_b: B?.unidad_venta || null,
                    costo_a: A?.costo ?? null,
                    costo_b: B?.costo ?? null,
                    sin_iva_a: A?.precio_sin_iva ?? null,
                    sin_iva_b: B?.precio_sin_iva ?? null,
                    con_iva_a: A?.precio_con_iva ?? null,
                    con_iva_b: B?.precio_con_iva ?? null,
                };

                row.diff_unidad = (row.unidad_a || "") !== (row.unidad_b || "");
                row.diff_costo = Number(row.costo_a ?? -1) !== Number(row.costo_b ?? -1);
                row.diff_sin = Number(row.sin_iva_a ?? -1) !== Number(row.sin_iva_b ?? -1);
                row.diff_con = Number(row.con_iva_a ?? -1) !== Number(row.con_iva_b ?? -1);

                rows.push(row);
            }

            rows.sort((x, y) => String(x.product_name).localeCompare(String(y.product_name)));

            return res.json({
                ok: true,
                a: { number: a, name: ha?.dataValues?.name || ha?.name || null },
                b: { number: b, name: hb?.dataValues?.name || hb?.name || null },
                rows,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al comparar listas" });
        }
    },

    // ───────── Listas de precios: actualizar (nombre/clientes/productos)
    updatePriceList: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const number = Number(req.params.number);
            if (!number) {
                await t.rollback();
                return res.status(400).json({ ok: false, msg: "number requerido" });
            }

            const { name, clients, products } = req.body || {};

            // 1) actualizar nombre y reasignar clientes (reemplazo completo)
            if (name != null) {
                await PriceList.update({ name }, { where: { list_number: number }, transaction: t });
            }

            if (Array.isArray(clients)) {
                await PriceList.destroy({ where: { list_number: number }, transaction: t });
                const rows = (clients.length ? clients : [null]).map(clientId => ({
                    list_number: number,
                    name: name ?? null,
                    client_id: clientId ?? null,
                }));
                await PriceList.bulkCreate(rows, { transaction: t });
            }

            // 2) reemplazar productos de la lista
            if (Array.isArray(products)) {
                await PriceListProduct.destroy({ where: { price_list_number: number }, transaction: t });
                const items = products.map(p => ({
                    price_list_number: number,
                    product_id: p.product_id ?? p.id,
                    product_name: p.product_name ?? p.name,
                    unidad_venta: p.unidad_venta ?? p.unidad ?? null,
                    costo: Number(p.costo ?? 0),
                    precio_sin_iva: Number(p.precio_sin_iva ?? p.sinIva ?? 0),
                    precio_con_iva: Number(p.precio_con_iva ?? p.conIva ?? 0),
                }));
                if (items.length) await PriceListProduct.bulkCreate(items, { transaction: t });
            }

            await t.commit();
            return res.json({ ok: true, msg: "Lista actualizada" });
        } catch (error) {
            console.error(error);
            await t.rollback();
            return res.status(500).json({ ok: false, msg: "Error al actualizar la lista" });
        }
    },

    bulkUpdatePriceLists: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { lists, target, mode, amount, round } = req.body || {};
            if (!Array.isArray(lists) || lists.length === 0) {
                await t.rollback();
                return res.status(400).json({ ok: false, msg: "lists requerido" });
            }
            const validTarget = { costo: "costo", sin_iva: "precio_sin_iva", con_iva: "precio_con_iva" }[target];
            if (!validTarget) {
                await t.rollback();
                return res.status(400).json({ ok: false, msg: "target inválido" });
            }
            const isPercent = mode === "percent";
            const amt = Number(amount || 0);

            for (const ln of lists) {
                const rows = await PriceListProduct.findAll({ where: { price_list_number: ln }, transaction: t });
                for (const r of rows) {
                    const curr = Number(r[validTarget] || 0);
                    const next = isPercent ? curr + (curr * amt) / 100 : curr + amt;
                    const val = round ? Math.round(next) : Number(next.toFixed(2));
                    r.set(validTarget, val);
                    await r.save({ transaction: t });
                }
            }

            await t.commit();
            return res.json({ ok: true, msg: "Actualizado" });
        } catch (e) {
            console.error(e);
            await t.rollback();
            return res.status(500).json({ ok: false, msg: "Error en actualización masiva" });
        }
    },

    preinvoicesSaved: async (req, res) => {
        try {
            const rawReceipts =
                (req.params?.receipts ?? req.query?.receipts ?? "").toString().trim();
            const rawItems =
                (req.params?.items ?? req.query?.items ?? "").toString().trim();

            const where = {};
            if (rawReceipts) {
                const list = rawReceipts.split(",").map(s => s.trim()).filter(Boolean);
                const asNum = list.map(n => Number(n)).filter(n => Number.isFinite(n));
                where[Op.or] = [
                    { receipt_number: { [Op.in]: list } },   // si es VARCHAR
                    { receipt_number: { [Op.in]: asNum } },  // si es INT
                ];
            } else if (rawItems) {
                const ids = rawItems.split(",").map(s => Number(s))
                    .filter(n => Number.isFinite(n) && n > 0);
                if (!ids.length) return res.status(400).json({ ok: false, msg: "items vacío" });
                where.final_remit_item_id = { [Op.in]: ids };
            } else {
                return res.status(400).json({ ok: false, msg: "Usá /preinvoices/saved/receipts/4,6 o /preinvoices/saved?receipts=4,6" });
            }

            const rows = await Preinvoice.findAll({
                where,
                order: [["id", "ASC"]],
                attributes: [
                    "id", "receipt_number", "final_remit_id", "final_remit_item_id",
                    "product_id", "product_name", "unit_measure",
                    "expected_units", "expected_kg", "received_units", "received_kg",
                    "created_at", "updated_at"
                ],
            });

            const byItemId = {};
            for (const r of rows) {
                byItemId[String(r.final_remit_item_id)] = {
                    received_units: Number(r.received_units ?? 0),
                    received_kg: Number(r.received_kg ?? 0),
                    expected_units: Number(r.expected_units ?? 0),
                    expected_kg: Number(r.expected_kg ?? 0),
                    product_id: r.product_id ?? null,
                    product_name: r.product_name ?? null,
                    unit_measure: r.unit_measure ?? null,
                    receipt_number: r.receipt_number ?? null,
                    final_remit_id: r.final_remit_id ?? null,
                };
            }

            return res.json({ ok: true, byItemId, items: rows });
        } catch (e) {
            console.error("[preinvoicesSaved] error:", e);
            return res.status(500).json({ ok: false, msg: "Error leyendo preinvoices guardados" });
        }
    },

deleteRoadmap: async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ ok: false, msg: "Falta id" });

  const t = await sequelize.transaction();
  try {
    const head = await RoadmapInfo.findByPk(id, { transaction: t });
    if (!head) {
      await t.rollback();
      return res.status(404).json({ ok: false, msg: "Hoja de ruta no encontrada" });
    }

    await RoadmapInfoDestination.destroy({ where: { roadmap_info_id: id }, transaction: t });
    await RoadmapInfo.destroy({ where: { id }, transaction: t });

    await t.commit();
    return res.json({ ok: true, msg: "Hoja de ruta eliminada" });
  } catch (e) {
    console.error(e);
    await t.rollback();
    return res.status(500).json({ ok: false, msg: "Error al eliminar hoja de ruta" });
  }
},



}

module.exports = saleApiController;