import React from 'react';

const Footer = () => (
    <footer className="text-center text-slate-500 dark:text-gray-500 text-sm py-8">
        <div className="flex justify-center space-x-6 mb-4">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-all"><i className="fab fa-twitter text-lg"></i></a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-all"><i className="fab fa-discord text-lg"></i></a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-all"><i className="fab fa-github text-lg"></i></a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-all"><i className="fas fa-envelope text-lg"></i></a>
        </div>
        <p>© 2024 JengaPrompts Pro. All rights reserved.</p>
    </footer>
);

export default Footer;
