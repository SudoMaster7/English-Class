import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import Leaderboard from '../models/Leaderboard.js';
import User from '../models/User.js';

const router = express.Router();

// ========================================
// Get global leaderboard (all-time)
// ========================================
router.get('/global', async (req, res) => {
    try {
        const { limit = 100 } = req.query;

        // Get or rebuild cached leaderboard
        let leaderboard = await Leaderboard.findOne({
            type: 'global',
            period: 'all-time'
        });

        // Rebuild if doesn't exist or is older than 10 minutes
        const shouldRebuild = !leaderboard ||
            (Date.now() - new Date(leaderboard.lastUpdated).getTime() > 10 * 60 * 1000);

        if (shouldRebuild) {
            await Leaderboard.rebuildLeaderboard('global', 'all-time');
            leaderboard = await Leaderboard.findOne({
                type: 'global',
                period: 'all-time'
            });
        }

        const rankings = leaderboard.rankings.slice(0, parseInt(limit));

        // Get current user's rank if authenticated
        let userRank = null;
        if (req.user) {
            userRank = await Leaderboard.getUserRank(req.user.id, 'global', 'all-time');
        }

        res.json({
            success: true,
            data: {
                rankings,
                totalPlayers: leaderboard.rankings.length,
                userRank,
                lastUpdated: leaderboard.lastUpdated
            }
        });
    } catch (error) {
        console.error('Get global leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve global leaderboard'
        });
    }
});

// ========================================
// Get weekly leaderboard
// ========================================
router.get('/weekly', async (req, res) => {
    try {
        const { limit = 50 } = req.query;

        // Get current week identifier (YYYY-WW format)
        const now = new Date();
        const year = now.getFullYear();
        const week = getWeekNumber(now);
        const period = `${year}-W${week.toString().padStart(2, '0')}`;

        // Get or rebuild cached leaderboard
        let leaderboard = await Leaderboard.findOne({
            type: 'weekly',
            period
        });

        // Rebuild if doesn't exist or is older than 10 minutes
        const shouldRebuild = !leaderboard ||
            (Date.now() - new Date(leaderboard.lastUpdated).getTime() > 10 * 60 * 1000);

        if (shouldRebuild) {
            await Leaderboard.rebuildLeaderboard('weekly', period);
            leaderboard = await Leaderboard.findOne({
                type: 'weekly',
                period
            });
        }

        const rankings = leaderboard.rankings.slice(0, parseInt(limit));

        // Get current user's rank if authenticated
        let userRank = null;
        if (req.user) {
            userRank = await Leaderboard.getUserRank(req.user.id, 'weekly', period);
        }

        res.json({
            success: true,
            data: {
                rankings,
                totalPlayers: leaderboard.rankings.length,
                userRank,
                period,
                lastUpdated: leaderboard.lastUpdated
            }
        });
    } catch (error) {
        console.error('Get weekly leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve weekly leaderboard'
        });
    }
});

// ========================================
// Get friends leaderboard
// ========================================
router.get('/friends', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('profile.friends.userId', 'profile.name profile.avatar profile.xp profile.level profile.league');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Build rankings from user and friends
        const friendsData = user.profile.friends.map(f => ({
            userId: f.userId._id,
            name: f.userId.profile.name,
            avatar: f.userId.profile.avatar,
            xp: f.userId.profile.xp,
            level: f.userId.profile.level,
            league: f.userId.profile.league
        }));

        // Add current user
        friendsData.push({
            userId: user._id,
            name: user.profile.name,
            avatar: user.profile.avatar,
            xp: user.profile.xp,
            level: user.profile.level,
            league: user.profile.league
        });

        // Sort by XP descending
        friendsData.sort((a, b) => b.xp - a.xp);

        // Add ranks
        const rankings = friendsData.map((friend, index) => ({
            ...friend,
            rank: index + 1
        }));

        // Find user rank
        const userRank = rankings.findIndex(r => r.userId.toString() === req.user.id) + 1;

        res.json({
            success: true,
            data: {
                rankings,
                totalPlayers: rankings.length,
                userRank,
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error('Get friends leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve friends leaderboard'
        });
    }
});

// ========================================
// Get league leaderboard (specific tier)
// ========================================
router.get('/league/:tier', async (req, res) => {
    try {
        const { tier } = req.params;
        const validTiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

        if (!validTiers.includes(tier)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid league tier'
            });
        }

        // Get top players in this league tier sorted by weekly XP
        const players = await User.find({ 'profile.league': tier })
            .sort({ 'profile.leagueXP': -1 })
            .limit(30)
            .select('profile.name profile.avatar profile.leagueXP profile.level profile.league');

        const rankings = players.map((player, index) => ({
            userId: player._id,
            name: player.profile.name,
            avatar: player.profile.avatar,
            xp: player.profile.leagueXP,
            level: player.profile.level,
            league: player.profile.league,
            rank: index + 1
        }));

        // Get current user's rank if authenticated and in this tier
        let userRank = null;
        if (req.user) {
            const user = await User.findById(req.user.id);
            if (user && user.profile.league === tier) {
                userRank = rankings.findIndex(r => r.userId.toString() === req.user.id) + 1;
                if (userRank === 0) userRank = null; // Not in top 30
            }
        }

        res.json({
            success: true,
            data: {
                rankings,
                tier,
                totalPlayers: rankings.length,
                userRank,
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error('Get league leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve league leaderboard'
        });
    }
});

// Helper function to get ISO week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default router;
