import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ClothingItem, GeneratedOutfits, OutfitCritique, OutfitOfTheDaySuggestion } from '../types';

// Ensure the API key is available. In a real app, this would be handled more securely.
if (!process.env.API_KEY) {
  // In a real scenario, you'd have a more robust way to handle this,
  // but for this example, we'll throw an error.
  // The environment setup ensures process.env.API_KEY is available.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function analyzeClothingImage(imageBase64: string, mimeType: string): Promise<Omit<ClothingItem, 'id' | 'imageData' | 'mimeType'>> {
  const model = 'gemini-2.5-flash';

  const prompt = `You are an expert fashion cataloging AI. Your sole task is to analyze the provided image of a clothing item and return a single, valid JSON object with the specified schema. Do not include any text before or after the JSON.

Analyze the user-provided image and return *only* the JSON object.`;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: imageBase64,
              mimeType,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ["tops", "bottoms", "dress", "shoes", "accessories", "outerwear"] },
            color: { type: Type.STRING, description: "The dominant color of the item (e.g., 'Navy Blue', 'Red', 'Beige')" },
            pattern: { type: Type.STRING, enum: ["solid", "striped", "floral", "plaid", "graphic", "polka dot", "null"] },
            style: { type: Type.STRING, enum: ["casual", "formal", "business", "athletic", "streetwear", "bohemian", "minimalist"] },
            season: { type: Type.STRING, enum: ["spring", "summer", "fall", "winter", "all-season"] },
            description: { type: Type.STRING, description: "A 2-5 word description (e.g., 'Blue Denim Jeans', 'Floral Off-Shoulder Top')" },
          },
          required: ["category", "color", "pattern", "style", "season", "description"]
        },
      },
    });

    return JSON.parse(response.text);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[analyzeClothingImage Error]:', errorMessage);
    throw new Error(`Failed to analyze image: ${errorMessage}`);
  }
}

export async function generateOutfits(wardrobeItems: ClothingItem[], occasion: string, constraints: string = ''): Promise<GeneratedOutfits> {
  const model = 'gemini-2.5-flash';
  
  const itemDescriptions = wardrobeItems.map(
    (item) => `ID ${item.id}: ${item.description} (${item.category}, ${item.color}, ${item.style})`
  ).join('\n');

  const prompt = `You are a creative professional fashion stylist with deep knowledge of color theory, cultural backgrounds, and traditional attire. Given the available wardrobe, think smartly about color combinations and the user's culture to suggest outfits suitable for "${occasion}".

Available wardrobe items:
${itemDescriptions}

${constraints ? "Constraints: " + constraints : ""}

Create exactly 2 outfit suggestions in JSON format, choosing *only* from the best options available in the provided wardrobe. **Do not suggest any items the user does not own.**

Your response must be *only* a single valid JSON object that matches the provided schema. Do not include any introductory text, markdown, or backticks.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outfits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "distinct outfit name" },
                  itemIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                  reasoning: { type: Type.STRING, description: "reflects how color, culture, or tradition fit the occasion" },
                  stylingTips: { type: Type.STRING, description: "concise, actionable advice for wearing and combining pieces" },
                  accessories: { type: Type.STRING, description: "suggest specific accessories to elevate the look (consider cultural relevance)" },
                  vibe: { type: Type.STRING, description: "clear description of the overall effect (e.g., festive South Asian, modern Western business)" },
                },
                required: ["name", "itemIds", "reasoning", "stylingTips", "accessories", "vibe"],
              },
            },
            mustHaves: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "essential wardrobe items if the current wardrobe is lacking",
            }
          },
          required: ["outfits"],
        },
      },
    });
    
    return JSON.parse(response.text);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[generateOutfits Error]:', errorMessage);
    throw new Error(`Failed to generate outfits: ${errorMessage}`);
  }
}

export async function enhanceOutfits(
  wardrobeItems: ClothingItem[],
  occasion: string
): Promise<{ mustHaves: string[] }> {
  const model = 'gemini-2.5-flash';

  const itemDescriptions = wardrobeItems.map(
    (item) => `- ${item.description} (${item.category}, ${item.color}, ${item.style})`
  ).join('\n');

  const prompt = `You are a creative professional fashion stylist and personal shopper. A user needs outfit ideas for "${occasion}".
  
  Their current wardrobe contains:
  ${itemDescriptions}

  Your task is to suggest up to 3 essential "must-have" items they could purchase to enhance their wardrobe for this and similar occasions. Be specific and inspiring (e.g., "a classic black blazer", "versatile white leather sneakers", "a statement silk scarf").

  Return your suggestions as a single, valid JSON object with only a "mustHaves" key containing an array of strings. Do not include any other text or markdown.`;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mustHaves: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Essential wardrobe items to purchase.",
            }
          },
          required: ["mustHaves"],
        },
      },
    });
    
    return JSON.parse(response.text);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[enhanceOutfits Error]:', errorMessage);
    throw new Error(`Failed to enhance outfits: ${errorMessage}`);
  }
}

export async function chatWithStylist(message: string, wardrobeContext: ClothingItem[] = []): Promise<string> {
    const model = 'gemini-2.5-flash';

    const context = wardrobeContext.length > 0
    ? `\n\nUser's wardrobe includes: ${wardrobeContext.map(item => `${item.description} (${item.category} in ${item.color})`).join(', ')}`
    : '';

    const prompt = `You are "Aura," an AI personal stylist. Your personality is warm, encouraging, knowledgeable, and slightly playful. You are an expert in color theory, body types, and modern trends. Your goal is to make the user feel confident and stylish.

**Your Rules:**
1.  **Be Friendly & Concise:** Keep your answers short and conversational (2-3 sentences max). Use an emoji where it feels natural.
2.  **Stay On-Topic (Eligibility):** Only provide fashion and style advice. If the user asks for advice *outside* of fashion (like medical, financial, or serious personal problems), you MUST gently redirect them back to styling. (e.g., "I'm really just an expert in fashion! What are you thinking of wearing today? 😊")
3.  **Be Practical:** If their wardrobe is missing items for their request, you can politely suggest 1-2 key pieces that would help.
4.  **Use Context:** Use the user's wardrobe context if it's provided.${context}

**CONVERSATION:**
User: ${message}
Aura:`;

    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('[chatWithStylist Error]:', errorMessage);
        throw new Error(`Chat failed: ${errorMessage}`);
    }
}

