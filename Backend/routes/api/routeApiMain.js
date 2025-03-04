const express = require("express");
const router = express.Router();
const path = require("path");
const apiMain= require("../../controllers/api/mainApiController");
const { authenticateJWT } = require('../../middlewares/authMiddleware.js');

//Verifica que el usuario logeado exista, que el token corresponda y toma el nombre junto con su rol
router.get("/profile",authenticateJWT,apiMain.profile);

router.post("/register",apiMain.register);

router.post("/login",apiMain.login);







module.exports = router;