import { Direction } from '../types';

export type RpgCharacterId =
  | 'snoopy'
  | 'charlie_brown'
  | 'lucy'
  | 'linus'
  | 'sally'
  | 'woodstock'
  | 'ari';

export interface RpgSpriteOptions {
  id: RpgCharacterId;
  direction: Direction;
  frame: number;
  scale?: number;
}

const PALETTE = {
  outline: '#17151b',
  skin: '#f6b58f',
  skinShadow: '#d98768',
  white: '#fffaf0',
  shadow: 'rgba(15, 13, 20, .28)',
  yellow: '#f4c51b',
  blue: '#2f73c9',
  red: '#d92f3d',
  pink: '#ee86a9',
  black: '#191722',
  khaki: '#d2b486',
};

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function drawHumanBase(ctx: CanvasRenderingContext2D, id: RpgCharacterId, direction: Direction, frame: number) {
  const walking = frame % 4 !== 0;
  const stride = walking ? (frame === 1 ? -2 : frame === 3 ? 2 : 0) : 0;
  const side = direction === 'left' || direction === 'right';
  const back = direction === 'up';

  ctx.save();
  if (direction === 'left') ctx.scale(-1, 1);

  ctx.fillStyle = PALETTE.shadow;
  ctx.beginPath();
  ctx.ellipse(0, 22, 10, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Consistent RPG body proportions: head 10px, torso 12px, legs 9px.
  ctx.fillStyle = id === 'lucy' ? PALETTE.white : PALETTE.black;
  rounded(ctx, -7 + stride, 10, 6, 10, 2);
  rounded(ctx, 1 - stride, 10, 6, 10, 2);
  ctx.fillStyle = PALETTE.white;
  rounded(ctx, -8 + stride, 18, 8, 3, 1);
  rounded(ctx, stride, 18, 8, 3, 1);

  const shirt = id === 'charlie_brown' ? PALETTE.yellow : id === 'lucy' ? PALETTE.blue : id === 'linus' ? PALETTE.red : id === 'sally' ? PALETTE.pink : PALETTE.black;
  ctx.fillStyle = shirt;
  if (id === 'lucy' || id === 'sally') {
    ctx.beginPath();
    ctx.moveTo(-7, -2);
    ctx.lineTo(7, -2);
    ctx.lineTo(10, 10);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.fill();
  } else {
    rounded(ctx, -8, -3, 16, 14, 3);
  }

  if (id === 'charlie_brown') {
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, 3); ctx.lineTo(-4, 7); ctx.lineTo(0, 3); ctx.lineTo(4, 7); ctx.lineTo(8, 3);
    ctx.stroke();
  }
  if (id === 'linus') {
    ctx.fillStyle = '#55aee9';
    rounded(ctx, 5, 1, 6, 13, 2);
  }

  ctx.fillStyle = PALETTE.skin;
  ctx.beginPath();
  ctx.arc(0, -11, 8, 0, Math.PI * 2);
  ctx.fill();

  // Hair and face remain readable at small RPG scales.
  ctx.fillStyle = id === 'sally' ? '#f4d04f' : id === 'linus' ? '#8c6548' : PALETTE.black;
  if (id !== 'snoopy') {
    ctx.beginPath();
    ctx.arc(0, -14, 8, Math.PI, 0);
    ctx.fill();
  }

  if (!back) {
    ctx.fillStyle = PALETTE.outline;
    if (side) ctx.arc(4, -11, 1.2, 0, Math.PI * 2);
    else { ctx.arc(-3, -11, 1.2, 0, Math.PI * 2); ctx.arc(3, -11, 1.2, 0, Math.PI * 2); }
    ctx.fill();
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(side ? 4 : 0, -8, 2, 0.15, Math.PI - 0.15);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSnoopy(ctx: CanvasRenderingContext2D, direction: Direction, frame: number) {
  const side = direction === 'left' || direction === 'right';
  const step = frame === 1 ? -1 : frame === 3 ? 1 : 0;
  ctx.save();
  if (direction === 'left') ctx.scale(-1, 1);
  ctx.fillStyle = PALETTE.shadow;
  ctx.beginPath(); ctx.ellipse(0, 19, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PALETTE.white;
  rounded(ctx, -7 + step, 8, 6, 9, 3); rounded(ctx, 1 - step, 8, 6, 9, 3);
  rounded(ctx, -8, -3, 16, 13, 5);
  ctx.fillStyle = PALETTE.white;
  rounded(ctx, side ? 0 : -7, -14, side ? 15 : 14, 11, 5);
  ctx.fillStyle = PALETTE.black;
  rounded(ctx, side ? 11 : -9, -12, 5, 10, 3);
  ctx.beginPath(); ctx.arc(side ? 14 : 0, -9, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e13b42'; rounded(ctx, -7, -4, 14, 2.5, 1);
  ctx.restore();
}

/**
 * Shared pixel-art RPG renderer. It intentionally uses nearest-neighbour-like
 * hard edges and a single 24px logical canvas unit so all characters match.
 */
export function drawRpgSprite(ctx: CanvasRenderingContext2D, options: RpgSpriteOptions) {
  const scale = options.scale ?? 1;
  ctx.save();
  ctx.translate(Math.round(options.id === 'woodstock' ? 0 : 0), 0);
  ctx.scale(scale, scale);
  if (options.id === 'snoopy') drawSnoopy(ctx, options.direction, options.frame);
  else if (options.id === 'woodstock') {
    ctx.fillStyle = '#f5c51b';
    ctx.beginPath(); ctx.ellipse(0, 0, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.outline;
    ctx.beginPath(); ctx.arc(2, -2, 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e88923';
    ctx.beginPath(); ctx.moveTo(4, -2); ctx.lineTo(8, -1); ctx.lineTo(4, 0); ctx.closePath(); ctx.fill();
  } else drawHumanBase(ctx, options.id, options.direction, options.frame);
  ctx.restore();
}
