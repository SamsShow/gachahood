import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RapierRigidBody } from "@react-three/rapier";
import type { ItemDef } from "./items";

export type Phase =
  | "idle"
  | "aiming"
  | "dropping"
  | "grabbing"
  | "lifting"
  | "carrying"
  | "releasing"
  | "result";

interface GameState {
  phase: Phase;
  coins: number;
  inventory: string[];
  wonItem: ItemDef | null;
  message: string | null;
  insertCoin: () => void;
  drop: () => void;
  setPhase: (p: Phase) => void;
  win: (item: ItemDef) => void;
  miss: (message?: string) => void;
  dismissResult: () => void;
  refill: () => void;
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      phase: "idle",
      coins: 5,
      inventory: [],
      wonItem: null,
      message: null,
      insertCoin: () => {
        const { phase, coins } = get();
        if (phase !== "idle" || coins < 1) return;
        set({ coins: coins - 1, phase: "aiming", message: null });
      },
      drop: () => {
        if (get().phase === "aiming") set({ phase: "dropping" });
      },
      setPhase: (phase) => set({ phase }),
      win: (item) =>
        set((s) => ({ phase: "result", wonItem: item, inventory: [...s.inventory, item.id] })),
      miss: (message = "The claw came up empty. Try again!") =>
        set({ phase: "idle", message }),
      dismissResult: () => set({ phase: "idle", wonItem: null }),
      refill: () => set({ coins: 5, message: null }),
    }),
    {
      name: "gatchahood",
      partialize: (s) => ({ inventory: s.inventory }),
      skipHydration: true,
    }
  )
);

// Transient per-frame state, mutated outside React to avoid re-renders.
export const input = { left: false, right: false, fwd: false, back: false };
export const prizeBodies = new Map<number, RapierRigidBody>();

// Shared machine geometry.
export const CHUTE = { x: -1.25, z: 1.25 };
