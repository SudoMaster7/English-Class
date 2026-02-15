import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Lesson progress
    lessons: [{
        themeId: {
            type: String,
            required: true
        },
        level: {
            type: String,
            enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        stars: {
            type: Number,
            min: 0,
            max: 3,
            default: 0
        },
        score: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        attempts: {
            type: Number,
            default: 0
        },
        lastAttempt: {
            type: Date,
            default: Date.now
        },
        unlocked: {
            type: Boolean,
            default: false
        }
    }],

    // Game progress
    games: [{
        gameName: {
            type: String,
            required: true
        },
        scores: [{
            score: Number,
            timeSpent: Number,
            date: {
                type: Date,
                default: Date.now
            }
        }],
        bestScore: {
            type: Number,
            default: 0
        },
        totalPlays: {
            type: Number,
            default: 0
        },
        averageScore: {
            type: Number,
            default: 0
        }
    }],

    // Vocabulary mastery (Spaced Repetition System)
    vocabulary: [{
        word: {
            type: String,
            required: true
        },
        proficiency: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        lastReviewed: {
            type: Date,
            default: Date.now
        },
        nextReview: {
            type: Date,
            default: Date.now
        },
        correctCount: {
            type: Number,
            default: 0
        },
        incorrectCount: {
            type: Number,
            default: 0
        },
        easeFactor: {
            type: Number,
            default: 2.5 // Anki algorithm default
        },
        interval: {
            type: Number,
            default: 1 // Days until next review
        }
    }],

    // Daily statistics
    dailyStats: [{
        date: {
            type: Date,
            required: true
        },
        xpEarned: {
            type: Number,
            default: 0
        },
        lessonsCompleted: {
            type: Number,
            default: 0
        },
        gamesPlayed: {
            type: Number,
            default: 0
        },
        timeSpent: {
            type: Number,
            default: 0 // in seconds
        },
        wordsLearned: {
            type: Number,
            default: 0
        }
    }],

    // Achievements
    achievements: [{
        achievementId: String,
        unlockedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Overall stats
    totalStats: {
        gamesPlayed: {
            type: Number,
            default: 0
        },
        totalScore: {
            type: Number,
            default: 0
        },
        totalTimeSpent: {
            type: Number,
            default: 0 // in seconds
        },
        lessonsCompleted: {
            type: Number,
            default: 0
        },
        vocabularyMastered: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes for performance
progressSchema.index({ userId: 1 });
progressSchema.index({ 'dailyStats.date': -1 });
progressSchema.index({ 'vocabulary.nextReview': 1 });

// Methods
progressSchema.methods.getTodayStats = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = this.dailyStats.find(stat => {
        const statDate = new Date(stat.date);
        statDate.setHours(0, 0, 0, 0);
        return statDate.getTime() === today.getTime();
    });

    return todayStats || null;
};

progressSchema.methods.updateDailyStats = function (updates) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayStats = this.dailyStats.find(stat => {
        const statDate = new Date(stat.date);
        statDate.setHours(0, 0, 0, 0);
        return statDate.getTime() === today.getTime();
    });

    if (!todayStats) {
        todayStats = {
            date: today,
            xpEarned: 0,
            lessonsCompleted: 0,
            gamesPlayed: 0,
            timeSpent: 0,
            wordsLearned: 0
        };
        this.dailyStats.push(todayStats);
    }

    Object.keys(updates).forEach(key => {
        todayStats[key] += updates[key];
    });
};

progressSchema.methods.recordGameScore = function (gameName, score, timeSpent) {
    let game = this.games.find(g => g.gameName === gameName);

    if (!game) {
        game = {
            gameName,
            scores: [],
            bestScore: 0,
            totalPlays: 0,
            averageScore: 0
        };
        this.games.push(game);
    }

    game.scores.push({ score, timeSpent, date: new Date() });
    game.totalPlays += 1;
    game.bestScore = Math.max(game.bestScore, score);

    // Calculate average
    const totalScore = game.scores.reduce((sum, s) => sum + s.score, 0);
    game.averageScore = Math.round(totalScore / game.scores.length);

    // Update overall stats
    this.totalStats.gamesPlayed += 1;
    this.totalStats.totalScore += score;
    this.totalStats.totalTimeSpent += timeSpent;
};

progressSchema.methods.completeLesson = function (themeId, level, score) {
    let lesson = this.lessons.find(
        l => l.themeId === themeId && l.level === level
    );

    if (!lesson) {
        lesson = {
            themeId,
            level,
            completed: false,
            stars: 0,
            score: 0,
            attempts: 0,
            unlocked: true
        };
        this.lessons.push(lesson);
    }

    lesson.attempts += 1;
    lesson.score = Math.max(lesson.score, score);
    lesson.lastAttempt = new Date();

    // Calculate stars (1-3 based on score)
    if (score >= 90) {
        lesson.stars = 3;
    } else if (score >= 70) {
        lesson.stars = 2;
    } else if (score >= 50) {
        lesson.stars = 1;
    }

    if (!lesson.completed && score >= 50) {
        lesson.completed = true;
        this.totalStats.lessonsCompleted += 1;

        // Auto-unlock next level
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const currentIndex = levels.indexOf(level);

        if (currentIndex < levels.length - 1) {
            const nextLevel = levels[currentIndex + 1];
            let nextLesson = this.lessons.find(
                l => l.themeId === themeId && l.level === nextLevel
            );

            if (!nextLesson) {
                this.lessons.push({
                    themeId,
                    level: nextLevel,
                    unlocked: true
                });
            } else {
                nextLesson.unlocked = true;
            }
        }
    }

    return lesson;
};

// Update vocabulary with SRS algorithm
progressSchema.methods.reviewVocabulary = function (word, isCorrect) {
    let vocabItem = this.vocabulary.find(v => v.word === word);

    if (!vocabItem) {
        vocabItem = {
            word,
            proficiency: 0,
            easeFactor: 2.5,
            interval: 1
        };
        this.vocabulary.push(vocabItem);
    }

    vocabItem.lastReviewed = new Date();

    if (isCorrect) {
        vocabItem.correctCount += 1;
        vocabItem.proficiency = Math.min(100, vocabItem.proficiency + 10);

        // Increase interval (Anki algorithm simplified)
        vocabItem.interval = Math.round(vocabItem.interval * vocabItem.easeFactor);
        vocabItem.easeFactor = Math.min(2.5, vocabItem.easeFactor + 0.1);
    } else {
        vocabItem.incorrectCount += 1;
        vocabItem.proficiency = Math.max(0, vocabItem.proficiency - 5);

        // Reset interval
        vocabItem.interval = 1;
        vocabItem.easeFactor = Math.max(1.3, vocabItem.easeFactor - 0.2);
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + vocabItem.interval);
    vocabItem.nextReview = nextReview;

    return vocabItem;
};

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
