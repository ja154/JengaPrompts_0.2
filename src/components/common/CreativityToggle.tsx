import React from 'react';

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

export default CreativityToggle;
