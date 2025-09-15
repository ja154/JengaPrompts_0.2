import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getEnhancedPrompt } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';

import { TONE_OPTIONS, POV_OPTIONS, ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS, LIGHTING_OPTIONS, FRAMING_OPTIONS, CAMERA_ANGLE_OPTIONS, CAMERA_RESOLUTION_OPTIONS, TEXT_FORMAT_OPTIONS, AUDIO_TYPE_OPTIONS, AUDIO_VIBE_OPTIONS, CODE_LANGUAGE_OPTIONS, CODE_TASK_OPTIONS, OUTPUT_STRUCTURE_OPTIONS, VIDEO_STYLE_OPTIONS, CAMERA_MOVEMENT_OPTIONS, VIDEO_DURATION_OPTIONS } from '../constants';
import { ContentTone, PointOfView, PromptMode, AspectRatio, ImageStyle, Lighting, Framing, CameraAngle, CameraResolution, AudioType, AudioVibe, CodeLanguage, CodeTask, OutputStructure, LibraryTemplate, VideoStyle, CameraMovement } from '../types';
import { libraryTemplates } from '../library';

import Section from '../components/layout/Section';
import SelectControl from '../components/common/SelectControl';
import CreativityToggle from '../components/common/CreativityToggle';
import Footer from '../components/layout/Footer';

const initialOptions = {
    contentTone: ContentTone.Default,
    pov: PointOfView.Default,
    videoResolution: CameraResolution.Default,
    videoStyle: VideoStyle.Default,
    cameraMovement: CameraMovement.Default,
    videoDuration: '10s',
    aspectRatio: AspectRatio.Default,
    imageStyle: ImageStyle.Default,
    lighting: Lighting.Default,
    framing: Framing.Default,
    cameraAngle: CameraAngle.Default,
    imageResolution: CameraResolution.Default,
    additionalDetails: '',
    outputFormat: 'Default',
    audioType: AudioType.Default,
    audioVibe: AudioVibe.Default,
    codeLanguage: CodeLanguage.Default,
    codeTask: CodeTask.Default,
};

