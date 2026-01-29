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
  mainImage?: File,
  referenceImages?: File[],
  selectedTemplate?: string | null,
  count: number = 3,
  onImageGenerated?: (image: GeneratedImage) => void,
): Promise<GeneratedImage[]> {
  const google = createGoogleGenerativeAI({ apiKey });

  const generatedImages: GeneratedImage[] = [];

  // Convert file to base64 data URL
  const fileToDataUrl = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        "",
      ),
    );
    return `data:${file.type};base64,${base64}`;
  };

  // Fetch and convert URL to base64 data URL
  const urlToDataUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        "",
      ),
    );
    return `data:${blob.type};base64,${base64}`;
  };

  // Convert main image if available
  let mainImageDataUrl: string | null = null;
  if (mainImage) {
    mainImageDataUrl = await fileToDataUrl(mainImage);
  }

  // Convert reference images if available
  const referenceDataUrls: string[] = [];
  if (referenceImages && referenceImages.length > 0) {
    for (const refImg of referenceImages) {
      referenceDataUrls.push(await fileToDataUrl(refImg));
    }
  }

  // Load template thumbnail if selected
  let templateDataUrl: string | null = null;
  if (selectedTemplate) {
    try {
      templateDataUrl = await urlToDataUrl(`/${selectedTemplate}.jpg`);
    } catch (error) {
      console.warn("Failed to load template thumbnail:", error);
    }
  }

  // Build the prompt for YouTube thumbnail generation
  const hasMain = !!mainImageDataUrl;
  const hasReferences = referenceDataUrls.length > 0;
  const hasTemplate = !!templateDataUrl;

  let thumbnailPrompt = `Create a professional, eye-catching YouTube thumbnail based on this request: ${prompt}.\n\n`;

  // Build image context explanation
  const imageContextParts: string[] = [];
  let imageIndex = 1;

  if (hasMain) {
    imageContextParts.push(`- Image ${imageIndex}: This is the MAIN subject that MUST be prominently featured in the thumbnail.`);
    imageIndex++;
  }

  if (hasTemplate) {
    imageContextParts.push(`- Image ${imageIndex}: This is a STYLE TEMPLATE. Study its visual style, layout, colors, typography treatment, and overall composition. Create a thumbnail that follows this style closely.`);
    imageIndex++;
  }

  if (hasReferences) {
    const refCount = referenceDataUrls.length;
    if (refCount === 1) {
      imageContextParts.push(`- Image ${imageIndex}: This is a REFERENCE image for additional style inspiration.`);
    } else {
      imageContextParts.push(`- Images ${imageIndex}-${imageIndex + refCount - 1}: These are REFERENCE images for additional style inspiration.`);
    }
  }

  if (imageContextParts.length > 0) {
    thumbnailPrompt += `IMPORTANT: I am providing images below:\n${imageContextParts.join("\n")}\n\n`;
  }

  thumbnailPrompt += `Requirements:
- Make it vibrant, high-contrast, and optimized for click-through rate
- Use bold colors and clear visual hierarchy
- Aspect ratio must be 16:9
- Make it look professional and eye-catching`;

  if (hasTemplate) {
    thumbnailPrompt += `\n- CRITICAL: Match the visual style, layout, and aesthetic of the provided style template as closely as possible`;
  }

  // Generate images one at a time
  for (let i = 0; i < count; i++) {
    try {
      // Build the messages with optional images
      const userContent: Array<
        { type: "text"; text: string } | { type: "image"; image: string }
      > = [];

      // Add text prompt FIRST so the AI understands context
      userContent.push({
        type: "text",
        text: thumbnailPrompt,
      });

      // Add main image
      if (mainImageDataUrl) {
        userContent.push({
          type: "image",
          image: mainImageDataUrl,
        });
      }

      // Add template image
      if (templateDataUrl) {
        userContent.push({
          type: "image",
          image: templateDataUrl,
        });
      }

      // Add reference images
      for (const refUrl of referenceDataUrls) {
        userContent.push({
          type: "image",
          image: refUrl,
        });
      }

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
