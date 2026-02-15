import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Attach user to request
            req.user = {
                id: user._id,
                email: user.email,
                tier: user.profile.tier
            };

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or expired'
            });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

// Middleware to check if user has premium access
export const requirePremium = (req, res, next) => {
    if (req.user.tier === 'free') {
        return res.status(403).json({
            success: false,
            message: 'This feature requires a premium subscription',
            upgradeRequired: true
        });
    }
    next();
};

// Middleware to check if email is verified
export const requireEmailVerified = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email to access this feature',
                emailVerificationRequired: true
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Verification check failed'
        });
    }
};
