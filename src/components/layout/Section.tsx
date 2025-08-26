import React from 'react';

interface SectionProps {
    title: string;
    icon: string;
    children: React.ReactNode;
    className?: string;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(({ title, icon, children, className = '' }, ref) => (
    <section ref={ref} className={`glass rounded-2xl p-6 sm:p-8 ${className}`}>
        <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
            <i className={`fas ${icon} text-purple-500`}></i>
            <span>{title}</span>
        </h2>
        {children}
    </section>
));

export default Section;
