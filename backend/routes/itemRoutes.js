const express = require('express');
const router = express.Router();
const {
  createItem,
  getItems,
  getItem,
  getItemSuggestions,
  updateItem,
  deleteItem,
  getMyItems
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .post(protect, upload.single('image'), createItem)
  .get(getItems);

router.get('/my/all', protect, getMyItems);

router.route('/:id')
  .get(getItem)
  .put(protect, upload.single('image'), updateItem)
  .delete(protect, deleteItem);

router.get('/:id/suggestions', getItemSuggestions);

module.exports = router;
