const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  totalCommits: {
    type: Number,
    default: 0
  },
  activeDays: {
    type: Number,
    default: 0
  },
  publicRepos: {
    type: Number,
    default: 0
  },
  followers: {
    type: Number,
    default: 0
  },
  lastSearchedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Developer', developerSchema);
