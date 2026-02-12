import { createRandomDNA, dnaToColor } from './dna.js';

export const LIFEFORM_SPECIES = [
  'microbe', 'algae', 'mossling', 'fungoid', 'seedling',
  'grazer_mite', 'burrower', 'snailoid', 'pollinator', 'crawler',
  'scavenger_beetle', 'school_fish', 'reef_filter', 'glider', 'pack_hunter',
  'ambush_stalker', 'apex_predator', 'parasite_worm', 'symbiote_sprite', 'decomposer',
  'plankton', 'river_turtle', 'canopy_herbivore'
];

let entityId = 1;

export function spawnLifeform(overrides = {}) {
  const dna = overrides.dna || createRandomDNA();
  const species = overrides.species || LIFEFORM_SPECIES[Math.floor(Math.random() * LIFEFORM_SPECIES.length)];
  return {
    id: entityId += 1,
    species,
    state: 'Idle',
    x: overrides.x ?? Math.random() * 200,
    y: overrides.y ?? Math.random() * 150,
    vx: 0,
    vy: 0,
    age: 0,
    generation: overrides.generation ?? 1,
    energy: 45 + Math.random() * 40,
    hunger: Math.random() * 35,
    health: 100,
    dna,
    color: dnaToColor(dna),
    traits: [],
    qTable: {},
    strategy: dna.intelligence > 70 ? 'advanced-fsm' : 'simple-fsm'
  };
}

export function spawnInitialPopulation(count) {
  return Array.from({ length: count }, () => spawnLifeform());
}
