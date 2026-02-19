import { MATERIAL_MAP } from './materials.js';

function densityOf(id) {
  return MATERIAL_MAP.get(id)?.density ?? 0;
}

function materialOf(id) {
  return MATERIAL_MAP.get(id);
}

function behaviorOf(id) {
  return materialOf(id)?.behavior ?? 'solid';
}

function hasGravity(id) {
  return materialOf(id)?.gravity === true;
}

function isEmpty(id) {
  return id === 'empty';
}

function canSwapDown(topId, bottomId) {
  if (isEmpty(bottomId)) return true;
  const bottomBehavior = behaviorOf(bottomId);
  if (bottomBehavior === 'solid') return false;
  return densityOf(topId) > densityOf(bottomId);
}

export function stepTerrain(world, iterations = 1) {
  const width = world.gridWidth;
  const height = world.gridHeight;
  const terrain = world.terrain;

  for (let iter = 0; iter < iterations; iter += 1) {
    for (let y = height - 2; y >= 0; y -= 1) {
      const leftToRight = Math.random() < 0.5;
      const xStart = leftToRight ? 0 : width - 1;
      const xEnd = leftToRight ? width : -1;
      const xStep = leftToRight ? 1 : -1;

      for (let x = xStart; x !== xEnd; x += xStep) {
        const idx = y * width + x;
        const id = terrain[idx];
        if (isEmpty(id)) continue;

        const behavior = behaviorOf(id);
        if (!hasGravity(id) || behavior === 'solid' || behavior === 'empty') continue;

        const belowIndex = idx + width;
        const belowId = terrain[belowIndex];

        if (canSwapDown(id, belowId)) {
          terrain[belowIndex] = id;
          terrain[idx] = belowId;
          continue;
        }

        if (behavior === 'powder') {
          const downLeftIndex = x > 0 ? belowIndex - 1 : -1;
          const downRightIndex = x < width - 1 ? belowIndex + 1 : -1;

          const tryMove = (nextIndex) => {
            if (nextIndex === -1) return false;
            const nextId = terrain[nextIndex];
            if (!canSwapDown(id, nextId)) return false;
            terrain[nextIndex] = id;
            terrain[idx] = nextId;
            return true;
          };

          if (Math.random() < 0.5) {
            if (tryMove(downLeftIndex)) continue;
            if (tryMove(downRightIndex)) continue;
          } else {
            if (tryMove(downRightIndex)) continue;
            if (tryMove(downLeftIndex)) continue;
          }
        }

        if (behavior === 'liquid') {
          const leftIndex = x > 0 ? idx - 1 : -1;
          const rightIndex = x < width - 1 ? idx + 1 : -1;

          const trySideMove = (nextIndex) => {
            if (nextIndex === -1) return false;
            const nextId = terrain[nextIndex];
            const nextBehavior = behaviorOf(nextId);
            if (isEmpty(nextId) || (nextBehavior !== 'solid' && densityOf(id) > densityOf(nextId))) {
              terrain[nextIndex] = id;
              terrain[idx] = nextId;
              return true;
            }
            return false;
          };

          if (Math.random() < 0.5) {
            if (trySideMove(leftIndex)) continue;
            if (trySideMove(rightIndex)) continue;
          } else {
            if (trySideMove(rightIndex)) continue;
            if (trySideMove(leftIndex)) continue;
          }
        }
      }
    }
  }
}
