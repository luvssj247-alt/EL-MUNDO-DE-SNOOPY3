/**
 * World & Environment Canvas Renderer for "El Mundo De Snoopy"
 * High-Fidelity 2D Illustration Overhaul:
 * - Rich layered organic terrain: lush meadow grass with wild daisies and clovers
 * - Textured cobblestone and flagstone pathways with mortared stone pavers
 * - Volumetric architecture with clapboard siding, roof shingles, fascia boards, and porch lanterns
 * - The iconic Red Doghouse with authentic timber framing, shadow depth, and Snoopy's dish
 * - Charles Schulz Thinking Wall with running-bond brickwork and limestone coping
 * - Lucy's Psychiatry Booth, Kite-Eating Tree with fluttering kites, Schroeder's gazebo
 * - Daisy Hill Meadow Pond with shoreline ripples, depth gradients, and blooming water lilies
 * - Baseball diamond with clay dirt texture and canvas base bags
 * - Highly atmospheric time-of-day lighting (morning amber, afternoon golden sun, twilight coral, nocturnal indigo with lamp glow)
 */

import { GameMap, TimeOfDay, PlayerState, NPCState, WeatherType } from '../types';
import { drawAri } from './player';
import { drawNPC } from './npcs';
import { weatherManager } from './weather';

