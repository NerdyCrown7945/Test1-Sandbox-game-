const GRID_WIDTH = 200;
const GRID_HEIGHT = 150;
const CELL_SIZE = 4;
const TOTAL = GRID_WIDTH * GRID_HEIGHT;

const MATERIAL_DEFS = [
  { key: "empty", name: "Empty", color: "#000000", category: "none", density: 0, behavior: "static", defaultTemp: 20, flammability: 0, conductivity: 0, description: "빈 공간" },
  { key: "sand", name: "Sand", color: "#d8c37a", category: "solid", density: 7, behavior: "powder", defaultTemp: 20, flammability: 0, conductivity: 0.15, description: "기본 입자 고체. 중력으로 낙하" },
  { key: "stone", name: "Stone", color: "#7d828b", category: "solid", density: 10, behavior: "static", defaultTemp: 20, flammability: 0, conductivity: 0.2, description: "단단한 고체 벽" },
  { key: "dirt", name: "Dirt", color: "#6c4f37", category: "solid", density: 8, behavior: "powder", defaultTemp: 20, flammability: 0.05, conductivity: 0.1, description: "약한 고체 흙" },
  { key: "metal", name: "Metal", color: "#a4afb8", category: "solid", density: 12, behavior: "static", defaultTemp: 20, flammability: 0, conductivity: 0.85, description: "열전도가 높은 고체" },
  { key: "glass", name: "Glass", color: "#8fd3de", category: "solid", density: 9, behavior: "static", defaultTemp: 20, flammability: 0, conductivity: 0.25, description: "투명한 비가연성 고체" },
  { key: "ice", name: "Ice", color: "#b9ecff", category: "solid", density: 8, behavior: "static", defaultTemp: -5, flammability: 0, conductivity: 0.2, description: "차가운 고체. 가열 시 물로 변화" },
  { key: "wood", name: "Wood", color: "#9b6a3b", category: "solid", density: 7, behavior: "static", defaultTemp: 20, flammability: 0.7, conductivity: 0.1, description: "잘 타는 구조물 재료" },
  { key: "coal", name: "Coal", color: "#2e2e2e", category: "solid", density: 8, behavior: "static", defaultTemp: 20, flammability: 0.8, conductivity: 0.2, description: "오래 타는 연료" },
  { key: "salt", name: "Salt", color: "#dfe8ef", category: "solid", density: 7, behavior: "powder", defaultTemp: 20, flammability: 0, conductivity: 0.1, description: "물에 녹아 소금물 형성" },
  { key: "brick", name: "Brick", color: "#a04831", category: "solid", density: 11, behavior: "static", defaultTemp: 20, flammability: 0, conductivity: 0.18, description: "내구도 높은 고체" },
  { key: "mud", name: "Mud", color: "#7c624d", category: "solid", density: 8, behavior: "powder", defaultTemp: 20, flammability: 0.02, conductivity: 0.12, description: "물과 흙이 만나 만들어진 젖은 흙" },
  { key: "rust", name: "Rust", color: "#b5623e", category: "solid", density: 8, behavior: "powder", defaultTemp: 20, flammability: 0, conductivity: 0.1, description: "산에 부식된 금속 부산물" },

  { key: "water", name: "Water", color: "#4287f5", category: "liquid", density: 5, behavior: "liquid", defaultTemp: 20, flammability: 0, conductivity: 0.4, description: "기본 액체. 냉각/가열 반응" },
  { key: "oil", name: "Oil", color: "#4f3825", category: "liquid", density: 4, behavior: "liquid", defaultTemp: 20, flammability: 0.85, conductivity: 0.15, description: "물보다 가볍고 쉽게 발화" },
  { key: "lava", name: "Lava", color: "#ff5a22", category: "liquid", density: 9, behavior: "liquid", defaultTemp: 600, flammability: 0, conductivity: 0.45, description: "매우 뜨거운 액체, 접촉 물질 가열" },
  { key: "acid", name: "Acid", color: "#8cf542", category: "liquid", density: 5, behavior: "liquid", defaultTemp: 25, flammability: 0, conductivity: 0.3, description: "특정 고체를 녹임" },
  { key: "brine", name: "Brine", color: "#73aaf7", category: "liquid", density: 6, behavior: "liquid", defaultTemp: 20, flammability: 0, conductivity: 0.45, description: "소금이 녹은 물" },
  { key: "alcohol", name: "Alcohol", color: "#b7d7ff", category: "liquid", density: 3, behavior: "liquid", defaultTemp: 20, flammability: 0.95, conductivity: 0.15, description: "휘발성 가연성 액체" },
  { key: "mercury", name: "Mercury", color: "#b8bcc9", category: "liquid", density: 11, behavior: "liquid", defaultTemp: 20, flammability: 0, conductivity: 0.75, description: "무거운 액체 금속" },

  { key: "steam", name: "Steam", color: "#d0d9e6", category: "gas", density: 1, behavior: "gas", defaultTemp: 120, flammability: 0, conductivity: 0.1, description: "상승 후 냉각되면 물로 응결" },
  { key: "smoke", name: "Smoke", color: "#58555e", category: "gas", density: 1, behavior: "gas", defaultTemp: 80, flammability: 0.2, conductivity: 0.08, description: "연소 부산물, 위로 상승" },
  { key: "hydrogen", name: "Hydrogen", color: "#b6fff2", category: "gas", density: 1, behavior: "gas", defaultTemp: 20, flammability: 1.0, conductivity: 0.05, description: "아주 잘 타는 가스" },
  { key: "oxygen", name: "Oxygen", color: "#9ec1ff", category: "gas", density: 1, behavior: "gas", defaultTemp: 20, flammability: 0, conductivity: 0.05, description: "연소 확산을 돕는 가스" },
  { key: "toxic_gas", name: "Toxic Gas", color: "#88aa55", category: "gas", density: 1, behavior: "gas", defaultTemp: 30, flammability: 0.1, conductivity: 0.04, description: "산 반응 부산물" },

  { key: "fire", name: "Fire", color: "#ffb347", category: "energy", density: 0, behavior: "fire", defaultTemp: 450, flammability: 0, conductivity: 0, description: "주변 가연물 점화" },
  { key: "spark", name: "Spark", color: "#ffd700", category: "energy", density: 0, behavior: "spark", defaultTemp: 500, flammability: 0, conductivity: 0, description: "짧게 유지되는 점화원" },
  { key: "electricity", name: "Electricity", color: "#00f5ff", category: "energy", density: 0, behavior: "electric", defaultTemp: 300, flammability: 0, conductivity: 0, description: "전도성 물질 따라 이동" },
  { key: "explosion", name: "Explosion", color: "#ffdf66", category: "energy", density: 0, behavior: "explosion", defaultTemp: 700, flammability: 0, conductivity: 0, description: "순간 폭발 에너지" }
];

