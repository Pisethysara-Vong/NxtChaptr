import "dotenv/config";
import express from "express";
import { INTERVAL_MINUTES } from "./constants/constants";
import { updateStories } from "./scheduler/poller";
import { logInfo } from "./utils/logger";
import dns from "dns/promises";
import "./scraper/registerScrapers"; // Register all scrapers

const app = express();
const PORT = process.env.PORT || 3000;
let isUpdating = false;

// Helper: check for internet connection
async function hasInternet(): Promise<boolean> {
  try {
    // Try to resolve a common domain
    await dns.lookup("google.com");
    return true;
  } catch {
    return false;
  }
}

// Wrapper to wait until conditions are met
async function waitForConditions() {
  const checkInterval = 10000; // 10s
  logInfo("Checking internet connection before starting scraping...");
  while (!(await hasInternet())) {
    logInfo("No internet yet, waiting...");
    await new Promise((r) => setTimeout(r, checkInterval));
  }
  logInfo("Internet is available! Starting scraping...");
}

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

app.listen(PORT, async () => {
  logInfo(`NxtChaptr server running on http://localhost:${PORT}`);

  // Wait for conditions before starting scraping
  await waitForConditions();

  // Then start scraping periodically
  const SCRAPE_INTERVAL = 1000 * 60 * INTERVAL_MINUTES; // every 15 minutes
  logInfo("Starting scheduled scraping tasks...");

  async function startScrapingLoop() {
    if (!isUpdating) {
      try {
        isUpdating = true;
        await updateStories();
      } finally {
        isUpdating = false;
      }
    }
    setTimeout(startScrapingLoop, SCRAPE_INTERVAL);
  }

  startScrapingLoop();
});

export default app;
