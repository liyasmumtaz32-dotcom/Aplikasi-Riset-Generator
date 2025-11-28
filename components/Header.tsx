import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-4 py-4 md:px-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
          AI Writing Assistant
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Generator Karya Ilmiah & Kreatif
        </p>
      </div>
    </header>
  );
};