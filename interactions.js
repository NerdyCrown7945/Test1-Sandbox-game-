export const TERRAIN_INTERACTION_RULES = [
  {
    id: 'lava-water-rock',
    when: ['lava'],
    near: ['water', 'freshwater', 'saltwater'],
    result: 'rock',
    chancePerSecond: 5,
    summary: '용암이 물과 닿으면 빠르게 식어 암석이 됩니다.'
  },
  {
    id: 'toxic-dilution',
    when: ['toxic_sludge'],
    near: ['water', 'freshwater'],
    result: 'water',
    chancePerSecond: 1.2,
    summary: '독성 슬러지는 담수와 섞이면 점차 희석됩니다.'
  },
  {
    id: 'soil-enrichment',
    when: ['soil'],
    near: ['water', 'freshwater', 'fungal_mat'],
    result: 'rich_soil',
    chancePerSecond: 0.35,
    summary: '물과 유기물이 있는 흙은 비옥토로 개선됩니다.'
  },
  {
    id: 'toxicity-damages-organic',
    when: ['rich_soil', 'fungal_mat', 'nectar_pool'],
    near: ['toxic_sludge', 'lava'],
    result: 'soil',
    chancePerSecond: 0.8,
    summary: '독성/고열 환경은 유기물과 비옥토를 빠르게 황폐화시킵니다.'
  }
];
