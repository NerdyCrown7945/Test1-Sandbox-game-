export const TERRAIN_INTERACTION_RULES = [
  {
    id: 'lava-water-rock',
    materials: ['lava', 'water', 'freshwater', 'saltwater'],
    result: 'rock',
    chancePerSecond: 4,
    summary: '용암이 물과 만나면 빠르게 식어서 암석으로 굳습니다.'
  },
  {
    id: 'lava-nectar-toxic',
    materials: ['lava', 'nectar_pool'],
    result: 'toxic_sludge',
    chancePerSecond: 1.5,
    summary: '고온의 용암이 유기 액체를 태우며 독성 슬러지를 만듭니다.'
  },
  {
    id: 'water-toxic-dilution',
    materials: ['toxic_sludge', 'water', 'freshwater'],
    result: 'water',
    chancePerSecond: 0.8,
    summary: '담수와 섞인 독성 물질은 점차 희석되어 물로 돌아갑니다.'
  }
];

export const LIFE_TERRAIN_INTERACTION_RULES = [
  {
    id: 'terrain-hazard-damage',
    summary: 'Hazard 지형은 생명체에 지속 피해를 입힙니다.'
  },
  {
    id: 'lava-direct-damage',
    summary: 'Lava 위의 생명체는 더 큰 화상 피해를 받습니다.'
  },
  {
    id: 'water-hydration',
    summary: '물 지형은 갈증(허기)을 완화합니다.'
  },
  {
    id: 'fertility-feeding',
    summary: '비옥한 토양은 초식/잡식 계열의 에너지 회복을 돕습니다.'
  }
];
