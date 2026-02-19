export const MATERIALS = [
  { id: 'empty', name: 'Empty', color: '#111318', icon: '⬛', category: 'base', behavior: 'empty', fertility: 0, permeability: 1, gravity: false, density: 0 },
  { id: 'soil', name: 'Soil', color: '#6f4e37', icon: '🟫', category: 'terrain', behavior: 'powder', fertility: 0.7, permeability: 0.5, gravity: true, density: 60, displacement: 'sinks' },
  { id: 'rich_soil', name: 'Rich Soil', color: '#4b321f', icon: '🌱', category: 'terrain', behavior: 'powder', fertility: 1, permeability: 0.4, gravity: true, density: 62, displacement: 'sinks' },
  { id: 'sand', name: 'Sand', color: '#d8c27a', icon: '🟨', category: 'terrain', behavior: 'powder', fertility: 0.2, permeability: 0.9, gravity: true, density: 58, displacement: 'sinks' },
  { id: 'water', name: 'Water', color: '#3b82f6', icon: '💧', category: 'liquid', behavior: 'liquid', fertility: 0.1, permeability: 1, gravity: true, density: 30 },
  { id: 'freshwater', name: 'Freshwater', color: '#38bdf8', icon: '🚰', category: 'liquid', behavior: 'liquid', fertility: 0.2, permeability: 1, gravity: true, density: 30 },
  { id: 'saltwater', name: 'Saltwater', color: '#2563eb', icon: '🌊', category: 'liquid', behavior: 'liquid', fertility: 0, permeability: 1, gravity: true, density: 32 },
  { id: 'rock', name: 'Rock', color: '#71717a', icon: '🪨', category: 'solid', behavior: 'solid', fertility: 0, permeability: 0.1, gravity: false, density: 100 },
  { id: 'lava', name: 'Lava', color: '#ef4444', icon: '🌋', category: 'energy', behavior: 'liquid', fertility: -0.5, permeability: 0.2, gravity: true, density: 40, displacement: 'sinks' },
  { id: 'toxic_sludge', name: 'Toxic Sludge', color: '#84cc16', icon: '☣️', category: 'hazard', behavior: 'liquid', fertility: -0.8, permeability: 0.6, gravity: true, density: 38 },
  { id: 'fungal_mat', name: 'Fungal Mat', color: '#a16207', icon: '🍄', category: 'organic', behavior: 'powder', fertility: 0.8, permeability: 0.7, gravity: true, density: 24, displacement: 'floats' },
  { id: 'nectar_pool', name: 'Nectar Pool', color: '#f59e0b', icon: '🍯', category: 'organic', behavior: 'liquid', fertility: 0.6, permeability: 0.8, gravity: true, density: 34 },
  { id: 'seed', name: 'Seed', color: '#b45309', icon: '🌰', category: 'organic', behavior: 'powder', fertility: 0.4, permeability: 0.6, gravity: true, density: 52, displacement: 'sinks' },
  { id: 'young_plant', name: 'Young Plant', color: '#22c55e', icon: '🌿', category: 'organic', behavior: 'solid', fertility: 0.7, permeability: 0.5, gravity: false, density: 65 },
  { id: 'plant', name: 'Plant', color: '#15803d', icon: '🌳', category: 'organic', behavior: 'solid', fertility: 0.9, permeability: 0.4, gravity: false, density: 68 },
  { id: 'mushroom_spore', name: 'Mushroom Spore', color: '#fef3c7', icon: '✨', category: 'organic', behavior: 'powder', fertility: 0.3, permeability: 0.7, gravity: true, density: 20, displacement: 'floats' },
  { id: 'mushroom', name: 'Mushroom', color: '#d97706', icon: '🍄', category: 'organic', behavior: 'solid', fertility: 0.85, permeability: 0.5, gravity: false, density: 64 },
  { id: 'ant', name: 'Ant', color: '#7c2d12', icon: '🐜', category: 'fauna', behavior: 'solid', fertility: 0.1, permeability: 0.6, gravity: false, density: 45 },
  { id: 'ant_nest', name: 'Ant Nest', color: '#92400e', icon: '🏚️', category: 'fauna', behavior: 'solid', fertility: 0.5, permeability: 0.7, gravity: false, density: 70 },
  { id: 'ant_tunnel', name: 'Ant Tunnel', color: '#b7791f', icon: '🕳️', category: 'fauna', behavior: 'solid', fertility: 0.4, permeability: 0.9, gravity: false, density: 50 }
];

export const MATERIAL_MAP = new Map(MATERIALS.map((mat) => [mat.id, mat]));

export function createTerrain(width, height) {
  const terrain = new Array(width * height).fill('empty');
  for (let y = Math.floor(height * 0.55); y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      terrain[idx] = y > height * 0.8 ? 'rock' : Math.random() < 0.2 ? 'sand' : 'soil';
      if (Math.random() < 0.02) terrain[idx] = 'water';
      if (y < height * 0.75 && Math.random() < 0.015) terrain[idx] = 'seed';
      if (y < height * 0.75 && Math.random() < 0.008) terrain[idx] = 'mushroom_spore';
      if (y > height * 0.62 && y < height * 0.85 && Math.random() < 0.005) terrain[idx] = 'ant';
    }
  }
  return terrain;
}
