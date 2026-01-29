import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtu.be/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  // Pattern 1: youtube.com/watch?v=VIDEO_ID or youtube.com/embed/VIDEO_ID
  let match = url.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  if (match && match[1]) {
    return match[1];
  }

  // Pattern 2: youtu.be/VIDEO_ID
  match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return match[1];
  }

  // Pattern 3: Direct video ID (11 characters)
  match = url.match(/^([a-zA-Z0-9_-]{11})$/);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Fetches YouTube thumbnail image and converts it to a File object
 * @param videoId YouTube video ID
 * @returns Promise<File> The thumbnail image as a File object
 */
export async function fetchYouTubeThumbnail(videoId: string): Promise<File> {
  // Try maxresdefault first (best quality), fallback to hqdefault
  const thumbnailUrls = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  ];

  let thumbnailUrl: string | null = null;
  let response: Response | null = null;

  // Try each URL until one works
  for (const url of thumbnailUrls) {
    try {
      response = await fetch(url, { method: "HEAD" });
      if (response.ok) {
        thumbnailUrl = url;
        break;
      }
    } catch (error) {
      console.warn(`Failed to fetch thumbnail from ${url}:`, error);
      continue;
    }
  }

  if (!thumbnailUrl || !response) {
    throw new Error("Failed to fetch YouTube thumbnail");
  }

  // Fetch the actual image
  const imageResponse = await fetch(thumbnailUrl);
  if (!imageResponse.ok) {
    throw new Error("Failed to fetch YouTube thumbnail image");
  }

  const blob = await imageResponse.blob();
  const fileName = `youtube-thumbnail-${videoId}.jpg`;
  
  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
}
