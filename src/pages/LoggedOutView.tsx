import React from 'react';

const LoggedOutView = ({ openAuthModal }) => (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center gap-8 py-12">
        <div className="loader-container !w-24 !h-24">
            <div className="loader !w-48 !h-48 !transform-none">
                <div className="box1 !border-[20px]"></div>
                <div className="box2 !border-[20px]"></div>
                <div className="box3 !border-[20px]"></div>
            </div>
        </div>
        <h1 className="text-5xl font-bold text-slate-800 dark:text-white">Welcome to JengaPrompts</h1>
        <p className="text-xl text-slate-600 dark:text-gray-300 max-w-3xl">
            The ultimate toolkit for prompt engineering. Build, test, and optimize your prompts for any AI model with our advanced features.
        </p>

        <div className="w-full max-w-4xl bg-white/50 dark:bg-gray-800/50 p-8 rounded-2xl shadow-lg backdrop-blur-sm border border-slate-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                <div className="p-4 bg-slate-100 dark:bg-gray-700 rounded-lg"><i className="fas fa-magic text-purple-500 mr-2"></i> Advanced Prompt Editor</div>
                <div className="p-4 bg-slate-100 dark:bg-gray-700 rounded-lg"><i className="fas fa-vial text-blue-500 mr-2"></i> A/B Testing Framework</div>
                <div className="p-4 bg-slate-100 dark:bg-gray-700 rounded-lg"><i className="fas fa-chart-line text-green-500 mr-2"></i> Performance Analytics</div>
                <div className="p-4 bg-slate-100 dark:bg-gray-700 rounded-lg"><i className="fas fa-book-open text-yellow-500 mr-2"></i> Prompt Library</div>
                <div className="p-4 bg-slate-100 dark:bg-gray-700 rounded-lg"><i className="fas fa-cogs text-red-500 mr-2"></i> Multi-Model Support</div>
                <div className="p-4 bg-slate-100 dark:bg-gray-700 rounded-lg"><i className="fas fa-share-alt text-indigo-500 mr-2"></i> Collaboration Tools</div>
            </div>
        </div>

        <button onClick={openAuthModal} className="w-full max-w-md bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-[1.03] glow text-lg">
            Get Started for Free
        </button>
    </div>
);

export default LoggedOutView;
