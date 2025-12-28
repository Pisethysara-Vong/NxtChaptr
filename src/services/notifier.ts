import { sendTelegramMessage } from "./telegram";
import { Chapter } from "../types/scraper";

export async function notifyNewChapters(
  storyTitle: string,
  chapters: Chapter[],
  storyUrl: string
): Promise<void> {
  if (chapters.length === 0) return;

  const chapterLines = chapters.map((ch) => `- ${ch.title}`).join("\n");

  const message = `
📚 New chapters released!

Title: ${storyTitle}
Chapters:
${chapterLines}

Link:
${storyUrl}
`.trim();

  await sendTelegramMessage(message);
}
