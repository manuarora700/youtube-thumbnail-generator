import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export interface GeneratedImage {
  id: string;
  data: string; // base64 encoded image
  mimeType: string;
}

export async function generateThumbnails(
  apiKey: string,
  prompt: string,
  referenceImage?: File,
  count: number = 3,
  onImageGenerated?: (image: GeneratedImage) => void,
): Promise<GeneratedImage[]> {
  const google = createGoogleGenerativeAI({ apiKey });

  const generatedImages: GeneratedImage[] = [];

  // Build the prompt for YouTube thumbnail generation
  const thumbnailPrompt = `Create a professional, eye-catching YouTube thumbnail. ${prompt}. 
  The image should be vibrant, high-contrast, and optimized for click-through rate. 
  Use bold colors and clear visual hierarchy. Aspect ratio should be 16:9.`;

  // If we have a reference image, convert it to base64 data URL
  let referenceImageDataUrl: string | null = null;
  if (referenceImage) {
    const buffer = await referenceImage.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        "",
      ),
    );
    referenceImageDataUrl = `data:${referenceImage.type};base64,${base64}`;
  }

  // Generate images one at a time
  for (let i = 0; i < count; i++) {
    try {
      // Build the messages with optional reference image
      const userContent: Array<
        { type: "text"; text: string } | { type: "image"; image: string }
      > = [];

      if (referenceImageDataUrl) {
        userContent.push({
          type: "image",
          image: referenceImageDataUrl,
        });
      }

      userContent.push({
        type: "text",
        text: thumbnailPrompt,
      });

      const result = await generateText({
        model: google("gemini-2.5-flash-image"),
        messages: [
          {
            role: "user",
            content: userContent,
          },
        ],
        providerOptions: {
          google: {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: {
              aspectRatio: "16:9",
            },
          },
        },
      });

      // Extract images from result.files
      for (const file of result.files) {
        if (file.mediaType.startsWith("image/")) {
          // Convert Uint8Array to base64
          const uint8Array = await file.uint8Array;
          const base64 = btoa(
            uint8Array.reduce(
              (data, byte) => data + String.fromCharCode(byte),
              "",
            ),
          );

          const newImage: GeneratedImage = {
            id: `generated-${Date.now()}-${i}`,
            data: base64,
            mimeType: file.mediaType,
          };
          generatedImages.push(newImage);
          // Immediately notify about the new image
          onImageGenerated?.(newImage);
          break; // Only take the first image from each response
        }
      }
    } catch (error) {
      console.error(`Error generating image ${i + 1}:`, error);
      // Continue with remaining images even if one fails
    }
  }

  return generatedImages;
}

// API Key management
const API_KEY_STORAGE_KEY = "gemini_api_key";

export function getStoredApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setStoredApiKey(apiKey: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
}

export function removeStoredApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

// Validate API key by making a simple request
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const google = createGoogleGenerativeAI({ apiKey });
    await generateText({
      model: google("gemini-2.0-flash"),
      prompt: "Hello",
      maxOutputTokens: 10,
    });
    return true;
  } catch {
    return false;
  }
}
