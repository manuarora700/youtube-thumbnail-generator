import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

/**
 * Generates optimized prompts for YouTube thumbnails
 * YouTube thumbnails work best with:
 * - High contrast and vibrant colors
 * - Clear focal points
 * - Minimal text (if any, large and bold)
 * - Emotional expressions
 * - 16:9 aspect ratio
 * - Eye-catching elements
 */
const generateThumbnailPrompt = (userDescription) => {
  const basePrompt = `Create a professional YouTube thumbnail in 16:9 aspect ratio. ${userDescription}.

IMPORTANT REQUIREMENTS:
- Ultra high contrast with vibrant, saturated colors
- Sharp focus on the main subject
- Dramatic lighting with strong highlights and shadows
- Professional photography quality
- Clean composition with clear focal point
- Eye-catching and clickable design
- Modern, trendy aesthetic
- Photo-realistic style (not cartoon or illustration)
- High energy and engaging visual
- Optimized for small screen visibility`;

  return basePrompt;
};

/**
 * Style variations for different types of YouTube content
 */
const styleVariations = [
  'cinematic dramatic lighting with lens flare and depth of field',
  'bold graphic design with high saturation and strong shadows',
  'professional studio lighting with clean background',
  'dynamic action shot with motion blur and energy',
  'vibrant pop art style with bold colors and contrast',
  'neon cyberpunk aesthetic with glowing elements',
  'warm golden hour lighting with natural tones',
  'high-key bright and airy professional style'
];

/**
 * Generates multiple thumbnail variations using OpenAI DALL-E 3
 * Uses Promise.allSettled for parallel generation (critical performance optimization)
 */
export const generateThumbnailsOpenAI = async ({ apiKey, imageUrl, description, count = 3 }) => {
  // Early returns for validation
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (!description || !description.trim()) {
    throw new Error('Description is required');
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
  });

  const actualCount = Math.min(count, 10);
  
  // Create all generation promises upfront for parallel execution
  const generationPromises = Array.from({ length: actualCount }, (_, i) => {
    const styleVariation = styleVariations[i % styleVariations.length];
    const enhancedDescription = `${description}. Style: ${styleVariation}`;
    const prompt = generateThumbnailPrompt(enhancedDescription);

    return openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1792x1024', // 16:9 aspect ratio (closest to YouTube thumbnail ratio)
      quality: 'hd',
      style: 'vivid', // Vivid style works better for thumbnails than natural
    });
  });

  // Execute all requests in parallel using Promise.allSettled
  const results = await Promise.allSettled(generationPromises);

  const thumbnails = [];
  const errors = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.data?.[0]) {
      thumbnails.push({
        url: result.value.data[0].url,
        revised_prompt: result.value.data[0].revised_prompt,
      });
    } else if (result.status === 'rejected') {
      console.error(`Error generating thumbnail ${i + 1}:`, result.reason);
      errors.push(result.reason?.message || 'Unknown error');
    }
  });

  if (thumbnails.length === 0) {
    throw new Error(
      errors.length > 0
        ? `Failed to generate thumbnails: ${errors[0]}`
        : 'Failed to generate thumbnails'
    );
  }

  return thumbnails;
};

/**
 * Generates multiple thumbnail variations using Google Gemini with image generation
 * Uses Promise.allSettled for parallel generation (critical performance optimization)
 */
export const generateThumbnailsGemini = async ({ apiKey, imageUrl, description, count = 3 }) => {
  // Early returns for validation
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  if (!description || !description.trim()) {
    throw new Error('Description is required');
  }

  // Initialize the Google GenAI SDK
  const ai = new GoogleGenAI({ apiKey });

  const actualCount = Math.min(count, 10);

  // Parse image data once if available (avoid repeated parsing)
  let imageInlineData = null;
  if (imageUrl && imageUrl.startsWith('data:')) {
    const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      imageInlineData = {
        inlineData: {
          mimeType: matches[1],
          data: matches[2],
        },
      };
    }
  }

  // Create all generation promises upfront for parallel execution
  const generationPromises = Array.from({ length: actualCount }, (_, i) => {
    const styleVariation = styleVariations[i % styleVariations.length];
    const enhancedDescription = `${description}. Style: ${styleVariation}`;
    const prompt = generateThumbnailPrompt(enhancedDescription);

    // Build contents array with prompt and optional reference image
    const contents = [{ text: prompt }];
    if (imageInlineData) {
      contents.push(imageInlineData);
    }

    return ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: contents,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: '16:9',
        },
      },
    });
  });

  // Execute all requests in parallel using Promise.allSettled
  const results = await Promise.allSettled(generationPromises);

  const thumbnails = [];
  const errors = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      const response = result.value;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            const imageDataUrl = `data:${mimeType};base64,${imageData}`;
            
            thumbnails.push({
              url: imageDataUrl,
              revised_prompt: styleVariations[i % styleVariations.length],
            });
            break; // Only take the first image from this response
          }
        }
      }
    } else {
      console.error(`Error generating thumbnail ${i + 1} with Gemini:`, result.reason);
      errors.push(result.reason?.message || 'Unknown error');
    }
  });

  if (thumbnails.length === 0) {
    throw new Error(
      errors.length > 0
        ? `Failed to generate thumbnails: ${errors[0]}`
        : 'Failed to generate thumbnails with Gemini'
    );
  }

  return thumbnails;
};

/**
 * Main function to generate thumbnails based on selected provider
 */
export const generateThumbnails = async ({ provider, openaiApiKey, geminiApiKey, imageUrl, description, count = 3 }) => {
  if (provider === 'gemini') {
    return generateThumbnailsGemini({ apiKey: geminiApiKey, imageUrl, description, count });
  }
  // Default to OpenAI
  return generateThumbnailsOpenAI({ apiKey: openaiApiKey, imageUrl, description, count });
};

/**
 * Alternative: Generate thumbnails using GPT-4 Vision for image editing
 * This can be used to analyze the uploaded image and provide suggestions
 */
export const analyzeThumbnailImage = async ({ apiKey, imageUrl, description }) => {
  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image for YouTube thumbnail potential. Provide 3 specific suggestions for how to make it more clickable and engaging. User's goal: ${description}`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};
