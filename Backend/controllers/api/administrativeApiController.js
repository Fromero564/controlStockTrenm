const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");
const moment = require("moment");


const ProductsAvailable = db.ProductsAvailable;
const Provider = db.Provider;
const meatIncome = db.MeatIncome;
const ProductCategories = db.ProductCategories
const Client = db.Client;

const administrativeApiController = {
    loadNewProduct: async (req, res) => {
        try {
            const {
                product_name,
                category_id,
                product_general_category,
                min_stock,
                max_stock
            } = req.body;

            // Validación básica de campos obligatorios
            if (
                !product_name ||
                !category_id ||
                !product_general_category ||
                min_stock === undefined ||
                max_stock === undefined
            ) {
                return res.status(400).json({ mensaje: "Faltan campos obligatorios." });
            }

         
            const min = parseInt(min_stock);
            const max = parseInt(max_stock);

            if (isNaN(min) || isNaN(max)) {
                return res.status(400).json({ mensaje: "El stock mínimo y máximo deben ser números válidos." });
            }

            if (min > max) {
                return res.status(400).json({ mensaje: "El stock mínimo no puede ser mayor que el stock máximo." });
            }

            await ProductsAvailable.create({
                product_name,
                category_id,
                product_general_category,
                min_stock: min,
                max_stock: max
            });

            res.status(201).json({ mensaje: 'Producto registrado con éxito' });
        } catch (error) {
            console.error("Error al registrar producto:", error);
            res.status(500).json({ mensaje: 'Error al registrar el producto', error });
        }
    },


    loadNewProvider: async (req, res) => {

        const { nombreProveedor, identidad, numeroIdentidad, ivaCondicion, emailProveedor, telefonoProveedor, domicilioProveedor, paisProveedor, provinciaProveedor, localidadProveedor } = req.body;

        const proveedorExistente = await Provider.findOne({
            where: {
                provider_id_number: numeroIdentidad,
            }
        });

        if (!proveedorExistente) {
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
        } else {
            return res.status(400).json({ mensaje: 'El proveedor con ese código ya existe' });
        }

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




}


module.exports = administrativeApiController;