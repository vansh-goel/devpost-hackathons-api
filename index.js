const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const port = 3000;

app.get("/challenges", async (req, res) => {
  try {
    // Get username from query parameter
    const username = req.query.username;
    if (!username) {
      return res.status(400).json({ error: "Username parameter is required" });
    }

    const url = `https://devpost.com/${username}/challenges`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const challenges = [];

    $("article.challenge-listing.featured").each((index, element) => {
      const $challenge = $(element);
      const $link = $challenge.find("a.clearfix");
      const $stats = $challenge.find(".stats");

      const challenge = {
        title: $challenge.find("h2.title").text().trim(),
        url: $link.attr("href"),
        prize: $stats.find("[data-currency-value]").first().text().trim(),
        submission_deadline: $stats.find("time").attr("datetime"),
        participants:
          parseInt($stats.find(".fa-user-friends + .value").text().trim()) || 0,
        featured: $challenge.find(".featured-tag").length > 0,
        description: $challenge.find(".challenge-description").text().trim(),
        location: $challenge
          .find(".challenge-location")
          .text()
          .replace(/\s+/g, " ")
          .trim(),
      };

      challenge.prize = challenge.prize ? `$${challenge.prize}` : "No prize";
      challenges.push(challenge);
    });

    res.json(challenges);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch challenges",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
