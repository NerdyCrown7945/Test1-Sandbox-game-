import { MATERIAL_MAP } from './materials.js';

export function renderWorld(ctx, world, debug) {
  ctx.clearRect(0, 0, world.width, world.height);

  const cellW = world.width / world.gridWidth;
  const cellH = world.height / world.gridHeight;
  for (let y = 0; y < world.gridHeight; y += 1) {
    for (let x = 0; x < world.gridWidth; x += 1) {
      const mat = MATERIAL_MAP.get(world.terrain[y * world.gridWidth + x]);
      if (!mat || mat.id === 'empty') continue;
      ctx.fillStyle = mat.color;
      ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
    }
  }

  if (debug) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(8, 8, 250, 58);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Season: ${world.climate.season}`, 16, 24);
    ctx.fillText(`Temp: ${world.climate.globalTemperature.toFixed(1)}°C`, 16, 40);
    ctx.fillText(`Event: ${world.climate.event || 'none'}`, 16, 56);
  }
}
