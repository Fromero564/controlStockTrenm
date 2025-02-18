const express = require("express");
const router = express.Router();
const path = require("path");
const apiMain= require("../../controllers/api/mainApiController");
const { authenticateJWT } = require('../../middlewares/authMiddleware.js');



router.post("/register",apiMain.register);
router.post("/login",apiMain.login);

// Ruta para obtener el perfil del usuario
router.get("/profile", authenticateJWT, apiMain.profile);

//Verifica el estado JWT token 
router.get('/refresh', apiMain.refresh); 



module.exports = router;