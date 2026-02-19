import { MATERIAL_MAP } from './materials.js';
import { BIOLOGY_TYPES } from './biology.js';

export function renderWorld(ctx, world, debug) {
  ctx.clearRect(0, 0, world.width, world.height);

  const cellW = world.width / world.gridWidth;
  const cellH = world.height / world.gridHeight;
  for (let y = 0; y < world.gridHeight; y += 1) {
    for (let x = 0; x < world.gridWidth; x += 1) {
      const idx = y * world.gridWidth + x;
      const mat = MATERIAL_MAP.get(world.terrain[idx]);
      if (mat && mat.id !== 'empty') {
        ctx.fillStyle = mat.color;
        ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
      }

      const bioId = world.biology?.[idx] ?? 'none';
      if (bioId !== 'none') {
        const bio = BIOLOGY_TYPES[bioId];
        if (bio) {
          ctx.fillStyle = bio.color;
          ctx.fillRect(x * cellW + cellW * 0.2, y * cellH + cellH * 0.2, Math.max(1, cellW * 0.6), Math.max(1, cellH * 0.6));
        }
      }
    }
  }

  if (debug) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(8, 8, 270, 72);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Season: ${world.climate.season}`, 16, 24);
    ctx.fillText(`Temp: ${world.climate.globalTemperature.toFixed(1)}°C`, 16, 40);
    ctx.fillText(`Sunlight: ${(world.climate.globalSunlight ?? 1).toFixed(2)}`, 16, 56);
    ctx.fillText(`Event: ${world.climate.event || 'none'}`, 16, 72);
  }
}
