/**
 * Mobile Touch Controls & Keyboard Bridge for "El Mundo De Snoopy"
 * - Responsive 4-direction D-Pad optimized for mobile thumbs
 * - Context-aware Button [A] and Button [B]
 * - Run toggle and Notebook quick-action
 * - Seamless keyboard fallbacks (WASD / Arrows, Z/Space for A, X/E for B, N for notebook, Shift for run)
 */

import React, { useEffect, useRef, useState } from 'react';
import { Direction } from '../types';
import { audio } from '../engine/audio';

interface TouchControlsProps {
  onMove: (dir: Direction | null, isRunning: boolean) => void;
  onPressA: () => void;
  onPressB: () => void;
  onOpenNotebook: () => void;
  promptA?: string;
  promptB?: string;
  isRunning: boolean;
  onToggleRun: () => void;
  disabled?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onPressA,
  onPressB,
  onOpenNotebook,
  promptA,
  promptB,
  isRunning,
  onToggleRun,
  disabled = false,
}) => {
  const [activeDir, setActiveDir] = useState<Direction | null>(null);
  const activeKeys = useRef<Set<string>>(new Set());

  // Handle Keyboard Controls
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      activeKeys.current.add(key);

      if (e.shiftKey) {
        if (!isRunning) onToggleRun();
      }

      if (key === 'n') {
        e.preventDefault();
        onOpenNotebook();
        return;
      }

      if (key === 'z' || key === ' ' || key === 'enter') {
        e.preventDefault();
        audio.playButton(true);
        onPressA();
        return;
      }

      if (key === 'x' || key === 'e' || key === 'escape') {
        e.preventDefault();
        audio.playButton(false);
        onPressB();
        return;
      }

      updateDirectionFromKeys();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      activeKeys.current.delete(e.key.toLowerCase());
      updateDirectionFromKeys();
    };

    const updateDirectionFromKeys = () => {
      const keys = activeKeys.current;
      let dir: Direction | null = null;

      if (keys.has('arrowup') || keys.has('w')) dir = 'up';
      else if (keys.has('arrowdown') || keys.has('s')) dir = 'down';
      else if (keys.has('arrowleft') || keys.has('a')) dir = 'left';
      else if (keys.has('arrowright') || keys.has('d')) dir = 'right';

      setActiveDir(dir);
      onMove(dir, isRunning);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [disabled, isRunning, onMove, onPressA, onPressB, onOpenNotebook, onToggleRun]);

  const handleTouchDir = (dir: Direction | null) => {
    if (disabled) return;
    setActiveDir(dir);
    onMove(dir, isRunning);
  };

  return (
    <div
      id="mobile-controls-root"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 select-none pb-4 pt-2 px-3 sm:px-6"
    >
      <div className="mx-auto flex max-w-lg items-end justify-between">
        {/* Left Side: Virtual D-Pad */}
        <div className="pointer-events-auto flex flex-col items-center">
          {/* D-Pad Container */}
          <div
            id="virtual-dpad"
            className="relative h-32 w-32 rounded-full bg-stone-900/50 p-2 shadow-lg backdrop-blur-sm border border-stone-700/40"
          >
            {/* UP */}
            <button
              id="btn-dpad-up"
              type="button"
              className={`absolute left-1/2 top-1.5 -translate-x-1/2 flex h-10 w-11 items-center justify-center rounded-t-lg bg-stone-800 text-stone-200 shadow active:bg-amber-600 transition-colors ${
                activeDir === 'up' ? 'bg-amber-600 text-white' : ''
              }`}
              onTouchStart={(e) => {
                e.preventDefault();
                handleTouchDir('up');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTouchDir(null);
              }}
              onMouseDown={() => handleTouchDir('up')}
              onMouseUp={() => handleTouchDir(null)}
              aria-label="Arriba"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 4l-7 8h14z" />
              </svg>
            </button>

            {/* DOWN */}
            <button
              id="btn-dpad-down"
              type="button"
              className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 flex h-10 w-11 items-center justify-center rounded-b-lg bg-stone-800 text-stone-200 shadow active:bg-amber-600 transition-colors ${
                activeDir === 'down' ? 'bg-amber-600 text-white' : ''
              }`}
              onTouchStart={(e) => {
                e.preventDefault();
                handleTouchDir('down');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTouchDir(null);
              }}
              onMouseDown={() => handleTouchDir('down')}
              onMouseUp={() => handleTouchDir(null)}
              aria-label="Abajo"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 20l7-8H5z" />
              </svg>
            </button>

            {/* LEFT */}
            <button
              id="btn-dpad-left"
              type="button"
              className={`absolute left-1.5 top-1/2 -translate-y-1/2 flex h-11 w-10 items-center justify-center rounded-l-lg bg-stone-800 text-stone-200 shadow active:bg-amber-600 transition-colors ${
                activeDir === 'left' ? 'bg-amber-600 text-white' : ''
              }`}
              onTouchStart={(e) => {
                e.preventDefault();
                handleTouchDir('left');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTouchDir(null);
              }}
              onMouseDown={() => handleTouchDir('left')}
              onMouseUp={() => handleTouchDir(null)}
              aria-label="Izquierda"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M4 12l8-7v14z" />
              </svg>
            </button>

            {/* RIGHT */}
            <button
              id="btn-dpad-right"
              type="button"
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 flex h-11 w-10 items-center justify-center rounded-r-lg bg-stone-800 text-stone-200 shadow active:bg-amber-600 transition-colors ${
                activeDir === 'right' ? 'bg-amber-600 text-white' : ''
              }`}
              onTouchStart={(e) => {
                e.preventDefault();
                handleTouchDir('right');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTouchDir(null);
              }}
              onMouseDown={() => handleTouchDir('right')}
              onMouseUp={() => handleTouchDir(null)}
              aria-label="Derecha"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20 12l-8 7V5z" />
              </svg>
            </button>

            {/* Center Pivot */}
            <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-900 border border-stone-700/60" />
          </div>

          {/* Run Toggle Button */}
          <button
            id="btn-toggle-run"
            type="button"
            onClick={onToggleRun}
            className={`mt-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md transition-all ${
              isRunning
                ? 'bg-amber-500 text-stone-900 ring-2 ring-amber-300'
                : 'bg-stone-800/80 text-stone-300 border border-stone-700/60'
            }`}
          >
            <span>{isRunning ? '🏃 Correr (On)' : '🚶 Caminar'}</span>
          </button>
        </div>

        {/* Right Side: Context Action Buttons [A] & [B] + Notebook */}
        <div className="pointer-events-auto flex flex-col items-end gap-3">
          {/* Quick Notebook Button */}
          <button
            id="btn-open-notebook"
            type="button"
            onClick={onOpenNotebook}
            className="flex items-center gap-2 rounded-xl bg-amber-100/95 px-3.5 py-2 text-stone-900 shadow-md border-2 border-amber-800/30 active:scale-95 transition-all"
            title="Abrir cuaderno de notas"
          >
            <span className="text-base">📖</span>
            <span className="font-bold text-xs tracking-wide">Cuaderno</span>
          </button>

          {/* Action Buttons A & B */}
          <div className="relative flex items-center gap-3">
            {/* Button B (Secondary / Interact / Sit / Enter) */}
            <div className="flex flex-col items-center">
              <button
                id="btn-action-b"
                type="button"
                onClick={() => {
                  audio.playButton(false);
                  onPressB();
                }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white font-extrabold text-xl shadow-lg border-2 border-rose-400/60 active:scale-95 active:bg-rose-700 transition-transform"
                aria-label="Botón B"
              >
                B
              </button>
              <span className="mt-1 max-w-[80px] text-center text-[10px] font-semibold text-stone-200 drop-shadow truncate">
                {promptB || 'Interactuar'}
              </span>
            </div>

            {/* Button A (Primary / Talk / Examine / Show) */}
            <div className="flex flex-col items-center">
              <button
                id="btn-action-a"
                type="button"
                onClick={() => {
                  audio.playButton(true);
                  onPressA();
                }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-stone-950 font-extrabold text-2xl shadow-xl border-2 border-amber-300 active:scale-95 active:bg-amber-600 transition-transform"
                aria-label="Botón A"
              >
                A
              </button>
              <span className="mt-1 max-w-[90px] text-center text-[11px] font-bold text-amber-200 drop-shadow truncate">
                {promptA || 'Hablar'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
