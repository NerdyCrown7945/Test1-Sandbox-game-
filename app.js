import { SimulationEngine } from './engine.js';
import { initUI } from './ui.js';

const canvas = document.getElementById('sandboxCanvas');
const engine = new SimulationEngine(canvas);
initUI(engine);
engine.run();
