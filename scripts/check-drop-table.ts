// Guards the odds the game actually ships with. Run: npm run check
import assert from "node:assert/strict";
import { ITEMS, PRIZE_INSTANCES, RARITY_COLOR, itemById } from "../app/lib/items.ts";

const ids = new Set(ITEMS.map((i) => i.id));
for (const p of PRIZE_INSTANCES) assert.ok(ids.has(p.itemId), `unknown spawn item: ${p.itemId}`);
for (const i of ITEMS) {
  assert.ok(i.grip > 0 && i.grip <= 1, `${i.id} grip out of range: ${i.grip}`);
  assert.ok(RARITY_COLOR[i.rarity], `${i.id} has no colour for rarity ${i.rarity}`);
}

// Chance of walking away with each item, given the claw reaches a box at random:
// how many are in the pit, times how well the claw holds that box.
const weight = new Map<string, number>();
for (const p of PRIZE_INSTANCES) {
  const { grip } = itemById(p.itemId);
  weight.set(p.itemId, (weight.get(p.itemId) ?? 0) + grip);
}
const total = [...weight.values()].reduce((a, b) => a + b, 0);
const odds = (id: string) => (weight.get(id) ?? 0) / total;

const caps = odds("whitecap") + odds("blackcap");
const sipper = odds("sipper");
const hoodies = odds("whitehoodie") + odds("neonhoodie");
const bomber = odds("bomber");

assert.ok(caps > sipper, `caps (${caps}) must beat sipper (${sipper})`);
assert.ok(sipper > hoodies, `sipper (${sipper}) must beat hoodies (${hoodies})`);
assert.ok(hoodies > bomber, `hoodies (${hoodies}) must beat bomber (${bomber})`);
assert.ok(caps > 0.5, `caps should dominate, got ${caps}`);
assert.ok(bomber < 0.02, `bomber should be very rare, got ${bomber}`);

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
console.log(`caps ${pct(caps)} · sipper ${pct(sipper)} · hoodies ${pct(hoodies)} · bomber ${pct(bomber)}`);
console.log("drop table OK");
