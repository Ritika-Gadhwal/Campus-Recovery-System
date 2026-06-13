const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getAllUsers,
  deleteUser,
  updateUserRole
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.use(protect);
router.use(admin); // Restrict all these endpoints to Admins

router.get('/analytics', getDashboardAnalytics);
router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .delete(deleteUser);

router.put('/users/:id/role', updateUserRole);

module.exports = router;
