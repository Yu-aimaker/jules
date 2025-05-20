// src/app/page.tsx
import React, { useState } from 'react';
import Board, { GameMode } from '@/components/Board';
import { Player } from '@/lib/othelloLogic';

export default function HomePage() {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [playerColor, setPlayerColor] = useState<Player>('black');

  const handleStartGame = (mode: GameMode, color?: Player) => {
    setGameMode(mode);
    if (color) {
      setPlayerColor(color);
    }
  };

  if (!gameMode) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-200 p-4">
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl text-center w-full max-w-md">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary-dark mb-10">Othello Game</h1>
          <div className="space-y-6">
            <button
              onClick={() => handleStartGame('pvp')}
              className="w-full px-6 py-3 bg-secondary hover:bg-secondary-dark text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-4 focus:ring-secondary-light"
            >
              Player vs Player
            </button>
            <div>
              <p className="text-neutral-700 mb-3 text-lg">Player vs CPU</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                <button
                  onClick={() => handleStartGame('pvc', 'black')}
                  className="w-full sm:w-auto flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-4 focus:ring-primary-light"
                >
                  Play as Black
                </button>
                <button
                  onClick={() => handleStartGame('pvc', 'white')}
                  className="w-full sm:w-auto flex-1 px-6 py-3 bg-neutral-700 hover:bg-neutral-900 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-4 focus:ring-neutral-300"
                >
                  Play as White
                </button>
              </div>
            </div>
          </div>
        </div>
         <footer className="mt-12 text-center text-neutral-700">
            <p>&copy; {new Date().getFullYear()} Othello Game. Created with Next.js.</p>
        </footer>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-200 p-2 sm:p-4">
       <button
        onClick={() => setGameMode(null)}
        className="absolute top-4 left-4 px-4 py-2 bg-neutral-700 hover:bg-neutral-800 text-white font-semibold rounded-lg shadow-md transition-colors"
      >
        &larr; Back to Menu
      </button>
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl">
        <Board gameMode={gameMode} playerColor={playerColor} />
      </div>
    </main>
  );
}
