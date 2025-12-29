import * as cheerio from "cheerio";
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
      .waitForSelector(this.config.chapterSelector, {
        timeout: 15000,
      })
      .catch(() => null);

    const html = await page.content();
    const $ = cheerio.load(html);

    const storyTitle = $(this.config.titleSelector).first().text().trim();

    const chapters: Chapter[] = [];
    $(this.config.chapterSelector).each((_, el) => {
      const id = $(el).find("span:nth-child(1)").text().trim();
      const title = this.config.chapterTitleSelector
        ? $(el).find(this.config.chapterTitleSelector).text().trim()
        : id;

      const chapterUrl = $(el)
        .find(this.config.chapterUrlSelector || "a")
        .attr("href");

      chapters.push({ id, title, url: chapterUrl });
    });

    await page.close(); // VERY IMPORTANT
    return { storyTitle, chapters };
  }
}
