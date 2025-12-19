
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Platform, AutomationResult } from "../types";

/**
 * Enhanced Error Handling Wrapper for Gemini API calls.
 * Captures detailed context including operation names and parameters.
 */
async function handleApiCall<T>(
  call: () => Promise<T>, 
  context: { name: string; params?: any }
): Promise<T> {
  try {
    return await call();
  } catch (error: any) {
    // Structured logging for developers
    console.group(`%c AI Service Error: ${context.name} `, "background: #fee2e2; color: #991b1b; font-weight: bold;");
    console.error("Status Code:", error.status || error.code || "N/A");
    console.error("Message:", error.message);
    console.error("Parameters:", context.params);
    if (error.response) {
      console.error("Full Response Details:", error.response);
    }
    console.groupEnd();

    throw new Error(error.message || `An unexpected error occurred during ${context.name}.`);
  }
}

export const generateAutomation = async (platform: Platform, description: string): Promise<AutomationResult> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const requestConfig = {
      model: 'gemini-3-pro-preview',
      contents: `Design a technical workflow for ${platform}. Requirements: ${description}`,
      config: {
        systemInstruction: `You are a Senior Automation Architect. Create a logical, production-ready workflow JSON. 
        Include a sequence of steps, an architecture explanation, and code implementation details.`,
        responseMimeType: "application/json",
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
                    description: 'The category of the automation step: trigger, action, or logic'
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

    const response = await ai.models.generateContent(requestConfig);

    // Extract generated text using the .text property
    const text = response.text;
    
    if (!text) {
      console.error("[generateAutomation] Empty response body received.");
      throw new Error("The AI model returned an empty response.");
    }

    try {
      return JSON.parse(text) as AutomationResult;
    } catch (parseError) {
      console.group("%c JSON Parse Error in generateAutomation ", "background: #fef3c7; color: #92400e; font-weight: bold;");
      console.error("Raw Response Text:", text);
      console.error("Original Request:", { platform, description });
      console.groupEnd();
      throw new Error("Failed to parse the automation blueprint. The AI returned an invalid format.");
    }
  }, { name: "generateAutomation", params: { platform, description } });
};

export const chatWithAssistant = async (message: string): Promise<string> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are an AI automation expert. Help users build better workflows with Zapier, n8n, and custom scripts."
      }
    });
    const result = await chat.sendMessage({ message });
    return result.text || "No response received.";
  }, { name: "chatWithAssistant", params: { message } });
};

export const analyzeImage = async (base64Data: string, prompt: string): Promise<string> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: prompt }
        ]
      }
    });
    return response.text || "I couldn't analyze the image.";
  }, { name: "analyzeImage", params: { prompt, hasImage: !!base64Data } });
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string | undefined> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }, { name: "generateSpeech", params: { textLength: text.length, voiceName } });
};

export const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const processAudioBuffer = async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
};
