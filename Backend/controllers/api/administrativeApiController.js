const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");
const moment = require("moment");
const productsAvailable = require("../../src/config/models/productsAvailable");

const ProductsAvailable = db.ProductsAvailable;
const Provider = db.Provider;
const meatIncome = db.MeatIncome;

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

        const { nombreProveedor, codigoProveedor, identidad, numeroIdentidad, ivaCondicion, emailProveedor, telefonoProveedor, domicilioProveedor, paisProveedor, provinciaProveedor, localidadProveedor } = req.body;

        const proveedorExistente = await Provider.findOne({
            where: {
                provider_code: codigoProveedor,
            }
        });

        if (!proveedorExistente) {
            await Provider.create({
                provider_name: nombreProveedor.toUpperCase(),
                provider_code: codigoProveedor,
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
    loadProductsPrimary: async (req, res) => {
        try {
            const allProductsPrimary = await ProductsAvailable.findAll({
                attributes: ['product_name'],
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
    allProviders: async(req,res)=>{
       
        try {
            const allproviders = await Provider.findAll();
            res.json(allproviders);
        } catch (error) {
            console.error("Error al obtener proveedores:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },

}


module.exports = administrativeApiController;