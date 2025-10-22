import { GoogleGenAI, Modality } from "@google/genai";

export const OUTFIT_STYLES = [
  "Casual", 
  "Business", 
  "Night Out",
  "Streetwear",
  "Minimalist",
  "Bohemian",
  "Sporty",
];

export interface Outfit {
  style: string;
  src: string;
}

/**
 * Generates a single outfit for a given style.
 * @param base64ImageData The base64 encoded image data.
 * @param mimeType The MIME type of the image.
 * @param style The clothing style to generate.
 * @returns A promise that resolves to an Outfit object.
 */
export async function generateOutfitForStyle(
  base64ImageData: string,
  mimeType: string,
  style: string
): Promise<Outfit> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = {
    inlineData: {
      data: base64ImageData,
      mimeType,
    },
  };

  const textPart = {
    text: `Analyze the provided clothing item. Then, generate a complete '${style}' outfit that includes the original item. The generated image MUST be a clean, minimalist, photorealistic 'flat-lay' style presentation on a neutral off-white background. The outfit must include perfectly matching complementary pieces like tops/bottoms, shoes, and one or two accessories. The final image should only contain the clothing and accessory items for the flat-lay.`,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [imagePart, textPart],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const candidate = response?.candidates?.[0];

  if (!candidate || !candidate.content || !candidate.content.parts) {
    const finishReason = candidate?.finishReason;
    const finishMessage = candidate?.finishMessage;
    console.error(`Gemini response issue for ${style} style. Finish reason: ${finishReason}. Message: ${finishMessage}`);
    throw new Error(`No valid content found in Gemini response for ${style} style. The content may have been blocked.`);
  }

  for (const part of candidate.content.parts) {
    if (part.inlineData && part.inlineData.data) {
      const base64ImageBytes: string = part.inlineData.data;
      return {
        style,
        src: `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`,
      };
    }
  }

  throw new Error(`No image data found in Gemini response for ${style} style.`);
}


/**
 * Generates the initial three outfits (Casual, Business, Night Out).
 * @param base64ImageData The base64 encoded image data.
 * @param mimeType The MIME type of the image.
 * @returns A promise that resolves to an array of three Outfit objects.
 */
export async function generateAllOutfits(
  base64ImageData: string,
  mimeType: string
): Promise<Outfit[]> {
  const initialStyles = OUTFIT_STYLES.slice(0, 3);
  const generationPromises = initialStyles.map(style =>
    generateOutfitForStyle(base64ImageData, mimeType, style)
  );
  return Promise.all(generationPromises);
}