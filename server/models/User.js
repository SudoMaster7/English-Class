import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false // Don't return password by default
    },
    profile: {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true
        },
        avatar: {
            type: String,
            default: 'https://res.cloudinary.com/default-avatar.png'
        },
        level: {
            type: Number,
            default: 1
        },
        xp: {
            type: Number,
            default: 0
        },
        streak: {
            type: Number,
            default: 0
        },
        lastStreakDate: {
            type: Date,
            default: null
        },
        coins: {
            type: Number,
            default: 0
        },
        tier: {
            type: String,
            enum: ['free', 'premium', 'enterprise'],
            default: 'free'
        },
        league: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
            default: 'bronze'
        },
        leagueXP: {
            type: Number,
            default: 0 // XP earned this week for league ranking
        },
        leagueRank: {
            type: Number,
            default: 0 // Position in league (1 = top)
        },
        friends: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            friendsSince: {
                type: Date,
                default: Date.now
            }
        }],
        friendRequests: [{
            from: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            sentAt: {
                type: Date,
                default: Date.now
            }
        }],
        freezesAvailable: {
            type: Number,
            default: 0 // Streak freezes owned
        },
        placementTestCompleted: {
            type: Boolean,
            default: false
        },
        placementTestResult: {
            level: String, // A1, A2, B1, B2, C1, C2
            score: Number,
            completedAt: Date,
            details: Object // Stores performance by category
        }
    },
    settings: {
        nativeLanguage: {
            type: String,
            default: 'pt'
        },
        targetLevel: {
            type: String,
            enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
            default: 'A1'
        },
        dailyGoal: {
            type: Number,
            default: 50 // XP goal
        },
        notifications: {
            type: Boolean,
            default: true
        },
        darkMode: {
            type: Boolean,
            default: false
        },
        soundEnabled: {
            type: Boolean,
            default: true
        }
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'monthly', 'yearly'],
            default: 'free'
        },
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: ['active', 'canceled', 'expired'],
            default: 'active'
        },
        stripeCustomerId: String,
        stripeSubscriptionId: String
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to check if password matches
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { id: this._id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
    const refreshToken = jwt.sign(
        { id: this._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );

    this.refreshToken = refreshToken;
    return refreshToken;
};

// Update streak
userSchema.methods.updateStreak = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!this.profile.lastStreakDate) {
        this.profile.streak = 1;
        this.profile.lastStreakDate = today;
    } else {
        const lastDate = new Date(this.profile.lastStreakDate);
        lastDate.setHours(0, 0, 0, 0);

        const diffTime = today - lastDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day
            this.profile.streak += 1;
            this.profile.lastStreakDate = today;
        } else if (diffDays === 0) {
            // Same day, no change
            return;
        } else {
            // Streak broken - check if user has freezes
            if (this.profile.freezesAvailable > 0 && diffDays === 2) {
                // Use freeze to maintain streak for 1 missed day
                this.profile.freezesAvailable -= 1;
                this.profile.lastStreakDate = today;
                // Keep current streak
                return { streakMaintained: true, freezeUsed: true };
            } else {
                // Streak broken
                this.profile.streak = 1;
                this.profile.lastStreakDate = today;
                return { streakMaintained: false, freezeUsed: false };
            }
        }
    }
};

// Update XP and level
userSchema.methods.addXP = function (xp) {
    this.profile.xp += xp;
    this.profile.leagueXP += xp; // Also track weekly XP for leagues

    // Calculate new level (100 XP per level)
    const newLevel = Math.floor(this.profile.xp / 100) + 1;

    if (newLevel > this.profile.level) {
        this.profile.level = newLevel;
        return { levelUp: true, newLevel };
    }

    return { levelUp: false, newLevel: this.profile.level };
};

// Reset weekly league XP
userSchema.methods.resetWeeklyLeague = function () {
    this.profile.leagueXP = 0;
    this.profile.leagueRank = 0;
};

// Promote league
userSchema.methods.promoteLeague = function () {
    const leagues = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = leagues.indexOf(this.profile.league);

    if (currentIndex < leagues.length - 1) {
        this.profile.league = leagues[currentIndex + 1];
        return true;
    }

    return false; // Already at highest league
};

// Demote league
userSchema.methods.demoteLeague = function () {
    const leagues = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = leagues.indexOf(this.profile.league);

    if (currentIndex > 0) {
        this.profile.league = leagues[currentIndex - 1];
        return true;
    }

    return false; // Already at lowest league
};

// Virtual for current XP progress
userSchema.virtual('xpProgress').get(function () {
    const currentLevelXP = this.profile.xp % 100;
    const xpToNextLevel = 100 - currentLevelXP;
    const percentage = (currentLevelXP / 100) * 100;

    return {
        current: currentLevelXP,
        next: 100,
        remaining: xpToNextLevel,
        percentage: Math.round(percentage)
    };
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;
