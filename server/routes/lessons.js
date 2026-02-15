import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import Progress from '../models/Progress.js';

const router = express.Router();

// ========================================
// Get all available lessons
// ========================================
router.get('/', authenticate, async (req, res) => {
    try {
        // Get user's progress to determine unlocked lessons
        const progress = await Progress.findOne({ userId: req.user.id });

        // Define lesson structure (3 themes × 6 levels = 18 lessons)
        const themes = [
            { id: 'travel', name: 'Travel & Tourism', icon: '✈️' },
            { id: 'business', name: 'Business English', icon: '💼' },
            { id: 'daily', name: 'Daily Conversation', icon: '💬' }
        ];

        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

        // Build lesson catalog
        const lessons = themes.map(theme => ({
            themeId: theme.id,
            themeName: theme.name,
            icon: theme.icon,
            levels: levels.map((level, index) => {
                // Check if lesson is unlocked
                let unlocked = index === 0; // A1 is always unlocked
                let completed = false;
                let stars = 0;
                let score = 0;
                let attempts = 0;

                if (progress) {
                    const lessonProgress = progress.lessons.find(
                        l => l.themeId === theme.id && l.level === level
                    );

                    if (lessonProgress) {
                        unlocked = lessonProgress.unlocked || unlocked;
                        completed = lessonProgress.completed;
                        stars = lessonProgress.stars;
                        score = lessonProgress.score;
                        attempts = lessonProgress.attempts;
                    }

                    // Auto-unlock if previous level is completed
                    if (index > 0) {
                        const prevLevel = levels[index - 1];
                        const prevLesson = progress.lessons.find(
                            l => l.themeId === theme.id && l.level === prevLevel
                        );
                        if (prevLesson && prevLesson.completed) {
                            unlocked = true;
                        }
                    }
                }

                return {
                    level,
                    levelName: getDefaultLevelName(level),
                    unlocked,
                    completed,
                    stars,
                    score,
                    attempts,
                    estimatedTime: '10-15 min'
                };
            })
        }));

        res.json({
            success: true,
            data: lessons
        });
    } catch (error) {
        console.error('Get lessons error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve lessons'
        });
    }
});

// ========================================
// Get specific lesson content
// ========================================
router.get('/:themeId/:level', authenticate, async (req, res) => {
    try {
        const { themeId, level } = req.params;

        // Verify lesson exists and is unlocked
        const progress = await Progress.findOne({ userId: req.user.id });

        const isUnlocked = checkLessonUnlocked(progress, themeId, level);

        if (!isUnlocked) {
            return res.status(403).json({
                success: false,
                message: 'This lesson is locked. Complete previous lessons to unlock.'
            });
        }

        // In a real app, this would fetch from a questions database
        // For now, return a marker that frontend should use its existing content
        res.json({
            success: true,
            data: {
                themeId,
                level,
                message: 'Use existing frontend lesson content',
                unlocked: true
            }
        });
    } catch (error) {
        console.error('Get lesson content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve lesson content'
        });
    }
});

// ========================================
// Start a lesson (mark as in progress)
// ========================================
router.post('/:themeId/:level/start', authenticate, async (req, res) => {
    try {
        const { themeId, level } = req.params;

        let progress = await Progress.findOne({ userId: req.user.id });

        if (!progress) {
            progress = new Progress({ userId: req.user.id });
        }

        // Verify lesson is unlocked
        const isUnlocked = checkLessonUnlocked(progress, themeId, level);

        if (!isUnlocked) {
            return res.status(403).json({
                success: false,
                message: 'This lesson is locked'
            });
        }

        // Find or create lesson entry
        let lesson = progress.lessons.find(
            l => l.themeId === themeId && l.level === level
        );

        if (!lesson) {
            progress.lessons.push({
                themeId,
                level,
                unlocked: true,
                completed: false,
                stars: 0,
                score: 0,
                attempts: 0
            });
            await progress.save();
        }

        res.json({
            success: true,
            message: 'Lesson started',
            data: { themeId, level }
        });
    } catch (error) {
        console.error('Start lesson error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start lesson'
        });
    }
});

// ========================================
// Helper Functions
// ========================================

function checkLessonUnlocked(progress, themeId, level) {
    if (!progress) {
        // A1 is always unlocked for new users
        return level === 'A1';
    }

    const lesson = progress.lessons.find(
        l => l.themeId === themeId && l.level === level
    );

    if (lesson && lesson.unlocked) {
        return true;
    }

    // Check if it's A1 (always unlocked)
    if (level === 'A1') {
        return true;
    }

    // Check if previous level is completed
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levels.indexOf(level);

    if (currentIndex > 0) {
        const prevLevel = levels[currentIndex - 1];
        const prevLesson = progress.lessons.find(
            l => l.themeId === themeId && l.level === prevLevel
        );

        return prevLesson && prevLesson.completed;
    }

    return false;
}

function getDefaultLevelName(level) {
    const names = {
        'A1': 'Beginner',
        'A2': 'Elementary',
        'B1': 'Intermediate',
        'B2': 'Upper Intermediate',
        'C1': 'Advanced',
        'C2': 'Proficiency'
    };
    return names[level] || level;
}

export default router;
