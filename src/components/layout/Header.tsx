import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

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

export default Header;
