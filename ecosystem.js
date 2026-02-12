import { spawnLifeform } from './lifeforms.js';
import { breedDNA } from './dna.js';
import { MATERIAL_MAP } from './materials.js';
import { TERRAIN_INTERACTION_RULES } from './interactions.js';

class Quadtree {
  constructor(boundary, capacity = 8, depth = 0) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.depth = depth;
    this.points = [];
    this.divided = false;
  }

  contains(p) {
    const { x, y, w, h } = this.boundary;
    return p.x >= x && p.x < x + w && p.y >= y && p.y < y + h;
  }

  subdivide() {
    const { x, y, w, h } = this.boundary;
    const hw = w / 2;
    const hh = h / 2;
    this.nw = new Quadtree({ x, y, w: hw, h: hh }, this.capacity, this.depth + 1);
    this.ne = new Quadtree({ x: x + hw, y, w: hw, h: hh }, this.capacity, this.depth + 1);
    this.sw = new Quadtree({ x, y: y + hh, w: hw, h: hh }, this.capacity, this.depth + 1);
    this.se = new Quadtree({ x: x + hw, y: y + hh, w: hw, h: hh }, this.capacity, this.depth + 1);
    this.divided = true;
  }

  insert(p) {
    if (!this.contains(p)) return false;
    if (this.points.length < this.capacity || this.depth > 6) {
      this.points.push(p);
      return true;
    }
    if (!this.divided) this.subdivide();
    return this.nw.insert(p) || this.ne.insert(p) || this.sw.insert(p) || this.se.insert(p);
  }

  query(range, found = []) {
    if (!intersects(this.boundary, range)) return found;
    for (const p of this.points) {
      if (p.x >= range.x && p.x <= range.x + range.w && p.y >= range.y && p.y <= range.y + range.h) {
        found.push(p);
      }
    }
    if (this.divided) {
      this.nw.query(range, found);
      this.ne.query(range, found);
      this.sw.query(range, found);
      this.se.query(range, found);
    }
    return found;
  }
}

function intersects(a, b) {
  return !(b.x > a.x + a.w || b.x + b.w < a.x || b.y > a.y + a.h || b.y + b.h < a.y);
}

export function buildSpatialIndex(entities, world) {
  const qt = new Quadtree({ x: 0, y: 0, w: world.width, h: world.height });
  for (const e of entities) qt.insert(e);
  return qt;
}

export function ecosystemStep(world, dt) {
  applyTerrainTransformRules(world, dt);

  const births = [];
  const deaths = new Set();
  const qt = buildSpatialIndex(world.entities, world);

  for (const entity of world.entities) {
    const neighbors = qt.query({ x: entity.x - 12, y: entity.y - 12, w: 24, h: 24 }).filter((n) => n !== entity);
    const threatNearby = neighbors.some((n) => n.dna.aggression > entity.dna.aggression + 25);
    const mateNearby = neighbors.find((n) => n.species === entity.species);

    entity._context = {
      threatNearby,
      mateNearby,
      foodNearby: { type: entity.dna.dietPreference === 'carnivore' ? 'prey' : 'resource' }
    };

    if (mateNearby && entity.state === 'Reproduce' && Math.random() < entity.dna.reproductionRate / 1300) {
      births.push(spawnLifeform({
        species: entity.species,
        x: entity.x + (Math.random() * 6 - 3),
        y: entity.y + (Math.random() * 6 - 3),
        dna: breedDNA(entity.dna, mateNearby.dna),
        generation: Math.max(entity.generation, mateNearby.generation) + 1
      }));
    }

    applyClimateDamage(entity, world.climate, dt);
    applyTerrainInteraction(entity, world, dt);
    applyEntityInteraction(entity, neighbors, deaths, dt);
    if (entity.health <= 0 || entity.age > entity.dna.lifespan) {
      deaths.add(entity.id);
      world.soilNutrition = Math.min(1, world.soilNutrition + 0.01);
    }

    if (world.rlEnabled) updateQValue(entity);
  }

  world.entities = world.entities.filter((e) => !deaths.has(e.id));
  world.entities.push(...births.slice(0, Math.max(0, world.maxEntities - world.entities.length)));
}

