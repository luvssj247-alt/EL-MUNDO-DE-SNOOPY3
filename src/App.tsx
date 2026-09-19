/**
 * "El Mundo De Snoopy" - Main Game Component
 * A cozy, peaceful 2D mobile life & exploration game with Ari and the Peanuts gang.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MAPS } from './engine/world';
import { INITIAL_PLAYER, updatePlayerAnimation } from './engine/player';
import { INITIAL_NPCS, updateNPCs } from './engine/npcs';
import { resolvePlayerMovement, findNearbyInteraction, NearbyTarget } from './engine/physics';
import { renderGame } from './engine/renderer';
import { audio } from './engine/audio';
import { weatherManager } from './engine/weather';
import { Direction, TimeOfDay, PlayerState, NPCState, GameMap, WeatherType } from './types';
import { TouchControls } from './components/TouchControls';
import { NotebookModal } from './components/NotebookModal';
import { DialogueModal } from './components/DialogueModal';
import { ThinkingWallModal } from './components/ThinkingWallModal';
import { HelpModal } from './components/HelpModal';
import { HUD } from './components/HUD';

export default function App() {
  // Canvas & Container Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Core Game State
  const [currentMapId, setCurrentMapId] = useState<string>('overworld');
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER);
  const [npcs, setNpcs] = useState<NPCState[]>(INITIAL_NPCS);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [weather, setWeather] = useState<WeatherType>(() => weatherManager.getWeather());
  const weatherRef = useRef<WeatherType>(weather);
  weatherRef.current = weather;
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => audio.getIsMuted());

  // Input & Movement State Ref (for 60fps loop)
  const inputDirRef = useRef<Direction | null>(null);
  const isRunningRef = useRef<boolean>(false);
  isRunningRef.current = isRunning;

  // Proximity & Interaction
  const [nearbyTarget, setNearbyTarget] = useState<NearbyTarget | null>(null);

  // Modals & Overlays
  const [activeDialogueNPC, setActiveDialogueNPC] = useState<NPCState | null>(null);
  const [isNotebookOpen, setIsNotebookOpen] = useState<boolean>(false);
  const [isThinkingWallOpen, setIsThinkingWallOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio start trigger on first interaction
  const hasStartedAudio = useRef<boolean>(false);
  const ensureAudioStarted = useCallback(() => {
    if (!hasStartedAudio.current) {
      hasStartedAudio.current = true;
      audio.startCozyMusic();
    }
  }, []);

  // Sync ambient sound to time of day
  useEffect(() => {
    audio.setTimeOfDay(timeOfDay);
  }, [timeOfDay]);

  // Current Map Data
  const currentMap: GameMap = MAPS[currentMapId] || MAPS.overworld;

  // Toast Notification helper
  const showToast = useCallback((msg: string, duration = 2500) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), duration);
  }, []);

  // Time Advancement
  const advanceTimeOfDay = useCallback(() => {
    setTimeOfDay((prev) => {
      const times: TimeOfDay[] = ['morning', 'afternoon', 'sunset', 'night'];
      const nextIdx = (times.indexOf(prev) + 1) % times.length;
      const next = times[nextIdx];
      const names = {
        morning: 'Mañana',
        afternoon: 'Tarde',
        sunset: 'Atardecer',
        night: 'Noche',
      };
      showToast(`Hora cambiada: ${names[next]}`);
      return next;
    });
  }, [showToast]);

  // Weather Cycling
  const handleCycleWeather = useCallback(() => {
    const next = weatherManager.cycleNextWeather();
    setWeather(next);
    const weatherNames: Record<WeatherType, string> = {
      sunny: 'Día soleado ☀️',
      windy: 'Viento y hojas flotando 🍃',
      cloudy: 'Cielo nublado ⛅',
      rainy: 'Lluvia suave 🌧️',
    };
    showToast(`Clima: ${weatherNames[next]}`);
  }, [showToast]);

  // Movement input from TouchControls / Keyboard
  const handleMove = useCallback((dir: Direction | null, running: boolean) => {
    ensureAudioStarted();
    inputDirRef.current = dir;
    setIsRunning(running);
  }, [ensureAudioStarted]);

  // Toggle running state
  const handleToggleRun = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  // Execute Button [A] (Primary: Talk / Share Writing)
  const handlePressA = useCallback(() => {
    ensureAudioStarted();
    if (activeDialogueNPC || isNotebookOpen || isThinkingWallOpen || isHelpOpen) return;

    if (nearbyTarget) {
      if (nearbyTarget.type === 'npc' && nearbyTarget.npc) {
        // Stop Ari walking and face the NPC
        setPlayer((prev) => ({ ...prev, isMoving: false }));
        setActiveDialogueNPC(nearbyTarget.npc);
        return;
      }
    }

    // Default: Open Notebook if nothing else in front
    setIsNotebookOpen(true);
  }, [ensureAudioStarted, activeDialogueNPC, isNotebookOpen, isThinkingWallOpen, isHelpOpen, nearbyTarget]);

  // Execute Button [B] (Secondary: Interact / Enter door / Sit / Rest)
  const handlePressB = useCallback(() => {
    ensureAudioStarted();
    if (activeDialogueNPC) {
      setActiveDialogueNPC(null);
      return;
    }
    if (isNotebookOpen) {
      setIsNotebookOpen(false);
      return;
    }
    if (isThinkingWallOpen) {
      setIsThinkingWallOpen(false);
      return;
    }
    if (isHelpOpen) {
      setIsHelpOpen(false);
      return;
    }

    if (!nearbyTarget) return;

    if (nearbyTarget.type === 'interactable' && nearbyTarget.interactable) {
      const item = nearbyTarget.interactable;

      // 1. Door / Doghouse Transition
      if ((item.type === 'door' || item.type === 'doghouse_entry') && item.targetMapId) {
        audio.playDoorChime();
        const targetMap = MAPS[item.targetMapId];
        if (targetMap) {
          const spawn = item.targetSpawnPos || targetMap.spawnPoint;
          setCurrentMapId(item.targetMapId);
          setPlayer((prev) => ({
            ...prev,
            x: spawn.x,
            y: spawn.y,
            isMoving: false,
            activity: 'standing',
          }));
          showToast(item.targetMapId === 'overworld' ? `Saliendo al vecindario... 🏡` : `Entrando a: ${targetMap.name} 🚪`);
        }
        return;
      }

      // 2. Thinking Wall
      if (item.type === 'thinking_wall') {
        audio.playPageFlip();
        setIsThinkingWallOpen(true);
        return;
      }

      // 3. Bed (Rest & advance time)
      if (item.type === 'bed') {
        audio.playDoorChime();
        advanceTimeOfDay();
        showToast('Has descansado un rato abrigada en la cama 🛏️');
        return;
      }

      // 4. Writing Desk
      if (item.type === 'desk') {
        audio.playPageFlip();
        setPlayer((prev) => ({ ...prev, activity: 'writing' }));
        setIsNotebookOpen(true);
        return;
      }

      // 5. Piano (Schroeder's toy piano or room piano)
      if (item.type === 'piano') {
        audio.playSchroederPiano();
        showToast('🎶 Tocando un fragmento de Beethoven en el piano');
        return;
      }

      // 6. Sitting on Chair / Bench / Sofa
      if (item.type === 'chair') {
        setPlayer((prev) => {
          const newActivity = prev.activity === 'sitting' ? 'standing' : 'sitting';
          showToast(newActivity === 'sitting' ? 'Te has sentado a descansar 🪑' : 'Te has levantado');
          return {
            ...prev,
            activity: newActivity,
            direction: item.facingDirection || prev.direction,
          };
        });
        return;
      }

      // 7. Hay Bale
      if (item.type === 'hay_bale') {
        setPlayer((prev) => {
          const newActivity = prev.activity === 'sitting' ? 'standing' : 'sitting';
          showToast(newActivity === 'sitting' ? 'Te has acomodado en el fardo de paja dorada 🌾' : 'Te has levantado del fardo');
          return {
            ...prev,
            activity: newActivity,
          };
        });
        return;
      }

      // 8. Typewriter
      if (item.type === 'typewriter') {
        audio.playTypewriterDing();
        setPlayer((prev) => ({ ...prev, activity: 'writing' }));
        setIsNotebookOpen(true);
        showToast('Escribiendo en la máquina de Snoopy: "Era una noche oscura y tormentosa..." ⌨️');
        return;
      }

      // 9. Record Player
      if (item.type === 'record_player') {
        audio.playSchroederPiano();
        showToast('🎶 Suena el vinilo de jazz suave de Vince Guaraldi en el tocadiscos');
        return;
      }

      // 10. Dock
      if (item.type === 'dock') {
        audio.playDoorChime();
        showToast('Te asomas al muelle de Daisy Hill. El agua cristalina refleja el cielo 🦆');
        return;
      }

      // 11. Tea Kettle
      if (item.type === 'tea_kettle') {
        audio.playDoorChime();
        showToast('Te has servido una taza de té humeante con canela ☕');
        return;
      }

      // 12. Vanity Mirror
      if (item.type === 'vanity_mirror') {
        audio.playPageFlip();
        showToast('Te miras al gran espejo de Lucy: ¡lista para un día genial! ✨');
        return;
      }

      // 13. Chalkboard
      if (item.type === 'chalkboard') {
        audio.playPageFlip();
        showToast('Pizarra escolar: "2 + 2 = 4" y con tiza blanca: "¡Bienvenida Ari!" 🏫');
        return;
      }

      // 14. Billiards
      if (item.type === 'billiards') {
        audio.playDoorChime();
        showToast('Das un suave golpe de taco y embocas la bola en la tronera 🎱');
        return;
      }

      // 7. General Examination
      if (item.description) {
        showToast(`${item.name}: ${item.description}`, 3500);
      }
    }
  }, [
    ensureAudioStarted,
    activeDialogueNPC,
    isNotebookOpen,
    isThinkingWallOpen,
    isHelpOpen,
    nearbyTarget,
    advanceTimeOfDay,
    showToast,
  ]);

  // Main 60FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let footstepCounter = 0;

    const loop = (currentTime: number) => {
      const deltaMs = Math.min(currentTime - lastTime, 100);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (canvas && ctx) {
        // 1. Process Player Input & Physics
        const dir = inputDirRef.current;
        const anyModalOpen =
          activeDialogueNPC !== null ||
          isNotebookOpen ||
          isThinkingWallOpen ||
          isHelpOpen;

        const isMoving = dir !== null && !anyModalOpen;
        const currentRunning = isRunningRef.current;

        setPlayer((prevPlayer) => {
          let updated = prevPlayer;

          if (isMoving && dir) {
            // Stand up if sitting
            if (updated.activity === 'sitting' || updated.activity === 'writing') {
              updated = { ...updated, activity: 'standing' };
            }

            const speed = currentRunning ? 3.2 : 1.9;
            const velocity = {
              down: { x: 0, y: speed },
              up: { x: 0, y: -speed },
              left: { x: -speed, y: 0 },
              right: { x: speed, y: 0 },
            }[dir];

            const newPos = resolvePlayerMovement(
              { x: updated.x, y: updated.y },
              velocity,
              { width: updated.width, height: 14 }, // Feet hitbox
              { width: currentMap.width, height: currentMap.height },
              currentMap.obstacles,
              npcs,
              currentMap.id
            );

            // Footstep sound cadence
            footstepCounter += deltaMs;
            if (footstepCounter > (currentRunning ? 220 : 340)) {
              footstepCounter = 0;
              const inPuddle = weatherManager.isEntityInPuddle(newPos.x, newPos.y, currentMap.isInterior);
              audio.playFootstep(currentMap.isInterior, inPuddle);
            }

            updated = {
              ...updated,
              x: newPos.x,
              y: newPos.y,
              direction: dir,
            };
          }

          return updatePlayerAnimation(updated, deltaMs, isMoving, currentRunning);
        });

        // 2. Update Weather Engine & Sync Natural Transitions
        weatherManager.update(deltaMs, currentMap.isInterior);
        const naturalWeather = weatherManager.getWeather();
        if (naturalWeather !== weatherRef.current) {
          weatherRef.current = naturalWeather;
          setWeather(naturalWeather);
          const weatherAnnouncements: Record<WeatherType, string> = {
            sunny: 'El cielo se despeja y brilla el sol ☀️',
            windy: 'Se levanta una suave brisa otoñal 🍃',
            cloudy: 'Las nubes cubren el cielo plácidamente ⛅',
            rainy: 'Empieza a caer una mansa lluvia 🌧️',
          };
          showToast(weatherAnnouncements[naturalWeather]);
        }

        // 3. Update NPCs autonomous routines
        setNpcs((prevNpcs) =>
          updateNPCs(prevNpcs, deltaMs, timeOfDay, currentMap.id, weatherRef.current)
        );

        // 4. Render complete scene
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderGame(
          ctx,
          canvas.width,
          canvas.height,
          currentMap,
          player,
          npcs,
          timeOfDay,
          weatherRef.current
        );
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentMap, npcs, player, timeOfDay, activeDialogueNPC, isNotebookOpen, isThinkingWallOpen, isHelpOpen]);

  // Update Proximity Interaction Detection
  useEffect(() => {
    const nearby = findNearbyInteraction(
      { x: player.x, y: player.y },
      player.direction,
      currentMap.interactables,
      npcs,
      currentMap.id
    );
    setNearbyTarget(nearby);
  }, [player.x, player.y, player.direction, currentMap, npcs]);

  // Canvas Responsive Sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <div
      id="game-viewport-container"
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden bg-stone-950 font-sans select-none"
      onClick={ensureAudioStarted}
      onTouchStart={ensureAudioStarted}
    >
      {/* 2D Canvas Stage */}
      <canvas
        id="game-canvas"
        ref={canvasRef}
        className="block h-full w-full pixelated"
      />

      {/* Floating HUD */}
      <HUD
        currentMapName={currentMap.name}
        timeOfDay={timeOfDay}
        weather={weather}
        onAdvanceTime={advanceTimeOfDay}
        onCycleWeather={handleCycleWeather}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(audio.toggleMute())}
        nearbyTarget={nearbyTarget}
        onOpenNotebook={() => setIsNotebookOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          id="hud-toast"
          className="pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 z-40 rounded-full bg-stone-900/90 px-4 py-2 text-xs font-bold text-amber-200 shadow-xl border border-amber-500/50 backdrop-blur-sm animate-fade-in"
        >
          {toastMessage}
        </div>
      )}

      {/* Virtual Touch & Keyboard Controls */}
      <TouchControls
        onMove={handleMove}
        onPressA={handlePressA}
        onPressB={handlePressB}
        onOpenNotebook={() => setIsNotebookOpen(true)}
        promptA={nearbyTarget?.promptA || (nearbyTarget?.type === 'npc' ? 'Hablar' : 'Escribir')}
        promptB={nearbyTarget?.promptB || 'Interactuar'}
        isRunning={isRunning}
        onToggleRun={handleToggleRun}
        disabled={
          activeDialogueNPC !== null ||
          isNotebookOpen ||
          isThinkingWallOpen ||
          isHelpOpen
        }
      />

      {/* Freeform Dialogue Modal */}
      {activeDialogueNPC && (
        <DialogueModal
          npc={activeDialogueNPC}
          isOpen={true}
          onClose={() => setActiveDialogueNPC(null)}
          locationName={currentMap.name}
          timeOfDay={timeOfDay}
          weather={weather}
          onOpenNotebook={() => setIsNotebookOpen(true)}
        />
      )}

      {/* Infinite Notebook Modal */}
      <NotebookModal
        isOpen={isNotebookOpen}
        onClose={() => {
          setIsNotebookOpen(false);
          if (player.activity === 'writing') {
            setPlayer((prev) => ({ ...prev, activity: 'standing' }));
          }
        }}
        nearbyNPCId={nearbyTarget?.type === 'npc' ? nearbyTarget.npc?.id : undefined}
      />

      {/* Thinking Wall Contemplation Modal */}
      <ThinkingWallModal
        isOpen={isThinkingWallOpen}
        onClose={() => setIsThinkingWallOpen(false)}
        onOpenNotebook={() => setIsNotebookOpen(true)}
      />

      {/* Help & Guide Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
