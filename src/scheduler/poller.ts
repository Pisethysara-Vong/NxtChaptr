import { readStories, writeStories } from "../utils/fileStore";
import { scrapeUrl } from "../scraper";
import { logInfo } from "../utils/logger";
import { notifyNewChapters } from "../services/notifier";

export async function updateStories(): Promise<void> {
  const data = readStories();
  const stories = data.stories;

  for (const story of stories) {
    logInfo(`Scraping: ${story.title}`);
    try {
      const result = await scrapeUrl(story.url);

      const chapters = result.chapters;
      const lastKnown = story.lastKnownChapter;

      // Find the index of the last known chapter
      const lastKnownIndex = chapters.findIndex((ch) => ch.title === lastKnown);

      let newChapters: typeof chapters = [];

      if (lastKnownIndex === -1) {
        // lastKnownChapter not found → all chapters are new
        newChapters = chapters;
      } else if (lastKnownIndex === 0) {
        // No new chapters
        logInfo(`No new chapters for ${story.title}. Skipping update.`);
        story.lastCheckedAt = new Date().toISOString();
        continue;
      } else {
        // Take all chapters before the lastKnownChapter
        newChapters = chapters.slice(0, lastKnownIndex);
      }

      if (newChapters.length > 0) {
        // Update lastKnownChapter with the first (most recent) new chapter
        story.lastKnownChapter = newChapters[0].title || lastKnown;
        await notifyNewChapters(story.title, newChapters, story.url);
        
        logInfo(
          `Updated ${story.title} with ${newChapters.length} new chapter(s). Latest: ${story.lastKnownChapter}`
        );
      }

      story.lastCheckedAt = new Date().toISOString();
    } catch (err) {
      console.error(`Failed to scrape ${story.title}:`, err);
    }
  }

  writeStories(data);
  logInfo("All stories updated!");
}
