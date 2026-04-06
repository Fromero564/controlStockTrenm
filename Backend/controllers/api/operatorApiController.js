const path = require("path");
const db = require("../../src/config/models");

const sequelize = db.sequelize;
const { Op, fn, col, where, QueryTypes } = require("sequelize");

const moment = require("moment");
const { stringify } = require("querystring");

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
const MeatIncomeManualWeight = db.MeatIncomeManualWeight;
const ProductionProcessSubproduction = db.ProductionProcessSubproduction;
const CamaraManualCut = db.CamaraManualCut;
const CamaraRomaneoCut = db.CamaraRomaneoCut;

const getRomaneoRowsDisponibles = async (billId, transaction) => {
  const romaneoRows = await billDetail.findAll({
    where: { bill_supplier_id: billId },
    transaction,
  });

  const camaraRows = await sequelize.query(
    `SELECT unique_code
     FROM camara_romaneo_cuts
     WHERE bill_supplier_id = ?`,
    {
      replacements: [billId],
      type: QueryTypes.SELECT,
      transaction,
    }
  );

  const camaraSet = new Set(
    (camaraRows || [])
      .map((r) => (r.unique_code || "").trim())
      .filter(Boolean)
  );

  return romaneoRows.filter((row) => {
    const uc = (row.unique_code || "").trim();

    if (!uc) return true;
    return !camaraSet.has(uc);
  });
};

