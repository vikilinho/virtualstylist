import { GoogleGenAI, Modality } from "@google/genai";

const OUTFIT_STYLES = ["Casual", "Business", "Night Out"];

export async function generateAllOutfits(
  base64ImageData: string,
  mimeType: string
): Promise<string[]> {
  // It is a best practice to create a new instance of GoogleGenAI for each request
  // in environments where the API key might change, but for this app, a single instance is fine.
  // We will still create it inside the function to be safe.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = {
    inlineData: {
      data: base64ImageData,
      mimeType,
    },
  };

  const generationPromises = OUTFIT_STYLES.map(style => {
    const textPart = {
      text: `Analyze the provided clothing item. Then, generate a complete '${style}' outfit that includes the original item. The generated image MUST be a clean, minimalist, photorealistic 'flat-lay' style presentation on a neutral off-white background. The outfit must include perfectly matching complementary pieces like tops/bottoms, shoes, and one or two accessories. The final image should only contain the clothing and accessory items for the flat-lay.`,
    };

    return ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
  });

  // Await all promises to resolve
  const responses = await Promise.all(generationPromises);

  // Process each response to extract the generated image
  const generatedImages = responses.map((response, index) => {
    // Check for response and candidates
    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error(`No candidates found in Gemini response for ${OUTFIT_STYLES[index]} style.`);
    }

    // Loop through parts to find the image data
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }

    // If no image is found in the parts, throw an error
    throw new Error(`No image data found in Gemini response for ${OUTFIT_STYLES[index]} style.`);
  });

  return generatedImages;
}