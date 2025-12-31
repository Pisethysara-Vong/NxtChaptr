import "dotenv/config";
import { BATCH_SIZE } from "./constants/constants";
import { scrapeSeed, scrapeUrl } from "./scraper";
import { closeBrowser, getBrowser } from "./scraper/browser";
import "./scraper/registerScrapers"; // Register all scrapers
import { Story } from "./types/story";
import { chunkArray } from "./utils/chuckArray";
import { readStories, writeStories } from "./utils/fileStore";
import { logInfo } from "./utils/logger";

export async function seedStories(): Promise<void> {
  const data = readStories();
  const stories = data.stories;
  const browser = await getBrowser();
  const batches = chunkArray(stories, BATCH_SIZE);

  try {
    for (const batch of batches) {
      logInfo(`Processing batch of ${batch.length} stories`);
      
      await Promise.all(
        batch.map(async (story: Story) => {
          logInfo(`Seeding: ${story.title}`);

          try {
            const result = await scrapeSeed(story.url, browser);
            const chapters = result.chapters;
            const lastKnown = story.lastKnownChapter;

            if (chapters.length === 0) {
              logInfo(`No chapters found for ${story.title}. Skipping.`);
              return;
            }

            if (!lastKnown && chapters.length > 0) {
              story.lastKnownChapter = chapters[0].title || null;
              logInfo(
                `✅ Seeded ${story.title}. Latest chapter: ${story.lastKnownChapter}`
              );
            } else {
              logInfo(`✅ ${story.title} already seeded.`);
            }
          } catch (err) {
            console.error(`\nFailed to scrape ${story.title} during seeding:`, err);
          }
          await new Promise((r) => setTimeout(r, 3000));
        })
      );
    }
  } finally {
    await closeBrowser(); // ✅ clean shutdown
  }

  writeStories(data);
  console.log("\n✅ Seeding completed for all stories!");
}

seedStories();

// async function test() {
//   const browser = await getBrowser();
//   const lastKnownChapter = 'Chapter 79';
//   const url = "https://weebcentral.com/series/01K27G582KZJ5TPCJ5K83MSPX4/the-100th-regression-of-the-maxlevel-player";
//   const result = await scrapeUrl(url, browser, lastKnownChapter);
//   console.log(result);
// }

// test();
