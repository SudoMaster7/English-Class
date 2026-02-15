import express from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import { authenticate } from '../middleware/authenticate.js';
import { sendEmail } from '../services/emailService.js';
import crypto from 'crypto';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = await User.create({
            email,
            password,
            profile: { name }
        });

        // Create progress document for user
        await Progress.create({ userId: user._id });

        // Generate tokens
        const authToken = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();
        await user.save();

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = verificationToken;
        await user.save();

        // Send verification email (async, don't wait)
        sendEmail({
            to: email,
            subject: 'Verify Your Email - English Learning Platform',
            html: `
        <h1>Welcome to English Learning Platform!</h1>
        <p>Hi ${name},</p>
        <p>Thanks for signing up! Please verify your email by clicking the link below:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}">Verify Email</a>
        <p>If you didn't create this account, please ignore this email.</p>
      `
        }).catch(err => console.error('Email send error:', err));

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.profile.name,
                    avatar: user.profile.avatar,
                    placementTestCompleted: user.profile.placementTestCompleted,
                    placementTestResult: user.profile.placementTestResult,
                    profile: user.profile
                },
                tokens: {
                    authToken,
                    refreshToken
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update streak on login
        user.updateStreak();
        user.lastActive = new Date();

        // Generate tokens
        const authToken = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();
        await user.save();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.profile.name,
                    avatar: user.profile.avatar,
                    level: user.profile.level,
                    xp: user.profile.xp,
                    streak: user.profile.streak,
                    coins: user.profile.coins,
                    tier: user.profile.tier,
                    league: user.profile.league,
                    placementTestCompleted: user.profile.placementTestCompleted,
                    placementTestResult: user.profile.placementTestResult,
                    profile: user.profile
                },
                tokens: {
                    authToken,
                    refreshToken
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.profile.name,
                    avatar: user.profile.avatar,
                    level: user.profile.level,
                    xp: user.profile.xp,
                    xpProgress: user.xpProgress,
                    streak: user.profile.streak,
                    coins: user.profile.coins,
                    tier: user.profile.tier,
                    league: user.profile.league,
                    placementTestCompleted: user.profile.placementTestCompleted,
                    placementTestResult: user.profile.placementTestResult,
                    profile: user.profile, // Send full profile object
                    settings: user.settings,
                    subscription: user.subscription,
                    emailVerified: user.emailVerified
                }
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user data',
            error: error.message
        });
    }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Find user
        const user = await User.findOne({
            _id: decoded.id,
            refreshToken
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new auth token
        const authToken = user.generateAuthToken();

        res.json({
            success: true,
            data: {
                authToken
            }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token'
        });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists
            return res.json({
                success: true,
                message: 'If that email exists, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email
        await sendEmail({
            to: email,
            subject: 'Password Reset - English Learning Platform',
            html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${user.profile.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
        });

        res.json({
            success: true,
            message: 'If that email exists, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request'
        });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password'
        });
    }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        const user = await User.findOne({ emailVerificationToken: token });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification token'
            });
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.profile.coins += 50; // Bonus coins for verifying email
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully! You earned 50 bonus coins! 🎉'
        });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify email'
        });
    }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', authenticate, async (req, res) => {
    try {
        const { name, avatar } = req.body;

        const user = await User.findById(req.user.id);

        if (name) user.profile.name = name;
        if (avatar) user.profile.avatar = avatar;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    name: user.profile.name,
                    avatar: user.profile.avatar
                }
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

// @route   PUT /api/auth/update-settings
// @desc    Update user settings
// @access  Private
router.put('/update-settings', authenticate, async (req, res) => {
    try {
        const updates = req.body;

        const user = await User.findById(req.user.id);

        // Update allowed settings
        const allowedFields = ['nativeLanguage', 'targetLevel', 'dailyGoal', 'notifications', 'darkMode', 'soundEnabled'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                user.settings[field] = updates[field];
            }
        });

        await user.save();

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: {
                settings: user.settings
            }
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update settings'
        });
    }
});

// @route   POST /api/auth/placement-test
// @desc    Submit placement test results
// @access  Private
router.post('/placement-test', authenticate, async (req, res) => {
    try {
        const { level, score } = req.body;

        const user = await User.findById(req.user.id);

        // Check if user already completed the test
        const alreadyCompleted = user.profile.placementTestCompleted;

        user.profile.placementTestCompleted = true;
        user.profile.placementTestResult = {
            level,
            score,
            details: req.body.details || {},
            completedAt: new Date()
        };

        // Calculate XP and Level based on CEFR result
        const levelRewards = {
            'A1': { xp: 0, level: 1 },
            'A2': { xp: 400, level: 5 },
            'B1': { xp: 900, level: 10 },
            'B2': { xp: 1900, level: 20 },
            'C1': { xp: 2900, level: 30 },
            'C2': { xp: 4900, level: 50 }
        };

        const reward = levelRewards[level] || levelRewards['A1'];

        // Only update if current XP is less than the reward (prevent downgrading)
        if (user.profile.xp < reward.xp) {
            user.profile.xp = reward.xp;
            user.profile.level = reward.level;
            console.log(`✅ Updated user ${user.email} to Level ${reward.level} (${reward.xp} XP) based on placement test`);
        }

        // Give bonus coins ONLY if completing for the first time
        if (!alreadyCompleted) {
            user.profile.coins += 100;
            console.log(`✅ First time completing placement test - awarded 100 coins to user ${user.email}`);
        } else {
            console.log(`ℹ️ User ${user.email} retook placement test - no coins awarded`);
        }

        // Mark profile as modified to ensure mongoose saves mixed/nested types
        user.markModified('profile');
        await user.save();

        res.json({
            success: true,
            message: alreadyCompleted
                ? 'Teste de nivelamento atualizado! 🎉'
                : 'Teste de nivelamento concluído! Você ganhou 100 moedas! 🎉',
            data: {
                level,
                score,
                coins: user.profile.coins,
                isFirstTime: !alreadyCompleted
            }
        });
    } catch (error) {
        console.error('Placement test error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save placement test results'
        });
    }
});

// @route   POST /api/auth/skip-placement-test
// @desc    Skip placement test (start as beginner)
// @access  Private
router.post('/skip-placement-test', authenticate, async (req, res) => {
    try {
        user.profile.placementTestCompleted = true;
        user.profile.placementTestResult = {
            level: 'A1',
            score: 0,
            completedAt: new Date()
        };

        user.markModified('profile');
        await user.save();

        res.json({
            success: true,
            message: 'Você começará pelo nível iniciante (A1)',
            data: {
                level: 'A1'
            }
        });
    } catch (error) {
        console.error('Skip placement test error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to skip placement test'
        });
    }
});

export default router;
