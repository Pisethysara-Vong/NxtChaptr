import express from "express";
import "./scraper/registerScrapers"; // Register all scrapers
import { updateStories } from "./scheduler/poller";
import { logInfo } from "./utils/logger";
import { INTERVAL_MINUTES } from "./constants/timings";
import { sendTelegramMessage } from "./services/telegram";

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

sendTelegramMessage("Hello from server. This is a message to test that telegram service is working.");

export default app;
