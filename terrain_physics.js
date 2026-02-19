import { MATERIAL_MAP } from './materials.js';

function materialOf(id) {
  return MATERIAL_MAP.get(id);
}

function behaviorOf(id) {
  return materialOf(id)?.behavior ?? 'solid';
}

function hasGravity(id) {
  return materialOf(id)?.gravity === true;
}

function densityOf(id) {
  return materialOf(id)?.density ?? 0;
}

function isEmpty(id) {
  return id === 'empty';
}

function canSwapDown(topId, bottomId) {
  if (isEmpty(bottomId)) return true;

  const topBehavior = behaviorOf(topId);
  const bottomBehavior = behaviorOf(bottomId);

  if (topBehavior === 'powder') {
    // powder는 liquid를 통과해 침강할 수 있지만, 그 외 물질은 밀어내지 않는다.
    return bottomBehavior === 'liquid';
  }

  if (topBehavior === 'liquid') {
    // liquid는 powder/solid를 뚫고 내려가지 않는다.
    if (bottomBehavior === 'solid' || bottomBehavior === 'powder') return false;
    if (bottomBehavior === 'liquid') return densityOf(topId) > densityOf(bottomId);
    return false;
  }

  return false;
}

function applyVoidEffects(world) {
  const { terrain, gridWidth: width, gridHeight: height } = world;
  const pendingClear = new Set();
  const offsets = [-1, 0, 1];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      if (terrain[idx] !== 'void') continue;

      for (const dy of offsets) {
        for (const dx of offsets) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const nIdx = ny * width + nx;
          const id = terrain[nIdx];
          if (id === 'empty') continue;
          if (behaviorOf(id) === 'solid') continue;
          pendingClear.add(nIdx);
        }
      }
    }
  }

  pendingClear.forEach((index) => {
    terrain[index] = 'empty';
    if (world.biology) world.biology[index] = 'none';
  });
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
        if (isEmpty(id) || id === 'void') continue;

        const behavior = behaviorOf(id);
        if (!hasGravity(id) || behavior === 'solid' || behavior === 'empty' || behavior === 'special') continue;

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
            if (!isEmpty(nextId)) return false;
            terrain[nextIndex] = id;
            terrain[idx] = 'empty';
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
            if (isEmpty(nextId)) {
              terrain[nextIndex] = id;
              terrain[idx] = 'empty';
              return true;
            }
            if (nextBehavior === 'liquid' && densityOf(id) > densityOf(nextId)) {
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

    applyVoidEffects(world);
  }
}
