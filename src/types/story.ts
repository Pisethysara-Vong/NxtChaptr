export interface Story {
  id: string;
  title: string;
  url: string;
  lastKnownChapter: string | null;
  lastCheckedAt: string | null;
  failureCount: number;
}
export interface StoriesStore {
  stories: Story[];
}
