const express = require("express");
const router = express.Router();
const apiMainRoutes = require("./api/routeApiMain.js");

//Se traen datos de Api Principal
router.use("/", apiMainRoutes);

module.exports = router;