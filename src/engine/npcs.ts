/**
 * NPCs Engine for "El Mundo De Snoopy"
 * Faithful to Peanuts universe:
 * - Snoopy, Woodstock, Charlie Brown, Lucy, Linus, Sally, Schroeder, Peppermint Patty, Marcie
 * - Autonomous routines that change with Time of Day
 * - Faithful pixel-art rendering in all directions based on Peanuts sprites
 */

import { NPCId, NPCState, TimeOfDay, WeatherType } from '../types';
import { drawEntityDirectionalShadow } from './player';

export const INITIAL_NPCS: NPCState[] = [
  {
    id: 'snoopy',
    name: 'Snoopy',
    tagline: 'El beagle más ilustre, escritor y aviador',
    x: 925,
    y: 228, // Perched comfortably on his red doghouse roof!
    width: 26,
    height: 28,
    direction: 'down',
    isMoving: false,
    frame: 0,
    animationTimer: 0,
    currentMapId: 'overworld',
    activity: 'resting_on_roof',
    dialogueGreeting: '*(Snoopy mueve las orejas con alegría y hace una reverencia de gran novelista)*',
    autonomousTimer: 0,
  },
  {
    id: 'woodstock',
    name: 'Woodstock',
    tagline: 'El pequeño pajarito amarillo y fiel amigo',
    x: 955,
    y: 215,
    width: 14,
    height: 16,
    direction: 'down',
    isMoving: false,
    frame: 0,
    animationTimer: 0,
    currentMapId: 'overworld',
    activity: 'fluttering',
    dialogueGreeting: "|||'''! *¡Chirrip-chirp!* (Woodstock aletea feliz a tu alrededor)",
    autonomousTimer: 0,
  },
  {
    id: 'charlie_brown',
    name: 'Charlie Brown',
    tagline: 'Noble, sincero y perseverante',
    x: 640,
    y: 360,
    width: 24,
    height: 36,
    direction: 'down',
    isMoving: false,
    frame: 0,
    animationTimer: 0,
    currentMapId: 'overworld',
    activity: 'strolling',
    dialogueGreeting: '¡Cielos santos, Ari! Qué agradable verte pasear por aquí.',
    autonomousTimer: 0,
  },
  {
    id: 'lucy',
    name: 'Lucy van Pelt',
    tagline: 'Doctora en psicología (5¢) y dueña del campo',
    x: 830,
    y: 535, // Inside her psychiatry booth!
    width: 24,
    height: 36,
    direction: 'down',
    isMoving: false,
    frame: 0,
    animationTimer: 0,
    currentMapId: 'overworld',
    activity: 'tending_booth',
    dialogueGreeting: '¡Cinco centavos, por favor! Aunque para una amiga puedo escuchar tu consulta.',
    autonomousTimer: 0,
  },
  {
    id: 'linus',
    name: 'Linus van Pelt',
    tagline: 'El filósofo de la mantita azul',
    x: 310,
    y: 920, // Near the Great Pumpkin patch!
    width: 24,
    height: 36,
    direction: 'up',
    isMoving: false,
    frame: 0,
    animationTimer: 0,
    currentMapId: 'overworld',
    activity: 'holding_blanket',
    dialogueGreeting: 'Hola, Ari. Si tienes fe sincera, la Gran Calabaza traerá paz al mundo.',
    autonomousTimer: 0,
  },
  {
    id: 'sally',
    name: 'Sally Brown',
    tagline: 'Hermana de Charlie Brown y soñadora',
    x: 610,
    y: 430,
    width: 24,
    height: 34,
    direction: 'left',
    isMoving: false,
    frame: 0,
    animationTimer: 0,
    currentMapId: 'overworld',
    activity: 'looking_for_linus',
    dialogueGreeting: '¡Ari! ¿Has visto pasar a mi dulce amorcito Linus?',
    autonomousTimer: 0,
  },
  {
    id: 'schroeder',
    name: 'Schroeder',
    tagline: 'Maestro del piano de juguete devoto a Beethoven',
    x: 1008,
    y: 545, // Sitting at his toy piano!
    width: 24,
    height: 34,
    direction: 'down',
    isMoving: false,
    frame: 0,
    animationTimer: 0,
    currentMapId: 'overworld',
    activity: 'playing_piano',
    dialogueGreeting: 'Silencio, por favor... Beethoven está a punto de conmover los árboles.',
    autonomousTimer: 0,
  },
  {
    id: 'peppermint_patty',
    name: 'Peppermint Patty',
    tagline: 'Capitana deportiva y amiga leal',
    x: 680,
    y: 860, // At the baseball field!
    width: 24,
    height: 36,
    direction: 'right',
    isMoving: false,
    frame: 0,
    animationTimer: 0,
    currentMapId: 'overworld',
    activity: 'practicing_baseball',
    dialogueGreeting: '¡Eh, Ari! ¿Lista para batear unas bolas con el equipo?',
    autonomousTimer: 0,
  },
  {
    id: 'marcie',
    name: 'Marcie',
    tagline: 'Intelectual sensata de gafas redondas',
    x: 720,
    y: 860, // Beside Peppermint Patty
    width: 24,
    height: 34,
    direction: 'left',
    isMoving: false,
    frame: 0,
    animationTimer: 0,
    currentMapId: 'overworld',
    activity: 'strolling',
    dialogueGreeting: 'Buenos días, Ari. Estaba acompañando a la señorita Patty en el campo.',
    autonomousTimer: 0,
  },
];

/**
 * Autonomous NPC behaviors and schedule updates
 */
