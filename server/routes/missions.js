import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import Mission from '../models/Mission.js';
import User from '../models/User.js';

const router = express.Router();

// ========================================
// Get user's daily missions
// ========================================
router.get('/daily', authenticate, async (req, res) => {
    try {
        let userMissions = await Mission.findOne({ userId: req.user.id });

        // Generate missions if they don't exist or need reset
        if (!userMissions || userMissions.needsReset()) {
            userMissions = await Mission.generateDailyMissions(req.user.id);
        }

        // Filter out expired missions
        const now = new Date();
        const activeMissions = userMissions.missions.filter(m => m.expiresAt > now);

        res.json({
            success: true,
            data: {
                missions: activeMissions,
                lastReset: userMissions.lastReset
            }
        });
    } catch (error) {
        console.error('Get daily missions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve daily missions'
        });
    }
});

// ========================================
// Claim mission reward
// ========================================
router.post('/claim/:missionId', authenticate, async (req, res) => {
    try {
        const { missionId } = req.params;

        const userMissions = await Mission.findOne({ userId: req.user.id });

        if (!userMissions) {
            return res.status(404).json({
                success: false,
                message: 'No missions found for user'
            });
        }

        const mission = userMissions.missions.find(m => m.missionId === missionId);

        if (!mission) {
            return res.status(404).json({
                success: false,
                message: 'Mission not found'
            });
        }

        if (!mission.completed) {
            return res.status(400).json({
                success: false,
                message: 'Mission not yet completed'
            });
        }

        if (mission.claimed) {
            return res.status(400).json({
                success: false,
                message: 'Mission reward already claimed'
            });
        }

        // Mark as claimed
        mission.claimed = true;
        await userMissions.save();

        // Award rewards to user
        const user = await User.findById(req.user.id);

        if (mission.reward.coins > 0) {
            user.profile.coins += mission.reward.coins;
        }

        if (mission.reward.xp > 0) {
            user.addXP(mission.reward.xp);
        }

        await user.save();

        res.json({
            success: true,
            data: {
                mission,
                rewards: mission.reward,
                newCoins: user.profile.coins,
                newXP: user.profile.xp,
                newLevel: user.profile.level
            }
        });
    } catch (error) {
        console.error('Claim mission error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to claim mission reward'
        });
    }
});

// ========================================
// Update mission progress (called automatically)
// ========================================
router.post('/update-progress', authenticate, async (req, res) => {
    try {
        const { type, amount = 1 } = req.body;

        if (!type) {
            return res.status(400).json({
                success: false,
                message: 'Mission type is required'
            });
        }

        let userMissions = await Mission.findOne({ userId: req.user.id });

        // Generate if doesn't exist
        if (!userMissions) {
            userMissions = await Mission.generateDailyMissions(req.user.id);
        }

        // Check if needs reset
        if (userMissions.needsReset()) {
            userMissions = await Mission.generateDailyMissions(req.user.id);
        }

        // Update progress
        const updated = userMissions.updateProgress(type, amount);

        if (updated) {
            await userMissions.save();
        }

        res.json({
            success: true,
            data: {
                missions: userMissions.missions,
                updated
            }
        });
    } catch (error) {
        console.error('Update mission progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update mission progress'
        });
    }
});

// ========================================
// Admin: Force daily reset
// ========================================
router.post('/refresh', authenticate, async (req, res) => {
    try {
        // TODO: Add admin check middleware

        const userMissions = await Mission.generateDailyMissions(req.user.id);

        res.json({
            success: true,
            data: {
                missions: userMissions.missions
            }
        });
    } catch (error) {
        console.error('Refresh missions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh missions'
        });
    }
});

export default router;
