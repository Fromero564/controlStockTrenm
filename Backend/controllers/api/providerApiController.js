const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");
const moment = require("moment");

const receivedSupplier = db.ReceivedSupplier;

const providerApiController = {
    uploadProducts: async (req, res) => {
        try {

            const { proveedor,pesoTotal,cabezas,fecha,horario,remito } = req.body;

            // Verifica que no hay campos vacíos
            if (!proveedor || !pesoTotal || !cabezas || !fecha || !horario || !remito) {
                return res.status(400).json({ message: "Todos los campos son obligatorios" });
            }
             // Carga datos en la BD
           await receivedSupplier.create({
            supplier:proveedor,
            total_weight: pesoTotal,
            head_quantity: cabezas,
            actual_date: fecha,
            time_hours:horario,
            remit_number: remito,

            });
        } catch (error) {
            console.error("Error al cargar datos:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
          }

    },
}

module.exports = providerApiController;