const MATERIALS = MATERIAL_DEFS.map((m, id) => ({ ...m, id }));
const ID = Object.fromEntries(MATERIALS.map((m) => [m.key, m.id]));

const grid = new Uint8Array(TOTAL);
const tempGrid = new Float32Array(TOTAL);
const lifeGrid = new Uint16Array(TOTAL);
const updated = new Uint8Array(TOTAL);
const dirty = new Set();

const canvas = document.getElementById("sandboxCanvas");
const ctx = canvas.getContext("2d");
canvas.width = GRID_WIDTH * CELL_SIZE;
canvas.height = GRID_HEIGHT * CELL_SIZE;

const materialSelect = document.getElementById("materialSelect");
const brushSizeInput = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");
const drawModeBtn = document.getElementById("drawModeBtn");
const eraseModeBtn = document.getElementById("eraseModeBtn");
const pauseBtn = document.getElementById("pauseBtn");
const clearBtn = document.getElementById("clearBtn");
const speedRange = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");
const fpsLabel = document.getElementById("fps");

const interactionsBtn = document.getElementById("interactionsBtn");
const interactionsModal = document.getElementById("interactionsModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const materialsTableBody = document.getElementById("materialsTableBody");
const rulesTableBody = document.getElementById("rulesTableBody");
const materialCards = document.getElementById("materialCards");

let selectedMaterial = ID.sand;
let brushSize = Number(brushSizeInput.value);
let mode = "draw";
let paused = false;
let simSpeed = Number(speedRange.value);
let painting = false;

function indexOf(x, y) {
  return y * GRID_WIDTH + x;
}

function inBounds(x, y) {
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

function markDirty(x, y) {
  if (inBounds(x, y)) dirty.add(indexOf(x, y));
}

function setCell(x, y, matId, customLife = null) {
  if (!inBounds(x, y)) return;
  const i = indexOf(x, y);
  const prev = grid[i];
  if (prev === matId && customLife === null) return;
  grid[i] = matId;
  tempGrid[i] = MATERIALS[matId].defaultTemp;
  if (customLife !== null) lifeGrid[i] = customLife;
  else if (matId === ID.fire) lifeGrid[i] = 15;
  else if (matId === ID.spark) lifeGrid[i] = 4;
  else if (matId === ID.electricity) lifeGrid[i] = 6;
  else if (matId === ID.explosion) lifeGrid[i] = 2;
  else lifeGrid[i] = 0;
  markDirty(x, y);
}

function swapCells(x1, y1, x2, y2) {
  const i1 = indexOf(x1, y1);
  const i2 = indexOf(x2, y2);
  [grid[i1], grid[i2]] = [grid[i2], grid[i1]];
  [tempGrid[i1], tempGrid[i2]] = [tempGrid[i2], tempGrid[i1]];
  [lifeGrid[i1], lifeGrid[i2]] = [lifeGrid[i2], lifeGrid[i1]];
  updated[i2] = 1;
  markDirty(x1, y1);
  markDirty(x2, y2);
}

function canDisplace(fromId, toId) {
  if (toId === ID.empty) return true;
  const a = MATERIALS[fromId];
  const b = MATERIALS[toId];
  if (b.category === "energy") return true;
  return a.density > b.density && b.behavior !== "static";
}

const REACTION_RULES = [
  {
    id: "water_lava",
    trigger: ["water", "lava"],
    result: "물 + 용암 → 돌 + 증기",
    description: "격렬한 냉각 반응",
    chance: 1,
    apply: ({ x, y, nx, ny, aKey, bKey }) => {
      if (aKey === "water") {
        setCell(x, y, ID.steam);
        setCell(nx, ny, Math.random() < 0.7 ? ID.stone : ID.glass);
      } else {
        setCell(x, y, Math.random() < 0.7 ? ID.stone : ID.glass);
        setCell(nx, ny, ID.steam);
      }
      return true;
    }
  },
  {
    id: "water_sand",
    trigger: ["water", "sand"],
    result: "물 + 모래 → 젖은 모래",
    description: "모래 입자에 수분 흡수",
    chance: 0.35,
    apply: ({ x, y, nx, ny, aKey, bKey }) => {
      if (aKey === "sand") setCell(x, y, ID.mud);
      else if (aKey === "water") setCell(x, y, ID.mud);
      if (bKey === "sand" || bKey === "water") setCell(nx, ny, ID.mud);
      return true;
    }
  },
  {
    id: "water_dirt",
    trigger: ["water", "dirt"],
    result: "물 + 흙 → 진흙",
    description: "점성 있는 고체로 변화",
    chance: 0.45,
    apply: ({ x, y, nx, ny }) => {
      setCell(x, y, ID.mud);
      setCell(nx, ny, ID.mud);
      return true;
    }
  },
  {
    id: "salt_water",
    trigger: ["salt", "water"],
    result: "소금 + 물 → 소금물",
    description: "용해 반응",
    chance: 0.4,
    apply: ({ x, y, nx, ny }) => {
      setCell(x, y, ID.brine);
      setCell(nx, ny, ID.brine);
      return true;
    }
  },
  {
    id: "acid_metal",
    trigger: ["acid", "metal"],
    result: "산 + 금속 → 녹 + 유독가스",
    description: "금속 부식",
    chance: 0.35,
    apply: ({ x, y, nx, ny, aKey }) => {
      if (aKey === "acid") {
        setCell(x, y, ID.toxic_gas);
        setCell(nx, ny, ID.rust);
      } else {
        setCell(x, y, ID.rust);
        setCell(nx, ny, ID.toxic_gas);
      }
      return true;
    }
  },
  {
    id: "acid_stone",
    trigger: ["acid", "stone"],
    result: "산 + 돌 → 유독가스",
    description: "산성 침식",
    chance: 0.2,
    apply: ({ x, y, nx, ny, aKey }) => {
      if (aKey === "acid") {
        setCell(nx, ny, ID.toxic_gas);
      } else {
        setCell(x, y, ID.toxic_gas);
      }
      return true;
    }
  },
  {
    id: "fire_water",
    trigger: ["fire", "water"],
    result: "불 + 물 → 증기",
    description: "소화와 기화",
    chance: 0.9,
    apply: ({ x, y, nx, ny, aKey }) => {
      if (aKey === "fire") {
        setCell(x, y, ID.steam);
        setCell(nx, ny, ID.steam);
      } else {
        setCell(x, y, ID.steam);
        setCell(nx, ny, ID.steam);
      }
      return true;
    }
  },
  {
    id: "fire_ice",
    trigger: ["fire", "ice"],
    result: "불 + 얼음 → 물 + 증기",
    description: "급속 융해",
    chance: 0.75,
    apply: ({ x, y, nx, ny, aKey }) => {
      if (aKey === "fire") {
        setCell(x, y, ID.steam);
        setCell(nx, ny, ID.water);
      } else {
        setCell(x, y, ID.water);
        setCell(nx, ny, ID.steam);
      }
      return true;
    }
  },
  {
    id: "spark_hydrogen",
    trigger: ["spark", "hydrogen"],
    result: "스파크 + 수소 → 폭발",
    description: "가연성 가스 폭발",
    chance: 1,
    apply: ({ x, y, nx, ny }) => {
      setCell(x, y, ID.explosion, 2);
      setCell(nx, ny, ID.explosion, 2);
      return true;
    }
  },
  {
    id: "electric_water",
    trigger: ["electricity", "water"],
    result: "전기 + 물 → 스파크 확산",
    description: "전기 충격 전달",
    chance: 0.7,
    apply: ({ x, y, nx, ny }) => {
      setCell(x, y, ID.spark, 3);
      setCell(nx, ny, ID.spark, 3);
      return true;
    }
  },
  {
    id: "fire_oxygen",
    trigger: ["fire", "oxygen"],
    result: "불 + 산소 → 연소 강화",
    description: "불꽃 수명 증가",
    chance: 0.85,
    apply: ({ x, y, nx, ny, aKey }) => {
      const firePos = aKey === "fire" ? [x, y] : [nx, ny];
      const fireIdx = indexOf(firePos[0], firePos[1]);
      lifeGrid[fireIdx] = Math.min(35, lifeGrid[fireIdx] + 4);
      setCell(aKey === "oxygen" ? x : nx, aKey === "oxygen" ? y : ny, ID.smoke);
      return true;
    }
  }
];

const ruleIndex = new Map();
for (const rule of REACTION_RULES) {
  const [a, b] = rule.trigger;
  ruleIndex.set(`${a}|${b}`, rule);
  ruleIndex.set(`${b}|${a}`, rule);
}

function applyNeighborhoodReaction(x, y, matId) {
  const dirs = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
  ];
  for (const [dx, dy] of dirs) {
    const nx = x + dx;
    const ny = y + dy;
    if (!inBounds(nx, ny)) continue;
    const neighborId = grid[indexOf(nx, ny)];
    if (neighborId === ID.empty) continue;
    const aKey = MATERIALS[matId].key;
    const bKey = MATERIALS[neighborId].key;
    const rule = ruleIndex.get(`${aKey}|${bKey}`);
    if (!rule || Math.random() > rule.chance) continue;
    if (rule.apply({ x, y, nx, ny, matId, neighborId, aKey, bKey })) {
      return true;
    }
  }
  return false;
}

function tryMovePowder(x, y, matId) {
  const downY = y + 1;
  if (downY >= GRID_HEIGHT) return;
  const belowId = grid[indexOf(x, downY)];
  if (canDisplace(matId, belowId)) {
    swapCells(x, y, x, downY);
    return;
  }

  const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
  for (const dx of dirs) {
    const nx = x + dx;
    if (!inBounds(nx, downY)) continue;
    const targetId = grid[indexOf(nx, downY)];
    if (canDisplace(matId, targetId)) {
      swapCells(x, y, nx, downY);
      return;
    }
  }
}

function tryMoveLiquid(x, y, matId) {
  const downY = y + 1;
  if (downY < GRID_HEIGHT) {
    const belowId = grid[indexOf(x, downY)];
    if (canDisplace(matId, belowId)) {
      swapCells(x, y, x, downY);
      return;
    }
  }

  const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
  for (const dx of dirs) {
    const nx = x + dx;
    if (!inBounds(nx, y)) continue;
    const sideId = grid[indexOf(nx, y)];
    if (canDisplace(matId, sideId)) {
      swapCells(x, y, nx, y);
      return;
    }
  }

  for (const dx of dirs) {
    const nx = x + dx;
    if (!inBounds(nx, downY)) continue;
    const diagId = grid[indexOf(nx, downY)];
    if (canDisplace(matId, diagId)) {
      swapCells(x, y, nx, downY);
      return;
    }
  }
}

function tryMoveGas(x, y, matId) {
  const upY = y - 1;
  if (upY >= 0) {
    const aboveId = grid[indexOf(x, upY)];
    if (canDisplace(matId, aboveId)) {
      swapCells(x, y, x, upY);
      return;
    }
  }

  const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
  for (const dx of dirs) {
    const nx = x + dx;
    if (!inBounds(nx, y)) continue;
    const sideId = grid[indexOf(nx, y)];
    if (canDisplace(matId, sideId)) {
      swapCells(x, y, nx, y);
      return;
    }
  }
}

function igniteNeighbor(x, y) {
  if (!inBounds(x, y)) return;
  const i = indexOf(x, y);
  const matId = grid[i];
  if (matId === ID.empty) return;
  const mat = MATERIALS[matId];
  if (mat.flammability > 0 && Math.random() < mat.flammability * 0.16) {
    setCell(x, y, ID.fire, 20);
  }
}

function thermalPhaseChanges(i, x, y, matId) {
  const t = tempGrid[i];
  if (matId === ID.water && t < -3) setCell(x, y, ID.ice);
  else if (matId === ID.water && t > 110) setCell(x, y, ID.steam);
  else if (matId === ID.ice && t > 5) setCell(x, y, ID.water);
  else if (matId === ID.steam && t < 85 && Math.random() < 0.02) setCell(x, y, ID.water);
}

function conductHeat(x, y, matId) {
  const i = indexOf(x, y);
  const cond = MATERIALS[matId].conductivity;
  if (cond <= 0) return;
  let sum = tempGrid[i];
  let count = 1;
  const dirs = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
  ];
  for (const [dx, dy] of dirs) {
    const nx = x + dx;
    const ny = y + dy;
    if (!inBounds(nx, ny)) continue;
    sum += tempGrid[indexOf(nx, ny)];
    count += 1;
  }
  const avg = sum / count;
  tempGrid[i] += (avg - tempGrid[i]) * cond * 0.18;
}

