export const EVOLUTION_TREE = {
  microbe: { next: 'primitive_organism', requirements: { adaptationScore: 0.5, avgSurvival: 25, minPopulation: 8, generations: 3 } },
  primitive_organism: { next: 'predator_class', requirements: { adaptationScore: 0.62, avgSurvival: 35, minPopulation: 10, generations: 4 } },
  predator_class: { next: 'apex_predator', requirements: { adaptationScore: 0.74, avgSurvival: 45, minPopulation: 6, generations: 5 } }
};

export function evaluateEvolution(populationStats, history) {
  const transitions = [];
  for (const [stage, node] of Object.entries(EVOLUTION_TREE)) {
    const stats = populationStats[stage];
    if (!stats) continue;
    const req = node.requirements;
    const sustained = (history[stage] || 0) >= req.generations;
    const pass = stats.adaptationScore >= req.adaptationScore
      && stats.avgSurvival >= req.avgSurvival
      && stats.population >= req.minPopulation
      && sustained;

    if (pass) {
      transitions.push({ from: stage, to: node.next, reason: `조건 충족(${req.generations}세대 유지)` });
    }
  }
  return transitions;
}

export function collectPopulationStats(entities, climate) {
  const groups = {};
  for (const e of entities) {
    const key = classifyStage(e.species);
    if (!groups[key]) groups[key] = { population: 0, survival: 0, adapt: 0 };
    groups[key].population += 1;
    groups[key].survival += e.age;
    const tempFit = 1 - Math.min(1, Math.abs(climate.globalTemperature - e.dna.temperatureTolerance) / 60);
    const toxinPenalty = climate.toxicityLevel * (1 - e.dna.intelligence / 120);
    groups[key].adapt += Math.max(0, tempFit - toxinPenalty);
  }

  const result = {};
  for (const [k, v] of Object.entries(groups)) {
    result[k] = {
      population: v.population,
      avgSurvival: v.population ? v.survival / v.population : 0,
      adaptationScore: v.population ? v.adapt / v.population : 0
    };
  }
  return result;
}

function classifyStage(species) {
  if (['microbe', 'algae', 'plankton'].includes(species)) return 'microbe';
  if (['grazer_mite', 'burrower', 'snailoid', 'crawler', 'river_turtle'].includes(species)) return 'primitive_organism';
  if (['pack_hunter', 'ambush_stalker', 'apex_predator'].includes(species)) return 'predator_class';
  return 'primitive_organism';
}
