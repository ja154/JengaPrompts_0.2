import { GoogleGenAI } from "@google/genai";
import { PromptMode, OutputStructure } from '../types';

interface EnhancePromptParams {
  userPrompt: string;
  mode: PromptMode;
  options: Record<string, any>;
  outputStructure: OutputStructure;
  isCreativityMode: boolean;
}

const checkApiKey = () => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not set. Please ensure the API_KEY environment variable is configured.");
  }
};

const buildSystemPrompt = (mode: PromptMode, options: Record<string, any>): string => {
    const basePrompt = `You are a world-class AI prompt engineer, operating as an advanced 'prompt wrapper' tool. Your purpose is to transform a simple user 'Core Idea' into a highly detailed, structured, and optimized master prompt for a specific generative AI modality.
You will follow a layered pipeline architecture: 1. Parse Input, 2. Enhance with Descriptive Layers, 3. Add Medium-Specific Customization, 4. Optionally Boost for Virality, and 5. Generate the Final Output.
The final output must be a single, cohesive prompt, detailed yet concise (typically under 250 words), and directly usable. It must NOT contain any preamble, introductory text, explanations, or markdown formatting. Start the response directly with the generated prompt.`;

    switch (mode) {
        case PromptMode.Video: {
            const directives = [
                options.contentTone !== 'Default' && `- Content Tone / Mood: ${options.contentTone}`,
                options.pov !== 'Default' && `- Point of View / Cinematography: ${options.pov}`,
                options.resolution !== 'Default' && `- Quality / Resolution: ${options.resolution}`
            ].filter(Boolean).join('\n');
            const directivesSection = directives ? `**Directives to Incorporate:**\n${directives}` : '';

            return `${basePrompt}

**Modality: Video Generation (e.g., Veo, Kling AI, Sora)**
**Task:** Write a master prompt as a single, dense paragraph that functions as a detailed screenplay shot description for an 8-10 second video.
**Pipeline Instructions:**
1.  **Parse:** Deconstruct the Core Idea to establish a micro-narrative (beginning, middle, end).
2.  **Enhance:** Be visually explicit about subjects, actions, environment, and cinematography. Define atmosphere with powerful adjectives.
3.  **Medium-Specifics:** Specify camera movements, point of view, and potential audio cues (e.g., 'ocean sounds', 'suspenseful music').
4.  **Virality Boost:** Optionally incorporate engaging concepts like 'POV: A day in your dream life' or tense, fast-paced action sequences.
${directivesSection}`;
        }
        
        case PromptMode.Image: {
             const directives = [
                options.imageStyle !== 'Default' && `- Artistic Style: ${options.imageStyle}`,
                options.contentTone !== 'Default' && `- Tone & Mood: ${options.contentTone}`,
                options.lighting !== 'Default' && `- Lighting: ${options.lighting}`,
                options.framing !== 'Default' && `- Framing / Composition: ${options.framing}`,
                options.cameraAngle !== 'Default' && `- Camera Angle: ${options.cameraAngle}`,
                options.resolution !== 'Default' && `- Quality / Detail Level: ${options.resolution}`,
                options.aspectRatio !== 'Default' && `- Aspect Ratio: ${options.aspectRatio}`,
                options.additionalDetails && `- User's Additional Details: "${options.additionalDetails}"`
            ].filter(Boolean).join('\n');
            const directivesSection = directives ? `**Directives to Incorporate:**\n${directives}` : '';

            return `${basePrompt}

**Modality: Image Generation (e.g., Imagen, Midjourney, DALL-E)**
**Task:** Transform the user's Core Idea into an extremely dense, descriptive prompt. The output can be a rich paragraph or a comma-separated list of keywords and phrases.
**Pipeline Instructions:**
1.  **Parse:** Identify the core subject, action, and setting.
2.  **Enhance:** Layer in visual descriptors (colors, textures), atmosphere, and artistic style. Use professional terminology from photography and art.
3.  **Medium-Specifics:** Integrate technical parameters like lighting, framing, camera angles, and aspect ratio from the directives.
4.  **Virality Boost:** Optionally infuse surreal or trendy elements (e.g., 'bio-mechanical hybrid', 'spaghetti sculpture', pop-culture mashups).
${directivesSection}`;
        }

        case PromptMode.Text: {
            const directives = [
                options.contentTone !== 'Default' && `- Tone: ${options.contentTone}`,
                options.outputFormat !== 'Default' && `- Desired Output Format: ${options.outputFormat}`
            ].filter(Boolean).join('\n');
            const directivesSection = directives ? `**Directives to Incorporate:**\n${directives}` : '';

            return `${basePrompt}

**Modality: Text Generation (Large Language Models, e.g., Gemini, GPT-4)**
**Task:** Refine the user's prompt to be more specific, structured, and effective for an LLM.
**Pipeline Instructions:**
1.  **Parse:** Understand the user's core request and intent.
2.  **Enhance:** Add critical context, specify a persona for the AI to adopt, provide clear examples (if applicable), and set explicit constraints to prevent vague or undesirable responses.
${directivesSection}`;
        }

        case PromptMode.Audio: {
            const directives = [
                options.audioType !== 'Default' && `- Audio Type: ${options.audioType}`,
                options.audioVibe !== 'Default' && `- Vibe / Mood: ${options.audioVibe}`,
                options.contentTone !== 'Default' && `- Tone: ${options.contentTone}`
            ].filter(Boolean).join('\n');
            const directivesSection = directives ? `**Directives to Incorporate:**\n${directives}` : '';

            return `${basePrompt}

**Modality: Audio Generation (e.g., Suno, ElevenLabs)**
**Task:** Create a rich, descriptive prompt for generating audio.
**Pipeline Instructions:**
1.  **Parse:** Identify the required audio type (music, speech, or sound effect).
2.  **Enhance:** If music, describe genre, tempo, instrumentation, and vocals. If speech, describe the speaker's voice characteristics, emotion, and pacing. If a sound effect, describe the sound's source, characteristics, and environment.
${directivesSection}`;
        }

        case PromptMode.Code: {
            const directives = [
                options.codeLanguage !== 'Default' && `- Programming Language: ${options.codeLanguage}`,
                options.codeTask !== 'Default' && `- Task: ${options.codeTask}`
            ].filter(Boolean).join('\n');
            const directivesSection = directives ? `**Directives to Incorporate:**\n${directives}` : '';

            return `${basePrompt}

**Modality: Code Generation (e.g., Copilot, CodeWhisperer)**
**Task:** Convert a natural language request into a precise, unambiguous, and clear instruction for a code generation model.
**Pipeline Instructions:**
1.  **Parse:** Identify the programming language and the specific task (e.g., generate, debug, refactor, explain).
2.  **Enhance:** Make the request crystal clear. Specify function names, parameters, expected return values, and core logic. If debugging, ensure the broken code and error description are included. If refactoring, state the goals (e.g., improve performance, readability).
${directivesSection}`;
        }

        default:
            return 'You are a helpful assistant.';
    }
};