function updateEnergy(x, y, matId) {
  const i = indexOf(x, y);
  if (matId === ID.fire) {
    lifeGrid[i] -= 1;
    tempGrid[i] = 480;
    const dirs = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0]
    ];
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      igniteNeighbor(nx, ny);
      if (inBounds(nx, ny)) {
        const ni = indexOf(nx, ny);
        tempGrid[ni] += 14;
      }
    }
    if (lifeGrid[i] <= 0) setCell(x, y, Math.random() < 0.65 ? ID.smoke : ID.empty);
  } else if (matId === ID.spark) {
    lifeGrid[i] -= 1;
    if (Math.random() < 0.35) {
      const nx = x + (Math.random() < 0.5 ? -1 : 1);
      const ny = y + (Math.random() < 0.5 ? -1 : 1);
      if (inBounds(nx, ny) && grid[indexOf(nx, ny)] === ID.empty) setCell(nx, ny, ID.fire, 12);
    }
    if (lifeGrid[i] <= 0) setCell(x, y, ID.empty);
  } else if (matId === ID.electricity) {
    lifeGrid[i] -= 1;
    const neighbors = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0]
    ];
    for (const [dx, dy] of neighbors) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      const ni = indexOf(nx, ny);
      const target = MATERIALS[grid[ni]];
      if (target.conductivity > 0.35 && Math.random() < 0.28) setCell(nx, ny, ID.electricity, 4);
    }
    if (lifeGrid[i] <= 0) setCell(x, y, ID.spark, 2);
  } else if (matId === ID.explosion) {
    lifeGrid[i] -= 1;
    const radius = 2;
    for (let oy = -radius; oy <= radius; oy++) {
      for (let ox = -radius; ox <= radius; ox++) {
        const nx = x + ox;
        const ny = y + oy;
        if (!inBounds(nx, ny)) continue;
        const dist = Math.abs(ox) + Math.abs(oy);
        if (dist > radius) continue;
        const ni = indexOf(nx, ny);
        tempGrid[ni] += 65;
        if (Math.random() < 0.24) setCell(nx, ny, ID.fire, 12);
      }
    }
    if (lifeGrid[i] <= 0) setCell(x, y, ID.smoke);
  }
}