export function updateNPCs(
  npcs: NPCState[],
  deltaMs: number,
  timeOfDay: TimeOfDay,
  currentMapId: string,
  weather: WeatherType = 'sunny'
): NPCState[] {
  return npcs.map((npc) => {
    let { x, y, direction, isMoving, frame, animationTimer, activity, autonomousTimer, dialogueGreeting } = npc;

    animationTimer += deltaMs;
    if (animationTimer > 180) {
      animationTimer = 0;
      frame = (frame + 1) % 4;
    }

    // Dynamic dialogue greeting according to weather & character
    if (weather === 'rainy') {
      if (npc.id === 'charlie_brown') {
        dialogueGreeting = '¡Cielos santos, Ari! Es mejor resguardarse bajo el alero del porche mientras dure la lluvia.';
      } else if (npc.id === 'linus') {
        dialogueGreeting = 'La lluvia es buena para la tierra, Ari. Me protejo con mi mantita para no mojarme.';
      } else if (npc.id === 'sally') {
        dialogueGreeting = '¡Vaya chaparrón, Ari! Pero al menos aquí bajo techo estamos a salvo.';
      } else if (npc.id === 'peppermint_patty') {
        dialogueGreeting = '¡Partido suspendido por lluvia, Ari! Pero en el banquillo estamos secos.';
      } else if (npc.id === 'marcie') {
        dialogueGreeting = 'Buenos días, Ari. Un día lluvioso es perfecto para quedarse leyendo tranquila.';
      } else if (npc.id === 'schroeder') {
        dialogueGreeting = '¡Debo cuidar que no caiga humedad sobre las teclas de mi piano de Beethoven!';
      } else if (npc.id === 'lucy') {
        dialogueGreeting = '¡Cinco centavos, Ari! Mi puesto tiene tejado, así que sigo atendiendo.';
      } else if (npc.id === 'snoopy') {
        dialogueGreeting = '*(Snoopy reposa pacíficamente, escuchando el alegre ritmo de las gotas de lluvia)*';
      }
    } else if (weather === 'windy') {
      if (npc.id === 'charlie_brown') {
        dialogueGreeting = '¡Con este viento el árbol devorador de cometas debe de estar hambriento, Ari!';
      } else if (npc.id === 'linus') {
        dialogueGreeting = 'El viento hace ondear mi mantita como la capa de un filósofo errante, Ari.';
      } else if (npc.id === 'peppermint_patty') {
        dialogueGreeting = '¡Fíjate en esta brisa, Ari! ¡Menudos efectos tomarían los lanzamientos de béisbol!';
      } else if (npc.id === 'snoopy') {
        dialogueGreeting = '*(Snoopy siente el viento en sus orejas y se imagina volando en su Sopwith Camel)*';
      }
    } else if (weather === 'sunny') {
      if (npc.id === 'charlie_brown') {
        dialogueGreeting = '¡Qué día tan soleado y agradable, Ari! Dan ganas de dar un buen paseo.';
      } else if (npc.id === 'linus') {
        dialogueGreeting = 'Hola, Ari. Con este sol radiante, el huerto de calabazas se ve resplandeciente.';
      } else if (npc.id === 'peppermint_patty') {
        dialogueGreeting = '¡Eh, Ari! ¡Con este solazo es el día ideal para jugar al béisbol!';
      }
    }

    // Time of Day Map Scheduling: Characters occupy authentic Peanuts locations
    let scheduledMapId = 'overworld';
    let targetSchedX = x;
    let targetSchedY = y;
    let schedActivity = activity;

    if (timeOfDay === 'night') {
      if (npc.id === 'charlie_brown') {
        scheduledMapId = 'interior_charlie';
        targetSchedX = 250;
        targetSchedY = 220;
        schedActivity = 'watching_tv';
        dialogueGreeting = 'Buenas noches, Ari. Estoy descansando en el salón mirando la tele.';
      } else if (npc.id === 'sally') {
        scheduledMapId = 'interior_charlie';
        targetSchedX = 105;
        targetSchedY = 210;
        schedActivity = 'writing_note';
        dialogueGreeting = '¡Hola Ari! Estoy terminando una carta de amor a Linus antes de dormir.';
      } else if (npc.id === 'lucy') {
        scheduledMapId = 'interior_lucy_linus';
        targetSchedX = 100;
        targetSchedY = 140;
        schedActivity = 'at_vanity';
        dialogueGreeting = '¡Cinco centavos! De noche el puesto cierra, pero podemos charlar un rato, Ari.';
      } else if (npc.id === 'linus') {
        scheduledMapId = 'interior_lucy_linus';
        targetSchedX = 420;
        targetSchedY = 210;
        schedActivity = 'reading_philosophy';
        dialogueGreeting = 'Buenas noches, Ari. Estudiar a los clásicos arropado en mi mantita da mucha paz.';
      } else if (npc.id === 'schroeder') {
        scheduledMapId = 'interior_lucy_linus';
        targetSchedX = 230;
        targetSchedY = 220;
        schedActivity = 'playing_piano';
        dialogueGreeting = 'La sonata Claro de Luna de Beethoven suena con especial belleza por la noche.';
      } else if (npc.id === 'peppermint_patty') {
        scheduledMapId = 'interior_peppermint_patty';
        targetSchedX = 235;
        targetSchedY = 215;
        schedActivity = 'resting_on_couch';
        dialogueGreeting = '¡Menudo partidazo hoy, Ari! Estoy descansando en el sofá antes de dormir.';
      } else if (npc.id === 'marcie') {
        scheduledMapId = 'interior_marcie';
        targetSchedX = 110;
        targetSchedY = 200;
        schedActivity = 'studying_with_lamp';
        dialogueGreeting = 'Buenas noches, Ari. La lectura a la luz de la lámpara siempre aclara las ideas.';
      } else if (npc.id === 'snoopy') {
        scheduledMapId = 'interior_snoopy';
        targetSchedX = 485;
        targetSchedY = 160;
        schedActivity = 'playing_billiards';
        dialogueGreeting = '*(Snoopy sonríe en su sala subterránea secreta y te ofrece una galleta de perro)*';
      } else if (npc.id === 'woodstock') {
        scheduledMapId = 'interior_snoopy';
        targetSchedX = 488,
        targetSchedY = 205;
        schedActivity = 'listening_jazz';
        dialogueGreeting = "|||'''! *¡Chirp!* (Woodstock se mece al compás del disco de jazz)";
      }
    } else if (timeOfDay === 'sunset') {
      scheduledMapId = 'overworld';
      if (npc.id === 'charlie_brown') {
        targetSchedX = 470;
        targetSchedY = 520;
        schedActivity = 'at_thinking_wall';
        dialogueGreeting = 'El atardecer desde el muro de ladrillos siempre me hace reflexionar sobre la vida, Ari.';
      } else if (npc.id === 'linus') {
        targetSchedX = 505;
        targetSchedY = 520;
        schedActivity = 'at_thinking_wall';
        dialogueGreeting = 'Contemplar la puesta de sol con la mantita es el mejor bálsamo para el espíritu, Ari.';
      }
    } else {
      // Morning & afternoon overworld baseline
      scheduledMapId = 'overworld';
    }

    // If map changed due to schedule, teleport to designated location
    if (npc.currentMapId !== scheduledMapId) {
      return {
        ...npc,
        currentMapId: scheduledMapId,
        x: targetSchedX,
        y: targetSchedY,
        activity: schedActivity,
        isMoving: false,
        direction: 'down',
        frame,
        animationTimer,
        dialogueGreeting,
      };
    }

    // Special fixed activities that don't wander randomly
    if (schedActivity === 'playing_piano' || schedActivity === 'tending_booth' || schedActivity === 'resting_on_roof' || schedActivity === 'at_thinking_wall') {
      return { ...npc, frame, animationTimer, dialogueGreeting, activity: schedActivity };
    }

    // Rain sheltering logic in overworld
    if (weather === 'rainy' && currentMapId === 'overworld') {
      let targetX = x;
      let targetY = y;

      if (npc.id === 'charlie_brown') {
        targetX = 480;
        targetY = 340;
      } else if (npc.id === 'linus') {
        targetX = 515;
        targetY = 340;
      } else if (npc.id === 'sally') {
        targetX = 450;
        targetY = 340;
      } else if (npc.id === 'peppermint_patty') {
        targetX = 640;
        targetY = 840;
      } else if (npc.id === 'marcie') {
        targetX = 670;
        targetY = 840;
      }

      const dist = Math.hypot(targetX - x, targetY - y);
      if (dist > 12) {
        isMoving = true;
        const dx = targetX - x;
        const dy = targetY - y;
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy > 0 ? 'down' : 'up';
        }
        x += (dx / dist) * 0.7;
        y += (dy / dist) * 0.7;
        return {
          ...npc,
          x,
          y,
          direction,
          isMoving,
          frame,
          animationTimer,
          dialogueGreeting,
          activity: schedActivity,
        };
      } else {
        isMoving = false;
        direction = 'down';
        return {
          ...npc,
          isMoving,
          direction,
          frame,
          animationTimer,
          dialogueGreeting,
          activity: schedActivity,
        };
      }
    }

    // Gentle wandering AI for active characters
    autonomousTimer += deltaMs;
    if (autonomousTimer > 2500 + Math.sin(x) * 1000) {
      autonomousTimer = 0;
      const roll = Math.random();

      if (roll < 0.35) {
        // Stop and look around
        isMoving = false;
        const dirs: ('down' | 'up' | 'left' | 'right')[] = ['down', 'up', 'left', 'right'];
        direction = dirs[Math.floor(Math.random() * dirs.length)];
      } else if (roll < 0.75) {
        // Take a gentle stroll in a direction
        isMoving = true;
        const dirs: ('down' | 'up' | 'left' | 'right')[] = ['down', 'up', 'left', 'right'];
        direction = dirs[Math.floor(Math.random() * dirs.length)];
      } else {
        isMoving = false;
      }
    }

    // Move gently if moving (small steps, bounded)
    if (isMoving) {
      const speed = 0.6;
      if (direction === 'down') y += speed;
      else if (direction === 'up') y -= speed;
      else if (direction === 'left') x -= speed;
      else if (direction === 'right') x += speed;
    }

    return {
      ...npc,
      x,
      y,
      direction,
      isMoving,
      frame,
      animationTimer,
      autonomousTimer,
      dialogueGreeting,
      activity: schedActivity,
    };
  });
}

