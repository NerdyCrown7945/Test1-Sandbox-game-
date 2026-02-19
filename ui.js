import { MATERIALS } from './materials.js';
import { CLIMATE_EVENTS } from './climate.js';
import { TERRAIN_INTERACTION_RULES } from './interactions.js';

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

  renderClimateEvents();
  renderInteractionRules();

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

  root.querySelectorAll('[data-material]').forEach((btn, index) => {
    if (index === 0) btn.classList.add('selected');
    btn.addEventListener('click', () => {
      root.querySelectorAll('.palette-item').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      engine.selectedMaterial = btn.dataset.material;
    });
  });
}

function renderClimateEvents() {
  const ce = document.getElementById('climateEvents');
  if (!ce) return;

  ce.innerHTML = CLIMATE_EVENTS
    .map((event) => `<li><strong>${event.name}</strong>: ${event.impact}</li>`)
    .join('');
}

function renderInteractionRules() {
  const interactionRoot = document.getElementById('interactionRules');
  if (!interactionRoot) return;

  interactionRoot.innerHTML = TERRAIN_INTERACTION_RULES
    .map((rule) => `<li><strong>${rule.id}</strong>: ${rule.summary}</li>`)
    .join('');
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

  const perf = document.getElementById('performanceMode');
  if (perf) perf.addEventListener('change', (e) => {
    engine.performanceMode = e.target.value;
  });
}

export function updateDebugBar(engine, fps) {
  const fpsEl = document.getElementById('fps');
  const countEl = document.getElementById('cellStats');
  const nutritionEl = document.getElementById('soilNutrition');
  const evoEl = document.getElementById('evoStatus');

  if (fpsEl) fpsEl.textContent = fps.toFixed(0);
  if (countEl) countEl.textContent = String(engine.world.terrain.length);
  if (nutritionEl) nutritionEl.textContent = engine.world.soilNutrition.toFixed(2);
  if (evoEl) evoEl.textContent = 'N/A';
}
