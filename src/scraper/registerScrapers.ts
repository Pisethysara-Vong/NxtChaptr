import { SCRAPER1_BASE_URL, SCRAPER2_BASE_URL } from "../config/env";
import { GenericScraper } from "./generic";
import { registerScraper } from "./index";

const scraper1 = new GenericScraper(`${SCRAPER1_BASE_URL}`, {
  titleSelector: "h1", // Broad: selects the main <h1> title
  chapterSelector: "#chapter-list > div", // Select each chapter container
  chapterTitleSelector:
    "a > span.grow.flex.items-center.gap-2 > span:nth-child(1)", // The span containing chapter number/title
  chapterUrlSelector: "a", // The <a> tag for the chapter link
  tabSelector: "#chapter-list > div",
});
const scraper2 = new GenericScraper(`${SCRAPER2_BASE_URL}`, {
  titleSelector:
    "article > section > div > div.flex.w-full.flex-col.gap-3.px-4.py-4 > div > h1", // Broad: selects the main <h1> title
  chapterSelector: `div[id*="tabpanel-chapters"] > div > div.space-y-1 > a`, // Select each chapter container
  chapterTitleSelector: "div > h3", // The span containing chapter number/title
  tabSelector: 'div[id*="tabpanel-chapters"]',
});

registerScraper(scraper1);
registerScraper(scraper2);
