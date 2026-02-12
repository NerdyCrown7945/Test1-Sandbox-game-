import { createTerrain, MATERIAL_MAP } from './materials.js';
import { spawnInitialPopulation, spawnLifeform } from './lifeforms.js';
import { createClimate, updateClimate } from './climate.js';
import { evaluateState, applyStateBehavior } from './ai_fsm.js';
import { ecosystemStep } from './ecosystem.js';
import { collectPopulationStats, evaluateEvolution } from './evolution.js';
import { renderWorld } from './renderer.js';
import { updateDebugBar } from './ui.js';

function terrainIndex(world, x, y) {
  return y * world.gridWidth + x;
}

function canDisplace(upperMat, lowerMat) {
  if (!upperMat?.gravity) return false;
  if (!lowerMat || lowerMat.id === 'empty') return true;
  return upperMat.density > (lowerMat.density ?? 0);
}

function swapCells(world, x1, y1, x2, y2) {
  const i1 = terrainIndex(world, x1, y1);
  const i2 = terrainIndex(world, x2, y2);
  [world.terrain[i1], world.terrain[i2]] = [world.terrain[i2], world.terrain[i1]];
}

function applyTerrainPhysics(world, dt) {
  if (dt <= 0) return;
  const stepCount = Math.max(1, Math.round(dt * 90));
  for (let pass = 0; pass < stepCount; pass += 1) {
    for (let y = world.gridHeight - 2; y >= 0; y -= 1) {
      for (let x = 0; x < world.gridWidth; x += 1) {
        const idx = terrainIndex(world, x, y);
        const material = MATERIAL_MAP.get(world.terrain[idx]);
        if (!material?.gravity) continue;

        const down = MATERIAL_MAP.get(world.terrain[terrainIndex(world, x, y + 1)]);
        if (canDisplace(material, down)) {
          swapCells(world, x, y, x, y + 1);
          continue;
        }

        const direction = Math.random() > 0.5 ? 1 : -1;
        for (const dx of [direction, -direction]) {
          const nx = x + dx;
          if (nx < 0 || nx >= world.gridWidth) continue;
          const diag = MATERIAL_MAP.get(world.terrain[terrainIndex(world, nx, y + 1)]);
          if (canDisplace(material, diag)) {
            swapCells(world, x, y, nx, y + 1);
            break;
          }
        }
      }
    }
  }
}

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
    applyTerrainPhysics(this.world, dt);

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
