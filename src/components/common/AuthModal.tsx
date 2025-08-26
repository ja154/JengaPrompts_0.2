import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { signUp, logIn } = useAuth();

    useEffect(() => {
        if (isOpen) {
            setError('');
            setEmail('');
            setPassword('');
            setIsSubmitting(false);
            setIsLogin(true);
        }
    }, [isOpen]);

    useEffect(() => {
        setError('');
    }, [isLogin]);


    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            if (isLogin) {
                await logIn(email, password);
            } else {
                await signUp(email, password);
            }
            onClose();
        } catch (err) {
            setError(err.message.replace('Mock Auth Error: ', ''));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate__animated animate__fadeIn" onClick={onClose} aria-modal="true" role="dialog">
            <div className="glass rounded-2xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-300/50 dark:border-gray-700/50">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{isLogin ? 'Sign In' : 'Create Account'}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 transition-all" aria-label="Close authentication form">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="p-8">
                    {error && <p className="bg-red-100 dark:bg-red-800/50 border border-red-400 text-red-700 dark:text-red-200 text-sm p-3 rounded-lg mb-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                        </div>
                         <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium py-2.5 px-6 rounded-lg transition-all transform hover:scale-[1.02] glow disabled:opacity-60 mt-2">
                            {isSubmitting ? <><i className="fas fa-spinner fa-spin mr-2"></i>Processing...</> : isLogin ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>
                     <p className="text-center text-sm text-slate-500 dark:text-gray-400 mt-6">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-purple-500 hover:underline ml-1">
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;