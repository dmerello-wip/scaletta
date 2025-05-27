const Song = require('../models/Song');

// Create a new song
const createSong = async (req, res) => {
  const { title, author, words, category, typology, tone } = req.body;
  try {
    const newSong = new Song({
      title,
      author,
      words,
      category,
      typology,
      tone,
    });
    const savedSong = await newSong.save();
    res.status(201).json(savedSong);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Validation error', errors: err.errors });
    }
    res.status(500).send('Server error');
  }
};

// Get all songs
const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find();
    res.status(200).json(songs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get a single song by ID
const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ msg: 'Song not found' });
    }
    res.status(200).json(song);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid song ID format' });
    }
    res.status(500).send('Server error');
  }
};

// Update a song by ID
const updateSongById = async (req, res) => {
  const { title, author, words, category, typology, tone } = req.body;
  try {
    const updatedSong = await Song.findByIdAndUpdate(
      req.params.id,
      { title, author, words, category, typology, tone },
      { new: true, runValidators: true }
    );
    if (!updatedSong) {
      return res.status(404).json({ msg: 'Song not found' });
    }
    res.status(200).json(updatedSong);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Validation error', errors: err.errors });
    }
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid song ID format' });
    }
    res.status(500).send('Server error');
  }
};

// Delete a song by ID
const deleteSongById = async (req, res) => {
  try {
    const deletedSong = await Song.findByIdAndDelete(req.params.id);
    if (!deletedSong) {
      return res.status(404).json({ msg: 'Song not found' });
    }
    res.status(200).json({ msg: 'Song deleted successfully', song: deletedSong });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid song ID format' });
    }
    res.status(500).send('Server error');
  }
};

module.exports = {
  createSong,
  getAllSongs,
  getSongById,
  updateSongById,
  deleteSongById,
};
