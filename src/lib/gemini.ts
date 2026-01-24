import { GoogleGenAI, Modality } from "@google/genai";

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
  const ai = new GoogleGenAI({ apiKey });

  const generatedImages: GeneratedImage[] = [];

  // Build the prompt for YouTube thumbnail generation
  const thumbnailPrompt = `Create a professional, eye-catching YouTube thumbnail. ${prompt}. 
  The image should be vibrant, high-contrast, and optimized for click-through rate. 
  Use bold colors and clear visual hierarchy. Aspect ratio should be 16:9.`;

  // If we have a reference image, convert it to base64
  let referenceImageData: { data: string; mimeType: string } | null = null;
  if (referenceImage) {
    const buffer = await referenceImage.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        "",
      ),
    );
    referenceImageData = {
      data: base64,
      mimeType: referenceImage.type,
    };
  }

  // Generate images one at a time
  for (let i = 0; i < count; i++) {
    try {
      const contents = referenceImageData
        ? [
            {
              inlineData: {
                mimeType: referenceImageData.mimeType,
                data: referenceImageData.data,
              },
            },
            { text: thumbnailPrompt },
          ]
        : [{ text: thumbnailPrompt }];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: contents,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      // Extract image from response
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const newImage: GeneratedImage = {
              id: `generated-${Date.now()}-${i}`,
              data: part.inlineData.data || "",
              mimeType: part.inlineData.mimeType || "image/png",
            };
            generatedImages.push(newImage);
            // Immediately notify about the new image
            onImageGenerated?.(newImage);
            break; // Only take the first image from each response
          }
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
    const ai = new GoogleGenAI({ apiKey });
    await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ text: "Hello" }],
    });
    return true;
  } catch {
    return false;
  }
}
