import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';

import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import AuthModal from './components/common/AuthModal';
import PromptLibraryModal from './components/common/PromptLibraryModal';
// Fix: Import Section and SelectControl for use in ProfilePage and SettingsPage
import Section from './components/layout/Section';
import SelectControl from './components/common/SelectControl';

import MainPage from './pages/MainPage';
import HistoryPage from './pages/HistoryPage';
import LoggedOutView from './pages/LoggedOutView';
// Fix: Import PromptMode for SettingsPage
import { LibraryTemplate, PromptMode } from './types';


// Fix: Added ProfilePage component definition to avoid missing module error.
const ProfilePage = () => {
    const { currentUser, logOut, savedPrompts, deletePrompt } = useAuth();
    const [copyStatus, setCopyStatus] = useState<{ [key: number]: 'idle' | 'copied' }>({});
    const [promptToDelete, setPromptToDelete] = useState<string | null>(null);


    if (!currentUser) {
        return <p>Please log in to view your profile.</p>;
    }

    const getInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ');
        return names.map(n => n[0]).join('').toUpperCase();
    }
    
    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyStatus({ ...copyStatus, [index]: 'copied' });
            setTimeout(() => {
                setCopyStatus(prev => ({ ...prev, [index]: 'idle' }));
            }, 2000);
        });
    };

    const handleConfirmDelete = () => {
        if (promptToDelete) {
            deletePrompt(promptToDelete);
        }
        setPromptToDelete(null);
    };

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
                        <p className="text-3xl font-bold text-blue-500">{savedPrompts.length}</p>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Prompts Saved</p>
                    </div>
                     <div className="bg-slate-100/50 dark:bg-gray-800/50 p-4 rounded-xl text-center">
                        <p className="text-3xl font-bold text-green-500">0</p>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Active Projects</p>
                    </div>
                </div>
            </Section>
            
            <Section title="Saved Prompts" icon="fa-bookmark">
                {savedPrompts.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-500 dark:text-gray-400 text-center">
                        <i className="far fa-bookmark text-4xl mb-4"></i>
                        <p className="italic">You haven't saved any prompts yet.</p>
                        <p className="text-xs mt-1">Saved prompts from the main page will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {savedPrompts.map((prompt, index) => (
                            <div key={index} className="bg-slate-100/50 dark:bg-gray-800/50 p-4 rounded-xl flex flex-col gap-3">
                                <p className="text-sm font-mono text-slate-700 dark:text-gray-300 whitespace-pre-wrap flex-grow">
                                    {prompt}
                                </p>
                                <div className="flex justify-end items-center gap-2 border-t border-slate-300/50 dark:border-gray-700/50 pt-3">
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
                                    <button
                                        onClick={() => setPromptToDelete(prompt)}
                                        className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                                    >
                                       <i className="fas fa-trash-alt"></i> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            {promptToDelete && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate__animated animate__fadeIn" onClick={() => setPromptToDelete(null)} aria-modal="true" role="dialog">
                    <div className="glass rounded-2xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-8 text-center">
                            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Delete Prompt?</h2>
                            <p className="text-slate-600 dark:text-gray-400 mb-6">
                                Are you sure you want to delete this prompt? This action is permanent.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setPromptToDelete(null)} className="bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 font-medium py-2 px-6 rounded-lg transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-all">
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Fix: Added SettingsPage component definition to avoid missing module error.
const SettingsPage = () => {
    const { clearPromptHistory, promptHistory } = useAuth();

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [defaultMode, setDefaultMode] = useState<PromptMode>(() => (localStorage.getItem('defaultMode') as PromptMode) || PromptMode.Image);
    const [defaultCreativity, setDefaultCreativity] = useState(() => (localStorage.getItem('defaultCreativity') !== 'false'));
    const [showConfirm, setShowConfirm] = useState(false);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
    };

    const handleDefaultModeChange = (e) => {
        const newMode = e.target.value as PromptMode;
        setDefaultMode(newMode);
        localStorage.setItem('defaultMode', newMode);
    };

    const handleDefaultCreativityChange = () => {
        const newCreativity = !defaultCreativity;
        setDefaultCreativity(newCreativity);
        localStorage.setItem('defaultCreativity', String(newCreativity));
    };

    const handleClearHistory = () => {
        clearPromptHistory();
        setShowConfirm(false);
    };

    const SegmentedControl = ({ options, value, onChange, label }) => (
        <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-300">{label}</label>
            <div className="p-1 bg-slate-200 dark:bg-gray-800 rounded-xl flex gap-1">
                {options.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${value === opt.value ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-300/50 dark:hover:bg-gray-900/20'}`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate__animated animate__fadeIn">
            <Section title="Application Settings" icon="fa-sliders-h">
                <div className="divide-y divide-slate-200 dark:divide-gray-700">
                    <SegmentedControl
                        label="Theme"
                        options={[{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }]}
                        value={theme}
                        onChange={handleThemeChange}
                    />
                    <div className="py-2">
                        <SelectControl 
                            id="default-mode"
                            label="Default Media Type"
                            value={defaultMode}
                            onChange={handleDefaultModeChange}
                            options={Object.values(PromptMode)}
                        />
                    </div>
                     <div className="py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Default Creativity Mode</label>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Set whether 'Creativity Mode' is on by default.</p>
                            </div>
                            <label className="creativity-toggle">
                                <input 
                                    type="checkbox" 
                                    checked={defaultCreativity} 
                                    onChange={handleDefaultCreativityChange}
                                    aria-label="Toggle default creativity mode"
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </Section>
            
            <Section title="Data Management" icon="fa-database">
                 <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-slate-700 dark:text-gray-300">Clear Prompt History</h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                            This will permanently delete your {promptHistory.length} saved prompts from this session.
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowConfirm(true)}
                        disabled={promptHistory.length === 0}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <i className="fas fa-trash-alt mr-2"></i> Clear History
                    </button>
                </div>
            </Section>

            {showConfirm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate__animated animate__fadeIn" onClick={() => setShowConfirm(false)} aria-modal="true" role="dialog">
                    <div className="glass rounded-2xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-8 text-center">
                            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Are you sure?</h2>
                            <p className="text-slate-600 dark:text-gray-400 mb-6">
                                This will permanently delete your prompt history. This action cannot be undone.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setShowConfirm(false)} className="bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 font-medium py-2 px-6 rounded-lg transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleClearHistory} className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-all">
                                    Yes, Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const App = () => {
    const { currentUser, loading } = useAuth();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState('main');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    useEffect(() => {
        const handleThemeChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail && (customEvent.detail === 'light' || customEvent.detail === 'dark')) {
                setTheme(customEvent.detail);
            }
        };
        window.addEventListener('themeChanged', handleThemeChange);
        return () => window.removeEventListener('themeChanged', handleThemeChange);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    
    const handleProfileClick = () => {
        if (currentUser) {
            setCurrentView('profile');
        } else {
            setIsAuthModalOpen(true);
        }
    };
    
    const renderCurrentView = () => {
        if (loading) {
            return <div className="w-full h-full flex items-center justify-center"><i className="fas fa-spinner fa-spin text-4xl text-purple-500"></i></div>;
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
                return <MainPage openLibrary={() => setIsLibraryOpen(true)} />;
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
            />
             <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
            />
        </div>
    );
};

export default App;