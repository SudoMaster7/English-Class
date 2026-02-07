// ===================================
// ACHIEVEMENTS SYSTEM
// ===================================

const ACHIEVEMENTS = [
    {
        id: 'first_game',
        name: 'Getting Started',
        description: 'Complete your first game',
        icon: '🎮',
        condition: (stats) => stats.gamesPlayed >= 1
    },
    {
        id: 'five_games',
        name: 'Enthusiast',
        description: 'Complete 5 games',
        icon: '🌟',
        condition: (stats) => stats.gamesPlayed >= 5
    },
    {
        id: 'ten_games',
        name: 'Dedicated Learner',
        description: 'Complete 10 games',
        icon: '🏆',
        condition: (stats) => stats.gamesPlayed >= 10
    },
    {
        id: 'perfect_score',
        name: 'Perfectionist',
        description: 'Get a perfect score in any game',
        icon: '💯',
        condition: (stats) => {
            return Object.values(stats.gameScores).some(scores =>
                scores.some(s => s.score === 100)
            );
        }
    },
    {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete typing challenge with 60+ WPM',
        icon: '⚡',
        condition: (stats) => {
            const typingScores = stats.gameScores['typing-challenge'] || [];
            return typingScores.some(s => s.score >= 60);
        }
    },
    {
        id: 'master_listener',
        name: 'Master Listener',
        description: 'Perfect score in listening game',
        icon: '🎧',
        condition: (stats) => {
            const listeningScores = stats.gameScores['listening-game'] || [];
            return listeningScores.some(s => s.score === 100);
        }
    },
    {
        id: 'pronunciation_pro',
        name: 'Pronunciation Pro',
        description: 'Perfect score in pronunciation practice',
        icon: '🎤',
        condition: (stats) => {
            const pronScores = stats.gameScores['pronunciation-game'] || [];
            return pronScores.some(s => s.score === 100);
        }
    },
    {
        id: 'memory_master',
        name: 'Memory Master',
        description: 'Complete Memory Match in under 60 seconds',
        icon: '🧠',
        condition: (stats) => {
            const memoryScores = stats.gameScores['memory-match'] || [];
            return memoryScores.some(s => s.timeSpent < 60);
        }
    },
    {
        id: 'word_wizard',
        name: 'Word Wizard',
        description: 'Complete 5 word scramble games',
        icon: '🔮',
        condition: (stats) => {
            const scrambleScores = stats.gameScores['word-scramble'] || [];
            return scrambleScores.length >= 5;
        }
    },
    {
        id: 'puzzle_solver',
        name: 'Puzzle Solver',
        description: 'Complete the crossword puzzle',
        icon: '🧩',
        condition: (stats) => {
            const crosswordScores = stats.gameScores['crossword'] || [];
            return crosswordScores.length >= 1;
        }
    }
];

const Achievements = {
    // Check and unlock new achievements
    check(stats) {
        const unlockedAchievements = stats.achievements || [];
        const newAchievements = [];

        ACHIEVEMENTS.forEach(achievement => {
            // Skip if already unlocked
            if (unlockedAchievements.includes(achievement.id)) return;

            // Check condition
            if (achievement.condition(stats)) {
                unlockedAchievements.push(achievement.id);
                newAchievements.push(achievement);
            }
        });

        // Save updated achievements
        if (newAchievements.length > 0) {
            UserProgress.updateStats({ achievements: unlockedAchievements });

            // Show achievement popup for each new achievement
            newAchievements.forEach((achievement, index) => {
                setTimeout(() => {
                    this.showPopup(achievement);
                    SoundFX.play('achievement');
                    createConfetti(30);
                }, index * 1000);
            });
        }

        return newAchievements;
    },

    // Show achievement popup
    showPopup(achievement) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-text">
        <h4>Achievement Unlocked!</h4>
        <p>${achievement.name}: ${achievement.description}</p>
      </div>
    `;

        document.body.appendChild(popup);

        // Remove after animation
        setTimeout(() => popup.remove(), 4000);
    },

    // Get all unlocked achievements
    getUnlocked() {
        const stats = UserProgress.getStats();
        const unlockedIds = stats.achievements || [];
        return ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id));
    },

    // Get all achievements (for display)
    getAll() {
        return ACHIEVEMENTS;
    },

    // Get achievement progress
    getProgress() {
        const stats = UserProgress.getStats();
        const unlockedCount = (stats.achievements || []).length;
        const totalCount = ACHIEVEMENTS.length;
        return {
            unlocked: unlockedCount,
            total: totalCount,
            percentage: Math.round((unlockedCount / totalCount) * 100)
        };
    },

    // Check if specific achievement is unlocked
    isUnlocked(achievementId) {
        const stats = UserProgress.getStats();
        return (stats.achievements || []).includes(achievementId);
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Achievements, ACHIEVEMENTS };
}
