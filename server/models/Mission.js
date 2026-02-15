import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    missions: [{
        missionId: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['xp', 'lessons', 'games', 'streak', 'vocabulary'],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        target: {
            type: Number,
            required: true
        },
        progress: {
            type: Number,
            default: 0
        },
        reward: {
            coins: {
                type: Number,
                default: 0
            },
            xp: {
                type: Number,
                default: 0
            }
        },
        completed: {
            type: Boolean,
            default: false
        },
        claimed: {
            type: Boolean,
            default: false
        },
        expiresAt: {
            type: Date,
            required: true
        }
    }],
    lastReset: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for performance
missionSchema.index({ userId: 1 });
missionSchema.index({ lastReset: -1 });

// Mission templates
const MISSION_TEMPLATES = {
    easy: [
        { type: 'xp', title: 'Ganhe XP', description: 'Ganhe {target} XP hoje', target: 20, reward: { coins: 10, xp: 0 } },
        { type: 'games', title: 'Jogue', description: 'Complete {target} jogo', target: 1, reward: { coins: 10, xp: 0 } },
        { type: 'lessons', title: 'Estude', description: 'Complete {target} lição', target: 1, reward: { coins: 15, xp: 0 } }
    ],
    medium: [
        { type: 'xp', title: 'Fique Ativo', description: 'Ganhe {target} XP hoje', target: 50, reward: { coins: 25, xp: 0 } },
        { type: 'lessons', title: 'Aprenda Mais', description: 'Complete {target} lições', target: 2, reward: { coins: 25, xp: 0 } },
        { type: 'games', title: 'Pratique Jogos', description: 'Complete {target} jogos', target: 3, reward: { coins: 20, xp: 0 } }
    ],
    hard: [
        { type: 'xp', title: 'Superação', description: 'Ganhe {target} XP hoje', target: 100, reward: { coins: 50, xp: 0 } },
        { type: 'lessons', title: 'Mestre do Dia', description: 'Complete {target} lições', target: 3, reward: { coins: 50, xp: 0 } },
        { type: 'games', title: 'Campeão dos Jogos', description: 'Complete {target} jogos', target: 5, reward: { coins: 50, xp: 0 } }
    ]
};

// Static method to generate daily missions
missionSchema.statics.generateDailyMissions = async function (userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Select one mission from each difficulty
    const easyMission = MISSION_TEMPLATES.easy[Math.floor(Math.random() * MISSION_TEMPLATES.easy.length)];
    const mediumMission = MISSION_TEMPLATES.medium[Math.floor(Math.random() * MISSION_TEMPLATES.medium.length)];
    const hardMission = MISSION_TEMPLATES.hard[Math.floor(Math.random() * MISSION_TEMPLATES.hard.length)];

    const missions = [easyMission, mediumMission, hardMission].map((template, index) => ({
        missionId: `daily_${today.getTime()}_${index}`,
        type: template.type,
        title: template.title,
        description: template.description.replace('{target}', template.target),
        target: template.target,
        progress: 0,
        reward: template.reward,
        completed: false,
        claimed: false,
        expiresAt: tomorrow
    }));

    // Update or create user missions
    const userMissions = await this.findOneAndUpdate(
        { userId },
        {
            userId,
            missions,
            lastReset: today
        },
        { upsert: true, new: true }
    );

    return userMissions;
};

// Method to update mission progress
missionSchema.methods.updateProgress = function (type, amount = 1) {
    let updated = false;

    this.missions.forEach(mission => {
        if (mission.type === type && !mission.completed) {
            mission.progress = Math.min(mission.progress + amount, mission.target);

            if (mission.progress >= mission.target) {
                mission.completed = true;
            }

            updated = true;
        }
    });

    return updated;
};

// Check if missions need reset
missionSchema.methods.needsReset = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastReset = new Date(this.lastReset);
    lastReset.setHours(0, 0, 0, 0);

    return today.getTime() > lastReset.getTime();
};

const Mission = mongoose.model('Mission', missionSchema);

export default Mission;