/**
 * Procedural Pixel-Art Rendering for all 9 Peanuts Characters
 * Directly based on Peanuts visual design from the user's uploaded sprite sheet!
 */
/**
 * High-Fidelity 2D Illustration Rendering for all 9 Peanuts Characters
 * Directly based on Charles Schulz's timeless aesthetic and authentic character details!
 */
export function drawNPC(
  ctx: CanvasRenderingContext2D,
  npc: NPCState,
  renderX: number,
  renderY: number,
  weather: WeatherType = 'sunny',
  isInterior = false,
  timeOfDay: TimeOfDay = 'morning'
) {
  const isRoofResting = npc.activity === 'resting_on_roof';

  // Ground directional shadow (unless lying on top of the doghouse roof)
  if (!isRoofResting) {
    drawEntityDirectionalShadow(
      ctx,
      Math.round(renderX),
      Math.round(renderY) + 16,
      npc.width * 0.48,
      4.8,
      timeOfDay,
      isInterior
    );
  }

  ctx.save();
  ctx.translate(Math.round(renderX), Math.round(renderY));

  const { direction, frame, isMoving } = npc;

  // Gentle idle breathing oscillation
  const now = Date.now();
  const breathe = !isMoving ? Math.sin((now + npc.id.length * 300) / 600) * 0.5 : 0;
  const bob = isMoving ? (frame === 1 || frame === 3 ? -1.5 : 0) : breathe;
  ctx.translate(0, bob);

  // Rain umbrella accessory when walking outside
  if (weather === 'rainy' && !isInterior && !isRoofResting) {
    ctx.save();
    let umbrellaColor = '#ffd166'; // Charlie Brown yellow
    if (npc.id === 'marcie') umbrellaColor = '#118ab2';
    if (npc.id === 'peppermint_patty') umbrellaColor = '#06d6a0';
    if (npc.id === 'snoopy') umbrellaColor = '#ef476f';
    if (npc.id === 'lucy') umbrellaColor = '#0077b6';
    if (npc.id === 'sally') umbrellaColor = '#f72585';

    if (npc.id !== 'linus') {
      // Umbrella pole & canopy
      ctx.strokeStyle = '#2b2a33';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(2, 2);
      ctx.lineTo(2, -30);
      ctx.stroke();

      // Curved wooden handle
      ctx.strokeStyle = '#8b5a2b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0.5, 4, 2.5, 0, Math.PI);
      ctx.stroke();

      // Canopy
      ctx.fillStyle = umbrellaColor;
      ctx.beginPath();
      ctx.arc(2, -30, 18, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();

      // Rim highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(2, -30, 18, Math.PI, 0, false);
      ctx.stroke();

      // Tip
      ctx.fillStyle = '#ffb703';
      ctx.fillRect(1, -50, 2, 3);
    }
    ctx.restore();
  }

  const flip = direction === 'left';
  if (flip) ctx.scale(-1, 1);

  switch (npc.id) {
    case 'snoopy':
      drawSnoopySprite(ctx, npc, direction, frame);
      break;
    case 'woodstock':
      drawWoodstockSprite(ctx, npc, direction, frame);
      break;
    case 'charlie_brown':
      drawCharlieBrownSprite(ctx, direction, frame, isMoving);
      break;
    case 'lucy':
      drawLucySprite(ctx, direction, frame, isMoving);
      break;
    case 'linus':
      drawLinusSprite(ctx, direction, frame, isMoving);
      break;
    case 'sally':
      drawSallySprite(ctx, direction, frame, isMoving);
      break;
    case 'schroeder':
      drawSchroederSprite(ctx, npc, direction, frame);
      break;
    case 'peppermint_patty':
      drawPeppermintPattySprite(ctx, direction, frame, isMoving);
      break;
    case 'marcie':
      drawMarcieSprite(ctx, direction, frame, isMoving);
      break;
  }

  ctx.restore();
}

// 1. SNOOPY (The beloved beagle)
function drawSnoopySprite(
  ctx: CanvasRenderingContext2D,
  npc: NPCState,
  direction: string,
  frame: number
) {
  const white = '#fcfcfc';
  const whiteShade = '#e6e6ee';
  const black = '#18171e';
  const redCollar = '#d90429';
  const goldTag = '#ffd166';

  if (npc.activity === 'resting_on_roof') {
    // Snoopy peacefully resting on top of his doghouse roof
    const chestBreathe = Math.sin(Date.now() / 700) * 0.6;

    // Body lying flat with rounded belly
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.roundRect(-14, 0 - chestBreathe, 28, 9 + chestBreathe, 4);
    ctx.fill();

    // Belly shade
    ctx.fillStyle = whiteShade;
    ctx.beginPath();
    ctx.roundRect(-13, 5, 26, 4, 2);
    ctx.fill();

    // Head tilted back toward sky
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.roundRect(8, -7 - chestBreathe, 12, 9, 4);
    ctx.fill();

    // Cute rounded snout and black button nose
    ctx.beginPath();
    ctx.arc(19, -5 - chestBreathe, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.arc(20.5, -5 - chestBreathe, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Nose highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, -6 - chestBreathe, 0.8, 0.8);

    // Peaceful sleeping curved eye line (smile curve)
    ctx.strokeStyle = black;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(14, -4 - chestBreathe, 1.8, 0.2 * Math.PI, 0.8 * Math.PI, false);
    ctx.stroke();

    // Floppy black ear draping down over the roof slope
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.roundRect(7, -3, 6, 11, 3);
    ctx.fill();

    // Red Collar with golden tag
    ctx.fillStyle = redCollar;
    ctx.beginPath();
    ctx.roundRect(7, 1 - chestBreathe, 2.5, 8, 1);
    ctx.fill();

    ctx.fillStyle = goldTag;
    ctx.beginPath();
    ctx.arc(8, 7 - chestBreathe, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Paws tucked together on stomach
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.roundRect(-8, -4 - chestBreathe, 5, 6, 2.5);
    ctx.roundRect(-2, -4 - chestBreathe, 5, 6, 2.5);
    ctx.fill();

    // Back paws resting at tail end
    ctx.beginPath();
    ctx.roundRect(-15, 2, 5, 6, 2);
    ctx.fill();
    return;
  }

  // Walking & Standing Snoopy
  const isSide = direction === 'left' || direction === 'right';
  const isUp = direction === 'up';

  // Feet / Paws
  ctx.fillStyle = white;
  ctx.beginPath();
  ctx.roundRect(-7, 9, 6, 8, 3);
  ctx.roundRect(1, 9, 6, 8, 3);
  ctx.fill();

  ctx.fillStyle = whiteShade;
  ctx.fillRect(-7, 14, 6, 2);
  ctx.fillRect(1, 14, 6, 2);

  // White Torso
  ctx.fillStyle = white;
  ctx.beginPath();
  ctx.roundRect(-8, -5, 16, 15, 5);
  ctx.fill();

  // Red Collar with Golden round tag
  ctx.fillStyle = redCollar;
  ctx.beginPath();
  ctx.roundRect(-8, -6, 16, 3, 1.5);
  ctx.fill();

  ctx.fillStyle = goldTag;
  ctx.beginPath();
  ctx.arc(0, -3, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = white;
  if (isSide) {
    // Side profile: iconic long curved beagle snout!
    ctx.beginPath();
    ctx.roundRect(-5, -19, 18, 14, 6);
    ctx.arc(9, -13, 4, 0, Math.PI * 2);
    ctx.fill();

    // Black button nose on snout tip
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.arc(12.5, -14, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, -15, 0.8, 0.8);

    // Cute dot eye
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.arc(3, -15, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Gentle smile
    ctx.strokeStyle = black;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(5, -10, 2.5, 0.1, 0.7 * Math.PI);
    ctx.stroke();

    // Floppy black ear hanging down
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.roundRect(-7, -18, 6, 14, 3);
    ctx.fill();

    // Little wagging tail
    const tailWag = Math.sin(Date.now() / 200) * 2;
    ctx.strokeStyle = black;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-7, 3);
    ctx.quadraticCurveTo(-11 + tailWag, 0, -12, -4);
    ctx.stroke();
  } else if (isUp) {
    // Back view
    ctx.beginPath();
    ctx.roundRect(-9, -19, 18, 14, 6);
    ctx.fill();

    // Both black ears on sides
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.roundRect(-11, -17, 5, 13, 2.5);
    ctx.roundRect(6, -17, 5, 13, 2.5);
    ctx.fill();

    // Spot on back
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Front view
    ctx.beginPath();
    ctx.roundRect(-9, -19, 18, 14, 6);
    ctx.fill();

    // Nose
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.arc(0, -12, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.beginPath();
    ctx.arc(-4, -15, 1.5, 0, Math.PI * 2);
    ctx.arc(4, -15, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Ears on sides
    ctx.beginPath();
    ctx.roundRect(-11, -17, 4.5, 13, 2.5);
    ctx.roundRect(6.5, -17, 4.5, 13, 2.5);
    ctx.fill();
  }
}

// 2. WOODSTOCK (Tiny yellow bird)
function drawWoodstockSprite(
  ctx: CanvasRenderingContext2D,
  npc: NPCState,
  direction: string,
  frame: number
) {
  const yellow = '#ffd166';
  const yellowShade = '#f4a261';
  const black = '#18171e';
  const beakOrange = '#f77f00';
  const wingFlutter = (frame % 2 === 0 ? -1.5 : 0) + Math.sin(Date.now() / 150) * 0.8;

  ctx.translate(0, wingFlutter);

  // Tiny bird feet
  ctx.strokeStyle = '#bc6c25';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-2, 5);
  ctx.lineTo(-2, 8);
  ctx.moveTo(1, 5);
  ctx.lineTo(1, 8);
  ctx.stroke();

  // Feathery body
  ctx.fillStyle = yellow;
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing with flutter
  ctx.fillStyle = yellowShade;
  ctx.beginPath();
  ctx.ellipse(-2, 0, 3, 2, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Woodstock's signature spiky tuft of crest feathers
  ctx.fillStyle = yellow;
  ctx.beginPath();
  ctx.moveTo(-1, -6);
  ctx.lineTo(-3, -11);
  ctx.lineTo(0, -8);
  ctx.lineTo(2, -12);
  ctx.lineTo(3, -7);
  ctx.closePath();
  ctx.fill();

  // Round dark eye with sparkle
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.arc(2, -3, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(1.8, -3.5, 0.6, 0.6);

  // Beak
  ctx.fillStyle = beakOrange;
  ctx.beginPath();
  ctx.moveTo(4, -3);
  ctx.lineTo(7.5, -2);
  ctx.lineTo(4, -1);
  ctx.closePath();
  ctx.fill();
}

// 3. CHARLIE BROWN (The lovable blockhead)
function drawCharlieBrownSprite(
  ctx: CanvasRenderingContext2D,
  direction: string,
  frame: number,
  isMoving: boolean
) {
  const skin = '#f8b48b';
  const yellowShirt = '#f3c010';
  const yellowShadow = '#d4a300';
  const black = '#18171e';
  const brownShoe = '#704828';
  const redSock = '#c1121f';

  // Shoes & Socks
  const legStride = isMoving ? (frame === 1 ? -2.5 : frame === 3 ? 2.5 : 0) : 0;

  // Left Shoe & Sock
  ctx.fillStyle = redSock;
  ctx.fillRect(-7, 9 + (legStride > 0 ? -1 : 0), 5, 3);
  ctx.fillStyle = brownShoe;
  ctx.beginPath();
  ctx.roundRect(-8, 12 + (legStride > 0 ? -1 : 0), 7, 5, 2);
  ctx.fill();

  // Right Shoe & Sock
  ctx.fillStyle = redSock;
  ctx.fillRect(2, 9 + (legStride < 0 ? -1 : 0), 5, 3);
  ctx.fillStyle = brownShoe;
  ctx.beginPath();
  ctx.roundRect(1, 12 + (legStride < 0 ? -1 : 0), 7, 5, 2);
  ctx.fill();

  // Black shorts
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.roundRect(-8, 4, 16, 7, 2);
  ctx.fill();

  // Yellow Polo Shirt
  ctx.fillStyle = yellowShirt;
  ctx.beginPath();
  ctx.roundRect(-9, -7, 18, 12, 3);
  ctx.fill();

  // Shaded hem
  ctx.fillStyle = yellowShadow;
  ctx.fillRect(-9, 3, 18, 1.5);

  // Iconic Bold Black Chevron Zig-Zag band wrapping around
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.moveTo(-9, -1);
  ctx.lineTo(-6, 2);
  ctx.lineTo(-3, -1);
  ctx.lineTo(0, 2);
  ctx.lineTo(3, -1);
  ctx.lineTo(6, 2);
  ctx.lineTo(9, -1);
  ctx.lineTo(9, 1);
  ctx.lineTo(6, 4);
  ctx.lineTo(3, 1);
  ctx.lineTo(0, 4);
  ctx.lineTo(-3, 1);
  ctx.lineTo(-6, 4);
  ctx.lineTo(-9, 1);
  ctx.closePath();
  ctx.fill();

  // Perfectly spherical round head
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -16, 9.5, 0, Math.PI * 2);
  ctx.fill();

  // Round ears
  ctx.beginPath();
  ctx.arc(-9.5, -16, 2, 0, Math.PI * 2);
  ctx.arc(9.5, -16, 2, 0, Math.PI * 2);
  ctx.fill();

  if (direction === 'up') {
    // Back of head: little single back curl
    ctx.strokeStyle = black;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -24, 2, 0.2 * Math.PI, 1.1 * Math.PI);
    ctx.stroke();
  } else {
    // Face: Eyes, shy smile & iconic front curl
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.arc(-4, -16, 1.4, 0, Math.PI * 2);
    ctx.arc(4, -16, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Gentle curved nose
    ctx.strokeStyle = '#c6734c';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -14, 1.5, 0, Math.PI);
    ctx.stroke();

    // Shy signature smile
    ctx.strokeStyle = black;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -11, 2.5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Charles Schulz single forehead curl
    ctx.strokeStyle = black;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-1, -22);
    ctx.quadraticCurveTo(2, -26, 0, -27);
    ctx.stroke();
  }
}

// 4. LUCY VAN PELT (Confident, blue dress, saddle shoes)
function drawLucySprite(
  ctx: CanvasRenderingContext2D,
  direction: string,
  frame: number,
  isMoving: boolean
) {
  const skin = '#f8b48b';
  const blue = '#1d4ed8';
  const blueShade = '#1e3a8a';
  const black = '#18171e';
  const white = '#f8f8fa';

  // Saddle shoes (White leather with black saddle strap)
  ctx.fillStyle = white;
  ctx.beginPath();
  ctx.roundRect(-8, 12, 7, 5, 2);
  ctx.roundRect(1, 12, 7, 5, 2);
  ctx.fill();

  ctx.fillStyle = black;
  ctx.fillRect(-6, 12, 3, 5);
  ctx.fillRect(3, 12, 3, 5);

  // Royal Blue Dress with ruffled flared skirt
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(6, -6);
  ctx.lineTo(10, 11);
  ctx.lineTo(-10, 11);
  ctx.closePath();
  ctx.fill();

  // Skirt hem shadow
  ctx.fillStyle = blueShade;
  ctx.fillRect(-10, 9, 20, 2);

  // Puffed short sleeves
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.arc(-7, -4, 3, 0, Math.PI * 2);
  ctx.arc(7, -4, 3, 0, Math.PI * 2);
  ctx.fill();

  // White Peter Pan collar
  ctx.fillStyle = white;
  ctx.beginPath();
  ctx.arc(-2.5, -6, 2.5, 0, Math.PI);
  ctx.arc(2.5, -6, 2.5, 0, Math.PI);
  ctx.fill();

  // Head
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -16, 8.5, 0, Math.PI * 2);
  ctx.fill();

  // Voluminous black wavy bob hair
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.arc(0, -19, 9.5, Math.PI, 0, false);
  ctx.roundRect(-11, -19, 5, 12, 2.5);
  ctx.roundRect(6, -19, 5, 12, 2.5);
  ctx.fill();

  // Scalloped vintage curls
  ctx.beginPath();
  ctx.arc(-8, -10, 2.5, 0, Math.PI * 2);
  ctx.arc(8, -10, 2.5, 0, Math.PI * 2);
  ctx.fill();

  if (direction !== 'up') {
    // Expressive confident eyes & smirk
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.arc(-4, -16, 1.5, 0, Math.PI * 2);
    ctx.arc(4, -16, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = black;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(1, -12, 3, 0.1 * Math.PI, 0.7 * Math.PI);
    ctx.stroke();
  }
}

// 5. LINUS (Philosopher, red/black stripes, iconic blue blanket)
function drawLinusSprite(
  ctx: CanvasRenderingContext2D,
  direction: string,
  frame: number,
  isMoving: boolean
) {
  const skin = '#f8b48b';
  const red = '#dc2626';
  const black = '#18171e';
  const brownShoe = '#704828';
  const blueBlanket = '#38bdf8';
  const blueShadow = '#0284c7';

  // Shoes & Shorts
  ctx.fillStyle = brownShoe;
  ctx.beginPath();
  ctx.roundRect(-8, 12, 7, 5, 2);
  ctx.roundRect(1, 12, 7, 5, 2);
  ctx.fill();

  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.roundRect(-8, 4, 16, 7, 2);
  ctx.fill();

  // Red & Black Striped Shirt
  ctx.fillStyle = red;
  ctx.beginPath();
  ctx.roundRect(-9, -7, 18, 12, 3);
  ctx.fill();

  ctx.fillStyle = black;
  ctx.fillRect(-9, -4, 18, 1.8);
  ctx.fillRect(-9, 0, 18, 1.8);

  // Iconic Baby Blue Security Blanket draped over hand/shoulder with cloth ripples
  ctx.fillStyle = blueBlanket;
  ctx.beginPath();
  ctx.roundRect(5, -3, 8, 16, 3);
  ctx.fill();

  ctx.fillStyle = blueShadow;
  ctx.fillRect(7, 4, 6, 8);
  // Blanket corner fringe
  ctx.fillStyle = '#bae6fd';
  ctx.fillRect(5, 12, 8, 1.5);

  // Head
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -16, 8.5, 0, Math.PI * 2);
  ctx.fill();

  // Spiky soft hair tufts
  ctx.strokeStyle = '#5a3818';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-5, -23);
  ctx.lineTo(-7, -27);
  ctx.moveTo(-1, -24);
  ctx.lineTo(-1, -29);
  ctx.moveTo(3, -24);
  ctx.lineTo(4, -28);
  ctx.moveTo(6, -23);
  ctx.lineTo(8, -26);
  ctx.stroke();

  if (direction !== 'up') {
    // Thoughtful eyes
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.arc(-4, -16, 1.4, 0, Math.PI * 2);
    ctx.arc(3, -16, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Thumb near mouth
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(1, -12, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 6. SALLY (Blonde curls, pink polka dot dress)
function drawSallySprite(
  ctx: CanvasRenderingContext2D,
  direction: string,
  frame: number,
  isMoving: boolean
) {
  const skin = '#f8b48b';
  const pink = '#f43f5e';
  const blond = '#fde047';
  const black = '#18171e';
  const white = '#f8f8fa';

  // White shoes with ankle strap
  ctx.fillStyle = white;
  ctx.beginPath();
  ctx.roundRect(-7, 12, 6, 5, 2);
  ctx.roundRect(1, 12, 6, 5, 2);
  ctx.fill();

  // Pink Polka-Dot Dress with ruffle hem
  ctx.fillStyle = pink;
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(6, -6);
  ctx.lineTo(9, 11);
  ctx.lineTo(-9, 11);
  ctx.closePath();
  ctx.fill();

  // Polka dots
  ctx.fillStyle = white;
  ctx.beginPath();
  ctx.arc(-4, -2, 1.2, 0, Math.PI * 2);
  ctx.arc(3, -1, 1.2, 0, Math.PI * 2);
  ctx.arc(-2, 5, 1.2, 0, Math.PI * 2);
  ctx.arc(4, 6, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -16, 8.5, 0, Math.PI * 2);
  ctx.fill();

  // Blonde curls & bangs
  ctx.fillStyle = blond;
  ctx.beginPath();
  ctx.arc(0, -19, 9, Math.PI, 0, false);
  ctx.roundRect(-10, -19, 4, 11, 2);
  ctx.roundRect(6, -19, 4, 11, 2);
  ctx.fill();

  // Cute hair bow
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(-5, -24, 2.5, 0, Math.PI * 2);
  ctx.arc(-1, -24, 2.5, 0, Math.PI * 2);
  ctx.fill();

  if (direction !== 'up') {
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.arc(-4, -15, 1.4, 0, Math.PI * 2);
    ctx.arc(4, -15, 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = black;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -12, 2.2, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }
}

// 7. SCHROEDER (Beethoven virtuoso)
function drawSchroederSprite(
  ctx: CanvasRenderingContext2D,
  npc: NPCState,
  direction: string,
  frame: number
) {
  const skin = '#f8b48b';
  const purpleKnit = '#6b21a8';
  const black = '#18171e';
  const blond = '#eab308';

  // If at piano: render grand piano with gloss shine & Beethoven bust
  if (npc.activity === 'playing_piano') {
    // Lacquered black piano body
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.roundRect(-18, -4, 36, 18, 3);
    ctx.fill();

    // Piano legs
    ctx.fillStyle = '#262626';
    ctx.fillRect(-16, 14, 4, 7);
    ctx.fillRect(12, 14, 4, 7);

    // Ivory keys & Ebony sharps
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-15, 1, 30, 6);
    ctx.fillStyle = black;
    for (let k = -13; k < 14; k += 4) {
      ctx.fillRect(k, 1, 2, 3.5);
    }

    // Classical sheet music on music stand
    ctx.fillStyle = '#fefae0';
    ctx.fillRect(-6, -11, 12, 8);
    ctx.fillStyle = '#333333';
    ctx.fillRect(-4, -8, 8, 0.8);
    ctx.fillRect(-4, -6, 8, 0.8);

    // Marble bust of Beethoven
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(10, -8, 3.5, 0, Math.PI * 2);
    ctx.roundRect(8, -4, 4, 4, 1);
    ctx.fill();

    // Animated blue musical notes floating into the air
    const noteFloat = (frame * 3 + Date.now() / 200) % 15;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('♪', -10, -12 - noteFloat);
  }

  // Schroeder legs & pants
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-7, 6, 14, 8, 2);
  ctx.fill();

  // Purple striped sweater
  ctx.fillStyle = purpleKnit;
  ctx.beginPath();
  ctx.roundRect(-8, -7, 16, 13, 3);
  ctx.fill();

  // White stripes
  ctx.fillStyle = '#f8f8fa';
  ctx.fillRect(-8, -3, 16, 1.8);
  ctx.fillRect(-8, 2, 16, 1.8);

  // Head
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -16, 8.5, 0, Math.PI * 2);
  ctx.fill();

  // Blonde hair parted neatly back
  ctx.fillStyle = blond;
  ctx.beginPath();
  ctx.arc(0, -18, 9, Math.PI, 0, false);
  ctx.roundRect(-9, -18, 3, 9, 1.5);
  ctx.fill();

  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.arc(-3, -16, 1.4, 0, Math.PI * 2);
  ctx.arc(3, -16, 1.4, 0, Math.PI * 2);
  ctx.fill();
}

// 8. PEPPERMINT PATTY (Sporty, freckles, sandals)
function drawPeppermintPattySprite(
  ctx: CanvasRenderingContext2D,
  direction: string,
  frame: number,
  isMoving: boolean
) {
  const skin = '#f8b48b';
  const green = '#15803d';
  const auburnHair = '#78350f';
  const brownShorts = '#92400e';
  const black = '#18171e';

  // Criss-cross leather sandals with toes showing
  ctx.fillStyle = skin;
  ctx.fillRect(-7, 10, 5, 5);
  ctx.fillRect(2, 10, 5, 5);

  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-8, 14);
  ctx.lineTo(-2, 14);
  ctx.moveTo(1, 14);
  ctx.lineTo(7, 14);
  ctx.stroke();

  // Shorts
  ctx.fillStyle = brownShorts;
  ctx.beginPath();
  ctx.roundRect(-8, 4, 16, 7, 2);
  ctx.fill();

  // Green vertical striped polo
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.roundRect(-9, -7, 18, 12, 3);
  ctx.fill();

  ctx.fillStyle = '#f8f8fa';
  ctx.fillRect(-6, -7, 2, 12);
  ctx.fillRect(0, -7, 2, 12);
  ctx.fillRect(5, -7, 2, 12);

  // Head
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -16, 8.5, 0, Math.PI * 2);
  ctx.fill();

  // Textured chin-length auburn hair
  ctx.fillStyle = auburnHair;
  ctx.beginPath();
  ctx.arc(0, -19, 9, Math.PI, 0, false);
  ctx.roundRect(-10, -19, 4, 12, 2);
  ctx.roundRect(6, -19, 4, 12, 2);
  ctx.fill();

  if (direction !== 'up') {
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.arc(-4, -16, 1.4, 0, Math.PI * 2);
    ctx.arc(4, -16, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Freckles!
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-6, -14, 1, 1);
    ctx.fillRect(-4, -13, 1, 1);
    ctx.fillRect(4, -13, 1, 1);
    ctx.fillRect(6, -14, 1, 1);

    // Wide confident grin
    ctx.strokeStyle = black;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, -11, 3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }
}

// 9. MARCIE (Round spectacles, burgundy pleated dress)
function drawMarcieSprite(
  ctx: CanvasRenderingContext2D,
  direction: string,
  frame: number,
  isMoving: boolean
) {
  const skin = '#f8b48b';
  const burgundy = '#831843';
  const darkHair = '#1c1917';
  const black = '#18171e';

  // Shoes
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-7, 12, 6, 5, 2);
  ctx.roundRect(1, 12, 6, 5, 2);
  ctx.fill();

  // Burgundy dress
  ctx.fillStyle = burgundy;
  ctx.beginPath();
  ctx.roundRect(-8, -6, 16, 18, 3);
  ctx.fill();

  // Head
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -16, 8.5, 0, Math.PI * 2);
  ctx.fill();

  // Neat dark bob with blunt straight bangs
  ctx.fillStyle = darkHair;
  ctx.beginPath();
  ctx.arc(0, -19, 9, Math.PI, 0, false);
  ctx.roundRect(-9, -19, 3.5, 12, 2);
  ctx.roundRect(5.5, -19, 3.5, 12, 2);
  ctx.fill();
  ctx.fillRect(-6, -21, 12, 4);

  if (direction !== 'up') {
    // Big round spectacles with white frame and glass reflection
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-4, -15, 3.2, 0, Math.PI * 2);
    ctx.arc(4, -15, 3.2, 0, Math.PI * 2);
    ctx.stroke();

    // Bridge between lenses
    ctx.beginPath();
    ctx.moveTo(-0.8, -15);
    ctx.lineTo(0.8, -15);
    ctx.stroke();

    // Eyes behind glass
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.arc(-4, -15, 1.2, 0, Math.PI * 2);
    ctx.arc(4, -15, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Glass glint highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5.5, -16.5);
    ctx.lineTo(-3.5, -14.5);
    ctx.moveTo(2.5, -16.5);
    ctx.lineTo(4.5, -14.5);
    ctx.stroke();

    // Gentle polite smile
    ctx.strokeStyle = black;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(0, -10, 2, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }
}

