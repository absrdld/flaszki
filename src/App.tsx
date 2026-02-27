/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Deck } from './components/Deck';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <main>
        <Deck />
      </main>
    </div>
  );
}
