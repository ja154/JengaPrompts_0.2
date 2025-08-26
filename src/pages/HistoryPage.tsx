import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Section from '../components/layout/Section';

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

export default HistoryPage;
