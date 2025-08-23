"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secret_key = process.env.JWT_SECRET;
const createToken = (id, email, role) => {
    return jsonwebtoken_1.default.sign({ id, email, role }, secret_key, { expiresIn: '30m' });
};
exports.createToken = createToken;
const verifyToken = (requiredRole) => {
    return async (req, res, next) => {
        try {
            console.log(req.cookies);
            const accessToken = req.cookies.AccessToken;
            if (accessToken) {
                jsonwebtoken_1.default.verify(accessToken, secret_key, async (err, decoded) => {
                    if (err) {
                        await handleRefreshToken(req, res, next);
                    }
                    else {
                        const { role } = decoded;
                        if (role !== requiredRole) {
                            return res.status(401).json({ message: `Access denied. Insufficient role. Expected ${requiredRole}.` });
                        }
                        next();
                    }
                });
            }
            else {
                await handleRefreshToken(req, res, next);
            }
        }
        catch (error) {
            res.status(401).json({ message: 'Access denied. Access token not valid.' });
        }
    };
};
exports.verifyToken = verifyToken;
const handleRefreshToken = async (req, res, next) => {
    const refreshToken = req.cookies.RefreshToken;
    if (refreshToken) {
        jsonwebtoken_1.default.verify(refreshToken, secret_key, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Access denied. Refresh token not valid.' });
            }
            else {
                const { id, email, role } = decoded;
                if (!id || !role) {
                    return res.status(401).json({ message: 'Access denied. Token payload invalid.' });
                }
                else {
                    const newAccessToken = createToken(id, email, role);
                    res.cookie("AccessToken", newAccessToken, {
                        httpOnly: true,
                        sameSite: 'strict',
                        maxAge: 24 * 60 * 60 * 1000,
                    });
                    next();
                }
                ;
            }
            ;
        });
    }
    else {
        return res.status(401).json({ message: 'Access denied. Refresh token not provided.' });
    }
    ;
};
