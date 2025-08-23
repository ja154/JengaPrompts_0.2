

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { getEnhancedPrompt } from './services/geminiService';
import { TONE_OPTIONS, POV_OPTIONS, ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS, LIGHTING_OPTIONS, FRAMING_OPTIONS, CAMERA_ANGLE_OPTIONS, CAMERA_RESOLUTION_OPTIONS, TEXT_FORMAT_OPTIONS, AUDIO_TYPE_OPTIONS, AUDIO_VIBE_OPTIONS, CODE_LANGUAGE_OPTIONS, CODE_TASK_OPTIONS, OUTPUT_STRUCTURE_OPTIONS } from './constants';
import { ContentTone, PointOfView, PromptMode, AspectRatio, ImageStyle, Lighting, Framing, CameraAngle, CameraResolution, AudioType, AudioVibe, CodeLanguage, CodeTask, OutputStructure, LibraryTemplate } from './types';
import { libraryTemplates } from './library';
import { useAuth } from './contexts/AuthContext';


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

const Header = ({ theme, toggleTheme, toggleSidebar, onLogoClick, onProfileClick }) => {
    const { currentUser } = useAuth();
    
    return (
        <header className="app-header h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-gray-800 glass">
            <div className="flex items-center gap-3 cursor-pointer" onClick={onLogoClick} role="button" aria-label="Go to homepage">
                 <button onClick={(e) => { e.stopPropagation(); toggleSidebar(); }} className="lg:hidden text-slate-600 dark:text-gray-300 focus:outline-none" aria-label="Open sidebar">
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
                <button onClick={onProfileClick} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-gray-700 overflow-hidden profile-button-glow" aria-label="User Profile">
                    {currentUser && currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="User avatar" className="w-full h-full object-cover" />
                    ) : (
                        <i className="fas fa-user text-slate-600 dark:text-gray-300"></i>
                    )}
                </button>
            </div>
        </header>
    );
};

