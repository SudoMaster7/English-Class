import cron from 'node-cron';
import Mission from '../models/Mission.js';
import Leaderboard from '../models/Leaderboard.js';
import User from '../models/User.js';

// Track if scheduler is initialized
let initialized = false;

// ========================================
// Initialize all scheduled tasks
// ========================================
export const initScheduler = () => {
    if (initialized) {
        console.log('⚠️  Scheduler already initialized, skipping...');
        return;
    }

    console.log('📅 Initializing scheduler for automated tasks...');

    // Daily reset: Midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('🌅 Running daily reset tasks...');
        await dailyReset();
    });

    // Weekly reset: Sunday at midnight (00:00)
    cron.schedule('0 0 * * 0', async () => {
        console.log('📆 Running weekly reset tasks...');
        await weeklyReset();
    });

    // Leaderboard rebuild: Every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        console.log('🏆 Rebuilding leaderboards...');
        await rebuildLeaderboards();
    });

    initialized = true;
    console.log('✅ Scheduler initialized successfully');
    console.log('   - Daily reset: 00:00');
    console.log('   - Weekly reset: Sunday 00:00');
    console.log('   - Leaderboard rebuild: Every 10 minutes');
};

// ========================================
// Daily reset tasks
// ========================================
const dailyReset = async () => {
    try {
        // Get all users who need mission reset
        const users = await User.find({}).select('_id');

        console.log(`Resetting daily missions for ${users.length} users...`);

        // This will be handled automatically when users access the app
        // Missions auto-reset when needsReset() returns true

        console.log('✅ Daily reset completed');
    } catch (error) {
        console.error('❌ Daily reset error:', error);
    }
};

// ========================================
// Weekly reset tasks
// ========================================
const weeklyReset = async () => {
    try {
        console.log('Starting weekly league reset...');

        // Get all users sorted by weekly XP
        const users = await User.find({})
            .sort({ 'profile.leagueXP': -1 })
            .select('profile.league profile.leagueXP profile.leagueRank');

        // Group users by league
        const leaguesByTier = {
            bronze: [],
            silver: [],
            gold: [],
            platinum: [],
            diamond: []
        };

        users.forEach(user => {
            const league = user.profile.league || 'bronze';
            leaguesByTier[league].push(user);
        });

        // Process each league tier
        let promotions = 0;
        let demotions = 0;

        for (const [tier, tierUsers] of Object.entries(leaguesByTier)) {
            if (tierUsers.length === 0) continue;

            // Calculate promotion/demotion thresholds
            const top30Percent = Math.ceil(tierUsers.length * 0.30);
            const bottom30Percent = Math.floor(tierUsers.length * 0.30);

            // Promote top 30%
            for (let i = 0; i < top30Percent && i < tierUsers.length; i++) {
                if (tierUsers[i].promoteLeague()) {
                    promotions++;
                }
            }

            // Demote bottom 30%
            for (let i = tierUsers.length - 1; i >= tierUsers.length - bottom30Percent && i >= 0; i--) {
                if (tierUsers[i].demoteLeague()) {
                    demotions++;
                }
            }

            // Reset weekly XP for all users in tier
            for (const user of tierUsers) {
                user.resetWeeklyLeague();
                await user.save();
            }
        }

        console.log(`✅ Weekly reset completed:`);
        console.log(`   - Promotions: ${promotions}`);
        console.log(`   - Demotions: ${demotions}`);
        console.log(`   - Total users: ${users.length}`);

        // Rebuild leaderboards after weekly reset
        await rebuildLeaderboards();

    } catch (error) {
        console.error('❌ Weekly reset error:', error);
    }
};

// ========================================
// Rebuild leaderboards cache
// ========================================
const rebuildLeaderboards = async () => {
    try {
        // Rebuild global leaderboard
        await Leaderboard.rebuildLeaderboard('global', 'all-time');

        // Rebuild weekly leaderboard
        const now = new Date();
        const year = now.getFullYear();
        const week = getWeekNumber(now);
        const period = `${year}-W${week.toString().padStart(2, '0')}`;

        await Leaderboard.rebuildLeaderboard('weekly', period);

        console.log('✅ Leaderboards rebuilt successfully');
    } catch (error) {
        console.error('❌ Leaderboard rebuild error:', error);
    }
};

// Helper function to get ISO week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default { initScheduler };
