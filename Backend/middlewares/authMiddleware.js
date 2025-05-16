const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');


    if (!token) {
        return res.status(401).json({ message: "Acceso denegado, token no encontrado" });
    }
    console.log("Token recibido:", token);

    // jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    jwt.verify(token, "Frigorifico", (err, user) => {

        if (err) {

            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token expirado, solicita uno nuevo" });
            }
            return res.status(403).json({ message: "Token no válido" });
        }

        console.log("Usuario verificado:", user);

        req.user = user;
        next();
    });
};

module.exports = { authenticateJWT };
