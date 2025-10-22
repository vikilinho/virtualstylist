import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Virtual Stylist
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;