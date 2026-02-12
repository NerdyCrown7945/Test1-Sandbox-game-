export const STATES = ['Idle', 'Wander', 'SeekFood', 'Flee', 'Attack', 'Reproduce', 'Rest', 'Explore'];

export function evaluateState(entity, context) {
  const { threatNearby, foodNearby, mateNearby } = context;

  if (entity.health < 30 || threatNearby) return 'Flee';
  if (entity.energy < 20) return 'Rest';
  if (entity.hunger > 55) return 'SeekFood';
  if (mateNearby && entity.energy > 60 && entity.hunger < 40) return 'Reproduce';
  if (entity.dna.aggression > 65 && foodNearby?.type === 'prey') return 'Attack';

  if (entity.dna.intelligence > 70) {
    if (foodNearby && entity.hunger > 35) return 'SeekFood';
    return Math.random() > 0.5 ? 'Explore' : 'Wander';
  }

  return Math.random() > 0.7 ? 'Idle' : 'Wander';
}

export function applyStateBehavior(entity, dt, world) {
  const speedFactor = 0.3 + entity.dna.speed / 100;
  switch (entity.state) {
    case 'Flee':
      entity.vx = (Math.random() * 2 - 1) * 1.4 * speedFactor;
      entity.vy = (Math.random() * 2 - 1) * 1.4 * speedFactor;
      entity.energy -= 0.1;
      break;
    case 'SeekFood':
      entity.vx += (Math.random() * 2 - 1) * 0.1;
      entity.vy += (Math.random() * 2 - 1) * 0.1;
      entity.hunger -= 0.25;
      entity.energy += 0.08;
      break;
    case 'Attack':
      entity.energy -= 0.18;
      entity.hunger -= 0.15;
      break;
    case 'Reproduce':
      entity.energy -= 0.25;
      break;
    case 'Rest':
      entity.vx *= 0.88;
      entity.vy *= 0.88;
      entity.energy += 0.2;
      break;
    case 'Explore':
      entity.vx = (Math.random() * 2 - 1) * 0.9 * speedFactor;
      entity.vy = (Math.random() * 2 - 1) * 0.9 * speedFactor;
      entity.energy -= 0.08;
      break;
    case 'Wander':
      entity.vx += (Math.random() * 2 - 1) * 0.05;
      entity.vy += (Math.random() * 2 - 1) * 0.05;
      entity.energy -= 0.05;
      break;
    default:
      entity.vx *= 0.9;
      entity.vy *= 0.9;
      entity.energy += 0.04;
  }

  entity.x = Math.max(0, Math.min(world.width, entity.x + entity.vx * dt * 60));
  entity.y = Math.max(0, Math.min(world.height, entity.y + entity.vy * dt * 60));
  entity.age += dt;
  entity.hunger = Math.min(100, entity.hunger + 0.1);
}