function updateCell(x, y) {
  const i = indexOf(x, y);
  if (updated[i]) return;
  updated[i] = 1;

  const matId = grid[i];
  if (matId === ID.empty) return;

  applyNeighborhoodReaction(x, y, matId);
  const currentId = grid[i];
  const mat = MATERIALS[currentId];

  conductHeat(x, y, currentId);
  thermalPhaseChanges(i, x, y, currentId);

  if (mat.behavior === "powder") tryMovePowder(x, y, currentId);
  else if (mat.behavior === "liquid") tryMoveLiquid(x, y, currentId);
  else if (mat.behavior === "gas") tryMoveGas(x, y, currentId);
  else if (mat.category === "energy") updateEnergy(x, y, currentId);

  if (currentId === ID.lava) {
    tempGrid[i] = 620;
    if (Math.random() < 0.035) {
      const nx = x + (Math.random() < 0.5 ? -1 : 1);
      const ny = y - 1;
      if (inBounds(nx, ny) && grid[indexOf(nx, ny)] === ID.empty) setCell(nx, ny, ID.fire, 10);
    }
  }

  if (currentId === ID.alcohol && Math.random() < 0.008) {
    const nx = x + (Math.random() < 0.5 ? -1 : 1);
    if (inBounds(nx, y) && grid[indexOf(nx, y)] === ID.fire) setCell(x, y, ID.fire, 20);
  }

  if (currentId === ID.smoke && Math.random() < 0.004) setCell(x, y, ID.empty);
  if (currentId === ID.toxic_gas && Math.random() < 0.006) setCell(x, y, ID.smoke);
}

