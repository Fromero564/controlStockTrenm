const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");
const moment = require("moment");
const { stringify } = require("querystring");

const billSupplier = db.BillSupplier;
const meatIncome = db.MeatIncome;

const operatorApiController = {
    uploadProducts: async (req, res) => {
        try {

            const { proveedor, pesoTotal, cabezas,  romaneo, pesoFinal, tipoIngreso } = req.body;

            // Verifica que no hay campos vacíos
            if (!proveedor || !pesoTotal || !cabezas  || !romaneo || !pesoFinal) {
                return res.status(400).json({ message: "Todos los campos son obligatorios" });
            }


            if (tipoIngreso === "romaneo") {
                const nuevoRegistro = await billSupplier.create({
                    supplier: proveedor,
                    total_weight: pesoTotal,
                    head_quantity: cabezas,  
                    romaneo_number: romaneo,
                    income_state: tipoIngreso,
                    final_weight:pesoFinal,
                    check_state: true,
                });
                return res.status(201).json({ id: nuevoRegistro.id, romaneo: nuevoRegistro.romaneo_number });
            } else if (tipoIngreso === "manual") {
                const nuevoRegistro = await billSupplier.create({
                    supplier: proveedor,
                    total_weight: pesoTotal,
                    head_quantity: cabezas,
                    romaneo_number: romaneo,
                    income_state: tipoIngreso,
                    final_weight:pesoFinal,
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
            const allproducts = await billSupplier.findAll({
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
            const Supplierid = req.params.id;
            const cortes = req.body;
    
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
                    pesoNeto
                } = corte;
    
                // Validación
                if (!tipo || !garron || cabeza == null || cantidad == null || pesoBruto == null || tara == null || pesoNeto == null) {
                    return res.status(400).json({ mensaje: "Faltan campos obligatorios en al menos un producto." });
                }
    
              
                const existente = await meatIncome.findByPk(garron);
                if (existente) {
                    return res.status(400).json({ mensaje: `El garrón ${garron} ya existe.` });
                }
    
                await meatIncome.create({
                    id: garron, 
                    id_bill_suppliers: Supplierid,
                    products_name: tipo,
                    product_head: cabeza,
                    products_quantity: cantidad,
                    gross_weight: pesoBruto,
                    tare: tara,
                    net_weight: pesoNeto
                });
            }
    
            return res.status(201).json({ mensaje: "Todos los productos fueron cargados correctamente." });
    
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
    deleteProduct: async (req, res) => {
        try {
            let id = req.params.id;


            const product = await billSupplier.findOne({
                where: { id: id },
            });

            if (!product) {
                return res.status(404).json({ mensaje: "El producto no existe" });
            }


            await billSupplier.destroy({
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