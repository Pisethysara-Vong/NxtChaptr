import { Browser } from "puppeteer";

export interface Chapter {
  id: string; // chapter identifier, e.g. "24", "25.5"
  title?: string; // optional chapter title, e.g. "Chapter 25: Awakening"
  url?: string | null; // link to the chapter page if available
}

export interface ScrapeResult {
  storyTitle: string;
  chapters: Chapter[]; // ordered newest → oldest
}

export interface Scraper {
  siteName: string;
  canHandle(url: string): boolean;
  scrape_update(url: string, browser: Browser, lastKnown: string): Promise<ScrapeResult>;
  scrape_seed(url: string, browser: Browser): Promise<ScrapeResult>;
}
