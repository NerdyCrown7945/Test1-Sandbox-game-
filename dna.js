const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const DIET_TYPES = ['herbivore', 'omnivore', 'carnivore', 'detritivore', 'parasite', 'symbiote'];

export function createRandomDNA() {
  return {
    speed: Math.random() * 100,
    aggression: Math.random() * 100,
    intelligence: Math.random() * 100,
    reproductionRate: Math.random() * 100,
    lifespan: 20 + Math.random() * 80,
    mutationRate: 0.02 + Math.random() * 0.2,
    dietPreference: DIET_TYPES[Math.floor(Math.random() * DIET_TYPES.length)],
    temperatureTolerance: -10 + Math.random() * 70,
    waterDependency: Math.random() * 100
  };
}

export function breedDNA(a, b) {
  const mutationRate = (a.mutationRate + b.mutationRate) / 2;
  const mix = {
    speed: (a.speed + b.speed) / 2,
    aggression: (a.aggression + b.aggression) / 2,
    intelligence: (a.intelligence + b.intelligence) / 2,
    reproductionRate: (a.reproductionRate + b.reproductionRate) / 2,
    lifespan: (a.lifespan + b.lifespan) / 2,
    mutationRate,
    dietPreference: Math.random() > 0.5 ? a.dietPreference : b.dietPreference,
    temperatureTolerance: (a.temperatureTolerance + b.temperatureTolerance) / 2,
    waterDependency: (a.waterDependency + b.waterDependency) / 2
  };

  const mutateGene = (value, range = 12) => {
    if (Math.random() > mutationRate) return value;
    return value + (Math.random() * 2 - 1) * range;
  };

  return {
    speed: clamp(mutateGene(mix.speed), 0, 100),
    aggression: clamp(mutateGene(mix.aggression), 0, 100),
    intelligence: clamp(mutateGene(mix.intelligence), 0, 100),
    reproductionRate: clamp(mutateGene(mix.reproductionRate), 0, 100),
    lifespan: clamp(mutateGene(mix.lifespan, 18), 10, 100),
    mutationRate: clamp(mutateGene(mix.mutationRate, 0.05), 0, 1),
    dietPreference: Math.random() < mutationRate ? DIET_TYPES[Math.floor(Math.random() * DIET_TYPES.length)] : mix.dietPreference,
    temperatureTolerance: clamp(mutateGene(mix.temperatureTolerance, 8), -20, 80),
    waterDependency: clamp(mutateGene(mix.waterDependency), 0, 100)
  };
}

export function dnaToColor(dna) {
  const r = Math.floor((dna.aggression / 100) * 255);
  const g = Math.floor((dna.intelligence / 100) * 255);
  const b = Math.floor((dna.reproductionRate / 100) * 255);
  return `rgb(${r},${g},${b})`;
}
