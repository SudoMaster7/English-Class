// ===================================
// STORAGE UTILITIES
// ===================================

const Storage = {
    // Save data to localStorage
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },

    // Load data from localStorage
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return defaultValue;
        }
    },

    // Remove data from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },

    // Clear all localStorage
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

// ===================================
// USER PROGRESS TRACKING
// ===================================

const UserProgress = {
    // Get all user stats
    getStats() {
        return Storage.load('userStats', {
            gamesPlayed: 0,
            totalScore: 0,
            timeSpent: 0,
            achievements: [],
            gameScores: {}
        });
    },

    // Update user stats
    updateStats(updates) {
        const stats = this.getStats();
        const newStats = { ...stats, ...updates };
        Storage.save('userStats', newStats);
        return newStats;
    },

    // Record game completion
    recordGame(gameName, score, timeSpent) {
        const stats = this.getStats();

        stats.gamesPlayed++;
        stats.totalScore += score;
        stats.timeSpent += timeSpent;

        if (!stats.gameScores[gameName]) {
            stats.gameScores[gameName] = [];
        }

        stats.gameScores[gameName].push({
            score,
            timeSpent,
            date: new Date().toISOString()
        });

        Storage.save('userStats', stats);
        return stats;
    },

    // Get best score for a game
    getBestScore(gameName) {
        const stats = this.getStats();
        const scores = stats.gameScores[gameName] || [];
        return scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
    },

    // Reset all progress
    reset() {
        Storage.remove('userStats');
        return this.getStats();
    },

    // ===== LESSON PROGRESS TRACKING =====

    // Get lesson progress
    getLessonProgress() {
        return Storage.load('lessonProgress', {});
    },

    // Get progress for specific theme
    getThemeProgress(themeId) {
        const progress = this.getLessonProgress();
        return progress[themeId] || {};
    },

    // Complete a lesson
    completeLesson(themeId, level, score) {
        const progress = this.getLessonProgress();

        if (!progress[themeId]) {
            progress[themeId] = {};
        }

        // Calculate stars (1-3 based on score)
        let stars = 1;
        if (score >= 90) stars = 3;
        else if (score >= 70) stars = 2;

        progress[themeId][level] = {
            completed: true,
            score: score,
            stars: stars,
            date: new Date().toISOString()
        };

        // Auto-unlock next level
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const currentIndex = levels.indexOf(level);
        if (currentIndex < levels.length - 1) {
            const nextLevel = levels[currentIndex + 1];
            if (!progress[themeId][nextLevel]) {
                progress[themeId][nextLevel] = { unlocked: true };
            } else {
                progress[themeId][nextLevel].unlocked = true;
            }
        }

        Storage.save('lessonProgress', progress);
        return progress[themeId][level];
    },

    // Check if level is unlocked
    isLevelUnlocked(themeId, level) {
        const progress = this.getThemeProgress(themeId);

        // A1 is always unlocked
        if (level === 'A1') return true;

        // Check if explicitly unlocked
        return progress[level]?.unlocked || progress[level]?.completed || false;
    },

    // Get theme completion percentage
    getThemeCompletion(themeId) {
        const progress = this.getThemeProgress(themeId);
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const completed = levels.filter(l => progress[l]?.completed).length;
        return Math.round((completed / levels.length) * 100);
    },

    // Get total lessons completed across all themes
    getTotalLessonsCompleted() {
        const progress = this.getLessonProgress();
        let total = 0;

        Object.values(progress).forEach(theme => {
            total += Object.values(theme).filter(l => l.completed).length;
        });

        return total;
    },

    // Get current lesson
    getCurrentLesson() {
        return Storage.load('currentLesson', { themeId: 'daily-routines', level: 'A1' });
    },

    // Set current lesson
    setCurrentLesson(themeId, level) {
        Storage.save('currentLesson', { themeId, level });
    }
};

// ===================================
// THEME MANAGEMENT
// ===================================

const ThemeManager = {
    // Initialize theme
    init() {
        const savedTheme = Storage.load('theme', 'light');
        this.setTheme(savedTheme);
        return savedTheme;
    },

    // Set theme
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        Storage.save('theme', theme);
    },

    // Toggle theme
    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    },

    // Get current theme
    getCurrent() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
};

// ===================================
// SOUND EFFECTS
// ===================================

const SoundFX = {
    enabled: true,

    // Toggle sound
    toggle() {
        this.enabled = !this.enabled;
        Storage.save('soundEnabled', this.enabled);
        return this.enabled;
    },

    // Initialize sound settings
    init() {
        this.enabled = Storage.load('soundEnabled', true);
        return this.enabled;
    },

    // Play sound (using Web Audio API for quick sounds)
    play(type) {
        if (!this.enabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch (type) {
            case 'click':
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.1;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'success':
                oscillator.frequency.value = 1000;
                gainNode.gain.value = 0.2;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
                setTimeout(() => {
                    const osc2 = audioContext.createOscillator();
                    const gain2 = audioContext.createGain();
                    osc2.connect(gain2);
                    gain2.connect(audioContext.destination);
                    osc2.frequency.value = 1200;
                    gain2.gain.value = 0.2;
                    osc2.start();
                    osc2.stop(audioContext.currentTime + 0.2);
                }, 100);
                break;
            case 'error':
                oscillator.frequency.value = 200;
                gainNode.gain.value = 0.15;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'achievement':
                // Play a cheerful melody
                const notes = [523, 659, 784, 1047]; // C, E, G, C
                notes.forEach((freq, i) => {
                    setTimeout(() => {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(audioContext.destination);
                        osc.frequency.value = freq;
                        gain.gain.value = 0.2;
                        osc.start();
                        osc.stop(audioContext.currentTime + 0.3);
                    }, i * 100);
                });
                break;
        }
    }
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get random items from array
function getRandomItems(array, count) {
    return shuffleArray(array).slice(0, count);
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Calculate WPM (words per minute)
function calculateWPM(text, seconds) {
    const words = text.trim().split(/\s+/).length;
    return Math.round((words / seconds) * 60);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Create confetti effect
function createConfetti(count = 50) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#10b981', '#f59e0b', '#ef4444'];

    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '10000';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animation = `confetti ${2 + Math.random() * 2}s linear forwards`;
        confetti.style.animationDelay = Math.random() * 0.5 + 's';

        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Storage,
        UserProgress,
        ThemeManager,
        SoundFX,
        shuffleArray,
        getRandomItems,
        formatTime,
        calculateWPM,
        debounce,
        createConfetti
    };
}
