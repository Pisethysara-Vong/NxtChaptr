import { Browser } from "puppeteer";
import { Scraper, ScrapeResult } from "../types/scraper";

const scrapers: Scraper[] = [];

export function registerScraper(scraper: Scraper) {
  scrapers.push(scraper);
}

export function getScraper(url: string): Scraper {
  const scraper = scrapers.find(s => s.canHandle(url));
  if (!scraper) throw new Error(`No scraper found for URL: ${url}`);
  return scraper;
}

export async function scrapeUrl(url: string, browser: Browser, lastKnownChapter: string | null): Promise<ScrapeResult> {
  const scraper = getScraper(url);
  return scraper.scrape_update(url, browser, lastKnownChapter || "");
}

export async function scrapeSeed(url: string, browser: Browser): Promise<ScrapeResult> {
  const scraper = getScraper(url);
  return scraper.scrape_seed(url, browser);
}