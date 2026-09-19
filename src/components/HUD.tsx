/**
 * HUD & Overlay System for "El Mundo De Snoopy"
 * - Compact, non-intrusive Peanuts-styled top navigation
 * - Clock / Time of Day cycle controls
 * - Background cozy jazz music & ambient sound toggles
 * - Proximity interaction alert bubble
 */

import React from 'react';
import { TimeOfDay, WeatherType } from '../types';
import { NearbyTarget } from '../engine/physics';
import { audio } from '../engine/audio';

interface HUDProps {
  currentMapName: string;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  onAdvanceTime: () => void;
  onCycleWeather: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  nearbyTarget: NearbyTarget | null;
  onOpenNotebook: () => void;
  onOpenHelp: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  currentMapName,
  timeOfDay,
  weather,
  onAdvanceTime,
  onCycleWeather,
  isMuted,
  onToggleMute,
  nearbyTarget,
  onOpenNotebook,
  onOpenHelp,
}) => {
  const getTimeLabel = () => {
    switch (timeOfDay) {
      case 'morning':
        return { icon: '🌅', text: 'Mañana' };
      case 'afternoon':
        return { icon: '☀️', text: 'Tarde' };
      case 'sunset':
        return { icon: '🌇', text: 'Atardecer' };
      case 'night':
        return { icon: '🌙', text: 'Noche' };
    }
  };

  const getWeatherLabel = () => {
    switch (weather) {
      case 'sunny':
        return { icon: '☀️', text: 'Soleado' };
      case 'cloudy':
        return { icon: '⛅', text: 'Nublado' };
      case 'rainy':
        return { icon: '🌧️', text: 'Lluvia' };
      case 'windy':
        return { icon: '🍃', text: 'Viento' };
    }
  };

  const timeInfo = getTimeLabel();
  const weatherInfo = getWeatherLabel();

  return (
    <div id="game-hud-root" className="pointer-events-none fixed inset-x-0 top-0 z-30 p-2 sm:p-4 select-none">
      {/* Top Banner Row */}
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {/* Left: Location Banner */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-stone-900/80 px-3 py-1.5 sm:px-3.5 sm:py-2 text-stone-100 shadow-md backdrop-blur-sm border border-stone-700/50">
          <span className="text-base">🏡</span>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
              El Mundo de Snoopy
            </div>
            <div className="text-xs font-bold text-stone-100">{currentMapName}</div>
          </div>
        </div>

        {/* Proximity Interaction Pill (when near character or object) */}
        {nearbyTarget && (
          <div
            id="hud-interaction-pill"
            className="pointer-events-auto hidden sm:flex items-center gap-2 rounded-full bg-amber-400 px-4 py-1.5 text-stone-950 font-bold text-xs shadow-lg animate-bounce border border-amber-500"
          >
            <span>💡</span>
            <span>
              {nearbyTarget.promptA ? `[A] ${nearbyTarget.promptA}` : ''}
              {nearbyTarget.promptA && nearbyTarget.promptB ? '  •  ' : ''}
              {nearbyTarget.promptB ? `[B] ${nearbyTarget.promptB}` : ''}
            </span>
          </div>
        )}

        {/* Right: Quick Toggles (Weather, Time, Audio, Notebook, Help) */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Weather Cycler */}
          <button
            id="btn-hud-weather"
            type="button"
            onClick={() => {
              audio.playButton(false);
              onCycleWeather();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-stone-900/80 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-stone-200 shadow-md backdrop-blur-sm border border-stone-700/50 hover:bg-stone-800 transition-colors"
            title="Cambiar clima (Soleado / Viento / Nublado / Lluvia)"
          >
            <span>{weatherInfo.icon}</span>
            <span className="hidden sm:inline text-xs">{weatherInfo.text}</span>
          </button>

          {/* Time of Day Cycler */}
          <button
            id="btn-hud-time"
            type="button"
            onClick={() => {
              audio.playButton(false);
              onAdvanceTime();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-stone-900/80 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-stone-200 shadow-md backdrop-blur-sm border border-stone-700/50 hover:bg-stone-800 transition-colors"
            title="Avanzar momento del día (Mañana / Tarde / Atardecer / Noche)"
          >
            <span>{timeInfo.icon}</span>
            <span className="hidden sm:inline text-xs">{timeInfo.text}</span>
          </button>

          {/* Sound / Music Toggle */}
          <button
            id="btn-hud-audio"
            type="button"
            onClick={onToggleMute}
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-xs sm:text-sm shadow-md backdrop-blur-sm border transition-colors ${
              isMuted
                ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                : 'bg-stone-900/80 text-amber-300 border-stone-700/50 hover:bg-stone-800'
            }`}
            title={isMuted ? 'Activar sonido y música jazz' : 'Silenciar'}
          >
            {isMuted ? '🔇' : '🎵'}
          </button>

          {/* Notebook Quick Shortcut */}
          <button
            id="btn-hud-notebook"
            type="button"
            onClick={onOpenNotebook}
            className="flex h-8 sm:h-9 items-center gap-1.5 rounded-xl bg-amber-500 px-2.5 sm:px-3 text-xs font-bold text-stone-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all"
            title="Cuaderno de pensamientos de Ari"
          >
            <span>📖</span>
            <span className="hidden sm:inline">Cuaderno</span>
          </button>

          {/* Guide / Help Dialog */}
          <button
            id="btn-hud-help"
            type="button"
            onClick={onOpenHelp}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-stone-900/80 text-xs font-bold text-stone-300 shadow-md backdrop-blur-sm border border-stone-700/50 hover:bg-stone-800 transition-colors"
            title="Controles y guía del juego"
          >
            ❓
          </button>
        </div>
      </div>
    </div>
  );
};
