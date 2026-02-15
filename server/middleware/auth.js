import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to verify JWT token and attach user to request
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Não autorizado - Token não fornecido'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro no servidor'
        });
    }
};

/**
 * Middleware to check if user has completed placement test
 * Allows access only to placement test route if not completed
 */
export const requirePlacementTest = async (req, res, next) => {
    try {
        // Skip check for placement test endpoints
        const allowedPaths = [
            '/api/auth/placement-test',
            '/api/auth/skip-placement-test',
            '/api/auth/me',
            '/api/auth/logout'
        ];

        if (allowedPaths.some(path => req.originalUrl.includes(path))) {
            return next();
        }

        if (!req.user.placementTestCompleted) {
            return res.status(403).json({
                success: false,
                message: 'Complete o teste de nivelamento para acessar esta funcionalidade',
                requiresPlacementTest: true
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro no servidor'
        });
    }
};
