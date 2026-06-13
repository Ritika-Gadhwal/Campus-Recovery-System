const express = require('express');
const router = express.Router();
const {
  createClaim,
  getMyClaims,
  getIncomingClaims,
  updateClaimStatus
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All claim routes require authentication

router.route('/')
  .post(createClaim);

router.get('/my/requests', getMyClaims);
router.get('/incoming', getIncomingClaims);
router.put('/:id/status', updateClaimStatus);

module.exports = router;
