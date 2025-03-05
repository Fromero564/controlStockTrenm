const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");
const moment = require("moment");
const productsAvailable = require("../../src/config/models/productsAvailable");

const ProductsAvailable = db.ProductsAvailable;
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
    }


module.exports = administrativeApiController;