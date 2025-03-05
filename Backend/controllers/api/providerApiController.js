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

            const { proveedor, pesoTotal,cabezas,unidadPeso,romaneo,comprobanteInterno,tipoIngreso } = req.body;

            // Verifica que no hay campos vacíos
            if (!proveedor || !pesoTotal ||  !cabezas || !unidadPeso  || !romaneo || !comprobanteInterno) {
                return res.status(400).json({ message: "Todos los campos son obligatorios" });
            }

            console.log(proveedor, pesoTotal,cabezas,unidadPeso,romaneo,comprobanteInterno,tipoIngreso)

               if(tipoIngreso === "romaneo"){
                await receivedSupplier.create({
                    supplier: proveedor,
                    total_weight: pesoTotal,
                    head_quantity: cabezas,
                    unit_weight: unidadPeso,
                    internal_number: comprobanteInterno,
                    romaneo_number: romaneo,
                    income_state: tipoIngreso,
                    check_state:true,
                });
            }else if (tipoIngreso === "manual"){
                await receivedSupplier.create({
                    supplier: proveedor,
                    total_weight: pesoTotal,
                    head_quantity: cabezas,
                    unit_weight: unidadPeso,
                    internal_number: comprobanteInterno,
                    romaneo_number: romaneo,
                    income_state: tipoIngreso,
                    check_state:false,
                });
            }
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
    productStock:async(req,res)=>{
        try {
            const allproductsStock = await meatIncome.findAll();

            console.log(allproductsStock)
        } catch (error) {
            console.error("Error al obtener stock:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },


}

module.exports = providerApiController;