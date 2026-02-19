import { MATERIAL_MAP } from './materials.js';

function drawAnt(ctx, x, y, cellW, cellH, baseColor) {
  const px = x * cellW;
  const py = y * cellH;
  const bodyH = Math.max(2, cellH * 0.55);
  const bodyY = py + (cellH - bodyH) * 0.5;

  ctx.fillStyle = '#1f1410';
  ctx.fillRect(px + cellW * 0.12, bodyY + bodyH * 0.45, cellW * 0.76, Math.max(1, cellH * 0.08));

  ctx.fillStyle = baseColor;
  ctx.fillRect(px + cellW * 0.08, bodyY + bodyH * 0.25, cellW * 0.22, bodyH * 0.55);
  ctx.fillRect(px + cellW * 0.33, bodyY + bodyH * 0.08, cellW * 0.34, bodyH * 0.72);
  ctx.fillRect(px + cellW * 0.68, bodyY + bodyH * 0.32, cellW * 0.24, bodyH * 0.5);
}

export function renderWorld(ctx, world, debug) {
  ctx.clearRect(0, 0, world.width, world.height);

  const cellW = world.width / world.gridWidth;
  const cellH = world.height / world.gridHeight;
  for (let y = 0; y < world.gridHeight; y += 1) {
    for (let x = 0; x < world.gridWidth; x += 1) {
      const mat = MATERIAL_MAP.get(world.terrain[y * world.gridWidth + x]);
      if (!mat || mat.id === 'empty') continue;
      if (mat.id === 'ant') {
        drawAnt(ctx, x, y, cellW, cellH, mat.color);
        continue;
      }
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
