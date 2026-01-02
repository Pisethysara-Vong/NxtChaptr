import { BATCH_SIZE } from "../constants/constants";
import { scrapeUrl } from "../scraper";
import { closeBrowser, getBrowser } from "../scraper/browser";
import { notifyNewChapters } from "../services/notifier";
import { Story } from "../types/story";
import { chunkArray } from "../utils/chuckArray";
import { readStories, writeStories } from "../utils/fileStore";
import { logInfo } from "../utils/logger";

export async function updateStories(): Promise<void> {
  const data = readStories();
  const stories = data.stories;
  const browser = await getBrowser();
  const batches = chunkArray(stories, BATCH_SIZE);

  try {
    for (const batch of batches) {
      logInfo(`Processing batch of ${batch.length} stories`);

      await Promise.all(
        batch.map(async (story: Story) => {
          logInfo(`Scraping: ${story.title}`);
          const storyUrl = story.url;
          const lastKnownChapter = story.lastKnownChapter;

          try {
            const result = await scrapeUrl(storyUrl, browser, lastKnownChapter);
            if (result.storyTitle === "") {
              logInfo(`⚠️ Could not scrape ${story.title} due to expired cf_clearance cookie. Skipping.`);
              return;
            }
            const chapters = result.chapters;

            if (chapters.length === 0) {
              logInfo(`⏩ No new chapters found for ${story.title}. Skipping.`);
              story.lastCheckedAt = new Date().toISOString();
              return;
            }

            if (chapters.length > 0) {
              story.lastKnownChapter = chapters[0].title || lastKnownChapter;
              await notifyNewChapters(story.title, chapters, storyUrl);

              logInfo(
                `✅ Updated ${story.title} with ${chapters.length} new chapter(s). Latest: ${story.lastKnownChapter}`
              );
            }

            story.lastCheckedAt = new Date().toISOString();
          } catch (err) {
            console.error(`Failed to scrape ${story.title}:`, err);
          }
        })
      );

      // Small cooldown between batches (VERY important)
      await new Promise((r) => setTimeout(r, 8000));
    }
  } finally {
    await closeBrowser(); // ✅ still clean shutdown
  }

  writeStories(data);
  console.log("\n✅ All stories updated!");
}
