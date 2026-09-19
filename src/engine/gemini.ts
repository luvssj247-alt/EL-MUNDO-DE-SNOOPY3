/**
 * Client-Side Gemini Communication Engine
 * Proxies calls through the server-side /api/ endpoints to keep keys secure.
 */

import { NPCId, TimeOfDay, WeatherType } from '../types';
import { memoryManager } from './memory';

export async function askNPC(
  npcId: NPCId,
  message: string,
  history: { sender: string; text: string }[],
  location: string,
  timeOfDay: TimeOfDay,
  currentActivity: string,
  weather: WeatherType = 'sunny'
): Promise<{ reply: string; memoryNote?: string }> {
  try {
    const memory = memoryManager.getMemory(npcId);
    const memorySummary = memory.recentTopics.length
      ? `Ha hablado recientemente de: ${memory.recentTopics.join(', ')}.`
      : '';

    const weatherSpanish = {
      sunny: 'soleado y despejado',
      cloudy: 'nublado con brisa suave',
      rainy: 'lluvia suave con gotitas sobre el suelo',
      windy: 'ventoso con hojas otoñales flotando',
    }[weather];

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        npcId,
        message,
        history,
        memorySummary,
        location,
        timeOfDay,
        weather: weatherSpanish,
        currentActivity,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.memoryNote) {
      memoryManager.recordConversation(npcId, data.memoryNote);
    }
    return data;
  } catch (err) {
    console.warn('API chat fallback engaged', err);
    // Instant friendly character response
    return {
      reply: getClientFallbackReply(npcId, message),
      memoryNote: `Charla sincera con Ari.`,
    };
  }
}

export async function askNPCToExamineWriting(
  npcId: NPCId,
  title: string,
  category: string,
  content: string
): Promise<string> {
  try {
    const memory = memoryManager.getMemory(npcId);
    const memorySummary = memory.recentTopics.length
      ? `Temas previos recordados: ${memory.recentTopics.join(', ')}.`
      : '';

    const res = await fetch('/api/examine-writing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        npcId,
        title,
        category,
        content,
        memorySummary,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.reaction;
  } catch (err) {
    console.warn('API examine writing fallback engaged', err);
    return getClientFallbackReaction(npcId, title, category);
  }
}

function getClientFallbackReply(npcId: NPCId, message: string): string {
  switch (npcId) {
    case 'snoopy':
      return '*(Snoopy sonríe ampliamente, teclea unas frases en su máquina de escribir imaginaria y asiente con sus orejas)*';
    case 'woodstock':
      return "|||'''! *¡Pip-piip!* (Woodstock vuela en pequeños círculos amarillos y asiente con entusiasmo).";
    case 'charlie_brown':
      return '¡Cielos santos, Ari! Es verdad... charlar contigo aquí me da mucha tranquilidad. Me alegra que estés en el vecindario.';
    case 'lucy':
      return 'Bien dicho, Ari. La mayoría de la gente duda demasiado, pero tú tienes determinación. ¡Sigue así!';
    case 'linus':
      return 'Es una hermosa reflexión, Ari. Como suelo decir, el mundo necesita más paciencia sincera y comprensión.';
    case 'sally':
      return '¡Tienes toda la razón, Ari! Si todo el mundo pensara como nosotras, el colegio sería mucho más divertido.';
    case 'schroeder':
      return 'Tus palabras tienen una armonía muy agradable, Ari. Acompáñame a escuchar esta sonata.';
    case 'peppermint_patty':
      return '¡Así se habla, Ari! ¡Con esa actitud positiva vamos a ganar el próximo campeonato!';
    case 'marcie':
      return 'Es un honor compartir este momento con usted, Ari. Su presencia siempre ilumina el día.';
  }
}

function getClientFallbackReaction(
  npcId: NPCId,
  title: string,
  category: string
): string {
  switch (npcId) {
    case 'snoopy':
      return `*(Snoopy lee detenidamente "${title}", asiente como un laureado dramaturgo y le da una ovación con sus orejas)*`;
    case 'woodstock':
      return `|||''! ¡Pip! (Woodstock admira tu ${category.toLowerCase()} dando alegres saltitos sobre el borde del cuaderno).`;
    case 'charlie_brown':
      return `Me ha emocionado mucho, Ari. "${title}" tiene una ternura que solo alguien con un corazón puro puede escribir.`;
    case 'lucy':
      return `Debo admitir que tu ${category.toLowerCase()} "${title}" tiene mucha fuerza. ¡Cinco centavos de talento puro!`;
    case 'linus':
      return `Qué hermosa composición, Ari. Las palabras de "${title}" transmiten la misma paz que una tarde templada de otoño.`;
    case 'schroeder':
      return `La cadencia de "${title}" tiene un ritmo armónico impecable. Beethoven habría sentido orgullo de esta inspiración.`;
    case 'peppermint_patty':
      return `¡Vaya, Ari! ¡"${title}" tiene un ritmo arrollador! ¡Eres toda una campeona de las letras!`;
    case 'marcie':
      return `Una obra sumamente evocadora y bien elaborada, Ari. Gracias por confiar en mí para leerla.`;
    case 'sally':
      return `¡Qué bonito, Ari! Ojalá Linus me escribiera cosas tan dulces como "${title}".`;
  }
}
