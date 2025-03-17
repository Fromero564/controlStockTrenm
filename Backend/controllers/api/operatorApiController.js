const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");
const moment = require("moment");

const receivedSupplier = db.ReceivedSupplier;
const meatIncome = db.MeatIncome;

const operatorApiController = {
    uploadProducts: async (req, res) => {
        try {

            const { proveedor, pesoTotal, cabezas, unidadPeso, romaneo, comprobanteInterno, tipoIngreso } = req.body;

            // Verifica que no hay campos vacíos
            if (!proveedor || !pesoTotal || !cabezas || !unidadPeso || !romaneo || !comprobanteInterno) {
                return res.status(400).json({ message: "Todos los campos son obligatorios" });
            }

            console.log(proveedor, pesoTotal, cabezas, unidadPeso, romaneo, comprobanteInterno, tipoIngreso)

            if (tipoIngreso === "romaneo") {
                const nuevoRegistro = await receivedSupplier.create({
                    supplier: proveedor,
                    total_weight: pesoTotal,
                    head_quantity: cabezas,
                    unit_weight: unidadPeso,
                    internal_number: comprobanteInterno,
                    romaneo_number: romaneo,
                    income_state: tipoIngreso,
                    check_state: true,
                });
                return res.status(201).json({ id: nuevoRegistro.id, romaneo: nuevoRegistro.romaneo_number });
            } else if (tipoIngreso === "manual") {
                const nuevoRegistro = await receivedSupplier.create({
                    supplier: proveedor,
                    total_weight: pesoTotal,
                    head_quantity: cabezas,
                    unit_weight: unidadPeso,
                    internal_number: comprobanteInterno,
                    romaneo_number: romaneo,
                    income_state: tipoIngreso,
                    check_state: false,
                });
                return res.status(201).json({ id: nuevoRegistro.id, romaneo: nuevoRegistro.romaneo_number });
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

    },
    allProducts: async (req, res) => {
        try {
            const allproducts = await receivedSupplier.findAll({
                order: [['id', 'DESC']]
            });
            res.json(allproducts);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

    },
    addIncomeMeat: async (req, res) => {
        try {
            let Supplierid = req.params.id;
            const { productos, cantidades } = req.body;



            const productosArray = productos.split(";");
            const cantidadesArray = cantidades.split(";");


            if (productosArray.length !== cantidadesArray.length) {
                return res.status(400).json({ mensaje: "Los productos y cantidades no coinciden" });
            }


            for (let i = 0; i < productosArray.length; i++) {
                await meatIncome.create({
                    id_received_suppliers: Supplierid,
                    products_name: productosArray[i],
                    products_quantity: cantidadesArray[i],
                });
            }

            res.status(201).json({ mensaje: "Ingreso registrado con éxito" });
        } catch (error) {
            console.error("Error en la base de datos:", error);
            return res.status(500).json({ mensaje: "Error en la base de datos", error: error.message });
        }

    },
    productStock: async (req, res) => {
        try {
            const allproductsStock = await meatIncome.findAll();

            console.log(allproductsStock)
        } catch (error) {
            console.error("Error al obtener stock:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },
    findRemit:async(req,res)=>{
        try {
            let id = req.params.remitoId;
    
            const remitoEncontrado = await receivedSupplier.findOne({
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
    deleteProduct: async (req, res) => {
        try {
            let id = req.params.id;


            const product = await receivedSupplier.findOne({
                where: { id: id },
            });

            if (!product) {
                return res.status(404).json({ mensaje: "El producto no existe" });
            }


            await receivedSupplier.destroy({
                where: { id: id },
            });

            res.status(200).json({ mensaje: "Producto eliminado con éxito" });

        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
        }
    }

}

module.exports = operatorApiController;