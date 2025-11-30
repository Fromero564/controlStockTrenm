const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, fn, col, where } = require("sequelize");
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
                fresh_weight
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
                return res.status(400).json({ message: "Debe proporcionar al menos un corte o un congelado." });
            }

            const nuevoRegistro = await billSupplier.create({
                supplier: proveedor,
                date_bill_supplier: new Date(),
                total_weight: Number(pesoTotal || 0),
                head_quantity: Number(cabezas || 0),
                income_state: tipoIngreso,
                check_state: tipoIngreso === "romaneo",
                romaneo_number: Number(romaneo || 0),
                quantity: Number(cantidad || 0),
                fresh_quantity: Number(fresh_quantity || 0),
                fresh_weight: Number(fresh_weight || 0),
            });

            // CORTES: guardar detalle; solo impactar stock si es ROMANEO (ya lo tenías así)
            if (Array.isArray(cortes) && cortes.length) {
                for (const corte of cortes) {
                    const { nombre, cantidad, cabezas, cod, categoria, pesoRomaneo, identification_product } = corte;

                    await billDetail.create({
                        bill_supplier_id: nuevoRegistro.id,
                        type: nombre,
                        quantity: Number(cantidad || 0),
                        heads: Number(cabezas || 0),
                        weight: Number(pesoRomaneo || 0),
                        identification_product: Number(identification_product || 0),
                    });

                    if (tipoIngreso === "romaneo") {
                        const existing = await ProductStock.findOne({ where: { product_name: nombre } });
                        if (existing) {
                            existing.product_quantity += Number(cantidad || 0);
                            existing.product_total_weight += Number(pesoRomaneo || 0);
                            await existing.save();
                        } else {
                            await ProductStock.create({
                                product_name: nombre,
                                product_quantity: Number(cantidad || 0),
                                product_total_weight: Number(pesoRomaneo || 0),
                                product_cod: cod || null,
                                product_category: categoria || null
                            });
                        }
                    }
                }
            }

            // CONGELADOS: guardar detalle; SOLO impactar stock si es ROMANEO
            if (Array.isArray(congelados) && congelados.length) {
                for (const cong of congelados) {
                    const { tipo, cantidad, unidades, cod, categoria, identification_product } = cong;

                    await billDetail.create({
                        bill_supplier_id: nuevoRegistro.id,
                        type: tipo,
                        quantity: Number(cantidad || 0),
                        heads: 0,
                        weight: Number(unidades || 0),
                        identification_product: Number(identification_product || 0),
                    });

                    if (tipoIngreso === "romaneo") {
                        const existing = await ProductStock.findOne({ where: { product_name: tipo } });
                        if (existing) {
                            existing.product_quantity += Number(cantidad || 0);
                            existing.product_total_weight += Number(unidades || 0);
                            await existing.save();
                        } else {
                            await ProductStock.create({
                                product_name: tipo,
                                product_quantity: Number(cantidad || 0),
                                product_total_weight: Number(unidades || 0),
                                product_cod: cod || null,
                                product_category: categoria || null
                            });
                        }
                    }
                }
            }

            return res.status(201).json({ id: nuevoRegistro.id, romaneo: nuevoRegistro.romaneo_number });
        } catch (error) {
            console.error("Error al cargar datos:", error);
            return res.status(500).json({ message: "Error interno del servidor", error: error.message });
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
                congelados = []
            } = req.body;

            if (!proveedor || pesoTotal == null || cabezas == null || !romaneo) {
                return res.status(400).json({ message: "Faltan datos obligatorios." });
            }

            // leer estado anterior para saber si había impactado stock
            const previo = await billSupplier.findOne({ where: { id } });
            const previoEraRomaneo = previo?.income_state === "romaneo";

            // si ANTES era romaneo, revertimos stock de los bill_details previos
            if (previoEraRomaneo) {
                const detallesPrevios = await billDetail.findAll({ where: { bill_supplier_id: id } });
                for (const det of detallesPrevios) {
                    const stock = await ProductStock.findOne({ where: { product_name: det.type } });
                    if (stock) {
                        stock.product_quantity -= Number(det.quantity || 0);
                        stock.product_total_weight -= Number(det.weight || 0);
                        if (stock.product_quantity < 0) stock.product_quantity = 0;
                        if (stock.product_total_weight < 0) stock.product_total_weight = 0;
                        await stock.save();
                    }
                }
            }

            // borrar todos los detalles para recrearlos
            await billDetail.destroy({ where: { bill_supplier_id: id } });

            // actualizar cabecera
            await billSupplier.update({
                supplier: proveedor,
                total_weight: Number(pesoTotal || 0),
                head_quantity: Number(cabezas || 0),
                quantity: Number(cantidad || 0),
                romaneo_number: Number(romaneo || 0),
                income_state: tipoIngreso,
                check_state: tipoIngreso === "romaneo"
            }, { where: { id } });

            const esRomaneoNuevo = tipoIngreso === "romaneo";

            // CORTES: crear detalle siempre; impactar stock solo si romaneo
            for (const corte of cortes) {
                const { tipo, cantidad: cant, cabezas: head, cod, categoria, pesoRomaneo, identification_product } = corte;

                let nombreProducto = tipo;
                if (!isNaN(tipo)) {
                    const prod = await ProductsAvailable.findByPk(tipo);
                    if (prod) nombreProducto = prod.product_name;
                }

                await billDetail.create({
                    bill_supplier_id: id,
                    type: nombreProducto,
                    quantity: Number(cant || 0),
                    heads: Number(head || 0),
                    weight: Number(pesoRomaneo || 0),
                    identification_product: Number(identification_product || 0)
                });

                if (esRomaneoNuevo) {
                    const stock = await ProductStock.findOne({ where: { product_name: nombreProducto } });
                    if (stock) {
                        stock.product_quantity += Number(cant || 0);
                        stock.product_total_weight += Number(pesoRomaneo || 0);
                        await stock.save();
                    } else {
                        await ProductStock.create({
                            product_name: nombreProducto,
                            product_quantity: Number(cant || 0),
                            product_total_weight: Number(pesoRomaneo || 0),
                            product_cod: cod || null,
                            product_category: categoria || null
                        });
                    }
                }
            }

            // CONGELADOS: crear detalle siempre; impactar stock solo si romaneo
            for (const cong of congelados) {
                const { tipo, cantidad: cant, unidades, cod, categoria, identification_product } = cong;

                await billDetail.create({
                    bill_supplier_id: id,
                    type: tipo,
                    quantity: Number(cant || 0),
                    heads: 0,
                    weight: Number(unidades || 0),
                    identification_product: Number(identification_product || 0)
                });

                if (esRomaneoNuevo) {
                    const stock = await ProductStock.findOne({ where: { product_name: tipo } });
                    if (stock) {
                        stock.product_quantity += Number(cant || 0);
                        stock.product_total_weight += Number(unidades || 0);
                        await stock.save();
                    } else {
                        await ProductStock.create({
                            product_name: tipo,
                            product_quantity: Number(cant || 0),
                            product_total_weight: Number(unidades || 0),
                            product_cod: cod || null,
                            product_category: categoria || null
                        });
                    }
                }
            }

            return res.status(200).json({ message: "Registro actualizado correctamente.", id });
        } catch (error) {
            console.error("Error al actualizar proveedor:", error);
            return res.status(500).json({ message: "Error interno del servidor", error: error.message });
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
            const cortes = await meatIncome.findAll({ where: { id_bill_suppliers: id } });

            const observacionData = await ObservationsMeatIncome.findOne({ where: { id: id } });

            res.json({
                cortes,
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
            if (peso_total_neto_cargado != null) {
                await MeatIncomeManualWeight.upsert({
                    bill_supplier_id: id,
                    total_weight: Number(
                        peso_total_neto_cargado.toFixed
                            ? peso_total_neto_cargado.toFixed(2)
                            : peso_total_neto_cargado
                    ),
                });
            }

            const updateData = {};
            if (cantidad_animales_cargados != null) updateData.quantity = cantidad_animales_cargados;
            if (cantidad_cabezas_cargadas != null) updateData.head_quantity = cantidad_cabezas_cargadas;
            if (fresh_quantity != null) updateData.fresh_quantity = fresh_quantity;
            if (fresh_weight != null) updateData.fresh_weight = fresh_weight;

            if (Object.keys(updateData).length > 0) {
                await billSupplier.update(updateData, { where: { id } }); // <- minúscula
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
    const { cortes, bill_ids, subproduction = [] } = req.body;

    // Validaciones básicas de arrays
    if (
      !Array.isArray(cortes) ||
      cortes.length === 0 ||
      !Array.isArray(bill_ids) ||
      bill_ids.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Faltan cortes o comprobantes para asociar." });
    }

    // Helpers para validar / convertir valores
    const esTextoValido = (v) =>
      typeof v === "string" && v.trim().length > 0;

    const toNumero = (v, defecto = 0) => {
      if (v === null || v === undefined || v === "") return defecto;
      const n = Number(v);
      return Number.isFinite(n) ? n : defecto;
    };

    t = await sequelize.transaction();

    // === 1) Obtener / generar número de proceso ===
    const ultimoProceso = await ProcessNumber.findOne({
      order: [["process_number", "DESC"]],
      transaction: t,
    });
    const nuevoProcessNumber = ultimoProceso
      ? ultimoProceso.process_number + 1
      : 1;

    // Guardar la relación proceso ↔ remitos
    for (const bill_id of bill_ids) {
      await ProcessNumber.create(
        {
          bill_id,
          process_number: nuevoProcessNumber,
        },
        { transaction: t }
      );
    }

    // === 2) Guardar cortes + sumar stock de productos "hijo" ===
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

      // --- VALIDACIÓN LÓGICA, PERMITIENDO CEROS ---
      if (!esTextoValido(type)) {
        await t.rollback();
        return res.status(400).json({
          message:
            "Falta el tipo de corte (type) o es inválido en algún corte.",
        });
      }

      const qtyNum = toNumero(quantity, 0); // puede ser 0 (por ejemplo en productos en kg)
      const netNum = toNumero(net_weight, 0);

      // El peso neto sí debe ser > 0 para que tenga sentido guardar el corte
      if (netNum <= 0) {
        await t.rollback();
        return res.status(400).json({
          message:
            "El peso neto (net_weight) es obligatorio y debe ser mayor a 0 en cada corte.",
        });
      }

      const avgNum = toNumero(average, 0);
      const grossNum = toNumero(gross_weight, 0);
      const taresNum = toNumero(tares, 0);
      const headCountNum = toNumero(head_count, 0); // opcional, default 0
      const romaneoNum = toNumero(romaneo_weight, 0); // opcional, default 0

      let baseProduct = null;
      let productName = null;

      // Si viene un ID numérico en "type", buscamos por PK; si no, por nombre
      if (!Number.isNaN(Number(type))) {
        baseProduct = await ProductsAvailable.findByPk(type, {
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
          return res
            .status(400)
            .json({ message: `No se encontró ningún producto con ID ${type}` });
        }
        productName = baseProduct.product_name;
      } else {
        baseProduct = await ProductsAvailable.findOne({
          where: { product_name: type },
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
        productName = baseProduct.product_name;
      }

      // Valores por defecto si no vienen description / unit_type desde el front
      const finalDescription = esTextoValido(description)
        ? description.trim()
        : productName; // por defecto usamos el nombre del producto

      const finalUnitType = esTextoValido(unit_type)
        ? unit_type.trim()
        : baseProduct.unit_measure || baseProduct.unit_type || "kg"; // fallback

      // Guardamos el corte en ProcessMeat (TODOS los NOT NULL cubiertos)
      await ProcessMeat.create(
        {
          // campos NOT NULL del modelo
          type: productName,          // columna type en ProcessMeat
          average: avgNum,            // NOT NULL
          gross_weight: grossNum,     // NOT NULL
          tares: taresNum,            // NOT NULL

          // resto de la info
          product_name: productName,
          description: finalDescription,
          unit_type: finalUnitType,
          quantity: qtyNum,
          net_weight: netNum,
          head_count: headCountNum,
          romaneo_weight: romaneoNum,
          process_number: nuevoProcessNumber,
        },
        { transaction: t }
      );

      // Guardar subproducción (si viene) y sumar stock de subproductos
      if (Array.isArray(subproduction) && subproduction.length > 0) {
        for (const sub of subproduction) {
          const {
            subproduct_name,
            subproduct_quantity,
            subproduct_weight,
            category,
          } = sub;

          const subQty = toNumero(subproduct_quantity, 0);
          const subWeight = toNumero(subproduct_weight, 0);

          if (!esTextoValido(subproduct_name) || subQty <= 0 || subWeight <= 0) {
            // si hay datos inválidos en un subproducto, lo ignoramos
            continue;
          }

          await Subproduction.create(
            {
              process_number: nuevoProcessNumber,
              subproduct_name,
              subproduct_quantity: subQty,
              subproduct_weight: subWeight,
              category,
            },
            { transaction: t }
          );

          let stockSub = await ProductStock.findOne({
            where: { product_name: subproduct_name },
            transaction: t,
          });

          if (stockSub) {
            await stockSub.increment(
              {
                product_quantity: subQty,
                product_total_weight: subWeight,
              },
              { transaction: t }
            );
          } else {
            await ProductStock.create(
              {
                product_name: subproduct_name,
                product_quantity: subQty,
                product_total_weight: subWeight,
                product_cod: null,
              },
              { transaction: t }
            );
          }
        }
      }

      // Sumar stock del producto resultante del desposte (producto "hijo")
      let existingChild = await ProductStock.findOne({
        where: { product_name: productName },
        transaction: t,
      });

      if (existingChild) {
        await existingChild.increment(
          {
            product_quantity: qtyNum,
            product_total_weight: netNum,
          },
          { transaction: t }
        );
      } else {
        await ProductStock.create(
          {
            product_name: productName,
            product_quantity: qtyNum,
            product_total_weight: netNum,
            product_cod: baseProduct.id,
            product_category: baseProduct.category?.category_name ?? null,
          },
          { transaction: t }
        );
      }
    }

    // === 3) Descontar STOCK PRINCIPAL usando lo que vino en los remitos ===
    const validBillIds = bill_ids
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (validBillIds.length) {
      const usageByParent = {}; // { [nombreProducto]: { qty, weight } }

      // Traemos los comprobantes para saber si son romaneo o manual
      const bills = await billSupplier.findAll({
        where: { id: { [Op.in]: validBillIds } },
        attributes: ["id", "income_state"],
        transaction: t,
      });

      for (const bill of bills) {
        const billId = bill.id;
        const tipoIngreso = bill.income_state; // "romaneo" | "manual" | etc.

        if (tipoIngreso === "manual") {
          // Si el comprobante es MANUAL → leer solo MeatIncome
          const manualRows = await meatIncome.findAll({
            where: { id_bill_suppliers: billId },
            transaction: t,
          });

          for (const row of manualRows) {
            const name = (row.products_name || "").trim();
            if (!name) continue;

            if (!usageByParent[name]) {
              usageByParent[name] = { qty: 0, weight: 0 };
            }

            usageByParent[name].qty += Number(row.products_quantity || 0);
            usageByParent[name].weight += Number(row.net_weight || 0);
          }
        } else {
          // En cualquier otro caso (romaneo, etc.) → leer solo BillDetail
          const romaneoRows = await billDetail.findAll({
            where: { bill_supplier_id: billId },
            transaction: t,
          });

          for (const row of romaneoRows) {
            const name = (row.type || "").trim();
            if (!name) continue;

            if (!usageByParent[name]) {
              usageByParent[name] = { qty: 0, weight: 0 };
            }

            usageByParent[name].qty += Number(row.quantity || 0);
            usageByParent[name].weight += Number(row.weight || 0);
          }
        }
      }

      // 3.c) Aplicar el descuento en product_stock
      for (const [parentName, used] of Object.entries(usageByParent)) {
        const stockParent = await ProductStock.findOne({
          where: { product_name: parentName },
          transaction: t,
        });

        if (!stockParent) continue;

        const currentQty = Number(stockParent.product_quantity || 0);
        const currentWeight = Number(stockParent.product_total_weight || 0);

        const newQty = Math.max(0, currentQty - used.qty);
        const newWeight = Math.max(0, currentWeight - used.weight);

        await stockParent.update(
          {
            product_quantity: newQty,
            product_total_weight: newWeight,
          },
          { transaction: t }
        );
      }
    }

    // === 4) Marcar remitos como procesados (si aplica en tu lógica)
    if (validBillIds.length) {
      await billSupplier.update(
        { process_state: "procesado" },
        {
          where: { id: { [Op.in]: validBillIds } },
          transaction: t,
        }
      );
    }

    // Tabla intermedia opcional de subproducción por proceso/remito
    if (Array.isArray(subproduction) && subproduction.length > 0) {
      const rows = subproduction
        .map((s) => ({
          process_number: nuevoProcessNumber,
          cut_name: String(s.cut_name || s.tipo || s.producto || "").trim(),
          quantity: toNumero(s.quantity ?? s.cantidad, 0),
        }))
        .filter((r) => r.cut_name && !Number.isNaN(r.quantity));

      if (rows.length) {
        await ProductionProcessSubproduction.bulkCreate(rows, {
          transaction: t,
        });
      }
    }

    await t.commit();
    return res.status(201).json({
      message: "Cortes y proceso guardados, stock ajustado.",
      process_number: nuevoProcessNumber,
    });
  } catch (error) {
    if (t) {
      try {
        await t.rollback();
      } catch (e) {}
    }
    console.error("uploadProductsProcess error:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
},




getAllSubproduction :async (req, res) => {
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
            const billDetailsUpdate = await billDetail.findAll({ where: { bill_supplier_id: id } });

            const detalles = billDetailsUpdate.map(det => ({
                id: det.id,
                tipo: det.type,
                cantidad: det.quantity,
                cabezas: det.heads,
                peso: det.weight,
                pesoRomaneo: det.weight,
                identification_product: det.identification_product
            }));

            // Criterio: con cabezas => cortes; sin cabezas y con peso => congelados
            const cortes = detalles.filter(d => Number(d.cabezas || 0) > 0);
            const congelados = detalles.filter(d =>
                Number(d.cabezas || 0) === 0 && Number(d.peso || 0) > 0
            );

            return res.json({
                proveedor: billSupplierUpdate.supplier,
                peso_total: billSupplierUpdate.total_weight,
                romaneo: billSupplierUpdate.romaneo_number,
                internal_number: billSupplierUpdate.id,
                tipo_ingreso: billSupplierUpdate.income_state,
                detalles: cortes,
                congelados
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
                    tipo, garron, cabeza, cantidad,
                    pesoBruto, tara, pesoNeto, pesoProveedor,
                    mermaPorcentaje, cod, categoria
                } = corte;

                if (!tipo || !garron || cabeza == null || cantidad == null || pesoBruto == null || tara == null || pesoNeto == null) {
                    return res.status(400).json({ mensaje: "Faltan campos obligatorios en al menos un producto." });
                }


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
                });

                // stock
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
                await ObservationsMeatIncome.create({ id: Supplierid, observation: observacion });
            }

            return res.status(201).json({ mensaje: "Todos los productos fueron cargados correctamente." });
        } catch (error) {
            console.error("Error en la base de datos:", error);
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

            // 1) Restar del stock lo anterior
            const anteriores = await meatIncome.findAll({ where: { id_bill_suppliers: Supplierid } });
            for (const item of anteriores) {
                const stock = await ProductStock.findOne({ where: { product_name: item.products_name } });
                if (stock) {
                    stock.product_quantity -= Number(item.products_quantity || 0);
                    stock.product_total_weight -= Number(item.net_weight || 0);
                    if (stock.product_quantity < 0) stock.product_quantity = 0;
                    if (stock.product_total_weight < 0) stock.product_total_weight = 0;
                    await stock.save();
                }
            }

            // 2) Borrar los cortes anteriores del remito
            await meatIncome.destroy({ where: { id_bill_suppliers: Supplierid } });

            // 3) Insertar los nuevos cortes (permitiendo garrones repetidos)
            for (const corte of cortes) {
                const {
                    tipo, garron, cabeza, cantidad,
                    pesoBruto, tara, pesoNeto, pesoProveedor,
                    cod, categoria, mermaPorcentaje
                } = corte;

                if (!tipo || !garron || cabeza == null || cantidad == null || pesoBruto == null || tara == null || pesoNeto == null) {
                    return res.status(400).json({ mensaje: "Faltan campos obligatorios en al menos un producto." });
                }

                // ❌ No usar: id: garron
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
                });

                // Sumar al stock
                const stock = await ProductStock.findOne({ where: { product_name: tipo } });
                if (stock) {
                    stock.product_quantity += Number(cantidad || 0);
                    stock.product_total_weight += Number(pesoNeto || 0);
                    await stock.save();
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
            console.error("Error al actualizar los cortes:", error);
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

            // 2. Buscar el producto exacto en ProductStock (coincidencia exacta)
            const productoStock = await ProductStock.findOne({
                where: { product_name: nombreProducto },
            });

            if (productoStock) {
                // 3. Restar la cantidad del stock
                const cantidadActual = Number(productoStock.product_quantity || 0);
                const cantidadARestar = Number(item.products_quantity || 0);
                const nuevaCantidad = cantidadActual - cantidadARestar;

                await productoStock.update({
                    product_quantity: nuevaCantidad < 0 ? 0 : nuevaCantidad,
                });

                console.log(`🟢 Stock actualizado: ${nombreProducto} → ${nuevaCantidad}`);
            } else {
                console.warn(`⚠️ Producto "${nombreProducto}" no encontrado en ProductStock.`);
            }

            // 4. Eliminar el item
            await meatIncome.destroy({ where: { id } });

            // 5. Devolver resultado
            return res.status(200).json({
                mensaje: "Item eliminado con éxito y stock actualizado.",
                itemEliminado: {
                    id: item.id,
                    producto: item.products_name,
                    cantidad: item.products_quantity,
                    garron: item.products_garron,
                    peso: item.net_weight,
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


    deleteProduct: async (req, res) => {
        try {
            const id = req.params.id;

            // Buscar proveedor
            const ConstbillSupplier = await billSupplier.findOne({ where: { id } });
            if (!ConstbillSupplier) {
                return res.status(404).json({ mensaje: "El proveedor no existe" });
            }

            // Obtener cortes en meat_manual_income (manual)
            const meatIncomes = await meatIncome.findAll({ where: { id_bill_suppliers: id } });

            // Obtener detalles en bill_details (por ejemplo, romaneo)
            const billDetails = await billDetail.findAll({ where: { bill_supplier_id: id } });

            // Actualizar stock para cortes manuales (meat_manual_income)
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

            // Actualizar stock para bill details (romaneo)
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

            // Eliminar registros relacionados
            await meatIncome.destroy({ where: { id_bill_suppliers: id } });
            await billDetail.destroy({ where: { bill_supplier_id: id } });
            await billSupplier.destroy({ where: { id } });

            return res.status(200).json({ mensaje: "Proveedor y registros asociados eliminados. Stock actualizado correctamente." });
        } catch (error) {
            console.error("Error al eliminar el proveedor:", error);
            return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
        }
    },
    deactivateProduct: async (req, res) => {
  try {
    const id = req.params.id;

    const bill = await billSupplier.findOne({ where: { id } });
    if (!bill) {
      return res.status(404).json({ mensaje: "El comprobante no existe" });
    }
    if (bill.bill_state === false) {
      return res.status(400).json({ mensaje: "El comprobante ya está dado de baja" });
    }

    // Cortes cargados por manual
    const meatIncomes = await meatIncome.findAll({
      where: { id_bill_suppliers: id },
    });

    // Detalles del romaneo
    const billDetails = await billDetail.findAll({
      where: { bill_supplier_id: id },
    });

    // 🔻 Restar del stock cortes manuales
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

    // 🔻 Restar del stock detalles del romaneo
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

    // ✅ Marcar como dado de baja (NO se borran los registros)
    await billSupplier.update(
      { bill_state: false },
      { where: { id } }
    );

    return res
      .status(200)
      .json({ mensaje: "Ingreso dado de baja. Stock actualizado correctamente." });
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
                attributes: ['id', 'product_name', 'product_general_category', 'category_id'],
                include: [
                    {
                        model: db.ProductCategories,
                        as: 'category',
                        attributes: ['id', 'category_name']
                    }
                ]
            });

            res.json(allProductsCategories);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
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
                } = item;

                const productoBase = await ProductsAvailable.findOne({
                    where: { product_name },
                    include: {
                        model: ProductCategories,
                        as: "category",
                        attributes: ["category_name"],
                    },
                });

                if (!productoBase || !productoBase.id) {
                    return res.status(400).json({ mensaje: `No se puede guardar "${product_name}" porque falta ID en ProductsAvailable.` });
                }

                const categoriaNombre = productoBase.category?.category_name ?? null;

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
                });

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
            res.status(201).json({ mensaje: "Productos agregados correctamente." });
        } catch (error) {
            console.error("Error addOtherProductsManual:", error);
            return res.status(500).json({ mensaje: "Error interno del servidor." });
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

            await OtherProductManual.destroy({ where: { id_bill_suppliers: id }, transaction: t });

            for (const prod of congelados) {
                const {
                    product_name,
                    product_quantity,
                    product_net_weight,
                    product_gross_weight,
                    product_portion,
                    decrease = 0,
                } = prod;

                if (!product_name || product_quantity == null || product_net_weight == null) {
                    return res.status(400).json({ mensaje: "Faltan campos obligatorios en al menos un producto congelado." });
                }

                const productoBase = await ProductsAvailable.findOne({
                    where: { product_name },
                    include: {
                        model: ProductCategories,
                        as: "category",
                        attributes: ["category_name"],
                    },
                });

                if (!productoBase || !productoBase.id) {
                    return res.status(400).json({ mensaje: `No se puede crear registro para "${product_name}" porque falta ID en ProductsAvailable.` });
                }

                const categoriaNombre = productoBase.category?.category_name ?? null;

                await OtherProductManual.create({
                    product_name,
                    product_quantity,
                    product_net_weight,
                    product_gross_weight,
                    product_portion,
                    decrease,
                    id_bill_suppliers: id,
                    product_cod: productoBase.id,
                    product_category: categoriaNombre,
                }, { transaction: t });
            }

            const productosEnBill = await OtherProductManual.findAll({ where: { id_bill_suppliers: id } });
            for (const prod of productosEnBill) {
                const { product_name, product_quantity, product_net_weight } = prod;
                let stock = await ProductStock.findOne({ where: { product_name } });
                if (stock) {
                    stock.product_quantity += Number(product_quantity);
                    stock.product_total_weight += Number(product_net_weight);
                    await stock.save({ transaction: t });
                } else {
                    const productoBase = await ProductsAvailable.findOne({
                        where: { product_name },
                        include: {
                            model: ProductCategories,
                            as: "category",
                            attributes: ["category_name"],
                        },
                    });
                    if (!productoBase || !productoBase.id) {
                        return res.status(400).json({ mensaje: `No se puede crear stock para "${product_name}" porque falta ID en ProductsAvailable.` });
                    }
                    const categoriaNombre = productoBase.category?.category_name ?? null;
                    await ProductStock.create({
                        product_name,
                        product_quantity,
                        product_cod: productoBase.id,
                        product_category: categoriaNombre,
                    }, { transaction: t });
                }
            }

            await t.commit();
            res.status(200).json({ mensaje: "Productos congelados editados correctamente." });
        } catch (error) {
            await t.rollback();
            console.error("Error editOtherProductsManual:", error);
            res.status(500).json({ mensaje: "Error interno del servidor." });
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

                await productoStock.update({
                    product_quantity: nuevaCantidad < 0 ? 0 : nuevaCantidad,
                });

                console.log(` Stock actualizado: ${nombreProducto} → ${nuevaCantidad}`);
            } else {
                console.warn(`Producto congelado "${nombreProducto}" no encontrado en ProductStock.`);
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
            console.error(" Error al eliminar producto congelado:", error);
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


billDetailsReadonly: async (req, res) => {
  try {
    const id = req.params.id;
    const bill = await billSupplier.findOne({ where: { id } });

    if (!bill) {
      return res.status(404).json({ message: "Comprobante no encontrado" });
    }

    let data = [];

    if (bill.income_state === "manual") {
      // 📦 Si el comprobante es MANUAL → leer de meat_manual_income
      const rows = await meatIncome.findAll({ where: { id_bill_suppliers: id } });

      data = rows.map(r => ({
        type: r.products_name,                          // nombre del producto
        quantity: Number(r.products_quantity || 0),      // cantidad
        weight: Number(r.gross_weight || 0),             // peso bruto (equivale al neto cargado)
        source: "manual"
      }));

    } else {
      // 📦 Si el comprobante es ROMANEO → leer de bill_details
      const rows = await billDetail.findAll({ where: { bill_supplier_id: id } });

      data = rows.map(r => ({
        type: r.type,                                    // nombre del producto
        quantity: Number(r.quantity || 0),               // cantidad
        weight: Number(r.weight || 0),                   // peso romaneo (neto)
        source: "romaneo"
      }));
    }

    return res.json(data);

  } catch (err) {
    console.error("billDetailsReadonly error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
},


billDetails:async (req, res) => {
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
        quantity: Number(r.products_quantity||0),
        heads: Number(r.product_head||0),
        weight: Number(r.net_weight||0)
      }));
      return res.json(data);
    } else {
      // bill_details (romaneo)
      const rows = await billDetail.findAll({ where: { bill_supplier_id: id } });
      const data = rows.map(r => ({
        id: r.id,
        type: r.type,
        quantity: Number(r.quantity||0),
        heads: Number(r.heads||0),
        weight: Number(r.weight||0)
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

    const cuts = await ProcessMeat.findAll({ where: { process_number }, order: [["id","ASC"]] });
    const pn = await ProcessNumber.findAll({ where: { process_number } });
    const bills = pn.map(r => r.bill_id);
    const sub = await ProductionProcessSubproduction.findAll({ where: { process_number }, order: [["id","ASC"]] });

    return res.json({ cuts, bills, subproduction: sub });
  } catch (err) {
    console.error("getProcessByNumber error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
},

// === Actualizar (reemplazar) un proceso existente por process_number
updateProcessByNumber: async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const process_number = Number(req.params.process_number);
    if (!process_number) {
      await t.rollback();
      return res.status(400).json({ message: "process_number requerido" });
    }

    const { cortes = [], bill_ids = [], subproduction = [] } = req.body;

    // 1) borrar lo anterior
    await ProcessMeat.destroy({ where: { process_number }, transaction: t });
    await ProductionProcessSubproduction.destroy({ where: { process_number }, transaction: t });
    await ProcessNumber.destroy({ where: { process_number }, transaction: t });

    // 2) recrear con datos nuevos
    for (const c of cortes) {
      await ProcessMeat.create({
        process_number,
        type: String(c.type || "").trim(),
        average: Number(c.average || 0),
        quantity: Number(c.quantity || 0),
        gross_weight: Number(c.gross_weight || 0),
        tares: Number(c.tares || 0),
        net_weight: Number(c.net_weight || 0),
      }, { transaction: t });
    }

    for (const id of bill_ids) {
      await ProcessNumber.create({ process_number, bill_id: Number(id) }, { transaction: t });
    }

    for (const s of subproduction) {
      const cut_name = String(s.cut_name || "").trim();
      const quantity = Number(s.quantity || 0);
      if (cut_name && quantity > 0) {
        await ProductionProcessSubproduction.create({ process_number, cut_name, quantity }, { transaction: t });
      }
    }

    await t.commit();
    return res.json({ ok: true, process_number });
  } catch (err) {
    console.error("updateProcessByNumber error:", err);
    try { await t.rollback(); } catch {}
    return res.status(500).json({ message: "Error interno del servidor" });
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