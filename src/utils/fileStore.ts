import fs from "fs";
import path from "path";
import { StoriesStore } from "../types/story";

const STORIES_PATH = path.join(process.cwd(), "src/config/stories.json");

export function readStories(): StoriesStore {
  const raw = fs.readFileSync(STORIES_PATH, "utf-8");
  return JSON.parse(raw) as StoriesStore;
}

export function writeStories(data: StoriesStore): void {
  const tempPath = `${STORIES_PATH}.tmp`;

  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempPath, STORIES_PATH);
}
