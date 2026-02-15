// Lesson UI Management Functions

// Initialize lesson manager
const lessonManager = new LessonManager();

// Load lessons
function loadLessons() {
    loadThemes();
    updateCurrentLessonDisplay();
}

// Load and display theme cards
function loadThemes() {
    const container = document.getElementById('themesContainer');
    const themes = lessonManager.getThemes();

    container.innerHTML = '';
    themes.forEach(theme => {
        const completion = UserProgress.getThemeCompletion(theme.id);

        const card = document.createElement('div');
        card.className = 'glass-card';
        card.style.cssText = 'padding: 2rem; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden;';
        card.onclick = () => selectTheme(theme.id);
        card.onmouseenter = () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = 'var(--shadow-xl)';
        };
        card.onmouseleave = () => {
            card.style.transform = '';
            card.style.boxShadow = 'var(--shadow-md)';
        };

        card.innerHTML = `
            <div style="position: absolute; bottom: 0; left: 0; height: 4px; background: ${theme.color}; width: ${completion}%; transition: width 0.5s ease;"></div>
            
            <div style="text-align: center;">
                <div style="font-size: 3.5rem; margin-bottom: 1rem;">${theme.icon}</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary);">
                    ${theme.name}
                </h3>
                <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.9rem;">
                    ${theme.description}
                </p>
                
                <div style="background: rgba(16, 185, 129, 0.1); padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; margin-bottom: 1rem;">
                    <span style="color: ${theme.color}; font-weight: 700;">${completion}%</span>
                    <span style="color: var(--text-secondary); font-size: 0.85rem;"> Complete</span>
                </div>
                
                <button class="btn btn-primary" style="width: 100%;" onclick="event.stopPropagation(); selectTheme('${theme.id}');">
                    ${completion > 0 ? 'Continue' : 'Start'} Theme
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

// Select theme and show levels
function selectTheme(themeId) {
    SoundFX.play('click');
    const theme = lessonManager.getTheme(themeId);
    if (!theme) return;

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const levelCardsContainer = document.createElement('div');
    levelCardsContainer.style.cssText = 'display: grid; gap: 1rem;';

    levels.forEach(level => {
        const levelInfo = lessonManager.getLevelInfo(level);
        const isUnlocked = UserProgress.isLevelUnlocked(themeId, level);
        const progress = UserProgress.getThemeProgress(themeId)[level];
        const isCompleted = progress?.completed;
        const stars = progress?.stars || 0;

        const levelCard = document.createElement('div');
        levelCard.className = 'level-selector-card';
        levelCard.style.cssText = `
            padding: 1.5rem;
            background: ${isCompleted ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1))' : 'var(--bg-glass)'};
            border-radius: var(--border-radius-md);
            border-left: 4px solid ${levelInfo.color};
            cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
            opacity: ${isUnlocked ? '1' : '0.5'};
            transition: all 0.3s ease;
        `;

        if (isUnlocked) {
            levelCard.onclick = () => {
                selectLesson(themeId, level);
                closeLevelSelector();
            };
            levelCard.onmouseenter = () => levelCard.style.transform = 'translateX(8px)';
            levelCard.onmouseleave = () => levelCard.style.transform = '';
        }

        levelCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                        <span style="background: ${levelInfo.color}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-weight: 700; font-size: 0.9rem;">${level}</span>
                        <h4 style="margin: 0; color: var(--text-primary);">${levelInfo.name}</h4>
                    </div>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">${levelInfo.description}</p>
                </div>
                
                <div style="text-align: center;">
                    ${isCompleted ? `
                        <div style="color: #10b981; font-size: 1.5rem;">${'⭐'.repeat(stars)}</div>
                        <div style="font-size: 0.75rem; color: #10b981; font-weight: 600; margin-top: 0.25rem;">✓ Complete</div>
                    ` : (isUnlocked ? '<div style="color: var(--color-primary); font-size: 1.5rem;">▶</div>' : '<div style="font-size: 1.5rem;">🔒</div>')}
                </div>
            </div>
        `;

        levelCardsContainer.appendChild(levelCard);
    });

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'levelSelectorModal';
    modalOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-overlay); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 1rem;';
    modalOverlay.onclick = closeLevelSelector;

    const modalContent = document.createElement('div');
    modalContent.className = 'glass-card';
    modalContent.style.cssText = 'padding: 3rem; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;';
    modalContent.onclick = (e) => e.stopPropagation();

    modalContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">${theme.icon}</div>
            <h2 style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--text-primary);">${theme.name}</h2>
            <p style="color: var(--text-secondary);">${theme.description}</p>
        </div>

        <h3 style="margin-bottom: 1.5rem; color: var(--text-primary);">Choose a Level:</h3>
        <div id="levelCardsWrapper"></div>

        <button onclick="closeLevelSelector()" class="btn" style="width: 100%; margin-top: 2rem; background: var(--gradient-error); color: white;">
            Close
        </button>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Append level cards after modal is in DOM
    document.getElementById('levelCardsWrapper').appendChild(levelCardsContainer);
}

// Close level selector
function closeLevelSelector() {
    const modal = document.getElementById('levelSelectorModal');
    if (modal) modal.remove();
    SoundFX.play('click');
}

// Helper to get correct path to lesson page based on current location
function getLessonPagePath() {
    const path = window.location.pathname;

    // If we are in pages/lessons/
    if (path.includes('/lessons/') && !path.includes('/gamification/')) {
        return 'daily-lesson.html';
    }

    // If we are in other pages subdirectories (gamification, auth)
    if (path.includes('/pages/')) {
        return '../lessons/daily-lesson.html';
    }

    // Default (Root)
    return 'pages/lessons/daily-lesson.html';
}

// Select a lesson
function selectLesson(themeId, level) {
    UserProgress.setCurrentLesson(themeId, level);
    SoundFX.play('success');
    window.location.href = getLessonPagePath() + '?t=' + Date.now();
}

// Start current lesson  
function startCurrentLesson() {
    window.location.href = getLessonPagePath() + '?t=' + Date.now();
}

// Update current lesson display
function updateCurrentLessonDisplay() {
    const current = UserProgress.getCurrentLesson();
    const theme = lessonManager.getTheme(current.themeId);
    const levelInfo = lessonManager.getLevelInfo(current.level);

    if (theme) {
        document.getElementById('currentLessonTitle').textContent =
            `${theme.icon} ${theme.name} - ${current.level} (${levelInfo.name})`;
    }
}
