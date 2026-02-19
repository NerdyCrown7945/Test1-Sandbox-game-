import { TERRAIN_INTERACTION_RULES } from './interactions.js';
import { MATERIAL_MAP } from './materials.js';

function getNeighbors(terrain, idx, x, y, width, height) {
  const neighbors = [];
  if (x > 0) neighbors.push(terrain[idx - 1]);
  if (x < width - 1) neighbors.push(terrain[idx + 1]);
  if (y > 0) neighbors.push(terrain[idx - width]);
  if (y < height - 1) neighbors.push(terrain[idx + width]);
  return neighbors;
}

function matchesRule(current, neighbors, rule) {
  if (!rule.when.includes(current)) return false;
  if (!rule.near?.length) return true;
  return neighbors.some((mat) => rule.near.includes(mat));
}

function applyTerrainTransformRules(world, dt) {
  if (dt <= 0) return;

  const { terrain, gridWidth, gridHeight } = world;

  for (let y = 0; y < gridHeight; y += 1) {
    for (let x = 0; x < gridWidth; x += 1) {
      const idx = y * gridWidth + x;
      const current = terrain[idx];
      if (current === 'empty') continue;

      const neighbors = getNeighbors(terrain, idx, x, y, gridWidth, gridHeight);

      for (const rule of TERRAIN_INTERACTION_RULES) {
        if (!matchesRule(current, neighbors, rule)) continue;
        if (Math.random() >= Math.min(1, rule.chancePerSecond * dt)) continue;

        terrain[idx] = typeof rule.result === 'function'
          ? rule.result(current, neighbors, world)
          : rule.result;

        if (rule.onApply) rule.onApply(world, idx, current);
        break;
      }
    }
  }
}

function updateSoilNutrition(world) {
  let fertile = 0;
  const total = world.terrain.length;
  for (const cell of world.terrain) {
    const fertility = MATERIAL_MAP.get(cell)?.fertility ?? 0;
    if (fertility > 0.5) fertile += 1;
  }
  world.soilNutrition = fertile / Math.max(1, total);
}

export function ecosystemStep(world, dt) {
  applyTerrainTransformRules(world, dt);
  updateSoilNutrition(world);
}
