const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado, token no encontrado" });
    }

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
        if (err) {
            // Si el token expiró, devuelve un estado que el frontend pueda manejar (401)
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token expirado, solicita uno nuevo" });
            }
            return res.status(403).json({ message: "Token no válido" });
        }

        req.user = user;
        next();
    });
};

module.exports = { authenticateJWT };
