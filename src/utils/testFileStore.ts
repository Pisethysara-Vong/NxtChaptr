import { readStories, writeStories } from "./fileStore";
import { logInfo } from "./logger";

function testFileStore() {
  logInfo("Reading stories.json...");
  const data = readStories();
  console.dir(data, { depth: null });

  if (data.stories.length === 0) {
    logInfo("No stories found. Exiting.");
    return;
  }

  const firstStory = data.stories[0];

  logInfo(`Updating lastCheckedAt for: ${firstStory.title}`);

  firstStory.lastCheckedAt = new Date().toISOString();

  writeStories(data);

  logInfo("Re-reading stories.json...");
  const updated = readStories();
  console.dir(updated, { depth: null });
}

testFileStore();
