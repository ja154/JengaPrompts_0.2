import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Section from '../components/layout/Section';
import SelectControl from '../components/common/SelectControl';
import { PromptMode } from '../types';

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

export default SettingsPage;
