import { createTerrain, MATERIAL_MAP } from './materials.js';
import { spawnInitialPopulation, spawnLifeform } from './lifeforms.js';
import { createClimate, updateClimate } from './climate.js';
import { evaluateState, applyStateBehavior } from './ai_fsm.js';
import { ecosystemStep } from './ecosystem.js';
import { collectPopulationStats, evaluateEvolution } from './evolution.js';
import { renderWorld } from './renderer.js';
import { updateDebugBar } from './ui.js';

export class SimulationEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.simSpeed = 1;
    this.debug = true;
    this.selectedMaterial = 'soil';
    this.performanceMode = 'balanced';
    this.history = {};
    this.lastTime = 0;
    this.fps = 0;
    this.world = {
      width: canvas.width,
      height: canvas.height,
      gridWidth: 120,
      gridHeight: 72,
      terrain: createTerrain(120, 72),
      climate: createClimate(),
      entities: spawnInitialPopulation(80),
      maxEntities: 700,
      soilNutrition: 0.5,
      rlEnabled: false
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

  spawnSpecies(species) {
    if (this.world.entities.length >= this.world.maxEntities) return;
    this.world.entities.push(spawnLifeform({ species }));
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

    for (const entity of this.world.entities) {
      entity.state = evaluateState(entity, entity._context || {});
      applyStateBehavior(entity, dt, this.world);
    }

    ecosystemStep(this.world, dt);

    const stats = collectPopulationStats(this.world.entities, this.world.climate);
    for (const key of Object.keys(stats)) {
      if (stats[key].adaptationScore > 0.55) this.history[key] = (this.history[key] || 0) + 1;
      else this.history[key] = 0;
    }
    const transitions = evaluateEvolution(stats, this.history);
    const evoText = transitions.length ? `${transitions[0].from} → ${transitions[0].to}` : '조건 미충족';
    updateDebugBar(this, this.fps, evoText);
  }
}
