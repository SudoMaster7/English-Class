import express from 'express';
const router = express.Router();

// Placeholder - Coming in Phase 5 (Camera & Translation)

router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Translation endpoints - Coming soon in Phase 5'
    });
});

export default router;
