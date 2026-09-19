/**
 * Ari - Player Engine for "El Mundo De Snoopy"
 * High-fidelity 2D illustration rendering and natural physics animation:
 * - Voluminous dark wavy hair with soft layered highlights and loose strands
 * - Soft expressive Peanuts features with natural blinking and subtle rosy blush
 * - Detailed black zip jacket with collar lapels, sleeve fabric folds, and metal zipper
 * - Baggy beige chino/cargo trousers with realistic knee and hem creases
 * - Classic black & white sneakers with rubber toe caps, foxing stripes, and soles
 * - Smooth directional sun-cast ground shadows that respond to time of day and interiors
 * - 4 Directions: Down (front), Up (back), Left, Right with natural stride cycles
 * - States: Walking, Running, Sitting, Writing with organic idle breathing
 */

import { Direction, PlayerActivity, PlayerState, WeatherType, TimeOfDay } from '../types';

export const INITIAL_PLAYER: PlayerState = {
  x: 340,
  y: 390,
  width: 24,
  height: 38,
  direction: 'down',
  activity: 'standing',
  isMoving: false,
  isRunning: false,
  frame: 0,
  animationTimer: 0,
};

export function updatePlayerAnimation(
  player: PlayerState,
  deltaMs: number,
  isMoving: boolean,
  isRunning: boolean
): PlayerState {
  let { frame, animationTimer, activity } = player;

  if (activity === 'sitting' || activity === 'writing') {
    animationTimer += deltaMs;
    if (animationTimer > 280) {
      animationTimer = 0;
      frame = (frame + 1) % 4;
    }
    return { ...player, frame, animationTimer };
  }

  if (isMoving) {
    const frameSpeed = isRunning ? 110 : 160;
    animationTimer += deltaMs;
    if (animationTimer > frameSpeed) {
      animationTimer = 0;
      frame = (frame + 1) % 4;
    }
    activity = isRunning ? 'running' : 'walking';
  } else {
    frame = 0;
    animationTimer = 0;
    activity = 'standing';
  }

  return {
    ...player,
    isMoving,
    isRunning,
    activity,
    frame,
    animationTimer,
  };
}

/**
 * Draw directional cast shadow on the ground based on time of day
 */
