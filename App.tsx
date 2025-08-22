

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { getEnhancedPrompt } from './services/geminiService';
import { TONE_OPTIONS, POV_OPTIONS, ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS, LIGHTING_OPTIONS, FRAMING_OPTIONS, CAMERA_ANGLE_OPTIONS, CAMERA_RESOLUTION_OPTIONS, TEXT_FORMAT_OPTIONS, AUDIO_TYPE_OPTIONS, AUDIO_VIBE_OPTIONS, CODE_LANGUAGE_OPTIONS, CODE_TASK_OPTIONS, OUTPUT_STRUCTURE_OPTIONS } from './constants';
import { ContentTone, PointOfView, PromptMode, AspectRatio, ImageStyle, Lighting, Framing, CameraAngle, CameraResolution, AudioType, AudioVibe, CodeLanguage, CodeTask, OutputStructure } from './types';
import { templates, PromptTemplate } from './templates';


// ===================================================================================
//  UI Sub-components
// ===================================================================================

const ThemeToggle = ({ theme, toggleTheme }) => (
    <div aria-label="Toggle theme">
        <label className="switch">
            <input 
                type="checkbox" 
                onChange={toggleTheme} 
                checked={theme === 'light'} 
                aria-label="theme toggle checkbox"
            />
            <span className="slider">
                <span className="star star_1"></span>
                <span className="star star_2"></span>
                <span className="star star_3"></span>
                <svg className="cloud" xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 100 85" >
                    <path d="M 83.5,52.5 C 79.8,42.4 70.3,35.5 59.5,35.5 c -4.1,0 -8,1.2 -11.4,3.4 C 41.5,25.8 31.3,19.5 19.5,19.5 c -12.9,0 -23.4,10.5 -23.4,23.4 c 0,1.9 0.2,3.7 0.7,5.5 C -10.9,52.2 0.5,75.5 0.5,75.5 h 78.1 c 0,0 9.4,-15.8 4.9,-23 z" fill="#fff"></path>
                </svg>
            </span>
        </label>
    </div>
);

