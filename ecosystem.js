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

function getNeighborIndices(idx, x, y, width, height) {
  const positions = [];
  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      if (ox === 0 && oy === 0) continue;
      const nx = x + ox;
      const ny = y + oy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      positions.push(ny * width + nx);
    }
  }
  return positions;
}

function applyBiomeLifeDynamics(world, dt) {
  if (dt <= 0) return;

  const { terrain, gridWidth: width, gridHeight: height, climate } = world;
  const next = [...terrain];
  const humidity = climate.rainfall ?? 0;
  const temperature = climate.globalTemperature ?? 20;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      const current = terrain[idx];
      if (current === 'empty') continue;

      const neighborIndices = getNeighborIndices(idx, x, y, width, height);
      const neighbors = neighborIndices.map((nIdx) => terrain[nIdx]);
      const below = y < height - 1 ? terrain[idx + width] : 'rock';
      const waterNearby = neighbors.some((n) => n === 'water' || n === 'freshwater');
      const fertileGround = below === 'soil' || below === 'rich_soil' || below === 'fungal_mat';

      if (current === 'seed' && waterNearby && fertileGround && Math.random() < dt * 1.4) {
        next[idx] = 'young_plant';
        continue;
      }

      if (current === 'young_plant' && waterNearby && Math.random() < dt * 0.9) {
        next[idx] = 'plant';
        continue;
      }

      const mushroomFriendly = humidity > 0.55 && temperature >= 8 && temperature <= 28
        && fertileGround && !neighbors.includes('lava') && !neighbors.includes('toxic_sludge');

      if (current === 'mushroom' && mushroomFriendly && Math.random() < dt * 0.7) {
        const emptyNeighbors = neighborIndices.filter((nIdx) => terrain[nIdx] === 'empty' && next[nIdx] === 'empty');
        if (emptyNeighbors.length) {
          const target = emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
          next[target] = 'mushroom_spore';
        }
      }

      if (current === 'mushroom_spore') {
        if (mushroomFriendly && Math.random() < dt * 1.2) next[idx] = 'mushroom';
        else if (!mushroomFriendly && Math.random() < dt * 0.4) next[idx] = 'empty';
        continue;
      }

      if (current === 'ant') {
        const belowIdx = y < height - 1 ? idx + width : -1;
        if (belowIdx !== -1 && terrain[belowIdx] === 'empty' && next[belowIdx] === 'empty') {
          next[belowIdx] = 'ant';
          next[idx] = 'empty';
          continue;
        }

        const digCandidates = [];
        if (belowIdx !== -1 && (terrain[belowIdx] === 'soil' || terrain[belowIdx] === 'rock')) digCandidates.push(belowIdx);
        for (const nIdx of neighborIndices) {
          const mat = terrain[nIdx];
          if (mat === 'soil' || mat === 'rock') digCandidates.push(nIdx);
        }

        if (digCandidates.length && Math.random() < dt * 1.6) {
          const target = digCandidates[Math.floor(Math.random() * digCandidates.length)];
          next[target] = Math.random() < 0.28 ? 'ant_nest' : 'ant_tunnel';
        }

        const walkable = neighborIndices.filter((nIdx) => terrain[nIdx] === 'empty' && next[nIdx] === 'empty');
        if (walkable.length && Math.random() < dt * 1.1) {
          const target = walkable[Math.floor(Math.random() * walkable.length)];
          next[target] = 'ant';
          next[idx] = 'empty';
        }
      }

      if (current === 'ant_nest' && Math.random() < dt * 0.45) {
        const hatchCells = neighborIndices.filter((nIdx) => terrain[nIdx] === 'empty' && next[nIdx] === 'empty');
        if (hatchCells.length) {
          const target = hatchCells[Math.floor(Math.random() * hatchCells.length)];
          next[target] = 'ant';
        }
      }
    }
  }

  world.terrain = next;
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
  applyBiomeLifeDynamics(world, dt);
  updateSoilNutrition(world);
}