const MainPage = ({ openLibrary }) => {
    const { addPromptToHistory, savePrompt, savedPrompts } = useAuth();
    
    // Core state
    const [promptMode, setPromptMode] = useState<PromptMode>(() => (localStorage.getItem('defaultMode') as PromptMode) || PromptMode.Image);
    const [userPrompt, setUserPrompt] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');
    
    // UI State
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'exists' | 'error'>('idle');
    const [outputStructure, setOutputStructure] = useState<OutputStructure>(OutputStructure.Simple);
    const [isCreativityMode, setIsCreativityMode] = useState<boolean>(() => localStorage.getItem('defaultCreativity') !== 'false');

    const inputSectionRef = useRef<HTMLElement>(null);

    // Consolidated prompt options state
    const [options, setOptions] = useState(initialOptions);
    
    const handleUseLibraryTemplate = useCallback((template: LibraryTemplate) => {
        let mode: PromptMode;
        // Set the mode based on the template's medium, with a robust check for all possible types.
        switch (template.medium) {
            case PromptMode.Image:
                mode = PromptMode.Image;
                break;
            case PromptMode.Video:
                mode = PromptMode.Video;
                break;
            case PromptMode.Audio:
                mode = PromptMode.Audio;
                break;
            case PromptMode.Code:
                mode = PromptMode.Code;
                break;
            case PromptMode.Text:
            default:
                mode = PromptMode.Text;
                break;
        }

        setPromptMode(mode);
        setUserPrompt(template.prompt);
        setOptions(initialOptions); // Reset all controls to default for a clean slate
        inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    useEffect(() => {
        const listener = (e: Event) => {
            const customEvent = e as CustomEvent<LibraryTemplate>;
            handleUseLibraryTemplate(customEvent.detail);
        };
        window.addEventListener('useLibraryTemplate', listener);
        return () => window.removeEventListener('useLibraryTemplate', listener);
    }, [handleUseLibraryTemplate]);

    const handleGenerateClick = useCallback(async () => {
        if (!userPrompt.trim()) return;
        setIsLoading(true);
        setError('');
        setGeneratedPrompt('');
        let loadingMsg = 'Our AI is enhancing your prompt...';

        setLoadingMessage(loadingMsg);
        try {
            const result = await getEnhancedPrompt({ userPrompt, mode: promptMode, options, outputStructure, isCreativityMode });
            setGeneratedPrompt(result);
            addPromptToHistory(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [userPrompt, promptMode, options, outputStructure, isCreativityMode, addPromptToHistory]);
    
    const handleCopyToClipboard = useCallback(() => {
        if (!generatedPrompt || copyStatus !== 'idle') return;
        navigator.clipboard.writeText(generatedPrompt).then(() => {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        }).catch(() => {
            setCopyStatus('error');
            setTimeout(() => setCopyStatus('idle'), 2000);
        });
    }, [generatedPrompt, copyStatus]);

    const handleSavePrompt = useCallback(() => {
        if (!generatedPrompt || saveStatus !== 'idle') return;

        if (savedPrompts.includes(generatedPrompt)) {
            setSaveStatus('exists');
            setTimeout(() => setSaveStatus('idle'), 2000);
            return;
        }

        try {
            savePrompt(generatedPrompt);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (e) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    }, [generatedPrompt, savedPrompts, savePrompt, saveStatus]);

    const handleOptionChange = (field: keyof typeof initialOptions, value: any) => {
        setOptions(prev => ({ ...prev, [field]: value }));
    };

    const renderModeOptions = () => {
        switch (promptMode) {
            case PromptMode.Text: return (<div className="space-y-4"><SelectControl id="contentTone" label="Content Tone" value={options.contentTone} onChange={(e) => handleOptionChange('contentTone', e.target.value)} options={TONE_OPTIONS} /><SelectControl id="outputFormat" label="Desired Text Format" value={options.outputFormat} onChange={(e) => handleOptionChange('outputFormat', e.target.value)} options={TEXT_FORMAT_OPTIONS} /></div>);
            case PromptMode.Image: return (<div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><SelectControl id="contentTone" label="Content Tone / Mood" value={options.contentTone} onChange={(e) => handleOptionChange('contentTone', e.target.value)} options={TONE_OPTIONS} /><SelectControl id="imageStyle" label="Style" value={options.imageStyle} onChange={(e) => handleOptionChange('imageStyle', e.target.value)} options={IMAGE_STYLE_OPTIONS} /><SelectControl id="aspectRatio" label="Aspect Ratio" value={options.aspectRatio} onChange={(e) => handleOptionChange('aspectRatio', e.target.value)} options={ASPECT_RATIO_OPTIONS} /><SelectControl id="lighting" label="Lighting" value={options.lighting} onChange={(e) => handleOptionChange('lighting', e.target.value)} options={LIGHTING_OPTIONS} /><SelectControl id="framing" label="Framing" value={options.framing} onChange={(e) => handleOptionChange('framing', e.target.value)} options={FRAMING_OPTIONS} /><SelectControl id="cameraAngle" label="Camera Angle" value={options.cameraAngle} onChange={(e) => handleOptionChange('cameraAngle', e.target.value)} options={CAMERA_ANGLE_OPTIONS} /><SelectControl id="imageResolution" label="Detail Level" value={options.imageResolution} onChange={(e) => handleOptionChange('imageResolution', e.target.value)} options={CAMERA_RESOLUTION_OPTIONS} /></div><div><label htmlFor="additionalDetails" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Additional Details (Optional)</label><input id="additionalDetails" type="text" className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="E.g. turquoise rings, stark white background..." value={options.additionalDetails} onChange={(e) => handleOptionChange('additionalDetails', e.target.value)} /></div></div>);
            case PromptMode.Video: return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><SelectControl id="contentTone" label="Content Tone" value={options.contentTone} onChange={(e) => handleOptionChange('contentTone', e.target.value)} options={TONE_OPTIONS} /><SelectControl id="videoStyle" label="Video Style" value={options.videoStyle} onChange={(e) => handleOptionChange('videoStyle', e.target.value)} options={VIDEO_STYLE_OPTIONS} /><SelectControl id="pov" label="Point of View" value={options.pov} onChange={(e) => handleOptionChange('pov', e.target.value)} options={POV_OPTIONS} /><SelectControl id="videoResolution" label="Detail Level" value={options.videoResolution} onChange={(e) => handleOptionChange('videoResolution', e.target.value)} options={CAMERA_RESOLUTION_OPTIONS} /><SelectControl id="cameraMovement" label="Camera Movement" value={options.cameraMovement} onChange={(e) => handleOptionChange('cameraMovement', e.target.value)} options={CAMERA_MOVEMENT_OPTIONS} /><SelectControl id="videoDuration" label="Duration" value={options.videoDuration} onChange={(e) => handleOptionChange('videoDuration', e.target.value)} options={VIDEO_DURATION_OPTIONS} /></div>);
            case PromptMode.Audio: return (<div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><SelectControl id="contentTone" label="Content Tone" value={options.contentTone} onChange={(e) => handleOptionChange('contentTone', e.target.value)} options={TONE_OPTIONS} /><SelectControl id="audioType" label="Audio Type" value={options.audioType} onChange={(e) => handleOptionChange('audioType', e.target.value)} options={AUDIO_TYPE_OPTIONS} /><SelectControl id="audioVibe" label="Vibe / Mood" value={options.audioVibe} onChange={(e) => handleOptionChange('audioVibe', e.target.value)} options={AUDIO_VIBE_OPTIONS} /></div>);
            case PromptMode.Code: return (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><SelectControl id="codeLanguage" label="Language" value={options.codeLanguage} onChange={(e) => handleOptionChange('codeLanguage', e.target.value)} options={CODE_LANGUAGE_OPTIONS} /><SelectControl id="codeTask" label="Task" value={options.codeTask} onChange={(e) => handleOptionChange('codeTask', e.target.value)} options={CODE_TASK_OPTIONS} /></div>);
            default: return null;
        }
    }
    
    const modeOptions = [{ mode: PromptMode.Text, icon: 'fa-file-alt' },{ mode: PromptMode.Image, icon: 'fa-image' },{ mode: PromptMode.Video, icon: 'fa-video' },{ mode: PromptMode.Audio, icon: 'fa-music' },{ mode: PromptMode.Code, icon: 'fa-code' }];
    
    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <Section title="Media Type" icon="fa-cubes" className="!p-4 sm:!p-6">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 p-1 bg-slate-200 dark:bg-gray-800 rounded-xl">
                    {modeOptions.map(({ mode, icon }) => (<button key={mode} onClick={() => setPromptMode(mode)} className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${promptMode === mode ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-gray-700'}`} aria-pressed={promptMode === mode}><i className={`fas ${icon} text-base`}></i><span>{mode}</span></button>))}
                </div>
            </Section>
            
            <Section ref={inputSectionRef} title="Input Interface" icon="fa-keyboard">
                <label htmlFor="userPrompt" className="sr-only">Your Core Idea</label>
                <textarea id="userPrompt" className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32" placeholder="E.g., An astronaut riding a horse, a function to calculate fibonacci, a sad piano melody..." value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)}></textarea>
            </Section>

            <Section title="Jenga Your Prompt" icon="fa-layer-group">
                 <div className="p-4 bg-slate-200/50 dark:bg-gray-900/40 rounded-xl">{renderModeOptions()}</div>
            </Section>
            
            <Section title="Generate" icon="fa-magic-wand-sparkles">
                {error && <div className="bg-red-100 dark:bg-red-800/50 border border-red-400 dark:border-red-700 p-3 rounded-lg text-red-700 dark:text-red-200 mb-4" role="alert"><p className="font-semibold text-sm">An error occurred:</p><p className="text-xs">{error}</p></div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <SelectControl id="outputStructure" label="Advanced: Output Type" value={outputStructure} onChange={(e) => setOutputStructure(e.target.value as OutputStructure)} options={OUTPUT_STRUCTURE_OPTIONS} />
                    <CreativityToggle isEnabled={isCreativityMode} onToggle={() => setIsCreativityMode(prev => !prev)} />
                </div>
                <button onClick={handleGenerateClick} disabled={isLoading || !userPrompt.trim()} className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] glow flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed">
                    {isLoading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Working...</> : <><i className="fas fa-magic mr-2"></i> Generate Prompt</>}
                </button>
            </Section>

            <Section title="Your JengaPrompt" icon="fa-file-invoice">
                <div className="flex items-center justify-end mb-2 gap-2">
                    <button
                        onClick={handleSavePrompt}
                        disabled={!generatedPrompt || isLoading || saveStatus !== 'idle'}
                        className="text-xs bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 px-3 py-1.5 rounded-full transition-all disabled:opacity-60 flex items-center gap-1.5"
                        aria-label="Save prompt"
                    >
                        {saveStatus === 'saved' ? <><i className="fas fa-check text-green-500"></i>Saved!</> :
                         saveStatus === 'exists' ? <><i className="fas fa-info-circle text-blue-500"></i>Exists</> :
                         saveStatus === 'error' ? <><i className="fas fa-times text-red-500"></i>Failed</> :
                         <><i className="far fa-bookmark"></i>Save</>}
                    </button>
                    <button onClick={handleCopyToClipboard} disabled={!generatedPrompt || isLoading || copyStatus !== 'idle'} className="text-xs bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 px-3 py-1.5 rounded-full transition-all disabled:opacity-60 flex items-center gap-1.5" aria-label="Copy result">
                        {copyStatus === 'copied' ? <><i className="fas fa-check text-green-500"></i>Copied!</> : copyStatus === 'error' ? <><i className="fas fa-times text-red-500"></i>Failed</> : <><i className="fas fa-copy"></i>Copy</>}
                    </button>
                </div>
                <div className="relative bg-slate-100 dark:bg-gray-800 rounded-lg min-h-[16rem] overflow-hidden">
                    {isLoading && <div className="absolute inset-0 flex flex-col justify-center items-center bg-slate-100/80 dark:bg-gray-800/80 z-10 text-center text-slate-500 dark:text-gray-400"><i className="fas fa-brain fa-beat-fade text-4xl text-purple-500 mb-4" style={{'--fa-animation-duration': '2s'} as React.CSSProperties}></i><p>{loadingMessage}</p></div>}
                    {!isLoading && !generatedPrompt && <div className="text-slate-500 dark:text-gray-400 italic h-full flex items-center justify-center p-4 text-center"><p>Your expertly crafted prompt will appear here...</p></div>}
                    {generatedPrompt && (
                        <>
                            <label htmlFor="generatedPrompt" className="sr-only">Generated Prompt</label>
                            <textarea id="generatedPrompt" value={generatedPrompt} onChange={(e) => setGeneratedPrompt(e.target.value)} className="absolute inset-0 w-full h-full bg-transparent border-0 ring-0 focus:ring-1 focus:ring-purple-500 focus:outline-none rounded-lg p-4 text-slate-800 dark:text-gray-300 whitespace-pre-wrap font-mono text-sm resize-none" />
                        </>
                    )}
                </div>
            </Section>

            <Section title="Prompt Library" icon="fa-book-open">
                <p className="text-slate-600 dark:text-gray-400 mb-4 text-sm">
                    Explore a curated collection of {libraryTemplates.length} production-ready prompts for inspiration. Click to use a prompt as your starting point.
                </p>
                <button onClick={openLibrary} className="w-full bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 text-slate-800 dark:text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center library-button-glow">
                    <i className="fas fa-layer-group mr-2"></i> Explore Prompt Library
                </button>
            </Section>

            <Section title="AI-Generated Content" icon="fa-image">
                <div className="h-48 flex items-center justify-center bg-slate-200/50 dark:bg-gray-900/40 rounded-xl text-slate-500 dark:text-gray-400 italic">
                    AI content display area coming soon...
                </div>
            </Section>
            
            <Footer />
        </div>
    );
};

export default MainPage;