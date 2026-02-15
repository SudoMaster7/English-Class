// ========================================
// API Configuration & Base Functions
// ========================================

// Auto-detect if accessing from network (mobile) or localhost
const isNetworkAccess = window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

const API_CONFIG = {
    // If accessing from network (e.g., 192.168.1.69), use network URL
    // Otherwise use localhost
    BASE_URL: isNetworkAccess
        ? `http://${window.location.hostname}:5000/api`
        : 'http://localhost:5000/api',
    TIMEOUT: 10000
};

console.log(`🌐 API URL: ${API_CONFIG.BASE_URL}`);

// Auth token management
let authToken = localStorage.getItem('authToken');
let refreshToken = localStorage.getItem('refreshToken');

// ========================================
// Core API Function
// ========================================

async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Add auth token if available
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        // Handle token expiration
        if (response.status === 401 && data.message && data.message.includes('expired')) {
            console.log('Token expirado, tentando renovar...');
            const refreshed = await refreshAuthToken();
            if (refreshed) {
                // Retry original request with new token
                return apiCall(endpoint, options);
            } else {
                // Refresh failed, logout user
                logout();
                throw new Error('Sessão expirada. Por favor, faça login novamente.');
            }
        }

        // Handle non-ok responses
        if (!response.ok) {
            // Check if placement test is required
            if (data.requiresPlacementTest && !window.location.pathname.includes('placement-test')) {
                window.location.href = 'placement-test.html';
                throw new Error('Redirecionando para teste de nivelamento...');
            }
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Requisição expirou. Verifique sua conexão.');
        }
        throw error;
    }
}

// ========================================
// Authentication API
// ========================================

