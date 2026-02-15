import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import Mission from '../models/Mission.js';
import Inventory from '../models/Inventory.js';

const router = express.Router();

// ========================================
// Get user's complete progress
// ========================================
router.get('/', authenticate, async (req, res) => {
    try {
        let progress = await Progress.findOne({ userId: req.user.id });

        // Create progress document if doesn't exist
        if (!progress) {
            progress = new Progress({
                userId: req.user.id,
                lessons: [],
                games: [],
                vocabulary: [],
                dailyStats: []
            });
            await progress.save();
        }

        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve progress'
        });
    }
});

// ========================================
// Record game score
// ========================================
router.post('/game', authenticate, async (req, res) => {
    try {
        const { gameName, score, timeSpent } = req.body;

        if (!gameName || score === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Game name and score are required'
            });
        }

        let progress = await Progress.findOne({ userId: req.user.id });

        if (!progress) {
            progress = new Progress({ userId: req.user.id });
        }

        // Record game score
        let xpEarned = progress.recordGameScore(gameName, score, timeSpent || 0);

        // Update daily stats
        progress.updateDailyStats({ xpEarned, gamesPlayed: 1, timeSpent: timeSpent || 0 });

        await progress.save();

        // Get inventory and apply XP boosts
        const inventory = await Inventory.findOne({ userId: req.user.id });
        let xpMultiplier = 1;
        if (inventory) {
            xpMultiplier = inventory.getActiveXPMultiplier();
            if (xpMultiplier > 1) {
                xpEarned = Math.floor(xpEarned * xpMultiplier);
            }
        }

        // Update user XP and level
        const user = await User.findById(req.user.id);
        const levelResult = user.addXP(xpEarned);
        await user.save();

        // Update missions progress
        try {
            let missions = await Mission.findOne({ userId: req.user.id });
            if (missions) {
                missions.updateProgress('games', 1);
                missions.updateProgress('xp', xpEarned);
                await missions.save();
            }
        } catch (missionError) {
            console.error('Mission update error:', missionError);
            // Don't fail the request if mission update fails
        }

        res.json({
            success: true,
            data: {
                xpEarned,
                totalXP: user.profile.xp,
                level: user.profile.level,
                levelUp: levelResult.levelUp,
                newLevel: levelResult.newLevel,
                gameStats: progress.games.find(g => g.gameName === gameName)
            }
        });
    } catch (error) {
        console.error('Record game error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record game score'
        });
    }
});

// ========================================
// Complete a lesson
// ========================================
router.post('/lesson', authenticate, async (req, res) => {
    try {
        const { themeId, level, score } = req.body;

        if (!themeId || !level || score === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Theme ID, level, and score are required'
            });
        }

        let progress = await Progress.findOne({ userId: req.user.id });

        if (!progress) {
            progress = new Progress({ userId: req.user.id });
        }

        // Complete lesson and get XP
        const lesson = progress.completeLesson(themeId, level, score);

        // Calculate XP (base 20 + score bonus)
        const baseXP = 20;
        const scoreBonus = Math.floor(score / 10); // 1 XP per 10 points
        let xpEarned = baseXP + scoreBonus;

        // Update daily stats
        progress.updateDailyStats({ xpEarned, lessonsCompleted: 1 });

        await progress.save();

        // Get inventory and apply XP boosts
        const inventory = await Inventory.findOne({ userId: req.user.id });
        let xpMultiplier = 1;
        if (inventory) {
            xpMultiplier = inventory.getActiveXPMultiplier();
            if (xpMultiplier > 1) {
                xpEarned = Math.floor(xpEarned * xpMultiplier);
            }
        }

        // Update user XP and level
        const user = await User.findById(req.user.id);
        const levelResult = user.addXP(xpEarned);

        // Award coins for completion (first time only)
        if (!lesson.completed) {
            user.profile.coins += 10 + (lesson.stars * 5); // 10 base + 5 per star
        }

        await user.save();

        // Update missions progress
        try {
            let missions = await Mission.findOne({ userId: req.user.id });
            if (missions) {
                missions.updateProgress('lessons', 1);
                missions.updateProgress('xp', xpEarned);
                await missions.save();
            }
        } catch (missionError) {
            console.error('Mission update error:', missionError);
            // Don't fail the request if mission update fails
        }

        res.json({
            success: true,
            data: {
                lesson,
                xpEarned,
                totalXP: user.profile.xp,
                level: user.profile.level,
                coins: user.profile.coins,
                levelUp: levelResult.levelUp,
                newLevel: levelResult.newLevel
            }
        });
    } catch (error) {
        console.error('Complete lesson error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete lesson'
        });
    }
});

