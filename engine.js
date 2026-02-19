import { createTerrain, MATERIAL_MAP } from './materials.js';
import { createClimate, updateClimate } from './climate.js';
import { ecosystemStep } from './ecosystem.js';
import { renderWorld } from './renderer.js';
import { updateDebugBar } from './ui.js';
import { stepPowderPass, stepLiquidPass } from './terrain_physics.js';

export class SimulationEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.simSpeed = 1;
    this.debug = true;
    this.selectedMaterial = 'soil';
    this.performanceMode = 'balanced';
    this.lastTime = 0;
    this.fps = 0;
    this.world = {
      width: canvas.width,
      height: canvas.height,
      gridWidth: 120,
      gridHeight: 72,
      terrain: createTerrain(120, 72),
      climate: createClimate(),
      soilNutrition: 0.5
    };

    this.bindCanvasDraw();
  }

  bindCanvasDraw() {
    let dragging = false;
    const paint = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * this.world.gridWidth;
      const y = ((e.clientY - rect.top) / rect.height) * this.world.gridHeight;
      const gx = Math.floor(x);
      const gy = Math.floor(y);
      if (gx < 0 || gy < 0 || gx >= this.world.gridWidth || gy >= this.world.gridHeight) return;
      this.world.terrain[gy * this.world.gridWidth + gx] = this.selectedMaterial;
      if (MATERIAL_MAP.get(this.selectedMaterial)?.fertility > 0.7) {
        this.world.soilNutrition = Math.min(1, this.world.soilNutrition + 0.01);
      }
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      dragging = true;
      paint(e);
    });
    this.canvas.addEventListener('pointermove', (e) => {
      if (dragging) paint(e);
    });
    window.addEventListener('pointerup', () => {
      dragging = false;
    });
  }

  run() {
    const loop = (time) => {
      if (!this.lastTime) this.lastTime = time;
      const dt = Math.min(0.05, (time - this.lastTime) / 1000) * this.simSpeed;
      this.lastTime = time;
      this.fps = 1 / Math.max(dt, 0.0001);

      this.step(dt);
      renderWorld(this.ctx, this.world, this.debug);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  step(dt) {
    updateClimate(this.world.climate, dt);
    const iterations = this.performanceMode === 'performance' ? 1 : 2;
    for (let i = 0; i < iterations; i += 1) {
      stepPowderPass(this.world);
      stepLiquidPass(this.world);
    }
    ecosystemStep(this.world, dt);
    updateDebugBar(this, this.fps);
  }
}
