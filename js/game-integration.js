// ========================================
// Game Integration Example Helper
// ========================================

/**
 * This file provides helper functions to integrate games with the backend.
 * Include this after api.js in any game HTML file.
 */

const GameIntegration = {
    /**
     * Save game score to backend (if user is authenticated)
     * 
     * @param {string} gameName - Name of the game (e.g., 'memory-match', 'word-scramble')
     * @param {number} score - Final score
     * @param {number} timeSpent - Time spent in seconds
     * @returns {Promise} Backend response
     */
    async saveScore(gameName, score, timeSpent = 0) {
        // Check if user is logged in
        if (!API.isAuthenticated()) {
            console.log('User not authenticated - score not saved to backend');
            // Still save locally for guest users
            this.saveLocally(gameName, score);
            return { success: false, message: 'Not authenticated' };
        }

        try {
            const result = await API.progress.recordGame(gameName, score, timeSpent);

            if (result.success) {
                console.log(`✅ Score saved! XP earned: ${result.data.xpEarned}`);

                // Update local display if elements exist
                this.updateLocalDisplay(result.data);
            }

            return result;
        } catch (error) {
            console.error('Failed to save score:', error);
            // Fallback to local storage
            this.saveLocally(gameName, score);
            return { success: false, error: error.message };
        }
    },

    /**
     * Save score locally (fallback for guests or offline)
     */
    saveLocally(gameName, score) {
        const stats = JSON.parse(localStorage.getItem('userStats') || '{}');

        if (!stats.games) {
            stats.games = [];
        }

        const gameIndex = stats.games.findIndex(g => g.name === gameName);

        if (gameIndex >= 0) {
            stats.games[gameIndex].scores.push(score);
            stats.games[gameIndex].bestScore = Math.max(
                stats.games[gameIndex].bestScore || 0,
                score
            );
        } else {
            stats.games.push({
                name: gameName,
                scores: [score],
                bestScore: score
            });
        }

        stats.totalGames = (stats.totalGames || 0) + 1;
        stats.totalScore = (stats.totalScore || 0) + score;

        localStorage.setItem('userStats', JSON.stringify(stats));
        console.log('📦 Score saved locally');
    },

    /**
     * Update UI elements with new stats
     */
    updateLocalDisplay(data) {
        // Update XP/Level displays if they exist
        const xpElement = document.getElementById('totalScore');
        const levelElement = document.getElementById('totalGames');

        if (xpElement) {
            xpElement.textContent = data.totalXP || 0;
        }

        if (levelElement) {
            levelElement.textContent = data.level || 1;
        }

        // Show XP earned message
        const xpMessage = document.getElementById('xp-message');
        if (xpMessage) {
            xpMessage.textContent = `+${data.xpEarned} XP`;
            xpMessage.style.display = 'block';
            setTimeout(() => {
                xpMessage.style.display = 'none';
            }, 3000);
        }
    },

    /**
     * Complete lesson integration
     */
    async completeLesson(themeId, level, score) {
        if (!API.isAuthenticated()) {
            console.log('User not authenticated - lesson not saved');
            return { success: false, message: 'Not authenticated' };
        }

        try {
            const result = await API.progress.completeLesson(themeId, level, score);

            if (result.success) {
                console.log(`✅ Lesson completed! Stars: ${result.data.lesson.stars}`);
            }

            return result;
        } catch (error) {
            console.error('Failed to complete lesson:', error);
            return { success: false, error: error.message };
        }
    }
};

// Make available globally
window.GameIntegration = GameIntegration;

console.log('✅ Game Integration helper loaded');