interface SectionProps {
    title: string;
    icon: string;
    children: React.ReactNode;
    className?: string;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(({ title, icon, children, className = '' }, ref) => (
    <section ref={ref} className={`glass rounded-2xl p-6 sm:p-8 ${className}`}>
        <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
            <i className={`fas ${icon} text-purple-500`}></i>
            <span>{title}</span>
        </h2>
        {children}
    </section>
));

const SelectControl = ({ id, label, value, onChange, options }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">{label}</label>
        <select
            id={id}
            className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            value={value}
            onChange={onChange}
            aria-label={`Select ${label}`}
        >
            {options.map(option => (
                typeof option === 'string' 
                    ? <option key={option} value={option}>{option}</option>
                    : <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);

const CreativityToggle = ({ isEnabled, onToggle }) => (
    <div>
        <label htmlFor="creativity-toggle" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Creativity Mode</label>
        <div className="flex items-center gap-3 h-[42px]">
            <label className="creativity-toggle">
                <input 
                    id="creativity-toggle"
                    type="checkbox" 
                    checked={isEnabled} 
                    onChange={onToggle}
                    aria-label="Toggle creativity mode"
                />
                <span className="slider"></span>
            </label>
            <p className="text-xs text-slate-500 dark:text-gray-400 flex-1">
                {isEnabled 
                    ? "AI will think deeper for more creative prompts." 
                    : "AI will provide a more direct enhancement."}
            </p>
        </div>
    </div>
);

// ===================================================================================
//  Layout Components
// ===================================================================================

const Header = ({ theme, toggleTheme, toggleSidebar }) => (
    <header className="app-header h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-gray-800 glass">
        <div className="flex items-center gap-3">
             <button onClick={toggleSidebar} className="lg:hidden text-slate-600 dark:text-gray-300 focus:outline-none" aria-label="Open sidebar">
                <i className="fas fa-bars text-xl"></i>
            </button>
            <div className="loader-container">
              <div className="loader">
                <div className="box1"></div>
                <div className="box2"></div>
                <div className="box3"></div>
              </div>
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">JengaPrompts</h1>
        </div>
        <div className="flex items-center gap-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-gray-700" aria-label="User Profile">
                <i className="fas fa-user text-slate-600 dark:text-gray-300"></i>
            </button>
        </div>
    </header>
);

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navItems = [
        { icon: 'fa-user', label: 'Profile' },
        { icon: 'fa-cog', label: 'Settings' },
        { icon: 'fa-history', label: 'History' },
        { icon: 'fa-sign-in-alt', label: 'Login' },
    ];
    
    const handleNavClick = () => {
        if (window.innerWidth < 1024) {
            toggleSidebar();
        }
    };

    return (
        <aside className={`app-sidebar p-6 flex flex-col gap-6 w-64 lg:w-auto fixed lg:relative inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
             <div className="flex justify-between items-center mb-4 lg:hidden">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Menu</h2>
                <button onClick={toggleSidebar} className="text-slate-600 dark:text-gray-300 focus:outline-none" aria-label="Close sidebar">
                    <i className="fas fa-times text-2xl"></i>
                </button>
            </div>
            <nav>
                <ul className="space-y-2">
                    {navItems.map(item => (
                        <li key={item.label}>
                            <a href="#" onClick={handleNavClick} className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all">
                                <i className={`fas ${item.icon} w-5 text-center`}></i>
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

const Footer = () => (
    <footer className="text-center text-slate-500 dark:text-gray-500 text-sm py-8">
        <div className="flex justify-center space-x-6 mb-4">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-all"><i className="fab fa-twitter text-lg"></i></a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-all"><i className="fab fa-discord text-lg"></i></a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-all"><i className="fab fa-github text-lg"></i></a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-all"><i className="fas fa-envelope text-lg"></i></a>
        </div>
        <p>© 2024 JengaPrompts Pro. All rights reserved.</p>
    </footer>
);

// ===================================================================================
//  Main Application
// ===================================================================================

const App = () => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [promptMode, setPromptMode] = useState<PromptMode>(PromptMode.Image);
    const [userPrompt, setUserPrompt] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
    const [outputStructure, setOutputStructure] = useState<OutputStructure>(OutputStructure.Simple);
    const [isCreativityMode, setIsCreativityMode] = useState(true);

    const inputSectionRef = useRef<HTMLElement>(null);

    // Shared state
    const [contentTone, setContentTone] = useState<ContentTone>(ContentTone.Default);
    // Video state
    const [pov, setPov] = useState<PointOfView>(PointOfView.Default);
    const [videoResolution, setVideoResolution] = useState<CameraResolution>(CameraResolution.Default);
    // Image state
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Default);
    const [imageStyle, setImageStyle] = useState<ImageStyle>(ImageStyle.Default);
    const [lighting, setLighting] = useState<Lighting>(Lighting.Default);
    const [framing, setFraming] = useState<Framing>(Framing.Default);
    const [cameraAngle, setCameraAngle] = useState<CameraAngle>(CameraAngle.Default);
    const [imageResolution, setImageResolution] = useState<CameraResolution>(CameraResolution.Default);
    const [additionalDetails, setAdditionalDetails] = useState('');
    // Text state
    const [outputFormat, setOutputFormat] = useState('Default');
    // Audio state
    const [audioType, setAudioType] = useState<AudioType>(AudioType.Default);
    const [audioVibe, setAudioVibe] = useState<AudioVibe>(AudioVibe.Default);
    // Code state
    const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>(CodeLanguage.Default);
    const [codeTask, setCodeTask] = useState<CodeTask>(CodeTask.Default);
    
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    
    const handleUseTemplate = useCallback((template: PromptTemplate) => {
        setPromptMode(template.mode);
        setUserPrompt(template.prompt);
        setContentTone(template.contentTone || ContentTone.Default);
        if (template.mode === PromptMode.Image) {
            setImageStyle(template.imageStyle || ImageStyle.Default);
            setLighting(template.lighting || Lighting.Default);
            setFraming(template.framing || Framing.Default);
            setCameraAngle(template.cameraAngle || CameraAngle.Default);
            setImageResolution(template.resolution || CameraResolution.Default);
            setAspectRatio(template.aspectRatio || AspectRatio.Default);
        }
        if (template.mode === PromptMode.Video) {
            setPov(template.pov || PointOfView.Default);
            setVideoResolution(template.resolution || CameraResolution.Default);
        }
        inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    const handleGenerateClick = useCallback(async () => {
        if (!userPrompt.trim()) return;
        setIsLoading(true);
        setError('');
        setGeneratedPrompt('');
        let options: Record<string, any> = {};
        let loadingMsg = 'Our AI is enhancing your prompt...';

        switch (promptMode) {
            case PromptMode.Video: options = { contentTone, pov, resolution: videoResolution }; break;
            case PromptMode.Image: options = { contentTone, imageStyle, lighting, framing, cameraAngle, resolution: imageResolution, aspectRatio, additionalDetails }; break;
            case PromptMode.Text: options = { contentTone, outputFormat }; break;
            case PromptMode.Audio: options = { contentTone, audioType, audioVibe }; break;
            case PromptMode.Code: options = { codeLanguage, codeTask }; break;
        }
        setLoadingMessage(loadingMsg);
        try {
            const result = await getEnhancedPrompt({ userPrompt, mode: promptMode, options, outputStructure, isCreativityMode });
            setGeneratedPrompt(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [userPrompt, promptMode, contentTone, pov, videoResolution, imageStyle, lighting, framing, cameraAngle, imageResolution, aspectRatio, additionalDetails, outputFormat, audioType, audioVibe, codeLanguage, codeTask, outputStructure, isCreativityMode]);
    
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

    const renderModeOptions = () => {
        switch (promptMode) {
            case PromptMode.Text: return (<div className="space-y-4"><SelectControl id="contentTone" label="Content Tone" value={contentTone} onChange={(e) => setContentTone(e.target.value as ContentTone)} options={TONE_OPTIONS} /><SelectControl id="outputFormat" label="Desired Text Format" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} options={TEXT_FORMAT_OPTIONS} /></div>);
            case PromptMode.Image: return (<div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><SelectControl id="contentTone" label="Content Tone / Mood" value={contentTone} onChange={(e) => setContentTone(e.target.value as ContentTone)} options={TONE_OPTIONS} /><SelectControl id="imageStyle" label="Style" value={imageStyle} onChange={(e) => setImageStyle(e.target.value as ImageStyle)} options={IMAGE_STYLE_OPTIONS} /><SelectControl id="aspectRatio" label="Aspect Ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} options={ASPECT_RATIO_OPTIONS} /><SelectControl id="lighting" label="Lighting" value={lighting} onChange={(e) => setLighting(e.target.value as Lighting)} options={LIGHTING_OPTIONS} /><SelectControl id="framing" label="Framing" value={framing} onChange={(e) => setFraming(e.target.value as Framing)} options={FRAMING_OPTIONS} /><SelectControl id="cameraAngle" label="Camera Angle" value={cameraAngle} onChange={(e) => setCameraAngle(e.target.value as CameraAngle)} options={CAMERA_ANGLE_OPTIONS} /><SelectControl id="imageResolution" label="Detail Level" value={imageResolution} onChange={(e) => setImageResolution(e.target.value as CameraResolution)} options={CAMERA_RESOLUTION_OPTIONS} /></div><div><label htmlFor="additionalDetails" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Additional Details (Optional)</label><input id="additionalDetails" type="text" className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="E.g. turquoise rings, stark white background..." value={additionalDetails} onChange={(e) => setAdditionalDetails(e.target.value)} /></div></div>);
            case PromptMode.Video: return (<div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><SelectControl id="contentTone" label="Content Tone" value={contentTone} onChange={(e) => setContentTone(e.target.value as ContentTone)} options={TONE_OPTIONS} /><SelectControl id="pov" label="Point of View" value={pov} onChange={(e) => setPov(e.target.value as PointOfView)} options={POV_OPTIONS} /><SelectControl id="videoResolution" label="Detail Level" value={videoResolution} onChange={(e) => setVideoResolution(e.target.value as CameraResolution)} options={CAMERA_RESOLUTION_OPTIONS} /></div>);
            case PromptMode.Audio: return (<div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><SelectControl id="contentTone" label="Content Tone" value={contentTone} onChange={(e) => setContentTone(e.target.value as ContentTone)} options={TONE_OPTIONS} /><SelectControl id="audioType" label="Audio Type" value={audioType} onChange={(e) => setAudioType(e.target.value as AudioType)} options={AUDIO_TYPE_OPTIONS} /><SelectControl id="audioVibe" label="Vibe / Mood" value={audioVibe} onChange={(e) => setAudioVibe(e.target.value as AudioVibe)} options={AUDIO_VIBE_OPTIONS} /></div>);
            case PromptMode.Code: return (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><SelectControl id="codeLanguage" label="Language" value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value as CodeLanguage)} options={CODE_LANGUAGE_OPTIONS} /><SelectControl id="codeTask" label="Task" value={codeTask} onChange={(e) => setCodeTask(e.target.value as CodeTask)} options={CODE_TASK_OPTIONS} /></div>);
            default: return null;
        }
    }
    
    const modeOptions = [{ mode: PromptMode.Text, icon: 'fa-file-alt' },{ mode: PromptMode.Image, icon: 'fa-image' },{ mode: PromptMode.Video, icon: 'fa-video' },{ mode: PromptMode.Audio, icon: 'fa-music' },{ mode: PromptMode.Code, icon: 'fa-code' }];

    return (
        <div className="app-layout">
            <Header theme={theme} toggleTheme={toggleTheme} toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main className="main-content flex flex-col gap-8">
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
                    <div className="flex items-center justify-end mb-2">
                        <button onClick={handleCopyToClipboard} disabled={!generatedPrompt || isLoading || copyStatus !== 'idle'} className="text-xs bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 px-3 py-1.5 rounded-full transition-all disabled:opacity-60 flex items-center gap-1.5" aria-label="Copy result">
                            {copyStatus === 'copied' ? <><i className="fas fa-check text-green-500"></i>Copied!</> : copyStatus === 'error' ? <><i className="fas fa-times text-red-500"></i>Failed</> : <><i className="fas fa-copy"></i>Copy</>}
                        </button>
                    </div>
                    <div className="relative bg-slate-100 dark:bg-gray-800 rounded-lg min-h-[16rem] overflow-hidden">
                        {isLoading && <div className="absolute inset-0 flex justify-center items-center bg-slate-100/80 dark:bg-gray-800/80 z-10 text-center text-slate-500 dark:text-gray-400"><i className="fas fa-brain fa-beat-fade text-4xl text-purple-500 mb-4" style={{'--fa-animation-duration': '2s'} as React.CSSProperties}></i><p>{loadingMessage}</p></div>}
                        {!isLoading && !generatedPrompt && <div className="text-slate-500 dark:text-gray-400 italic h-full flex items-center justify-center p-4 text-center"><p>Your expertly crafted prompt will appear here...</p></div>}
                        {generatedPrompt && <textarea value={generatedPrompt} onChange={(e) => setGeneratedPrompt(e.target.value)} className="absolute inset-0 w-full h-full bg-transparent border-0 ring-0 focus:ring-1 focus:ring-purple-500 focus:outline-none rounded-lg p-4 text-slate-800 dark:text-gray-300 whitespace-pre-wrap font-mono text-sm resize-none" />}
                    </div>
                </Section>

                <TemplateGallery onUseTemplate={handleUseTemplate} />
                
                <Section title="AI-Generated Content" icon="fa-image">
                    <div className="h-48 flex items-center justify-center bg-slate-200/50 dark:bg-gray-900/40 rounded-xl text-slate-500 dark:text-gray-400 italic">
                        AI content display area coming soon...
                    </div>
                </Section>
                
                <Footer />
            </main>
             {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-20 lg:hidden" 
                    onClick={toggleSidebar}
                    aria-hidden="true"
                ></div>
            )}
        </div>
    );
};

const TemplateGallery = ({ onUseTemplate }) => {
    const [activeTab, setActiveTab] = useState<PromptMode>(PromptMode.Image);
    const filteredTemplates = useMemo(() => templates.filter(t => t.mode === activeTab), [activeTab]);
    const tabOptions = [{ mode: PromptMode.Image, icon: 'fa-image', label: 'Image' }, { mode: PromptMode.Video, icon: 'fa-video', label: 'Video' }];
    
    return (
        <Section title="Templates Gallery" icon="fa-swatchbook">
            <div className="flex justify-center mb-6"><div className="p-1 bg-slate-200 dark:bg-gray-800 rounded-xl flex space-x-1">{tabOptions.map(({ mode, icon, label }) => (<button key={mode} onClick={() => setActiveTab(mode)} className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === mode ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-gray-700'}`} aria-pressed={activeTab === mode}><i className={`fas ${icon} text-base`}></i><span>{label}</span></button>))}</div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredTemplates.map((template, index) => (<div key={index} className="bg-slate-100 dark:bg-gray-800/50 hover:bg-slate-200 dark:hover:bg-gray-800/70 p-6 rounded-xl transition-all transform hover:-translate-y-1 flex flex-col"><h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">{template.title}</h3><p className="text-slate-600 dark:text-gray-400 text-sm mb-4 flex-grow">{template.description}</p><button onClick={() => onUseTemplate(template)} className="mt-auto bg-purple-500/80 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm flex items-center justify-center"><i className="fas fa-wand-magic-sparkles mr-2"></i>Use Template</button></div>))}</div>
        </Section>
    );
};

export default App;