export function drawEntityDirectionalShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  timeOfDay: TimeOfDay = 'morning',
  isInterior = false
) {
  ctx.save();
  let offsetX = 0;
  let offsetY = 0;
  let rx = radiusX;
  let ry = radiusY;
  let rot = 0;
  let alpha = 0.28;
  let r = 20, g = 18, b = 28;

  if (isInterior) {
    offsetX = 0;
    offsetY = 1;
    rx = radiusX * 1.05;
    ry = radiusY * 0.9;
    alpha = 0.32;
    r = 25; g = 20; b = 15;
  } else {
    switch (timeOfDay) {
      case 'morning':
        offsetX = -radiusX * 0.45;
        offsetY = -1;
        rx = radiusX * 1.35;
        ry = radiusY * 0.85;
        rot = -0.18;
        alpha = 0.26;
        r = 18; g = 28; b = 45;
        break;
      case 'afternoon':
        offsetX = 0;
        offsetY = 1;
        rx = radiusX;
        ry = radiusY * 0.8;
        alpha = 0.36;
        r = 15; g = 18; b = 24;
        break;
      case 'sunset':
        offsetX = radiusX * 0.65;
        offsetY = -1;
        rx = radiusX * 1.55;
        ry = radiusY * 0.8;
        rot = 0.2;
        alpha = 0.32;
        r = 45; g = 22; b = 30;
        break;
      case 'night':
        offsetX = 0;
        offsetY = 1;
        rx = radiusX * 1.1;
        ry = radiusY * 0.95;
        alpha = 0.25;
        r = 12; g = 16; b = 32;
        break;
    }
  }

  ctx.translate(x + offsetX, y + offsetY);
  ctx.rotate(rot);

  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
  grad.addColorStop(0.65, `rgba(${r}, ${g}, ${b}, ${alpha * 0.7})`);
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * High-Detail 2D Rendering for Ari
 */
export function drawAri(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  renderX: number,
  renderY: number,
  weather?: WeatherType,
  isInterior = false,
  timeOfDay: TimeOfDay = 'morning'
) {
  const { direction, activity, isMoving, isRunning, frame } = player;
  const isSit = activity === 'sitting';
  const isWrite = activity === 'writing';

  // Ground directional shadow
  drawEntityDirectionalShadow(
    ctx,
    Math.round(renderX),
    Math.round(renderY) + (isSit ? 16 : 18),
    isSit ? 16 : 14,
    5,
    timeOfDay,
    isInterior
  );

  ctx.save();
  ctx.translate(Math.round(renderX), Math.round(renderY));

  // Organic idle breathing oscillation
  const now = Date.now();
  const breathe = !isMoving ? Math.sin(now / 550) * 0.6 : 0;
  // Natural eyelid blink cycle (every ~3.8 seconds, lasts 130ms)
  const isBlinking = now % 3800 < 130;

  // Vertical stride bob during walk/run
  const bob = isMoving ? (frame === 1 || frame === 3 ? (isRunning ? -2.5 : -1.5) : 0) : breathe;
  const sitYOffset = isSit ? 8 : 0;

  ctx.translate(0, bob + sitYOffset);

  // Umbrella if rainy outside
  if (weather === 'rainy' && !isInterior && !isSit) {
    ctx.save();
    // Metal pole
    ctx.strokeStyle = '#2b2a33';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(3, 0);
    ctx.lineTo(3, -33);
    ctx.stroke();

    // Wooden hooked handle
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(1.5, 2, 3, 0, Math.PI);
    ctx.stroke();

    // Red Canopy with 3D spherical shading and ribs
    const canopyGrad = ctx.createLinearGradient(0, -50, 0, -32);
    canopyGrad.addColorStop(0, '#f2545b');
    canopyGrad.addColorStop(0.6, '#d90429');
    canopyGrad.addColorStop(1, '#9b111e');

    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    ctx.arc(3, -33, 19, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();

    // Canopy scallop ribs & highlight arcs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(3, -52);
    ctx.quadraticCurveTo(8, -42, 12, -33);
    ctx.moveTo(3, -52);
    ctx.quadraticCurveTo(-2, -42, -6, -33);
    ctx.stroke();

    // Scalloped bottom rim
    ctx.strokeStyle = '#780000';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(3, -33, 19, Math.PI, 0, false);
    ctx.stroke();

    // Brass ferrule tip
    ctx.fillStyle = '#ffb703';
    ctx.fillRect(2, -54, 2, 4);

    // Droplets sliding down umbrella
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(-4, -40, 1.2, 0, Math.PI * 2);
    ctx.arc(8, -38, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Realistic color palette matching Ari's reference visuals
  const hairDeep = '#16131a';
  const hairMid = '#28212e';
  const hairHigh = '#43374d';
  const skinTone = '#f8b48b';
  const skinShadow = '#e2956c';
  const skinBlush = 'rgba(230, 95, 80, 0.28)';
  const jacketBase = '#1c1b22';
  const jacketMid = '#2a2832';
  const jacketHighlight = '#3b3846';
  const zipperTrack = '#eaeaf0';
  const zipperSlider = '#c0c0cc';
  const pantsBase = '#d8ba90';
  const pantsShadow = '#b8986d';
  const pantsHighlight = '#ebd4b2';
  const shoeCanvas = '#1a181e';
  const shoeWhite = '#f8f8fa';

  // Flip horizontally if facing left
  const flip = direction === 'left';
  if (flip) {
    ctx.scale(-1, 1);
  }

  if (direction === 'down') {
    // ==========================================
    // FRONT VIEW (Facing camera)
    // ==========================================

    // 1. Legs and Pants
    if (isSit) {
      // Sitting trousers: folds draped over seat
      ctx.fillStyle = pantsShadow;
      ctx.beginPath();
      ctx.roundRect(-10, 5, 20, 11, 3);
      ctx.fill();

      ctx.fillStyle = pantsBase;
      ctx.beginPath();
      ctx.roundRect(-9, 5, 18, 10, 2);
      ctx.fill();

      // Fold creases at lap
      ctx.strokeStyle = pantsShadow;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-7, 9);
      ctx.lineTo(7, 9);
      ctx.moveTo(-1, 5);
      ctx.lineTo(-1, 15);
      ctx.stroke();

      // Shoes pointing forward
      ctx.fillStyle = shoeCanvas;
      ctx.beginPath();
      ctx.roundRect(-11, 14, 10, 6, 2);
      ctx.roundRect(1, 14, 10, 6, 2);
      ctx.fill();

      // White rubber toe caps & soles
      ctx.fillStyle = shoeWhite;
      ctx.beginPath();
      ctx.roundRect(-11, 17, 10, 3, 1);
      ctx.roundRect(1, 17, 10, 3, 1);
      ctx.fill();

      // Black foxing pinstripe on sole
      ctx.fillStyle = '#1c1b22';
      ctx.fillRect(-11, 18, 10, 0.8);
      ctx.fillRect(1, 18, 10, 0.8);
    } else {
      // Standing / Walking legs with dynamic stride
      const legStride = isMoving ? (frame === 1 ? -3.5 : frame === 3 ? 3.5 : 0) : 0;

      // Left Leg
      const leftYOffset = legStride > 0 ? -1.5 : 0;
      ctx.fillStyle = pantsBase;
      ctx.beginPath();
      ctx.roundRect(-9, 5, 8, 12 + leftYOffset, 2);
      ctx.fill();

      // Left Pant shadow & folds
      ctx.fillStyle = pantsShadow;
      ctx.fillRect(-9, 13 + leftYOffset, 8, 1.5);
      ctx.fillRect(-9, 8 + leftYOffset, 8, 1);

      // Left Shoe
      ctx.fillStyle = shoeCanvas;
      ctx.beginPath();
      ctx.roundRect(-10, 16 + leftYOffset, 9, 6, 2);
      ctx.fill();
      ctx.fillStyle = shoeWhite;
      ctx.beginPath();
      ctx.roundRect(-10, 19 + leftYOffset, 9, 3, 1);
      ctx.fill();
      ctx.fillStyle = '#1c1b22';
      ctx.fillRect(-10, 20 + leftYOffset, 9, 0.8);

      // Right Leg
      const rightYOffset = legStride < 0 ? -1.5 : 0;
      ctx.fillStyle = pantsBase;
      ctx.beginPath();
      ctx.roundRect(1, 5, 8, 12 + rightYOffset, 2);
      ctx.fill();

      // Right Pant shadow & folds
      ctx.fillStyle = pantsShadow;
      ctx.fillRect(1, 13 + rightYOffset, 8, 1.5);
      ctx.fillRect(1, 8 + rightYOffset, 8, 1);

      // Right Shoe
      ctx.fillStyle = shoeCanvas;
      ctx.beginPath();
      ctx.roundRect(1, 16 + rightYOffset, 9, 6, 2);
      ctx.fill();
      ctx.fillStyle = shoeWhite;
      ctx.beginPath();
      ctx.roundRect(1, 19 + rightYOffset, 9, 3, 1);
      ctx.fill();
      ctx.fillStyle = '#1c1b22';
      ctx.fillRect(1, 20 + rightYOffset, 9, 0.8);

      // Inseam fly shadow
      ctx.fillStyle = pantsShadow;
      ctx.fillRect(-1, 5, 2, 10);
    }

    // 2. Cascading Dark Hair behind back
    ctx.fillStyle = hairDeep;
    ctx.beginPath();
    ctx.roundRect(-12, -14, 24, 20, 6);
    ctx.fill();
    ctx.fillStyle = hairMid;
    ctx.beginPath();
    ctx.roundRect(-14, -9, 28, 14, 5);
    ctx.fill();

    // 3. Black Zip Jacket (Torso)
    ctx.fillStyle = jacketBase;
    ctx.beginPath();
    ctx.roundRect(-10, -7, 20, 13, 3);
    ctx.fill();

    // Jacket fabric folds and shoulder contours
    ctx.fillStyle = jacketMid;
    ctx.beginPath();
    ctx.roundRect(-9, -6, 18, 11, 2);
    ctx.fill();

    // Shoulder highlight bevel
    ctx.fillStyle = jacketHighlight;
    ctx.fillRect(-9, -7, 18, 1.5);

    // Collar flaps
    ctx.fillStyle = jacketBase;
    ctx.beginPath();
    ctx.moveTo(-7, -7);
    ctx.lineTo(-2, -2);
    ctx.lineTo(-7, -2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(7, -7);
    ctx.lineTo(2, -2);
    ctx.lineTo(7, -2);
    ctx.closePath();
    ctx.fill();

    // Metallic Zipper track down center
    ctx.fillStyle = zipperTrack;
    ctx.fillRect(-1, -7, 2, 13);

    // Zipper slider tab & pull
    ctx.fillStyle = zipperSlider;
    ctx.fillRect(-2, -7, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1.5, -4, 3, 3);

    // Hands at sides or swinging
    const armSwing = isMoving ? (frame === 1 ? -2 : frame === 3 ? 2 : 0) : 0;
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(-10, 0 + armSwing, 2.5, 0, Math.PI * 2);
    ctx.arc(10, 0 - armSwing, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Head and Face
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.roundRect(-9, -20, 18, 14, 6);
    ctx.fill();

    // Chin shadow under neck
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.roundRect(-7, -7, 14, 2, 1);
    ctx.fill();

    // Soft warm blush on cheeks
    ctx.fillStyle = skinBlush;
    ctx.beginPath();
    ctx.arc(-6, -13, 2.5, 0, Math.PI * 2);
    ctx.arc(6, -13, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Expressive Eyes (with natural blink animation!)
    if (isBlinking) {
      ctx.strokeStyle = '#18141d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-5.5, -14);
      ctx.lineTo(-2.5, -14);
      ctx.moveTo(2.5, -14);
      ctx.lineTo(5.5, -14);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#18141d';
      ctx.beginPath();
      // Left eye with slight sparkle
      ctx.arc(-4, -14, 1.8, 0, Math.PI * 2);
      // Right eye
      ctx.arc(4, -14, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Specular eye glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4.5, -14.6, 0.7, 0, Math.PI * 2);
      ctx.arc(3.5, -14.6, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cute curved nose
    ctx.strokeStyle = '#c6734c';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -11, 1.5, 0, Math.PI);
    ctx.stroke();

    // Gentle warm smile
    ctx.strokeStyle = '#a84c32';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, -9, 3, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();

    // 5. Hair Crown, Wavy Tresses & Bangs
    ctx.fillStyle = hairDeep;
    // Top crown volume
    ctx.beginPath();
    ctx.roundRect(-10, -24, 20, 7, 3);
    ctx.fill();

    // Wavy left & right side tresses cascading over shoulders
    ctx.beginPath();
    ctx.roundRect(-12, -21, 5, 20, 3);
    ctx.roundRect(7, -21, 5, 20, 3);
    ctx.fill();

    // Forehead bangs (natural parted cluster)
    ctx.fillStyle = hairMid;
    ctx.beginPath();
    ctx.roundRect(-8, -20, 4, 5, 2);
    ctx.roundRect(-3, -20, 4, 4, 2);
    ctx.roundRect(2, -20, 4, 5, 2);
    ctx.fill();

    // Hair specular gloss highlights
    ctx.fillStyle = hairHigh;
    ctx.beginPath();
    ctx.roundRect(-8, -23, 16, 1.5, 1);
    ctx.roundRect(-11, -16, 2.5, 10, 1);
    ctx.roundRect(8.5, -16, 2.5, 10, 1);
    ctx.fill();

    // Writing notebook in hands if active
    if (isWrite) {
      const penBob = frame % 2 === 0 ? 0 : 0.8;
      // Hardcover notebook
      ctx.fillStyle = '#bc6c25';
      ctx.beginPath();
      ctx.roundRect(-7, -2, 14, 10, 2);
      ctx.fill();

      // Lined paper sheet
      ctx.fillStyle = '#fefae0';
      ctx.fillRect(-6, -1, 12, 8);

      // Fine writing lines
      ctx.fillStyle = '#b7b7a4';
      ctx.fillRect(-4, 1, 8, 0.8);
      ctx.fillRect(-4, 3, 8, 0.8);
      ctx.fillRect(-4, 5, 6, 0.8);

      // Vintage pen / pencil in hand
      ctx.fillStyle = '#283618';
      ctx.fillRect(4 + penBob, -1 - penBob, 2, 6);
      ctx.fillStyle = '#dda15e';
      ctx.fillRect(4 + penBob, 5 - penBob, 2, 1.5);
    }
  } else if (direction === 'up') {
    // ==========================================
    // BACK VIEW (Walking away)
    // ==========================================

    const legStride = isMoving ? (frame === 1 ? -3.5 : frame === 3 ? 3.5 : 0) : 0;

    // Left Leg
    const leftYOffset = legStride > 0 ? -1.5 : 0;
    ctx.fillStyle = pantsBase;
    ctx.beginPath();
    ctx.roundRect(-9, 5, 8, 12 + leftYOffset, 2);
    ctx.fill();
    ctx.fillStyle = pantsShadow;
    ctx.fillRect(-9, 13 + leftYOffset, 8, 1.5);

    // Left Shoe
    ctx.fillStyle = shoeCanvas;
    ctx.beginPath();
    ctx.roundRect(-9, 16 + leftYOffset, 8, 6, 2);
    ctx.fill();
    ctx.fillStyle = shoeWhite;
    ctx.beginPath();
    ctx.roundRect(-9, 19 + leftYOffset, 8, 3, 1);
    ctx.fill();

    // Right Leg
    const rightYOffset = legStride < 0 ? -1.5 : 0;
    ctx.fillStyle = pantsBase;
    ctx.beginPath();
    ctx.roundRect(1, 5, 8, 12 + rightYOffset, 2);
    ctx.fill();
    ctx.fillStyle = pantsShadow;
    ctx.fillRect(1, 13 + rightYOffset, 8, 1.5);

    // Right Shoe
    ctx.fillStyle = shoeCanvas;
    ctx.beginPath();
    ctx.roundRect(1, 16 + rightYOffset, 8, 6, 2);
    ctx.fill();
    ctx.fillStyle = shoeWhite;
    ctx.beginPath();
    ctx.roundRect(1, 19 + rightYOffset, 8, 3, 1);
    ctx.fill();

    // Center seam
    ctx.fillStyle = pantsShadow;
    ctx.fillRect(-1, 5, 2, 10);

    // Jacket back
    ctx.fillStyle = jacketBase;
    ctx.beginPath();
    ctx.roundRect(-10, -7, 20, 13, 3);
    ctx.fill();
    ctx.fillStyle = jacketMid;
    ctx.beginPath();
    ctx.roundRect(-9, -6, 18, 11, 2);
    ctx.fill();

    // Cascading wavy long black hair down back
    ctx.fillStyle = hairDeep;
    ctx.beginPath();
    ctx.roundRect(-10, -24, 20, 8, 4); // top head
    ctx.roundRect(-12, -18, 24, 18, 5); // mid back
    ctx.roundRect(-11, 0, 22, 9, 4); // lower back draping
    ctx.roundRect(-9, 7, 18, 5, 3); // hair curls at base
    ctx.fill();

    // Wavy texture streaks and highlights
    ctx.fillStyle = hairMid;
    ctx.beginPath();
    ctx.roundRect(-8, -17, 4, 16, 2);
    ctx.roundRect(3, -15, 4, 18, 2);
    ctx.fill();

    ctx.fillStyle = hairHigh;
    ctx.beginPath();
    ctx.roundRect(-6, -23, 12, 1.5, 1);
    ctx.roundRect(-4, -8, 3, 13, 1);
    ctx.roundRect(4, -6, 2.5, 11, 1);
    ctx.fill();
  } else {
    // ==========================================
    // SIDE PROFILE VIEW (Left / Right)
    // Exactly matching uploaded image 86112.jpeg!
    // ==========================================

    const stride = isMoving
      ? frame === 1
        ? 4.5
        : frame === 3
        ? -4.5
        : 0
      : 0;

    // Back leg
    ctx.fillStyle = pantsShadow;
    ctx.beginPath();
    ctx.roundRect(-3 - stride * 0.7, 5, 8, 12, 2);
    ctx.fill();
    ctx.fillStyle = shoeCanvas;
    ctx.beginPath();
    ctx.roundRect(-4 - stride * 0.7, 16, 9, 6, 2);
    ctx.fill();
    ctx.fillStyle = shoeWhite;
    ctx.beginPath();
    ctx.roundRect(-4 - stride * 0.7, 19, 9, 3, 1);
    ctx.fill();

    // Front leg
    ctx.fillStyle = pantsBase;
    ctx.beginPath();
    ctx.roundRect(-4 + stride, 5, 9, 12, 2);
    ctx.fill();
    // Knee fold crease
    ctx.fillStyle = pantsShadow;
    ctx.fillRect(-4 + stride, 12, 9, 1.2);

    // Front shoe
    ctx.fillStyle = shoeCanvas;
    ctx.beginPath();
    ctx.roundRect(-5 + stride, 16, 10, 6, 2);
    ctx.fill();
    ctx.fillStyle = shoeWhite;
    ctx.beginPath();
    ctx.roundRect(-5 + stride, 19, 10, 3, 1);
    ctx.fill();
    ctx.fillStyle = '#1c1b22';
    ctx.fillRect(-5 + stride, 20, 10, 0.8);

    // Long wavy hair draping behind
    ctx.fillStyle = hairDeep;
    ctx.beginPath();
    ctx.roundRect(-13, -20, 13, 24, 4);
    ctx.roundRect(-15, -14, 11, 20, 4);
    ctx.roundRect(-11, 5, 9, 6, 3);
    ctx.fill();

    // Hair wave highlights
    ctx.fillStyle = hairHigh;
    ctx.beginPath();
    ctx.roundRect(-12, -15, 3, 14, 1);
    ctx.fill();

    // Jacket profile
    ctx.fillStyle = jacketBase;
    ctx.beginPath();
    ctx.roundRect(-9, -7, 15, 13, 3);
    ctx.fill();
    ctx.fillStyle = jacketMid;
    ctx.beginPath();
    ctx.roundRect(-8, -6, 13, 11, 2);
    ctx.fill();

    // White zipper track visible along front edge
    ctx.fillStyle = zipperTrack;
    ctx.fillRect(5, -7, 2, 13);
    ctx.fillStyle = zipperSlider;
    ctx.fillRect(4, -7, 3, 3);

    // Arm and hand in front
    ctx.fillStyle = jacketBase;
    ctx.beginPath();
    ctx.roundRect(-2, -5, 6, 10, 2);
    ctx.fill();
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(2, 4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Face profile
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.roundRect(-7, -20, 14, 14, 5);
    ctx.fill();

    // Cute rounded Peanuts nose
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(7, -13, 2.5, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.strokeStyle = '#c6734c';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Cheek blush
    ctx.fillStyle = skinBlush;
    ctx.beginPath();
    ctx.arc(3, -12, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye (with natural blink)
    if (isBlinking) {
      ctx.strokeStyle = '#18141d';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(2, -14);
      ctx.lineTo(5, -14);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#18141d';
      ctx.beginPath();
      ctx.arc(3.5, -14, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(3.2, -14.6, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gentle smile
    ctx.strokeStyle = '#a84c32';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(5, -9, 2.5, 0.1, 0.8 * Math.PI);
    ctx.stroke();

    // Forehead bangs and crown
    ctx.fillStyle = hairDeep;
    ctx.beginPath();
    ctx.roundRect(-9, -24, 17, 6, 3);
    ctx.roundRect(-1, -21, 5, 6, 2);
    ctx.roundRect(3, -19, 4, 5, 2);
    ctx.fill();

    // Crown highlight
    ctx.fillStyle = hairHigh;
    ctx.beginPath();
    ctx.roundRect(-7, -23, 12, 1.5, 1);
    ctx.fill();

    // Writing notebook if active
    if (isWrite) {
      ctx.fillStyle = '#bc6c25';
      ctx.beginPath();
      ctx.roundRect(5, -2, 9, 11, 2);
      ctx.fill();
      ctx.fillStyle = '#fefae0';
      ctx.fillRect(6, -1, 7, 9);
      ctx.fillStyle = '#283618';
      ctx.fillRect(10, -3, 2, 5);
    }
  }

  ctx.restore();
}
