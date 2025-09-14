const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, fn, col, where } = require("sequelize");
const moment = require("moment");
const { stringify } = require("querystring");
const OrderProductsClient = require("../../src/config/models/OrderProductsClient");
const PDFDocument = require("pdfkit");


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



function drawHeader(doc, remit) {
  const left = 50;
  const top = 60;

  doc.font("Helvetica-Bold").fontSize(20).text("Remito", left, top);
  doc.font("Helvetica").fontSize(10).text(`N° ${remit.receipt_number}`, left, top + 24);
  doc.text(`Fecha: ${new Date(remit.date_order || remit.created_at || Date.now()).toLocaleDateString()}`, left, top + 38);

  const col1W = 220;
  const col2W = 200;
  const col3W = 140;

  const yBase = top + 62;

  let x = left, y = yBase;
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

const nf = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ni = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
function fmtMoney(v) { return nf.format(Number(v || 0)); }
function fmtQty(v) { return ni.format(Number(v || 0)); }

function drawTable(doc, items, startY = 210) {
  const topY = startY + 10;

  const left = doc.page.margins.left || 40;
  const right = doc.page.margins.right || 40;
  const availableWidth = doc.page.width - left - right;

  const COLS = [
    { key: "product_id",   title: "CÓDIGO",   width: 50,  align: "left"   },
    { key: "product_name", title: "PRODUCTO", width: 155, align: "left"   },
    { key: "unit_measure", title: "UNIDAD",   width: 45,  align: "center" },
    { key: "qty",          title: "CANT.",    width: 55,  align: "right"  },
    { key: "net_weight",   title: "P. NETO",  width: 60,  align: "right"  },
    { key: "unit_price",   title: "P. UNIT",  width: 65,  align: "right"  },
    { key: "total",        title: "P. TOTAL", width: 85,  align: "right"  },
  ];
  const sumWidths = COLS.reduce((a, c) => a + c.width, 0);
  if (sumWidths !== Math.round(availableWidth)) {
    COLS[COLS.length - 1].width += (availableWidth - sumWidths);
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
  let totalItems = 0;

  const drawHeaderIfPageBreak = () => {
    doc.font("Helvetica").fontSize(9);
    doc.moveDown(0.2);
    let yy = doc.y;
    yy = Math.max(yy, doc.page.margins.top + 120);
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

  const needPage = (nextY) => nextY > (doc.page.height - doc.page.margins.bottom - 120);

  items.forEach((it) => {
    const qty = Number(it.qty || 0);
    const netWeight = Number(it.net_weight || 0);
    const unitPrice = Number(it.unit_price || 0);
    const total = (it.total != null) ? Number(it.total) : unitPrice * qty;

    totalItems += qty;
    totalFinal += total;

    if (needPage(y + rowHeight)) {
      doc.addPage();
      drawHeaderIfPageBreak();
    }

    let xx = left;
    const cells = [
      String(it.product_id ?? ""),
      String(it.product_name ?? ""),
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

  return { y: y + 20, totalFinal, totalItems };
}

function drawFooter(doc, remit, y, totalFinal, totalItems) {
  const left = 50;

  doc.font("Helvetica-Bold").fontSize(10);
  doc.text(`TOTAL ÍTEMS: ${fmtQty(totalItems ?? remit.total_items ?? 0)}`, left, y);
  y += 16;
  doc.text(`TOTAL $: ${fmtMoney(totalFinal ?? remit.total_amount ?? 0)}`, left, y);

  if (remit.note) {
    y += 18;
    doc.font("Helvetica-Bold").text("OBSERVACIONES", left, y);
    y += 14;
    doc.font("Helvetica").text(remit.note, left, y, { width: 360 });
  }

  const boxY = y + 24;
  doc.roundedRect(370, boxY, 175, 70, 6).strokeColor("#b8c6d8").lineWidth(1).stroke();
  doc.font("Helvetica").text("Recibí Conforme", 380, boxY + 8);
}

async function streamRemitPdfById(req, res) {
  try {
    const { id } = req.params;
    const remit = await FinalRemit.findByPk(id);
    if (!remit) return res.status(404).json({ ok: false, msg: "Remito no encontrado" });

    const items = await FinalRemitProduct.findAll({
      where: { final_remit_id: id },
      order: [["id", "ASC"]],
    });

    const rows = items.map((i) => ({
      product_id: i.product_id,
      product_name: i.product_name,
      unit_measure: i.unit_measure || "-",
      qty: Number(i.qty || 0),
      net_weight: Number(i.net_weight || 0),
      unit_price: Number(i.unit_price || 0),
      total: Number(i.unit_price || 0) * Number(i.qty || 0),
    }));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=remito_${remit.receipt_number}.pdf`);

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(res);

    const startY = drawHeader(doc, remit.toJSON());
    const { y: afterY, totalFinal, totalItems } = drawTable(doc, rows, startY);
    drawFooter(doc, remit.toJSON(), afterY, totalFinal, totalItems);

    doc.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, msg: "Error al generar PDF" });
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
  let totalItems = 0;
  let totalAmount = 0;

  for (const l of lines) {
    const unit_price = Number(l.product_price || 0);

    const priceRow = await PriceListProduct.findOne({
      where: { product_id: String(l.product_id) },
      order: [["id", "ASC"]],
    });

    const unit_measure = priceRow?.unidad_venta || null;

    const headers = await CutsHeader.findAll({
      where: { receipt_number: orderId, product_code: String(l.product_id) },
      include: [{ model: CutsDetail, as: "details" }],
      order: [["id", "ASC"]],
    });

    let units_count = 0;
    let net_weight = 0;

    for (const h of headers) {
      for (const d of (h.details || [])) {
        units_count += Number(d.units_count || 0);
        net_weight += Number(d.net_weight || 0);
      }
    }

    const qty = unit_measure === "KG" ? net_weight : units_count;

    items.push({
      product_id: l.product_id ?? null,
      product_name: l.product_name,
      unit_measure: unit_measure || "-",
      qty,
      net_weight,
      unit_price,
      total: unit_price * qty,
    });

    totalItems += Number(qty || 0);
    totalAmount += unit_price * Number(qty || 0);
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
    const { y: afterY, totalFinal, totalItems } = drawTable(doc, items, startY);
    drawFooter(doc, { ...header, total_amount: totalFinal }, afterY, totalFinal, totalItems);

    doc.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, msg: "Error al generar PDF" });
  }
}



const saleApiController = {
    getRemitPdf: streamRemitPdfById,
    getRemitPdfByOrder: streamRemitPdfByOrder,
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
                    product_id: prod.id,
                    product_name: prod.name,
                    unidad_venta: prod.unidad_venta, // "UN" o "KG"
                    costo: prod.costo,
                    precio_sin_iva: prod.precio_sin_iva,
                    precio_con_iva: prod.precio_con_iva
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



    getRemitControlState: async (req, res) => {
        try {
            const { id } = req.params;


            const order = await NewOrder.findByPk(id);
            if (!order) return res.status(404).json({ ok: false, msg: "Orden no encontrada" });


            const lines = await ProductsSellOrder.findAll({
                where: { sell_order_id: id },
                order: [["id", "ASC"]],
            });


            const items = [];
            for (const l of lines) {

                const priceRow = await PriceListProduct.findOne({
                    where: { product_id: String(l.product_id) },
                    order: [["id", "ASC"]],
                });


                const headerRows = await CutsHeader.findAll({
                    where: { receipt_number: id, product_code: String(l.product_id) },
                    include: [{ model: CutsDetail, as: "details" }],
                    order: [["id", "ASC"]],
                });

                let units_count = 0;
                let net_weight = 0;

                for (const h of headerRows) {
                    for (const d of (h.details || [])) {
                        units_count += Number(d.units_count || 0);
                        net_weight += Number(d.net_weight || 0);
                    }
                }

                items.push({
                    product_id: l.product_id,
                    product_name: l.product_name,
                    unidad_venta: priceRow?.unidad_venta || null,
                    units_count,
                    net_weight,
                });
            }

            // Armamos el header que espera el front
            const header = {
                receipt_number: order.id,
                date_order: order.date_order,
                client_name: order.client_name,
                salesman_name: order.salesman_name,
                price_list: order.price_list,
                sell_condition: order.sell_condition,
                payment_condition: order.payment_condition,
            };

            return res.json({ ok: true, header, items });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, msg: "Error en preview de remito" });
        }
    },

    createRemitFromOrder: async (req, res) => {
        const { id } = req.params;
        const { generated_by, note } = req.body;

        // 1) Validación simple
        if (!['system', 'afip'].includes(String(generated_by))) {
            return res.status(400).json({ ok: false, msg: "generated_by inválido" });
        }

        // 2) Chequeo de duplicado sin transacción
        const existing = await FinalRemit.findOne({ where: { order_id: id } });
        if (existing) {
            return res.status(409).json({
                ok: false,
                msg: "La orden ya tiene un remito generado.",
                remit_id: existing.id,
            });
        }

        // 3) Transacción
        const t = await sequelize.transaction();
        try {
            const order = await NewOrder.findByPk(id, { transaction: t });
            if (!order) {
                await t.rollback();
                return res.status(404).json({ ok: false, msg: "Orden no encontrada" });
            }

            const lines = await ProductsSellOrder.findAll({
                where: { sell_order_id: id },
                order: [["id", "ASC"]],
                transaction: t,
            });

            if (!lines.length) {
                await t.rollback();
                return res.status(400).json({ ok: false, msg: "La orden no tiene productos" });
            }

            const totalItems = lines.reduce(
                (a, l) => a + Number(l.product_quantity || 0),
                0
            );
            const totalAmount = lines.reduce(
                (a, l) =>
                    a + Number(l.product_quantity || 0) * Number(l.product_price || 0),
                0
            );

            const remit = await FinalRemit.create(
                {
                    order_id: order.id,
                    receipt_number: order.id,
                    client_name: order.client_name,
                    salesman_name: order.salesman_name,
                    price_list: order.price_list,
                    sell_condition: order.sell_condition,
                    payment_condition: order.payment_condition,
                    generated_by: String(generated_by),
                    note: (note || "").trim(),
                    total_items: totalItems,
                    total_amount: totalAmount,
                },
                { transaction: t }
            );

            const detailRows = [];

            for (const l of lines) {
                const priceRow = await PriceListProduct.findOne({
                    where: { product_id: String(l.product_id) },
                    order: [["id", "ASC"]],
                    transaction: t,
                });

                const headers = await CutsHeader.findAll({
                    where: { receipt_number: id, product_code: String(l.product_id) },
                    include: [{ model: CutsDetail, as: "details" }],
                    transaction: t,
                });

                let units_count = 0;
                let gross_weight = 0;
                let net_weight = 0;

                for (const h of headers) {
                    for (const d of h.details || []) {
                        units_count += Number(d.units_count || 0);
                        gross_weight += Number(d.gross_weight || 0);
                        net_weight += Number(d.net_weight || 0);
                    }
                }

                const avg_weight = units_count > 0 ? net_weight / units_count : 0;
                const unit_measure = priceRow?.unidad_venta || null;

                // Si la unidad es KG, la cantidad del remito suele ser el peso neto;
                // si es UN, la cantidad son las piezas pesadas.
                const qty = unit_measure === "KG" ? net_weight : units_count;

                detailRows.push({
                    final_remit_id: remit.id,
                    product_id: l.product_id ?? null,
                    product_name: l.product_name,
                    unit_price: Number(l.product_price || 0),
                    qty,
                    unit_measure,     // UN | KG
                    gross_weight,
                    net_weight,
                    avg_weight,
                });
            }

            if (detailRows.length) {
                await FinalRemitProduct.bulkCreate(detailRows, { transaction: t });
            }

            await t.commit();
            return res.status(201).json({ ok: true, remit_id: remit.id });
        } catch (e) {
            console.error(e);
            await t.rollback();
            return res.status(500).json({ ok: false, msg: "Error al crear remito" });
        }
    },






}

module.exports = saleApiController;