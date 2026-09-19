/**
 * Dynamic Weather Engine for "El Mundo De Snoopy"
 * - Weather States: 'sunny' | 'cloudy' | 'rainy' | 'windy'
 * - Smooth gradual transitions
 * - Puddle formation during rain and slow evaporation afterwards
 * - Wind-blown autumn leaves particles
 * - Soft diagonal raindrops and impact ripples
 * - NPC shelter destinations and rain behavior
 */

import { WeatherType, WeatherState, Position } from '../types';

export interface Puddle {
  id: string;
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
}

// Persistent puddle locations in the overworld (on paths, near porch, near field)
export const OVERWORLD_PUDDLES: Puddle[] = [
  { id: 'p1', x: 280, y: 360, radiusX: 34, radiusY: 18 },
  { id: 'p2', x: 490, y: 350, radiusX: 28, radiusY: 16 },
  { id: 'p3', x: 620, y: 460, radiusX: 32, radiusY: 18 },
  { id: 'p4', x: 810, y: 370, radiusX: 38, radiusY: 20 },
  { id: 'p5', x: 340, y: 560, radiusX: 26, radiusY: 14 },
  { id: 'p6', x: 1080, y: 440, radiusX: 42, radiusY: 22 },
  { id: 'p7', x: 740, y: 680, radiusX: 30, radiusY: 16 },
  { id: 'p8', x: 520, y: 720, radiusX: 36, radiusY: 18 },
];

export interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
}

export interface RainRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export interface WindLeaf {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  oscillationOffset: number;
}

export class WeatherManager {
  private currentWeather: WeatherType = 'sunny';
  private targetWeather: WeatherType = 'sunny';
  private puddleIntensity: number = 0; // 0 to 1
  private weatherTimer: number = 0;
  private weatherDuration: number = 180000; // 3 minutes per natural cycle
  private transitionTimer: number = 0;

  // Visual particles
  private raindrops: RainDrop[] = [];
  private ripples: RainRipple[] = [];
  private leaves: WindLeaf[] = [];

  constructor() {
    this.initParticles();
  }

