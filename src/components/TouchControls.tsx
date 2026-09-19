import React, { useCallback, useEffect, useRef, useState } from 'react';
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

type Vector = { x: number; y: number };

/** Circular, analog thumbstick with a dead zone and pointer capture. */
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
  const stickRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const [knob, setKnob] = useState<Vector>({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const keys = useRef(new Set<string>());

  const emitVector = useCallback((vector: Vector) => {
    const magnitude = Math.hypot(vector.x, vector.y);
    if (magnitude < 0.16) {
      setKnob({ x: 0, y: 0 });
      onMove(null, isRunning);
      return;
    }
    const length = Math.min(magnitude, 1);
    const normalized = { x: (vector.x / magnitude) * length, y: (vector.y / magnitude) * length };
    setKnob(normalized);
    const direction: Direction = Math.abs(normalized.x) > Math.abs(normalized.y)
      ? normalized.x > 0 ? 'right' : 'left'
      : normalized.y > 0 ? 'down' : 'up';
    onMove(direction, isRunning);
  }, [isRunning, onMove]);

  const updateStick = useCallback((clientX: number, clientY: number) => {
    const element = stickRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const radius = rect.width / 2;
    emitVector({ x: (clientX - (rect.left + radius)) / radius, y: (clientY - (rect.top + radius)) / radius });
  }, [emitVector]);

  const releaseStick = useCallback(() => {
    pointerId.current = null;
    setActive(false);
    setKnob({ x: 0, y: 0 });
    onMove(null, isRunning);
  }, [isRunning, onMove]);

  useEffect(() => {
    if (disabled) {
      keys.current.clear();
      releaseStick();
    }
  }, [disabled, releaseStick]);

  useEffect(() => {
    const directionFromKeys = () => {
      const k = keys.current;
      let dir: Direction | null = null;
      if (k.has('arrowup') || k.has('w')) dir = 'up';
      else if (k.has('arrowdown') || k.has('s')) dir = 'down';
      else if (k.has('arrowleft') || k.has('a')) dir = 'left';
      else if (k.has('arrowright') || k.has('d')) dir = 'right';
      onMove(dir, isRunning);
    };
    const down = (event: KeyboardEvent) => {
      if (disabled || ['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) return;
      const key = event.key.toLowerCase();
      keys.current.add(key);
      if (key === 'n') { event.preventDefault(); onOpenNotebook(); }
      if (key === 'z' || key === ' ' || key === 'enter') { event.preventDefault(); audio.playButton(true); onPressA(); }
      if (key === 'x' || key === 'e' || key === 'escape') { event.preventDefault(); audio.playButton(false); onPressB(); }
      directionFromKeys();
    };
    const up = (event: KeyboardEvent) => { keys.current.delete(event.key.toLowerCase()); directionFromKeys(); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [disabled, isRunning, onMove, onOpenNotebook, onPressA, onPressB]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-4 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-end justify-between gap-4">
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          <div
            ref={stickRef}
            aria-label="Joystick circular"
            className={`relative h-32 w-32 touch-none rounded-full border border-white/20 bg-slate-950/55 shadow-2xl backdrop-blur-md ${disabled ? 'opacity-40' : ''}`}
            onPointerDown={(event) => {
              if (disabled) return;
              pointerId.current = event.pointerId;
              (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
              setActive(true);
              updateStick(event.clientX, event.clientY);
            }}
            onPointerMove={(event) => pointerId.current === event.pointerId && updateStick(event.clientX, event.clientY)}
            onPointerUp={releaseStick}
            onPointerCancel={releaseStick}
            onPointerLeave={(event) => pointerId.current === event.pointerId && releaseStick()}
          >
            <div className="absolute inset-5 rounded-full border border-white/10 bg-white/[0.04]" />
            <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/70 bg-gradient-to-br from-amber-300 to-orange-500 shadow-lg transition-transform duration-75" style={{ transform: `translate(calc(-50% + ${knob.x * 34}px), calc(-50% + ${knob.y * 34}px))` }}>
              <div className="absolute left-3 top-2 h-2 w-5 rounded-full bg-white/45" />
            </div>
            {active && <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-amber-300/50" />}
          </div>
          <button type="button" onClick={onToggleRun} className={`rounded-full px-3 py-1 text-[11px] font-bold shadow-lg ${isRunning ? 'bg-amber-400 text-slate-950' : 'bg-slate-900/80 text-slate-200'}`}>
            {isRunning ? '🏃 Correr' : '🚶 Caminar'}
          </button>
        </div>

        <div className="pointer-events-auto flex items-end gap-3">
          <button type="button" onClick={onOpenNotebook} className="rounded-2xl border border-amber-200/40 bg-amber-100/95 px-3 py-2 text-xs font-extrabold text-slate-900 shadow-xl active:scale-95">📖 <span className="hidden sm:inline">Cuaderno</span></button>
          <div className="flex items-end gap-2">
            <div className="flex flex-col items-center gap-1"><button type="button" onClick={() => { audio.playButton(false); onPressB(); }} className="h-14 w-14 rounded-full border-2 border-rose-300/60 bg-rose-600 text-xl font-black text-white shadow-xl active:scale-95">B</button><span className="max-w-20 truncate text-[10px] font-bold text-white drop-shadow">{promptB || 'Interactuar'}</span></div>
            <div className="flex flex-col items-center gap-1"><button type="button" onClick={() => { audio.playButton(true); onPressA(); }} className="h-16 w-16 rounded-full border-2 border-amber-200 bg-amber-400 text-2xl font-black text-slate-950 shadow-xl active:scale-95">A</button><span className="max-w-24 truncate text-[10px] font-bold text-amber-100 drop-shadow">{promptA || 'Hablar'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
