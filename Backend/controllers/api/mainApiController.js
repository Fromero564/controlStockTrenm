const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");
const moment = require("moment");
const req = require("express/lib/request");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = db.User;


const mainApiController={
    register: async (req, res) => {
      try {
        // Trae datos del formulario de registro
        const { username, role, password } = req.body;

        // Verifica que no hay campos vacíos
        if (!username || !role || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // Verifica si el usuario ya existe
        let userExists = await User.findOne({ where: { user: username } });

        if (userExists) {
            return res.status(400).json({ message: "Usuario ya se encuentra registrado" }); 
        }

        // Hashea la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Carga datos en la BD
        await User.create({
            user: username,
            rol: role,
            password: hashedPassword,
        });

        return res.json({ message: "Usuario registrado" });

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
      },
    login: async (req, res) => {
        const { username, password } = req.body;
        let userLogin = await User.findOne({ where: { user: username } });
      
        if (!userLogin || !(await bcrypt.compare(password, userLogin.password))) {
          return res.status(401).json({ message: "Credenciales incorrectas" });
        }

      
        const token = jwt.sign({ username: userLogin.username }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
      
        res.json({ token });
        console.log("Se cargo Correctamente");
      },
      
}

module.exports = mainApiController;