import { GoogleGenAI } from "@google/genai";
import { PromptMode, OutputStructure, AspectRatio, CameraResolution, VideoStyle } from '../types';

interface EnhancePromptParams {
  userPrompt: string;
  mode: PromptMode;
  options: Record<string, any>;
  outputStructure: OutputStructure;
  isCreativityMode: boolean;
}

// ===================================================================================
//  JSON Output Builders
// ===================================================================================

const getResolution = (resolution: CameraResolution, aspectRatio: AspectRatio): { width: number; height: number } => {
    let longEdge = 1024; // Default to standard
    switch (resolution) {
        case CameraResolution.Standard: longEdge = 1024; break;
        case CameraResolution.HD: longEdge = 1920; break;
        case CameraResolution.FourK: longEdge = 3840; break;
        case CameraResolution.EightK: longEdge = 7680; break;
        case CameraResolution.Hyperdetailed: longEdge = 4096; break; // Treat as 4K+
        case CameraResolution.Default: longEdge = 1024; break;
    }

    if (aspectRatio === AspectRatio.Default || aspectRatio === AspectRatio.Square) {
        return { width: longEdge, height: longEdge };
    }

    const ratioParts = aspectRatio.split(':');
    if (ratioParts.length !== 2) return { width: longEdge, height: longEdge }; // fallback

    const [arW, arH] = ratioParts.map(Number);
    
    if (isNaN(arW) || isNaN(arH) || arW === 0 || arH === 0) {
        return { width: longEdge, height: longEdge }; // fallback for invalid ratio string
    }

    if (arW >= arH) { // Landscape or Square
        return {
            width: longEdge,
            height: Math.round(longEdge * arH / arW)
        };
    } else { // Portrait
        return {
            width: Math.round(longEdge * arW / arH),
            height: longEdge
        };
    }
};

const buildImageJson = (enhancedPrompt: string, options: Record<string, any>) => {
    const resolution = getResolution(options.resolution, options.aspectRatio);
    const styleReferences = [options.imageStyle, options.contentTone, options.lighting, options.framing].filter(s => s && s !== 'Default');
    
    return {
        model: "sdxl-1.0",
        prompt: enhancedPrompt,
        negative_prompt: "blurry, low resolution, watermark, signature, text overlay, extra limbs, distorted hands, deformed, oversaturated, jpeg artifacts, bad anatomy",
        parameters: {
            mode: PromptMode.Image,
            sampler: "DPM++ 2M Karras",
            steps: 40,
            guidance_scale: 9.0,
            seed: Math.floor(Math.random() * 1000000000),
            resolution: resolution,
            aspectRatio: options.aspectRatio !== AspectRatio.Default ? options.aspectRatio : "1:1",
            camera: {
                focal_length_mm: 35,
                aperture: "f/2.8",
                camera_angle: options.cameraAngle,
                sensor: "full-frame"
            },
            composition: {
                framing: options.framing,
                lighting: options.lighting,
                style: options.imageStyle
            },
            postprocessing: {
                upscaler: "Real-ESRGAN",
                denoise_strength: 0.25
            },
            style_references: styleReferences.length > 0 ? styleReferences : ["photorealistic"],
        }
    };
};

const buildVideoJson = (enhancedPrompt: string, options: Record<string, any>) => {
    const resolution = getResolution(options.resolution, AspectRatio.Landscape); // Video is mostly landscape

    return {
        model: "runway-gen-2",
        prompt: enhancedPrompt,
        negative_prompt: "blurry frames, jitter, watermark, extra limbs, text overlay, mutated anatomy, flickering",
        parameters: {
            mode: PromptMode.Video,
            duration_seconds: 8,
            fps: 24,
            resolution: resolution,
            aspectRatio: AspectRatio.Landscape,
            camera: {
                point_of_view: options.pov
            },
            composition: {
                mood: options.contentTone,
                ...(options.videoStyle && options.videoStyle !== VideoStyle.Default && { style: options.videoStyle })
            },
            camera_path: [
                { time: 0.0, action: "start", note: `wide shot, ${options.pov}` },
                { time: 4.0, action: "dolly_in", note: "slow zoom" },
                { time: 8.0, action: "end", note: "close up reveal" }
            ],
            temporal_consistency: {
                fix_seed_per_frame: true,
                optical_flow_interpolation: "enabled",
                flow_denoise: 0.15
            },
            motion_blur: "auto",
            sampler: "k_dpm_2a",
            guidance_scale: 8.5,
            seed: Math.floor(Math.random() * 1000000000),
            postprocessing: {
                stabilize_temporal_flicker: true,
                color_grade: "cinematic",
                audio: { sfx: "appropriate sound effects based on prompt", music: "ambient score based on prompt mood" }
            }
        }
    };
};


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
                options.videoStyle !== 'Default' && `- Video Style: ${options.videoStyle}`,
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
      let jsonOutput;
      if (mode === PromptMode.Image) {
        jsonOutput = buildImageJson(enhancedPrompt, options);
      } else if (mode === PromptMode.Video) {
        jsonOutput = buildVideoJson(enhancedPrompt, options);
      } else {
        // Fallback for Text, Audio, Code which don't have a detailed JSON structure requested yet
        jsonOutput = {
          prompt: enhancedPrompt,
          parameters: {
            mode: mode,
            ...options
          }
        };
        if ('additionalDetails' in jsonOutput.parameters && jsonOutput.parameters.additionalDetails === '') {
            delete jsonOutput.parameters.additionalDetails;
        }
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