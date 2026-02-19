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

function isEmpty(id) {
  return id === 'empty';
}

function swapCells(terrain, fromIndex, toIndex) {
  const moving = terrain[fromIndex];
  terrain[fromIndex] = terrain[toIndex];
  terrain[toIndex] = moving;
}

export function stepPowderPass(world) {
  const width = world.gridWidth;
  const height = world.gridHeight;
  const terrain = world.terrain;
  const moved = new Uint8Array(width * height);

  for (let y = height - 2; y >= 0; y -= 1) {
    const leftToRight = Math.random() < 0.5;
    const xStart = leftToRight ? 0 : width - 1;
    const xEnd = leftToRight ? width : -1;
    const xStep = leftToRight ? 1 : -1;

    for (let x = xStart; x !== xEnd; x += xStep) {
      const idx = y * width + x;
      if (moved[idx]) continue;

      const topId = terrain[idx];
      if (isEmpty(topId) || behaviorOf(topId) !== 'powder' || !hasGravity(topId)) continue;

      const belowIndex = idx + width;
      const bottomId = terrain[belowIndex];
      const bottomBehavior = behaviorOf(bottomId);

      // Priority 1: empty -> fall
      if (isEmpty(bottomId)) {
        swapCells(terrain, idx, belowIndex);
        moved[belowIndex] = 1;
        continue;
      }

      // Priority 2: liquid -> sinking swap (powder only)
      if (bottomBehavior === 'liquid') {
        swapCells(terrain, idx, belowIndex);
        moved[belowIndex] = 1;
        continue;
      }

      // Priority 3: powder / solid -> stack (no movement)
    }
  }
}

export function stepLiquidPass(world) {
  const width = world.gridWidth;
  const height = world.gridHeight;
  const terrain = world.terrain;
  const moved = new Uint8Array(width * height);

  for (let y = height - 2; y >= 0; y -= 1) {
    const leftToRight = Math.random() < 0.5;
    const xStart = leftToRight ? 0 : width - 1;
    const xEnd = leftToRight ? width : -1;
    const xStep = leftToRight ? 1 : -1;

    for (let x = xStart; x !== xEnd; x += xStep) {
      const idx = y * width + x;
      if (moved[idx]) continue;

      const id = terrain[idx];
      if (isEmpty(id) || behaviorOf(id) !== 'liquid' || !hasGravity(id)) continue;

      const belowIndex = idx + width;
      const belowId = terrain[belowIndex];
      const belowBehavior = behaviorOf(belowId);

      // Liquid falls into empty only. Never swap down into powder.
      if (isEmpty(belowId)) {
        swapCells(terrain, idx, belowIndex);
        moved[belowIndex] = 1;
        continue;
      }

      if (belowBehavior === 'powder') {
        continue;
      }

      const downLeftIndex = x > 0 ? belowIndex - 1 : -1;
      const downRightIndex = x < width - 1 ? belowIndex + 1 : -1;
      const leftIndex = x > 0 ? idx - 1 : -1;
      const rightIndex = x < width - 1 ? idx + 1 : -1;

      const tryMoveToEmpty = (targetIndex) => {
        if (targetIndex === -1 || moved[targetIndex]) return false;
        if (!isEmpty(terrain[targetIndex])) return false;
        swapCells(terrain, idx, targetIndex);
        moved[targetIndex] = 1;
        return true;
      };

      if (Math.random() < 0.5) {
        if (tryMoveToEmpty(downLeftIndex)) continue;
        if (tryMoveToEmpty(downRightIndex)) continue;
        if (tryMoveToEmpty(leftIndex)) continue;
        if (tryMoveToEmpty(rightIndex)) continue;
      } else {
        if (tryMoveToEmpty(downRightIndex)) continue;
        if (tryMoveToEmpty(downLeftIndex)) continue;
        if (tryMoveToEmpty(rightIndex)) continue;
        if (tryMoveToEmpty(leftIndex)) continue;
      }
    }
  }
}

export function stepTerrain(world, iterations = 1) {
  for (let iter = 0; iter < iterations; iter += 1) {
    stepPowderPass(world);
    stepLiquidPass(world);
  }
}
