import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { Scraper, ScrapeResult, Chapter } from "../types/scraper";

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

  async scrape(url: string): Promise<ScrapeResult> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Use realistic User-Agent to avoid bot blocking
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2" });

    // Wait for chapter list to load (important for dynamic sites)
    await page.waitForSelector(this.config.chapterSelector);

    const html = await page.content();
    const $ = cheerio.load(html);

    // Get story title
    const storyTitle = $(this.config.titleSelector).first().text().trim();

    const chapters: Chapter[] = [];
    $(this.config.chapterSelector).each((_, el) => {
      const id = $(el).find("span:nth-child(1)").text().trim(); // 'chapter 106', 'chapter 105', etc.
      const title = this.config.chapterTitleSelector
        ? $(el).find(this.config.chapterTitleSelector).text().trim()
        : id; // fallback to id if no separate title selector
      const chapterUrl = $(el).find(this.config.chapterUrlSelector || "a").attr("href");

      chapters.push({ id, title, url: chapterUrl });
    });

    await browser.close();
    return { storyTitle, chapters };
  }
}
