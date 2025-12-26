
import { GoogleGenAI, Type, Modality, GenerateContentParameters, LiveServerMessage } from "@google/genai";
import { Platform, AutomationResult, SimulationResponse } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Configuration Error: Mission-critical key [process.env.API_KEY] is undefined.");
  }
  return new GoogleGenAI({ apiKey });
};

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
      await new Promise(res => setTimeout(res, delay));
      return callGemini(operation, retries - 1, delay * 2);
    }
    const userMessage = status === 429 
      ? "Service is temporarily overloaded. Please wait a moment." 
      : (error.message || "An unexpected error occurred in the AI service.");
    throw new Error(userMessage);
  }
}

export const generateAutomation = async (platform: Platform, description: string): Promise<AutomationResult> => {
  return callGemini(async () => {
    const ai = getAiClient();
    const params: GenerateContentParameters = {
      model: 'gemini-3-pro-preview',
      contents: `Build a production-grade automation workflow for ${platform} based on these requirements: ${description}. Use Google Search to verify the latest API endpoints.`,
      config: {
        systemInstruction: "You are an Elite Solutions Architect. Output ONLY a valid JSON object matching the provided schema.",
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 8000 },
        tools: [{ googleSearch: {} }],
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
                  type: { type: Type.STRING }
                },
                required: ["id", "title", "description", "type"]
              }
            }
          },
          required: ["platform", "explanation", "steps"]
        }
      }
    };

    const response = await ai.models.generateContent(params);
    const text = response.text;
    if (!text) throw new Error("The AI returned an empty response.");
    
    const parsed = JSON.parse(text.trim()) as AutomationResult;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Reference Source",
        uri: chunk.web?.uri || ""
      })) || [];

    return { ...parsed, sources };
  });
};

export const simulateAutomation = async (automation: AutomationResult, inputData: string): Promise<SimulationResponse> => {
  return callGemini(async () => {
    const ai = getAiClient();
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Simulate the following ${automation.platform} automation:
      Steps: ${JSON.stringify(automation.steps)}
      Input Data: ${inputData}
      
      Determine how each step processes this data. Be realistic about API behaviors and logical branches.`,
      config: {
        systemInstruction: "You are a Logic Simulation Engine. Analyze the input data against the automation steps and provide a step-by-step trace of execution. Return ONLY JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallStatus: { type: Type.STRING, enum: ['success', 'failure'] },
            summary: { type: Type.STRING },
            stepResults: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepId: { type: Type.INTEGER },
                  status: { type: Type.STRING, enum: ['success', 'failure', 'skipped'] },
                  output: { type: Type.STRING },
                  reasoning: { type: Type.STRING }
                },
                required: ["stepId", "status", "output", "reasoning"]
              }
            }
          },
          required: ["overallStatus", "summary", "stepResults"]
        }
      }
    });

    const text = result.text;
    if (!text) throw new Error("Simulation failed to generate output.");
    return JSON.parse(text.trim()) as SimulationResponse;
  });
};

export const chatWithAssistant = async (message: string): Promise<string> => {
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
  return callGemini(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
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

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
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
}

export const connectToLiveArchitect = (callbacks: {
  onopen: () => void;
  onmessage: (message: LiveServerMessage) => void;
  onerror: (e: ErrorEvent) => void;
  onclose: (e: CloseEvent) => void;
}) => {
  const ai = getAiClient();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: 'You are an Elite Automation Architect. Help the user design complex API automations. Use a professional, tech-savvy voice.',
    },
  });
};