const Sidebar = ({ isOpen, toggleSidebar, currentView, setCurrentView, openAuthModal }) => {
    const { currentUser, logOut } = useAuth();

    const navItems = [
        { id: 'main', icon: 'fa-home', label: 'Home', auth: false },
        { id: 'profile', icon: 'fa-user', label: 'Profile', auth: true },
        { id: 'settings', icon: 'fa-cog', label: 'Settings', auth: true },
        { id: 'history', icon: 'fa-history', label: 'History', auth: true },
    ];
    
    const handleLogout = async () => {
        try {
            await logOut();
            setCurrentView('main');
             if (window.innerWidth < 1024) {
                toggleSidebar();
            }
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    const handleNavClick = (e, item) => {
        e.preventDefault();
        if (item.auth && !currentUser) {
            openAuthModal();
        } else {
            setCurrentView(item.id);
        }

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
                    {navItems.filter(item => !item.auth || currentUser).map(item => (
                        <li key={item.label}>
                            <a href="#" 
                               onClick={(e) => handleNavClick(e, item)} 
                               className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${currentView === item.id ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold' : 'text-slate-600 dark:text-gray-300 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400'}`}
                               aria-current={currentView === item.id ? 'page' : undefined}
                            >
                                <i className={`fas ${item.icon} w-5 text-center`}></i>
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                     <li>
                        {currentUser ? (
                            <a href="#" onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400">
                                <i className="fas fa-sign-out-alt w-5 text-center"></i>
                                <span>Logout</span>
                            </a>
                        ) : (
                            <a href="#" onClick={(e) => { e.preventDefault(); openAuthModal(); }} className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400">
                                <i className="fas fa-sign-in-alt w-5 text-center"></i>
                                <span>Login</span>
                            </a>
                        )}
                    </li>
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
//  Page Components
// ===================================================================================

const ProfilePage = () => {
    const { currentUser, logOut } = useAuth();

    if (!currentUser) {
        return <p>Please log in to view your profile.</p>;
    }

    const getInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ');
        return names.map(n => n[0]).join('').toUpperCase();
    }

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate__animated animate__fadeIn">
            <Section title="User Profile" icon="fa-user-circle">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full border-4 border-purple-500/50 shadow-lg flex items-center justify-center bg-slate-200 dark:bg-gray-700 overflow-hidden">
                        {currentUser.photoURL ? (
                            <img src={currentUser.photoURL} alt="User Avatar" className="w-full h-full object-cover"/>
                        ) : (
                            <span className="text-3xl font-bold text-slate-600 dark:text-gray-300">{getInitials(currentUser.displayName)}</span>
                        )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{currentUser.displayName || 'Anonymous User'}</h3>
                        <p className="text-slate-500 dark:text-gray-400">{currentUser.email}</p>
                        <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                            Joined: {currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Recently'}
                        </p>
                    </div>
                    <button onClick={logOut} className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm">
                        Sign Out
                    </button>
                </div>
            </Section>
            <Section title="Usage Statistics" icon="fa-chart-line">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-100/50 dark:bg-gray-800/50 p-4 rounded-xl text-center">
                        <p className="text-3xl font-bold text-purple-500">0</p>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Prompts Generated</p>
                    </div>
                     <div className="bg-slate-100/50 dark:bg-gray-800/50 p-4 rounded-xl text-center">
                        <p className="text-3xl font-bold text-blue-500">0</p>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Prompts Saved</p>
                    </div>
                     <div className="bg-slate-100/50 dark:bg-gray-800/50 p-4 rounded-xl text-center">
                        <p className="text-3xl font-bold text-green-500">0</p>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Active Projects</p>
                    </div>
                </div>
            </Section>
             <Section title="API Key" icon="fa-key">
                <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">Your Gemini API key is securely stored and used for all prompt generations.</p>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-gray-800 p-3 rounded-lg">
                    <i className="fas fa-lock text-slate-400 dark:text-gray-500"></i>
                    <input 
                        type="text" 
                        readOnly 
                        value="•••••••••••••••••••••••••••••••••••a1b2" 
                        className="flex-1 bg-transparent font-mono text-sm outline-none"
                    />
                    <button className="text-xs bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5">
                       <i className="fas fa-copy"></i> Copy
                    </button>
                </div>
            </Section>
        </div>
    );
};

const SettingsPage = () => (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate__animated animate__fadeIn">
        <Section title="Application Settings" icon="fa-sliders-h">
            <div className="h-48 flex items-center justify-center text-slate-500 dark:text-gray-400 italic">
                Settings page coming soon...
            </div>
        </Section>
    </div>
);

const HistoryPage = () => {
    const { promptHistory } = useAuth();
    const [copyStatus, setCopyStatus] = useState<{ [key: number]: 'idle' | 'copied' }>({});

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyStatus({ ...copyStatus, [index]: 'copied' });
            setTimeout(() => {
                setCopyStatus(prev => ({ ...prev, [index]: 'idle' }));
            }, 2000);
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate__animated animate__fadeIn">
            <Section title="Recent Prompts" icon="fa-history">
                {promptHistory.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-500 dark:text-gray-400 text-center">
                        <i className="fas fa-wind text-4xl mb-4"></i>
                        <p className="italic">You haven't generated any prompts yet.</p>
                        <p className="text-xs mt-1">Your last 5 generated prompts will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 dark:text-gray-400 -mt-2 mb-4">
                            Here are your last 5 generated prompts. This history is cleared when you log out.
                        </p>
                        {promptHistory.map((prompt, index) => (
                            <div key={index} className="bg-slate-100/50 dark:bg-gray-800/50 p-4 rounded-xl flex flex-col gap-3">
                                <p className="text-sm font-mono text-slate-700 dark:text-gray-300 whitespace-pre-wrap flex-grow">
                                    {prompt}
                                </p>
                                <div className="flex justify-end border-t border-slate-300/50 dark:border-gray-700/50 pt-3">
                                    <button
                                        onClick={() => handleCopy(prompt, index)}
                                        className="text-xs bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                                    >
                                        {copyStatus[index] === 'copied' ? (
                                            <><i className="fas fa-check text-green-500"></i> Copied!</>
                                        ) : (
                                            <><i className="fas fa-copy"></i> Copy</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Section>
        </div>
    );
};


const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { signUp, logIn } = useAuth();

    useEffect(() => {
        if (isOpen) {
            setError('');
            setEmail('');
            setPassword('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            if (isLogin) {
                await logIn(email, password);
            } else {
                await signUp(email, password);
            }
            onClose();
        } catch (err) {
            setError(err.message.replace('Mock Auth Error: ', ''));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate__animated animate__fadeIn" onClick={onClose} aria-modal="true" role="dialog">
            <div className="glass rounded-2xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-300/50 dark:border-gray-700/50">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{isLogin ? 'Sign In' : 'Create Account'}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 transition-all" aria-label="Close authentication form">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="p-8">
                    {error && <p className="bg-red-100 dark:bg-red-800/50 border border-red-400 text-red-700 dark:text-red-200 text-sm p-3 rounded-lg mb-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                        </div>
                         <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium py-2.5 px-6 rounded-lg transition-all transform hover:scale-[1.02] glow disabled:opacity-60 mt-2">
                            {isSubmitting ? <><i className="fas fa-spinner fa-spin mr-2"></i>Processing...</> : isLogin ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>
                     <p className="text-center text-sm text-slate-500 dark:text-gray-400 mt-6">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-purple-500 hover:underline ml-1">
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

const LoggedOutView = ({ openAuthModal }) => (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center gap-6 py-16">
        <div className="loader-container !w-20 !h-20">
            <div className="loader !w-40 !h-40 !transform-none">
                <div className="box1 !border-[16px]"></div>
                <div className="box2 !border-[16px]"></div>
                <div className="box3 !border-[16px]"></div>
            </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white">Welcome to JengaPrompts Pro</h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-2xl">
            The ultimate toolkit for professional prompt engineering. Sign in to build, test, and optimize prompts for any AI model.
        </p>
        <button onClick={openAuthModal} className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] glow">
            Get Started
        </button>
    </div>
);


// ===================================================================================
//  Main Application
// ===================================================================================

const App = () => {
    const { currentUser, loading, addPromptToHistory } = useAuth();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState('main');
    const [promptMode, setPromptMode] = useState<PromptMode>(PromptMode.Image);
    const [userPrompt, setUserPrompt] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
    const [outputStructure, setOutputStructure] = useState<OutputStructure>(OutputStructure.Simple);
    const [isCreativityMode, setIsCreativityMode] = useState(true);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    
    const handleUseLibraryTemplate = useCallback((template: LibraryTemplate) => {
        const mode = template.medium === 'Image' ? PromptMode.Image : PromptMode.Video;
        setPromptMode(mode);
        setUserPrompt(template.prompt);
        
        // Reset all controls to default for a clean slate
        setContentTone(ContentTone.Default);
        setPov(PointOfView.Default);
        setVideoResolution(CameraResolution.Default);
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
        
        setIsLibraryOpen(false);
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
            addPromptToHistory(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [userPrompt, promptMode, contentTone, pov, videoResolution, imageStyle, lighting, framing, cameraAngle, imageResolution, aspectRatio, additionalDetails, outputFormat, audioType, audioVibe, codeLanguage, codeTask, outputStructure, isCreativityMode, addPromptToHistory]);
    
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
    
    const renderCurrentView = () => {
        if (loading) {
            return <div className="w-full h-full flex items-center justify-center"><i className="fas fa-spinner fa-spin text-4xl text-purple-500"></i></div>
        }

        if (!currentUser) {
            return <LoggedOutView openAuthModal={() => setIsAuthModalOpen(true)} />;
        }

        switch (currentView) {
            case 'profile': return <ProfilePage />;
            case 'settings': return <SettingsPage />;
            case 'history': return <HistoryPage />;
            case 'main':
            default:
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
                            <div className="flex items-center justify-end mb-2">
                                <button onClick={handleCopyToClipboard} disabled={!generatedPrompt || isLoading || copyStatus !== 'idle'} className="text-xs bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 px-3 py-1.5 rounded-full transition-all disabled:opacity-60 flex items-center gap-1.5" aria-label="Copy result">
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
                                Explore a curated collection of 100+ production-ready prompts for inspiration. Click to use a prompt as your starting point.
                            </p>
                            <button onClick={() => setIsLibraryOpen(true)} className="w-full bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 text-slate-800 dark:text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center library-button-glow">
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
        }
    }
    
    const handleProfileClick = () => {
        if (currentUser) {
            setCurrentView('profile');
        } else {
            setIsAuthModalOpen(true);
        }
    };


    return (
        <div className="app-layout">
            <Header 
                theme={theme} 
                toggleTheme={toggleTheme} 
                toggleSidebar={toggleSidebar} 
                onLogoClick={() => setCurrentView('main')}
                onProfileClick={handleProfileClick}
            />
            <Sidebar 
                isOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
                currentView={currentView}
                setCurrentView={setCurrentView}
                openAuthModal={() => setIsAuthModalOpen(true)}
            />
            <main className="main-content">
                {renderCurrentView()}
            </main>
             {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-20 lg:hidden" 
                    onClick={toggleSidebar}
                    aria-hidden="true"
                ></div>
            )}
            <PromptLibraryModal 
                isOpen={isLibraryOpen} 
                onClose={() => setIsLibraryOpen(false)} 
                onUseTemplate={handleUseLibraryTemplate} 
            />
             <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
            />
        </div>
    );
};

const PromptLibraryModal = ({ isOpen, onClose, onUseTemplate }) => {
    if (!isOpen) return null;

    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');
    
    const categories = useMemo(() => ['All', ...Array.from(new Set(libraryTemplates.map(t => t.category)))], []);

    const filteredTemplates = useMemo(() => {
        return libraryTemplates.filter(t => {
            const matchesCategory = category === 'All' || t.category === category;
            const matchesSearch = searchTerm === '' || t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.prompt.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, category]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate__animated animate__fadeIn" onClick={onClose} aria-modal="true" role="dialog">
            <div className="glass rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-300/50 dark:border-gray-700/50">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">
                        <i className="fas fa-book-open text-purple-500"></i>
                        <span>Prompt Library</span>
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 transition-all" aria-label="Close library">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 p-6 border-b border-slate-300/50 dark:border-gray-700/50">
                    <input 
                        type="text"
                        placeholder="Search prompts by title or content..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-grow bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        aria-label="Search prompts"
                    />
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="sm:w-56 bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        aria-label="Filter by category"
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map(template => (
                            <div key={template.id} className="bg-slate-100/50 dark:bg-gray-800/50 hover:bg-slate-200/50 dark:hover:bg-gray-800/80 p-5 rounded-xl transition-all flex flex-col border border-transparent hover:border-purple-500/50 transform hover:-translate-y-1">
                                <h3 className="text-md font-semibold mb-2 text-slate-800 dark:text-white">{template.title}</h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${template.medium === 'Image' ? 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>{template.medium}</span>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-gray-700 dark:text-gray-300">{template.category}</span>
                                </div>
                                <div className="flex-grow mb-4">
                                    <p className="text-slate-600 dark:text-gray-400 text-xs mb-3 line-clamp-3">{template.prompt}</p>
                                    <div className="border-t border-slate-300/50 dark:border-gray-700/50 pt-3 text-xs space-y-1">
                                        <p className="text-slate-500 dark:text-gray-400 line-clamp-2">
                                            <i className="fas fa-lightbulb text-yellow-500 mr-2 opacity-80"></i>
                                            {template.virality_notes}
                                        </p>
                                        <p className="text-slate-500 dark:text-gray-400">
                                            <i className="fas fa-wrench text-blue-500 mr-2 opacity-80"></i>
                                            Tool: <strong>{template.tool_recommendation}</strong>
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => onUseTemplate(template)} className="mt-auto bg-purple-500/80 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm flex items-center justify-center w-full">
                                    <i className="fas fa-wand-magic-sparkles mr-2"></i>Use Prompt
                                </button>
                            </div>
                        ))}
                         {filteredTemplates.length === 0 && (
                            <p className="text-slate-500 dark:text-gray-400 md:col-span-2 lg:col-span-3 text-center py-8">No prompts found. Try adjusting your search or filters.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default App;