export function renderGame(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  map: GameMap,
  player: PlayerState,
  npcs: NPCState[],
  timeOfDay: TimeOfDay,
  weather: WeatherType = 'sunny'
) {
  // 1. Camera offset centered on player and clamped within map bounds
  const cameraX = Math.max(
    0,
    Math.min(map.width - canvasWidth, player.x - canvasWidth / 2)
  );
  const cameraY = Math.max(
    0,
    Math.min(map.height - canvasHeight, player.y - canvasHeight / 2)
  );

  ctx.save();
  ctx.translate(-Math.round(cameraX), -Math.round(cameraY));

  // 2. Base Floor & Scenery
  if (map.isInterior) {
    renderInteriorMap(ctx, map, timeOfDay);
  } else {
    renderOverworldMap(ctx, map, timeOfDay);
  }

  // 3. Render Puddles (if any from rain)
  if (!map.isInterior) {
    weatherManager.renderPuddles(ctx, map.width, map.height);
  }

  // 4. Base structures & interactables behind players
  renderInteractablesBase(ctx, map, timeOfDay);

  // 5. Dynamic Y-Sorted Entities (Player, NPCs, Ground Props)
  type Renderable = {
    y: number;
    draw: () => void;
  };

  const renderables: Renderable[] = [];

  // Add Ari
  renderables.push({
    y: player.y,
    draw: () => {
      drawAri(ctx, player, player.x, player.y, weather, map.isInterior, timeOfDay);
      // Ripple effect when walking inside a puddle
      if (
        player.isMoving &&
        !map.isInterior &&
        weatherManager.isEntityInPuddle(player.x, player.y)
      ) {
        ctx.save();
        ctx.strokeStyle = 'rgba(235, 245, 255, 0.75)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(player.x, player.y + 16, 9, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    },
  });

  // Add NPCs in this map
  npcs.forEach((npc) => {
    if (npc.currentMapId === map.id) {
      renderables.push({
        y: npc.y,
        draw: () => drawNPC(ctx, npc, npc.x, npc.y, weather, map.isInterior, timeOfDay),
      });
    }
  });

  // Sort by Y for correct top-down overlap
  renderables.sort((a, b) => a.y - b.y);
  renderables.forEach((r) => r.draw());

  // 6. Overhead Canopies & Foliage (Rendered in front of characters)
  renderSceneryCanopies(ctx, map, timeOfDay);

  // 7. Day / Sunset / Night Atmospheric Lighting Overlay
  renderAtmosphericLighting(ctx, map, timeOfDay, cameraX, cameraY, canvasWidth, canvasHeight);

  // 8. Dynamic Weather Effects (Raindrops, splash rings, wind leaves)
  weatherManager.renderWeatherEffects(ctx, cameraX, cameraY, canvasWidth, canvasHeight, map.isInterior);

  ctx.restore();
}

/**
 * High-Fidelity Overworld Map (Peanuts Neighborhood)
 */
function renderOverworldMap(ctx: CanvasRenderingContext2D, map: GameMap, timeOfDay: TimeOfDay) {
  // 1. Lush layered meadow grass
  const grassGrad = ctx.createLinearGradient(0, 0, 0, map.height);
  grassGrad.addColorStop(0, '#86b664');
  grassGrad.addColorStop(0.5, '#7cae58');
  grassGrad.addColorStop(1, '#72a34e');
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0, 0, map.width, map.height);

  // Soft field grass tufts & lawn texture
  ctx.fillStyle = '#6f9d45';
  for (let x = 24; x < map.width; x += 36) {
    for (let y = 24; y < map.height; y += 36) {
      const stagger = (x * 7 + y * 13) % 17;
      if (stagger > 8) {
        ctx.fillRect(x + stagger, y, 2, 4);
        ctx.fillRect(x + stagger - 2, y + 1, 2, 3);
        ctx.fillRect(x + stagger + 2, y + 1, 2, 3);
      }
    }
  }

  // Delicate wild daisies and white clover patches scattered across the grass
  ctx.fillStyle = '#f8f9fa';
  for (let d = 0; d < 80; d++) {
    const dx = (d * 173) % (map.width - 60) + 30;
    const dy = (d * 241) % (map.height - 60) + 30;
    // Don't draw over main paths
    if (Math.abs(dy - 518) > 35) {
      ctx.beginPath();
      ctx.arc(dx, dy, 1.8, 0, Math.PI * 2);
      ctx.arc(dx + 2, dy, 1.8, 0, Math.PI * 2);
      ctx.arc(dx - 2, dy, 1.8, 0, Math.PI * 2);
      ctx.arc(dx, dy + 2, 1.8, 0, Math.PI * 2);
      ctx.arc(dx, dy - 2, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = '#ffb703';
  for (let d = 0; d < 80; d++) {
    const dx = (d * 173) % (map.width - 60) + 30;
    const dy = (d * 241) % (map.height - 60) + 30;
    if (Math.abs(dy - 518) > 35) {
      ctx.beginPath();
      ctx.arc(dx, dy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Interlocking Flagstone & Cobblestone Path Network
  renderCobblestonePath(ctx, 304, 300, 304, 380, 36); // Ari's walkway down to road
  renderCobblestonePath(ctx, 650, 300, 650, 380, 36); // Charlie Brown's walkway down to road
  renderCobblestonePath(ctx, 895, 280, 895, 380, 30); // Snoopy's yard walkway down to road
  renderCobblestonePath(ctx, 1260, 320, 1260, 380, 42); // School walkway down to road
  renderCobblestonePath(ctx, 140, 360, 1680, 400, 42); // Top residential avenue

  renderCobblestonePath(ctx, 300, 590, 300, 660, 36); // Lucy & Linus walkway
  renderCobblestonePath(ctx, 1270, 590, 1270, 660, 36); // Patty's walkway
  renderCobblestonePath(ctx, 1570, 590, 1570, 660, 36); // Marcie's walkway
  renderCobblestonePath(ctx, 140, 640, 1680, 680, 42); // Mid neighborhood avenue

  renderCobblestonePath(ctx, 480, 380, 480, 660, 36); // North-south connecting street (West)
  renderCobblestonePath(ctx, 1080, 380, 1080, 660, 36); // North-south connecting street (East)

  // South pathways to Pumpkin patch, baseball diamond, pond and barn
  renderCobblestonePath(ctx, 280, 680, 280, 880, 32); // Path to Pumpkin patch
  renderCobblestonePath(ctx, 700, 680, 700, 810, 36); // Path to Baseball diamond
  renderCobblestonePath(ctx, 1190, 680, 1190, 890, 34); // Path to Meadow pond & dock
  renderCobblestonePath(ctx, 1510, 680, 1510, 1020, 36); // Path to Daisy Hill Barn

  // Thinking Wall Plaza (Brick Pavers)
  ctx.fillStyle = '#a65935';
  ctx.beginPath();
  ctx.roundRect(505, 470, 250, 60, 4);
  ctx.fill();
  ctx.fillStyle = '#8f4a29';
  for (let bx = 510; bx < 750; bx += 18) {
    for (let by = 472; by < 528; by += 9) {
      ctx.fillRect(bx, by, 16, 7);
    }
  }

  // 3. Daisy Hill Meadow Pond with natural shoreline & water reflections
  renderMeadowPond(ctx, 1190, 975);

  // 4. Baseball Diamond with Authentic Sand/Dirt Texture & Foul Lines
  renderBaseballDiamond(ctx);

  // 5. Pumpkin Patch with sculpted furrow soil ridges
  renderPumpkinPatchSoil(ctx);
}

/**
 * Cobblestone pathway with mortared pavers and edge bevels
 */
function renderCobblestonePath(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number
) {
  const minX = Math.min(x1, x2) - (x1 === x2 ? width / 2 : 0);
  const maxX = Math.max(x1, x2) + (x1 === x2 ? width / 2 : 0);
  const minY = Math.min(y1, y2) - (y1 === y2 ? width / 2 : 0);
  const maxY = Math.max(y1, y2) + (y1 === y2 ? width / 2 : 0);
  const w = maxX - minX || width;
  const h = maxY - minY || width;

  // Soft gravel bed underlay
  ctx.fillStyle = '#9e9689';
  ctx.beginPath();
  ctx.roundRect(minX - 2, minY - 2, w + 4, h + 4, 3);
  ctx.fill();

  // Mortared base stone
  ctx.fillStyle = '#d5cdc2';
  ctx.beginPath();
  ctx.roundRect(minX, minY, w, h, 2);
  ctx.fill();

  // Individual cut pavers with light highlights and mortar shadows
  ctx.save();
  ctx.beginPath();
  ctx.rect(minX, minY, w, h);
  ctx.clip();

  const paverSize = 18;
  const paverPalette = ['#e6ded4', '#ddd4c7', '#d0c6b7', '#eae2d7'];

  for (let py = minY; py < maxY; py += paverSize) {
    const rowOffset = (Math.floor(py / paverSize) % 2) * (paverSize / 2);
    for (let px = minX - paverSize; px < maxX; px += paverSize) {
      const pColor = paverPalette[(Math.floor(px * 13 + py * 7)) % paverPalette.length];
      ctx.fillStyle = pColor;
      ctx.beginPath();
      ctx.roundRect(px + rowOffset + 1, py + 1, paverSize - 2, paverSize - 2, 2);
      ctx.fill();

      // Top bevel highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(px + rowOffset + 2, py + 1.5, paverSize - 4, 1);

      // Bottom bevel shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(px + rowOffset + 2, py + paverSize - 2.5, paverSize - 4, 1);
    }
  }
  ctx.restore();
}

/**
 * Daisy Hill Meadow Pond with layered deep water, shoreline sand, ripples, and water lilies
 */
function renderMeadowPond(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Sandy shore border
  ctx.fillStyle = '#c5b89a';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 92, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer shallow water
  const waterGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 85);
  waterGrad.addColorStop(0, '#0077b6');
  waterGrad.addColorStop(0.5, '#0096c7');
  waterGrad.addColorStop(0.85, '#48cae4');
  waterGrad.addColorStop(1, '#90e0ef');

  ctx.fillStyle = waterGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 86, 54, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle animated water ripples
  const time = Date.now() / 1200;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.2;
  for (let r = 0; r < 3; r++) {
    const waveProgress = (time + r * 0.33) % 1;
    const waveRx = 20 + waveProgress * 45;
    const waveRy = 12 + waveProgress * 28;
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy - 2, waveRx, waveRy, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Water lily pads
  const pads = [
    { x: cx - 45, y: cy - 15, r: 12, notch: 0.8 },
    { x: cx + 25, y: cy + 18, r: 14, notch: 2.2 },
    { x: cx - 10, y: cy + 22, r: 10, notch: 3.8 },
    { x: cx + 38, y: cy - 18, r: 11, notch: 5.1 },
  ];

  pads.forEach((pad) => {
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.arc(pad.x, pad.y, pad.r, pad.notch + 0.35, pad.notch - 0.35, false);
    ctx.lineTo(pad.x, pad.y);
    ctx.closePath();
    ctx.fill();

    // Veins
    ctx.strokeStyle = '#40916c';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  });

  // Blooming pink water lotus flowers
  const flowers = [
    { x: cx - 42, y: cy - 15 },
    { x: cx + 28, y: cy + 18 },
  ];

  flowers.forEach((f) => {
    // Pink petals
    ctx.fillStyle = '#ff758f';
    ctx.beginPath();
    ctx.arc(f.x - 2, f.y - 2, 3, 0, Math.PI * 2);
    ctx.arc(f.x + 2, f.y - 2, 3, 0, Math.PI * 2);
    ctx.arc(f.x, f.y + 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffb3c1';
    ctx.beginPath();
    ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(f.x, f.y, 1, 0, Math.PI * 2);
    ctx.fill();
  });

  // Shoreline Smooth River Pebbles
  const pebbles = [
    { x: cx - 80, y: cy + 12, rx: 5, ry: 3, c: '#adb5bd' },
    { x: cx - 74, y: cy + 22, rx: 4, ry: 2.5, c: '#6c757d' },
    { x: cx - 62, y: cy + 42, rx: 6, ry: 3.5, c: '#495057' },
    { x: cx + 68, y: cy - 25, rx: 5, ry: 3, c: '#ced4da' },
    { x: cx + 76, y: cy - 12, rx: 4, ry: 2.5, c: '#6c757d' },
    { x: cx + 55, y: cy + 36, rx: 5, ry: 3, c: '#adb5bd' },
  ];
  pebbles.forEach((p) => {
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.rx, p.ry, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(p.x - 1, p.y - 1, p.rx * 0.5, p.ry * 0.4, 0.3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Shoreline Cattails (Espadañas / Juncos)
  const cattails = [
    { x: cx - 76, y: cy - 22 },
    { x: cx - 70, y: cy - 30 },
    { x: cx - 62, y: cy - 36 },
    { x: cx + 45, y: cy + 34 },
    { x: cx + 54, y: cy + 28 },
  ];
  cattails.forEach((c) => {
    // Green reed stem
    ctx.strokeStyle = '#2d6a4f';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y + 16);
    ctx.quadraticCurveTo(c.x + 2, c.y, c.x + 1, c.y - 16);
    ctx.stroke();

    // Brown velvet seed head
    ctx.fillStyle = '#582f0e';
    ctx.beginPath();
    ctx.roundRect(c.x - 1, c.y - 14, 4, 11, 2);
    ctx.fill();

    // Reed leaves
    ctx.strokeStyle = '#52b788';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y + 12);
    ctx.quadraticCurveTo(c.x - 6, c.y + 2, c.x - 8, c.y - 4);
    ctx.stroke();
  });

  // Swimming Wild Mallard Duck with animated wake ripple trail
  const duckTime = Date.now() / 2500;
  const duckX = cx - 18 + Math.cos(duckTime) * 32;
  const duckY = cy - 6 + Math.sin(duckTime) * 16;
  const duckFacingLeft = Math.sin(duckTime) < 0;

  // Trailing wake ripple
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  const wakeDir = duckFacingLeft ? 1 : -1;
  ctx.moveTo(duckX, duckY + 3);
  ctx.lineTo(duckX + wakeDir * 16, duckY - 2);
  ctx.moveTo(duckX, duckY + 3);
  ctx.lineTo(duckX + wakeDir * 16, duckY + 8);
  ctx.stroke();

  // Duck body (mottled brown feathers)
  ctx.fillStyle = '#6f4e37';
  ctx.beginPath();
  ctx.ellipse(duckX, duckY, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // White neck collar
  ctx.fillStyle = '#ffffff';
  const headOffsetX = duckFacingLeft ? -6 : 6;
  ctx.fillRect(duckX + headOffsetX * 0.7, duckY - 4, 2.5, 3);

  // Iridescent emerald green mallard head
  ctx.fillStyle = '#1b4332';
  ctx.beginPath();
  ctx.arc(duckX + headOffsetX, duckY - 4, 3.8, 0, Math.PI * 2);
  ctx.fill();

  // Orange bill
  ctx.fillStyle = '#f77f00';
  ctx.beginPath();
  const billTipX = duckFacingLeft ? duckX - 12 : duckX + 12;
  ctx.moveTo(duckX + headOffsetX, duckY - 5);
  ctx.lineTo(billTipX, duckY - 3.5);
  ctx.lineTo(duckX + headOffsetX, duckY - 2);
  ctx.closePath();
  ctx.fill();

  // Fluttering Iridescent Dragonflies
  const dfTime = Date.now() / 800;
  const dfX = cx + 8 + Math.sin(dfTime * 1.8) * 22;
  const dfY = cy - 18 + Math.cos(dfTime * 1.5) * 10;
  // Dragonfly body
  ctx.fillStyle = '#0077b6';
  ctx.fillRect(dfX - 4, dfY, 8, 1.2);
  // Iridescent wings
  ctx.fillStyle = 'rgba(220, 245, 255, 0.75)';
  const wingFlutter = Math.sin(dfTime * 14) * 3;
  ctx.beginPath();
  ctx.ellipse(dfX - 1, dfY - 3 + wingFlutter * 0.3, 3.5, 1.2, -0.3, 0, Math.PI * 2);
  ctx.ellipse(dfX + 2, dfY - 3 - wingFlutter * 0.3, 3.5, 1.2, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Wetland reeds / cattails at shore
  ctx.strokeStyle = '#2d6a4f';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx - 75, cy - 10);
  ctx.quadraticCurveTo(cx - 78, cy - 25, cx - 80, cy - 35);
  ctx.moveTo(cx - 70, cy - 8);
  ctx.quadraticCurveTo(cx - 72, cy - 22, cx - 74, cy - 32);
  ctx.stroke();

  // Brown velvet cattail heads
  ctx.fillStyle = '#6f4e37';
  ctx.beginPath();
  ctx.roundRect(cx - 82, cy - 33, 4, 10, 2);
  ctx.roundRect(cx - 76, cy - 30, 4, 9, 2);
  ctx.fill();
}

/**
 * Charlie Brown's Baseball Diamond with clay dirt, chalk lines, and bases
 */
function renderBaseballDiamond(ctx: CanvasRenderingContext2D) {
  // Infield clay dirt
  ctx.fillStyle = '#cf9966';
  ctx.beginPath();
  ctx.moveTo(700, 815); // Home
  ctx.lineTo(815, 920); // 1st base
  ctx.lineTo(700, 1035); // 2nd base
  ctx.lineTo(585, 920); // 3rd base
  ctx.closePath();
  ctx.fill();

  // Inner grass island
  ctx.fillStyle = '#7cae58';
  ctx.beginPath();
  ctx.moveTo(700, 845);
  ctx.lineTo(780, 920);
  ctx.lineTo(700, 1000);
  ctx.lineTo(620, 920);
  ctx.closePath();
  ctx.fill();

  // White chalk foul lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(700, 820);
  ctx.lineTo(840, 945); // 1st base line
  ctx.moveTo(700, 820);
  ctx.lineTo(560, 945); // 3rd base line
  ctx.stroke();

  // Pitcher's mound circular clay elevation
  ctx.fillStyle = '#b8814e';
  ctx.beginPath();
  ctx.ellipse(700, 920, 20, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // White pitcher's rubber plate
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(692, 918, 16, 4);

  // Home plate (Iconic pentagon)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(700, 818);
  ctx.lineTo(706, 824);
  ctx.lineTo(706, 830);
  ctx.lineTo(694, 830);
  ctx.lineTo(694, 824);
  ctx.closePath();
  ctx.fill();

  // 1st, 2nd, 3rd canvas bases (Stuffed bags with corner tie-downs)
  const drawBaseBag = (bx: number, by: number) => {
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath();
    ctx.roundRect(bx - 6, by - 6, 12, 12, 2);
    ctx.fill();
    ctx.strokeStyle = '#d5cdc2';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  drawBaseBag(805, 920); // 1st
  drawBaseBag(700, 1025); // 2nd
  drawBaseBag(595, 920); // 3rd
}

/**
 * Linus's Pumpkin Patch Soil with sculpted furrow ridges
 */
function renderPumpkinPatchSoil(ctx: CanvasRenderingContext2D) {
  // Dark rich organic soil
  ctx.fillStyle = '#533824';
  ctx.beginPath();
  ctx.roundRect(185, 845, 190, 190, 6);
  ctx.fill();

  // Tilled agricultural furrow ridges with shadow and highlight
  for (let py = 862; py < 1030; py += 26) {
    // Furrow trench shadow
    ctx.fillStyle = '#3a2414';
    ctx.fillRect(192, py + 8, 176, 5);
    // Mound ridge highlight
    ctx.fillStyle = '#6b472e';
    ctx.beginPath();
    ctx.roundRect(192, py, 176, 8, 2);
    ctx.fill();
  }

  // Winding green pumpkin vines running across the patch
  ctx.strokeStyle = '#386641';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(195, 880);
  ctx.bezierCurveTo(230, 870, 270, 920, 310, 890);
  ctx.bezierCurveTo(340, 870, 360, 940, 370, 970);
  ctx.moveTo(210, 960);
  ctx.bezierCurveTo(240, 990, 280, 950, 320, 990);
  ctx.stroke();

  // Curly vine tendrils
  ctx.strokeStyle = '#6a994e';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(265, 905, 4, 0, 1.8 * Math.PI);
  ctx.arc(335, 880, 4, 0, 1.8 * Math.PI);
  ctx.stroke();
}

/**
 * Interactables Base Render (Behind or under players)
 */
function renderInteractablesBase(ctx: CanvasRenderingContext2D, map: GameMap, timeOfDay: TimeOfDay) {
  if (map.id === 'overworld') {
    // 0. Curbside Picket Fences & Classic Mailboxes along residential lots
    drawFrontYardFencing(ctx, 160, 275, 270);
    drawFrontYardFencing(ctx, 510, 275, 290);
    drawFrontYardFencing(ctx, 160, 565, 270);
    drawFrontYardFencing(ctx, 1140, 565, 250);
    drawFrontYardFencing(ctx, 1440, 565, 250);

    // Curbside Mailboxes with red flags
    drawCurbsideMailbox(ctx, 170, 290, 'ARI');
    drawCurbsideMailbox(ctx, 520, 290, 'BROWN');
    drawCurbsideMailbox(ctx, 170, 580, 'VAN PELT');
    drawCurbsideMailbox(ctx, 1150, 580, 'PATTY');
    drawCurbsideMailbox(ctx, 1450, 580, 'MARCIE');

    // 1. Ari's Cozy House (x: 180, y: 140, w: 240, h: 160)
    drawHouseBuilding(
      ctx,
      180,
      140,
      240,
      160,
      '#f7ede2',
      '#f28482',
      '#84a59d',
      "Casa de Ari",
      timeOfDay
    );

    // 2. Charlie Brown & Sally's Classic House (x: 530, y: 140, w: 260, h: 160)
    drawHouseBuilding(
      ctx,
      530,
      140,
      260,
      160,
      '#f4f1de',
      '#005f73',
      '#0a9396',
      "Casa de Charlie Brown y Sally",
      timeOfDay
    );

    // 3. Snoopy's Doghouse (The iconic red doghouse!) (x: 875, y: 215)
    drawDoghouse(ctx, 875, 215, timeOfDay);

    // 4. Elementary Schoolhouse (x: 1100, y: 140, w: 320, h: 180)
    drawSchoolBuilding(ctx, 1100, 140, 320, 180, timeOfDay);

    // 5. Lucy & Linus's House (x: 180, y: 440, w: 240, h: 150)
    drawHouseBuilding(
      ctx,
      180,
      440,
      240,
      150,
      '#d8e2dc',
      '#c05c46',
      '#2b580c',
      "Casa de Lucy y Linus",
      timeOfDay
    );

    // 6. Thinking Wall (Iconic Charles Schulz brick wall) (x: 520, y: 485, w: 220, h: 35)
    drawThinkingWall(ctx, 520, 485, 220, 35, timeOfDay);

    // 7. Lucy's Psychiatry Booth (x: 790, y: 500, w: 80, h: 60)
    drawPsychiatryBooth(ctx, 790, 500, timeOfDay);

    // 8. Schroeder's Toy Piano Gazebo (x: 960, y: 500, w: 90, h: 65)
    drawSchroederPianoSpot(ctx, 965, 510, timeOfDay);

    // 9. Peppermint Patty's House (x: 1160, y: 440, w: 220, h: 150)
    drawHouseBuilding(
      ctx,
      1160,
      440,
      220,
      150,
      '#e9d8a6',
      '#1d3557',
      '#e63946',
      "Casa de Peppermint Patty",
      timeOfDay
    );

    // 10. Marcie's House (x: 1460, y: 440, w: 220, h: 150)
    drawHouseBuilding(
      ctx,
      1460,
      440,
      220,
      150,
      '#e0e1dd',
      '#2b2d42',
      '#778da9',
      "Casa de Marcie",
      timeOfDay
    );

    // 11. Baseball Field Bleachers, Dugouts & Chain-link Backstop
    drawBaseballBackstop(ctx, 650, 770, 110, 50);
    drawBleachers(ctx, 530, 800, 140, 40);
    drawBleachers(ctx, 800, 800, 140, 40);

    // 12. Daisy Hill Pond Pier / Dock
    drawPondDock(ctx, 1190, 885, 50, 30);

    // 13. Daisy Hill Puppy Barn (x: 1380, y: 860, w: 260, h: 170)
    drawBarnBuilding(ctx, 1380, 860, 260, 170, timeOfDay);

    // 14. Pumpkins in the patch
    drawPumpkins(ctx);

    // 15. Vintage Iron Streetlamps along neighborhood avenues
    const streetlamps = [
      { x: 440, y: 310 },
      { x: 810, y: 310 },
      { x: 1060, y: 310 },
      { x: 440, y: 610 },
      { x: 1120, y: 610 },
      { x: 1400, y: 610 },
    ];
    streetlamps.forEach((lamp) => drawVintageStreetlamp(ctx, lamp.x, lamp.y, timeOfDay));
  }
}

/**
 * White wooden picket fence with gates along property boundaries
 */
function drawFrontYardFencing(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  // Horizontal fence rails
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y + 6, w, 2.5);
  ctx.fillRect(x, y + 15, w, 2.5);

  // Vertical pointed pickets
  for (let px = x; px < x + w; px += 10) {
    // Gate gap in front of walkways
    if (px > x + w / 2 - 20 && px < x + w / 2 + 16) continue;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(px + 1, y + 20);
    ctx.lineTo(px + 1, y + 3);
    ctx.lineTo(px + 3.5, y);
    ctx.lineTo(px + 6, y + 3);
    ctx.lineTo(px + 6, y + 20);
    ctx.closePath();
    ctx.fill();

    // Subtle drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(px + 6, y + 4, 1, 16);
  }
}

/**
 * Classic curved curbside mailbox with red flag
 */
function drawCurbsideMailbox(ctx: CanvasRenderingContext2D, x: number, y: number, name: string) {
  // Wooden post
  ctx.fillStyle = '#582f0e';
  ctx.fillRect(x + 4, y, 4, 18);

  // Metal rounded dome mailbox
  ctx.fillStyle = '#ced4da';
  ctx.beginPath();
  ctx.arc(x + 6, y - 4, 6, Math.PI, 0, false);
  ctx.lineTo(x + 16, y - 4);
  ctx.lineTo(x + 16, y + 2);
  ctx.lineTo(x, y + 2);
  ctx.closePath();
  ctx.fill();

  // Dark door trim
  ctx.strokeStyle = '#495057';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Red indicator flag
  ctx.fillStyle = '#d90429';
  ctx.fillRect(x + 13, y - 10, 2, 8);
  ctx.fillRect(x + 9, y - 10, 4, 3);

  // Name on side
  ctx.fillStyle = '#18171e';
  ctx.font = 'bold 4px sans-serif';
  ctx.fillText(name, x + 1, y + 1);
}

/**
 * Vintage iron streetlamp with warm glass lantern glow
 */
function drawVintageStreetlamp(ctx: CanvasRenderingContext2D, x: number, y: number, timeOfDay: TimeOfDay) {
  // Ground base
  ctx.fillStyle = '#212529';
  ctx.beginPath();
  ctx.roundRect(x - 4, y + 4, 8, 3, 1);
  ctx.fill();

  // Wrought iron post
  ctx.fillRect(x - 1.5, y - 36, 3, 40);

  // Decorative ladder crossbar
  ctx.fillRect(x - 7, y - 28, 14, 2);

  // Lantern bracket and top cap
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 36);
  ctx.lineTo(x + 6, y - 36);
  ctx.lineTo(x + 4, y - 46);
  ctx.lineTo(x - 4, y - 46);
  ctx.closePath();
  ctx.fill();

  // Pointed finial
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(x, y - 48, 2, 0, Math.PI * 2);
  ctx.fill();

  // Glass chamber and glowing lamp filament
  const isGlowing = timeOfDay === 'night' || timeOfDay === 'sunset';
  ctx.fillStyle = isGlowing ? '#ffe49e' : 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 37);
  ctx.lineTo(x + 4, y - 37);
  ctx.lineTo(x + 3, y - 45);
  ctx.lineTo(x - 3, y - 45);
  ctx.closePath();
  ctx.fill();

  if (isGlowing) {
    // Warm radial illumination pool on the pavement
    const glowGrad = ctx.createRadialGradient(x, y + 2, 2, x, y + 2, 38);
    glowGrad.addColorStop(0, timeOfDay === 'night' ? 'rgba(255, 215, 80, 0.35)' : 'rgba(255, 180, 60, 0.22)');
    glowGrad.addColorStop(1, 'rgba(255, 215, 80, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 38, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Curved galvanized chain-link backstop behind home plate
 */
function drawBaseballBackstop(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Steel curved fence poles
  ctx.strokeStyle = '#495057';
  ctx.lineWidth = 2.5;
  for (let px = x; px <= x + w; px += 25) {
    ctx.beginPath();
    ctx.moveTo(px, y + h);
    ctx.lineTo(px, y);
    ctx.stroke();
  }
  // Top and bottom rail
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();

  // Diamond chain-link mesh
  ctx.strokeStyle = 'rgba(173, 181, 189, 0.45)';
  ctx.lineWidth = 0.8;
  for (let mx = x; mx <= x + w + h; mx += 8) {
    ctx.beginPath();
    ctx.moveTo(mx, y);
    ctx.lineTo(mx - h, y + h);
    ctx.moveTo(mx - h, y);
    ctx.lineTo(mx, y + h);
    ctx.stroke();
  }

  // Home plate with chalk batter's boxes
  const homeX = x + w / 2;
  const homeY = y + h - 14;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.4;
  // Left batter box
  ctx.strokeRect(homeX - 22, homeY - 8, 14, 20);
  // Right batter box
  ctx.strokeRect(homeX + 8, homeY - 8, 14, 20);

  // Five-sided home plate
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(homeX - 5, homeY);
  ctx.lineTo(homeX + 5, homeY);
  ctx.lineTo(homeX + 5, homeY + 6);
  ctx.lineTo(homeX, homeY + 10);
  ctx.lineTo(homeX - 5, homeY + 6);
  ctx.closePath();
  ctx.fill();
}

/**
 * High-Detail Residential House (Ari's, Charlie Brown's, Patty's, Lucy/Linus's, Marcie's)
 */
function drawHouseBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  wallColor: string,
  roofColor: string,
  trimColor: string,
  title: string,
  timeOfDay: TimeOfDay
) {
  // Building ground directional shadow with soft perimeter
  ctx.fillStyle = 'rgba(20, 25, 35, 0.26)';
  ctx.beginPath();
  ctx.roundRect(x - 8, y + h - 8, w + 16, 24, 8);
  ctx.fill();

  // Foundation Course (Cut fieldstone / brick masonry base)
  ctx.fillStyle = '#6c757d';
  ctx.fillRect(x + 2, y + h - 14, w - 4, 14);
  ctx.fillStyle = '#495057';
  for (let fx = x + 2; fx < x + w - 4; fx += 20) {
    ctx.fillRect(fx, y + h - 14, 1, 14);
    ctx.fillRect(fx + 10, y + h - 7, 1, 7);
  }
  ctx.fillStyle = '#adb5bd';
  ctx.fillRect(x + 1, y + h - 15, w - 2, 2); // Foundation water-table ledge

  // 1. Clapboard Siding Walls
  ctx.fillStyle = wallColor;
  ctx.beginPath();
  ctx.roundRect(x, y + 50, w, h - 64, 2);
  ctx.fill();

  // Horizontal clapboard siding lines with authentic drop shadow
  for (let ly = y + 62; ly < y + h - 14; ly += 11) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
    ctx.fillRect(x, ly, w, 1.2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(x, ly + 1.2, w, 0.8);
  }

  // Vertical corner trim boards (Authentic New England architecture)
  ctx.fillStyle = trimColor;
  ctx.fillRect(x, y + 50, 6, h - 64);
  ctx.fillRect(x + w - 6, y + 50, 6, h - 64);

  // Vertical downspouts running down the right corner
  ctx.fillStyle = '#495057';
  ctx.fillRect(x + w + 1, y + 54, 3, h - 66);
  ctx.fillStyle = '#343a40';
  ctx.fillRect(x + w - 1, y + 74, 5, 2); // Bracket
  ctx.fillRect(x + w - 1, y + h - 28, 5, 2);

  // 2. Dimensional Shingled Pitched Roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(x - 16, y + 54);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w + 16, y + 54);
  ctx.closePath();
  ctx.fill();

  // Roof shake shingle rows with staggered tiles
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.lineWidth = 1.4;
  for (let s = 1; s < 5; s++) {
    const factor = s / 5;
    const sy = y + 54 - factor * 50;
    const sx1 = x - 16 + factor * (w / 2 + 16);
    const sx2 = x + w + 16 - factor * (w / 2 + 16);
    ctx.beginPath();
    ctx.moveTo(sx1, sy);
    ctx.lineTo(sx2, sy);
    ctx.stroke();

    // Vertical shingle cuts
    const rowWidth = sx2 - sx1;
    const shingleW = 16;
    const offset = (s % 2) * (shingleW / 2);
    for (let shx = sx1 + offset; shx < sx2; shx += shingleW) {
      ctx.beginPath();
      ctx.moveTo(shx, sy);
      ctx.lineTo(shx, sy + 10);
      ctx.stroke();
    }
  }

  // White fascia trim along the roof gables
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 16, y + 54);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w + 16, y + 54);
  ctx.stroke();

  // Gutter along the eaves
  ctx.fillStyle = '#ced4da';
  ctx.fillRect(x - 18, y + 52, w + 36, 4);

  // Fascia overhang cast shadow onto the front wall
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.beginPath();
  ctx.moveTo(x - 16, y + 54);
  ctx.lineTo(x + w + 16, y + 54);
  ctx.lineTo(x + w, y + 64);
  ctx.lineTo(x, y + 64);
  ctx.closePath();
  ctx.fill();

  // 3. Red Brick Chimney with Realistic Drifting Animated Smoke
  const chimX = x + w - 48;
  ctx.fillStyle = '#a62626';
  ctx.fillRect(chimX, y + 8, 26, 42);
  // Chimney cap
  ctx.fillStyle = '#4a0e17';
  ctx.fillRect(chimX - 4, y + 6, 34, 5);
  // Clay flue liner
  ctx.fillStyle = '#cf6a4c';
  ctx.fillRect(chimX + 4, y + 2, 8, 4);
  ctx.fillRect(chimX + 14, y + 2, 8, 4);
  // Mortar lines
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(chimX, y + 16, 26, 1.2);
  ctx.fillRect(chimX, y + 26, 26, 1.2);
  ctx.fillRect(chimX, y + 36, 26, 1.2);

  // Animated chimney smoke puffs
  const now = Date.now() / 1000;
  for (let p = 0; p < 4; p++) {
    const pProgress = ((now * 0.4 + p * 0.25) % 1);
    const smokeY = y - pProgress * 42;
    const smokeX = chimX + 12 + Math.sin(now * 1.5 + p) * 12 + pProgress * 8;
    const smokeRadius = 4 + pProgress * 9;
    const alpha = (1 - pProgress) * 0.38;
    ctx.fillStyle = `rgba(240, 240, 245, ${alpha})`;
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, smokeRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Double-Hung Windows with Louvered Shutters & muntin bars
  drawArchitecturalWindow(ctx, x + 34, y + 74, 40, 48, trimColor, timeOfDay);
  drawArchitecturalWindow(ctx, x + w - 74, y + 74, 40, 48, trimColor, timeOfDay);

  // 5. Front Porch & Entrance
  const doorX = x + w / 2 - 22;
  // Concrete / stone stairs
  ctx.fillStyle = '#b7b7a4';
  ctx.fillRect(doorX - 10, y + h - 6, 64, 6);
  ctx.fillStyle = '#a5a58d';
  ctx.fillRect(doorX - 6, y + h - 12, 56, 6);
  ctx.fillStyle = '#8f8f7c';
  ctx.fillRect(doorX - 2, y + h - 18, 48, 6);

  // Porch turned balustrade railings
  ctx.strokeStyle = '#f8f9fa';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(doorX - 10, y + h - 6);
  ctx.lineTo(doorX - 10, y + h - 34);
  ctx.lineTo(doorX - 2, y + h - 34);
  ctx.moveTo(doorX + 54, y + h - 6);
  ctx.lineTo(doorX + 54, y + h - 34);
  ctx.lineTo(doorX + 46, y + h - 34);
  ctx.stroke();

  // Welcome Doormat on stairs
  ctx.fillStyle = '#9c6644';
  ctx.beginPath();
  ctx.roundRect(doorX + 5, y + h - 16, 34, 10, 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.font = 'bold 5px sans-serif';
  ctx.fillText('BIENVENIDO', doorX + 7, y + h - 9);

  // Potted Porch Flowers (Hydrangeas / Petunias)
  drawPorchFlowerPot(ctx, doorX - 18, y + h - 14, '#e63946');
  drawPorchFlowerPot(ctx, doorX + 56, y + h - 14, '#ffb703');

  // Stained wood door with raised dimensional panels
  ctx.fillStyle = '#582f0e';
  ctx.fillRect(doorX, y + h - 62, 44, 44);
  ctx.fillStyle = '#7f4f24';
  ctx.fillRect(doorX + 4, y + h - 58, 15, 16);
  ctx.fillRect(doorX + 25, y + h - 58, 15, 16);
  ctx.fillRect(doorX + 4, y + h - 38, 15, 18);
  ctx.fillRect(doorX + 25, y + h - 38, 15, 18);

  // Polished brass knob, mail slot, and kick plate
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(doorX + 37, y + h - 40, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Mail slot
  ctx.fillRect(doorX + 13, y + h - 26, 18, 3.5);
  // Polished kick plate
  ctx.fillRect(doorX + 3, y + h - 21, 38, 3);

  // Brass house number plaque
  ctx.fillStyle = '#18171e';
  ctx.fillRect(doorX + 48, y + h - 54, 10, 8);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 5px sans-serif';
  ctx.fillText('1950', doorX + 49, y + h - 48);

  // Hanging Porch Lantern with beveled glass
  const lightX = doorX + 22;
  const lightY = y + h - 72;
  ctx.fillStyle = '#2b2a33';
  ctx.fillRect(lightX - 4, lightY - 2, 8, 3);
  ctx.fillStyle = timeOfDay === 'night' ? '#ffbe0b' : '#ffd166';
  ctx.beginPath();
  ctx.roundRect(lightX - 4, lightY + 1, 8, 11, 2);
  ctx.fill();

  // Foundation shrubs & flowerbeds flanking the house
  drawFoundationBush(ctx, x + 8, y + h - 12, 22);
  drawFoundationBush(ctx, x + w - 30, y + h - 12, 22);
}

/**
 * Porch terracotta flowerpot with blooming blossoms
 */
function drawPorchFlowerPot(ctx: CanvasRenderingContext2D, x: number, y: number, flowerColor: string) {
  // Terracotta pot
  ctx.fillStyle = '#bc6c25';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 10, y);
  ctx.lineTo(x + 8, y + 11);
  ctx.lineTo(x + 2, y + 11);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#dda15e';
  ctx.fillRect(x - 1, y - 2, 12, 3);

  // Green foliage & blooming petals
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath();
  ctx.arc(x + 5, y - 3, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = flowerColor;
  ctx.beginPath();
  ctx.arc(x + 3, y - 5, 2.5, 0, Math.PI * 2);
  ctx.arc(x + 7, y - 5, 2.5, 0, Math.PI * 2);
  ctx.arc(x + 5, y - 2, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Foundation boxwood shrub
 */
function drawFoundationBush(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 2, w / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#40916c';
  ctx.beginPath();
  ctx.arc(x + w / 2 - 3, y - 2, w / 3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Architectural window with Louvered Shutters, muntin dividers, sill, and realistic sky/glow
 */
function drawArchitecturalWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  shutterColor: string,
  timeOfDay: TimeOfDay
) {
  // Louvered Exterior Shutters on left & right
  const shutterW = 10;
  // Left shutter
  ctx.fillStyle = shutterColor;
  ctx.beginPath();
  ctx.roundRect(x - shutterW - 2, y, shutterW, h, 2);
  ctx.roundRect(x + w + 2, y, shutterW, h, 2);
  ctx.fill();

  // Shutter horizontal louvers
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  for (let sy = y + 4; sy < y + h - 3; sy += 5) {
    ctx.fillRect(x - shutterW - 1, sy, shutterW - 2, 1.2);
    ctx.fillRect(x + w + 3, sy, shutterW - 2, 1.2);
  }

  // Wood trim frame
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(x - 3, y - 3, w + 6, h + 6, 2);
  ctx.fill();

  // Glass pane
  if (timeOfDay === 'night') {
    // Warm lit cozy interior glow with soft amber gradient
    const nightGlow = ctx.createLinearGradient(x, y, x, y + h);
    nightGlow.addColorStop(0, '#ffe49e');
    nightGlow.addColorStop(1, '#ffb703');
    ctx.fillStyle = nightGlow;
    ctx.fillRect(x, y, w, h);

    // Warm curtain silhouettes
    ctx.fillStyle = 'rgba(215, 110, 40, 0.45)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 7, y);
    ctx.lineTo(x + 4, y + h);
    ctx.lineTo(x, y + h);
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w - 7, y);
    ctx.lineTo(x + w - 4, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.fill();
  } else if (timeOfDay === 'sunset') {
    // Sunset orange/rose sky reflection
    const sunsetGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    sunsetGrad.addColorStop(0, '#f77f00');
    sunsetGrad.addColorStop(0.5, '#fcbf49');
    sunsetGrad.addColorStop(1, '#d62828');
    ctx.fillStyle = sunsetGrad;
    ctx.fillRect(x, y, w, h);

    // Diagonal glass glint
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + h - 6);
    ctx.lineTo(x + w - 6, y + 4);
    ctx.stroke();
  } else {
    // Crisp daylight sky reflection gradient
    const skyGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    skyGrad.addColorStop(0, '#caf0f8');
    skyGrad.addColorStop(0.5, '#90e0ef');
    skyGrad.addColorStop(1, '#0096c7');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(x, y, w, h);

    // Sheer interior white curtains
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 8, y + h / 2, x + 3, y + h);
    ctx.lineTo(x, y + h);
    ctx.moveTo(x + w, y);
    ctx.quadraticCurveTo(x + w - 8, y + h / 2, x + w - 3, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.fill();

    // Diagonal glass glint
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + h - 6);
    ctx.lineTo(x + w - 6, y + 4);
    ctx.moveTo(x + 12, y + h - 6);
    ctx.lineTo(x + w - 6, y + 12);
    ctx.stroke();
  }

  // Muntin dividers (authentic white 6-lite cross)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + w / 2 - 1, y, 2, h);
  ctx.fillRect(x, y + h / 3, w, 2);
  ctx.fillRect(x, y + (2 * h) / 3, w, 2);

  // Heavy limestone window sill
  ctx.fillStyle = '#e9ecef';
  ctx.fillRect(x - 5, y + h, w + 10, 4.5);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.fillRect(x - 5, y + h + 4.5, w + 10, 1.5);
}

/**
 * Snoopy's Iconic Red Doghouse with full dimensional depth, backyard fence, birdbath, and cellar doors
 */
function drawDoghouse(ctx: CanvasRenderingContext2D, x: number, y: number, timeOfDay: TimeOfDay) {
  const red = '#e63946';
  const darkRed = '#ba181b';
  const shadowRed = '#660708';
  const black = '#18171e';

  // 1. Charlie Brown's Backyard White Picket Fence behind the doghouse
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 45, y + 16, 175, 2);
  ctx.fillRect(x - 45, y + 26, 175, 2);
  for (let fx = x - 45; fx <= x + 125; fx += 11) {
    ctx.beginPath();
    ctx.moveTo(fx, y + 36);
    ctx.lineTo(fx, y + 10);
    ctx.lineTo(fx + 2.5, y + 7);
    ctx.lineTo(fx + 5, y + 10);
    ctx.lineTo(fx + 5, y + 36);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fillRect(fx + 5, y + 10, 1, 26);
    ctx.fillStyle = '#ffffff';
  }

  // 2. Snoopy's Secret Cellar Storm Doors in the grass (leads down to mansion!)
  const cellarX = x + 76;
  const cellarY = y + 54;
  ctx.fillStyle = '#495057';
  ctx.beginPath();
  ctx.roundRect(cellarX - 2, cellarY - 2, 40, 24, 2);
  ctx.fill();
  ctx.fillStyle = '#7f4f24';
  ctx.beginPath();
  ctx.roundRect(cellarX, cellarY, 36, 20, 2);
  ctx.fill();
  // Double door split and diagonal plank lines
  ctx.strokeStyle = '#582f0e';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cellarX + 18, cellarY);
  ctx.lineTo(cellarX + 18, cellarY + 20);
  ctx.moveTo(cellarX, cellarY + 7);
  ctx.lineTo(cellarX + 36, cellarY + 7);
  ctx.moveTo(cellarX, cellarY + 14);
  ctx.lineTo(cellarX + 36, cellarY + 14);
  ctx.stroke();
  // Iron pull handles
  ctx.fillStyle = '#18171e';
  ctx.beginPath();
  ctx.arc(cellarX + 14, cellarY + 10, 2, 0, Math.PI * 2);
  ctx.arc(cellarX + 22, cellarY + 10, 2, 0, Math.PI * 2);
  ctx.fill();

  // 3. Doghouse ground cast shadow
  ctx.fillStyle = 'rgba(20, 25, 35, 0.28)';
  ctx.beginPath();
  ctx.ellipse(x + 36, y + 74, 46, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Front Wall (Rich Schulz Red)
  ctx.fillStyle = red;
  ctx.beginPath();
  ctx.roundRect(x, y + 24, 72, 48, 2);
  ctx.fill();

  // Vertical timber siding grooves with drop shadows
  for (let sx = x + 12; sx < x + 70; sx += 12) {
    ctx.fillStyle = darkRed;
    ctx.fillRect(sx, y + 26, 1.5, 45);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(sx + 1.5, y + 26, 0.8, 45);
  }

  // Pitched Gable Roof with overlapping eaves
  ctx.fillStyle = darkRed;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 25);
  ctx.lineTo(x + 36, y - 2);
  ctx.lineTo(x + 80, y + 25);
  ctx.closePath();
  ctx.fill();

  // Roof ridge highlight cap
  ctx.fillStyle = '#f2545b';
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 25);
  ctx.lineTo(x + 36, y - 2);
  ctx.lineTo(x + 36, y);
  ctx.lineTo(x - 6, y + 26);
  ctx.closePath();
  ctx.fill();

  // Eaves cast shadow
  ctx.fillStyle = shadowRed;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 25);
  ctx.lineTo(x + 80, y + 25);
  ctx.lineTo(x + 72, y + 31);
  ctx.lineTo(x, y + 31);
  ctx.closePath();
  ctx.fill();

  // Classic arched doorway into Snoopy's mysterious spacious interior
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.arc(x + 36, y + 52, 17, Math.PI, 0, false);
  ctx.lineTo(x + 53, y + 72);
  ctx.lineTo(x + 19, y + 72);
  ctx.closePath();
  ctx.fill();

  // Doorway arch trim
  ctx.strokeStyle = darkRed;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 4. Snoopy's Ceramic Red Food Bowl with bone biscuits
  const bowlX = x - 18;
  const bowlY = y + 66;
  ctx.fillStyle = '#d90429';
  ctx.beginPath();
  ctx.ellipse(bowlX, bowlY, 13, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ef233c';
  ctx.beginPath();
  ctx.ellipse(bowlX, bowlY - 1, 10.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // White embossed bone motif
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(bowlX - 4, bowlY - 1, 8, 2, 1);
  ctx.arc(bowlX - 4, bowlY - 1, 1.2, 0, Math.PI * 2);
  ctx.arc(bowlX + 4, bowlY - 1, 1.2, 0, Math.PI * 2);
  ctx.fill();
  // Dog biscuits
  ctx.fillStyle = '#dda15e';
  ctx.fillRect(bowlX - 5, bowlY - 3, 4, 2);
  ctx.fillRect(bowlX + 1, bowlY - 3, 4, 2);

  // 5. Woodstock's Carved Stone Birdbath (to the left)
  const bathX = x - 32;
  const bathY = y + 42;
  // Pedestal base
  ctx.fillStyle = '#adb5bd';
  ctx.beginPath();
  ctx.roundRect(bathX - 5, bathY + 22, 10, 4, 1);
  ctx.fill();
  ctx.fillRect(bathX - 2, bathY + 8, 4, 15);
  // Basin bowl
  ctx.beginPath();
  ctx.ellipse(bathX, bathY + 8, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Water in birdbath with ripple
  ctx.fillStyle = '#48cae4';
  ctx.beginPath();
  ctx.ellipse(bathX, bathY + 7, 9.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(bathX, bathY + 7, 5, 1.8, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 6. Woodstock's small tree & cozy twig nest to the right of doghouse
  ctx.fillStyle = '#6f4e37';
  ctx.beginPath();
  ctx.roundRect(x + 88, y + 15, 7, 56, 3);
  ctx.fill();

  // Tree foliage
  ctx.fillStyle = '#52b788';
  ctx.beginPath();
  ctx.arc(x + 91, y + 10, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#74c69d';
  ctx.beginPath();
  ctx.arc(x + 87, y + 5, 14, 0, Math.PI * 2);
  ctx.fill();

  // Woodstock's woven wicker nest
  ctx.fillStyle = '#bc6c25';
  ctx.beginPath();
  ctx.ellipse(x + 84, y + 10, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#dda15e';
  ctx.beginPath();
  ctx.ellipse(x + 84, y + 9, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Thinking Wall (Charles Schulz's iconic brick gathering spot with moss and fallen leaves)
 */
function drawThinkingWall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  timeOfDay: TimeOfDay
) {
  // Ground shadow
  ctx.fillStyle = 'rgba(20, 25, 35, 0.28)';
  ctx.beginPath();
  ctx.roundRect(x - 4, y + h - 4, w + 8, 14, 4);
  ctx.fill();

  // Red-Orange Clay Brickwork
  ctx.fillStyle = '#9c4221';
  ctx.fillRect(x, y + 8, w, h - 8);

  // Alternating running bond brick courses with individual shading
  const courseHeight = 7;
  const brickLength = 16;
  const brickColors = ['#9c4221', '#a84724', '#8c3a1c', '#b04d28'];

  for (let cy = y + 8; cy < y + h; cy += courseHeight) {
    const isOdd = Math.floor((cy - y) / courseHeight) % 2 === 1;
    const startX = isOdd ? x - brickLength / 2 : x;

    for (let bx = startX; bx < x + w; bx += brickLength) {
      if (bx >= x && bx <= x + w - 2) {
        const brickW = Math.min(brickLength - 1.5, x + w - bx);
        ctx.fillStyle = brickColors[(Math.floor(bx * 3 + cy * 7)) % brickColors.length];
        ctx.fillRect(bx, cy, brickW, courseHeight - 1.5);
      }
    }

    // Horizontal mortar bed joint
    ctx.fillStyle = '#d5bdaf';
    ctx.fillRect(x, cy + courseHeight - 1.5, w, 1.5);
  }

  // Creeping green moss in mortar joints
  ctx.fillStyle = '#2d6a4f';
  const mossSpots = [
    { dx: 15, dy: 14, r: 3 },
    { dx: 45, dy: 22, r: 4 },
    { dx: 95, dy: 18, r: 3.5 },
    { dx: 140, dy: 26, r: 4 },
    { dx: 185, dy: 20, r: 3 },
  ];
  mossSpots.forEach((m) => {
    ctx.beginPath();
    ctx.arc(x + m.dx, y + m.dy, m.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Smooth Limestone Coping Cap along the top with edge bevels
  ctx.fillStyle = '#f8f9fa';
  ctx.beginPath();
  ctx.roundRect(x - 3, y, w + 6, 9, 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(x - 3, y, w + 6, 2); // Highlight ledge
  ctx.fillStyle = '#d5bdaf';
  ctx.fillRect(x - 3, y + 7, w + 6, 2); // Shadow undercut

  // Fallen autumn leaves gathered at the base
  const leaves = [
    { dx: 10, dy: h + 2, c: '#e76f51', rot: 0.4 },
    { dx: 28, dy: h + 4, c: '#fcbf49', rot: -0.6 },
    { dx: 65, dy: h + 1, c: '#f77f00', rot: 0.8 },
    { dx: 110, dy: h + 3, c: '#d62828', rot: -0.3 },
    { dx: 155, dy: h + 2, c: '#fcbf49', rot: 0.5 },
    { dx: 195, dy: h + 4, c: '#e76f51', rot: -0.7 },
  ];
  leaves.forEach((l) => {
    ctx.fillStyle = l.c;
    ctx.beginPath();
    ctx.ellipse(x + l.dx, y + l.dy, 4, 2.2, l.rot, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Lucy's Psychiatry Booth ("PSYCHIATRIC HELP 5¢ - THE DOCTOR IS IN")
 */
function drawPsychiatryBooth(ctx: CanvasRenderingContext2D, x: number, y: number, timeOfDay: TimeOfDay) {
  // Shadow
  ctx.fillStyle = 'rgba(20, 25, 35, 0.22)';
  ctx.beginPath();
  ctx.roundRect(x - 4, y + 54, 88, 14, 4);
  ctx.fill();

  // Natural wooden counter desk with pine grain and knot holes
  ctx.fillStyle = '#dda15e';
  ctx.beginPath();
  ctx.roundRect(x, y + 20, 80, 42, 2);
  ctx.fill();

  // Plank lines
  ctx.fillStyle = '#bc6c25';
  ctx.fillRect(x, y + 34, 80, 1.2);
  ctx.fillRect(x, y + 48, 80, 1.2);

  // Wood knots
  ctx.fillStyle = '#a05822';
  ctx.beginPath();
  ctx.ellipse(x + 18, y + 28, 2.5, 1.5, 0.3, 0, Math.PI * 2);
  ctx.ellipse(x + 62, y + 42, 3, 2, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Roof / Awning with scalloped trim
  ctx.fillStyle = '#e76f51';
  ctx.beginPath();
  ctx.roundRect(x - 4, y, 88, 18, 3);
  ctx.fill();
  ctx.fillStyle = '#d62828';
  ctx.fillRect(x - 4, y + 15, 88, 3);

  // Hand-lettered signage in Charles Schulz font style
  ctx.fillStyle = '#18171e';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('PSYCHIATRIC HELP', x + 2, y + 12);

  ctx.fillStyle = '#d90429';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('5¢', x + 56, y + 42);

  ctx.fillStyle = '#1d3557';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('THE DOCTOR IS IN', x + 4, y + 54);

  // Pinned Psychiatric Diploma certificate
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(x + 6, y + 24, 18, 14);
  ctx.strokeStyle = '#ced4da';
  ctx.lineWidth = 0.6;
  ctx.strokeRect(x + 6, y + 24, 18, 14);
  // Red thumbtack
  ctx.fillStyle = '#d90429';
  ctx.beginPath();
  ctx.arc(x + 15, y + 25, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Notepad & yellow pencil on counter
  ctx.fillStyle = '#fff3b0';
  ctx.fillRect(x + 32, y + 22, 14, 10);
  ctx.fillStyle = '#ffb703';
  ctx.fillRect(x + 48, y + 26, 9, 2); // Pencil

  // Glass jar for nickels with silver coins
  ctx.fillStyle = 'rgba(230, 245, 255, 0.7)';
  ctx.beginPath();
  ctx.roundRect(x + 62, y + 21, 13, 14, 2);
  ctx.fill();
  ctx.strokeStyle = '#48cae4';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Shiny silver nickels
  ctx.fillStyle = '#ced4da';
  ctx.beginPath();
  ctx.ellipse(x + 68, y + 30, 3, 1.5, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 66, y + 27, 3, 1.5, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Doctor's wooden stool behind booth
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.ellipse(x + 40, y + 19, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Schroeder's Toy Piano Gazebo Spot with Beethoven bust, sheet music & floating notes
 */
function drawSchroederPianoSpot(ctx: CanvasRenderingContext2D, x: number, y: number, timeOfDay: TimeOfDay) {
  // Ground shadow under gazebo
  ctx.fillStyle = 'rgba(20, 25, 35, 0.25)';
  ctx.beginPath();
  ctx.ellipse(x + 36, y + 36, 52, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Octagonal wooden gazebo decking with rich finish
  ctx.fillStyle = '#bc6c25';
  ctx.beginPath();
  ctx.roundRect(x - 14, y - 8, 96, 68, 8);
  ctx.fill();

  ctx.fillStyle = '#dda15e';
  ctx.beginPath();
  ctx.roundRect(x - 11, y - 5, 90, 62, 6);
  ctx.fill();

  // Wood parquet planks
  ctx.fillStyle = '#bc6c25';
  for (let px = x - 11; px < x + 79; px += 14) {
    ctx.fillRect(px, y - 5, 1, 62);
  }

  // White turned gazebo corner posts
  const posts = [
    { px: x - 10, py: y - 5 },
    { px: x + 76, py: y - 5 },
    { px: x - 10, py: y + 52 },
    { px: x + 76, py: y + 52 },
  ];
  ctx.fillStyle = '#ffffff';
  posts.forEach((p) => {
    ctx.fillRect(p.px, p.py - 18, 4, 22);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(p.px + 3, p.py - 18, 1, 22);
    ctx.fillStyle = '#ffffff';
  });

  // Schroeder's Iconic Toy Baby Grand Piano (Gloss black body)
  const pianoX = x + 15;
  const pianoY = y + 12;
  ctx.fillStyle = '#18171e';
  ctx.beginPath();
  ctx.roundRect(pianoX, pianoY, 44, 32, 4);
  ctx.fill();
  // Piano lid prop angled
  ctx.fillStyle = '#2b2d42';
  ctx.beginPath();
  ctx.moveTo(pianoX + 4, pianoY + 2);
  ctx.lineTo(pianoX + 40, pianoY - 8);
  ctx.lineTo(pianoX + 42, pianoY + 2);
  ctx.closePath();
  ctx.fill();

  // Keyboard bed (Ivory keys & Ebony sharps)
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(pianoX + 2, pianoY + 22, 40, 9);
  // Black keys
  ctx.fillStyle = '#18171e';
  for (let k = pianoX + 4; k < pianoX + 38; k += 4) {
    if ((k - pianoX) % 12 !== 0) {
      ctx.fillRect(k, pianoY + 22, 2.2, 5.5);
    }
  }

  // Bronze Bust of Ludwig van Beethoven on top of the piano
  const bustX = pianoX + 30;
  const bustY = pianoY + 6;
  ctx.fillStyle = '#7f4f24'; // Bronze base
  ctx.fillRect(bustX - 4, bustY + 2, 8, 4);
  ctx.fillStyle = '#b08968'; // Beethoven head with wild hair
  ctx.beginPath();
  ctx.arc(bustX, bustY - 3, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6f4e37'; // Wild hair
  ctx.beginPath();
  ctx.arc(bustX - 3, bustY - 4, 3, 0, Math.PI * 2);
  ctx.arc(bustX + 3, bustY - 4, 3, 0, Math.PI * 2);
  ctx.fill();

  // Sheet Music score on stand with musical staves
  ctx.fillStyle = '#fefae0';
  ctx.fillRect(pianoX + 10, pianoY + 8, 16, 11);
  ctx.fillStyle = '#18171e';
  ctx.fillRect(pianoX + 12, pianoY + 11, 12, 0.8);
  ctx.fillRect(pianoX + 12, pianoY + 13, 12, 0.8);
  ctx.fillRect(pianoX + 12, pianoY + 15, 12, 0.8);

  // Animated floating Beethoven musical notes in the air!
  const noteTime = Date.now() / 300;
  const notes = [
    { dx: 18, dy: -12 + Math.sin(noteTime) * 3, sym: '♪' },
    { dx: 38, dy: -18 + Math.cos(noteTime) * 3, sym: '♫' },
    { dx: 54, dy: -10 + Math.sin(noteTime + 1) * 3, sym: '♩' },
  ];
  ctx.fillStyle = '#8338ec';
  ctx.font = 'bold 12px sans-serif';
  notes.forEach((n) => {
    ctx.fillText(n.sym, pianoX + n.dx, pianoY + n.dy);
  });

  // Scattered cherry blossom flower petals
  const petals = [
    { dx: 10, dy: 12 },
    { dx: 25, dy: 38 },
    { dx: 60, dy: 15 },
    { dx: 72, dy: 44 },
    { dx: 45, dy: 50 },
  ];
  ctx.fillStyle = '#ffb3c1';
  petals.forEach((p) => {
    ctx.beginPath();
    ctx.ellipse(x + p.dx, y + p.dy, 3, 2, 0.4, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Pumpkins in the Patch with 3D volumetric ridges, leafy vines & Linus's sign
 */
function drawPumpkins(ctx: CanvasRenderingContext2D) {
  // Tangled green vines and broad leaves across the patch
  ctx.strokeStyle = '#2d6a4f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(210, 890);
  ctx.bezierCurveTo(240, 870, 270, 930, 310, 890);
  ctx.bezierCurveTo(320, 920, 290, 970, 330, 980);
  ctx.bezierCurveTo(270, 990, 230, 940, 220, 960);
  ctx.stroke();

  // Pumpkin vine leaves
  const vineLeaves = [
    { x: 230, y: 880 },
    { x: 260, y: 895 },
    { x: 300, y: 910 },
    { x: 330, y: 935 },
    { x: 265, y: 975 },
    { x: 235, y: 945 },
  ];
  ctx.fillStyle = '#40916c';
  vineLeaves.forEach((vl) => {
    ctx.beginPath();
    ctx.arc(vl.x, vl.y, 6, 0, Math.PI * 2);
    ctx.arc(vl.x + 3, vl.y - 2, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  const pumpkins = [
    { x: 220, y: 885, r: 15 },
    { x: 280, y: 915, r: 21 }, // The Great Pumpkin!
    { x: 335, y: 875, r: 13 },
    { x: 245, y: 965, r: 16 },
    { x: 315, y: 985, r: 18 },
  ];

  pumpkins.forEach((p) => {
    // Pumpkin shadow
    ctx.fillStyle = 'rgba(20, 15, 10, 0.45)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + p.r * 0.75, p.r * 1.15, p.r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ribbed segments (drawn from outside to center)
    const orangeDeep = '#e76f51';
    const orangeBright = '#f77f00';
    const orangeHigh = '#fcbf49';

    // Back lobes
    ctx.fillStyle = orangeDeep;
    ctx.beginPath();
    ctx.ellipse(p.x - p.r * 0.45, p.y, p.r * 0.55, p.r * 0.85, 0, 0, Math.PI * 2);
    ctx.ellipse(p.x + p.r * 0.45, p.y, p.r * 0.55, p.r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mid lobes
    ctx.fillStyle = orangeBright;
    ctx.beginPath();
    ctx.ellipse(p.x - p.r * 0.22, p.y, p.r * 0.5, p.r * 0.9, 0, 0, Math.PI * 2);
    ctx.ellipse(p.x + p.r * 0.22, p.y, p.r * 0.5, p.r * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Center front lobe
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.r * 0.45, p.r * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gloss highlight
    ctx.fillStyle = orangeHigh;
    ctx.beginPath();
    ctx.ellipse(p.x - p.r * 0.15, p.y - p.r * 0.3, p.r * 0.18, p.r * 0.35, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Curved green stem
    ctx.strokeStyle = '#2d6a4f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - p.r * 0.85);
    ctx.quadraticCurveTo(p.x + 3, p.y - p.r * 1.25, p.x + 6, p.y - p.r * 1.3);
    ctx.stroke();
  });

  // Linus's handmade wooden sign: "WELCOME GREAT PUMPKIN"
  ctx.fillStyle = '#6f4e37';
  ctx.fillRect(238, 875, 5, 20); // Post

  ctx.fillStyle = '#dda15e';
  ctx.beginPath();
  ctx.roundRect(205, 855, 78, 22, 2);
  ctx.fill();
  ctx.strokeStyle = '#bc6c25';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#18171e';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('GRAN CALABAZA', 208, 869);
}

/**
 * Elementary Schoolhouse with red brick, belfry, clock, and brass bell
 */
function drawSchoolBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  timeOfDay: TimeOfDay
) {
  // Ground shadow
  ctx.fillStyle = 'rgba(20, 25, 35, 0.28)';
  ctx.beginPath();
  ctx.roundRect(x - 8, y + h - 10, w + 16, 26, 8);
  ctx.fill();

  // Red brick main facade
  ctx.fillStyle = '#9b111e';
  ctx.fillRect(x, y + 40, w, h - 40);

  // Brick horizontal courses
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  for (let by = y + 48; by < y + h; by += 10) {
    ctx.fillRect(x, by, w, 1);
  }

  // Stone Quoins (Corner masonry blocks)
  ctx.fillStyle = '#ced4da';
  for (let qy = y + 44; qy < y + h - 8; qy += 16) {
    const qW = (Math.floor(qy / 16) % 2 === 0) ? 14 : 9;
    ctx.fillRect(x, qy, qW, 7);
    ctx.fillRect(x + w - qW, qy, qW, 7);
  }

  // Slate mansard roof
  ctx.fillStyle = '#343a40';
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 42);
  ctx.lineTo(x + 20, y + 16);
  ctx.lineTo(x + w - 20, y + 16);
  ctx.lineTo(x + w + 10, y + 42);
  ctx.closePath();
  ctx.fill();

  // Center Bell Tower & School Clock
  const belfryX = x + w / 2 - 26;
  ctx.fillStyle = '#6c1d45';
  ctx.fillRect(belfryX, y - 10, 52, 50);

  // School Round Clock
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(belfryX + 26, y + 30, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#18171e';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Clock hands (9:00 AM)
  ctx.beginPath();
  ctx.moveTo(belfryX + 26, y + 30);
  ctx.lineTo(belfryX + 26, y + 25);
  ctx.moveTo(belfryX + 26, y + 30);
  ctx.lineTo(belfryX + 21, y + 30);
  ctx.stroke();

  // Belfry Roof with copper patina
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath();
  ctx.moveTo(belfryX - 6, y - 10);
  ctx.lineTo(belfryX + 26, y - 34);
  ctx.lineTo(belfryX + 58, y - 10);
  ctx.closePath();
  ctx.fill();

  // Weathervane on top of belfry
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(belfryX + 26, y - 34);
  ctx.lineTo(belfryX + 26, y - 46);
  ctx.moveTo(belfryX + 18, y - 42);
  ctx.lineTo(belfryX + 34, y - 42);
  ctx.stroke();

  // Belfry archway with shiny brass bell
  ctx.fillStyle = '#18171e';
  ctx.beginPath();
  ctx.arc(belfryX + 26, y + 8, 12, Math.PI, 0, false);
  ctx.lineTo(belfryX + 38, y + 20);
  ctx.lineTo(belfryX + 14, y + 20);
  ctx.closePath();
  ctx.fill();

  // Brass Bell
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(belfryX + 26, y + 10, 8, 0, Math.PI, false);
  ctx.lineTo(belfryX + 35, y + 17);
  ctx.lineTo(belfryX + 17, y + 17);
  ctx.closePath();
  ctx.fill();

  // Classroom Windows with white shutters
  for (let wx = x + 30; wx < x + w - 50; wx += 65) {
    drawArchitecturalWindow(ctx, wx, y + 68, 44, 52, '#ffffff', timeOfDay);
  }

  // Double Entrance Doors with Portico
  const doorX = x + w / 2 - 24;
  // Limestone portico steps
  ctx.fillStyle = '#ced4da';
  ctx.fillRect(doorX - 10, y + h - 6, 68, 6);
  ctx.fillRect(doorX - 6, y + h - 12, 60, 6);

  ctx.fillStyle = '#582f0e';
  ctx.fillRect(doorX, y + h - 55, 48, 43);
  ctx.fillStyle = '#7f4f24';
  ctx.fillRect(doorX + 2, y + h - 53, 21, 39);
  ctx.fillRect(doorX + 25, y + h - 53, 21, 39);

  // Brass crash bars & knobs
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(doorX + 18, y + h - 28, 4, 4);
  ctx.fillRect(doorX + 26, y + h - 28, 4, 4);
}

function drawBleachers(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#9c6644';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 2);
  ctx.fill();

  // Tiered bench planks
  ctx.fillStyle = '#ddb892';
  ctx.fillRect(x, y, w, 10);
  ctx.fillRect(x, y + 15, w, 10);
  ctx.fillRect(x, y + 30, w, 10);

  ctx.fillStyle = '#7f4f24';
  ctx.fillRect(x, y + 10, w, 3);
  ctx.fillRect(x, y + 25, w, 3);

  // Baseball gear left on the bleachers (crossed bats, ball cap, batting helmet)
  // Wooden bat
  ctx.fillStyle = '#dda15e';
  ctx.beginPath();
  ctx.roundRect(x + 20, y + 3, 26, 3.5, 1);
  ctx.fill();
  // Charlie Brown's baseball cap
  ctx.fillStyle = '#ffbe0b';
  ctx.beginPath();
  ctx.arc(x + 60, y + 4, 4.5, Math.PI, 0, false);
  ctx.fill();
  ctx.fillRect(x + 58, y + 4, 9, 2); // Brim
  // Batting helmet
  ctx.fillStyle = '#0077b6';
  ctx.beginPath();
  ctx.arc(x + 95, y + 18, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawPondDock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Pier water shadow
  ctx.fillStyle = 'rgba(0, 50, 80, 0.4)';
  ctx.fillRect(x - 2, y + 2, w + 4, h + 8);

  // Pilings / support posts in water
  ctx.fillStyle = '#4a2c11';
  ctx.fillRect(x + 4, y + h, 6, 12);
  ctx.fillRect(x + w - 10, y + h, 6, 12);

  // Wooden deck base
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(x, y, w, h);

  // Wooden deck planks
  ctx.fillStyle = '#a06535';
  for (let px = x; px < x + w; px += 8) {
    ctx.fillRect(px + 1, y + 1, 6, h - 2);
  }

  // Mooring cleat with coiled rope
  ctx.fillStyle = '#d5cdc2';
  ctx.fillRect(x + w - 8, y + 4, 5, 3);
  ctx.fillRect(x + w - 10, y + 5, 9, 1.5);
  ctx.strokeStyle = '#dda15e';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x + w - 6, y + 12, 3, 0, Math.PI * 2);
  ctx.stroke();

  // Life Preserver Ring on timber post
  const ringX = x + 6;
  const ringY = y - 4;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ringX, ringY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d90429';
  ctx.fillRect(ringX - 7, ringY - 1.5, 14, 3);
  ctx.fillStyle = '#0077b6'; // Inner hole
  ctx.beginPath();
  ctx.arc(ringX, ringY, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawBarnBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  timeOfDay: TimeOfDay
) {
  // Ground shadow
  ctx.fillStyle = 'rgba(20, 25, 35, 0.28)';
  ctx.beginPath();
  ctx.roundRect(x - 8, y + h - 10, w + 16, 26, 8);
  ctx.fill();

  // Rustic wooden paddock fence extending to the left
  ctx.fillStyle = '#8c5836';
  ctx.fillRect(x - 55, y + h - 28, 55, 3);
  ctx.fillRect(x - 55, y + h - 16, 55, 3);
  for (let px = x - 55; px < x; px += 18) {
    ctx.fillRect(px, y + h - 34, 4, 34);
  }

  // Horse water trough filled with sparkling water
  const troughX = x - 50;
  const troughY = y + h - 22;
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.roundRect(troughX, troughY, 28, 16, 2);
  ctx.fill();
  ctx.fillStyle = '#48cae4';
  ctx.fillRect(troughX + 2, troughY + 2, 24, 12);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(troughX + 4, troughY + 4, 16, 2);

  // Red weathered timber barn facade
  ctx.fillStyle = '#9b111e';
  ctx.fillRect(x, y + 45, w, h - 45);

  // Vertical timber siding grooves with texture
  for (let bx = x + 14; bx < x + w; bx += 14) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.fillRect(bx, y + 45, 1.5, h - 45);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(bx + 1.5, y + 45, 0.8, h - 45);
  }

  // Gambrel Barn Roof (Classic red/slate gambrel roof)
  ctx.fillStyle = '#2b2d42';
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 48);
  ctx.lineTo(x + 25, y + 18);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w - 25, y + 18);
  ctx.lineTo(x + w + 12, y + 48);
  ctx.closePath();
  ctx.fill();

  // White fascia trim along the roof line
  ctx.strokeStyle = '#f8f9fa';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 48);
  ctx.lineTo(x + 25, y + 18);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w - 25, y + 18);
  ctx.lineTo(x + w + 12, y + 48);
  ctx.stroke();

  // Cupola on top with rooster weathervane
  const cupolaX = x + w / 2 - 20;
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(cupolaX, y - 18, 40, 18);
  ctx.fillStyle = '#1d3557';
  ctx.beginPath();
  ctx.moveTo(cupolaX - 4, y - 18);
  ctx.lineTo(cupolaX + 20, y - 32);
  ctx.lineTo(cupolaX + 44, y - 18);
  ctx.closePath();
  ctx.fill();

  // Weathervane with rotating rooster silhouette
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cupolaX + 20, y - 32);
  ctx.lineTo(cupolaX + 20, y - 44);
  ctx.moveTo(cupolaX + 12, y - 40);
  ctx.lineTo(cupolaX + 28, y - 40);
  ctx.stroke();
  // Rooster
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(cupolaX + 20, y - 46, 3, 0, Math.PI * 2);
  ctx.fill();

  // Upper Hayloft Door with timber hoist beam and golden hay
  const loftX = x + w / 2 - 25;
  // Hoist beam
  ctx.fillStyle = '#582f0e';
  ctx.fillRect(loftX + 23, y + 36, 4, 18);
  // Pulley and hanging rope
  ctx.fillStyle = '#495057';
  ctx.beginPath();
  ctx.arc(loftX + 25, y + 54, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#dda15e';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(loftX + 25, y + 56);
  ctx.lineTo(loftX + 25, y + 78);
  ctx.stroke();

  ctx.fillStyle = '#582f0e';
  ctx.fillRect(loftX, y + 55, 50, 42);
  ctx.strokeStyle = '#f8f9fa';
  ctx.lineWidth = 2;
  ctx.strokeRect(loftX, y + 55, 50, 42);

  // Golden hay spill
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.ellipse(loftX + 25, y + 97, 26, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Weathered wooden wagon wheel leaning against the barn wall
  const wheelX = x + w - 24;
  const wheelY = y + h - 22;
  ctx.strokeStyle = '#8c5836';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(wheelX, wheelY, 12, 0, Math.PI * 2);
  ctx.stroke();
  for (let sp = 0; sp < 4; sp++) {
    const spAngle = (sp * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(wheelX - Math.cos(spAngle) * 12, wheelY - Math.sin(spAngle) * 12);
    ctx.lineTo(wheelX + Math.cos(spAngle) * 12, wheelY + Math.sin(spAngle) * 12);
    ctx.stroke();
  }
  ctx.fillStyle = '#495057';
  ctx.beginPath();
  ctx.arc(wheelX, wheelY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Double Rustic Wooden Barn Doors with white X bracing
  const barnDoorX = x + w / 2 - 36;
  const barnDoorY = y + h - 68;
  const barnDoorW = 72;
  const barnDoorH = 68;

  ctx.fillStyle = '#582f0e';
  ctx.fillRect(barnDoorX, barnDoorY, barnDoorW, barnDoorH);

  // White X cross bracing on left & right doors
  ctx.strokeStyle = '#f8f9fa';
  ctx.lineWidth = 3;
  // Left door
  ctx.strokeRect(barnDoorX + 2, barnDoorY + 2, 33, barnDoorH - 4);
  ctx.beginPath();
  ctx.moveTo(barnDoorX + 2, barnDoorY + 2);
  ctx.lineTo(barnDoorX + 35, barnDoorY + barnDoorH - 2);
  ctx.moveTo(barnDoorX + 35, barnDoorY + 2);
  ctx.lineTo(barnDoorX + 2, barnDoorY + barnDoorH - 2);
  // Right door
  ctx.strokeRect(barnDoorX + 37, barnDoorY + 2, 33, barnDoorH - 4);
  ctx.moveTo(barnDoorX + 37, barnDoorY + 2);
  ctx.lineTo(barnDoorX + 70, barnDoorY + barnDoorH - 2);
  ctx.moveTo(barnDoorX + 70, barnDoorY + 2);
  ctx.lineTo(barnDoorX + 37, barnDoorY + barnDoorH - 2);
  ctx.stroke();

  // Weathered sign: "DAISY HILL PUPPY FARM"
  ctx.fillStyle = '#e9ecef';
  ctx.beginPath();
  ctx.roundRect(x + w / 2 - 60, y + 106, 120, 18, 2);
  ctx.fill();
  ctx.strokeStyle = '#495057';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#18171e';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DAISY HILL PUPPY FARM', x + w / 2, y + 118);
  ctx.textAlign = 'left';
}

/**
 * Overhead Canopies & Foliage (Rendered in front of characters)
 */
function renderSceneryCanopies(ctx: CanvasRenderingContext2D, map: GameMap, timeOfDay: TimeOfDay) {
  if (map.id !== 'overworld') return;

  // 1. Kite-Eating Tree with fluttering diamond kites
  drawKiteEatingTree(ctx, 330, 650);

  // 2. Beautiful neighborhood shade trees
  const trees = [
    { x: 100, y: 120 },
    { x: 470, y: 120 },
    { x: 1000, y: 220 },
    { x: 1480, y: 140 },
    { x: 80, y: 600 },
    { x: 1480, y: 780 },
    { x: 1040, y: 980 },
    { x: 1380, y: 980 },
  ];
  trees.forEach((t) => drawCozyTree(ctx, t.x, t.y));
}

/**
 * Kite-Eating Tree with realistic bark, voluminous branches, and trapped kites
 */
function drawKiteEatingTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Gnarled trunk with spreading roots
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.moveTo(x + 22, y + 110);
  ctx.lineTo(x + 30, y + 45);
  ctx.lineTo(x + 50, y + 45);
  ctx.lineTo(x + 58, y + 110);
  ctx.closePath();
  ctx.fill();

  // Bark texture grooves
  ctx.strokeStyle = '#3d1e03';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + 34, y + 55);
  ctx.lineTo(x + 32, y + 95);
  ctx.moveTo(x + 44, y + 52);
  ctx.lineTo(x + 46, y + 100);
  ctx.stroke();

  // Volumetric multi-layered foliage clusters
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath();
  ctx.ellipse(x + 40, y + 30, 65, 55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mid foliage highlights
  ctx.fillStyle = '#40916c';
  ctx.beginPath();
  ctx.ellipse(x + 25, y + 18, 38, 32, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 55, y + 25, 34, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top sunlit leaves
  ctx.fillStyle = '#52b788';
  ctx.beginPath();
  ctx.ellipse(x + 35, y + 8, 28, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trapped Kites caught in the branches with trailing ribbon tails
  drawCaughtKite(ctx, x + 12, y - 6, '#e63946', '#ffd166'); // Charlie Brown's red kite!
  drawCaughtKite(ctx, x + 68, y + 12, '#3a86ff', '#ffffff'); // Blue kite
  drawCaughtKite(ctx, x + 38, y + 38, '#ffbe0b', '#fb5607'); // Yellow kite
}

function drawCaughtKite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color1: string,
  color2: string
) {
  // Diamond kite with cross spar
  ctx.fillStyle = color1;
  ctx.beginPath();
  ctx.moveTo(x, y - 11);
  ctx.lineTo(x + 9, y);
  ctx.lineTo(x, y + 11);
  ctx.lineTo(x - 9, y);
  ctx.closePath();
  ctx.fill();

  // Cross spars
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - 11);
  ctx.lineTo(x, y + 11);
  ctx.moveTo(x - 9, y);
  ctx.lineTo(x + 9, y);
  ctx.stroke();

  // Wavy kite tail with bows
  ctx.strokeStyle = '#f8f9fa';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 11);
  ctx.quadraticCurveTo(x + 12, y + 20, x + 5, y + 28);
  ctx.stroke();

  // Tail bow ribbons
  ctx.fillStyle = color2;
  ctx.fillRect(x + 4, y + 20, 5, 3);
  ctx.fillRect(x + 7, y + 27, 4, 3);
}

function drawCozyTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Trunk
  ctx.fillStyle = '#6f4e37';
  ctx.beginPath();
  ctx.roundRect(x + 24, y + 35, 14, 48, 3);
  ctx.fill();

  // Layered canopy
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath();
  ctx.ellipse(x + 31, y + 25, 38, 32, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#52b788';
  ctx.beginPath();
  ctx.ellipse(x + 27, y + 18, 26, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#74c69d';
  ctx.beginPath();
  ctx.ellipse(x + 24, y + 12, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * High-Fidelity Interiors (All 8 Peanuts homes & historic locations)
 */
function renderInteriorMap(ctx: CanvasRenderingContext2D, map: GameMap, timeOfDay: TimeOfDay) {
  // Deep dark surround
  ctx.fillStyle = '#111015';
  ctx.fillRect(0, 0, map.width, map.height);

  if (map.id === 'interior_ari') {
    renderAriInterior(ctx, map, timeOfDay);
  } else if (map.id === 'interior_charlie') {
    renderCharlieInterior(ctx, map, timeOfDay);
  } else if (map.id === 'interior_lucy_linus') {
    renderLucyLinusInterior(ctx, map, timeOfDay);
  } else if (map.id === 'interior_peppermint_patty') {
    renderPattyInterior(ctx, map, timeOfDay);
  } else if (map.id === 'interior_marcie') {
    renderMarcieInterior(ctx, map, timeOfDay);
  } else if (map.id === 'interior_snoopy') {
    renderSnoopyInterior(ctx, map, timeOfDay);
  } else if (map.id === 'interior_school') {
    renderSchoolInterior(ctx, map, timeOfDay);
  } else if (map.id === 'interior_daisy_hill_barn') {
    renderDaisyBarnInterior(ctx, map, timeOfDay);
  }
}

/** 1. Ari's Cozy Home */
function renderAriInterior(ctx: CanvasRenderingContext2D, map: GameMap, timeOfDay: TimeOfDay) {
  // Tongue-and-groove honey oak hardwood floor
  ctx.fillStyle = '#d4a373';
  ctx.fillRect(40, 40, map.width - 80, map.height - 80);

  // Hardwood floor planks
  ctx.strokeStyle = '#b08968';
  ctx.lineWidth = 1;
  const plankH = 22;
  const plankW = 65;
  for (let py = 40; py < map.height - 40; py += plankH) {
    const rowOffset = (Math.floor(py / plankH) % 2) * (plankW / 2);
    ctx.beginPath();
    ctx.moveTo(40, py);
    ctx.lineTo(map.width - 40, py);
    ctx.stroke();

    for (let px = 40 - plankW; px < map.width - 40; px += plankW) {
      ctx.beginPath();
      ctx.moveTo(px + rowOffset, py);
      ctx.lineTo(px + rowOffset, py + plankH);
      ctx.stroke();
    }
  }

  // Soft warm wall with baseboard trim
  ctx.fillStyle = '#faedcd';
  ctx.fillRect(40, 40, map.width - 80, 42);
  ctx.fillStyle = '#d4a373';
  ctx.fillRect(40, 80, map.width - 80, 4);

  // Bohemian Woven Rug in living area
  ctx.fillStyle = '#e76f51';
  ctx.beginPath();
  ctx.ellipse(260, 240, 115, 68, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f4a261';
  ctx.beginPath();
  ctx.ellipse(260, 240, 92, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e9c46a';
  ctx.beginPath();
  ctx.ellipse(260, 240, 65, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cozy Plush Sofa
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.roundRect(200, 210, 120, 44, 4);
  ctx.fill();
  ctx.fillStyle = '#b45309';
  ctx.fillRect(205, 215, 110, 14); // Back cushions
  // Toss pillows
  ctx.fillStyle = '#84a59d';
  ctx.beginPath();
  ctx.roundRect(205, 226, 18, 16, 2);
  ctx.roundRect(297, 226, 18, 16, 2);
  ctx.fill();

  // Coffee Table
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.roundRect(225, 268, 70, 28, 2);
  ctx.fill();
  // Ceramic mug with warm steam
  ctx.fillStyle = '#f8f9fa';
  ctx.beginPath();
  ctx.arc(260, 280, 5, 0, Math.PI * 2);
  ctx.fill();

  // Ari's Bed with patchwork quilt & pillows
  ctx.fillStyle = '#6f4e37';
  ctx.beginPath();
  ctx.roundRect(65, 90, 85, 96, 3);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(70, 120, 75, 62);
  ctx.fillStyle = '#b5838d';
  ctx.fillRect(70, 136, 75, 46);
  ctx.fillStyle = '#ffb4a2';
  ctx.beginPath();
  ctx.roundRect(72, 96, 32, 20, 3);
  ctx.roundRect(110, 96, 32, 20, 3);
  ctx.fill();

  // Writing Desk with lamp, notebook & inkwell
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.roundRect(190, 85, 105, 45, 2);
  ctx.fill();
  // Blotter
  ctx.fillStyle = '#264653';
  ctx.fillRect(210, 90, 65, 32);
  // Notebook
  ctx.fillStyle = '#fefae0';
  ctx.fillRect(225, 94, 34, 24);
  ctx.fillStyle = '#b7b7a4';
  ctx.fillRect(228, 98, 26, 1);
  ctx.fillRect(228, 102, 26, 1);
  ctx.fillRect(228, 106, 26, 1);
  // Brass Lamp
  ctx.fillStyle = '#e76f51';
  ctx.fillRect(198, 88, 7, 14);
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.roundRect(194, 84, 15, 8, 2);
  ctx.fill();

  // Bookshelf with colorful spines
  ctx.fillStyle = '#7f4f24';
  ctx.beginPath();
  ctx.roundRect(330, 85, 80, 65, 2);
  ctx.fill();
  const bookColors = ['#e63946', '#457b9d', '#2a9d8f', '#e76f51', '#f4a261', '#9b5de5'];
  for (let bx = 336; bx < 400; bx += 9) {
    ctx.fillStyle = bookColors[(bx * 3) % bookColors.length];
    ctx.fillRect(bx, 92, 7, 24);
    ctx.fillRect(bx, 122, 7, 22);
  }

  // Dining table & wooden chairs
  ctx.fillStyle = '#9c6644';
  ctx.beginPath();
  ctx.roundRect(350, 220, 65, 48, 3);
  ctx.fill();
  // Teapot on table
  ctx.fillStyle = '#457b9d';
  ctx.beginPath();
  ctx.arc(382, 244, 7, 0, Math.PI * 2);
  ctx.fill();

  // Kitchen counter with sink & kettle
  ctx.fillStyle = '#e29578';
  ctx.beginPath();
  ctx.roundRect(390, 310, 80, 50, 2);
  ctx.fill();
  ctx.fillStyle = '#ced4da';
  ctx.fillRect(405, 318, 24, 20); // Stainless sink
  ctx.fillStyle = '#d90429';
  ctx.beginPath();
  ctx.arc(448, 328, 6, 0, Math.PI * 2); // Tea kettle
  ctx.fill();

  // Welcome Doormat at door
  ctx.fillStyle = '#b08968';
  ctx.beginPath();
  ctx.roundRect(230, 380, 60, 20, 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('SALIDA', 244, 393);
}

/** 2. Charlie Brown & Sally's Classic Home */
function renderCharlieInterior(ctx: CanvasRenderingContext2D, map: GameMap, timeOfDay: TimeOfDay) {
  // Warm golden-sand parquet flooring
  ctx.fillStyle = '#e0a96d';
  ctx.fillRect(35, 35, map.width - 70, map.height - 70);

  // Wood parquet tile grid
  ctx.strokeStyle = '#c58b52';
  ctx.lineWidth = 1;
  for (let py = 35; py < map.height - 35; py += 28) {
    for (let px = 35; px < map.width - 35; px += 28) {
      ctx.strokeRect(px, py, 28, 28);
    }
  }

  // Wall with wallpaper
  ctx.fillStyle = '#fefae0';
  ctx.fillRect(35, 35, map.width - 70, 45);
  ctx.fillStyle = '#d4a373';
  ctx.fillRect(35, 78, map.width - 70, 4);

  // Charles Schulz's Iconic Mustard Sofa!
  ctx.fillStyle = '#e9c46a';
  ctx.beginPath();
  ctx.roundRect(190, 200, 130, 46, 4);
  ctx.fill();
  ctx.fillStyle = '#d4a373';
  ctx.fillRect(195, 205, 120, 15); // Back cushions

  // Side table with Rotary Phone!
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.roundRect(145, 202, 36, 36, 2);
  ctx.fill();
  ctx.fillStyle = '#18171e';
  ctx.beginPath();
  ctx.arc(163, 218, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ced4da';
  ctx.beginPath();
  ctx.arc(163, 218, 4, 0, Math.PI * 2);
  ctx.fill();

  // Vintage Wooden CRT TV with rabbit ears antenna!
  ctx.fillStyle = '#4a2810';
  ctx.beginPath();
  ctx.roundRect(220, 130, 68, 44, 3);
  ctx.fill();
  ctx.fillStyle = '#8ecae6';
  ctx.beginPath();
  ctx.roundRect(228, 136, 42, 30, 2);
  ctx.fill();
  // Rabbit ears
  ctx.strokeStyle = '#ced4da';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(254, 130);
  ctx.lineTo(240, 114);
  ctx.moveTo(254, 130);
  ctx.lineTo(268, 114);
  ctx.stroke();

  // Charlie Brown's Bedroom (Top Right)
  // Bed with Charlie Brown's iconic bright yellow quilt & black zig-zag chevron stripe!
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.roundRect(380, 90, 85, 96, 3);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(385, 118, 75, 64);
  // Yellow quilt
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(385, 132, 75, 50);
  // Black Schulz zig-zag stripe!
  ctx.fillStyle = '#18171e';
  ctx.beginPath();
  ctx.moveTo(385, 155);
  ctx.lineTo(398, 147);
  ctx.lineTo(412, 155);
  ctx.lineTo(426, 147);
  ctx.lineTo(440, 155);
  ctx.lineTo(454, 147);
  ctx.lineTo(460, 152);
  ctx.lineTo(454, 160);
  ctx.lineTo(440, 153);
  ctx.lineTo(426, 160);
  ctx.lineTo(412, 153);
  ctx.lineTo(398, 160);
  ctx.closePath();
  ctx.fill();

  // Baseball pennants & baseball glove on shelf
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.moveTo(385, 60);
  ctx.lineTo(425, 70);
  ctx.lineTo(385, 78);
  ctx.closePath();
  ctx.fill();

  // Sally's Bedroom (Top Left)
  // Pink silk ribbon bed
  ctx.fillStyle = '#ffb4a2';
  ctx.beginPath();
  ctx.roundRect(60, 90, 80, 92, 3);
  ctx.fill();
  ctx.fillStyle = '#ffcad4';
  ctx.fillRect(64, 120, 72, 58);
  // Sally's desk with love note to Linus ("Dear Sweet Babboo")
  ctx.fillStyle = '#7f4f24';
  ctx.beginPath();
  ctx.roundRect(60, 200, 65, 38, 2);
  ctx.fill();
  ctx.fillStyle = '#fefae0';
  ctx.fillRect(72, 206, 26, 20);
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.arc(85, 216, 4, 0, Math.PI * 2); // Heart!
  ctx.fill();

  // Kitchen Corner (Bottom Right)
  // Snoopy's Stainless Steel Red Food Bowl on kitchen floor!
  ctx.fillStyle = '#d90429';
  ctx.beginPath();
  ctx.ellipse(470, 360, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ef233c';
  ctx.beginPath();
  ctx.ellipse(470, 358, 13, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Dog biscuit inside!
  ctx.fillStyle = '#dda15e';
  ctx.fillRect(464, 356, 12, 3);

  // Dining table
  ctx.fillStyle = '#b08968';
  ctx.beginPath();
  ctx.roundRect(380, 260, 80, 55, 3);
  ctx.fill();

  // Doormat
  ctx.fillStyle = '#9c6644';
  ctx.beginPath();
  ctx.roundRect(260, 420, 60, 20, 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('SALIDA', 274, 433);
}

/** 3. Lucy & Linus's Home */
function renderLucyLinusInterior(ctx: CanvasRenderingContext2D, map: GameMap, timeOfDay: TimeOfDay) {
  // Rich mahogany floor with decorative area rugs
  ctx.fillStyle = '#b08968';
  ctx.fillRect(35, 35, map.width - 70, map.height - 70);

  // Linus's Bedroom (Top Right)
  // Bed with Linus's famous Blue Security Blanket!
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.roundRect(380, 90, 85, 96, 3);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(385, 120, 75, 62);
  // Iconic Peanuts Baby Blue Blanket folded across!
  ctx.fillStyle = '#4cc9f0';
  ctx.beginPath();
  ctx.roundRect(385, 135, 75, 42, 3);
  ctx.fill();
  ctx.fillStyle = '#4895ef';
  ctx.fillRect(390, 142, 65, 4);

  // Linus's huge philosophy bookshelf
  ctx.fillStyle = '#3d1e03';
  ctx.beginPath();
  ctx.roundRect(480, 90, 60, 110, 2);
  ctx.fill();
  for (let by = 98; by < 190; by += 22) {
    ctx.fillStyle = '#264653';
    ctx.fillRect(484, by, 52, 18);
  }

  // Lucy's Bedroom (Top Left)
  // Lucy's vanity mirror where she rehearses speeches
  ctx.fillStyle = '#7f4f24';
  ctx.beginPath();
  ctx.roundRect(65, 90, 70, 40, 2);
  ctx.fill();
  // Arched ornate mirror
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(100, 72, 18, Math.PI, 0, false);
  ctx.lineTo(118, 90);
  ctx.lineTo(82, 90);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#90e0ef';
  ctx.beginPath();
  ctx.arc(100, 72, 15, Math.PI, 0, false);
  ctx.lineTo(115, 88);
  ctx.lineTo(85, 88);
  ctx.closePath();
  ctx.fill();

  // Lucy's Wardrobe with blue dresses
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.roundRect(145, 85, 55, 75, 2);
  ctx.fill();
  ctx.fillStyle = '#1d3557';
  ctx.fillRect(152, 100, 18, 48); // Blue dress silhouette

  // Framed Psychiatry Advice Sign draft on wall!
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.roundRect(230, 50, 70, 30, 2);
  ctx.fill();
  ctx.fillStyle = '#18171e';
  ctx.font = 'bold 6px sans-serif';
  ctx.fillText('CONSEJO: 5¢', 240, 68);

  // Living Room: Upright Practice Piano
  ctx.fillStyle = '#18171e';
  ctx.beginPath();
  ctx.roundRect(190, 180, 80, 44, 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(195, 210, 70, 10);
  // Black keys
  ctx.fillStyle = '#18171e';
  for (let k = 198; k < 262; k += 6) {
    ctx.fillRect(k, 210, 3, 6);
  }

  // Plush velvet armchair
  ctx.fillStyle = '#780000';
  ctx.beginPath();
  ctx.roundRect(290, 180, 50, 46, 4);
  ctx.fill();

  // Doormat
  ctx.fillStyle = '#9c6644';
  ctx.beginPath();
  ctx.roundRect(260, 420, 60, 20, 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('SALIDA', 274, 433);
}

/** 4. Peppermint Patty's Sporty Home */
function renderPattyInterior(ctx: CanvasRenderingContext2D, map: GameMap, timeOfDay: TimeOfDay) {
  // Light natural pine planks
  ctx.fillStyle = '#e9d8a6';
  ctx.fillRect(35, 35, map.width - 70, map.height - 70);

  // Sports Trophy Case with glittering trophies & medals
  ctx.fillStyle = '#3d1e03';
  ctx.beginPath();
  ctx.roundRect(65, 80, 95, 75, 2);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  // Golden trophies!
  ctx.beginPath();
  ctx.arc(88, 102, 8, 0, Math.PI * 2);
  ctx.arc(115, 100, 10, 0, Math.PI * 2);
  ctx.arc(140, 104, 7, 0, Math.PI * 2);
  ctx.fill();

  // Wall rack with baseball bats & caps
  ctx.fillStyle = '#bc6c25';
  ctx.fillRect(180, 65, 80, 8);
  // Baseball bats leaning
  ctx.strokeStyle = '#d4a373';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(190, 115);
  ctx.lineTo(198, 70);
  ctx.moveTo(210, 115);
  ctx.lineTo(218, 70);
  ctx.stroke();

  // Patty's informal slouchy couch
  ctx.fillStyle = '#2b2d42';
  ctx.beginPath();
  ctx.roundRect(175, 190, 120, 50, 4);
  ctx.fill();
  ctx.fillStyle = '#8d99ae';
  ctx.fillRect(180, 195, 110, 16);

  // Patty's Bedroom: Athletic Bed with green & navy jersey quilt
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.roundRect(360, 90, 85, 96, 3);
  ctx.fill();
  ctx.fillStyle = '#2d6a4f';
  ctx.fillRect(365, 125, 75, 58);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(365, 145, 75, 8); // Jersey stripe

  // Patty's homework desk with snoozing spot marked!
  ctx.fillStyle = '#7f4f24';
  ctx.beginPath();
  ctx.roundRect(360, 215, 80, 42, 2);
  ctx.fill();
  ctx.fillStyle = '#fefae0';
  ctx.fillRect(375, 222, 34, 26);
  // Grade: D- with red circle (classic Peanuts gag!)
  ctx.fillStyle = '#d90429';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('D-', 385, 240);

  // Doormat
  ctx.fillStyle = '#9c6644';
  ctx.beginPath();
  ctx.roundRect(240, 400, 60, 20, 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('SALIDA', 254, 413);
}

/** 5. Marcie's Scholarly Home */
function renderMarcieInterior(ctx: CanvasRenderingContext2D, map: GameMap, timeOfDay: TimeOfDay) {
  // Refined birch hardwood with geometric runner
  ctx.fillStyle = '#d5bdaf';
  ctx.fillRect(35, 35, map.width - 70, map.height - 70);

  // Elegant Persian woven runner in center
  ctx.fillStyle = '#6b705c';
  ctx.beginPath();
  ctx.roundRect(160, 160, 140, 90, 4);
  ctx.fill();
  ctx.fillStyle = '#a5a58d';
  ctx.fillRect(168, 168, 124, 74);

  // Grand Study: Floor-to-ceiling library wall
  ctx.fillStyle = '#3a2e39';
  ctx.beginPath();
  ctx.roundRect(60, 75, 140, 80, 2);
  ctx.fill();
  const spines = ['#b5838d', '#6d597a', '#355070', '#e56b6f', '#eaac8b'];
  for (let bx = 66; bx < 192; bx += 8) {
    ctx.fillStyle = spines[(bx * 7) % spines.length];
    ctx.fillRect(bx, 82, 6, 26);
    ctx.fillRect(bx, 116, 6, 32);
  }

  // Marcie's Study Desk with green banker's lamp & spare round spectacles!
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.roundRect(65, 180, 85, 46, 2);
  ctx.fill();
  // Green glass banker's lamp
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath();
  ctx.roundRect(72, 185, 18, 8, 2);
  ctx.fill();
  // Marcie's iconic round spectacles on desk tray!
  ctx.strokeStyle = '#18171e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(108, 202, 4, 0, Math.PI * 2);
  ctx.arc(120, 202, 4, 0, Math.PI * 2);
  ctx.moveTo(112, 202);
  ctx.lineTo(116, 202);
  ctx.stroke();

  // Tea service on side table
  ctx.fillStyle = '#7f4f24';
  ctx.beginPath();
  ctx.roundRect(230, 180, 45, 40, 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.beginPath();
  ctx.arc(252, 200, 7, 0, Math.PI * 2); // Teapot
  ctx.fill();

  // Marcie's Bedroom: Crisp lavender sheets
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.roundRect(360, 85, 85, 96, 3);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(365, 115, 75, 62);
  ctx.fillStyle = '#b8c0ff';
  ctx.fillRect(365, 130, 75, 48);

  // Doormat
  ctx.fillStyle = '#9c6644';
  ctx.beginPath();
  ctx.roundRect(240, 400, 60, 20, 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('SALIDA', 254, 413);
}

/** 6. Snoopy's Secret Underground Luxury Mansion */
function renderSnoopyInterior(ctx: CanvasRenderingContext2D, map: GameMap, timeOfDay: TimeOfDay) {
  // Dark polished mahogany hardwood with parquet border
  ctx.fillStyle = '#3a1e05';
  ctx.fillRect(30, 30, map.width - 60, map.height - 60);

  // Hardwood plank grooves
  ctx.strokeStyle = '#271302';
  ctx.lineWidth = 1;
  for (let py = 30; py < map.height - 30; py += 24) {
    ctx.beginPath();
    ctx.moveTo(30, py);
    ctx.lineTo(map.width - 30, py);
    ctx.stroke();
  }

  // Opulent Persian Rug with detailed gold and ruby border & fringe tassels
  ctx.fillStyle = '#780000';
  ctx.beginPath();
  ctx.roundRect(175, 155, 250, 150, 4);
  ctx.fill();
  ctx.fillStyle = '#c1121f';
  ctx.fillRect(185, 165, 230, 130);
  // Gold fringe tassels
  ctx.fillStyle = '#ffd166';
  for (let fx = 180; fx <= 420; fx += 8) {
    ctx.fillRect(fx, 152, 4, 3);
    ctx.fillRect(fx, 305, 4, 3);
  }
  ctx.fillStyle = '#fdf0d5';
  ctx.beginPath();
  ctx.ellipse(300, 230, 60, 35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#003049';
  ctx.beginPath();
  ctx.ellipse(300, 230, 40, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stone Fireplace with crackling flames & carved mantle
  ctx.fillStyle = '#495057';
  ctx.fillRect(225, 68, 150, 65);
  ctx.fillStyle = '#ced4da'; // Carved limestone mantelpiece
  ctx.fillRect(220, 64, 160, 8);
  ctx.fillStyle = '#212529';
  ctx.fillRect(250, 84, 100, 48);

  // Blazing animated hearth flame
  const flameBob = Math.sin(Date.now() / 150) * 3;
  ctx.fillStyle = '#f48c06';
  ctx.beginPath();
  ctx.moveTo(275, 126);
  ctx.lineTo(290, 95 + flameBob);
  ctx.lineTo(300, 115);
  ctx.lineTo(315, 90 - flameBob);
  ctx.lineTo(325, 126);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffba08';
  ctx.beginPath();
  ctx.moveTo(285, 126);
  ctx.lineTo(300, 100 + flameBob);
  ctx.lineTo(315, 126);
  ctx.closePath();
  ctx.fill();

  // Grand Crystal Chandelier in center ceiling
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(300, 40, 12, 0, Math.PI);
  ctx.fill();
  // Sparkling crystal pendants
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  for (let cx = 290; cx <= 310; cx += 5) {
    ctx.fillRect(cx, 40, 2, 7);
  }

  // Billiards Table with carved mahogany legs
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.roundRect(85, 175, 130, 88, 4);
  ctx.fill();
  ctx.fillStyle = '#1b4332'; // Tournament green felt
  ctx.fillRect(94, 184, 112, 70);

  // Billiard balls & cue stick
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(135, 219, 3, 0, Math.PI * 2); // Cue ball
  ctx.fill();
  ctx.fillStyle = '#d90429';
  ctx.beginPath();
  ctx.arc(170, 218, 3, 0, Math.PI * 2);
  ctx.arc(176, 214, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#18171e';
  ctx.beginPath();
  ctx.arc(176, 222, 3, 0, Math.PI * 2); // 8-ball
  ctx.fill();

  // Van Gogh Painting in Baroque Gold Gilded Frame
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.roundRect(155, 60, 58, 38, 2);
  ctx.fill();
  ctx.fillStyle = '#1d3557';
  ctx.fillRect(160, 65, 48, 28);
  // Starry Night swirls
  ctx.fillStyle = '#ffbe0b';
  ctx.beginPath();
  ctx.arc(195, 76, 5, 0, Math.PI * 2);
  ctx.fill();

  // Root Beer Barrel on oak stand with tap & frothy mug!
  const barrelX = 90;
  const barrelY = 90;
  ctx.fillStyle = '#7f4f24';
  ctx.beginPath();
  ctx.roundRect(barrelX, barrelY, 35, 44, 4);
  ctx.fill();
  ctx.strokeStyle = '#18171e';
  ctx.lineWidth = 2;
  ctx.strokeRect(barrelX, barrelY + 6, 35, 3);
  ctx.strokeRect(barrelX, barrelY + 34, 35, 3);
  // Brass spigot
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(barrelX + 35, barrelY + 22, 6, 3);
  // Mug of root beer with frothy head
  ctx.fillStyle = '#582f0e';
  ctx.fillRect(barrelX + 44, barrelY + 20, 8, 10);
  ctx.fillStyle = '#ffffff'; // White foam
  ctx.beginPath();
  ctx.arc(barrelX + 48, barrelY + 20, 5, 0, Math.PI * 2);
  ctx.fill();

  // Woodstock's Tiny Velvet Chaise Lounge next to hearth
  ctx.fillStyle = '#7209b7';
  ctx.beginPath();
  ctx.roundRect(385, 100, 28, 18, 3);
  ctx.fill();
  ctx.fillStyle = '#b5179e';
  ctx.fillRect(387, 103, 10, 12);
  // Tiny gold water goblet
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(418, 106, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Snoopy's Vintage Red Typewriter on mahogany desk
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.roundRect(440, 100, 85, 55, 2);
  ctx.fill();
  ctx.fillStyle = '#d90429';
  ctx.beginPath();
  ctx.roundRect(455, 112, 55, 36, 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(465, 98, 35, 20); // "It was a dark and stormy night..." paper!
  ctx.fillStyle = '#212529';
  ctx.fillRect(470, 102, 25, 1);
  ctx.fillRect(470, 106, 25, 1);

  // Record player console with vinyl LP spinning
  ctx.fillStyle = '#2b2d42';
  ctx.beginPath();
  ctx.roundRect(450, 200, 75, 50, 3);
  ctx.fill();
  ctx.fillStyle = '#18171e';
  ctx.beginPath();
  ctx.arc(488, 225, 16, 0, Math.PI * 2); // Vinyl record
  ctx.fill();
  ctx.fillStyle = '#d90429';
  ctx.beginPath();
  ctx.arc(488, 225, 5, 0, Math.PI * 2); // Label
  ctx.fill();

  // Secret staircase up to the doghouse entrance
  ctx.fillStyle = '#6f4e37';
  ctx.beginPath();
  ctx.roundRect(270, 440, 70, 25, 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('SUBIR A CASETA', 276, 456);
}

/** 7. Elementary School Classroom */
function renderSchoolInterior(ctx: CanvasRenderingContext2D, map: GameMap, timeOfDay: TimeOfDay) {
  // School classroom parquet
  ctx.fillStyle = '#e9edc9';
  ctx.fillRect(30, 30, map.width - 60, map.height - 60);

  // Parquet tile pattern
  ctx.strokeStyle = '#ccd5ae';
  ctx.lineWidth = 1;
  for (let py = 30; py < map.height - 30; py += 28) {
    for (let px = 30; px < map.width - 30; px += 28) {
      ctx.strokeRect(px, py, 28, 28);
    }
  }

  // Warm sunbeams slanting across floor
  const sunGrad = ctx.createLinearGradient(30, 30, 300, 300);
  sunGrad.addColorStop(0, 'rgba(255, 250, 220, 0.35)');
  sunGrad.addColorStop(1, 'rgba(255, 250, 220, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.moveTo(30, 30);
  ctx.lineTo(260, 30);
  ctx.lineTo(400, 350);
  ctx.lineTo(100, 350);
  ctx.closePath();
  ctx.fill();

  // Wall & Large Green Slate Chalkboard
  ctx.fillStyle = '#ccd5ae';
  ctx.fillRect(30, 30, map.width - 60, 48);

  // Alphabet Banner ("A B C D E F G H I J K L M N...")
  ctx.fillStyle = '#fefae0';
  ctx.fillRect(45, 33, map.width - 90, 10);
  ctx.fillStyle = '#d90429';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', 52, 41);

  // Green Chalkboard
  ctx.fillStyle = '#1e3f20';
  ctx.beginPath();
  ctx.roundRect(180, 46, 225, 42, 2);
  ctx.fill();

  ctx.fillStyle = '#d4a373';
  ctx.fillRect(178, 44, 229, 3); // Frame top
  ctx.fillRect(178, 87, 229, 4); // Chalk rail with white chalk
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(220, 88, 8, 2);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(235, 88, 8, 2); // Yellow chalk

  ctx.fillStyle = '#f8f9fa';
  ctx.font = '12px sans-serif';
  ctx.fillText('2 + 2 = 4', 205, 66);
  ctx.fillText('Bienvenida Ari', 295, 66);

  // Wall Clock showing 9:00 AM
  const clockX = 135;
  const clockY = 56;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(clockX, clockY, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7f4f24';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = '#18171e';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(clockX, clockY);
  ctx.lineTo(clockX, clockY - 7);
  ctx.moveTo(clockX, clockY);
  ctx.lineTo(clockX - 5, clockY);
  ctx.stroke();

  // Classroom American Flag in top right corner
  ctx.strokeStyle = '#6f4e37';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(430, 85);
  ctx.lineTo(430, 42);
  ctx.stroke();
  ctx.fillStyle = '#d90429';
  ctx.fillRect(432, 42, 24, 15);
  ctx.fillStyle = '#1d3557';
  ctx.fillRect(432, 42, 10, 8);

  // Student Desks with inkwells & colorful notebooks
  const deskPositions = [
    { x: 100, y: 180 },
    { x: 250, y: 180 },
    { x: 400, y: 180 },
    { x: 100, y: 260 },
    { x: 250, y: 260 },
    { x: 400, y: 260 },
  ];
  const deskBookColors = ['#e63946', '#3a86ff', '#2a9d8f', '#ffbe0b', '#8338ec', '#fb5607'];
  deskPositions.forEach((d, idx) => {
    ctx.fillStyle = '#7f4f24';
    ctx.beginPath();
    ctx.roundRect(d.x, d.y, 68, 46, 2);
    ctx.fill();
    ctx.fillStyle = '#936639';
    ctx.fillRect(d.x + 4, d.y + 4, 60, 38);
    // Notebook on desk
    ctx.fillStyle = deskBookColors[idx % deskBookColors.length];
    ctx.fillRect(d.x + 12, d.y + 12, 18, 22);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(d.x + 14, d.y + 14, 14, 18);
    // Yellow pencil
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(d.x + 34, d.y + 14, 14, 2);
    // Inkwell
    ctx.fillStyle = '#18171e';
    ctx.beginPath();
    ctx.arc(d.x + 55, d.y + 12, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Student Backpacks hanging on pegs along left wall
  const backpackColors = ['#d90429', '#023e8a', '#38b000', '#7209b7'];
  backpackColors.forEach((col, i) => {
    ctx.fillStyle = '#582f0e';
    ctx.fillRect(36, 120 + i * 40, 5, 4); // Peg
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.roundRect(40, 122 + i * 40, 16, 22, 3);
    ctx.fill();
  });

  // Teacher Desk with polished red apple & megaphone
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.roundRect(230, 100, 125, 48, 2);
  ctx.fill();

  ctx.fillStyle = '#d90429';
  ctx.beginPath();
  ctx.arc(250, 114, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#588157';
  ctx.fillRect(249, 108, 2, 3);

  // Megaphone ("Wah wah wah!")
  ctx.fillStyle = '#adb5bd';
  ctx.beginPath();
  ctx.moveTo(310, 110);
  ctx.lineTo(330, 104);
  ctx.lineTo(330, 122);
  ctx.closePath();
  ctx.fill();

  // Classroom Wastebasket with crumpled papers
  ctx.fillStyle = '#6c757d';
  ctx.beginPath();
  ctx.roundRect(365, 115, 16, 20, 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.beginPath();
  ctx.arc(373, 115, 4, 0, Math.PI * 2);
  ctx.fill();

  // Exit doormat
  ctx.fillStyle = '#7f4f24';
  ctx.beginPath();
  ctx.roundRect(280, 440, 60, 20, 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('SALIDA', 294, 453);
}

/** 8. Daisy Hill Puppy Barn */
function renderDaisyBarnInterior(ctx: CanvasRenderingContext2D, map: GameMap, timeOfDay: TimeOfDay) {
  // Rustic timber barn planks
  ctx.fillStyle = '#8c5836';
  ctx.fillRect(30, 30, map.width - 60, map.height - 60);

  // Weathered barn floor grooves
  ctx.strokeStyle = '#6f4325';
  ctx.lineWidth = 1;
  for (let py = 30; py < map.height - 30; py += 18) {
    ctx.beginPath();
    ctx.moveTo(30, py);
    ctx.lineTo(map.width - 30, py);
    ctx.stroke();
  }

  // Scattered golden straw tufts
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 1.2;
  for (let s = 0; s < 45; s++) {
    const sx = (s * 37) % (map.width - 100) + 50;
    const sy = (s * 53) % (map.height - 100) + 50;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + 8, sy + 3);
    ctx.moveTo(sx + 3, sy - 2);
    ctx.lineTo(sx + 7, sy + 6);
    ctx.stroke();
  }

  // Exposed rustic timber beams
  ctx.fillStyle = '#582f0e';
  ctx.fillRect(30, 30, map.width - 60, 16);
  ctx.fillRect(30, 30, 16, map.height - 60);
  ctx.fillRect(map.width - 46, 30, 16, map.height - 60);

  // Stacked Burlap Puppy Chow Sacks
  const sackX = 40;
  const sackY = 55;
  ctx.fillStyle = '#d4a373';
  ctx.beginPath();
  ctx.roundRect(sackX, sackY, 32, 22, 4);
  ctx.roundRect(sackX + 2, sackY + 18, 30, 20, 4);
  ctx.fill();
  ctx.fillStyle = '#7f4f24';
  ctx.font = 'bold 5px sans-serif';
  ctx.fillText('PUPPY', sackX + 4, sackY + 12);
  ctx.fillText('CHOW', sackX + 5, sackY + 28);

  // Golden Hay Bales arranged with cozy blankets
  const hayBales = [
    { x: 80, y: 90 },
    { x: 140, y: 90 },
    { x: 80, y: 145 },
    { x: 380, y: 90 },
    { x: 440, y: 90 },
  ];

  hayBales.forEach((h) => {
    // Hay bale body
    ctx.fillStyle = '#fcbf49';
    ctx.beginPath();
    ctx.roundRect(h.x, h.y, 52, 34, 3);
    ctx.fill();
    // Baling twine
    ctx.strokeStyle = '#d4a373';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(h.x + 16, h.y);
    ctx.lineTo(h.x + 16, h.y + 34);
    ctx.moveTo(h.x + 36, h.y);
    ctx.lineTo(h.x + 36, h.y + 34);
    ctx.stroke();
  });

  // Cozy plaid wool blanket draped over one hay bale
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.roundRect(138, 96, 42, 24, 2);
  ctx.fill();
  ctx.fillStyle = '#2b2d42';
  ctx.fillRect(145, 96, 4, 24);
  ctx.fillRect(165, 96, 4, 24);

  // Puppy Playpen Area (Bottom Left)
  ctx.fillStyle = '#dda15e';
  ctx.beginPath();
  ctx.roundRect(55, 230, 110, 85, 4);
  ctx.fill();
  ctx.strokeStyle = '#bc6c25';
  ctx.lineWidth = 2;
  ctx.strokeRect(55, 230, 110, 85);

  // Puppy accessories in playpen: Red rubber ball, chew bone & milk bowl
  ctx.fillStyle = '#d90429';
  ctx.beginPath();
  ctx.arc(80, 260, 8, 0, Math.PI * 2); // Red ball
  ctx.fill();
  // White chew bone
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(105, 255, 14, 4);
  ctx.beginPath();
  ctx.arc(105, 255, 3, 0, Math.PI * 2);
  ctx.arc(105, 259, 3, 0, Math.PI * 2);
  ctx.arc(119, 255, 3, 0, Math.PI * 2);
  ctx.arc(119, 259, 3, 0, Math.PI * 2);
  ctx.fill();
  // Blue milk bowl
  ctx.fillStyle = '#0077b6';
  ctx.beginPath();
  ctx.ellipse(135, 280, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa'; // Milk
  ctx.beginPath();
  ctx.ellipse(135, 279, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // The Snoopy Puppyhood Memorial Table!
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.roundRect(220, 130, 120, 60, 3);
  ctx.fill();

  // Vintage framed photo album: "Snoopy & Brothers & Sisters"
  ctx.fillStyle = '#dda15e';
  ctx.beginPath();
  ctx.roundRect(245, 140, 70, 42, 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(250, 144, 60, 34);

  // Little puppy silhouettes on the photo!
  ctx.fillStyle = '#18171e';
  ctx.beginPath();
  ctx.arc(268, 158, 4, 0, Math.PI * 2); // Snoopy puppy
  ctx.arc(280, 158, 4, 0, Math.PI * 2); // Spike
  ctx.arc(292, 158, 4, 0, Math.PI * 2); // Belle
  ctx.fill();

  // Brass Plaque: "Daisy Hill 1950"
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.roundRect(240, 194, 80, 14, 2);
  ctx.fill();
  ctx.fillStyle = '#18171e';
  ctx.font = 'bold 6px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DONDE NACIÓ SNOOPY', 280, 204);
  ctx.textAlign = 'left';

  // Warm hanging lantern with glowing light pool
  ctx.strokeStyle = '#18171e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(280, 46);
  ctx.lineTo(280, 80);
  ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.roundRect(274, 80, 12, 16, 2);
  ctx.fill();

  // Radial warm light pool on the floor
  const lanternGrad = ctx.createRadialGradient(280, 96, 4, 280, 96, 75);
  lanternGrad.addColorStop(0, 'rgba(255, 215, 100, 0.35)');
  lanternGrad.addColorStop(1, 'rgba(255, 215, 100, 0)');
  ctx.fillStyle = lanternGrad;
  ctx.beginPath();
  ctx.ellipse(280, 110, 75, 45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Doormat
  ctx.fillStyle = '#582f0e';
  ctx.beginPath();
  ctx.roundRect(250, 400, 60, 20, 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('SALIDA', 264, 413);
}

/**
 * Atmospheric Day / Sunset / Night Lighting Filter
 */
function renderAtmosphericLighting(
  ctx: CanvasRenderingContext2D,
  map: GameMap,
  timeOfDay: TimeOfDay,
  camX: number,
  camY: number,
  w: number,
  h: number
) {
  if (timeOfDay === 'afternoon') return; // Crisp natural daylight

  ctx.save();
  if (timeOfDay === 'morning') {
    // Soft warm golden dawn
    ctx.fillStyle = 'rgba(255, 195, 100, 0.12)';
    ctx.fillRect(camX, camY, w, h);
  } else if (timeOfDay === 'sunset') {
    // Rich amber/rose twilight gradient
    const sunGrad = ctx.createLinearGradient(camX, camY, camX, camY + h);
    sunGrad.addColorStop(0, 'rgba(230, 75, 40, 0.24)');
    sunGrad.addColorStop(0.6, 'rgba(240, 120, 60, 0.18)');
    sunGrad.addColorStop(1, 'rgba(120, 40, 80, 0.26)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(camX, camY, w, h);
  } else if (timeOfDay === 'night') {
    // Deep nocturnal indigo
    ctx.fillStyle = 'rgba(8, 12, 32, 0.58)';
    ctx.fillRect(camX, camY, w, h);

    // Warm radial light blooms for lanterns, windows, and lamps
    const lights = map.isInterior
      ? [
          { x: 260, y: 100, r: 140 },
          { x: 400, y: 120, r: 120 },
        ]
      : [
          { x: 300, y: 300, r: 90 }, // Ari's porch
          { x: 650, y: 300, r: 90 }, // Charlie's porch
          { x: 895, y: 260, r: 80 }, // Snoopy's yard
          { x: 1260, y: 320, r: 100 }, // School lamp
          { x: 300, y: 590, r: 90 }, // Lucy & Linus porch
          { x: 1270, y: 590, r: 90 }, // Patty's porch
          { x: 1570, y: 590, r: 90 }, // Marcie's porch
          { x: 1510, y: 990, r: 110 }, // Daisy Hill Barn lantern
        ];

    lights.forEach((l) => {
      const grad = ctx.createRadialGradient(l.x, l.y, 10, l.x, l.y, l.r);
      grad.addColorStop(0, 'rgba(255, 225, 130, 0.42)');
      grad.addColorStop(0.6, 'rgba(255, 200, 100, 0.15)');
      grad.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  ctx.restore();
}
