import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';

import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import AuthModal from './components/common/AuthModal';
import PromptLibraryModal from './components/common/PromptLibraryModal';

import MainPage from './pages/MainPage';
import HistoryPage from './pages/HistoryPage';
import LoggedOutView from './pages/LoggedOutView';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';


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