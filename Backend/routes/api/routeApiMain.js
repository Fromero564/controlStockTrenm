const express = require("express");
const router = express.Router();
const path = require("path");
const apiMain= require("../../controllers/api/mainApiController");


router.post("/register",apiMain.register);
router.post("/login",apiMain.login);



module.exports = router;