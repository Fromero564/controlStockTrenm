const path = require("path");

// const db = require("../../src/config/models");
// const moment = require("moment");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const users = [{ username: "admin", password: "admin" }];


const mainApiController={
    register: async (req, res) => {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword });
        console.log(users);
        res.json({ message: "Usuario registrado" });
      },
    login: async (req, res) => {
        const { username, password } = req.body;
        const user = users.find((u) => u.username === username);
      
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ message: "Credenciales incorrectas" });
        }

      
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
      
        res.json({ token });
        console.log("Se cargo Correctamente");
      },
      
}

module.exports = mainApiController;