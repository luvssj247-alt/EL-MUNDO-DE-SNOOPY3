import { NPCId } from '../types';
import { memoryManager } from './memory';

const EVENT_POOL: Array<{ npc: NPCId; location: string; summary: string }> = [
  { npc: 'charlie_brown', location: 'montículo de béisbol', summary: 'Charlie practica un lanzamiento y mira hacia el campo con esperanza.' },
  { npc: 'linus', location: 'muro de pensar', summary: 'Linus se queda en silencio y reflexiona sobre el día.' },
  { npc: 'lucy', location: 'piano', summary: 'Lucy aprovecha el piano para intentar llamar la atención de Schroeder.' },
  { npc: 'sally', location: 'camino del barrio', summary: 'Sally vuelve a hablar de Linus con emoción.' },
  { npc: 'marcie', location: 'biblioteca', summary: 'Marcie observa tranquilamente un libro y murmura una idea útil.' },
  { npc: 'peppermint_patty', location: 'campo', summary: 'Patty se entrena con energía y habla del próximo partido.' },
  { npc: 'woodstock', location: 'tejado', summary: 'Woodstock da vueltas y se siente muy feliz con el viento.' },
  { npc: 'snoopy', location: 'caseta', summary: 'Snoopy imagina una gran aventura frente a su caseta.' },
  { npc: 'schroeder', location: 'piano', summary: 'Schroeder toca con más intensidad y se concentra en Beethoven.' },
];

export function triggerAutonomousNeighborhoodEvent() {
  const index = Math.floor(Math.random() * EVENT_POOL.length);
  const { npc, location, summary } = EVENT_POOL[index];

  memoryManager.recordWorldEvent({
    type: 'routine',
    actors: [npc],
    location,
    summary,
    importance: 5,
    isPublic: true,
    sourceNpc: npc,
  });

  memoryManager.recordSocialEvent(npc, summary, 'interpretation', 5);
}
