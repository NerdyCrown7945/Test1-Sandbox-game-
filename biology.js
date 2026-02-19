import { MATERIAL_MAP } from './materials.js';

export const BIOLOGY_TYPES = {
  none: { id: 'none', name: 'None', color: 'transparent', kind: 'none', growthRate: 0, moistureMin: 0, lightMin: 0, lightMax: 1, substrates: [] },
  grass: { id: 'grass', name: 'Grass', color: '#22c55e', kind: 'plant', growthRate: 0.35, moistureMin: 0.2, lightMin: 0.5, lightMax: 1, substrates: ['soil', 'rich_soil'] },
  bush: { id: 'bush', name: 'Bush', color: '#16a34a', kind: 'plant', growthRate: 0.22, moistureMin: 0.25, lightMin: 0.45, lightMax: 1, substrates: ['soil', 'rich_soil'] },
  tree: { id: 'tree', name: 'Tree', color: '#166534', kind: 'plant', growthRate: 0.12, moistureMin: 0.3, lightMin: 0.55, lightMax: 1, substrates: ['rich_soil'] },
  vine: { id: 'vine', name: 'Vine', color: '#65a30d', kind: 'plant', growthRate: 0.26, moistureMin: 0.3, lightMin: 0.35, lightMax: 0.95, substrates: ['soil', 'rich_soil', 'fungal_mat'] },
  mushroom: { id: 'mushroom', name: 'Mushroom', color: '#f5d0a9', kind: 'fungus', growthRate: 0.23, moistureMin: 0.45, lightMin: 0, lightMax: 0.55, substrates: ['soil', 'rich_soil', 'fungal_mat'] },
  mold: { id: 'mold', name: 'Mold', color: '#bef264', kind: 'fungus', growthRate: 0.3, moistureMin: 0.4, lightMin: 0, lightMax: 0.45, substrates: ['soil', 'fungal_mat'] }
};

const WATER_IDS = new Set(['water', 'freshwater', 'saltwater']);

function getNeighborIndexes(index, width, height) {
  const x = index % width;
  const y = Math.floor(index / width);
  const neighbors = [];
  if (x > 0) neighbors.push(index - 1);
  if (x < width - 1) neighbors.push(index + 1);
  if (y > 0) neighbors.push(index - width);
  if (y < height - 1) neighbors.push(index + width);
  return neighbors;
}

export function ensureBiologyState(world) {
  const size = world.gridWidth * world.gridHeight;
  if (!world.biology || world.biology.length !== size) {
    world.biology = new Array(size).fill('none');
  }
  if (!world.growthModifiers || world.growthModifiers.length !== size) {
    world.growthModifiers = Array.from({ length: size }, () => ({ boost: 0, penalty: 0 }));
  }
}

function computeLightMap(world) {
  const { terrain, gridWidth: width, gridHeight: height, climate } = world;
  const lightMap = new Array(terrain.length).fill(0);
  const sunlight = climate.globalSunlight ?? 1;

  for (let x = 0; x < width; x += 1) {
    let blocked = false;
    for (let y = 0; y < height; y += 1) {
      const idx = y * width + x;
      const id = terrain[idx];
      const behavior = MATERIAL_MAP.get(id)?.behavior;
      if (blocked) {
        lightMap[idx] = 0;
      } else {
        lightMap[idx] = sunlight;
      }
      if (id !== 'empty' && behavior !== 'liquid') blocked = true;
    }
  }

  world.lightMap = lightMap;
  return lightMap;
}

function moistureAt(world, idx) {
  const { terrain, gridWidth: width, gridHeight: height } = world;
  const neighbors = getNeighborIndexes(idx, width, height);
  let moisture = world.climate.humidity * 0.2;
  for (const nIdx of neighbors) {
    if (WATER_IDS.has(terrain[nIdx])) moisture += 0.35;
  }
  return Math.min(1, moisture);
}

function canLiveOnSubstrate(world, idx, biologyType) {
  const below = idx + world.gridWidth;
  if (below >= world.terrain.length) return false;
  return biologyType.substrates.includes(world.terrain[below]);
}

function randomBiologyForSubstrate(substrate) {
  if (substrate === 'rich_soil') return Math.random() < 0.6 ? 'grass' : 'bush';
  if (substrate === 'fungal_mat') return Math.random() < 0.5 ? 'mold' : 'mushroom';
  return 'grass';
}

export function biologyStep(world, dt) {
  if (dt <= 0) return;
  ensureBiologyState(world);

  const { biology, terrain, gridWidth: width, gridHeight: height, growthModifiers } = world;
  const lightMap = computeLightMap(world);
  const nextBiology = biology.slice();

  for (let idx = 0; idx < biology.length; idx += 1) {
    const current = biology[idx];
    const light = lightMap[idx];
    const moisture = moistureAt(world, idx);

    if (current !== 'none') {
      const type = BIOLOGY_TYPES[current];
      const validSubstrate = canLiveOnSubstrate(world, idx, type);
      if (!validSubstrate || moisture < type.moistureMin * 0.6 || light < type.lightMin * 0.6 || light > (type.lightMax + 0.3)) {
        nextBiology[idx] = 'none';
        continue;
      }

      const growthBonus = 1 + (growthModifiers[idx]?.boost ?? 0) - (growthModifiers[idx]?.penalty ?? 0);
      const spreadChance = Math.max(0, type.growthRate * dt * growthBonus);
      if (Math.random() < spreadChance) {
        const neighbors = getNeighborIndexes(idx, width, height).sort(() => Math.random() - 0.5);
        for (const nIdx of neighbors) {
          if (terrain[nIdx] !== 'empty' || nextBiology[nIdx] !== 'none') continue;
          if (!canLiveOnSubstrate(world, nIdx, type)) continue;
          const nLight = lightMap[nIdx];
          const nMoisture = moistureAt(world, nIdx);
          if (nMoisture < type.moistureMin || nLight < type.lightMin || nLight > type.lightMax) continue;
          nextBiology[nIdx] = type.id;
          break;
        }
      }

      continue;
    }

    if (terrain[idx] !== 'empty') continue;
    const below = idx + width;
    if (below >= terrain.length) continue;

    const substrate = terrain[below];
    if (!['soil', 'rich_soil', 'fungal_mat'].includes(substrate)) continue;

    const spawnId = substrate === 'fungal_mat'
      ? (Math.random() < 0.5 ? 'mold' : 'mushroom')
      : (Math.random() < 0.1 ? randomBiologyForSubstrate(substrate) : 'none');
    if (spawnId === 'none') continue;

    const type = BIOLOGY_TYPES[spawnId];
    if (moisture >= type.moistureMin && light >= type.lightMin && light <= type.lightMax) {
      const modifier = 1 + (growthModifiers[idx]?.boost ?? 0) - (growthModifiers[idx]?.penalty ?? 0);
      if (Math.random() < type.growthRate * 0.15 * dt * modifier) {
        nextBiology[idx] = spawnId;
      }
    }
  }

  world.biology = nextBiology;
}
