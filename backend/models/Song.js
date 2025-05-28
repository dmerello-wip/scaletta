const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  words: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  typology: {
    type: String,
  },
  tone: {
    type: String,
  },
});

module.exports = mongoose.model('Song', songSchema);
