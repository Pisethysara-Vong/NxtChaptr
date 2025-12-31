import { Browser } from "puppeteer";
import { Chapter, Scraper, ScrapeResult } from "../types/scraper";

interface GenericScraperConfig {
  titleSelector: string;
  chapterSelector: string;
  tabSelector?: string;
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

  async scrape_update(
    url: string,
    browser: Browser,
    lastKnown: string
  ): Promise<ScrapeResult> {
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
        timeout: 10000,
      });

      const chaptersTab = await page.$(
        'button[role="tab"][data-key="chapters"]'
      );

      if (chaptersTab) {
        await chaptersTab.click();
      }

      await page
        .waitForSelector(this.config.tabSelector || "", { timeout: 10000 })
        .catch(() => null);

      // Try to expand chapter list if button exists
      const showAllButton = await page.$("#chapter-list > button");

      if (showAllButton) {
        await Promise.all([
          showAllButton.click(),
          page.waitForFunction(
            () => {
              const button = document.querySelector("#chapter-list > button");
              return (
                !button ||
                button.getAttribute("disabled") !== null ||
                document.querySelectorAll("#chapter-list > div").length > 10
              );
            },
            { timeout: 5000 }
          ),
        ]);
      }

      const result = await page.evaluate(
        (config, lastKnown) => {
          const titleEl = document.querySelector(config.titleSelector);
          const storyTitle = titleEl?.textContent?.trim() || "";

          const chapters: Chapter[] = [];
          const nodes = document.querySelectorAll(config.chapterSelector);

          for (const el of nodes) {
            const title =
              el
                .querySelector(config.chapterTitleSelector || "")
                ?.textContent?.trim() || "";

            const url = el
              .querySelector(config.chapterUrlSelector || "a")
              ?.getAttribute("href");

            if (!title) continue;

            // STOP CONDITION
            if (title === lastKnown) {
              break;
            }

            chapters.push({
              id: title,
              title,
              url,
            });
          }

          return { storyTitle, chapters };
        },
        this.config,
        lastKnown
      );

      return result;
    } finally {
      await page.close(); // GUARANTEED cleanup
    }
  }

  async scrape_seed(url: string, browser: Browser): Promise<ScrapeResult> {
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
        timeout: 10000,
      });

      const chaptersTab = await page.$(
        'button[role="tab"][data-key="chapters"]'
      );

      if (chaptersTab) {
        console.log("Clicking chapters tab...");
        await chaptersTab.click();
      }

      await page
        .waitForSelector(this.config.tabSelector || "", { timeout: 10000 })
        .catch(() => null);

      const result = await page.evaluate((config) => {
        const titleEl = document.querySelector(config.titleSelector);
        const storyTitle = titleEl?.textContent?.trim() || "";

        const chapters: Chapter[] = [];
        const node = document.querySelector(config.chapterSelector);

        if (!node) {
          return { storyTitle, chapters };
        }

        const chapTitleEl = config.chapterTitleSelector
          ? node.querySelector(config.chapterTitleSelector)
          : node;

        const title = chapTitleEl?.textContent?.trim() || "";

        const linkEl = config.chapterUrlSelector
          ? node.querySelector(config.chapterUrlSelector)
          : node.querySelector("a");

        const url = linkEl?.getAttribute("href");

        chapters.push({
          id: title,
          title,
          url,
        });

        return { storyTitle, chapters };
      }, this.config);

      return result;
    } finally {
      await page.close(); // GUARANTEED cleanup
    }
  }
}
