import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { libraryTemplates } from '../../library';
import { LibraryTemplate, PromptMode } from '../../types';
import { useAuth } from '../../contexts/AuthContext';


const PromptLibraryModal = ({ isOpen, onClose }) => {
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
    
    const handleUseTemplate = (template: LibraryTemplate) => {
        // This modal is now only for viewing. The logic to apply the template
        // is handled within the MainPage component when it receives the template.
        // We can use a custom event or a context update to pass data back.
        // For simplicity, let's use a custom event.
        window.dispatchEvent(new CustomEvent('useLibraryTemplate', { detail: template }));
        onClose();
    };


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
                                <button onClick={() => handleUseTemplate(template)} className="mt-auto bg-purple-500/80 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm flex items-center justify-center w-full">
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

export default PromptLibraryModal;
