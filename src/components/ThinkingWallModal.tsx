/**
 * Thinking Wall Reflection Scene for "El Mundo De Snoopy"
 * - The iconic Peanuts brick wall reflection space
 * - Sky watching with procedurally drifting clouds
 * - Peaceful contemplative quotes & direct access to Ari's Notebook
 */

import React, { useState, useEffect } from 'react';
import { audio } from '../engine/audio';

interface ThinkingWallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNotebook: () => void;
}

const PHILOSOPHICAL_THOUGHTS = [
  "A veces, el mayor logro del día es sentarse en un muro de ladrillos y dejar pasar las nubes.",
  "Esa nube de allí tiene la forma exacta de un beagle con gafas de sol sobrevolando París.",
  "No hace falta apresurarse. La vida en el vecindario ocurre al ritmo de una sonata de piano.",
  "La cometa que se quedó en el árbol no está perdida... solo decidió que las ramas eran su hogar.",
  "Si crees sinceramente en algo, como Linus en su Gran Calabaza, el mundo se vuelve más cálido.",
];

export const ThinkingWallModal: React.FC<ThinkingWallModalProps> = ({
  isOpen,
  onClose,
  onOpenNotebook,
}) => {
  const [thoughtIndex, setThoughtIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setThoughtIndex(Math.floor(Math.random() * PHILOSOPHICAL_THOUGHTS.length));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const nextThought = () => {
    audio.playPageFlip();
    setThoughtIndex((prev) => (prev + 1) % PHILOSOPHICAL_THOUGHTS.length);
  };

  return (
    <div
      id="thinking-wall-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-3 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="thinking-wall-container"
        className="relative flex h-[82vh] max-h-[640px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 shadow-2xl border-4 border-amber-900/40"
      >
        {/* Sky with Drifting Clouds */}
        <div className="relative flex-1 overflow-hidden p-6">
          {/* Animated Sky Clouds */}
          <div className="absolute top-8 left-10 text-4xl opacity-85 animate-pulse">☁️</div>
          <div className="absolute top-20 right-16 text-5xl opacity-90">☁️</div>
          <div className="absolute top-36 left-1/3 text-3xl opacity-75">☁️</div>

          {/* Flying Woodstock */}
          <div className="absolute top-16 right-1/3 text-2xl animate-bounce">🐥</div>

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between text-stone-800">
            <div className="flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-sm">
              <span>🧱</span>
              <span>El Muro de Pensar</span>
            </div>
            <button
              onClick={() => {
                audio.playButton(false);
                onClose();
              }}
              className="rounded-full bg-stone-900/80 px-3 py-1 text-xs font-bold text-white hover:bg-stone-900 transition-colors"
            >
              Bajar del muro [B]
            </button>
          </div>

          {/* Thought Box */}
          <div className="relative z-10 mx-auto mt-14 max-w-md rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur-sm border border-stone-200/80 text-center">
            <span className="text-2xl mb-2 block">💭</span>
            <p className="font-serif text-base italic text-stone-800 leading-relaxed">
              "{PHILOSOPHICAL_THOUGHTS[thoughtIndex]}"
            </p>
            <button
              onClick={nextThought}
              className="mt-3 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors"
            >
              Mirar otra nube... 🍃
            </button>
          </div>
        </div>

        {/* The Brick Wall Base where Ari and Friends Rest */}
        <div className="relative bg-[#a2592d] p-4 text-amber-100 border-t-8 border-[#e3d5ca]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <h4 className="font-bold text-sm text-white">Momento de contemplación</h4>
              <p className="text-xs text-amber-200/80">
                La brisa es suave y las hojas caen en silencio.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-wall-write"
                onClick={() => {
                  audio.playPageFlip();
                  onOpenNotebook();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-extrabold text-stone-950 shadow hover:bg-amber-400 active:scale-95 transition-all"
              >
                <span>✏️</span>
                <span>Escribir en Cuaderno</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
