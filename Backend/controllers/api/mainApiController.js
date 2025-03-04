const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");
const moment = require("moment");
const req = require("express/lib/request");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = db.User;


const mainApiController = {
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
    try {
      const { username, password } = req.body;

      // Buscar usuario en la BD
      const userData = await User.findOne({ where: { user: username } });

      console.log(userData);
      if (!userData) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Comparar contraseña
      const isMatch = await bcrypt.compare(password, userData.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      let userDataJson = {
        id: userData.dataValues.id,
        user: userData.dataValues.user,
        rol: userData.dataValues.rol,
      }

      const jwtGenerado = jwt.sign(userDataJson, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });


      res.json({ "token": jwtGenerado });


    } catch (error) {
      res.status(500).json({ message: "Error al iniciar sesión" });
    }

  },
  profile: async (req, res) => {
    try {
      console.log("req.user:", req.user);

      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ message: "ID de usuario no encontrado en la petición" });
      }

      console.log("Buscando usuario con ID:", userId);

      const user = await User.findByPk(userId, { attributes: { exclude: ["password"] } });

      if (!user) {
        console.log("Usuario no encontrado en la base de datos");
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      console.log("Usuario encontrado:", user.toJSON());
      res.json({ user });
    } catch (error) {
      console.error("Error en profile:", error);
      res.status(500).json({ message: "Error al obtener el perfil" });
    }


  },

}

module.exports = mainApiController;