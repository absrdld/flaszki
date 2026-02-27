/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Deck } from './components/Deck';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <header className="py-8 px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">
              Historia Sztuki
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              Interaktywne fiszki do nauki
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      <main className="py-12">
        <Deck />
      </main>

      <footer className="py-8 text-center text-neutral-500 text-sm border-t border-neutral-200 dark:border-neutral-800 mt-auto">
        <p>Stworzone do nauki historii sztuki.</p>
      </footer>
    </div>
  );
}
