import express from "express";
import { INTERVAL_MINUTES } from "./constants/timings";
import { seedStories, updateStories } from "./scheduler/poller";
import "./scraper/registerScrapers"; // Register all scrapers
import { logInfo } from "./utils/logger";

const app = express();

// Endpoint to manually trigger scraping
app.get("/update-stories", async (req, res) => {
  try {
    await updateStories();
    res.send("Stories updated successfully!");
  } catch (err) {
    res.status(500).send("Error updating stories");
  }
});

app.get("/health", (req, res) => res.send("Server is running"));

seedStories().catch(err => {
  console.error("Error seeding stories:", err);
});

let isUpdating = false;

setInterval(async () => {
  if (isUpdating) {
    logInfo("Update already running, skipping this interval.");
    return;
  }

  try {
    isUpdating = true;
    logInfo("Auto-updating stories...");
    await updateStories();
  } finally {
    isUpdating = false;
  }
}, INTERVAL_MINUTES * 60 * 1000);

export default app;
