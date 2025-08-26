import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getEnhancedPrompt } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';

import { TONE_OPTIONS, POV_OPTIONS, ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS, LIGHTING_OPTIONS, FRAMING_OPTIONS, CAMERA_ANGLE_OPTIONS, CAMERA_RESOLUTION_OPTIONS, TEXT_FORMAT_OPTIONS, AUDIO_TYPE_OPTIONS, AUDIO_VIBE_OPTIONS, CODE_LANGUAGE_OPTIONS, CODE_TASK_OPTIONS, OUTPUT_STRUCTURE_OPTIONS, VIDEO_STYLE_OPTIONS } from '../constants';
import { ContentTone, PointOfView, PromptMode, AspectRatio, ImageStyle, Lighting, Framing, CameraAngle, CameraResolution, AudioType, AudioVibe, CodeLanguage, CodeTask, OutputStructure, LibraryTemplate, VideoStyle } from '../types';
import { libraryTemplates } from '../library';

import Section from '../components/layout/Section';
import SelectControl from '../components/common/SelectControl';
import CreativityToggle from '../components/common/CreativityToggle';
import Footer from '../components/layout/Footer';

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

    // Prompt Options State
    const [contentTone, setContentTone] = useState<ContentTone>(ContentTone.Default);
    const [pov, setPov] = useState<PointOfView>(PointOfView.Default);
    const [videoResolution, setVideoResolution] = useState<CameraResolution>(CameraResolution.Default);
    const [videoStyle, setVideoStyle] = useState<VideoStyle>(VideoStyle.Default);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Default);
    const [imageStyle, setImageStyle] = useState<ImageStyle>(ImageStyle.Default);
    const [lighting, setLighting] = useState<Lighting>(Lighting.Default);
    const [framing, setFraming] = useState<Framing>(Framing.Default);
    const [cameraAngle, setCameraAngle] = useState<CameraAngle>(CameraAngle.Default);
    const [imageResolution, setImageResolution] = useState<CameraResolution>(CameraResolution.Default);
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [outputFormat, setOutputFormat] = useState('Default');
    const [audioType, setAudioType] = useState<AudioType>(AudioType.Default);
    const [audioVibe, setAudioVibe] = useState<AudioVibe>(AudioVibe.Default);
    const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>(CodeLanguage.Default);
    const [codeTask, setCodeTask] = useState<CodeTask>(CodeTask.Default);
    
    const handleUseLibraryTemplate = useCallback((template: LibraryTemplate) => {
        const mode = template.medium === 'Image' ? PromptMode.Image : PromptMode.Video;
        setPromptMode(mode);
        setUserPrompt(template.prompt);
        
        // Reset all controls to default for a clean slate
        setContentTone(ContentTone.Default);
        setPov(PointOfView.Default);
        setVideoResolution(CameraResolution.Default);
        setVideoStyle(VideoStyle.Default);
        setAspectRatio(AspectRatio.Default);
        setImageStyle(ImageStyle.Default);
        setLighting(Lighting.Default);
        setFraming(Framing.Default);
        setCameraAngle(CameraAngle.Default);
        setImageResolution(CameraResolution.Default);
        setAdditionalDetails('');
        setOutputFormat('Default');
        setAudioType(AudioType.Default);
        setAudioVibe(AudioVibe.Default);
        setCodeLanguage(CodeLanguage.Default);
        setCodeTask(CodeTask.Default);
        
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
        let options: Record<string, any> = {};
        let loadingMsg = 'Our AI is enhancing your prompt...';

        switch (promptMode) {
            case PromptMode.Video: options = { contentTone, pov, resolution: videoResolution, videoStyle }; break;
            case PromptMode.Image: options = { contentTone, imageStyle, lighting, framing, cameraAngle, resolution: imageResolution, aspectRatio, additionalDetails }; break;
            case PromptMode.Text: options = { contentTone, outputFormat }; break;
            case PromptMode.Audio: options = { contentTone, audioType, audioVibe }; break;
            case PromptMode.Code: options = { codeLanguage, codeTask }; break;
        }
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
    }, [userPrompt, promptMode, contentTone, pov, videoResolution, videoStyle, imageStyle, lighting, framing, cameraAngle, imageResolution, aspectRatio, additionalDetails, outputFormat, audioType, audioVibe, codeLanguage, codeTask, outputStructure, isCreativityMode, addPromptToHistory]);
    
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


    const renderModeOptions = () => {
        switch (promptMode) {
            case PromptMode.Text: return (<div className="space-y-4"><SelectControl id="contentTone" label="Content Tone" value={contentTone} onChange={(e) => setContentTone(e.target.value as ContentTone)} options={TONE_OPTIONS} /><SelectControl id="outputFormat" label="Desired Text Format" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} options={TEXT_FORMAT_OPTIONS} /></div>);
            case PromptMode.Image: return (<div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><SelectControl id="contentTone" label="Content Tone / Mood" value={contentTone} onChange={(e) => setContentTone(e.target.value as ContentTone)} options={TONE_OPTIONS} /><SelectControl id="imageStyle" label="Style" value={imageStyle} onChange={(e) => setImageStyle(e.target.value as ImageStyle)} options={IMAGE_STYLE_OPTIONS} /><SelectControl id="aspectRatio" label="Aspect Ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} options={ASPECT_RATIO_OPTIONS} /><SelectControl id="lighting" label="Lighting" value={lighting} onChange={(e) => setLighting(e.target.value as Lighting)} options={LIGHTING_OPTIONS} /><SelectControl id="framing" label="Framing" value={framing} onChange={(e) => setFraming(e.target.value as Framing)} options={FRAMING_OPTIONS} /><SelectControl id="cameraAngle" label="Camera Angle" value={cameraAngle} onChange={(e) => setCameraAngle(e.target.value as CameraAngle)} options={CAMERA_ANGLE_OPTIONS} /><SelectControl id="imageResolution" label="Detail Level" value={imageResolution} onChange={(e) => setImageResolution(e.target.value as CameraResolution)} options={CAMERA_RESOLUTION_OPTIONS} /></div><div><label htmlFor="additionalDetails" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Additional Details (Optional)</label><input id="additionalDetails" type="text" className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="E.g. turquoise rings, stark white background..." value={additionalDetails} onChange={(e) => setAdditionalDetails(e.target.value)} /></div></div>);
            case PromptMode.Video: return (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><SelectControl id="contentTone" label="Content Tone" value={contentTone} onChange={(e) => setContentTone(e.target.value as ContentTone)} options={TONE_OPTIONS} /><SelectControl id="videoStyle" label="Video Style" value={videoStyle} onChange={(e) => setVideoStyle(e.target.value as VideoStyle)} options={VIDEO_STYLE_OPTIONS} /><SelectControl id="pov" label="Point of View" value={pov} onChange={(e) => setPov(e.target.value as PointOfView)} options={POV_OPTIONS} /><SelectControl id="videoResolution" label="Detail Level" value={videoResolution} onChange={(e) => setVideoResolution(e.target.value as CameraResolution)} options={CAMERA_RESOLUTION_OPTIONS} /></div>);
            case PromptMode.Audio: return (<div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><SelectControl id="contentTone" label="Content Tone" value={contentTone} onChange={(e) => setContentTone(e.target.value as ContentTone)} options={TONE_OPTIONS} /><SelectControl id="audioType" label="Audio Type" value={audioType} onChange={(e) => setAudioType(e.target.value as AudioType)} options={AUDIO_TYPE_OPTIONS} /><SelectControl id="audioVibe" label="Vibe / Mood" value={audioVibe} onChange={(e) => setAudioVibe(e.target.value as AudioVibe)} options={AUDIO_VIBE_OPTIONS} /></div>);
            case PromptMode.Code: return (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><SelectControl id="codeLanguage" label="Language" value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value as CodeLanguage)} options={CODE_LANGUAGE_OPTIONS} /><SelectControl id="codeTask" label="Task" value={codeTask} onChange={(e) => setCodeTask(e.target.value as CodeTask)} options={CODE_TASK_OPTIONS} /></div>);
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
                        {/* Fix: Corrected the content of the button to fix a JSX parsing error. */}
                        {copyStatus === 'copied' ? <><i className="fas fa-check text-green-500"></i>Copied!</> : copyStatus === 'error' ? <><i className="fas fa-times text-red-500"></i>Failed</> : <><i className="fas fa-copy"></i>Copy</>}
                    </button>
                </div>
                <div className="relative bg-slate-100 dark:bg-gray-800 rounded-lg min-h-[16rem] overflow-hidden">
                    {isLoading && <div className="absolute inset-0 flex flex-col justify-center items-center bg-slate-100/80 dark:bg-gray-800/80 z-10 text-center text-slate-500 dark:text-gray-400"><i className="fas fa-brain fa-beat-fade text-4xl text-purple-500 mb-4" style={{'--fa-animation-duration': '2s'} as React.CSSProperties}></i><p>{loadingMessage}</p></div>}
                    {!isLoading && !generatedPrompt && <div className="text-slate-500 dark:text-gray-400 italic h-full flex items-center justify-center p-4 text-center"><p>Your expertly crafted prompt will appear here...</p></div>}
                    {generatedPrompt && <textarea value={generatedPrompt} onChange={(e) => setGeneratedPrompt(e.target.value)} className="absolute inset-0 w-full h-full bg-transparent border-0 ring-0 focus:ring-1 focus:ring-purple-500 focus:outline-none rounded-lg p-4 text-slate-800 dark:text-gray-300 whitespace-pre-wrap font-mono text-sm resize-none" />}
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