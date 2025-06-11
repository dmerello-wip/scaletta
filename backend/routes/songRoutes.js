const express = require('express');
const router = express.Router();
const {
  createSong,
  getAllSongs,
  getSongById,
  updateSongById,
  deleteSongById,
} = require('../controllers/songController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/songs
// @desc    Create a new song
// @access  Private
router.post('/', protect, createSong);

// @route   GET /api/songs
// @desc    Get all songs
// @access  Public
router.get('/', getAllSongs);

// @route   GET /api/songs/:id
// @desc    Get a single song by ID
// @access  Private
router.get('/:id', protect, getSongById);

// @route   PUT /api/songs/:id
// @desc    Update a song by ID
// @access  Private
router.put('/:id', protect, updateSongById);

// @route   DELETE /api/songs/:id
// @desc    Delete a song by ID
// @access  Private
router.delete('/:id', protect, deleteSongById);

module.exports = router;
