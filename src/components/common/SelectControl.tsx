import React from 'react';

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

export default SelectControl;