const operatorApiController = {
    getAllOtherProductsManual: async (req, res) => {
        try {
            const allOtherProducts = await OtherProductManual.findAll({});
            res.json(allOtherProducts)
        } catch (error) {
            console.error("Error al obtener los productos congelados/otros cargados de forma manual:", error);
            res.status(500).json({ error: "Error al obtener los productos congelados/otros cargados de forma manual" })
        }
    },
    getAllProductCatagories: async (req, res) => {

        try {
            const allProductsCategories = await ProductCategories.findAll({});
            res.json(allProductsCategories)
        } catch (error) {
            console.error("Error al obtener categorías:", error);
            res.status(500).json({ error: "No se pueden cargar las categorias" })
        }
    },
    loadNewCategory: async (req, res) => {
        const { category_name } = req.body;

        // Validación: que venga un nombre
        if (!category_name || category_name.trim() === "") {
            return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
        }

        // Formateo del nombre a mayúsculas
        const formattedName = category_name.trim().toUpperCase();

        try {
            // Crear directamente sin verificar duplicado
            await ProductCategories.create({
                category_name: formattedName
            });

            res.status(201).json({ message: "Categoría creada correctamente" });

        } catch (error) {
            console.error("Error al crear categoría:", error);
            res.status(500).json({ error: "No se pudo crear la categoría" });
        }
    },
    getProductStock: async (req, res) => {
        try {
            const AllProductStock = await ProductStock.findAll({
                include: [
                    {
                        model: ProductsAvailable,
                        as: "productAvailable",
                        attributes: ["min_stock", "max_stock", "unit_measure"],
                    },
                ],
            });

            const result = AllProductStock.map((stock) => {
                const unitFromProduct =
                    stock.productAvailable && stock.productAvailable.unit_measure
                        ? String(stock.productAvailable.unit_measure).toUpperCase()
                        : "UN";

                // Unidad base del producto: UN o KG (viene desde products_available)
                const unit_type = unitFromProduct === "KG" ? "KG" : "UN";

                return {
                    id: stock.id,
                    product_name: stock.product_name,
                    product_quantity: stock.product_quantity,
                    product_cod: stock.product_cod,
                    product_category: stock.product_category,
                    product_total_weight: stock.product_total_weight,
                    min_stock: stock.productAvailable?.min_stock || 0,
                    max_stock: stock.productAvailable?.max_stock || 0,
                    unit_type, // 👈 esto usa el front para saber si trabajar en KG o UN
                };
            });

            res.json(result);
        } catch (error) {
            console.error("Error al obtener los productos", error);
            res.status(500).json({ error: "Error al obtener los productos" });
        }
    },



    loadLastBillSupplier: async (req, res) => {
        try {
            const ultimoRegistro = await billSupplier.findOne({
                order: [['id', 'DESC']],
            });

            res.json(ultimoRegistro);
        } catch (error) {
            console.error("Error al obtener el último registro:", error);
            res.status(500).json({ error: "Error al obtener el último registro" });
        }

    },
    stockAvailable: async (req, res) => {
        try {
            const billDetailProductos = await billDetail.findAll({
                attributes: ['type', 'quantity'],
                raw: true
            });

            const processMeat = await ProcessMeat.findAll({
                attributes: ['type', 'quantity'],
                raw: true
            });


            const allProducts = [...billDetailProductos, ...processMeat];


            const grouped = allProducts.reduce((acc, item) => {
                if (!acc[item.type]) {
                    acc[item.type] = 0;
                }
                acc[item.type] += item.quantity;
                return acc;
            }, {});


            const result = Object.entries(grouped).map(([type, quantity]) => ({
                type,
                quantity
            }));

            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el stock disponible' });
        }

    },
    alltares: async (req, res) => {
        try {
            const alltares = await tare.findAll({});
            res.json(alltares);
        } catch (error) {
            console.error("Error al obtener Taras:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }


    },
    tareLoad: async (req, res) => {
        const { tareName, tareWeight } = req.body;

        if (!tareName || !tareWeight) {
            return res.status(400).json({ message: "Faltan campos obligatorios." });
        }

        await tare.create({
            tare_name: tareName,
            tare_weight: tareWeight,
        })

        return res.status(201).json({ mensaje: "Todos los productos fueron cargados correctamente." });


    },
    tareLoadFind: async (req, res) => {
        try {
            const { id } = req.params;

            const taraEncontrada = await tare.findOne({
                where: { id: id },
            });



            if (!taraEncontrada) {
                return res.status(404).json({ message: "Tara no encontrada" });
            }

            return res.status(200).json(taraEncontrada);
        } catch (error) {
            console.error("Error al buscar tara:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },
    editTare: async (req, res) => {
        const { id } = req.params;
        const { tareName, tareWeight } = req.body;

        try {
            const [updated] = await tare.update(
                {
                    tare_name: tareName,
                    tare_weight: tareWeight,
                },
                {
                    where: { id: id }
                }
            );

            if (updated === 0) {
                return res.status(404).json({ message: "Tara no encontrada o sin cambios." });
            }

            return res.json({ message: "Tara actualizada correctamente." });
        } catch (error) {
            console.error("Error al actualizar tara:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },
    deleteTare: async (req, res) => {
        const { id } = req.params;

        try {
            const eliminado = await tare.destroy({
                where: { id: id }
            });

            if (eliminado === 0) {
                return res.status(404).json({ message: "Tara no encontrada." });
            }

            return res.json({ message: "Tara eliminada correctamente." });
        } catch (error) {
            console.error("Error al eliminar tara:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },
 uploadProducts: async (req, res) => {
  try {
    const {
      proveedor,
      pesoTotal,
      cabezas,
      romaneo,
      tipoIngreso,
      cantidad,
      cortes = [],
      congelados = [],
      fresh_quantity,
      fresh_weight,
    } = req.body;

    if (!proveedor || pesoTotal == null || cabezas == null || !romaneo) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }
    if (!["romaneo", "manual"].includes(tipoIngreso)) {
      return res.status(400).json({ message: "Tipo de ingreso inválido." });
    }
    if (
      tipoIngreso === "romaneo" &&
      cortes.length === 0 &&
      congelados.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Debe proporcionar al menos un corte o un congelado." });
    }

    // Helpers
    const toNumberSafe = (v, def = 0) => {
      if (v === null || v === undefined || v === "") return def;
      const n = Number(v);
      return Number.isFinite(n) ? n : def;
    };

    // 👇 Si no viene identification_product desde el front, usamos el romaneo como "tropa/identificación"
    const resolveIdentification = (val) => {
      if (val === null || val === undefined || val === "") return toNumberSafe(romaneo, 0);
      const n = Number(val);
      return Number.isFinite(n) ? n : toNumberSafe(romaneo, 0);
    };

    const resolveUniqueCode = (obj) => {
      const v =
        obj?.unique_code ??
        obj?.uniqueCode ??
        obj?.codigo_unico ??
        obj?.codigoUnico ??
        null;
      return typeof v === "string" && v.trim() ? v.trim() : null;
    };

    const nuevoRegistro = await billSupplier.create({
      supplier: proveedor,
      date_bill_supplier: new Date(),
      total_weight: toNumberSafe(pesoTotal, 0),
      head_quantity: toNumberSafe(cabezas, 0),
      income_state: tipoIngreso,
      check_state: tipoIngreso === "romaneo",
      romaneo_number: toNumberSafe(romaneo, 0),
      quantity: toNumberSafe(cantidad, 0),
      fresh_quantity: toNumberSafe(fresh_quantity, 0),
      fresh_weight: toNumberSafe(fresh_weight, 0),
    });

    // =========================
    // CORTES (bill_details)
    // =========================
    if (Array.isArray(cortes) && cortes.length) {
      for (const corte of cortes) {
        const nombre =
          corte?.nombre ?? corte?.tipo ?? corte?.type ?? "";
        const qty =
          corte?.cantidad ?? corte?.quantity ?? 0;
        const heads =
          corte?.cabezas ?? corte?.heads ?? 0;
        const pesoRomaneo =
          corte?.pesoRomaneo ?? corte?.peso ?? corte?.weight ?? 0;

        const cod = corte?.cod ?? null;
        const categoria = corte?.categoria ?? null;

        const identification_product = resolveIdentification(
          corte?.identification_product
        );

        const unique_code = resolveUniqueCode(corte);

        await billDetail.create({
          bill_supplier_id: nuevoRegistro.id,
          type: String(nombre).trim(),
          quantity: toNumberSafe(qty, 0),
          heads: toNumberSafe(heads, 0),
          weight: toNumberSafe(pesoRomaneo, 0),
          identification_product,
          unique_code, // ✅ NUEVO
        });

        if (tipoIngreso === "romaneo" && (corte?.aCamara || corte?.a_camara)) {
          await sequelize.query(
            `INSERT INTO camara_romaneo_cuts
              (bill_supplier_id, product_name, quantity, heads, romaneo_weight, garron_number, unique_code, a_camara, created_at, updated_at)
             VALUES
              (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
             ON DUPLICATE KEY UPDATE
              product_name=VALUES(product_name),
              quantity=VALUES(quantity),
              heads=VALUES(heads),
              romaneo_weight=VALUES(romaneo_weight),
              garron_number=VALUES(garron_number),
              a_camara=1,
              updated_at=NOW()`,
            {
              replacements: [
                nuevoRegistro.id,
                String(nombre).trim(),
                toNumberSafe(qty, 0),
                toNumberSafe(heads, 0),
                toNumberSafe(pesoRomaneo, 0),
                toNumberSafe(identification_product, 0),
                unique_code,
              ],
              type: QueryTypes.INSERT,
            }
          );
        }

        // impactar stock SOLO si es ROMANEO
        if (tipoIngreso === "romaneo") {
          const existing = await ProductStock.findOne({
            where: { product_name: String(nombre).trim() },
          });

          if (existing) {
            existing.product_quantity += toNumberSafe(qty, 0);
            existing.product_total_weight += toNumberSafe(pesoRomaneo, 0);
            await existing.save();
          } else {
            await ProductStock.create({
              product_name: String(nombre).trim(),
              product_quantity: toNumberSafe(qty, 0),
              product_total_weight: toNumberSafe(pesoRomaneo, 0),
              product_cod: cod || null,
              product_category: categoria || null,
            });
          }
        }
      }
    }

    // =========================
    // CONGELADOS (bill_details)
    // =========================
    if (Array.isArray(congelados) && congelados.length) {
      for (const cong of congelados) {
        const tipo =
          cong?.tipo ?? cong?.nombre ?? cong?.type ?? "";
        const qty =
          cong?.cantidad ?? cong?.quantity ?? 0;
        const unidades =
          cong?.unidades ?? cong?.peso ?? cong?.weight ?? 0;

        const cod = cong?.cod ?? null;
        const categoria = cong?.categoria ?? null;

        const identification_product = resolveIdentification(
          cong?.identification_product
        );

        const unique_code = resolveUniqueCode(cong);

        await billDetail.create({
          bill_supplier_id: nuevoRegistro.id,
          type: String(tipo).trim(),
          quantity: toNumberSafe(qty, 0),
          heads: 0,
          weight: toNumberSafe(unidades, 0),
          identification_product,
          unique_code, // ✅ NUEVO
        });

        // impactar stock SOLO si es ROMANEO
        if (tipoIngreso === "romaneo") {
          const existing = await ProductStock.findOne({
            where: { product_name: String(tipo).trim() },
          });

          if (existing) {
            existing.product_quantity += toNumberSafe(qty, 0);
            existing.product_total_weight += toNumberSafe(unidades, 0);
            await existing.save();
          } else {
            await ProductStock.create({
              product_name: String(tipo).trim(),
              product_quantity: toNumberSafe(qty, 0),
              product_total_weight: toNumberSafe(unidades, 0),
              product_cod: cod || null,
              product_category: categoria || null,
            });
          }
        }
      }
    }

    return res
      .status(201)
      .json({ id: nuevoRegistro.id, romaneo: nuevoRegistro.romaneo_number });
  } catch (error) {
    console.error("Error al cargar datos:", error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
},



updateProviderBill: async (req, res) => {
  try {
    const { id } = req.params;
    const {
      proveedor,
      pesoTotal,
      romaneo,
      cabezas,
      cantidad,
      tipoIngreso,
      cortes = [],
      congelados = [],
    } = req.body;

    if (!proveedor || pesoTotal == null || cabezas == null || !romaneo) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const toNumberSafe = (v, def = 0) => {
      if (v === null || v === undefined || v === "") return def;
      const n = Number(v);
      return Number.isFinite(n) ? n : def;
    };

    const resolveIdentification = (val) => {
      if (val === null || val === undefined || val === "") return toNumberSafe(romaneo, 0);
      const n = Number(val);
      return Number.isFinite(n) ? n : toNumberSafe(romaneo, 0);
    };

    const resolveUniqueCode = (obj) => {
      const v =
        obj?.unique_code ??
        obj?.uniqueCode ??
        obj?.codigo_unico ??
        obj?.codigoUnico ??
        null;
      return typeof v === "string" && v.trim() ? v.trim() : null;
    };

    // leer estado anterior para saber si había impactado stock
    const previo = await billSupplier.findOne({ where: { id } });
    const previoEraRomaneo = previo?.income_state === "romaneo";

    // si ANTES era romaneo, revertimos stock de los bill_details previos
    if (previoEraRomaneo) {
      const detallesPrevios = await billDetail.findAll({
        where: { bill_supplier_id: id },
      });

      for (const det of detallesPrevios) {
        const stock = await ProductStock.findOne({
          where: { product_name: det.type },
        });
        if (stock) {
          stock.product_quantity -= toNumberSafe(det.quantity, 0);
          stock.product_total_weight -= toNumberSafe(det.weight, 0);
          if (stock.product_quantity < 0) stock.product_quantity = 0;
          if (stock.product_total_weight < 0) stock.product_total_weight = 0;
          await stock.save();
        }
      }
    }

    // borrar todos los detalles para recrearlos
    await billDetail.destroy({ where: { bill_supplier_id: id } });

    await sequelize.query(
      "DELETE FROM camara_romaneo_cuts WHERE bill_supplier_id = ?",
      { replacements: [id], type: QueryTypes.DELETE }
    );

    // actualizar cabecera
    await billSupplier.update(
      {
        supplier: proveedor,
        total_weight: toNumberSafe(pesoTotal, 0),
        head_quantity: toNumberSafe(cabezas, 0),
        quantity: toNumberSafe(cantidad, 0),
        romaneo_number: toNumberSafe(romaneo, 0),
        income_state: tipoIngreso,
        check_state: tipoIngreso === "romaneo",
      },
      { where: { id } }
    );

    const esRomaneoNuevo = tipoIngreso === "romaneo";

    // CORTES: crear detalle siempre; impactar stock solo si romaneo
    for (const corte of cortes) {
      const rawTipo = corte?.tipo ?? corte?.nombre ?? corte?.type ?? "";
      const cant = corte?.cantidad ?? corte?.quantity ?? 0;
      const head = corte?.cabezas ?? corte?.heads ?? 0;
      const pesoRomaneo = corte?.pesoRomaneo ?? corte?.peso ?? corte?.weight ?? 0;

      const cod = corte?.cod ?? null;
      const categoria = corte?.categoria ?? null;

      let nombreProducto = rawTipo;

      // si viene un ID numérico, lo resolvemos a nombre
      if (!isNaN(rawTipo) && rawTipo !== "") {
        const prod = await ProductsAvailable.findByPk(rawTipo);
        if (prod) nombreProducto = prod.product_name;
      }

      const identification_product = resolveIdentification(
        corte?.identification_product
      );

      const unique_code = resolveUniqueCode(corte);

      await billDetail.create({
        bill_supplier_id: id,
        type: String(nombreProducto).trim(),
        quantity: toNumberSafe(cant, 0),
        heads: toNumberSafe(head, 0),
        weight: toNumberSafe(pesoRomaneo, 0),
        identification_product,
        unique_code, // ✅ NUEVO
      });

      if (esRomaneoNuevo && (corte?.aCamara || corte?.a_camara)) {
        await sequelize.query(
          `INSERT INTO camara_romaneo_cuts
            (bill_supplier_id, product_name, quantity, heads, romaneo_weight, garron_number, unique_code, a_camara, created_at, updated_at)
           VALUES
            (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
           ON DUPLICATE KEY UPDATE
            product_name=VALUES(product_name),
            quantity=VALUES(quantity),
            heads=VALUES(heads),
            romaneo_weight=VALUES(romaneo_weight),
            garron_number=VALUES(garron_number),
            a_camara=1,
            updated_at=NOW()`,
          {
            replacements: [
              id,
              String(nombreProducto).trim(),
              toNumberSafe(cant, 0),
              toNumberSafe(head, 0),
              toNumberSafe(pesoRomaneo, 0),
              toNumberSafe(identification_product, 0),
              unique_code,
            ],
            type: QueryTypes.INSERT,
          }
        );
      }

      if (esRomaneoNuevo) {
        const stock = await ProductStock.findOne({
          where: { product_name: String(nombreProducto).trim() },
        });
        if (stock) {
          stock.product_quantity += toNumberSafe(cant, 0);
          stock.product_total_weight += toNumberSafe(pesoRomaneo, 0);
          await stock.save();
        } else {
          await ProductStock.create({
            product_name: String(nombreProducto).trim(),
            product_quantity: toNumberSafe(cant, 0),
            product_total_weight: toNumberSafe(pesoRomaneo, 0),
            product_cod: cod || null,
            product_category: categoria || null,
          });
        }
      }
    }

    // CONGELADOS: crear detalle siempre; impactar stock solo si romaneo
    for (const cong of congelados) {
      const tipo = cong?.tipo ?? cong?.nombre ?? cong?.type ?? "";
      const cant = cong?.cantidad ?? cong?.quantity ?? 0;
      const unidades = cong?.unidades ?? cong?.peso ?? cong?.weight ?? 0;

      const cod = cong?.cod ?? null;
      const categoria = cong?.categoria ?? null;

      const identification_product = resolveIdentification(
        cong?.identification_product
      );

      const unique_code = resolveUniqueCode(cong);

      await billDetail.create({
        bill_supplier_id: id,
        type: String(tipo).trim(),
        quantity: toNumberSafe(cant, 0),
        heads: 0,
        weight: toNumberSafe(unidades, 0),
        identification_product,
        unique_code, // ✅ NUEVO
      });

      if (esRomaneoNuevo) {
        const stock = await ProductStock.findOne({
          where: { product_name: String(tipo).trim() },
        });
        if (stock) {
          stock.product_quantity += toNumberSafe(cant, 0);
          stock.product_total_weight += toNumberSafe(unidades, 0);
          await stock.save();
        } else {
          await ProductStock.create({
            product_name: String(tipo).trim(),
            product_quantity: toNumberSafe(cant, 0),
            product_total_weight: toNumberSafe(unidades, 0),
            product_cod: cod || null,
            product_category: categoria || null,
          });
        }
      }
    }

    return res
      .status(200)
      .json({ message: "Registro actualizado correctamente.", id });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
},






    viewAllObservationMeatIncome: async (req, res) => {
        try {
            let ObservacionesMeatIncome = await ObservationsMeatIncome.findAll({})
            res.json(ObservacionesMeatIncome)
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener observaciones disponibles' });
        }
    },

    updateObservationMeatIncome: async (req, res) => {
        const { id } = req.params;
        const { observation } = req.body;

        try {
            const resultado = await ObservationsMeatIncome.update(
                { observation: observation },
                { where: { id: id } }
            );

            res.status(200).json({ mensaje: "Observación actualizada correctamente", resultado });
        } catch (error) {
            console.error("Error al actualizar observación:", error);
            res.status(500).json({ mensaje: "Error al actualizar observación" });
        }
    },

    createObservation: async (req, res) => {
        try {
            const { remitoId, observation } = req.body;

            // Validación mínima
            if (!remitoId) {
                return res.status(400).json({ error: "remitoId es obligatorio" });
            }

            // Crear la observación
            const nuevaObservacion = await ObservationsMeatIncome.create({
                id: remitoId,
                observation: observation ?? "",
            });

            return res.status(201).json(nuevaObservacion);
        } catch (error) {
            console.error("Error al crear observación:", error);
            return res.status(500).json({ error: "Error interno al crear la observación" });
        }
    },

  updateProductFromRemit: async (req, res) => {
    const { id } = req.params;

    try {
        const cortes = await meatIncome.findAll({
            where: { id_bill_suppliers: id },
            order: [["id", "ASC"]],
        });

        const cortesCamara = await CamaraManualCut.findAll({
            where: { bill_supplier_id: id },
            attributes: ["id", "unique_code", "product_name", "garron"],
        });

        const observacionData = await ObservationsMeatIncome.findOne({
            where: { id: id },
        });

        const setUniqueCodesCamara = new Set(
            (cortesCamara || [])
                .map((item) => (item.unique_code || "").trim())
                .filter(Boolean)
        );

        const cortesFormateados = cortes.map((item) => {
            const uniqueCode = (item.unique_code || "").trim();

            let estaEnCamara = false;

            if (uniqueCode) {
                estaEnCamara = setUniqueCodesCamara.has(uniqueCode);
            } else {
                // fallback por si algún registro viejo no tiene unique_code
                estaEnCamara = cortesCamara.some(
                    (cam) =>
                        String(cam.product_name || "").trim() === String(item.products_name || "").trim() &&
                        String(cam.garron || "").trim() === String(item.products_garron || "").trim()
                );
            }

            return {
                id: item.id,
                products_name: item.products_name,
                product_head: item.product_head,
                products_quantity: item.products_quantity,
                provider_weight: item.provider_weight,
                gross_weight: item.gross_weight,
                tare: item.tare,
                net_weight: item.net_weight,
                products_garron: item.products_garron,
                unique_code: item.unique_code,
                aCamara: estaEnCamara,
            };
        });

        res.json({
            cortes: cortesFormateados,
            observacion: {
                id: observacionData?.id || null,
                texto: observacionData?.observation || "",
            },
        });
    } catch (error) {
        console.error("Error al obtener los datos del remito:", error);
        res.status(500).json({ error: "Error al obtener los datos del remito" });
    }
},
    updateBillSupplier: async (req, res) => {
        const { id } = req.params;
        const {
            cantidad_animales_cargados,
            cantidad_cabezas_cargadas,
            peso_total_neto_cargado,
            fresh_quantity,
            fresh_weight,
        } = req.body;

        try {
            // ✅ 1) Guardar/actualizar el peso manual SIN DUPLICAR (NO usar upsert)
            if (peso_total_neto_cargado != null) {
                const total = Number(
                    peso_total_neto_cargado.toFixed
                        ? peso_total_neto_cargado.toFixed(2)
                        : peso_total_neto_cargado
                );

                const existing = await MeatIncomeManualWeight.findOne({
                    where: { bill_supplier_id: id },
                });

                if (existing) {
                    await existing.update({ total_weight: total });
                } else {
                    await MeatIncomeManualWeight.create({
                        bill_supplier_id: id,
                        total_weight: total,
                    });
                }
            }

            // ✅ 2) Actualizar datos del billSupplier (igual que lo tenías)
            const updateData = {};
            if (cantidad_animales_cargados != null) updateData.quantity = cantidad_animales_cargados;
            if (cantidad_cabezas_cargadas != null) updateData.head_quantity = cantidad_cabezas_cargadas;
            if (fresh_quantity != null) updateData.fresh_quantity = fresh_quantity;
            if (fresh_weight != null) updateData.fresh_weight = fresh_weight;

            if (Object.keys(updateData).length > 0) {
                await billSupplier.update(updateData, { where: { id } });
            }

            return res.json({ ok: true });
        } catch (err) {
            console.error("updateBillSupplier error:", err);
            return res.status(500).json({ error: "Error actualizando datos" });
        }
    },
uploadProductsProcess: async (req, res) => {
    let t;

    try {
        const { cortes = [], bill_ids = [], subproduction = [] } = req.body;

        if (!Array.isArray(cortes) || cortes.length === 0) {
            return res.status(400).json({
                message: "Debe enviar al menos un corte del proceso.",
            });
        }

        const hasBills = Array.isArray(bill_ids) && bill_ids.length > 0;
        const hasSubproduction =
            Array.isArray(subproduction) &&
            subproduction.some(
                (s) => Number(s.quantity || 0) > 0 || Number(s.weight || 0) > 0
            );

        if (!hasBills && !hasSubproduction) {
            return res.status(400).json({
                message: "Debe asociar al menos un comprobante o cargar subproducción.",
            });
        }

        const esTextoValido = (v) =>
            typeof v === "string" && v.trim().length > 0;

        const toNumero = (v, defecto = 0) => {
            if (v === null || v === undefined || v === "") return defecto;
            const n = Number(v);
            return Number.isFinite(n) ? n : defecto;
        };

        const normalizarNombre = (v) => String(v || "").trim();

        t = await sequelize.transaction();

        // =========================================================
        // 1) Obtener / generar número de proceso
        // =========================================================
        const ultimoProceso = await ProcessNumber.findOne({
            order: [["process_number", "DESC"]],
            transaction: t,
        });

        const nuevoProcessNumber = ultimoProceso
            ? Number(ultimoProceso.process_number) + 1
            : 1;

        // =========================================================
        // 2) Asociar comprobantes al proceso
        // =========================================================
        const validBillIds = (Array.isArray(bill_ids) ? bill_ids : [])
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id) && id > 0);

        if (hasBills && !validBillIds.length) {
            await t.rollback();
            return res.status(400).json({
                message: "Los comprobantes enviados no son válidos.",
            });
        }

        for (const bill_id of validBillIds) {
            await ProcessNumber.create(
                {
                    bill_id,
                    process_number: nuevoProcessNumber,
                },
                { transaction: t }
            );
        }

        // =========================================================
        // 3) Guardar cortes resultantes y SUMAR al stock general
        // =========================================================
        for (const corte of cortes) {
            const {
                type,
                description,
                unit_type,
                quantity,
                net_weight,
                head_count,
                romaneo_weight,
                average,
                gross_weight,
                tares,
            } = corte;

            if (!esTextoValido(type)) {
                await t.rollback();
                return res.status(400).json({
                    message: "Falta el tipo de corte (type) o es inválido.",
                });
            }

            const qtyNum = toNumero(quantity, 0);
            const netNum = toNumero(net_weight, 0);
            const avgNum = toNumero(average, 0);
            const grossNum = toNumero(gross_weight, 0);
            const taresNum = toNumero(tares, 0);
            const headCountNum = toNumero(head_count, 0);
            const romaneoNum = toNumero(romaneo_weight, 0);

            if (netNum <= 0) {
                await t.rollback();
                return res.status(400).json({
                    message: `El peso neto del corte "${type}" debe ser mayor a 0.`,
                });
            }

            let baseProduct = null;
            let productName = null;

            if (!Number.isNaN(Number(type))) {
                baseProduct = await ProductsAvailable.findByPk(Number(type), {
                    include: [
                        {
                            model: ProductCategories,
                            as: "category",
                            attributes: ["category_name"],
                        },
                    ],
                    transaction: t,
                });

                if (!baseProduct) {
                    await t.rollback();
                    return res.status(400).json({
                        message: `No se encontró ningún producto con ID ${type}.`,
                    });
                }

                productName = normalizarNombre(baseProduct.product_name);
            } else {
                baseProduct = await ProductsAvailable.findOne({
                    where: { product_name: normalizarNombre(type) },
                    include: [
                        {
                            model: ProductCategories,
                            as: "category",
                            attributes: ["category_name"],
                        },
                    ],
                    transaction: t,
                });

                if (!baseProduct) {
                    await t.rollback();
                    return res.status(400).json({
                        message: `No se pudo identificar el producto "${type}".`,
                    });
                }

                productName = normalizarNombre(baseProduct.product_name);
            }

            const finalDescription = esTextoValido(description)
                ? description.trim()
                : productName;

            const finalUnitType = esTextoValido(unit_type)
                ? unit_type.trim()
                : (baseProduct.unit_measure || baseProduct.unit_type || "unidad");

            await ProcessMeat.create(
                {
                    process_number: nuevoProcessNumber,
                    type: productName,
                    product_name: productName,
                    description: finalDescription,
                    unit_type: finalUnitType,
                    quantity: qtyNum,
                    net_weight: netNum,
                    head_count: headCountNum,
                    romaneo_weight: romaneoNum,
                    average: avgNum,
                    gross_weight: grossNum,
                    tares: taresNum,
                },
                { transaction: t }
            );

            let stockChild = await ProductStock.findOne({
                where: { product_name: productName },
                transaction: t,
            });

            if (stockChild) {
                await stockChild.update(
                    {
                        product_quantity:
                            toNumero(stockChild.product_quantity, 0) + qtyNum,
                        product_total_weight:
                            toNumero(stockChild.product_total_weight, 0) + netNum,
                    },
                    { transaction: t }
                );
            } else {
                await ProductStock.create(
                    {
                        product_name: productName,
                        product_quantity: qtyNum,
                        product_total_weight: netNum,
                        product_cod: baseProduct?.id || null,
                        product_category:
                            baseProduct?.category?.category_name ?? null,
                    },
                    { transaction: t }
                );
            }
        }

        // =========================================================
        // 4) Armar consumo de stock de productos origen por comprobantes
        // =========================================================
        const usageByParent = {};

        if (validBillIds.length > 0) {
            const bills = await billSupplier.findAll({
                where: { id: { [Op.in]: validBillIds } },
                attributes: ["id", "income_state"],
                transaction: t,
            });

            for (const bill of bills) {
                const billId = Number(bill.id);
                const tipoIngreso = bill.income_state;

                if (tipoIngreso === "manual") {
                    const manualRows = await meatIncome.findAll({
                        where: { id_bill_suppliers: billId },
                        transaction: t,
                    });

                    for (const row of manualRows) {
                        const name = normalizarNombre(row.products_name);
                        if (!name) continue;

                        if (!usageByParent[name]) {
                            usageByParent[name] = { qty: 0, weight: 0 };
                        }

                        usageByParent[name].qty += toNumero(row.products_quantity, 0);
                        usageByParent[name].weight += toNumero(row.net_weight, 0);
                    }
                } else {
                  const romaneoRows = await getRomaneoRowsDisponibles(billId, t);

                    for (const row of romaneoRows) {
                        const name = normalizarNombre(row.type);
                        if (!name) continue;

                        if (!usageByParent[name]) {
                            usageByParent[name] = { qty: 0, weight: 0 };
                        }

                        usageByParent[name].qty += toNumero(row.quantity, 0);
                        usageByParent[name].weight += toNumero(
                            row.weight ?? row.net_weight,
                            0
                        );
                    }
                }
            }
        }

        // =========================================================
        // 5) Agregar consumo por SUBPRODUCCIÓN manual
        // =========================================================
        const subRowsToCreate = [];

        for (const s of subproduction) {
            const cut_name = normalizarNombre(
                s.cut_name || s.tipo || s.producto || s.product_name
            );

            const quantityNum = toNumero(s.quantity ?? s.cantidad, 0);
            const weightNum = toNumero(
                s.weight ?? s.net_weight ?? s.peso ?? s.peso_neto,
                0
            );

            if (!cut_name) continue;
            if (quantityNum <= 0 && weightNum <= 0) continue;

            subRowsToCreate.push({
                process_number: nuevoProcessNumber,
                cut_name,
                quantity: quantityNum,
                weight: weightNum,
            });

            if (!usageByParent[cut_name]) {
                usageByParent[cut_name] = { qty: 0, weight: 0 };
            }

            usageByParent[cut_name].qty += quantityNum;
            usageByParent[cut_name].weight += weightNum;
        }

        // =========================================================
        // 6) Descontar stock total consumido
        // =========================================================
        for (const [parentName, used] of Object.entries(usageByParent)) {
            const stockParent = await ProductStock.findOne({
                where: { product_name: parentName },
                transaction: t,
            });

            if (!stockParent) continue;

            const currentQty = toNumero(stockParent.product_quantity, 0);
            const currentWeight = toNumero(stockParent.product_total_weight, 0);

            await stockParent.update(
                {
                    product_quantity: Math.max(0, currentQty - toNumero(used.qty, 0)),
                    product_total_weight: Math.max(
                        0,
                        currentWeight - toNumero(used.weight, 0)
                    ),
                },
                { transaction: t }
            );
        }

        // =========================================================
        // 7) Guardar subproducción
        // =========================================================
        if (subRowsToCreate.length > 0) {
            await ProductionProcessSubproduction.bulkCreate(subRowsToCreate, {
                transaction: t,
            });
        }

        // =========================================================
        // 8) Marcar comprobantes como procesados
        // =========================================================
        if (validBillIds.length > 0) {
            await billSupplier.update(
                { process_state: "procesado" },
                {
                    where: { id: { [Op.in]: validBillIds } },
                    transaction: t,
                }
            );
        }

        await t.commit();

        return res.status(201).json({
            ok: true,
            message: "Proceso productivo guardado correctamente.",
            process_number: nuevoProcessNumber,
        });
    } catch (error) {
        if (t) {
            try {
                await t.rollback();
            } catch {}
        }

        console.error("uploadProductsProcess error:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message,
        });
    }
},



    getAllSubproduction: async (req, res) => {
        try {
            const {
                process_number,                 // opcional: filtra por proceso
                limit,                          // opcional: paginado
                offset,                         // opcional: paginado
                order = "desc",                 // opcional: orden por id
            } = req.query;

            const where = {};
            if (process_number != null && process_number !== "") {
                where.process_number = Number(process_number);
            }

            const rows = await ProductionProcessSubproduction.findAll({
                where,
                order: [["id", String(order).toUpperCase() === "ASC" ? "ASC" : "DESC"]],
                ...(limit ? { limit: Number(limit) } : {}),
                ...(offset ? { offset: Number(offset) } : {}),
            });

            return res.json(rows);
        } catch (err) {
            console.error("getAllSubproduction error:", err);
            return res.status(500).json({ ok: false, message: "Error al obtener subproducción" });
        }
    },




chargeUpdateBillDetails: async (req, res) => {
  const { id } = req.params;

  try {
    const billSupplierUpdate = await billSupplier.findOne({ where: { id } });

    const billDetailsUpdate = await billDetail.findAll({
      where: { bill_supplier_id: id },
    });

    const camaraRows = await sequelize.query(
      "SELECT unique_code FROM camara_romaneo_cuts WHERE bill_supplier_id = ?",
      { replacements: [id], type: QueryTypes.SELECT }
    );

    const camaraSet = new Set(
      (camaraRows || [])
        .map((r) => (r.unique_code || "").trim())
        .filter(Boolean)
    );

    const detalles = billDetailsUpdate.map((det) => {
      const uc = (det.unique_code || "").trim();
      return {
        id: det.id,
        tipo: det.type,
        cantidad: det.quantity,
        cabezas: det.heads,
        peso: det.weight,
        pesoRomaneo: det.weight,
        identification_product: det.identification_product,
        unique_code: det.unique_code,
        aCamara: camaraSet.has(uc),
      };
    });

    const cortes = detalles.filter((d) => Number(d.cabezas || 0) > 0);
    const congelados = detalles.filter(
      (d) => Number(d.cabezas || 0) === 0 && Number(d.peso || 0) > 0
    );

    return res.json({
      proveedor: billSupplierUpdate.supplier,
      peso_total: billSupplierUpdate.total_weight,
      romaneo: billSupplierUpdate.romaneo_number,
      internal_number: billSupplierUpdate.id,
      tipo_ingreso: billSupplierUpdate.income_state,
      detalles: cortes,
      congelados,
    });
  } catch (err) {
    console.error("Error chargeUpdateBillDetails:", err);
    return res.status(500).json({ message: "Error al obtener datos del ingreso" });
  }
},




    allProducts: async (req, res) => {
        try {
            const rows = await billSupplier.findAll({
                include: [
                    {
                        model: MeatIncomeManualWeight,
                        as: "manualWeight",
                        attributes: ["total_weight"],
                    },
                ],
                order: [["createdAt", "DESC"]],
            });

            const data = rows.map((r) => {
                const j = r.toJSON();
                return {
                    ...j,
                    manual_weight: j.manualWeight?.total_weight ?? null,
                };
            });

            return res.json(data);
        } catch (err) {
            console.error("allProducts error:", err);
            return res.status(500).json({ error: "Error listando ingresos" });
        }
    },

addIncomeMeat: async (req, res) => {
    try {
        const Supplierid = req.params.id;
        const { cortes, observacion } = req.body;

        if (!Array.isArray(cortes) || cortes.length === 0) {
            return res.status(400).json({ mensaje: "El cuerpo de la solicitud debe contener una lista de productos." });
        }

        for (const corte of cortes) {
            const {
                tipo,
                garron,
                cabeza,
                cantidad,
                pesoBruto,
                tara,
                pesoNeto,
                pesoProveedor,
                mermaPorcentaje,
                cod,
                categoria,
                unique_code,
                aCamara, // Check del frontend
            } = corte;

            if (!tipo || !garron || cabeza == null || cantidad == null || pesoBruto == null || tara == null || pesoNeto == null) {
                return res.status(400).json({ mensaje: "Faltan campos obligatorios en al menos un producto." });
            }

            const finalUniqueCode = typeof unique_code === 'string' && unique_code.trim() ? unique_code.trim() : null;

            // 1. SIEMPRE se crea en la tabla general de ingresos manuales
            await meatIncome.create({
                id_bill_suppliers: Supplierid,
                products_name: tipo,
                products_garron: garron,
                product_head: cabeza,
                products_quantity: cantidad,
                provider_weight: pesoProveedor,
                gross_weight: pesoBruto,
                tare: tara,
                net_weight: pesoNeto,
                decrease: mermaPorcentaje || 0,
                unique_code: finalUniqueCode,
            });

            // 2. SI TIENE EL CHECK, se crea en la tabla de cámara manual
            if (aCamara) {
                await CamaraManualCut.create({
                    bill_supplier_id: Supplierid,
                    product_name: tipo,
                    garron: garron,
                    head: cabeza,
                    quantity: cantidad,
                    provider_weight: pesoProveedor,
                    gross_weight: pesoBruto,
                    tare_weight: tara,
                    net_weight: pesoNeto,
                    unique_code: finalUniqueCode,
                    a_camara: true
                });
            }

            // 3. Actualización de Stock
            const stock = await ProductStock.findOne({ where: { product_name: tipo } });
            if (stock) {
                await stock.increment("product_quantity", { by: cantidad });
                await stock.increment("product_total_weight", { by: pesoNeto });
            } else {
                await ProductStock.create({
                    product_name: tipo,
                    product_quantity: cantidad,
                    product_total_weight: pesoNeto,
                    product_cod: cod,
                    product_category: categoria || null,
                });
            }
        }

        if (observacion) {
            await ObservationsMeatIncome.create({
                id: Supplierid,
                observation: observacion,
            });
        }

        return res.status(201).json({ mensaje: "Todos los productos fueron cargados correctamente." });
    } catch (error) {
        console.error("Error en addIncomeMeat:", error);
        return res.status(500).json({ mensaje: "Error en la base de datos", error: error.message });
    }
},

editAddIncome: async (req, res) => {
    try {
        const Supplierid = req.params.id;
        const { cortes } = req.body;

        if (!Array.isArray(cortes) || cortes.length === 0) {
            return res.status(400).json({ mensaje: "El cuerpo de la solicitud debe contener una lista de productos." });
        }

        // 1. Obtener datos actuales para descontar del stock antes de borrar
        const anteriores = await meatIncome.findAll({
            where: { id_bill_suppliers: Supplierid },
        });

        for (const item of anteriores) {
            const stock = await ProductStock.findOne({ where: { product_name: item.products_name } });
            if (stock) {
                await stock.decrement("product_quantity", { by: item.products_quantity });
                await stock.decrement("product_total_weight", { by: item.net_weight });
            }
        }

        // 2. Limpiar registros anteriores de AMBAS tablas para evitar duplicados
        await meatIncome.destroy({ where: { id_bill_suppliers: Supplierid } });
        await CamaraManualCut.destroy({ where: { bill_supplier_id: Supplierid } });

        // 3. Re-insertar los nuevos datos actualizados
        for (const corte of cortes) {
            const {
                tipo, garron, cabeza, cantidad, pesoBruto, tara, pesoNeto,
                pesoProveedor, cod, categoria, mermaPorcentaje, unique_code, aCamara
            } = corte;

            const finalUniqueCode = typeof unique_code === "string" && unique_code.trim() ? unique_code.trim() : null;

            // Inserción en tabla general
            await meatIncome.create({
                id_bill_suppliers: Supplierid,
                products_name: tipo,
                products_garron: garron,
                product_head: cabeza,
                products_quantity: cantidad,
                provider_weight: pesoProveedor,
                gross_weight: pesoBruto,
                tare: tara,
                net_weight: pesoNeto,
                decrease: mermaPorcentaje || 0,
                unique_code: finalUniqueCode, 
            });

            // Inserción en cámara si el check está activo
            if (aCamara) {
                await CamaraManualCut.create({
                    bill_supplier_id: Supplierid,
                    product_name: tipo,
                    garron: garron,
                    head: cabeza,
                    quantity: cantidad,
                    provider_weight: pesoProveedor,
                    gross_weight: pesoBruto,
                    tare_weight: tara,
                    net_weight: pesoNeto,
                    unique_code: finalUniqueCode,
                    a_camara: true
                });
            }

            // Actualizar stock con los nuevos valores
            const stock = await ProductStock.findOne({ where: { product_name: tipo } });
            if (stock) {
                await stock.increment("product_quantity", { by: cantidad });
                await stock.increment("product_total_weight", { by: pesoNeto });
            } else {
                await ProductStock.create({
                    product_name: tipo,
                    product_quantity: cantidad,
                    product_total_weight: pesoNeto,
                    product_cod: cod,
                    product_category: categoria || null,
                });
            }
        }

        return res.status(200).json({ mensaje: "Productos actualizados correctamente." });
    } catch (error) {
        console.error("❌ Error en editAddIncome:", error);
        return res.status(500).json({ mensaje: "Error al actualizar los cortes", error: error.message });
    }
},





    productStock: async (req, res) => {
        try {
            const allproductsStock = await meatIncome.findAll();

            res.json(allproductsStock)
        } catch (error) {
            console.error("Error al obtener stock:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },
    findRemit: async (req, res) => {
        try {
            let id = req.params.remitoId;

            const remitoEncontrado = await billSupplier.findOne({
                where: { id: id },
            });



            if (!remitoEncontrado) {
                return res.status(404).json({ message: "Remito no encontrado" });
            }

            return res.status(200).json(remitoEncontrado);
        } catch (error) {
            console.error("Error al buscar el remito:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },
  deleteItemFromMeatManualIncome: async (req, res) => {
    try {
        const id = req.params.id;

        // 1. Buscar el item en meatIncome
        const item = await meatIncome.findOne({ where: { id } });

        if (!item) {
            return res.status(404).json({ mensaje: "El item no se encuentra" });
        }

        const nombreProducto = item.products_name;
        const cantidadARestar = Number(item.products_quantity || 0);
        const pesoARestar = Number(item.net_weight || 0);
        const uniqueCode = (item.unique_code || "").trim();

        // 2. Actualizar stock
        const productoStock = await ProductStock.findOne({
            where: { product_name: nombreProducto },
        });

        if (productoStock) {
            const cantidadActual = Number(productoStock.product_quantity || 0);
            const pesoActual = Number(productoStock.product_total_weight || 0);

            await productoStock.update({
                product_quantity: Math.max(0, cantidadActual - cantidadARestar),
                product_total_weight: Math.max(0, pesoActual - pesoARestar),
            });
        }

        // 3. Eliminar también de cámara manual
        if (uniqueCode) {
            await CamaraManualCut.destroy({
                where: { unique_code: uniqueCode },
            });
        } else {
            await CamaraManualCut.destroy({
                where: {
                    bill_supplier_id: item.id_bill_suppliers,
                    product_name: item.products_name,
                    garron: item.products_garron,
                },
            });
        }

        // 4. Eliminar el item principal
        await meatIncome.destroy({ where: { id } });

        return res.status(200).json({
            mensaje: "Item eliminado con éxito y cámara/stock actualizados.",
            itemEliminado: {
                id: item.id,
                producto: item.products_name,
                cantidad: item.products_quantity,
                garron: item.products_garron,
                peso: item.net_weight,
                unique_code: item.unique_code,
            },
        });
    } catch (error) {
        console.error("❌ Error al eliminar item de meatIncome:", error);
        return res.status(500).json({
            mensaje: "Error al eliminar item de meatIncome",
            error: error.message || error.toString(),
        });
    }
},
getCutsSentToCamaraByBill: async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await billSupplier.findByPk(id, {
      attributes: ["id", "income_state"],
    });

    if (!bill) {
      return res.status(404).json({
        ok: false,
        message: "Comprobante no encontrado",
      });
    }

    // Si el ingreso fue MANUAL => leer camara_manual_cuts
    if (String(bill.income_state).toLowerCase() === "manual") {
      const rowsManual = await CamaraManualCut.findAll({
        where: { bill_supplier_id: id },
        order: [["id", "ASC"]],
      });

      return res.json({
        ok: true,
        tipo_ingreso: "manual",
        cortes: rowsManual,
      });
    }

    // Si el ingreso fue ROMANEO => leer camara_romaneo_cuts
    const rowsRomaneo = await CamaraRomaneoCut.findAll({
      where: { bill_supplier_id: id },
      order: [["id", "ASC"]],
    });

    return res.json({
      ok: true,
      tipo_ingreso: "romaneo",
      cortes: rowsRomaneo,
    });
  } catch (error) {
    console.error("getCutsSentToCamaraByBill error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener cortes enviados a cámara",
      error: error.message,
    });
  }
},


    deleteProduct: async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isFinite(id) || id <= 0) {
                return res.status(400).json({ mensaje: "ID inválido" });
            }

            // 1) Buscar comprobante
            const bill = await billSupplier.findOne({ where: { id } });
            if (!bill) {
                return res.status(404).json({ mensaje: "El comprobante no existe" });
            }

            // 2) Traer items manuales y detalles romaneo
            const meatIncomes = await meatIncome.findAll({ where: { id_bill_suppliers: id } });
            const billDetails = await billDetail.findAll({ where: { bill_supplier_id: id } });

            // 3) Actualizar stock (como lo tenías)
            // 3.a) Stock por cortes manuales (meat_manual_income)
            for (const item of meatIncomes) {
                const stock = await ProductStock.findOne({ where: { product_name: item.products_name } });
                if (stock) {
                    const cantidadARestar = Number(item.products_quantity || 0);
                    const pesoARestar = Number(item.net_weight || 0);

                    stock.product_quantity -= cantidadARestar;
                    stock.product_total_weight -= pesoARestar;

                    if (stock.product_quantity < 0) stock.product_quantity = 0;
                    if (stock.product_total_weight < 0) stock.product_total_weight = 0;

                    await stock.save();
                }
            }

            // 3.b) Stock por bill_details (romaneo)
            for (const detail of billDetails) {
                const stock = await ProductStock.findOne({ where: { product_name: detail.type } });
                if (stock) {
                    const cantidadARestar = Number(detail.quantity || 0);
                    const pesoARestar = Number(detail.weight || 0);

                    stock.product_quantity -= cantidadARestar;
                    stock.product_total_weight -= pesoARestar;

                    if (stock.product_quantity < 0) stock.product_quantity = 0;
                    if (stock.product_total_weight < 0) stock.product_total_weight = 0;

                    await stock.save();
                }
            }

            // 4) ✅ Eliminar registros relacionados (ACÁ estaba el problema)
            // IMPORTANTE: borrar primero los hijos, por FK
            // - Peso manual: puede haber 1 (ideal) o varias filas (por duplicados anteriores)
            await MeatIncomeManualWeight.destroy({
                where: { bill_supplier_id: id },
            });

            // - Manual items
            await meatIncome.destroy({ where: { id_bill_suppliers: id } });

            // - Romaneo details
            await billDetail.destroy({ where: { bill_supplier_id: id } });

            // 5) Por último borrar el comprobante
            await billSupplier.destroy({ where: { id } });

            return res.status(200).json({
                mensaje: "Ingreso eliminado definitivamente. Stock actualizado correctamente.",
                ok: true,
            });
        } catch (error) {
            console.error("Error al eliminar el ingreso:", error);
            return res.status(500).json({
                mensaje: "Error interno del servidor",
                error: error.message || error.toString(),
                ok: false,
            });
        }
    },

    deactivateProduct: async (req, res) => {
        try {
            const id = req.params.id;


            const bill = await billSupplier.findOne({ where: { id } });

            if (!bill) {
                return res
                    .status(404)
                    .json({ mensaje: "El comprobante no existe" });
            }

            if (bill.bill_state === false) {
                return res
                    .status(400)
                    .json({ mensaje: "El comprobante ya está inactivo" });
            }


            const meatIncomes = await meatIncome.findAll({
                where: { id_bill_suppliers: id },
            });

            const billDetails = await billDetail.findAll({
                where: { bill_supplier_id: id },
            });

            // 3) Restar del stock cortes manuales
            for (const item of meatIncomes) {
                const stock = await ProductStock.findOne({
                    where: { product_name: item.products_name },
                });

                if (stock) {
                    const cantidad = Number(item.products_quantity || 0);
                    const peso = Number(item.net_weight || 0);

                    stock.product_quantity -= cantidad;
                    stock.product_total_weight -= peso;

                    if (stock.product_quantity < 0) stock.product_quantity = 0;
                    if (stock.product_total_weight < 0) stock.product_total_weight = 0;

                    await stock.save();
                }
            }


            for (const detail of billDetails) {
                const stock = await ProductStock.findOne({
                    where: { product_name: detail.type },
                });

                if (stock) {
                    const cantidad = Number(detail.quantity || 0);
                    const peso = Number(detail.weight || 0);

                    stock.product_quantity -= cantidad;
                    stock.product_total_weight -= peso;

                    if (stock.product_quantity < 0) stock.product_quantity = 0;
                    if (stock.product_total_weight < 0) stock.product_total_weight = 0;

                    await stock.save();
                }
            }

            const updateData = { bill_state: false };


            if (!bill.production_process) {
                updateData.production_process = true;
            }

            await billSupplier.update(updateData, { where: { id } });

            return res.status(200).json({
                mensaje: "Ingreso dado de baja. Stock actualizado correctamente.",
                production_process:
                    updateData.production_process ?? bill.production_process,
            });
        } catch (error) {
            console.error("deactivateProduct error:", error);
            return res.status(500).json({
                mensaje: "Error al dar de baja el ingreso",
                error: error.message || error.toString(),
            });
        }
    },

    reactivateProduct: async (req, res) => {
        try {
            const id = req.params.id;

            const bill = await billSupplier.findOne({ where: { id } });
            if (!bill) {
                return res.status(404).json({ mensaje: "El comprobante no existe" });
            }
            if (bill.bill_state === true) {
                return res.status(400).json({ mensaje: "El comprobante ya está activo" });
            }

            const meatIncomes = await meatIncome.findAll({
                where: { id_bill_suppliers: id },
            });

            const billDetails = await billDetail.findAll({
                where: { bill_supplier_id: id },
            });

            // 🔺 Volver a sumar al stock cortes manuales
            for (const item of meatIncomes) {
                const stock = await ProductStock.findOne({
                    where: { product_name: item.products_name },
                });

                if (stock) {
                    const cantidad = Number(item.products_quantity || 0);
                    const peso = Number(item.net_weight || 0);

                    stock.product_quantity += cantidad;
                    stock.product_total_weight += peso;

                    await stock.save();
                }
            }

            // 🔺 Volver a sumar al stock detalles del romaneo
            for (const detail of billDetails) {
                const stock = await ProductStock.findOne({
                    where: { product_name: detail.type },
                });

                if (stock) {
                    const cantidad = Number(detail.quantity || 0);
                    const peso = Number(detail.weight || 0);

                    stock.product_quantity += cantidad;
                    stock.product_total_weight += peso;

                    await stock.save();
                }
            }

            // ✅ Marcar como activo de nuevo
            await billSupplier.update(
                { bill_state: true },
                { where: { id } }
            );

            return res
                .status(200)
                .json({ mensaje: "Ingreso reactivado. Stock actualizado correctamente." });
        } catch (error) {
            console.error("reactivateProduct error:", error);
            return res.status(500).json({
                mensaje: "Error al reactivar el ingreso",
                error: error.message || error.toString(),
            });
        }
    },




    loadProductsPrimaryCategory: async (req, res) => {
        try {
            const allProductsPrimary = await ProductsAvailable.findAll({
                attributes: ['id', 'product_name'],
                where: {
                    product_category: "primario",
                },
            });
            const productNames = allProductsPrimary.map(product => product.product_name);

            res.json(productNames);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

    },
loadAllProductsCategories: async (req, res) => {
  try {
    const allProductsCategories = await ProductsAvailable.findAll({
      attributes: [
        "id",
        "product_name",
        "product_general_category",
        "category_id",
        "unit_measure",
      ],
      include: [
        {
          model: db.ProductCategories,
          as: "category",
          attributes: ["id", "category_name"],
        },
      ],
    });

    res.json(allProductsCategories);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
},


    deleteDetailProviderForm: async (req, res) => {
        const { id } = req.params;

        try {
            const detalle = await billDetail.findOne({ where: { id } });

            if (!detalle) {
                return res.status(404).json({ message: "Detalle no encontrado" });
            }

            const billId = detalle.bill_supplier_id;

            const producto = await ProductStock.findOne({
                where: { product_name: detalle.type }
            });

            if (producto) {
                const nuevaCantidad = producto.product_quantity - Number(detalle.quantity || 0);
                const nuevoPeso = producto.product_total_weight - Number(detalle.weight || 0);

                await producto.update({
                    product_quantity: nuevaCantidad < 0 ? 0 : nuevaCantidad,
                    product_total_weight: nuevoPeso < 0 ? 0 : nuevoPeso
                });
            }

            await billDetail.destroy({ where: { id } });

            const detallesRestantes = await billDetail.findAll({ where: { bill_supplier_id: billId } });

            const nuevosTotales = detallesRestantes.reduce(
                (totales, d) => {
                    const cantidad = Number(d.quantity) || 0;
                    const peso = Number(d.weight) || 0;

                    if (Number(d.heads) > 0 || peso === 0) {
                        totales.quantity += cantidad;
                    } else {
                        totales.fresh_quantity += cantidad;
                        totales.fresh_weight += peso;
                    }

                    return totales;
                },
                { quantity: 0, fresh_quantity: 0, fresh_weight: 0 }
            );

            await billSupplier.update(
                {
                    quantity: nuevosTotales.quantity,
                    fresh_quantity: nuevosTotales.fresh_quantity,
                    fresh_weight: nuevosTotales.fresh_weight
                },
                { where: { id: billId } }
            );

            res.json({ message: "Detalle eliminado y totales actualizados." });

        } catch (error) {
            console.error("Error al eliminar el detalle:", error);
            res.status(500).json({ message: "Error al eliminar el detalle", error: error.message });
        }
    },

   addOtherProductsManual: async (req, res) => {
  try {
    const { congelados } = req.body;

    if (!Array.isArray(congelados) || congelados.length === 0) {
      return res.status(400).json({ mensaje: "No se enviaron productos." });
    }

    for (const item of congelados) {
      const {
        product_name,
        product_portion,
        product_quantity,
        product_net_weight,
        product_gross_weight,
        decrease = 0,
        id_bill_suppliers,
        unique_code,
      } = item;

      if (!product_name || product_quantity == null || product_net_weight == null) {
        return res.status(400).json({
          mensaje: "Faltan campos obligatorios en productos congelados.",
        });
      }

      const productoBase = await ProductsAvailable.findOne({
        where: { product_name },
        include: {
          model: ProductCategories,
          as: "category",
          attributes: ["category_name"],
        },
      });

      if (!productoBase) {
        return res.status(400).json({
          mensaje: `Producto "${product_name}" no encontrado en ProductsAvailable.`,
        });
      }

      const categoriaNombre = productoBase.category?.category_name ?? null;

      const finalUniqueCode =
        typeof unique_code === "string" && unique_code.trim()
          ? unique_code.trim()
          : null;

      await OtherProductManual.create({
        product_name,
        product_portion,
        product_quantity,
        product_net_weight,
        product_gross_weight,
        decrease,
        id_bill_suppliers,
        product_cod: productoBase.id,
        product_category: categoriaNombre,
        unique_code: finalUniqueCode, // ✅
      });

      // Actualizar stock
      const stock = await ProductStock.findOne({ where: { product_name } });

      if (stock) {
        stock.product_quantity += Number(product_quantity);
        stock.product_total_weight += Number(product_net_weight);
        await stock.save();
      } else {
        await ProductStock.create({
          product_name,
          product_quantity,
          product_total_weight: Number(product_net_weight),
          product_cod: productoBase.id,
          product_category: categoriaNombre,
        });
      }
    }

    return res.status(201).json({
      mensaje: "Productos congelados agregados correctamente.",
    });
  } catch (error) {
    console.error("❌ addOtherProductsManual:", error);
    return res.status(500).json({
      mensaje: "Error interno del servidor.",
      error: error.message,
    });
  }
},




    getOtherProductsFromRemito: async (req, res) => {
        try {
            const { id } = req.params;

            const productos = await OtherProductManual.findAll({
                where: { id_bill_suppliers: id },
                order: [["id", "ASC"]],
            });

            return res.status(200).json({ productos });
        } catch (error) {
            console.error("Error al obtener otros productos:", error);
            return res.status(500).json({
                message: "Error al obtener otros productos.",
                error: error.message,
            });
        }
    },
  editOtherProductsManual: async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { congelados } = req.body;

    if (!id || !Array.isArray(congelados)) {
      return res.status(400).json({ mensaje: "Datos inválidos." });
    }

    // ✅ 1) RESTAR del stock lo anterior (antes de borrar)
    const oldRows = await OtherProductManual.findAll({
      where: { id_bill_suppliers: id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    for (const row of oldRows) {
      const name = (row.product_name || "").trim();
      if (!name) continue;

      const stock = await ProductStock.findOne({
        where: { product_name: name },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!stock) continue;

      const oldQty = Number(row.product_quantity || 0);
      const oldNet = Number(row.product_net_weight || 0);

      stock.product_quantity = Math.max(0, Number(stock.product_quantity || 0) - oldQty);
      stock.product_total_weight = Math.max(0, Number(stock.product_total_weight || 0) - oldNet);

      await stock.save({ transaction: t });
    }

    // ✅ 2) Borrar registros anteriores
    await OtherProductManual.destroy({
      where: { id_bill_suppliers: id },
      transaction: t,
    });

    // ✅ 3) Crear los nuevos + SUMAR al stock lo nuevo
    for (const prod of congelados) {
      const {
        product_name,
        product_quantity,
        product_net_weight,
        product_gross_weight,
        product_portion,
        decrease = 0,
        unique_code,
      } = prod;

      if (!product_name || product_quantity == null || product_net_weight == null) {
        await t.rollback();
        return res.status(400).json({
          mensaje: "Faltan campos obligatorios en productos congelados.",
        });
      }

      const productoBase = await ProductsAvailable.findOne({
        where: { product_name },
        include: {
          model: ProductCategories,
          as: "category",
          attributes: ["category_name"],
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!productoBase) {
        await t.rollback();
        return res.status(400).json({
          mensaje: `Producto "${product_name}" no encontrado en ProductsAvailable.`,
        });
      }

      const categoriaNombre = productoBase.category?.category_name ?? null;

      const finalUniqueCode =
        typeof unique_code === "string" && unique_code.trim()
          ? unique_code.trim()
          : null;

      await OtherProductManual.create(
        {
          product_name,
          product_quantity,
          product_net_weight,
          product_gross_weight,
          product_portion,
          decrease,
          id_bill_suppliers: id,
          product_cod: productoBase.id,
          product_category: categoriaNombre,
          unique_code: finalUniqueCode,
        },
        { transaction: t }
      );

      // ✅ SUMAR a stock lo nuevo
      const qtyNum = Number(product_quantity || 0);
      const netNum = Number(product_net_weight || 0);

      let stock = await ProductStock.findOne({
        where: { product_name },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (stock) {
        stock.product_quantity = Number(stock.product_quantity || 0) + qtyNum;
        stock.product_total_weight = Number(stock.product_total_weight || 0) + netNum;
        await stock.save({ transaction: t });
      } else {
        await ProductStock.create(
          {
            product_name,
            product_quantity: qtyNum,
            product_total_weight: netNum,
            product_cod: productoBase.id,
            product_category: categoriaNombre,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();
    return res.status(200).json({
      mensaje: "Productos congelados editados correctamente.",
    });
  } catch (error) {
    await t.rollback();
    console.error("❌ editOtherProductsManual:", error);
    return res.status(500).json({
      mensaje: "Error interno del servidor.",
      error: error.message,
    });
  }
},




deleteOtherProduct: async (req, res) => {
  try {
    const { id } = req.params;

    const item = await OtherProductManual.findOne({ where: { id } });

    if (!item) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    const nombreProducto = item.product_name;

    const productoStock = await ProductStock.findOne({
      where: { product_name: nombreProducto },
    });

    if (productoStock) {
      const cantidadActual = Number(productoStock.product_quantity || 0);
      const cantidadARestar = Number(item.product_quantity || 0);
      const nuevaCantidad = cantidadActual - cantidadARestar;

      const pesoActual = Number(productoStock.product_total_weight || 0);
      const pesoARestar = Number(item.product_net_weight || 0);
      const nuevoPeso = pesoActual - pesoARestar;

      await productoStock.update({
        product_quantity: nuevaCantidad < 0 ? 0 : nuevaCantidad,
        product_total_weight: nuevoPeso < 0 ? 0 : nuevoPeso,
      });

      console.log(
        `🟢 Stock actualizado: ${nombreProducto} → cant:${nuevaCantidad} / peso:${nuevoPeso}`
      );
    } else {
      console.warn(
        `⚠️ Producto congelado "${nombreProducto}" no encontrado en ProductStock.`
      );
    }

    await OtherProductManual.destroy({ where: { id } });

    return res.status(200).json({
      message: "Producto congelado eliminado correctamente.",
      itemEliminado: {
        id: item.id,
        producto: item.product_name,
        cantidad: item.product_quantity,
        peso: item.product_net_weight,
      },
    });
  } catch (error) {
    console.error("❌ Error al eliminar producto congelado:", error);
    return res.status(500).json({
      message: "Error al eliminar producto congelado.",
      error: error.message || error.toString(),
    });
  }
},


    updateProductStockQuantity: async (req, res) => {
        try {
            const { product_name, subtract_quantity } = req.body;

            if (!product_name || typeof subtract_quantity !== 'number') {
                return res.status(400).json({ message: "Datos inválidos. Se requiere product_name y subtract_quantity como número." });
            }

            const existingProduct = await ProductStock.findOne({ where: { product_name } });

            if (!existingProduct) {
                return res.status(404).json({ message: "Producto no encontrado" });
            }

            if (existingProduct.product_quantity < subtract_quantity) {
                return res.status(400).json({ message: "Cantidad insuficiente en stock para restar." });
            }

            await existingProduct.decrement('product_quantity', { by: subtract_quantity });

            return res.json({ message: "Cantidad descontada correctamente", product_name, subtracted_quantity: subtract_quantity });

        } catch (error) {
            console.error("Error al descontar la cantidad del producto:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },
    deleteProductAvailable: async (req, res) => {
        try {
            const { id } = req.params;

            // Verificar si el producto tiene stock
            const stockAsociado = await ProductStock.findOne({ where: { product_cod: id } });
            if (stockAsociado) {
                return res.status(400).json({
                    message: "No se puede eliminar el producto porque tiene stock asignado."
                });
            }

            // Eliminar subproductos si existen
            await ProductSubproduct.destroy({ where: { parent_product_id: id } });

            // Eliminar el producto
            await ProductsAvailable.destroy({ where: { id } });

            res.status(200).json({ message: "Producto eliminado correctamente." });
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            res.status(500).json({ message: "Error al eliminar producto." });
        }
    },

    // editProductAvailable: async (req, res) => {
    //     try {
    //         const { id } = req.params;
    //         const { product_name, category_id, product_general_category, min_stock, max_stock } = req.body;

    //         // Validación de campos obligatorios
    //         if (!product_name || !category_id || !product_general_category || min_stock == null || max_stock == null) {
    //             return res.status(400).json({ message: "Faltan campos obligatorios." });
    //         }

    //         const producto = await ProductsAvailable.findOne({ where: { id } });

    //         if (!producto) {
    //             return res.status(404).json({ message: "Producto no encontrado." });
    //         }

    //         await producto.update({
    //             product_name,
    //             category_id,
    //             product_general_category,
    //             min_stock,
    //             max_stock
    //         });

    //         return res.status(200).json({ message: "Producto actualizado correctamente." });
    //     } catch (error) {
    //         console.error("Error al actualizar producto:", error);
    //         return res.status(500).json({
    //             message: "Error al actualizar producto.",
    //             error: error.message || error.toString(),
    //         });
    //     }
    // },


    getProductById: async (req, res) => {
        try {
            const { id } = req.params;

            const product = await ProductsAvailable.findOne({
                where: { id }
            });

            if (!product) {
                return res.status(404).json({ message: "Producto no encontrado." });
            }

            return res.json(product);
        } catch (error) {
            console.error("Error al obtener producto por ID:", error);
            return res.status(500).json({ message: "Error interno del servidor." });
        }
    },

    getSubproductsForProduct: async (req, res) => {
        const { name } = req.params;

        try {
            console.log(" Buscando producto con nombre (sin case):", name);

            const product = await ProductsAvailable.findOne({
                where: {
                    product_name: {
                        [Op.like]: `%${name}%`
                    }
                },
                order: [
                    // Prioriza coincidencia exacta (case-insensitive), luego el más corto
                    [sequelize.literal(`CASE WHEN LOWER(product_name) = ${sequelize.escape(name.toLowerCase())} THEN 0 ELSE 1 END`), 'ASC'],
                    [sequelize.fn('LENGTH', col('product_name')), 'ASC']
                ]
            });

            if (!product) {
                console.log(" Producto no encontrado");
                return res.status(404).json({ message: "Producto no encontrado" });
            }

            const subproducts = await ProductSubproduct.findAll({
                where: { parent_product_id: product.id },
                attributes: ['quantity', 'unit'],
                include: [
                    {
                        model: ProductsAvailable,
                        as: "subProduct",
                        attributes: ["product_name"]
                    }
                ]
            });

            const resultado = subproducts.map(sp => ({
                nombre: sp.subProduct?.product_name || "SUBPRODUCTO SIN NOMBRE",
                cantidadPorUnidad: parseFloat(sp.quantity),
                unit: sp.unit || "unidad" // 👈 devolvemos la unidad (fallback a "unidad")
            }));

            return res.status(200).json(resultado);
        } catch (error) {
            console.error(" Error al obtener subproductos:", error);
            res.status(500).json({ message: "Error interno al obtener subproductos" });
        }
    },

    descontarStockSinRemito: async (req, res) => {
        try {
            const { product_name, quantity } = req.body;

            // Validación básica
            if (!product_name || !quantity || quantity <= 0) {
                return res.status(400).json({ message: "Datos inválidos. Se requiere product_name y quantity mayor a 0." });
            }

            // Buscar producto en ProductStock
            const productoStock = await ProductStock.findOne({
                where: { product_name }
            });

            if (!productoStock) {
                return res.status(404).json({ message: `Producto "${product_name}" no encontrado en stock.` });
            }

            // Validar stock suficiente
            if (productoStock.product_quantity < quantity) {
                return res.status(400).json({
                    message: `Stock insuficiente para "${product_name}". Disponible: ${productoStock.product_quantity}, solicitado: ${quantity}`
                });
            }

            // Descontar cantidad
            productoStock.product_quantity -= quantity;
            if (productoStock.product_quantity < 0) productoStock.product_quantity = 0;
            await productoStock.save();

            return res.status(200).json({
                message: `Stock de "${product_name}" descontado correctamente.`,
                product_name,
                cantidad_restada: quantity,
                cantidad_restante: productoStock.product_quantity
            });
        } catch (error) {
            console.error("Error al descontar stock sin remito:", error);
            return res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },
    updateStockManual: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const {
                subtract_quantity,
                min_stock,
                max_stock,
                product_total_weight
            } = req.body || {};

            // --- 1) localizar fila de stock ---
            // prioridad: por ID numérico; fallback: por nombre/código
            let stockRow = null;

            if (!isNaN(Number(id))) {
                stockRow = await ProductStock.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
            }
            if (!stockRow) {
                stockRow = await ProductStock.findOne({
                    where: {
                        [db.Sequelize.Op.or]: [
                            { product_cod: String(id) },
                            { product_id: String(id) },
                            { product_name: String(id) }
                        ]
                    },
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });
            }
            if (!stockRow) {
                await t.rollback();
                return res.status(404).json({ ok: false, msg: "Producto de stock no encontrado" });
            }

            // --- 2) restar unidades del stock (si corresponde) ---
            if (subtract_quantity != null) {
                const sub = Math.max(0, Number(subtract_quantity));
                const current = Number(stockRow.product_quantity || 0);
                if (sub > current) {
                    await t.rollback();
                    return res.status(400).json({
                        ok: false,
                        msg: `No hay stock suficiente: actual ${current}, intenta restar ${sub}`
                    });
                }
                stockRow.product_quantity = current - sub;
            }

            // --- 3) corregir kg totales (opcional) ---
            if (product_total_weight != null && product_total_weight !== "") {
                stockRow.product_total_weight = Number(product_total_weight);
            }

            await stockRow.save({ transaction: t });

            // --- 4) actualizar min/max en catálogo (ProductsAvailable) ---
            // 🔧 FIX: matchear SOLO por product_name (products_available no tiene product_cod)
            let catRow = null;
            if (stockRow.product_name) {
                catRow = await ProductsAvailable.findOne({
                    where: { product_name: stockRow.product_name },
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });
            }

            if (catRow && (min_stock != null || max_stock != null)) {
                if (min_stock != null) catRow.min_stock = Number(min_stock);
                if (max_stock != null) catRow.max_stock = Number(max_stock);
                await catRow.save({ transaction: t });
            }

            await t.commit();

            // respuesta unificada para refrescar el front
            return res.json({
                ok: true,
                msg: "Ajuste aplicado correctamente",
                stock: {
                    id: stockRow.id,
                    product_cod: stockRow.product_cod,
                    product_name: stockRow.product_name,
                    product_quantity: Number(stockRow.product_quantity || 0),
                    product_total_weight: Number(stockRow.product_total_weight || 0)
                },
                available: catRow
                    ? {
                        id: catRow.id,
                        product_cod: catRow.product_cod,     // si no existe en tu modelo, podés quitar esta línea
                        product_name: catRow.product_name,
                        min_stock: Number(catRow.min_stock || 0),
                        max_stock: Number(catRow.max_stock || 0)
                    }
                    : null
            });
        } catch (e) {
            console.error(e);
            try { await t.rollback(); } catch { }
            return res.status(500).json({ ok: false, msg: "Error en ajuste manual de stock" });
        }
    },

getBillsAvailableForCamara: async (req, res) => {
  try {
    // Traigo comprobantes activos (ajustá filtros si necesitás)
    // Ej: bill_state = true, production_process = true, etc.
    const bills = await billSupplier.findAll({
      where: { bill_state: true },
      attributes: ["id", "income_state"],
      order: [["id", "DESC"]],
    });

    // Totales MANUAL (desde meat_income)
    const manualTotals = await sequelize.query(
      `
      SELECT id_bill_suppliers AS bill_id,
             COALESCE(SUM(net_weight),0) AS total_weight
      FROM meat_income
      GROUP BY id_bill_suppliers
      `,
      { type: QueryTypes.SELECT }
    );

    // Ya en cámara MANUAL
    const manualInCamara = await sequelize.query(
      `
      SELECT bill_supplier_id AS bill_id,
             COALESCE(SUM(net_weight),0) AS camara_weight
      FROM camara_manual_cuts
      WHERE a_camara = 1
      GROUP BY bill_supplier_id
      `,
      { type: QueryTypes.SELECT }
    );

    // Totales ROMANEO (desde bill_details)
    const romaneoTotals = await sequelize.query(
      `
      SELECT bill_supplier_id AS bill_id,
             COALESCE(SUM(weight),0) AS total_weight
      FROM bill_details
      GROUP BY bill_supplier_id
      `,
      { type: QueryTypes.SELECT }
    );

    // Ya en cámara ROMANEO
    const romaneoInCamara = await sequelize.query(
      `
      SELECT bill_supplier_id AS bill_id,
             COALESCE(SUM(romaneo_weight),0) AS camara_weight
      FROM camara_romaneo_cuts
      WHERE a_camara = 1
      GROUP BY bill_supplier_id
      `,
      { type: QueryTypes.SELECT }
    );

    // Mapas rápidos
    const mTot = new Map(manualTotals.map(r => [Number(r.bill_id), Number(r.total_weight || 0)]));
    const mCam = new Map(manualInCamara.map(r => [Number(r.bill_id), Number(r.camara_weight || 0)]));
    const rTot = new Map(romaneoTotals.map(r => [Number(r.bill_id), Number(r.total_weight || 0)]));
    const rCam = new Map(romaneoInCamara.map(r => [Number(r.bill_id), Number(r.camara_weight || 0)]));

    const result = bills
      .map(b => {
        const id = Number(b.id);
        const state = (b.income_state || "").toLowerCase();

        const total = state === "manual" ? (mTot.get(id) || 0) : (rTot.get(id) || 0);
        const camara = state === "manual" ? (mCam.get(id) || 0) : (rCam.get(id) || 0);

        const restante = Number((total - camara).toFixed(2));

        return {
          id,
          income_state: state,
          total,
          camara,
          restante,
        };
      })
     
      .filter(x => x.total > 0 && x.restante > 0);

    return res.json(result);
  } catch (err) {
    console.error("getBillsAvailableForCamara error:", err);
    return res.status(500).json({ message: "Error interno", error: err.message });
  }
},


  billDetailsReadonly: async (req, res) => {
  try {
    const id = req.params.id;
    const bill = await billSupplier.findOne({ where: { id } });

    if (!bill) {
      return res.status(404).json({ message: "Comprobante no encontrado" });
    }

    let data = [];

    if (bill.income_state === "manual") {
      const rows = await meatIncome.findAll({ where: { id_bill_suppliers: id } });

      const camaraRows = await sequelize.query(
        `SELECT unique_code
         FROM camara_manual_cuts
         WHERE bill_supplier_id = ?`,
        { replacements: [id], type: QueryTypes.SELECT }
      );

      const camaraSet = new Set(
        (camaraRows || [])
          .map((r) => (r.unique_code || "").trim())
          .filter(Boolean)
      );

      data = rows
        .filter((r) => {
          const uc = (r.unique_code || "").trim();
          if (!uc) return true;
          return !camaraSet.has(uc);
        })
        .map((r) => ({
          type: r.products_name,
          quantity: Number(r.products_quantity || 0),
          weight: Number(r.net_weight || 0),
          source: "manual",
          unique_code: r.unique_code || null,
        }));

      return res.json(data);
    }

    // ===== ROMANEO =====
    const rows = await billDetail.findAll({ where: { bill_supplier_id: id } });

    const camaraRows = await sequelize.query(
      `SELECT unique_code
       FROM camara_romaneo_cuts
       WHERE bill_supplier_id = ?`,
      { replacements: [id], type: QueryTypes.SELECT }
    );

    const camaraSet = new Set(
      (camaraRows || [])
        .map((r) => (r.unique_code || "").trim())
        .filter(Boolean)
    );

    data = rows
      .filter((r) => {
        const uc = (r.unique_code || "").trim();
        if (!uc) return true;
        return !camaraSet.has(uc);
      })
      .map((r) => ({
        type: r.type,
        quantity: Number(r.quantity || 0),
        weight: Number(r.weight || 0),
        source: "romaneo",
        unique_code: r.unique_code || null,
      }));

    return res.json(data);
  } catch (err) {
    console.error("billDetailsReadonly error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
},



    billDetails: async (req, res) => {
        try {
            const id = req.params.id;
            const bill = await billSupplier.findOne({ where: { id } });

            if (!bill) return res.status(404).json({ message: "Comprobante no encontrado" });

            if (bill.income_state === "manual") {
                // meat_manual_income
                const rows = await meatIncome.findAll({ where: { id_bill_suppliers: id } });
                const data = rows.map(r => ({
                    id: r.id,
                    type: r.products_name,
                    quantity: Number(r.products_quantity || 0),
                    heads: Number(r.product_head || 0),
                    weight: Number(r.net_weight || 0)
                }));
                return res.json(data);
            } else {
                // bill_details (romaneo)
                const rows = await billDetail.findAll({ where: { bill_supplier_id: id } });
                const data = rows.map(r => ({
                    id: r.id,
                    type: r.type,
                    quantity: Number(r.quantity || 0),
                    heads: Number(r.heads || 0),
                    weight: Number(r.weight || 0)
                }));
                return res.json(data);
            }
        } catch (err) {
            console.error("billDetails error:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },

    // === Leer un proceso por process_number (cortes, bills, subproducción)
    getProcessByNumber: async (req, res) => {
        try {
            const process_number = Number(req.params.process_number);
            if (!process_number) return res.status(400).json({ message: "process_number requerido" });

            const cuts = await ProcessMeat.findAll({ where: { process_number }, order: [["id", "ASC"]] });
            const pn = await ProcessNumber.findAll({ where: { process_number } });
            const bills = pn.map(r => r.bill_id);
            const sub = await ProductionProcessSubproduction.findAll({ where: { process_number }, order: [["id", "ASC"]] });

            return res.json({ cuts, bills, subproduction: sub });
        } catch (err) {
            console.error("getProcessByNumber error:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },

updateProcessByNumber: async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const process_number = Number(req.params.process_number);

        if (!process_number || !Number.isFinite(process_number)) {
            await t.rollback();
            return res.status(400).json({ message: "process_number requerido" });
        }

        const { cortes = [], bill_ids = [], subproduction = [] } = req.body;

        if (!Array.isArray(cortes) || cortes.length === 0) {
            await t.rollback();
            return res.status(400).json({
                message: "Debe enviar al menos un corte del proceso.",
            });
        }

        const hasBills = Array.isArray(bill_ids) && bill_ids.length > 0;
        const hasSubproduction =
            Array.isArray(subproduction) &&
            subproduction.some(
                (s) => Number(s.quantity || 0) > 0 || Number(s.weight || 0) > 0
            );

        if (!hasBills && !hasSubproduction) {
            await t.rollback();
            return res.status(400).json({
                message: "Debe asociar al menos un comprobante o cargar subproducción.",
            });
        }

        const esTextoValido = (v) =>
            typeof v === "string" && v.trim().length > 0;

        const toNumero = (v, defecto = 0) => {
            if (v === null || v === undefined || v === "") return defecto;
            const n = Number(v);
            return Number.isFinite(n) ? n : defecto;
        };

        const normalizarNombre = (v) => String(v || "").trim();

        // =========================================================
        // 1) LEER DATOS ANTERIORES DEL PROCESO
        // =========================================================
        const oldCuts = await ProcessMeat.findAll({
            where: { process_number },
            transaction: t,
        });

        const oldBills = await ProcessNumber.findAll({
            where: { process_number },
            transaction: t,
        });

        const oldSubproduction = await ProductionProcessSubproduction.findAll({
            where: { process_number },
            transaction: t,
        });

        // =========================================================
        // 2) REVERTIR STOCK DEL PROCESO ANTERIOR
        // =========================================================

        // 2.a) Quitar del stock los productos resultantes viejos
        for (const cut of oldCuts) {
            const productName = normalizarNombre(cut.type || cut.product_name);
            if (!productName) continue;

            const stock = await ProductStock.findOne({
                where: { product_name: productName },
                transaction: t,
            });

            if (!stock) continue;

            const currentQty = toNumero(stock.product_quantity, 0);
            const currentWeight = toNumero(stock.product_total_weight, 0);

            await stock.update(
                {
                    product_quantity: Math.max(
                        0,
                        currentQty - toNumero(cut.quantity, 0)
                    ),
                    product_total_weight: Math.max(
                        0,
                        currentWeight - toNumero(cut.net_weight, 0)
                    ),
                },
                { transaction: t }
            );
        }

        // 2.b) Reponer consumo anterior de stock origen
        const oldBillIds = oldBills
            .map((r) => Number(r.bill_id))
            .filter((id) => Number.isFinite(id) && id > 0);

        const restoreByParent = {};

        if (oldBillIds.length > 0) {
            const bills = await billSupplier.findAll({
                where: { id: { [Op.in]: oldBillIds } },
                attributes: ["id", "income_state"],
                transaction: t,
            });

            for (const bill of bills) {
                const billId = Number(bill.id);
                const tipoIngreso = bill.income_state;

                if (tipoIngreso === "manual") {
                    const manualRows = await meatIncome.findAll({
                        where: { id_bill_suppliers: billId },
                        transaction: t,
                    });

                    for (const row of manualRows) {
                        const name = normalizarNombre(row.products_name);
                        if (!name) continue;

                        if (!restoreByParent[name]) {
                            restoreByParent[name] = { qty: 0, weight: 0 };
                        }

                        restoreByParent[name].qty += toNumero(
                            row.products_quantity,
                            0
                        );
                        restoreByParent[name].weight += toNumero(
                            row.net_weight,
                            0
                        );
                    }
                } else {
                    const romaneoRows = await billDetail.findAll({
                        where: { bill_supplier_id: billId },
                        transaction: t,
                    });

                    for (const row of romaneoRows) {
                        const name = normalizarNombre(row.type);
                        if (!name) continue;

                        if (!restoreByParent[name]) {
                            restoreByParent[name] = { qty: 0, weight: 0 };
                        }

                        restoreByParent[name].qty += toNumero(row.quantity, 0);
                        restoreByParent[name].weight += toNumero(
                            row.weight ?? row.net_weight,
                            0
                        );
                    }
                }
            }
        }

        // 2.c) Reponer también la subproducción vieja
        for (const s of oldSubproduction) {
            const name = normalizarNombre(s.cut_name);
            if (!name) continue;

            if (!restoreByParent[name]) {
                restoreByParent[name] = { qty: 0, weight: 0 };
            }

            restoreByParent[name].qty += toNumero(s.quantity, 0);
            restoreByParent[name].weight += toNumero(s.weight, 0);
        }

        // 2.d) Aplicar reposición
        for (const [parentName, restore] of Object.entries(restoreByParent)) {
            const stock = await ProductStock.findOne({
                where: { product_name: parentName },
                transaction: t,
            });

            if (!stock) continue;

            await stock.update(
                {
                    product_quantity:
                        toNumero(stock.product_quantity, 0) +
                        toNumero(restore.qty, 0),
                    product_total_weight:
                        toNumero(stock.product_total_weight, 0) +
                        toNumero(restore.weight, 0),
                },
                { transaction: t }
            );
        }

        // =========================================================
        // 3) BORRAR DATOS ANTERIORES DEL PROCESO
        // =========================================================
        await ProcessMeat.destroy({ where: { process_number }, transaction: t });
        await ProductionProcessSubproduction.destroy({
            where: { process_number },
            transaction: t,
        });
        await ProcessNumber.destroy({ where: { process_number }, transaction: t });

        // =========================================================
        // 4) CREAR NUEVOS DATOS DEL PROCESO
        // =========================================================
        const validBillIds = (Array.isArray(bill_ids) ? bill_ids : [])
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id) && id > 0);

        if (hasBills && !validBillIds.length) {
            await t.rollback();
            return res.status(400).json({
                message: "Los comprobantes enviados no son válidos.",
            });
        }

        for (const bill_id of validBillIds) {
            await ProcessNumber.create(
                { process_number, bill_id },
                { transaction: t }
            );
        }

        for (const corte of cortes) {
            const {
                type,
                description,
                unit_type,
                quantity,
                net_weight,
                head_count,
                romaneo_weight,
                average,
                gross_weight,
                tares,
            } = corte;

            if (!esTextoValido(type)) {
                await t.rollback();
                return res.status(400).json({
                    message: "Falta el tipo de corte (type) o es inválido.",
                });
            }

            const qtyNum = toNumero(quantity, 0);
            const netNum = toNumero(net_weight, 0);
            const avgNum = toNumero(average, 0);
            const grossNum = toNumero(gross_weight, 0);
            const taresNum = toNumero(tares, 0);
            const headCountNum = toNumero(head_count, 0);
            const romaneoNum = toNumero(romaneo_weight, 0);

            if (netNum <= 0) {
                await t.rollback();
                return res.status(400).json({
                    message: `El peso neto del corte "${type}" debe ser mayor a 0.`,
                });
            }

            let baseProduct = null;
            let productName = null;

            if (!Number.isNaN(Number(type))) {
                baseProduct = await ProductsAvailable.findByPk(Number(type), {
                    include: [
                        {
                            model: ProductCategories,
                            as: "category",
                            attributes: ["category_name"],
                        },
                    ],
                    transaction: t,
                });

                if (!baseProduct) {
                    await t.rollback();
                    return res.status(400).json({
                        message: `No se encontró ningún producto con ID ${type}.`,
                    });
                }

                productName = normalizarNombre(baseProduct.product_name);
            } else {
                baseProduct = await ProductsAvailable.findOne({
                    where: { product_name: normalizarNombre(type) },
                    include: [
                        {
                            model: ProductCategories,
                            as: "category",
                            attributes: ["category_name"],
                        },
                    ],
                    transaction: t,
                });

                if (!baseProduct) {
                    await t.rollback();
                    return res.status(400).json({
                        message: `No se pudo identificar el producto "${type}".`,
                    });
                }

                productName = normalizarNombre(baseProduct.product_name);
            }

            const finalDescription = esTextoValido(description)
                ? description.trim()
                : productName;

            const finalUnitType = esTextoValido(unit_type)
                ? unit_type.trim()
                : (baseProduct.unit_measure || baseProduct.unit_type || "unidad");

            await ProcessMeat.create(
                {
                    process_number,
                    type: productName,
                    product_name: productName,
                    description: finalDescription,
                    unit_type: finalUnitType,
                    quantity: qtyNum,
                    net_weight: netNum,
                    head_count: headCountNum,
                    romaneo_weight: romaneoNum,
                    average: avgNum,
                    gross_weight: grossNum,
                    tares: taresNum,
                },
                { transaction: t }
            );

            let stockChild = await ProductStock.findOne({
                where: { product_name: productName },
                transaction: t,
            });

            if (stockChild) {
                await stockChild.update(
                    {
                        product_quantity:
                            toNumero(stockChild.product_quantity, 0) + qtyNum,
                        product_total_weight:
                            toNumero(stockChild.product_total_weight, 0) + netNum,
                    },
                    { transaction: t }
                );
            } else {
                await ProductStock.create(
                    {
                        product_name: productName,
                        product_quantity: qtyNum,
                        product_total_weight: netNum,
                        product_cod: baseProduct?.id || null,
                        product_category:
                            baseProduct?.category?.category_name ?? null,
                    },
                    { transaction: t }
                );
            }
        }

        // =========================================================
        // 5) ARMAR NUEVO CONSUMO DE STOCK ORIGEN
        // =========================================================
        const usageByParent = {};

        if (validBillIds.length > 0) {
            const bills = await billSupplier.findAll({
                where: { id: { [Op.in]: validBillIds } },
                attributes: ["id", "income_state"],
                transaction: t,
            });

            for (const bill of bills) {
                const billId = Number(bill.id);
                const tipoIngreso = bill.income_state;

                if (tipoIngreso === "manual") {
                    const manualRows = await meatIncome.findAll({
                        where: { id_bill_suppliers: billId },
                        transaction: t,
                    });

                    for (const row of manualRows) {
                        const name = normalizarNombre(row.products_name);
                        if (!name) continue;

                        if (!usageByParent[name]) {
                            usageByParent[name] = { qty: 0, weight: 0 };
                        }

                        usageByParent[name].qty += toNumero(row.products_quantity, 0);
                        usageByParent[name].weight += toNumero(row.net_weight, 0);
                    }
                } else {
                    const romaneoRows = await billDetail.findAll({
                        where: { bill_supplier_id: billId },
                        transaction: t,
                    });

                    for (const row of romaneoRows) {
                        const name = normalizarNombre(row.type);
                        if (!name) continue;

                        if (!usageByParent[name]) {
                            usageByParent[name] = { qty: 0, weight: 0 };
                        }

                        usageByParent[name].qty += toNumero(row.quantity, 0);
                        usageByParent[name].weight += toNumero(
                            row.weight ?? row.net_weight,
                            0
                        );
                    }
                }
            }
        }

        // =========================================================
        // 6) GUARDAR SUBPRODUCCIÓN NUEVA Y SUMAR SU CONSUMO
        // =========================================================
        const subRowsToCreate = [];

        for (const s of subproduction) {
            const cut_name = normalizarNombre(
                s.cut_name || s.tipo || s.producto || s.product_name
            );

            const quantityNum = toNumero(s.quantity ?? s.cantidad, 0);
            const weightNum = toNumero(
                s.weight ?? s.net_weight ?? s.peso ?? s.peso_neto,
                0
            );

            if (!cut_name) continue;
            if (quantityNum <= 0 && weightNum <= 0) continue;

            subRowsToCreate.push({
                process_number,
                cut_name,
                quantity: quantityNum,
                weight: weightNum,
            });

            if (!usageByParent[cut_name]) {
                usageByParent[cut_name] = { qty: 0, weight: 0 };
            }

            usageByParent[cut_name].qty += quantityNum;
            usageByParent[cut_name].weight += weightNum;
        }

        if (subRowsToCreate.length > 0) {
            await ProductionProcessSubproduction.bulkCreate(subRowsToCreate, {
                transaction: t,
            });
        }

        // =========================================================
        // 7) DESCONTAR EL NUEVO CONSUMO DE STOCK ORIGEN
        // =========================================================
        for (const [parentName, used] of Object.entries(usageByParent)) {
            const stockParent = await ProductStock.findOne({
                where: { product_name: parentName },
                transaction: t,
            });

            if (!stockParent) continue;

            await stockParent.update(
                {
                    product_quantity: Math.max(
                        0,
                        toNumero(stockParent.product_quantity, 0) -
                            toNumero(used.qty, 0)
                    ),
                    product_total_weight: Math.max(
                        0,
                        toNumero(stockParent.product_total_weight, 0) -
                            toNumero(used.weight, 0)
                    ),
                },
                { transaction: t }
            );
        }

        // =========================================================
        // 8) ACTUALIZAR ESTADO DE COMPROBANTES
        // =========================================================
        if (oldBillIds.length > 0) {
            await billSupplier.update(
                { process_state: "pendiente" },
                {
                    where: { id: { [Op.in]: oldBillIds } },
                    transaction: t,
                }
            );
        }

        if (validBillIds.length > 0) {
            await billSupplier.update(
                { process_state: "procesado" },
                {
                    where: { id: { [Op.in]: validBillIds } },
                    transaction: t,
                }
            );
        }

        await t.commit();

        return res.json({
            ok: true,
            message: "Proceso actualizado correctamente.",
            process_number,
        });
    } catch (err) {
        console.error("updateProcessByNumber error:", err);

        try {
            await t.rollback();
        } catch {}

        return res.status(500).json({
            message: "Error interno del servidor",
            error: err.message,
        });
    }
},
    // NUEVO: marcar / desmarcar que un comprobante necesita proceso productivo
    toggleProductionProcessFlag: async (req, res) => {
        const { id } = req.params;

        try {
            // Busco el comprobante
            const bill = await billSupplier.findOne({ where: { id } });
            if (!bill) {
                return res
                    .status(404)
                    .json({ ok: false, message: "Comprobante no encontrado" });
            }

            // ¿Tiene algún proceso productivo asociado en process_number?
            const proceso = await ProcessNumber.findOne({ where: { bill_id: id } });

            // Si YA tiene proceso registrado y estoy intentando sacar el check,
            // no lo permito.
            if (proceso && bill.production_process) {
                return res.status(400).json({
                    ok: false,
                    message:
                        "Este comprobante ya tiene un proceso productivo asociado y no se puede quitar el check.",
                });
            }

            const nuevoValor = !bill.production_process;

            await bill.update({ production_process: nuevoValor });

            return res.json({
                ok: true,
                production_process: nuevoValor,
            });
        } catch (err) {
            console.error("toggleProductionProcessFlag error:", err);
            return res
                .status(500)
                .json({
                    ok: false,
                    message: "Error actualizando estado de proceso productivo",
                });
        }
    },



}

module.exports = operatorApiController;