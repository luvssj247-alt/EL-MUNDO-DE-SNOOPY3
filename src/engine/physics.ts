/**
 * Physics and Collision Engine for "El Mundo De Snoopy"
 * - Real AABB collisions without teleportation or weird pushes
 * - Smooth sliding along walls, obstacles, fences, trees, and furniture
 * - Proximity detection for Button A (Talk / Show writing) and Button B (Interact / Sit / Rest)
 */

import { Hitbox, Position, Direction, MapObstacle, InteractableObject, NPCState } from '../types';

export function checkAABB(a: Hitbox, b: Hitbox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function resolvePlayerMovement(
  currentPos: Position,
  velocity: Position,
  playerHitboxSize: { width: number; height: number },
  mapBounds: { width: number; height: number },
  obstacles: MapObstacle[],
  npcs: NPCState[],
  currentMapId: string
): Position {
  let newX = currentPos.x;
  let newY = currentPos.y;

  // 1. Try X movement independently to allow sliding along vertical surfaces
  if (velocity.x !== 0) {
    const candidateX = currentPos.x + velocity.x;
    const testHitboxX: Hitbox = {
      x: candidateX - playerHitboxSize.width / 2,
      y: currentPos.y - playerHitboxSize.height / 2,
      width: playerHitboxSize.width,
      height: playerHitboxSize.height,
    };

    // Check map boundaries
    const inBoundsX =
      testHitboxX.x >= 8 &&
      testHitboxX.x + testHitboxX.width <= mapBounds.width - 8;

    // Check obstacle collision
    let collidesX = !inBoundsX;
    if (!collidesX) {
      for (const obs of obstacles) {
        if (checkAABB(testHitboxX, obs)) {
          collidesX = true;
          break;
        }
      }
    }

    // Check NPC collision (only NPCs in the current map)
    if (!collidesX) {
      for (const npc of npcs) {
        if (npc.currentMapId !== currentMapId) continue;
        const npcBox: Hitbox = {
          x: npc.x - npc.width / 2,
          y: npc.y - npc.height / 2,
          width: npc.width,
          height: npc.height,
        };
        if (checkAABB(testHitboxX, npcBox)) {
          collidesX = true;
          break;
        }
      }
    }

    if (!collidesX) {
      newX = candidateX;
    }
  }

  // 2. Try Y movement independently to allow sliding along horizontal surfaces
  if (velocity.y !== 0) {
    const candidateY = currentPos.y + velocity.y;
    const testHitboxY: Hitbox = {
      x: newX - playerHitboxSize.width / 2,
      y: candidateY - playerHitboxSize.height / 2,
      width: playerHitboxSize.width,
      height: playerHitboxSize.height,
    };

    // Check map boundaries
    const inBoundsY =
      testHitboxY.y >= 8 &&
      testHitboxY.y + testHitboxY.height <= mapBounds.height - 8;

    let collidesY = !inBoundsY;
    if (!collidesY) {
      for (const obs of obstacles) {
        if (checkAABB(testHitboxY, obs)) {
          collidesY = true;
          break;
        }
      }
    }

    if (!collidesY) {
      for (const npc of npcs) {
        if (npc.currentMapId !== currentMapId) continue;
        const npcBox: Hitbox = {
          x: npc.x - npc.width / 2,
          y: npc.y - npc.height / 2,
          width: npc.width,
          height: npc.height,
        };
        if (checkAABB(testHitboxY, npcBox)) {
          collidesY = true;
          break;
        }
      }
    }

    if (!collidesY) {
      newY = candidateY;
    }
  }

  return { x: newX, y: newY };
}

export interface NearbyTarget {
  type: 'npc' | 'interactable';
  npc?: NPCState;
  interactable?: InteractableObject;
  distance: number;
  promptA?: string;
  promptB?: string;
}

export function findNearbyInteraction(
  playerPos: Position,
  direction: Direction,
  interactables: InteractableObject[],
  npcs: NPCState[],
  currentMapId: string,
  maxDistance = 52
): NearbyTarget | null {
  let closestTarget: NearbyTarget | null = null;
  let minDistance = maxDistance;

  // Directional bias: prefer objects in front of the player
  const dirVector = {
    down: { x: 0, y: 1 },
    up: { x: 0, y: -1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  }[direction];

  // 1. Check NPCs first for Button A (Talk / Share writing)
  for (const npc of npcs) {
    if (npc.currentMapId !== currentMapId) continue;
    const dx = npc.x - playerPos.x;
    const dy = npc.y - playerPos.y;
    const dist = Math.hypot(dx, dy);

    if (dist < minDistance) {
      // Dot product to see if facing
      const dot = dx * dirVector.x + dy * dirVector.y;
      const effectiveDist = dot > 0 ? dist * 0.8 : dist; // preferential weighting if facing

      if (effectiveDist < minDistance) {
        minDistance = effectiveDist;
        closestTarget = {
          type: 'npc',
          npc,
          distance: dist,
          promptA: `Hablar con ${npc.name}`,
          promptB: undefined,
        };
      }
    }
  }

  // 2. Check Interactable Objects for Button B (Sit, Enter, Rest, Play Piano, Think)
  for (const item of interactables) {
    const itemCenterX = item.x + item.width / 2;
    const itemCenterY = item.y + item.height / 2;
    const dx = itemCenterX - playerPos.x;
    const dy = itemCenterY - playerPos.y;
    const dist = Math.hypot(dx, dy);

    if (dist < minDistance) {
      const dot = dx * dirVector.x + dy * dirVector.y;
      const effectiveDist = dot > 0 ? dist * 0.8 : dist;

      if (effectiveDist < minDistance) {
        minDistance = effectiveDist;

        let promptB = item.promptB;
        if (!promptB) {
          switch (item.type) {
            case 'door':
            case 'doghouse_entry':
              promptB = item.targetMapId === 'overworld' ? 'Salir al exterior' : 'Entrar';
              break;
            case 'chair':
              promptB = 'Sentarse';
              break;
            case 'bed':
              promptB = 'Descansar';
              break;
            case 'desk':
              promptB = 'Escribir';
              break;
            case 'piano':
              promptB = 'Tocar piano';
              break;
            case 'thinking_wall':
              promptB = 'Subir al muro';
              break;
            case 'psychiatry_booth':
              promptB = 'Consultar 5¢';
              break;
            case 'kite_tree':
              promptB = 'Mirar cometas';
              break;
            case 'pumpkin_patch':
              promptB = 'Esperar la Gran Calabaza';
              break;
            case 'dock':
              promptB = 'Mirar el estanque';
              break;
            case 'hay_bale':
              promptB = 'Descansar en la paja';
              break;
            case 'tea_kettle':
              promptB = 'Servir té caliente';
              break;
            case 'vanity_mirror':
              promptB = 'Mirarse al espejo';
              break;
            case 'chalkboard':
              promptB = 'Leer pizarra';
              break;
            case 'billiards':
              promptB = 'Jugar al billar';
              break;
            case 'record_player':
              promptB = 'Poner vinilo de jazz';
              break;
            case 'typewriter':
              promptB = 'Escribir novela';
              break;
            case 'trophy_case':
              promptB = 'Examinar trofeos';
              break;
            default:
              promptB = 'Examinar';
          }
        }

        closestTarget = {
          type: 'interactable',
          interactable: item,
          distance: dist,
          promptA: item.promptA,
          promptB,
        };
      }
    }
  }

  return closestTarget;
}
