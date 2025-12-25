import jwt from "jsonwebtoken";

const ADMIN_EMAIL = "ranaahmer4956@gmail.com";

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // 🔹 Admin check: only by role
        if (decoded.role === 'admin') {
            req.isAdmin = true;
        } else {
            req.isAdmin = false;
        }

        req.user = decoded;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ status: false, message: 'Token expired' });
        }
        return res.status(401).json({ status: false, message: 'Invalid token' });
    }
};

export const isAdmin = (req, res, next) => {
    if (!req.isAdmin) {
        return res.status(403).json({ status: false, message: "Admin access only" });
    }
    next();
};

export default authMiddleware;