export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  targetCrystals: number;
  startingPower: 'none' | 'dash' | 'glide' | 'both' | 'magnet' | 'all';
  timeOfDay: 'day' | 'sunset' | 'night';
  seed: number;
  hazardFactor: number;
  badge: string;
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Verdant Mirage",
    subtitle: "Sands of Beginnings",
    description: "An ancient sunlit path of soft golden sands. Learn to navigate the dunes and gather your first solar crystals.",
    targetCrystals: 5,
    startingPower: "none",
    timeOfDay: "day",
    seed: 101,
    hazardFactor: 0.4,
    badge: "Genesis Key"
  },
  {
    id: 2,
    name: "Solar Firestorm",
    subtitle: "The Red Canyons",
    description: "The sun sinks low, turning the desert crimson. Sandspikes protrude from basalt shards. You are bestowed with extreme Dash speeds.",
    targetCrystals: 8,
    startingPower: "dash",
    timeOfDay: "sunset",
    seed: 402,
    hazardFactor: 0.9,
    badge: "Ascent Flare"
  },
  {
    id: 3,
    name: "Midnight Sanctuary",
    subtitle: "Zephyr Valleys",
    description: "A cool celestial night under falling ashes. Step lightly on high cliffs, as Zephyr's Glide is unlocked to float across voids.",
    targetCrystals: 10,
    startingPower: "glide",
    timeOfDay: "night",
    seed: 703,
    hazardFactor: 1.2,
    badge: "Astral Crest"
  },
  {
    id: 4,
    name: "Vortex of the Lost",
    subtitle: "Eclipsed Ruins",
    description: "Deep ancient architecture where cyclones pull travelers. You start with magnetic pull to draw crystals closer.",
    targetCrystals: 15,
    startingPower: "magnet",
    timeOfDay: "sunset",
    seed: 914,
    hazardFactor: 1.6,
    badge: "Magnetic Sigil"
  },
  {
    id: 5,
    name: "Infinite Pathway",
    subtitle: "Cosmic Endless Domain",
    description: "An infinite test of speed. The world extends infinitely with extreme dangers. Unleash the ultimate power combo: Dash, Glide, and Magnetism!",
    targetCrystals: 999,
    startingPower: "all",
    timeOfDay: "night",
    seed: 1337,
    hazardFactor: 2.0,
    badge: "Cosmic Sigil"
  }
];
