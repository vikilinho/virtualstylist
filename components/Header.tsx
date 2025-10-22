import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80 focus:outline-none focus:opacity-100 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 rounded-lg p-1"
            aria-label="Virtual Stylist Home"
          >
            <div className="bg-violet-600 p-2 rounded-lg shadow-sm">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Virtual Stylist
            </h1>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
