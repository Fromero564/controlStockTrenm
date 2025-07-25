const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");
const moment = require("moment");


const ProductsAvailable = db.ProductsAvailable;
const ProductSubproduct = db.ProductSubproduct;
const Provider = db.Provider;
const billDetail = db.BillDetail;
const ProductCategories = db.ProductCategories
const Client = db.Client;
const Warehouses = db.Warehouses;
const WarehouseStock = db.WarehouseStock;
const billSupplier = db.BillSupplier;
const ProcessMeat = db.ProcessMeat;
const ProductStock = db.ProductStock;


const administrativeApiController = {
  // loadNewProduct: async (req, res) => {
  //   try {
  //     const {
  //       product_name,
  //       category_id,
  //       product_general_category,
  //       min_stock,
  //       max_stock
  //     } = req.body;


  //     if (
  //       !product_name ||
  //       !category_id ||
  //       !product_general_category ||
  //       min_stock === undefined ||
  //       max_stock === undefined
  //     ) {
  //       return res.status(400).json({ mensaje: "Faltan campos obligatorios." });
  //     }


  //     const min = parseInt(min_stock);
  //     const max = parseInt(max_stock);

  //     if (isNaN(min) || isNaN(max)) {
  //       return res.status(400).json({ mensaje: "El stock mínimo y máximo deben ser números válidos." });
  //     }

  //     if (min > max) {
  //       return res.status(400).json({ mensaje: "El stock mínimo no puede ser mayor que el stock máximo." });
  //     }

  //     await ProductsAvailable.create({
  //       product_name,
  //       category_id,
  //       product_general_category,
  //       min_stock: min,
  //       max_stock: max
  //     });

  //     res.status(201).json({ mensaje: 'Producto registrado con éxito' });
  //   } catch (error) {
  //     console.error("Error al registrar producto:", error);
  //     res.status(500).json({ mensaje: 'Error al registrar el producto', error });
  //   }
  // },


  loadNewProvider: async (req, res) => {
    const {
      nombreProveedor,
      identidad,
      numeroIdentidad,
      ivaCondicion,
      emailProveedor,
      telefonoProveedor,
      domicilioProveedor,
      paisProveedor,
      provinciaProveedor,
      localidadProveedor
    } = req.body;

    // Validar CUIT
    const proveedorPorCuit = await Provider.findOne({
      where: {
        provider_id_number: numeroIdentidad,
      }
    });

    // Validar nombre
    const proveedorPorNombre = await Provider.findOne({
      where: {
        provider_name: nombreProveedor.toUpperCase(),
      }
    });

    if (proveedorPorCuit) {
      return res.status(400).json({ mensaje: 'El CUIT ya está registrado.' });
    }

    if (proveedorPorNombre) {
      return res.status(400).json({ mensaje: 'El nombre de proveedor ya existe.' });
    }

    // Si no existen, crear el proveedor
    await Provider.create({
      provider_name: nombreProveedor.toUpperCase(),
      provider_type_id: identidad.toUpperCase(),
      provider_id_number: numeroIdentidad,
      provider_iva_condition: ivaCondicion.toUpperCase(),
      provider_email: emailProveedor,
      provider_phone: telefonoProveedor,
      provider_adress: domicilioProveedor.toUpperCase(),
      provider_country: paisProveedor.toUpperCase(),
      provider_province: provinciaProveedor.toUpperCase(),
      provider_location: localidadProveedor.toUpperCase()
    });

    return res.status(201).json({ mensaje: 'Ingreso registrado con éxito' });
  },

  filterProvider: async (req, res) => {
    const { id } = req.params;

    try {
      const filterProviderData = await Provider.findOne({ where: { id } });

      if (!filterProviderData) {
        return res.status(404).json({ mensaje: "Proveedor no encontrado" });
      }



      return res.status(200).json(filterProviderData);
    } catch (error) {
      console.error("Error al buscar proveedor:", error);
      return res.status(500).json({ mensaje: "Error del servidor" });
    }
  },
  filterClient: async (req, res) => {
    const { id } = req.params;

    try {
      const filterClientData = await Client.findOne({ where: { id } });

      if (!filterClientData) {
        return res.status(404).json({ mensaje: "Cliente no encontrado" });
      }



      return res.status(200).json(filterClientData);
    } catch (error) {
      console.error("Error al buscar cliente:", error);
      return res.status(500).json({ mensaje: "Error del servidor" });
    }
  },
  editClient: async (req, res) => {
    const { id } = req.params;
    const {
      nombreCliente,
      identidad,
      numeroIdentidad,
      ivaCondicion,
      emailCliente,
      telefonoCliente,
      domicilioCliente,
      paisCliente,
      provinciaCliente,
      localidadCliente,
      estadoCliente,
    } = req.body;

    try {
      await Client.update({
        client_name: nombreCliente.toUpperCase(),
        client_type_id: identidad.toUpperCase(),
        client_id_number: numeroIdentidad,
        client_iva_condition: ivaCondicion.toUpperCase(),
        client_email: emailCliente,
        client_phone: telefonoCliente,
        client_adress: domicilioCliente.toUpperCase(),
        client_country: paisCliente.toUpperCase(),
        client_province: provinciaCliente.toUpperCase(),
        client_location: localidadCliente.toUpperCase(),
        client_state: estadoCliente,
      }, {
        where: { id: id }
      });

      return res.status(200).json({ mensaje: "Cliente actualizado" });
    } catch (error) {
      console.error("Error al actualizar:", error);
      return res.status(500).json({ mensaje: "Error del servidor" });
    }
  },
  editProvider: async (req, res) => {
    const { id } = req.params;
    const {
      nombreProveedor,
      identidad,
      numeroIdentidad,
      ivaCondicion,
      emailProveedor,
      telefonoProveedor,
      domicilioProveedor,
      paisProveedor,
      provinciaProveedor,
      localidadProveedor
    } = req.body;

    try {
      await Provider.update({
        provider_name: nombreProveedor,
        provider_type_id: identidad,
        provider_id_number: numeroIdentidad,
        provider_iva_condition: ivaCondicion,
        provider_email: emailProveedor,
        provider_phone: telefonoProveedor,
        provider_adress: domicilioProveedor,
        provider_country: paisProveedor,
        provider_province: provinciaProveedor,
        provider_location: localidadProveedor
      }, {
        where: { id: id }
      });

      return res.status(200).json({ mensaje: "Proveedor actualizado" });
    } catch (error) {
      console.error("Error al actualizar:", error);
      return res.status(500).json({ mensaje: "Error del servidor" });
    }
  },
  deleteProvider: async (req, res) => {
    const { id } = req.params;
    try {
      await Provider.destroy({ where: { id } });
      return res.status(200).json({ mensaje: "Proveedor eliminado" });
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      return res.status(500).json({ mensaje: "Error del servidor" });
    }
  },
  deleteClient: async (req, res) => {
    const { id } = req.params;
    try {
      await Client.destroy({ where: { id } });
      return res.status(200).json({ mensaje: "Cliente eliminado" });
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      return res.status(500).json({ mensaje: "Error del servidor" });
    }
  },


  loadNewClient: async (req, res) => {

    const { nombreCliente, identidad, numeroIdentidad, ivaCondicion, emailCliente, telefonoCliente, domicilioCliente, paisCliente, provinciaCliente, localidadCliente, client_state } = req.body;

    const clienteExistente = await Client.findOne({
      where: {
        client_id_number: numeroIdentidad,
      }
    });

    if (!clienteExistente) {
      await Client.create({
        client_name: nombreCliente.toUpperCase(),
        client_type_id: identidad.toUpperCase(),
        client_id_number: numeroIdentidad,
        client_iva_condition: ivaCondicion.toUpperCase(),
        client_email: emailCliente,
        client_phone: telefonoCliente,
        client_adress: domicilioCliente.toUpperCase(),
        client_country: paisCliente.toUpperCase(),
        client_province: provinciaCliente.toUpperCase(),
        client_location: localidadCliente.toUpperCase(),
        client_state: client_state === true || client_state === "true" ? true : false
      });

      return res.status(201).json({ mensaje: 'Ingreso registrado con éxito' });
    } else {
      return res.status(400).json({ mensaje: 'El cliente con ese código ya existe' });
    }
  },

  allProviders: async (req, res) => {

    try {
      const allproviders = await Provider.findAll();
      res.json(allproviders);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  },
  allClients: async (req, res) => {

    try {
      const allClients = await Client.findAll();
      res.json(allClients);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  },

  allProductCategories: async (req, res) => {
    try {
      const allProductCategories = await ProductCategories.findAll({});
      res.json(allProductCategories);
    } catch (error) {
      console.error("Error al obtener categorias:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  },

  deleteProductCategory: async (req, res) => {
    const { id } = req.params;

    try {

      const productosUsandoCategoria = await ProductsAvailable.findAll({
        where: { category_id: id }
      });

      if (productosUsandoCategoria.length > 0) {
        return res.status(400).json({
          mensaje: "No se puede eliminar la categoría porque está siendo utilizada por productos."
        });
      }

      await db.ProductCategories.destroy({ where: { id } });
      return res.status(200).json({ mensaje: "Categoría eliminada correctamente." });

    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      return res.status(500).json({ mensaje: "Error del servidor." });
    }
  },

  editCategory: async (req, res) => {

    const { id } = req.params;
    const { category_name } = req.body;

    // Validación: nombre obligatorio
    if (!category_name || category_name.trim() === "") {
      return res.status(400).json({ error: "El nombre de la categoría es obligatorio." });
    }

    const formattedName = category_name.trim().toUpperCase();

    try {
      // Buscar categoría por ID
      const categoria = await ProductCategories.findByPk(id);

      if (!categoria) {
        return res.status(404).json({ error: "Categoría no encontrada." });
      }

      // Actualizar
      await categoria.update({ category_name: formattedName });

      return res.status(200).json({ message: "Categoría actualizada correctamente." });

    } catch (error) {
      console.error("Error al editar categoría:", error);
      return res.status(500).json({ error: "Error del servidor al actualizar la categoría." });
    }


  },
  getProductCategoryById: async (req, res) => {
    const { id } = req.params;

    try {
      const category = await ProductCategories.findByPk(id);

      if (!category) {
        return res.status(404).json({ mensaje: "Categoría no encontrada." });
      }

      return res.status(200).json(category);
    } catch (error) {
      console.error("Error al obtener categoría:", error);
      return res.status(500).json({ mensaje: "Error del servidor." });
    }
  },

  loadNewWarehouse: async (req, res) => {
    try {
      const { warehouse_name } = req.body;

      if (!warehouse_name || warehouse_name.trim() === "") {
        return res.status(400).json({ mensaje: "El nombre del depósito es obligatorio." });
      }

      const nombreFormateado = warehouse_name.trim().toUpperCase();

      // Verificamos si ya existe uno con el mismo nombre
      const existing = await Warehouses.findOne({
        where: { Warehouse_name: nombreFormateado }
      });

      if (existing) {
        return res.status(409).json({ mensaje: "Ya existe un depósito con ese nombre." });
      }

      await Warehouses.create({
        Warehouse_name: nombreFormateado
      });

      return res.status(201).json({ mensaje: "Depósito creado exitosamente." });

    } catch (error) {
      console.error("Error al crear depósito:", error);
      return res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  },
  editWarehouse: async (req, res) => {
    try {
      const { id } = req.params;
      const { warehouse_name } = req.body;

      if (!id || !warehouse_name || warehouse_name.trim() === "") {
        return res.status(400).json({ mensaje: "ID y nombre son requeridos." });
      }

      const nombreFormateado = warehouse_name.trim().toUpperCase();

      const warehouse = await db.Warehouses.findByPk(id);
      if (!warehouse) {
        return res.status(404).json({ mensaje: "Depósito no encontrado." });
      }

      await warehouse.update({ Warehouse_name: nombreFormateado });

      return res.status(200).json({ mensaje: "Depósito actualizado correctamente." });
    } catch (error) {
      console.error("Error al editar depósito:", error);
      return res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  },
  deleteWarehouse: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ mensaje: "ID requerido para eliminar." });
      }

      const warehouse = await db.Warehouses.findByPk(id);
      if (!warehouse) {
        return res.status(404).json({ mensaje: "Depósito no encontrado." });
      }

      await warehouse.destroy();

      return res.status(200).json({ mensaje: "Depósito eliminado correctamente." });
    } catch (error) {
      console.error("Error al eliminar depósito:", error);
      return res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  },
  getAllWarehouses: async (req, res) => {
    try {
      const warehouses = await db.Warehouses.findAll({
        order: [["id", "ASC"]],
      });

      return res.status(200).json(warehouses);
    } catch (error) {
      console.error("Error al obtener los depósitos:", error);
      return res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  },
  getOneWarehouse: async (req, res) => {
    const { id } = req.params;

    try {
      const warehouse = await Warehouses.findByPk(id);

      if (!warehouse) {
        return res.status(404).json({ mensaje: "Depósito no encontrado." });
      }

      return res.status(200).json(warehouse);
    } catch (error) {
      console.error("Error al obtener depósito:", error);
      return res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  },
  getAllWarehouseStock: async (req, res) => {
    try {
      const data = await WarehouseStock.findAll({
        include: [{ model: Warehouses, as: "warehouse" }],
        order: [["id_warehouse", "ASC"]]
      });
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener stock por depósito:", error);
      return res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  },
  assignStockToWarehouse: async (req, res) => {
    const { id_warehouse, product_name, quantity } = req.body;

    if (!id_warehouse || !product_name || quantity == null) {
      return res.status(400).json({ mensaje: "Faltan datos" });
    }

    try {

      const totalGeneral = await ProductsAvailable.findOne({
        where: { product_name }
      });

      if (!totalGeneral) {
        return res.status(404).json({ mensaje: "Producto no encontrado en stock general" });
      }

      const totalAsignado = await WarehouseStock.sum("quantity", {
        where: { product_name }
      });

      const disponible = totalGeneral.product_quantity - (totalAsignado || 0);

      if (quantity > disponible) {
        return res.status(400).json({
          mensaje: `No hay suficiente stock disponible. Disponible: ${disponible}`
        });
      }


      const existing = await WarehouseStock.findOne({
        where: { id_warehouse, product_name }
      });

      if (existing) {
        existing.quantity += quantity;
        await existing.save();
      } else {
        await WarehouseStock.create({
          id_warehouse,
          product_name,
          quantity
        });
      }

      return res.status(200).json({ mensaje: "Stock asignado correctamente." });
    } catch (error) {
      console.error("Error al asignar stock:", error);
      return res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  },
  removeFromWarehouse: async (req, res) => {
    const { id_warehouse, product_name, quantity } = req.body;

    try {
      const registro = await WarehouseStock.findOne({
        where: { id_warehouse, product_name }
      });

      if (!registro || registro.quantity < quantity) {
        return res.status(400).json({ mensaje: "No hay suficiente stock en el depósito." });
      }

      registro.quantity -= quantity;

      if (registro.quantity === 0) {
        await registro.destroy();
      } else {
        await registro.save();
      }

      return res.status(200).json({ mensaje: "Stock descontado del depósito." });
    } catch (error) {
      console.error("Error al descontar:", error);
      return res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  },
  getUnassignedStock: async (req, res) => {
    try {
      const allProducts = await ProductsAvailable.findAll();

      const result = await Promise.all(allProducts.map(async (prod) => {
        const totalAsignado = await db.WarehouseStock.sum("quantity", {
          where: { product_name: prod.product_name }
        });

        const cantidadSinAsignar = prod.product_quantity - (totalAsignado || 0);

        return {
          product_name: prod.product_name,
          total_general: prod.product_quantity,
          asignado: totalAsignado || 0,
          sin_asignar: cantidadSinAsignar
        };
      }));

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error al calcular stock sin asignar:", error);
      return res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  },

  updateWarehouseStock: async (req, res) => {
    const { id_warehouse, product_name, new_quantity } = req.body;

    if (!id_warehouse || !product_name || new_quantity == null) {
      return res.status(400).json({ mensaje: "Faltan datos." });
    }

    try {
      const totalGeneral = await db.ProductsAvailable.findOne({ where: { product_name } });

      if (!totalGeneral) {
        return res.status(404).json({ mensaje: "Producto no encontrado en stock general." });
      }

      const totalAsignado = await db.WarehouseStock.sum("quantity", {
        where: { product_name }
      });

      const actualRegistro = await db.WarehouseStock.findOne({
        where: { id_warehouse, product_name }
      });

      const diferencia = new_quantity - (actualRegistro?.quantity || 0);
      const disponible = totalGeneral.product_quantity - (totalAsignado - (actualRegistro?.quantity || 0));

      if (diferencia > disponible) {
        return res.status(400).json({ mensaje: `No hay suficiente stock general. Disponible: ${disponible}` });
      }

      if (actualRegistro) {
        if (new_quantity <= 0) {
          await actualRegistro.destroy();
        } else {
          actualRegistro.quantity = new_quantity;
          await actualRegistro.save();
        }
      } else {
        await db.WarehouseStock.create({ id_warehouse, product_name, quantity: new_quantity });
      }

      return res.status(200).json({ mensaje: "Stock del depósito actualizado correctamente." });
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      return res.status(500).json({ mensaje: "Error del servidor." });
    }
  },
  findBillDetailsById: async (req, res) => {
    const { id } = req.params;

    try {
     
      const comprobante = await billSupplier.findByPk(id, {
        attributes: ['production_process']
      });

      if (!comprobante) {
        return res.status(404).json({ message: "Comprobante no encontrado." });
      }

      if (comprobante.production_process) {
        return res.status(200).json({ message: "Este comprobante ya fue procesado." });
      }

  
      const billDetailsData = await billDetail.findAll({
        where: {
          bill_supplier_id: id
        }
      });

      return res.status(200).json(billDetailsData);

    } catch (error) {
      console.error("Error al obtener detalles de remito:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  },

  createProductWithSubproducts: async (req, res) => {
    try {
      const {
        product_name,
        category_id,
        product_general_category,
        min_stock,
        max_stock,
        subproducts = []
      } = req.body;

      if (!product_name || !category_id || !product_general_category || min_stock === undefined || max_stock === undefined) {
        return res.status(400).json({ message: "Faltan campos obligatorios." });
      }

      const min = parseInt(min_stock);
      const max = parseInt(max_stock);

      if (isNaN(min) || isNaN(max) || min > max) {
        return res.status(400).json({ message: "Stock mínimo y máximo inválidos." });
      }

      // Paso 1: Crear producto principal y guardar ID
      const nuevoProducto = await db.ProductsAvailable.create({
        product_name,
        category_id,
        product_general_category,
        min_stock: min,
        max_stock: max
      });

      // Validar si se creó bien y tiene ID
      if (!nuevoProducto || !nuevoProducto.id) {
        return res.status(500).json({ message: "No se pudo crear el producto principal." });
      }

      // Paso 2: Crear subproductos (si hay)
      for (const sub of subproducts) {
        const { subproductId, quantity } = sub;
        if (!subproductId || !quantity) continue;

        await db.ProductSubproduct.create({
          parent_product_id: nuevoProducto.id,
          subproduct_id: subproductId,
          quantity: quantity
        });
      }

      res.status(201).json({ message: "Producto y subproductos registrados con éxito." });

    } catch (error) {
      console.error("Error al registrar producto con subproductos:", error);
      res.status(500).json({ message: "Error interno del servidor", error });
    }
  },

  getAllAvailableProducts: async (req, res) => {
    try {
      const productos = await db.ProductsAvailable.findAll();
      res.status(200).json(productos);
    } catch (error) {
      console.error("Error al obtener productos disponibles:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },
  getProductWithSubproducts: async (req, res) => {
    try {
      const { id } = req.params;

      const producto = await db.ProductsAvailable.findOne({
        where: { id },
        include: [
          {
            model: db.ProductCategories,
            as: "category",
            attributes: ["id", "category_name"]
          }
        ]
      });

      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      const subproductos = await ProductSubproduct.findAll({
        where: { parent_product_id: id },
        attributes: ["id", "subproduct_id", "quantity"]
      });

      res.status(200).json({
        id: producto.id,
        product_name: producto.product_name,
        category_id: producto.category_id,
        product_general_category: producto.product_general_category,
        min_stock: producto.min_stock,
        max_stock: producto.max_stock,
        subproducts: subproductos
      });

    } catch (error) {
      console.error("Error al obtener producto con subproductos:", error);
      res.status(500).json({ message: "Error al obtener el producto", error: error.message });
    }
  },
  editProductAvailable: async (req, res) => {
    const { id } = req.params;
    const {
      product_name,
      category_id,
      product_general_category,
      min_stock,
      max_stock,
      subproducts
    } = req.body;

    console.log("llega por console:", req.params)
    if (!product_name || !category_id || !product_general_category || min_stock === undefined || max_stock === undefined) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    try {

      const productoExistente = await ProductsAvailable.findByPk(id);

      if (!productoExistente) {
        return res.status(404).json({ message: "Producto no encontrado." });
      }


      const updated = await ProductsAvailable.update({
        product_name,
        category_id,
        product_general_category,
        min_stock,
        max_stock
      }, {
        where: { id }
      });

      if (updated[0] === 0) {
        console.log(`Producto ${id} sin cambios en tabla products_available`);
      } else {
        console.log(`Producto ${id} actualizado`);
      }


      if (Array.isArray(subproducts) && subproducts.length > 0) {

        const deleted = await ProductSubproduct.destroy({
          where: { parent_product_id: id }
        });
        console.log(`${deleted} subproductos eliminados para producto ${id}`);

        const nuevos = subproducts.map(sp => ({
          parent_product_id: id,
          subproduct_id: sp.subproductId,
          quantity: sp.quantity
        }));

        await ProductSubproduct.bulkCreate(nuevos);
        console.log(`${nuevos.length} subproductos insertados para producto ${id}`);

      } else {
        console.log(`No se modificaron subproductos para producto ${id}`);
      }

      return res.status(200).json({ message: "Producto y subproductos procesados correctamente." });

    } catch (error) {
      console.error("Error al actualizar producto:", error);
      return res.status(500).json({ message: "Error interno del servidor.", error: error.message });
    }

  },
  deleteSubproduct: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID de subproducto requerido." });
    }

    try {
      const deleted = await ProductSubproduct.destroy({
        where: { id }
      });

      if (deleted === 0) {
        return res.status(404).json({ message: "Subproducto no encontrado." });
      }

      return res.status(200).json({ message: "Subproducto eliminado correctamente." });
    } catch (error) {
      console.error("Error al eliminar subproducto:", error);
      return res.status(500).json({ message: "Error interno del servidor.", error: error.message });
    }
  },

  getAllProcessProducts:async(req,res)=>{
       try{
      const processProductos = await ProcessMeat.findAll();
      res.status(200).json(processProductos);
    } catch (error) {
      console.error("Error al obtener los productos del proceso productivos disponibles:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },
deleteProcessByBillId: async (req, res) => {
  const { bill_id } = req.params;

  const t = await sequelize.transaction();

  try {
    // Buscar todos los procesos con ese bill_id
    const procesos = await ProcessMeat.findAll({
      where: { bill_id },
      transaction: t
    });

    if (!procesos || procesos.length === 0) {
      await t.rollback();
      return res.status(404).json({ mensaje: "No se encontraron procesos para este bill_id." });
    }

    // Agrupar cantidad y peso neto por producto
    const acumuladoPorProducto = procesos.reduce((acc, proceso) => {
      const nombre = proceso.type;
      const cantidad = Number(proceso.quantity || 0);
      const peso = Number(proceso.net_weight || 0);

      if (!acc[nombre]) {
        acc[nombre] = { cantidad: 0, peso: 0 };
      }

      acc[nombre].cantidad += cantidad;
      acc[nombre].peso += peso;

      return acc;
    }, {});

    // Descontar del stock general
    for (const nombre in acumuladoPorProducto) {
      const { cantidad, peso } = acumuladoPorProducto[nombre];

      const productoStock = await ProductStock.findOne({
        where: { product_name: nombre },
        transaction: t
      });

      if (productoStock) {
        productoStock.product_quantity -= cantidad;
        productoStock.product_total_weight -= peso;

        // Evitar negativos
        if (productoStock.product_quantity < 0) productoStock.product_quantity = 0;
        if (productoStock.product_total_weight < 0) productoStock.product_total_weight = 0;

        await productoStock.save({ transaction: t });
      }
    }

    // Eliminar procesos
    await ProcessMeat.destroy({
      where: { bill_id },
      transaction: t
    });

    // Marcar el remito como NO procesado
    await billSupplier.update(
      { production_process: false },
      { where: { id: bill_id }, transaction: t }
    );

    await t.commit();

    return res.status(200).json({ mensaje: "Procesos eliminados, stock actualizado y remito actualizado." });
  } catch (error) {
    await t.rollback();
    console.error("Error al eliminar procesos por bill_id:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor.", error: error.message });
  }
}






}


module.exports = administrativeApiController;