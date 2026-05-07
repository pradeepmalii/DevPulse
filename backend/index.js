require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Developer = require('./models/Developer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ==========================================
// API ROUTES
// ==========================================

// 1. GET /api/leaderboard - Get the top 10 developers sorted by totalCommits
app.get('/api/leaderboard', async (req, res) => {
  try {
    const topDevelopers = await Developer.find()
      .sort({ totalCommits: -1 }) // Sort descending
      .limit(10); // Only get the top 10
    
    res.json(topDevelopers);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. POST /api/leaderboard - Add or update a developer in the leaderboard
app.post('/api/leaderboard', async (req, res) => {
  try {
    const { username, name, avatarUrl, totalCommits, activeDays, publicRepos, followers } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Upsert (Update if exists, Insert if it doesn't)
    const developer = await Developer.findOneAndUpdate(
      { username: username }, // Find by username
      { 
        name, 
        avatarUrl, 
        totalCommits, 
        activeDays, 
        publicRepos, 
        followers,
        lastSearchedAt: Date.now()
      }, 
      { new: true, upsert: true } // Upsert logic
    );

    res.status(200).json({ message: 'Developer updated on leaderboard', developer });
  } catch (error) {
    console.error('Error saving developer:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start Server
app.get("/", (req, res) => {
    res.send("DevPulse Backend Running")
})
app.listen(PORT, () => {
  console.log(`🚀 DevPulse Backend running on http://localhost:${PORT}`);
});
