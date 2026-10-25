import { GoogleGenAI } from '@google/genai';

const STORAGE_KEY_API_KEY = 'wigo_gemini_api_key';
const STORAGE_KEY_MODEL = 'wigo_gemini_model';
let memoryApiKey = '';

/**
 * Default Gemini model used for OCR and multimodal vision tasks.
 * 'gemini-2.5-flash' is ideal for fast, cost-effective multimodal tasks.
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite';
let memoryModel = DEFAULT_GEMINI_MODEL;

/**
 * Retrieves the currently active Gemini model name.
 * Can be customized via EXPO_PUBLIC_GEMINI_MODEL, localStorage, or setGeminiModel.
 */
export function getGeminiModel(): string {
  const envModel = process.env.EXPO_PUBLIC_GEMINI_MODEL;
  if (envModel && envModel.trim()) {
    return envModel.trim();
  }
  if (memoryModel) {
    return memoryModel;
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY_MODEL);
      if (stored) {
        memoryModel = stored;
        return stored;
      }
    }
  } catch {}
  return DEFAULT_GEMINI_MODEL;
}

/**
 * Changes the active Gemini model (e.g. 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash').
 */
export function setGeminiModel(modelName: string): void {
  const trimmed = modelName.trim();
  if (trimmed) {
    memoryModel = trimmed;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY_MODEL, trimmed);
      }
    } catch {}
  }
}

/**
 * Retrieves the stored or environment Gemini API Key.
 */
export async function getGeminiApiKey(): Promise<string> {
  const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }
  if (memoryApiKey) {
    return memoryApiKey;
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY_API_KEY);
      if (stored) {
        memoryApiKey = stored;
        return stored;
      }
    }
  } catch {}
  return '';
}

/**
 * Saves a custom Gemini API Key entered by the user.
 */
export async function saveGeminiApiKey(apiKey: string): Promise<void> {
  const trimmed = apiKey.trim();
  memoryApiKey = trimmed;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY_API_KEY, trimmed);
    }
  } catch {}
}

/**
 * Helper function to convert base64 image data to the Generative Part object format.
 */
export function base64ToGenerativePart(base64Image: string, fallbackMimeType = 'image/jpeg') {
  // Strip potential data URL prefix or extract mimeType if present
  const match = base64Image.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      inlineData: {
        data: match[2],
        mimeType: match[1] || fallbackMimeType,
      },
    };
  }

  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
  return {
    inlineData: {
      data: cleanBase64,
      mimeType: fallbackMimeType,
    },
  };
}

export interface ParsedReceiptData {
  itemName?: string;
  category?: string;
  purchaseDate?: string;
  supplier?: string;
  purchaseCostTotal?: number;
  quantity?: number;
  unitCost?: number;
}

/**
 * Sends a base64 encoded receipt image to the Gemini Vision API using GoogleGenAI SDK
 * and extracts structured receipt data. Easily switch models via the `model` parameter.
 */
export async function scanReceiptWithGemini(
  base64Image: string,
  apiKeyOverride?: string,
  modelOverride?: string
): Promise<ParsedReceiptData> {
  const apiKey = (apiKeyOverride || (await getGeminiApiKey())).trim();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  // 1. Initialize GoogleGenAI client with the resolved API key
  const ai = new GoogleGenAI({ apiKey });

  const activeModel = modelOverride || getGeminiModel();
  const imagePart = base64ToGenerativePart(base64Image, 'image/jpeg');

  const prompt = `You are an expert OCR parser for equipment purchase receipts and store invoices in Indonesia and internationally.
Extract the equipment intake details from this receipt image.
Output ONLY a valid JSON object matching this schema:
{
  "itemName": "string (name and model of the primary equipment or tool bought)",
  "category": "string (one of: Power Tools, Heavy Machinery, Audio / Visual, Hand Tools, Generators & Power, Survey & Measurement, Safety & PPE)",
  "purchaseDate": "string (formatted as DD Mon YYYY e.g. 18 Oct 2026)",
  "supplier": "string (store or merchant name, e.g. Mitra10, Ace Hardware, etc.)",
  "purchaseCostTotal": number (total amount paid in integer digits without symbols or currency code),
  "quantity": number (integer count of units, default 1),
  "unitCost": number (unit price paid in integer digits without symbols)
}
Return raw JSON only, without any markdown formatting or code blocks.`;

  const requestConfig: any = {
    temperature: 0.1,
    responseMimeType: 'application/json',
    httpOptions: {
      timeout: 45000,
    },
  };

  // Gemini 3.8 / 3.x models enable extensive chain-of-thought thinking by default,
  // which takes 25-40+ seconds. Setting thinkingLevel to 'LOW' ensures fast response times.
  if (activeModel.includes('3.8') || activeModel.includes('3.7')) {
    requestConfig.thinkingConfig = {
      thinkingLevel: 'LOW',
    };
  }

  // 2. Call the model using @google/genai SDK
  const response = await ai.models.generateContent({
    model: activeModel,
    contents: [imagePart, prompt],
    config: requestConfig,
  });

  const responseText = response.text;

  if (!responseText) {
    throw new Error('Gemini Vision did not return any OCR content from the receipt image.');
  }

  try {
    // Strip possible markdown backticks if returned despite json mimeType
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      itemName: parsed.itemName || undefined,
      category: parsed.category || undefined,
      purchaseDate: parsed.purchaseDate || undefined,
      supplier: parsed.supplier || undefined,
      purchaseCostTotal:
        typeof parsed.purchaseCostTotal === 'number'
          ? parsed.purchaseCostTotal
          : parseInt(String(parsed.purchaseCostTotal || '').replace(/\D/g, ''), 10) || undefined,
      quantity:
        typeof parsed.quantity === 'number'
          ? Math.max(1, parsed.quantity)
          : parseInt(String(parsed.quantity || '1').replace(/\D/g, ''), 10) || 1,
      unitCost:
        typeof parsed.unitCost === 'number'
          ? parsed.unitCost
          : parseInt(String(parsed.unitCost || '').replace(/\D/g, ''), 10) || undefined,
    };
  } catch {
    console.warn('Failed to parse Gemini JSON output:', responseText);
    throw new Error('Invalid JSON format returned from Gemini Vision.');
  }
}

/**
 * General OCR runner matching GoogleGenAI pattern to extract raw text with customizable prompt and model.
 */
export async function runOCR(
  base64Image: string,
  prompt = 'Extract all text from this image accurately. Keep the original layout and line breaks where possible.',
  apiKeyOverride?: string,
  modelOverride?: string
): Promise<string> {
  const apiKey = (apiKeyOverride || (await getGeminiApiKey())).trim();
  const ai = new GoogleGenAI(apiKey ? { apiKey } : {});
  const activeModel = modelOverride || getGeminiModel();
  const imagePart = base64ToGenerativePart(base64Image, 'image/jpeg');

  const requestConfig: any = {
    httpOptions: {
      timeout: 45000,
    },
  };

  if (activeModel.includes('3.8') || activeModel.includes('3.7')) {
    requestConfig.thinkingConfig = {
      thinkingLevel: 'LOW',
    };
  }

  const response = await ai.models.generateContent({
    model: activeModel,
    contents: [imagePart, prompt],
    config: requestConfig,
  });

  return response.text || '';
}