function simulationStep() {
  updated.fill(0);
  const leftToRight = Math.random() < 0.5;
  for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
    if (leftToRight) {
      for (let x = 0; x < GRID_WIDTH; x++) updateCell(x, y);
    } else {
      for (let x = GRID_WIDTH - 1; x >= 0; x--) updateCell(x, y);
    }
  }
}

function drawDirtyCells(forceFull = false) {
  if (forceFull) {
    dirty.clear();
    for (let i = 0; i < TOTAL; i++) dirty.add(i);
  }
  for (const i of dirty) {
    const matId = grid[i];
    const x = i % GRID_WIDTH;
    const y = (i / GRID_WIDTH) | 0;
    ctx.fillStyle = MATERIALS[matId].color;
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
  dirty.clear();
}

function paintAtClientPos(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((clientY - rect.top) / CELL_SIZE);
  if (!inBounds(x, y)) return;

  const target = mode === "draw" ? selectedMaterial : ID.empty;
  for (let oy = -brushSize; oy <= brushSize; oy++) {
    for (let ox = -brushSize; ox <= brushSize; ox++) {
      if (ox * ox + oy * oy > brushSize * brushSize) continue;
      setCell(x + ox, y + oy, target);
    }
  }
}

function setupUI() {
  MATERIALS.filter((m) => m.key !== "empty").forEach((m) => {
    const option = document.createElement("option");
    option.value = String(m.id);
    option.textContent = `${m.name} (${m.category})`;
    materialSelect.appendChild(option);
  });
  materialSelect.value = String(selectedMaterial);

  materialSelect.addEventListener("change", (e) => {
    selectedMaterial = Number(e.target.value);
  });

  brushSizeInput.addEventListener("input", (e) => {
    brushSize = Number(e.target.value);
    brushSizeValue.textContent = String(brushSize);
  });

  speedRange.addEventListener("input", (e) => {
    simSpeed = Number(e.target.value);
    speedValue.textContent = `${simSpeed}x`;
  });

  drawModeBtn.addEventListener("click", () => {
    mode = "draw";
    drawModeBtn.classList.add("active");
    eraseModeBtn.classList.remove("active");
  });

  eraseModeBtn.addEventListener("click", () => {
    mode = "erase";
    eraseModeBtn.classList.add("active");
    drawModeBtn.classList.remove("active");
  });

  pauseBtn.addEventListener("click", () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "재개" : "일시정지";
  });

  clearBtn.addEventListener("click", () => {
    grid.fill(ID.empty);
    tempGrid.fill(MATERIALS[ID.empty].defaultTemp);
    lifeGrid.fill(0);
    drawDirtyCells(true);
  });

  const beginPaint = (x, y) => {
    painting = true;
    paintAtClientPos(x, y);
  };

  canvas.addEventListener("mousedown", (e) => beginPaint(e.clientX, e.clientY));
  window.addEventListener("mousemove", (e) => {
    if (painting) paintAtClientPos(e.clientX, e.clientY);
  });
  window.addEventListener("mouseup", () => {
    painting = false;
  });

  canvas.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    if (!t) return;
    e.preventDefault();
    beginPaint(t.clientX, t.clientY);
  }, { passive: false });

  canvas.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (!t) return;
    e.preventDefault();
    paintAtClientPos(t.clientX, t.clientY);
  }, { passive: false });

  window.addEventListener("touchend", () => {
    painting = false;
  });

  interactionsBtn.addEventListener("click", () => {
    interactionsModal.classList.remove("hidden");
    interactionsModal.setAttribute("aria-hidden", "false");
  });

  closeModalBtn.addEventListener("click", () => {
    interactionsModal.classList.add("hidden");
    interactionsModal.setAttribute("aria-hidden", "true");
  });

  interactionsModal.addEventListener("click", (e) => {
    if (e.target === interactionsModal) {
      interactionsModal.classList.add("hidden");
      interactionsModal.setAttribute("aria-hidden", "true");
    }
  });
}