export const getEnhancedPrompt = async ({ userPrompt, mode, options, outputStructure, isCreativityMode }: EnhancePromptParams): Promise<string> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemPrompt = buildSystemPrompt(mode, options);
  const finalUserPrompt = `Here is my core idea. Please generate the master prompt based on the instructions you have been given.
  
  **Core Idea:** "${userPrompt}"`;

  try {
    const modelConfig: {
      systemInstruction: string;
      thinkingConfig?: { thinkingBudget: number };
    } = {
      systemInstruction: systemPrompt,
    };

    if (!isCreativityMode) {
      modelConfig.thinkingConfig = { thinkingBudget: 0 };
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: finalUserPrompt,
        config: modelConfig,
    });
    
    const text = response.text;
    if (!text) {
        throw new Error("The AI returned an empty response. Please try modifying your prompt.");
    }

    const enhancedPrompt = text.trim();

    if (outputStructure === OutputStructure.JSON) {
      const jsonOutput = {
        prompt: enhancedPrompt,
        parameters: {
          mode: mode,
          ...options
        }
      };
       if ('additionalDetails' in jsonOutput.parameters && jsonOutput.parameters.additionalDetails === '') {
          delete jsonOutput.parameters.additionalDetails;
      }
      return JSON.stringify(jsonOutput, null, 2);
    }

    return enhancedPrompt;
  } catch (error) {
    console.error(`Error calling Gemini API for ${mode} prompt:`, error);
    if (error instanceof Error) {
        throw new Error(`Failed to get response from AI: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the AI model.');
  }
};
