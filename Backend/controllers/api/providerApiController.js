const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");
const moment = require("moment");

const receivedSupplier = db.ReceivedSupplier;
const meatIncome = db.MeatIncome;

const providerApiController = {
    uploadProducts: async (req, res) => {
        try {

            const { proveedor, pesoTotal, cabezas, fecha, horario, remito } = req.body;

            // Verifica que no hay campos vacíos
            if (!proveedor || !pesoTotal || !cabezas || !fecha || !horario || !remito) {
                return res.status(400).json({ message: "Todos los campos son obligatorios" });
            }
            // Carga datos en la BD
            await receivedSupplier.create({
                supplier: proveedor,
                total_weight: pesoTotal,
                head_quantity: cabezas,
                actual_date: fecha,
                time_hours: horario,
                remit_number: remito,

            });
        } catch (error) {
            console.error("Error al cargar datos:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

    },
    allProducts: async (req, res) => {
        try {
            const allproducts = await receivedSupplier.findAll();
            res.json(allproducts);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

    },
    addIncomeMeat: async (req, res) => {
        try {
            
            let Supplierid = req.params.id;
            const { capon_stock, media_res_capon_stock, media_res_chancha_stock, media_res_padrillo_stock, cabezas_stock } = req.body;

            // Crear el registro de ingreso en la BD
            await meatIncome.create({
                id_received_suppliers: Supplierid,
                capon_stock,
                media_res_capon_stock,
                media_res_chancha_stock,
                media_res_padrillo_stock,
                cabezas_stock,
            });

            res.status(201).json({ mensaje: 'Ingreso registrado con éxito' });


        } catch (error) {
            res.status(500).json({ mensaje: 'Error al registrar el ingreso', error });
        }

    },


}

module.exports = providerApiController;