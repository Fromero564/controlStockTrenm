const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Modelo de usuarios
const User = db.User;

const mainApiController = {
  // =========================================================
  // REGISTRO DE USUARIO
  // POST /api/register
  // =========================================================
  register: async (req, res) => {
    try {
      const { username, role, password, permissions } = req.body;

      // Validaciones básicas
      if (!username || !role || !password) {
        return res
          .status(400)
          .json({ message: "Usuario, rol y contraseña son obligatorios" });
      }

      // Verificar si ya existe
      const existing = await User.findOne({ where: { user: username } });
      if (existing) {
        return res
          .status(400)
          .json({ message: "El usuario ya se encuentra registrado" });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Guardamos permisos como string en el campo TEXT
      // En el front debería venir como array de strings ["perm1","perm2",...]
      const permissionsString = Array.isArray(permissions)
        ? permissions.join(",")
        : "";

      const newUser = await User.create({
        user: username,
        rol: role,
        password: hashedPassword,
        permissions: permissionsString,
      });

      return res.json({
        message: "Usuario registrado",
        user: {
          id: newUser.id,
          username: newUser.user,
          rol: newUser.rol,
        },
      });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      return res
        .status(500)
        .json({ message: "Error interno del servidor en registro" });
    }
  },

  // =========================================================
  // LOGIN
  // POST /api/login
  // =========================================================
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Usuario y contraseña son obligatorios" });
      }

      // Buscar usuario
      const userData = await User.findOne({ where: { user: username } });

      if (!userData) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Comparar contraseña
      const isMatch = await bcrypt.compare(password, userData.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Pasar de "perm1,perm2" a ["perm1","perm2"]
      const permissionsArray = userData.permissions
        ? userData.permissions
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p !== "")
        : [];

      // Datos que van dentro del token
      const userDataJson = {
        id: userData.dataValues.id,
        user: userData.dataValues.user,
        rol: userData.dataValues.rol,
      };

      // Mismo secreto que en authMiddleware.js
      const jwtGenerado = jwt.sign(userDataJson, "Frigorifico", {
        expiresIn: "1h",
      });

      return res.json({
        token: jwtGenerado,
        rol: userDataJson.rol,
        username: userDataJson.user,
        permissions: permissionsArray, // 👈 para el frontend
      });
    } catch (error) {
      console.error("Error en login:", error);
      return res
        .status(500)
        .json({ message: "Error al iniciar sesión" });
    }
  },

  // =========================================================
  // PROFILE
  // GET /api/profile  (usa authenticateJWT)
  // =========================================================
  profile: async (req, res) => {
    try {
      // El middleware authMiddleware mete el payload del token en req.user
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(400)
          .json({ message: "ID de usuario no encontrado en la petición" });
      }

      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        console.log("Usuario no encontrado en la base de datos");
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const permissionsArray = user.permissions
        ? user.permissions
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p !== "")
        : [];

      // Devuelvo en formato plano + el objeto user por compatibilidad
      return res.json({
        username: user.user,
        rol: user.rol,
        permissions: permissionsArray,
        user,
      });
    } catch (error) {
      console.error("Error en profile:", error);
      return res
        .status(500)
        .json({ message: "Error al obtener el perfil" });
    }
  },
};

module.exports = mainApiController;
