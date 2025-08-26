import React from 'react';

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

export default LoggedOutView;