function applyTerrainTransformRules(world, dt) {
  if (dt <= 0) return;

  const { terrain, gridWidth, gridHeight } = world;
  for (let y = 0; y < gridHeight; y += 1) {
    for (let x = 0; x < gridWidth; x += 1) {
      const idx = y * gridWidth + x;
      const current = terrain[idx];
      if (current === 'empty') continue;

      const neighbors = [];
      if (x > 0) neighbors.push(terrain[idx - 1]);
      if (x < gridWidth - 1) neighbors.push(terrain[idx + 1]);
      if (y > 0) neighbors.push(terrain[idx - gridWidth]);
      if (y < gridHeight - 1) neighbors.push(terrain[idx + gridWidth]);

      for (const rule of TERRAIN_INTERACTION_RULES) {
        if (!rule.materials.includes(current)) continue;
        const hasPairMaterial = neighbors.some((mat) => rule.materials.includes(mat) && mat !== current);
        if (!hasPairMaterial) continue;
        if (Math.random() < Math.min(1, rule.chancePerSecond * dt)) {
          terrain[idx] = rule.result;
          break;
        }
      }
    }
  }
}

function getTerrainAt(entity, world) {
  const gx = Math.max(0, Math.min(world.gridWidth - 1, Math.floor((entity.x / world.width) * world.gridWidth)));
  const gy = Math.max(0, Math.min(world.gridHeight - 1, Math.floor((entity.y / world.height) * world.gridHeight)));
  return MATERIAL_MAP.get(world.terrain[gy * world.gridWidth + gx]);
}

function applyTerrainInteraction(entity, world, dt) {
  const mat = getTerrainAt(entity, world);
  if (!mat) return;

  if (mat.category === 'hazard') entity.health -= dt * 8;
  if (mat.id === 'lava') entity.health -= dt * 12;
  if (mat.id === 'water' || mat.id === 'freshwater' || mat.id === 'saltwater') {
    entity.hunger = Math.max(0, entity.hunger - dt * (0.8 + entity.dna.waterDependency / 200));
  }

  if (entity.dna.dietPreference !== 'carnivore' && mat.fertility > 0.5) {
    entity.hunger = Math.max(0, entity.hunger - dt * 2.2 * mat.fertility);
    entity.energy = Math.min(100, entity.energy + dt * 1.4 * mat.fertility);
  }
}

function applyEntityInteraction(entity, neighbors, deaths, dt) {
  if (entity.state === 'Attack' && entity.dna.dietPreference === 'carnivore') {
    const prey = neighbors
      .filter((n) => !deaths.has(n.id) && n.health > 0 && n.species !== entity.species)
      .sort((a, b) => a.health - b.health)[0];
    if (prey) {
      const damage = dt * (12 + entity.dna.aggression * 0.1);
      prey.health -= damage;
      if (prey.health <= 0) {
        deaths.add(prey.id);
        entity.hunger = Math.max(0, entity.hunger - 18);
        entity.energy = Math.min(100, entity.energy + 10);
      }
    }
  }

  if (entity.state === 'Reproduce' && neighbors.some((n) => n.species === entity.species)) {
    entity.health = Math.min(100, entity.health + dt * 0.5);
  }
}

function applyClimateDamage(entity, climate, dt) {
  const tempGap = Math.abs(climate.globalTemperature - entity.dna.temperatureTolerance);
  if (tempGap > 26) entity.health -= dt * (tempGap / 12);
  if (climate.toxicityLevel > 0.55) entity.health -= dt * climate.toxicityLevel * 3;
  if (entity.dna.waterDependency > 70 && climate.rainfall < 0.2) entity.health -= dt * 1.2;
}

function updateQValue(entity) {
  const stateKey = `${entity.state}-${Math.round(entity.hunger / 20)}`;
  const reward = (100 - entity.hunger) * 0.02 + entity.energy * 0.01 + entity.health * 0.005;
  entity.qTable[stateKey] = (entity.qTable[stateKey] || 0) * 0.9 + reward * 0.1;
}
