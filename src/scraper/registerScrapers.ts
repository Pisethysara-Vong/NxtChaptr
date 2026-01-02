import {
  SCRAPER1_BASE_URL,
  SCRAPER2_BASE_URL,
  SCRAPER3_BASE_URL,
  SCRAPER4_BASE_URL,
  SCRAPER5_BASE_URL,
} from "../config/env";
import { GenericScraper } from "./generic";
import { registerScraper } from "./index";

const scraper1 = new GenericScraper(`${SCRAPER1_BASE_URL}`, {
  titleSelector: "h1",
  chapterSelector: "#chapter-list > div",
  chapterTitleSelector:
    "a > span.grow.flex.items-center.gap-2 > span:nth-child(1)",
  chapterUrlSelector: "a",
  tabSelector: "#chapter-list > div",
});
const scraper2 = new GenericScraper(`${SCRAPER2_BASE_URL}`, {
  titleSelector:
    "article > section > div > div.flex.w-full.flex-col.gap-3.px-4.py-4 > div > h1",
  chapterSelector: `div[id*="tabpanel-chapters"] > div > div.space-y-1 > a`,
  chapterTitleSelector: "div > h3",
  tabSelector: 'div[id*="tabpanel-chapters"]',
});

// const scraper3 = new GenericScraper(`${SCRAPER3_BASE_URL}`, {
//   titleSelector: ".post-title > h1",
//   chapterSelector: `ul.main.version-chap`,
//   chapterTitleSelector: "li.wp-manga-chapter a",
//   tabSelector: "ul.main.version-chap",
// });

const scraper4 = new GenericScraper(`${SCRAPER4_BASE_URL}`, {
  titleSelector: "main > div > div > div.grow > h3 > a",
  chapterSelector: `div[data-name="chapter-list"] div:last-child > div > div > div`,
  chapterTitleSelector: "div > a",
  tabSelector: `div[data-name="chapter-list"]`,
});

const scraper5 = new GenericScraper(`${SCRAPER5_BASE_URL}`, {
  titleSelector: "div#titlemove > h1",
  chapterSelector: `div#chapterlist > ul > li`,
  chapterTitleSelector: "a > span.chapternum",
  tabSelector: `div#chapterlist > ul`,
});

registerScraper(scraper1);
registerScraper(scraper2);
// registerScraper(scraper3);
registerScraper(scraper4);
registerScraper(scraper5);
