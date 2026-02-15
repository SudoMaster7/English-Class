import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['global', 'weekly', 'friends'],
        required: true
    },
    period: {
        type: String, // Format: YYYY-WW for weekly, 'all-time' for global
        required: true
    },
    rankings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        avatar: String,
        xp: {
            type: Number,
            default: 0
        },
        level: {
            type: Number,
            default: 1
        },
        league: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
            default: 'bronze'
        },
        rank: {
            type: Number,
            required: true
        }
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for performance
leaderboardSchema.index({ type: 1, period: 1 }, { unique: true });
leaderboardSchema.index({ 'rankings.userId': 1 });
leaderboardSchema.index({ lastUpdated: -1 });

// Method to rebuild leaderboard
leaderboardSchema.statics.rebuildLeaderboard = async function (type, period = 'all-time') {
    const User = mongoose.model('User');

    let query = {};
    let sortField = 'profile.xp';

    if (type === 'weekly') {
        // For weekly, we'd sort by leagueXP (weekly XP)
        sortField = 'profile.leagueXP';
    }

    // Get top users
    const users = await User.find(query)
        .sort({ [sortField]: -1 })
        .limit(100)
        .select('profile.name profile.avatar profile.xp profile.level profile.league profile.leagueXP');

    const rankings = users.map((user, index) => ({
        userId: user._id,
        name: user.profile.name,
        avatar: user.profile.avatar,
        xp: type === 'weekly' ? user.profile.leagueXP : user.profile.xp,
        level: user.profile.level,
        league: user.profile.league,
        rank: index + 1
    }));

    // Update or create leaderboard
    await this.findOneAndUpdate(
        { type, period },
        {
            type,
            period,
            rankings,
            lastUpdated: new Date()
        },
        { upsert: true, new: true }
    );

    return rankings;
};

// Method to get user rank
leaderboardSchema.statics.getUserRank = async function (userId, type, period = 'all-time') {
    const leaderboard = await this.findOne({ type, period });

    if (!leaderboard) {
        return null;
    }

    const userRanking = leaderboard.rankings.find(
        r => r.userId.toString() === userId.toString()
    );

    return userRanking ? userRanking.rank : null;
};

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

export default Leaderboard;
