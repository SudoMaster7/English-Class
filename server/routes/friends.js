import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import User from '../models/User.js';

const router = express.Router();

// ========================================
// Get user's friends list
// ========================================
router.get('/', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('profile.friends.userId', 'profile.name profile.avatar profile.level profile.xp profile.league');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const friends = user.profile.friends.map(f => ({
            userId: f.userId._id,
            name: f.userId.profile.name,
            avatar: f.userId.profile.avatar,
            level: f.userId.profile.level,
            xp: f.userId.profile.xp,
            league: f.userId.profile.league,
            friendsSince: f.friendsSince
        }));

        res.json({
            success: true,
            data: {
                friends,
                total: friends.length
            }
        });
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve friends list'
        });
    }
});

// ========================================
// Get pending friend requests
// ========================================
router.get('/requests', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('profile.friendRequests.from', 'profile.name profile.avatar profile.level');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const requests = user.profile.friendRequests.map(r => ({
            requestId: r._id,
            from: {
                userId: r.from._id,
                name: r.from.profile.name,
                avatar: r.from.profile.avatar,
                level: r.from.profile.level
            },
            sentAt: r.sentAt
        }));

        res.json({
            success: true,
            data: {
                requests,
                total: requests.length
            }
        });
    } catch (error) {
        console.error('Get friend requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve friend requests'
        });
    }
});

// ========================================
// Send friend request
// ========================================
router.post('/request/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        // Can't friend yourself
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot send friend request to yourself'
            });
        }

        const targetUser = await User.findById(userId);

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const currentUser = await User.findById(req.user.id);

        // Check if already friends
        const alreadyFriends = currentUser.profile.friends.some(
            f => f.userId.toString() === userId
        );

        if (alreadyFriends) {
            return res.status(400).json({
                success: false,
                message: 'Already friends with this user'
            });
        }

        // Check if request already sent
        const requestExists = targetUser.profile.friendRequests.some(
            r => r.from.toString() === req.user.id
        );

        if (requestExists) {
            return res.status(400).json({
                success: false,
                message: 'Friend request already sent'
            });
        }

        // Add friend request
        targetUser.profile.friendRequests.push({
            from: req.user.id,
            sentAt: new Date()
        });

        await targetUser.save();

        res.json({
            success: true,
            data: {
                message: 'Friend request sent successfully',
                to: {
                    userId: targetUser._id,
                    name: targetUser.profile.name
                }
            }
        });
    } catch (error) {
        console.error('Send friend request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send friend request'
        });
    }
});

// ========================================
// Accept friend request
// ========================================
router.post('/accept/:requestId', authenticate, async (req, res) => {
    try {
        const { requestId } = req.params;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find the request
        const requestIndex = user.profile.friendRequests.findIndex(
            r => r._id.toString() === requestId
        );

        if (requestIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Friend request not found'
            });
        }

        const request = user.profile.friendRequests[requestIndex];
        const senderId = request.from;

        // Remove the request
        user.profile.friendRequests.splice(requestIndex, 1);

        // Add to friends list
        user.profile.friends.push({
            userId: senderId,
            friendsSince: new Date()
        });

        await user.save();

        // Add current user to sender's friends list
        const sender = await User.findById(senderId);

        if (sender) {
            sender.profile.friends.push({
                userId: req.user.id,
                friendsSince: new Date()
            });
            await sender.save();
        }

        res.json({
            success: true,
            data: {
                message: 'Friend request accepted',
                newFriend: {
                    userId: sender._id,
                    name: sender.profile.name,
                    avatar: sender.profile.avatar
                }
            }
        });
    } catch (error) {
        console.error('Accept friend request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept friend request'
        });
    }
});

// ========================================
// Reject friend request
// ========================================
router.delete('/reject/:requestId', authenticate, async (req, res) => {
    try {
        const { requestId } = req.params;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find and remove the request
        const requestIndex = user.profile.friendRequests.findIndex(
            r => r._id.toString() === requestId
        );

        if (requestIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Friend request not found'
            });
        }

        user.profile.friendRequests.splice(requestIndex, 1);
        await user.save();

        res.json({
            success: true,
            data: {
                message: 'Friend request rejected'
            }
        });
    } catch (error) {
        console.error('Reject friend request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject friend request'
        });
    }
});

// ========================================
// Remove friend
// ========================================
router.delete('/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find and remove friend
        const friendIndex = user.profile.friends.findIndex(
            f => f.userId.toString() === userId
        );

        if (friendIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Friend not found'
            });
        }

        user.profile.friends.splice(friendIndex, 1);
        await user.save();

        // Remove from other user's friends list
        const otherUser = await User.findById(userId);

        if (otherUser) {
            const otherFriendIndex = otherUser.profile.friends.findIndex(
                f => f.userId.toString() === req.user.id
            );

            if (otherFriendIndex !== -1) {
                otherUser.profile.friends.splice(otherFriendIndex, 1);
                await otherUser.save();
            }
        }

        res.json({
            success: true,
            data: {
                message: 'Friend removed successfully'
            }
        });
    } catch (error) {
        console.error('Remove friend error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove friend'
        });
    }
});

// ========================================
// Search users by name
// ========================================
router.get('/search', authenticate, async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const users = await User.find({
            'profile.name': { $regex: q, $options: 'i' },
            _id: { $ne: req.user.id } // Exclude current user
        })
            .limit(20)
            .select('profile.name profile.avatar profile.level profile.league');

        const results = users.map(u => ({
            userId: u._id,
            name: u.profile.name,
            avatar: u.profile.avatar,
            level: u.profile.level,
            league: u.profile.league
        }));

        res.json({
            success: true,
            data: {
                users: results,
                total: results.length
            }
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search users'
        });
    }
});

export default router;