export async function generateAIStyleboard(clothingItems: ClothingItem[]): Promise<string> {
  const model = 'gemini-2.5-flash-image';
  
  const contentParts: any[] = [
    { text: "You are an AI fashion art director. Your task is to generate one, clean, photorealistic image of an AI-generated mannequin or model wearing all the clothing items I provide. The model should be standing on a plain white studio background. Show the full body. This is for a 'Styleboard' or 'mockup'. Do *not* use a real person. Generate a synthetic model." }
  ];

  for (const item of clothingItems) {
    contentParts.push({ text: `Here is a clothing item (${item.description || 'item'}):` });
    contentParts.push({ inlineData: { data: item.imageData, mimeType: item.mimeType } });
  }
  
  contentParts.push(
    { text: "Now, generate the single, complete image of the AI model wearing all of these items. Return only the image." }
  );
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contentParts },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        return part.inlineData.data;
      }
    }
    
    throw new Error('No image part found in the response.');

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[generateAIStyleboard Error]:', errorMessage);
    throw new Error(`Failed to generate Styleboard: ${errorMessage}`);
  }
}

export async function generateOutfitOfTheDay(
  wardrobeItems: ClothingItem[],
  weather: string,
  calendarEvents: string
): Promise<OutfitOfTheDaySuggestion> {
  const model = 'gemini-2.5-flash';

  const itemDescriptions = wardrobeItems.map(
    (item) => `ID ${item.id}: ${item.description} (${item.category}, ${item.color}, ${item.style})`
  ).join('\n');

  const prompt = `You are a proactive and helpful AI personal stylist named Aura. Your task is to suggest a single, complete, and stylish "Outfit of the Day" based on the user's available wardrobe, the weather, and their schedule.

**Today's Weather:**
${weather}

**Today's Schedule:**
${calendarEvents}

**User's Wardrobe:**
${itemDescriptions}

Based on all this information, create one perfect outfit. Return your suggestion as a single, valid JSON object matching the provided schema. Do not include any text before or after the JSON. The reasoning should be a short, encouraging sentence explaining why this outfit is a great choice for today.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of IDs of the clothing items that make up the outfit.",
            },
            reasoning: {
              type: Type.STRING,
              description: "A 1-2 sentence explanation of why this outfit is perfect for today's weather and events."
            }
          },
          required: ["itemIds", "reasoning"],
        },
      },
    });
    
    return JSON.parse(response.text);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[generateOutfitOfTheDay Error]:', errorMessage);
    throw new Error(`Failed to generate Outfit of the Day: ${errorMessage}`);
  }
}

export async function rateOutfit(imageBase64: string, mimeType: string): Promise<OutfitCritique> {
  const model = 'gemini-2.5-flash';

  const prompt = `You are a professional, constructive, and encouraging fashion critic. Your goal is to provide helpful feedback on the user's outfit. Analyze the provided image and return a detailed, constructive critique as a single, valid JSON object.

The critique should include:
- A catchy, descriptive headline.
- An overall rating out of 10 (can be a decimal, e.g., 8.5).
- A list of specific things that work well.
- A list of specific, actionable suggestions for improvement.

Return *only* the JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: imageBase64,
              mimeType,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: "A catchy, descriptive headline for the outfit review." },
            overall_rating: { type: Type.NUMBER, description: "A numerical rating for the outfit out of 10." },
            what_works: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of positive aspects of the outfit."
            },
            what_to_improve: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of constructive suggestions for improvement."
            }
          },
          required: ["headline", "overall_rating", "what_works", "what_to_improve"]
        },
      },
    });

    return JSON.parse(response.text);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[rateOutfit Error]:', errorMessage);
    throw new Error(`Failed to rate outfit: ${errorMessage}`);
  }
}
