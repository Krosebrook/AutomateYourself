
import { GoogleGenAI, Type, Modality, GenerateContentParameters } from "@google/genai";
import { Platform, AutomationResult } from "../types";

/**
 * Utility to create a fresh AI instance.
 * Guidelines: "Create a new GoogleGenAI instance right before making an API call".
 * Edge Case: Throws early if API key is missing to prevent obscure SDK errors.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Configuration Error: Mission-critical key [process.env.API_KEY] is undefined.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Robust wrapper for AI calls with exponential backoff for transient errors.
 * Edge Cases: Handles 429 (Rate Limit) and 5xx (Server) errors with retries.
 */
async function callGemini<T>(
  operation: () => Promise<T>,
  retries = 2,
  delay = 1000
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const status = error.status || error.code;
    const isRetryable = status === 429 || (status >= 500 && status < 600);
    
    if (isRetryable && retries > 0) {
      console.warn(`Transient error (${status}). Retrying in ${delay}ms... Attempts left: ${retries}`);
      await new Promise(res => setTimeout(res, delay));
      return callGemini(operation, retries - 1, delay * 2);
    }
    
    // Non-retryable or exhausted retries
    const errorMessage = error.message || "An unexpected error occurred in the AI service.";
    throw new Error(errorMessage);
  }
}

export const generateAutomation = async (platform: Platform, description: string): Promise<AutomationResult> => {
  // Edge Case: Prevent massive payloads that might break context or cost excessive tokens
  if (description.length > 4000) {
    throw new Error("Input payload exceeds the architectural limit of 4,000 characters.");
  }

  return callGemini(async () => {
    const ai = getAiClient();
    
    const params: GenerateContentParameters = {
      model: 'gemini-3-pro-preview',
      contents: `Build a production-grade automation workflow for ${platform}. Requirements: ${description}`,
      config: {
        systemInstruction: "You are an Elite Solutions Architect. Output ONLY a valid JSON object matching the provided schema. Do not include markdown blocks like ```json.",
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4000 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING },
            explanation: { type: Type.STRING },
            codeSnippet: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { 
                    type: Type.STRING,
                    description: 'One of: trigger, action, logic'
                  }
                },
                required: ["id", "title", "description", "type"]
              }
            }
          },
          required: ["platform", "explanation", "steps"]
        }
      }
    };

    const result = await ai.models.generateContent(params);
    const text = result.text;
    if (!text) throw new Error("The AI returned an empty response.");
    
    try {
      // Edge Case: Handle potential trailing/leading whitespace or markdown artifacts
      const sanitized = text.trim().replace(/^```json/, '').replace(/```$/, '');
      return JSON.parse(sanitized) as AutomationResult;
    } catch (e) {
      console.error("JSON Parse Error on Response:", text);
      throw new Error("Failed to parse the architect's blueprint. The generated JSON was malformed.");
    }
  });
};

export const chatWithAssistant = async (message: string, history: any[] = []): Promise<string> => {
  return callGemini(async () => {
    const ai = getAiClient();
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: "You are an AI automation expert. Provide concise, actionable advice for Zapier, n8n, and custom scripts."
      }
    });
    return result.text || "I'm sorry, I couldn't generate a response.";
  });
};

export const analyzeImage = async (base64Data: string, prompt: string, mimeType: string = 'image/jpeg'): Promise<string> => {
  return callGemini(async () => {
    const ai = getAiClient();
    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: prompt }
        ]
      }
    });
    return result.text || "I couldn't analyze the image.";
  });
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string | undefined> => {
  // Edge Case: Gemini TTS has limits on input length.
  const truncatedText = text.slice(0, 1000); 

  return callGemini(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: truncatedText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  });
};

export const decodeAudio = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const createAudioBuffer = async (
  data: Uint8Array, 
  ctx: AudioContext, 
  sampleRate = 24000, 
  numChannels = 1
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};
