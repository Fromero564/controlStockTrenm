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
      const userData = await User.findOne({ where: { user: username } });  // Asegúrate de que el campo sea "user"
      if (!userData) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Comparar contraseña
      const isMatch = await bcrypt.compare(password, userData.password);  // Cambié user.password por userData.password
      if (!isMatch) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Generar JWT Tokens
      const accessToken = jwt.sign({ id: userData.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
      const refreshToken = jwt.sign({ id: userData.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

      // Verifica si ambos tokens están siendo generados correctamente
      console.log("Access Token:", accessToken);
      console.log("Refresh Token:", refreshToken);

      res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "Strict" });
      res.json({ accessToken });

      ;
    } catch (error) {
      res.status(500).json({ message: "Error al iniciar sesión" });
    }
  },
  refresh: async (req, res) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "No autorizado" });
      }

      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) {
          res.clearCookie("refreshToken");
          return res.status(403).json({ message: "Token inválido" });
        }

        // Generar un nuevo access token
        const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });

        res.json({ accessToken: newAccessToken });
      });
    } catch (error) {
      res.status(500).json({ message: "Error en el servidor" });
    }
  },
  profile: async (req, res) => {
    try {

      const userId = req.user.id;


      const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });  // Excluye la contraseña

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el perfil" });
    }

  },

}

module.exports = mainApiController;