const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");
const moment = require("moment");
const productsAvailable = require("../../src/config/models/productsAvailable");

const ProductsAvailable = db.ProductsAvailable;
const Provider = db.Provider;
const meatIncome = db.MeatIncome;
const Client = db.Client;

const administrativeApiController = {
    loadNewProduct: async (req, res) => {
        try {

            const { nombre, categoria } = req.body;

            // Crear el registro de ingreso en la BD
            await ProductsAvailable.create({
                product_name: nombre,
                product_category: categoria,
            });

            res.status(201).json({ mensaje: 'Ingreso registrado con éxito' });


        } catch (error) {
            res.status(500).json({ mensaje: 'Error al registrar el ingreso', error });
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


}


module.exports = administrativeApiController;