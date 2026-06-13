const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Require auth for all notification endpoints

router.get('/', getNotifications);
router.put('/read/all', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