const AuthAPI = {
    /**
     * Register a new user
     */
    async register(email, password, name) {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });

        if (data.success) {
            authToken = data.data.tokens.authToken;
            refreshToken = data.data.tokens.refreshToken;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));
        }

        return data;
    },

    /**
     * Login user
     */
    async login(email, password) {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data.success) {
            authToken = data.data.tokens.authToken;
            refreshToken = data.data.tokens.refreshToken;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            // Migrate local progress to backend (one-time)
            await migrateLocalProgress();
        }

        return data;
    },

    /**
     * Get current user data
     */
    async getCurrentUser() {
        return await apiCall('/auth/me');
    },

    /**
     * Update user profile
     */
    async updateProfile(updates) {
        return await apiCall('/auth/update-profile', {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    },

    /**
     * Update user settings
     */
    async updateSettings(settings) {
        return await apiCall('/auth/update-settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    },

    /**
     * Request password reset
     */
    async forgotPassword(email) {
        return await apiCall('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    },

    /**
     * Reset password with token
     */
    async resetPassword(token, newPassword) {
        return await apiCall('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, newPassword })
        });
    },

    /**
     * Verify email
     */
    /**
     * Verify email
     */
    async verifyEmail(token) {
        return await apiCall('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ token })
        });
    },

    /**
     * Submit placement test results
     */
    async submitPlacementTest(level, score, details) {
        return await apiCall('/auth/placement-test', {
            method: 'POST',
            body: JSON.stringify({ level, score, details })
        });
    }
};

// ========================================
// Token Management
// ========================================

async function refreshAuthToken() {
    try {
        const data = await apiCall('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken })
        });

        if (data.success) {
            authToken = data.data.authToken;
            localStorage.setItem('authToken', authToken);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        return false;
    }
}

function logout() {
    authToken = null;
    refreshToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

function isAuthenticated() {
    return !!authToken;
}

function getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// ========================================
// Progress/Stats Migration
// ========================================

async function migrateLocalProgress() {
    // Check if already migrated
    if (localStorage.getItem('progressMigrated') === 'true') {
        console.log('Progress already migrated');
        return;
    }

    try {
        // Get old local storage data
        const oldStats = localStorage.getItem('userStats');
        const lessonProgress = localStorage.getItem('lessonProgress');

        if (!oldStats && !lessonProgress) {
            console.log('No local progress to migrate');
            localStorage.setItem('progressMigrated', 'true');
            return;
        }

        // TODO: Send to backend progress API when implemented in Phase 2
        // For now, just mark as migrated
        console.log('Progress migration will be implemented in Phase 2');
        localStorage.setItem('progressMigrated', 'true');

    } catch (error) {
        console.error('Migration error:', error);
    }
}

// ========================================
// Helper Functions
// ========================================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// Progress API
// ========================================

const ProgressAPI = {
    /**
     * Get complete user progress
     */
    async get() {
        return await apiCall('/progress');
    },

    /**
     * Record game score
     */
    async recordGame(gameName, score, timeSpent = 0) {
        const data = await apiCall('/progress/game', {
            method: 'POST',
            body: JSON.stringify({ gameName, score, timeSpent })
        });

        // Update stored user data
        if (data.success && data.data) {
            const user = getStoredUser();
            if (user) {
                user.xp = data.data.totalXP;
                user.level = data.data.level;
                localStorage.setItem('user', JSON.stringify(user));
            }

            // Show level up notification
            if (data.data.levelUp) {
                showNotification(`🎉 Level Up! Você alcançou o nível ${data.data.newLevel}!`, 'success');
            }
        }

        return data;
    },

    /**
     * Complete a lesson
     */
    async completeLesson(themeId, level, score) {
        const data = await apiCall('/progress/lesson', {
            method: 'POST',
            body: JSON.stringify({ themeId, level, score })
        });

        // Update stored user data
        if (data.success && data.data) {
            const user = getStoredUser();
            if (user) {
                user.xp = data.data.totalXP;
                user.level = data.data.level;
                user.coins = data.data.coins;
                localStorage.setItem('user', JSON.stringify(user));
            }

            // Show rewards
            if (data.data.levelUp) {
                showNotification(`🎉 Level Up! Nível ${data.data.newLevel} alcançado!`, 'success');
            }
            if (data.data.lesson.stars) {
                showNotification(`⭐ ${data.data.lesson.stars} estrela(s)! +${data.data.xpEarned} XP`, 'success');
            }
        }

        return data;
    },

    /**
     * Review vocabulary (SRS)
     */
    async reviewVocabulary(word, isCorrect) {
        return await apiCall('/progress/vocabulary/review', {
            method: 'POST',
            body: JSON.stringify({ word, isCorrect })
        });
    },

    /**
     * Get vocabulary due for review
     */
    async getDueVocabulary() {
        return await apiCall('/progress/vocabulary/due');
    },

    /**
     * Get daily statistics
     */
    async getDailyStats(days = 7) {
        return await apiCall(`/progress/stats/daily?days=${days}`);
    },

    /**
     * Unlock an achievement
     */
    async unlockAchievement(achievementId) {
        return await apiCall('/progress/achievements/unlock', {
            method: 'POST',
            body: JSON.stringify({ achievementId })
        });
    },

    /**
     * Get overall statistics
     */
    async getOverallStats() {
        return await apiCall('/progress/stats/overall');
    }
};

// ========================================
// Lessons API
// ========================================

const LessonsAPI = {
    /**
     * Get all available lessons
     */
    async getAll() {
        return await apiCall('/lessons');
    },

    /**
     * Get specific lesson content
     */
    async get(themeId, level) {
        return await apiCall(`/lessons/${themeId}/${level}`);
    },

    /**
     * Start a lesson
     */
    async start(themeId, level) {
        return await apiCall(`/lessons/${themeId}/${level}/start`, {
            method: 'POST'
        });
    }
};

// ========================================
// Leaderboard API
// ========================================

const LeaderboardAPI = {
    /**
     * Get global leaderboard
     */
    async global(limit = 100) {
        return await apiCall(`/leaderboard/global?limit=${limit}`);
    },

    /**
     * Get weekly leaderboard
     */
    async weekly(limit = 50) {
        return await apiCall(`/leaderboard/weekly?limit=${limit}`);
    },

    /**
     * Get friends leaderboard
     */
    async friends() {
        return await apiCall('/leaderboard/friends');
    },

    /**
     * Get league leaderboard
     */
    async league(tier) {
        return await apiCall(`/leaderboard/league/${tier}`);
    }
};

// ========================================
// Missions API
// ========================================

const MissionsAPI = {
    /**
     * Get daily missions
     */
    async getDaily() {
        return await apiCall('/missions/daily');
    },

    /**
     * Claim mission reward
     */
    async claim(missionId) {
        const data = await apiCall(`/missions/claim/${missionId}`, {
            method: 'POST'
        });

        // Update stored user data
        if (data.success && data.data) {
            const user = getStoredUser();
            if (user) {
                user.coins = data.data.newCoins;
                user.xp = data.data.newXP;
                user.level = data.data.newLevel;
                localStorage.setItem('user', JSON.stringify(user));
            }

            showNotification(`✅ Recompensa obtida! +${data.data.rewards.coins} moedas`, 'success');
        }

        return data;
    },

    /**
     * Update mission progress (called internally)
     */
    async updateProgress(type, amount = 1) {
        return await apiCall('/missions/update-progress', {
            method: 'POST',
            body: JSON.stringify({ type, amount })
        });
    }
};

// ========================================
// Shop API
// ========================================

const ShopAPI = {
    /**
     * Get all shop items
     */
    async getItems() {
        return await apiCall('/shop/items');
    },

    /**
     * Purchase an item
     */
    async purchase(itemId) {
        const data = await apiCall(`/shop/purchase/${itemId}`, {
            method: 'POST'
        });

        // Update stored user coins
        if (data.success && data.data) {
            const user = getStoredUser();
            if (user) {
                user.coins = data.data.newCoins;
                localStorage.setItem('user', JSON.stringify(user));
            }

            showNotification(`🛒 Item comprado: ${data.data.item.name}!`, 'success');
        }

        return data;
    },

    /**
     * Get user inventory
     */
    async getInventory() {
        return await apiCall('/shop/inventory');
    },

    /**
     * Equip cosmetic item
     */
    async equip(itemId) {
        const data = await apiCall(`/shop/equip/${itemId}`, {
            method: 'POST'
        });

        if (data.success) {
            showNotification('✨ Item equipado!', 'success');
        }

        return data;
    },

    /**
     * Use consumable item
     */
    async use(itemId) {
        const data = await apiCall(`/shop/use/${itemId}`, {
            method: 'POST'
        });

        if (data.success && data.data.result) {
            const result = data.data.result;
            if (result.type === 'xp_boost') {
                showNotification(`⚡ XP Boost ativo! ${result.multiplier}x XP`, 'success');
            } else if (result.type === 'freeze') {
                showNotification('❄️ Congelamento de sequência ativado!', 'success');
            } else if (result.type === 'hint') {
                showNotification(`💡 ${result.hintsAdded} dicas adicionadas!`, 'success');
            }
        }

        return data;
    }
};

// ========================================
// Friends API
// ========================================

const FriendsAPI = {
    /**
     * Get friends list
     */
    async list() {
        return await apiCall('/friends');
    },

    /**
     * Get pending friend requests
     */
    async requests() {
        return await apiCall('/friends/requests');
    },

    /**
     * Send friend request
     */
    async send(userId) {
        const data = await apiCall(`/friends/request/${userId}`, {
            method: 'POST'
        });

        if (data.success) {
            showNotification('✉️ Pedido de amizade enviado!', 'success');
        }

        return data;
    },

    /**
     * Accept friend request
     */
    async accept(requestId) {
        const data = await apiCall(`/friends/accept/${requestId}`, {
            method: 'POST'
        });

        if (data.success) {
            showNotification('🎉 Agora vocês são amigos!', 'success');
        }

        return data;
    },

    /**
     * Reject friend request
     */
    async reject(requestId) {
        return await apiCall(`/friends/reject/${requestId}`, {
            method: 'DELETE'
        });
    },

    /**
     * Remove friend
     */
    async remove(userId) {
        return await apiCall(`/friends/${userId}`, {
            method: 'DELETE'
        });
    },

    /**
     * Search users by name
     */
    async search(query) {
        return await apiCall(`/friends/search?q=${encodeURIComponent(query)}`);
    }
};

// ========================================
// Export for use in other files
// ========================================

window.API = {
    auth: AuthAPI,
    progress: ProgressAPI,
    lessons: LessonsAPI,
    leaderboard: LeaderboardAPI,
    missions: MissionsAPI,
    shop: ShopAPI,
    friends: FriendsAPI,
    isAuthenticated,
    logout,
    getStoredUser,
    showNotification
};

console.log('✅ API client initialized');