function renderInteractionsPanel() {
  materialsTableBody.innerHTML = "";
  MATERIALS.filter((m) => m.key !== "empty").forEach((m) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="swatch" style="background:${m.color}"></span>${m.name}</td>
      <td>${m.category}</td>
      <td>${m.density}</td>
      <td>${m.behavior}</td>
      <td>flammability: ${m.flammability.toFixed(2)}, conductivity: ${m.conductivity.toFixed(2)}</td>
    `;
    materialsTableBody.appendChild(tr);
  });

  rulesTableBody.innerHTML = "";
  REACTION_RULES.forEach((rule) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${rule.id}</td><td>${rule.trigger.join(" + ")}</td><td>${rule.result} (${rule.description})</td>`;
    rulesTableBody.appendChild(tr);
  });

  materialCards.innerHTML = "";
  MATERIALS.filter((m) => m.key !== "empty").forEach((m) => {
    const relatedRules = REACTION_RULES.filter((r) => r.trigger.includes(m.key));
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h4><span class="swatch" style="background:${m.color}"></span>${m.name}</h4>
      <p>${m.description}</p>
      <ul>
        ${relatedRules.map((r) => `<li><strong>${r.trigger.join(" + ")}</strong> → ${r.result}</li>`).join("") || "<li>주요 반응 없음</li>"}
      </ul>
    `;
    materialCards.appendChild(card);
  });
}

function seedDemo() {
  for (let x = 20; x < 180; x++) setCell(x, 130, ID.stone);
  for (let x = 40; x < 160; x++) setCell(x, 80, ID.sand);
  for (let x = 55; x < 145; x++) setCell(x, 30, ID.water);
}

let lastTime = performance.now();
let fpsCounterTime = performance.now();
let frames = 0;

function loop(now) {
  const dt = now - lastTime;
  lastTime = now;

  if (!paused) {
    for (let i = 0; i < simSpeed; i++) simulationStep();
  }
  drawDirtyCells(false);

  frames += 1;
  if (now - fpsCounterTime >= 500) {
    const fps = Math.round((frames * 1000) / (now - fpsCounterTime));
    fpsLabel.textContent = String(fps);
    frames = 0;
    fpsCounterTime = now;
  }

  requestAnimationFrame(loop);
}

function init() {
  tempGrid.fill(20);
  setupUI();
  renderInteractionsPanel();
  seedDemo();
  drawDirtyCells(true);
  requestAnimationFrame(loop);
}

init();
