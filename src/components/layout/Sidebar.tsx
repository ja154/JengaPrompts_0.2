import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar, currentView, setCurrentView, openAuthModal }) => {
    const { currentUser, logOut } = useAuth();

    const navItems = [
        { id: 'main', icon: 'fa-home', label: 'Home', auth: false },
        { id: 'profile', icon: 'fa-user', label: 'Profile', auth: true },
        { id: 'settings', icon: 'fa-cog', label: 'Settings', auth: true },
        { id: 'history', icon: 'fa-history', label: 'History', auth: true },
    ];
    
    const handleLogout = async () => {
        try {
            await logOut();
            setCurrentView('main');
             if (window.innerWidth < 1024) {
                toggleSidebar();
            }
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    const handleNavClick = (e, item) => {
        if (item.auth && !currentUser) {
            e.preventDefault();
            openAuthModal();
        } else {
            setCurrentView(item.id);
        }

        if (window.innerWidth < 1024) {
            toggleSidebar();
        }
    };

    return (
        <aside className={`app-sidebar p-6 flex flex-col gap-6 w-64 lg:w-auto fixed lg:relative inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
             <div className="flex justify-between items-center mb-4 lg:hidden">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Menu</h2>
                <button onClick={toggleSidebar} className="text-slate-600 dark:text-gray-300 focus:outline-none" aria-label="Close sidebar">
                    <i className="fas fa-times text-2xl"></i>
                </button>
            </div>
            <nav>
                <ul className="space-y-2">
                    {navItems.filter(item => !item.auth || currentUser).map(item => (
                        <li key={item.label}>
                            <a href={`#/${item.id}`}
                               onClick={(e) => handleNavClick(e, item)}
                               className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${currentView === item.id ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold' : 'text-slate-600 dark:text-gray-300 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400'}`}
                               aria-current={currentView === item.id ? 'page' : undefined}
                            >
                                <i className={`fas ${item.icon} w-5 text-center`}></i>
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                     <li>
                        {currentUser ? (
                            <a href="#" onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400">
                                <i className="fas fa-sign-out-alt w-5 text-center"></i>
                                <span>Logout</span>
                            </a>
                        ) : (
                            <a href="#" onClick={(e) => { e.preventDefault(); openAuthModal(); }} className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400">
                                <i className="fas fa-sign-in-alt w-5 text-center"></i>
                                <span>Login</span>
                            </a>
                        )}
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
