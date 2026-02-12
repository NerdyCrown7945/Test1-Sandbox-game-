import { MATERIALS } from './materials.js';
import { LIFEFORM_SPECIES } from './lifeforms.js';
import { CLIMATE_EVENTS } from './climate.js';

function grouped(items) {
  return items.reduce((acc, item) => {
    const key = item.category || 'etc';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function initUI(engine) {
  const tabButtons = [...document.querySelectorAll('[data-tab]')];
  const tabPanels = [...document.querySelectorAll('.tab-panel')];

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.toggle('active', b === btn));
      tabPanels.forEach((panel) => panel.classList.toggle('active', panel.id === btn.dataset.tab));
    });
  });

  const matRoot = document.getElementById('materialsPalette');
  if (matRoot) renderMaterialPalette(matRoot, engine);

  const lifeRoot = document.getElementById('lifePalette');
  if (lifeRoot) renderLifePalette(lifeRoot, engine);

  hookEnvControls(engine);
  hookToggles(engine);
}

function renderMaterialPalette(root, engine) {
  const groups = grouped(MATERIALS);

  root.innerHTML = Object.entries(groups).map(([cat, mats]) => `
    <section class="palette-group">
      <h4>${cat}</h4>
      ${mats.map((mat) => `
        <button class="palette-item" data-material="${mat.id}">
          <span class="swatch" style="background:${mat.color}"></span>
          <span class="icon">${mat.icon ?? ''}</span>
          <span>${mat.name}</span>
        </button>`).join('')}
    </section>
  `).join('');

  root.querySelectorAll('[data-material]').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.palette-item').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      engine.selectedMaterial = btn.dataset.material;
    });
  });
}

function renderLifePalette(root, engine) {
  root.innerHTML = LIFEFORM_SPECIES.map((species, idx) => `
    <button class="palette-item" data-species="${species}">
      <span class="swatch" style="background:hsl(${(idx * 37) % 360}deg 75% 55%)"></span>
      <span class="icon">🧬</span>
      <span>${species}</span>
    </button>
  `).join('');

  root.querySelectorAll('[data-species]').forEach((btn) => {
    btn.addEventListener('click', () => {
      // 엔진에 spawnSpecies가 없을 수도 있으므로 방어
      if (typeof engine.spawnSpecies === 'function') {
        engine.spawnSpecies(btn.dataset.species);
      } else if (engine.world && typeof engine.world.spawnSpecies === 'function') {
        engine.world.spawnSpecies(btn.dataset.species);
      } else {
        console.warn('spawnSpecies()가 엔진에 없습니다. engine.spawnSpecies 또는 engine.world.spawnSpecies를 구현하세요.');
      }
    });
  });

  const ce = document.getElementById('climateEvents');
  if (ce) {
    ce.innerHTML = CLIMATE_EVENTS
      .map((event) => `<li><strong>${event.name}</strong>: ${event.impact}</li>`)
      .join('');
  }
}

function hookEnvControls(engine) {
  const map = [
    ['seasonSelect', 'season'],
    ['tempRange', 'globalTemperature'],
    ['rainRange', 'rainfall'],
    ['speedRange', 'simSpeed']
  ];

  map.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('input', () => {
      const val = id === 'seasonSelect' ? el.value : Number(el.value);
      if (key === 'simSpeed') engine[key] = val;
      else engine.world.climate[key] = val;
    });
  });
}

function hookToggles(engine) {
  const dbg = document.getElementById('toggleDebug');
  if (dbg) dbg.addEventListener('click', () => {
    engine.debug = !engine.debug;
  });

  const rl = document.getElementById('toggleRL');
  if (rl) rl.addEventListener('click', () => {
    engine.world.rlEnabled = !engine.world.rlEnabled;
  });

  const perf = document.getElementById('performanceMode');
  if (perf) perf.addEventListener('change', (e) => {
    engine.performanceMode = e.target.value;
    engine.world.maxEntities = e.target.value === 'performance' ? 350 : 700;
  });
}

export function updateDebugBar(engine, fps, evolutionText) {
  const fpsEl = document.getElementById('fps');
  const countEl = document.getElementById('entityCount');
  const avgEl = document.getElementById('avgGene');
  const evoEl = document.getElementById('evoStatus');

  const avgGene = engine.world.entities.reduce((acc, e) => acc + e.dna.intelligence, 0) / Math.max(1, engine.world.entities.length);

  if (fpsEl) fpsEl.textContent = fps.toFixed(0);
  if (countEl) countEl.textContent = String(engine.world.entities.length);
  if (avgEl) avgEl.textContent = avgGene.toFixed(1);
  if (evoEl) evoEl.textContent = evolutionText;
}