  private initParticles() {
    // Rain particles pool
    for (let i = 0; i < 140; i++) {
      this.raindrops.push({
        x: Math.random() * 2000,
        y: Math.random() * 1500,
        length: 12 + Math.random() * 8,
        speed: 14 + Math.random() * 6,
        alpha: 0.35 + Math.random() * 0.3,
      });
    }

    // Autumn leaves pool
    const leafColors = ['#e76f51', '#f4a261', '#e9c46a', '#d9480f', '#b08968', '#c9184a'];
    for (let i = 0; i < 45; i++) {
      this.leaves.push({
        x: Math.random() * 2000,
        y: Math.random() * 1500,
        size: 5 + Math.random() * 5,
        speedX: 1.8 + Math.random() * 2.2,
        speedY: 0.8 + Math.random() * 1.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        oscillationOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  public getWeather(): WeatherType {
    return this.currentWeather;
  }

  public setWeather(newWeather: WeatherType) {
    this.currentWeather = newWeather;
    this.targetWeather = newWeather;
    this.weatherTimer = 0;
  }

  public cycleNextWeather(): WeatherType {
    const cycle: WeatherType[] = ['sunny', 'windy', 'cloudy', 'rainy'];
    const nextIdx = (cycle.indexOf(this.currentWeather) + 1) % cycle.length;
    this.setWeather(cycle[nextIdx]);
    return this.currentWeather;
  }

  public getPuddleIntensity(): number {
    return this.puddleIntensity;
  }

  public getWeatherState(): WeatherState {
    return {
      type: this.currentWeather,
      puddleIntensity: this.puddleIntensity,
      windAngle: 0.3,
      transitionProgress: Math.min(1, this.transitionTimer / 3000),
    };
  }

  // Check if coordinates step into a puddle
  public isEntityInPuddle(x: number, y: number, isInterior = false): boolean {
    if (isInterior || this.puddleIntensity < 0.15) return false;

    for (const p of OVERWORLD_PUDDLES) {
      const dx = (x - p.x) / p.radiusX;
      const dy = (y - p.y) / p.radiusY;
      if (dx * dx + dy * dy <= 1.0) {
        return true;
      }
    }
    return false;
  }

  // Update loop called in requestAnimationFrame
  public update(deltaMs: number, isInterior: boolean) {
    // 1. Natural Weather Cycle (gradual change)
    this.weatherTimer += deltaMs;
    if (this.weatherTimer >= this.weatherDuration) {
      this.weatherTimer = 0;
      const possibilities: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'windy'];
      const filtered = possibilities.filter((w) => w !== this.currentWeather);
      const chosen = filtered[Math.floor(Math.random() * filtered.length)];
      this.setWeather(chosen);
    }

    // 2. Puddle Accumulation & Drying
    if (this.currentWeather === 'rainy') {
      // Accumulate puddles smoothly
      this.puddleIntensity = Math.min(1.0, this.puddleIntensity + deltaMs * 0.00012);
    } else {
      // Dry puddles slowly
      const drySpeed = this.currentWeather === 'sunny' ? 0.00006 : 0.00003;
      this.puddleIntensity = Math.max(0, this.puddleIntensity - deltaMs * drySpeed);
    }

    if (isInterior) return;

    // 3. Update Raindrops
    if (this.currentWeather === 'rainy') {
      for (const drop of this.raindrops) {
        drop.y += drop.speed * (deltaMs / 16);
        drop.x -= (drop.speed * 0.28) * (deltaMs / 16); // Gentle diagonal angle

        if (drop.y > 1500 || drop.x < 0) {
          drop.y = -20;
          drop.x = Math.random() * 2000;

          // Occasionally trigger a water ripple
          if (Math.random() < 0.25) {
            this.ripples.push({
              x: drop.x,
              y: Math.random() * 1400,
              radius: 1,
              maxRadius: 6 + Math.random() * 6,
              alpha: 0.6,
            });
          }
        }
      }

      // Update Ripples
      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const r = this.ripples[i];
        r.radius += 0.25 * (deltaMs / 16);
        r.alpha -= 0.02 * (deltaMs / 16);
        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          this.ripples.splice(i, 1);
        }
      }
    }

    // 4. Update Wind Leaves
    const leafActivity = this.currentWeather === 'windy' ? 1.0 : this.currentWeather === 'rainy' ? 0.4 : 0.2;
    for (const leaf of this.leaves) {
      leaf.oscillationOffset += 0.05 * (deltaMs / 16);
      const sway = Math.sin(leaf.oscillationOffset) * 1.2;
      leaf.x += (leaf.speedX * leafActivity + sway) * (deltaMs / 16);
      leaf.y += (leaf.speedY * leafActivity * 0.7 + 0.4) * (deltaMs / 16);
      leaf.rotation += leaf.rotationSpeed * (deltaMs / 16);

      if (leaf.x > 2000) leaf.x = -20;
      if (leaf.y > 1500) leaf.y = -20;
    }
  }

  // Draw Puddles beneath characters and trees
  public renderPuddles(ctx: CanvasRenderingContext2D, mapWidth: number, mapHeight: number) {
    if (this.puddleIntensity <= 0.05) return;

    ctx.save();
    for (const p of OVERWORLD_PUDDLES) {
      const alpha = Math.min(0.65, this.puddleIntensity * 0.65);

      // Puddle soft water body with sky reflection
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.radiusX, p.radiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(132, 175, 205, ${alpha})`;
      ctx.fill();

      // Puddle subtle rim / soil wetness
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(74, 98, 115, ${alpha * 0.8})`;
      ctx.stroke();

      // Sky reflection sheen highlight
      ctx.beginPath();
      ctx.ellipse(p.x - p.radiusX * 0.2, p.y - p.radiusY * 0.2, p.radiusX * 0.45, p.radiusY * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.35})`;
      ctx.fill();
    }
    ctx.restore();
  }

  // Render Weather Overlay Effects (Rain, Wind Leaves, Sky tint)
  public renderWeatherEffects(
    ctx: CanvasRenderingContext2D,
    viewX: number,
    viewY: number,
    viewWidth: number,
    viewHeight: number,
    isInterior: boolean
  ) {
    if (isInterior) return;

    ctx.save();

    // 1. Sky ambiance tint
    if (this.currentWeather === 'rainy') {
      // Soft overcast rain tint
      ctx.fillStyle = 'rgba(70, 90, 115, 0.14)';
      ctx.fillRect(viewX, viewY, viewWidth, viewHeight);
    } else if (this.currentWeather === 'cloudy') {
      // Gentle diffused soft light
      ctx.fillStyle = 'rgba(95, 105, 118, 0.09)';
      ctx.fillRect(viewX, viewY, viewWidth, viewHeight);
    } else if (this.currentWeather === 'sunny') {
      // Warm pleasant sunbeam tint
      ctx.fillStyle = 'rgba(255, 240, 200, 0.04)';
      ctx.fillRect(viewX, viewY, viewWidth, viewHeight);
    }

    // 2. Raindrops & Ripples
    if (this.currentWeather === 'rainy') {
      ctx.strokeStyle = 'rgba(200, 225, 255, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (const drop of this.raindrops) {
        // Only draw visible drops within current camera
        if (
          drop.x >= viewX - 50 &&
          drop.x <= viewX + viewWidth + 50 &&
          drop.y >= viewY - 50 &&
          drop.y <= viewY + viewHeight + 50
        ) {
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - drop.length * 0.35, drop.y + drop.length);
        }
      }
      ctx.stroke();

      // Ripples
      for (const r of this.ripples) {
        if (
          r.x >= viewX - 20 &&
          r.x <= viewX + viewWidth + 20 &&
          r.y >= viewY - 20 &&
          r.y <= viewY + viewHeight + 20
        ) {
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.radius * 1.5, r.radius * 0.7, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(220, 240, 255, ${r.alpha * 0.6})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // 3. Wind Leaves
    if (this.currentWeather === 'windy' || this.currentWeather === 'rainy') {
      for (const leaf of this.leaves) {
        if (
          leaf.x >= viewX - 30 &&
          leaf.x <= viewX + viewWidth + 30 &&
          leaf.y >= viewY - 30 &&
          leaf.y <= viewY + viewHeight + 30
        ) {
          ctx.save();
          ctx.translate(leaf.x, leaf.y);
          ctx.rotate(leaf.rotation);

          ctx.fillStyle = leaf.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, leaf.size, leaf.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Leaf tiny stem
          ctx.strokeStyle = '#3e2723';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-leaf.size * 0.8, 0);
          ctx.lineTo(-leaf.size * 1.2, -1);
          ctx.stroke();

          ctx.restore();
        }
      }
    }

    ctx.restore();
  }
}

export const weatherManager = new WeatherManager();
