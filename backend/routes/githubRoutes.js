const express = require("express");
console.log("GitHub routes loaded");
const axios = require("axios");

const router = express.Router();

const headers = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
};

// GET USER PROFILE
router.get("/user/:username", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.github.com/users/${req.params.username}`,
      { headers }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// GET REPOS
router.get("/repos/:username", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.github.com/users/${req.params.username}/repos?per_page=100&sort=pushed`,
      { headers }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch repos" });
  }
});

module.exports = router;