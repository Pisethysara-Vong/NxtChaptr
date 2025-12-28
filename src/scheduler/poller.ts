import { readStories, writeStories } from "../utils/fileStore";
import { scrapeUrl } from "../scraper";
import { logInfo } from "../utils/logger";
import { notifyNewChapters } from "../services/notifier";
import { closeBrowser, getBrowser } from "../scraper/browser";
import { Chapter } from "../types/scraper";

export async function updateStories(): Promise<void> {
  const data = readStories();
  const stories = data.stories;
  const browser = await getBrowser();

  try {
    for (const story of stories) {
      logInfo(`Scraping: ${story.title}`);
      try {
        const result = await scrapeUrl(story.url, browser);

        const chapters = result.chapters;
        const lastKnown = story.lastKnownChapter;

        const lastKnownIndex = chapters.findIndex(
          (ch) => ch.title === lastKnown
        );

        let newChapters: Chapter[] = [];

        if (lastKnownIndex === -1) {
          newChapters = chapters;
        } else if (lastKnownIndex > 0) {
          newChapters = chapters.slice(0, lastKnownIndex);
        }

        if (newChapters.length > 0) {
          story.lastKnownChapter = newChapters[0].title || lastKnown;
          await notifyNewChapters(story.title, newChapters, story.url);

          logInfo(
            `Updated ${story.title} with ${newChapters.length} new chapter(s).`
          );
        }

        story.lastCheckedAt = new Date().toISOString();
      } catch (err) {
        console.error(`Failed to scrape ${story.title}:`, err);
      }
    }
  } finally {
    await closeBrowser(); // ✅ clean shutdown
  }

  writeStories(data);
  logInfo("All stories updated!");
}