// ========================================
// Review vocabulary (SRS system)
// ========================================
router.post('/vocabulary/review', authenticate, async (req, res) => {
    try {
        const { word, isCorrect } = req.body;

        if (!word || isCorrect === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Word and isCorrect flag are required'
            });
        }

        let progress = await Progress.findOne({ userId: req.user.id });

        if (!progress) {
            progress = new Progress({ userId: req.user.id });
        }

        // Review vocabulary using SRS algorithm
        const vocabItem = progress.reviewVocabulary(word, isCorrect);

        await progress.save();

        // Small XP for vocabulary review
        const user = await User.findById(req.user.id);
        user.addXP(isCorrect ? 2 : 1);
        await user.save();

        res.json({
            success: true,
            data: {
                vocabulary: vocabItem,
                xpEarned: isCorrect ? 2 : 1
            }
        });
    } catch (error) {
        console.error('Review vocabulary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to review vocabulary'
        });
    }
});

// ========================================
// Get vocabulary due for review
// ========================================
router.get('/vocabulary/due', authenticate, async (req, res) => {
    try {
        const progress = await Progress.findOne({ userId: req.user.id });

        if (!progress) {
            return res.json({
                success: true,
                data: []
            });
        }

        // Get words due for review (nextReview date passed)
        const now = new Date();
        const dueWords = progress.vocabulary.filter(v =>
            v.nextReview && v.nextReview <= now
        );

        res.json({
            success: true,
            data: dueWords
        });
    } catch (error) {
        console.error('Get due vocabulary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get due vocabulary'
        });
    }
});

// ========================================
// Get daily stats
// ========================================
router.get('/stats/daily', authenticate, async (req, res) => {
    try {
        const { days = 7 } = req.query;

        const progress = await Progress.findOne({ userId: req.user.id });

        if (!progress) {
            return res.json({
                success: true,
                data: []
            });
        }

        // Get last N days of stats
        const recentStats = progress.dailyStats
            .slice(-parseInt(days))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            data: recentStats
        });
    } catch (error) {
        console.error('Get daily stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get daily stats'
        });
    }
});

// ========================================
// Unlock achievement
// ========================================
router.post('/achievements/unlock', authenticate, async (req, res) => {
    try {
        const { achievementId } = req.body;

        if (!achievementId) {
            return res.status(400).json({
                success: false,
                message: 'Achievement ID is required'
            });
        }

        let progress = await Progress.findOne({ userId: req.user.id });

        if (!progress) {
            progress = new Progress({ userId: req.user.id });
        }

        // Check if already unlocked
        const exists = progress.achievements.some(a => a.achievementId === achievementId);

        if (!exists) {
            progress.achievements.push({
                achievementId,
                unlockedAt: new Date()
            });
            await progress.save();

            // Add bonus XP for achievement (e.g. 50 XP)
            const user = await User.findById(req.user.id);
            user.addXP(50);
            await user.save();

            return res.json({
                success: true,
                newlyUnlocked: true,
                message: 'Achievement unlocked!',
                xpEarned: 50,
                data: progress.achievements
            });
        }

        res.json({
            success: true,
            newlyUnlocked: false,
            message: 'Achievement already unlocked',
            data: progress.achievements
        });

    } catch (error) {
        console.error('Unlock achievement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unlock achievement'
        });
    }
});

// ========================================
// Get overall statistics
// ========================================
router.get('/stats/overall', authenticate, async (req, res) => {
    try {
        const progress = await Progress.findOne({ userId: req.user.id });

        if (!progress) {
            return res.json({
                success: true,
                data: {
                    totalGames: 0,
                    lessonsCompleted: 0,
                    wordsLearned: 0,
                    averageScore: 0
                }
            });
        }

        res.json({
            success: true,
            data: progress.totalStats
        });
    } catch (error) {
        console.error('Get overall stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get overall stats'
        });
    }
});

export default router;
