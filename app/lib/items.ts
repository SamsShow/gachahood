export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export interface ItemDef {
  id: string;
  name: string;
  rarity: Rarity;
  /** gift-box body colour */
  color: string;
  /** lid, ribbon and knot colour */
  trim: string;
  /** chance the claw keeps hold of this box all the way to the chute (0-1) */
  grip: number;
  /** product photo shown in the landing gallery */
  image: string;
  metal?: boolean;
}

// Readable on the bone UI — the box colours below are tuned for the dark pit instead.
export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#6B6559",
  uncommon: "#0B7A2E",
  rare: "#1D5FA8",
  legendary: "#A25C00",
};

// Six merch drops, one gift-box style each. Bodies are deliberately spread across the
// value range so a pile of them stays readable at claw-machine distance.
//
// Odds come from two honest levers rather than a hidden roll: how many of each box sit
// in the pit, and how well the claw grips it. You always win the box you actually pull.
export const ITEMS: ItemDef[] = [
  { id: "whitecap", name: "White Cap", rarity: "common", color: "#F2EFE9", trim: "#00C805", grip: 0.9, image: "/merch/whitecap.jpg" },
  { id: "blackcap", name: "Black Cap", rarity: "common", color: "#23272A", trim: "#F2EFE9", grip: 0.9, image: "/merch/blackcap.jpg" },
  { id: "sipper", name: "Metal Sipper", rarity: "uncommon", color: "#A9B0B6", trim: "#00C805", grip: 0.6, metal: true, image: "/merch/sipper.jpg" },
  { id: "whitehoodie", name: "White Hoodie", rarity: "rare", color: "#D9BE8A", trim: "#1A1D1B", grip: 0.3, image: "/merch/whitehoodie.jpg" },
  { id: "neonhoodie", name: "Neon Hoodie", rarity: "rare", color: "#0B5F2E", trim: "#F2EFE9", grip: 0.3, image: "/merch/neonhoodie.jpg" },
  { id: "bomber", name: "Bomber Jacket", rarity: "legendary", color: "#F0C24A", trim: "#1A1D1B", grip: 0.12, image: "/merch/bomber.jpg" },
];

export const itemById = (id: string) => ITEMS.find((i) => i.id === id)!;

/** Flat swatch of an item's gift box: body colour with its ribbon crossed over it. */
export const boxSwatch = (item: ItemDef) => ({
  backgroundColor: item.color,
  backgroundImage: `linear-gradient(${item.trim}, ${item.trim}), linear-gradient(${item.trim}, ${item.trim})`,
  backgroundSize: "22% 100%, 100% 22%",
  backgroundPosition: "center, center",
  backgroundRepeat: "no-repeat" as const,
});

// How many of each box sits in the pit — the first half of the odds.
export const PRIZE_INSTANCES: { key: number; itemId: string; pos: [number, number, number] }[] = [
  { key: 0, itemId: "whitecap", pos: [0.17, 0.5, 0.0] },
  { key: 1, itemId: "whitecap", pos: [-0.22, 1.0, 0.2] },
  { key: 2, itemId: "blackcap", pos: [0.03, 1.5, -0.39] },
  { key: 3, itemId: "sipper", pos: [0.28, 0.5, 0.36] },
  { key: 4, itemId: "whitehoodie", pos: [-0.51, 1.0, -0.09] },
  { key: 5, itemId: "whitecap", pos: [0.49, 1.5, -0.31] },
  { key: 6, itemId: "whitecap", pos: [-0.16, 0.5, 0.6] },
  { key: 7, itemId: "blackcap", pos: [-0.31, 1.0, -0.6] },
  { key: 8, itemId: "sipper", pos: [0.67, 1.5, 0.25] },
  { key: 9, itemId: "neonhoodie", pos: [-0.7, 0.5, 0.29] },
  { key: 10, itemId: "whitecap", pos: [0.34, 1.0, -0.72] },
  { key: 11, itemId: "whitecap", pos: [0.25, 1.5, 0.79] },
  { key: 12, itemId: "blackcap", pos: [-0.75, 0.5, -0.44] },
  { key: 13, itemId: "sipper", pos: [0.88, 1.0, -0.19] },
  { key: 14, itemId: "neonhoodie", pos: [-0.12, 1.5, -0.96] },
  { key: 15, itemId: "whitecap", pos: [0.76, 0.5, 0.64] },
  { key: 16, itemId: "blackcap", pos: [-1.03, 1.0, 0.04] },
  { key: 17, itemId: "blackcap", pos: [0.75, 1.5, -0.75] },
  { key: 18, itemId: "sipper", pos: [-0.05, 0.5, 1.08] },
  { key: 19, itemId: "bomber", pos: [-0.71, 1.0, -0.85] },
  { key: 20, itemId: "whitecap", pos: [1.13, 1.5, 0.15] },
  { key: 21, itemId: "blackcap", pos: [0.26, 0.5, -1.16] },
  { key: 22, itemId: "blackcap", pos: [0.6, 1.0, 1.06] },
  { key: 23, itemId: "sipper", pos: [-1.18, 1.5, -0.38] },
  { key: 24, itemId: "whitecap", pos: [1.15, 0.5, -0.53] },
  { key: 25, itemId: "blackcap", pos: [-0.5, 1.0, 1.19] },
  { key: 26, itemId: "sipper", pos: [-0.44, 1.5, -1.23] },
  { key: 27, itemId: "whitehoodie", pos: [1.18, 0.5, 0.62] },
];
