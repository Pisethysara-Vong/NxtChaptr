import { GenericScraper } from "./generic";
import { registerScraper } from "./index";

const weebcentralScraper = new GenericScraper("weebcentral.com", {
  titleSelector: "h1",             // Broad: selects the main <h1> title
  chapterSelector: "#chapter-list > div",  // Select each chapter container
  chapterTitleSelector: "span:nth-child(1)", // The span containing chapter number/title
  chapterUrlSelector: "a"          // The <a> tag for the chapter link
});

registerScraper(weebcentralScraper);
