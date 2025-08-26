import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Section from '../components/layout/Section';

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

export default ProfilePage;
