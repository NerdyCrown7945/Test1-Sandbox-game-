const WATER_IDS = ['water', 'freshwater', 'saltwater'];

export const TERRAIN_INTERACTION_RULES = [
  {
    id: 'lava-water-rock',
    type: 'transform',
    summary: 'water + lava -> rock',
    description: '용암이 물과 접촉하면 암석으로 빠르게 굳습니다.'
  },
  {
    id: 'toxic-sludge-growth-penalty',
    type: 'growth_modifier',
    summary: 'toxic_sludge 주변은 fertility와 식물 성장 확률을 감소시킵니다.',
    description: '독성 오니 인접 지역은 성장 패널티를 받고 토양 영양도가 떨어집니다.'
  },
  {
    id: 'rich-soil-growth-boost',
    type: 'growth_modifier',
    summary: 'rich_soil 주변은 식물 성장 확률을 증가시킵니다.',
    description: '비옥한 토양 주변 셀에 성장 보너스를 제공합니다.'
  },
  {
    id: 'fungus-spread-fungal-mat',
    type: 'transform',
    summary: '버섯 조건 만족 시 soil 일부가 fungal_mat로 변환됩니다.',
    description: '습하고 그늘진 환경에서 균류가 흙을 균사 매트로 바꿉니다.'
  }
];

function neighbors4(index, width, height) {
  const x = index % width;
  const y = Math.floor(index / width);
  const out = [];
  if (x > 0) out.push(index - 1);
  if (x < width - 1) out.push(index + 1);
  if (y > 0) out.push(index - width);
  if (y < height - 1) out.push(index + width);
  return out;
}

function isWater(id) {
  return WATER_IDS.includes(id);
}

export function interactionsStep(world, dt) {
  const { terrain, gridWidth: width, gridHeight: height } = world;
  const size = terrain.length;
  world.growthModifiers = Array.from({ length: size }, () => ({ boost: 0, penalty: 0 }));

  const nextTerrain = terrain.slice();

  for (let idx = 0; idx < size; idx += 1) {
    const id = terrain[idx];
    const neighbors = neighbors4(idx, width, height);

    if (id === 'lava' && neighbors.some((nIdx) => isWater(terrain[nIdx]))) {
      if (Math.random() < Math.min(1, 4 * dt)) nextTerrain[idx] = 'rock';
    }

    if (id === 'toxic_sludge') {
      for (const nIdx of neighbors) {
        world.growthModifiers[nIdx].penalty += 0.45;
      }
      world.soilNutrition = Math.max(0, world.soilNutrition - 0.0004 * dt);
    }

    if (id === 'rich_soil') {
      for (const nIdx of neighbors) {
        world.growthModifiers[nIdx].boost += 0.35;
      }
    }

    const bio = world.biology?.[idx];
    if ((bio === 'mushroom' || bio === 'mold') && id === 'soil') {
      const light = world.lightMap?.[idx] ?? 1;
      const humid = world.climate.humidity;
      if (light < 0.5 && humid > 0.4 && Math.random() < 0.25 * dt) {
        nextTerrain[idx] = 'fungal_mat';
      }
    }
  }

  world.terrain = nextTerrain;
}
