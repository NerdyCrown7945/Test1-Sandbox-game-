import { createTerrain, MATERIAL_MAP } from './materials.js';
import { createClimate, updateClimate } from './climate.js';
import { renderWorld } from './renderer.js';
import { updateDebugBar } from './ui.js';
import { stepTerrain } from './terrain_physics.js';
import { biologyStep, ensureBiologyState } from './biology.js';
import { interactionsStep } from './interactions.js';

export class SimulationEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.simSpeed = 1;
    this.debug = true;
    this.selectedMaterial = 'soil';
    this.brushMode = 'draw';
    this.performanceMode = 'balanced';
    this.lastTime = 0;
    this.fps = 0;
    this.world = {
      width: canvas.width,
      height: canvas.height,
      gridWidth: 120,
      gridHeight: 72,
      terrain: createTerrain(120, 72),
      biology: [],
      growthModifiers: [],
      lightMap: [],
      climate: { ...createClimate(), globalSunlight: 1 },
      soilNutrition: 0.5
    };

    ensureBiologyState(this.world);
    this.bindCanvasDraw();
  }

  clearAll() {
    this.world.terrain.fill('empty');
    this.world.biology.fill('none');
    this.world.soilNutrition = 0;
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

      const index = gy * this.world.gridWidth + gx;
      const nextMaterial = this.brushMode === 'eraser' ? 'empty' : this.selectedMaterial;
      this.world.terrain[index] = nextMaterial;
      if (nextMaterial === 'empty') this.world.biology[index] = 'none';

      if (MATERIAL_MAP.get(nextMaterial)?.fertility > 0.7) {
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
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  step(dt) {
    updateClimate(this.world.climate, dt);
    const iterations = this.performanceMode === 'performance' ? 1 : 2;
    stepTerrain(this.world, iterations);
    biologyStep(this.world, dt);
    interactionsStep(this.world, dt);
    renderWorld(this.ctx, this.world, this.debug);
    updateDebugBar(this, this.fps);
  }
}
