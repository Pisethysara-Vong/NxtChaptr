import { Browser } from "puppeteer";
import { Chapter, Scraper, ScrapeResult } from "../types/scraper";

interface GenericScraperConfig {
  titleSelector: string;
  chapterSelector: string;
  chapterTitleSelector?: string;
  chapterUrlSelector?: string;
}

export class GenericScraper implements Scraper {
  siteName: string;
  config: GenericScraperConfig;

  constructor(siteName: string, config: GenericScraperConfig) {
    this.siteName = siteName;
    this.config = config;
  }

  canHandle(url: string): boolean {
    return url.includes(this.siteName);
  }

  async scrape(url: string, browser: Browser): Promise<ScrapeResult> {
    const page = await browser.newPage();

    try {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
      );

      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const type = req.resourceType();
        if (["image", "font", "media"].includes(type)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      await page
        .waitForSelector(this.config.chapterSelector, { timeout: 15000 })
        .catch(() => null);

      const result = await page.evaluate((config) => {
        const titleEl = document.querySelector(config.titleSelector);
        const storyTitle = titleEl?.textContent?.trim() || "";

        const chapters: Chapter[] = Array.from(
          document.querySelectorAll(config.chapterSelector)
        ).map((el) => {
          const id = config.chapterTitleSelector
            ? el
                .querySelector(config.chapterTitleSelector)
                ?.textContent?.trim() || ""
            : "";

          const title = config.chapterTitleSelector
            ? el
                .querySelector(config.chapterTitleSelector)
                ?.textContent?.trim() || id
            : id;

          const url =
            el
              .querySelector(config.chapterUrlSelector || "a")
              ?.getAttribute("href") || null;

          return { id, title, url };
        });

        return { storyTitle, chapters };
      }, this.config);

      return result;
    } finally {
      await page.close(); // GUARANTEED cleanup
    }
  }
}
