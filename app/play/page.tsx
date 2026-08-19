"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Scene from "../components/Scene";
import { useGame, input } from "../lib/store";
import { ITEMS, RARITY_COLOR, boxSwatch } from "../lib/items";
import ConnectButton from "../components/ConnectButton";
import { useWallet, shortAddress } from "../lib/wallet";

const STATUS: Partial<Record<string, string>> = {
  dropping: "Dropping",
  grabbing: "Grabbing",
  lifting: "Lifting",
  carrying: "To the chute",
  releasing: "Releasing",
};

const CARD =
  "rounded-2xl border border-rh-line bg-white/85 shadow-[0_1px_2px_rgba(26,29,27,0.05),0_8px_24px_-12px_rgba(26,29,27,0.25)] backdrop-blur-md";

function HoldBtn({ k, label }: { k: keyof typeof input; label: string }) {
  const set = (v: boolean) => () => {
    input[k] = v;
  };
  return (
    <button
      aria-label={k}
      className={`${CARD} h-12 w-12 touch-none text-base text-rh-ink transition active:border-rh-green active:bg-rh-green`}
      onPointerDown={set(true)}
      onPointerUp={set(false)}
      onPointerLeave={set(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
}

export default function Home() {
  const phase = useGame((s) => s.phase);
  const coins = useGame((s) => s.coins);
  const inventory = useGame((s) => s.inventory);
  const wonItem = useGame((s) => s.wonItem);
  const message = useGame((s) => s.message);
  const { insertCoin, drop, dismissResult, refill } = useGame.getState();
  const [showCollection, setShowCollection] = useState(false);
  const address = useWallet((w) => w.address);

  useEffect(() => {
    useGame.persist.rehydrate();
  }, []);

  const counts: Record<string, number> = {};
  for (const id of inventory) counts[id] = (counts[id] ?? 0) + 1;

  return (
    <main className="relative h-dvh w-full select-none overflow-hidden bg-rh-wall text-rh-ink">
      <Scene />

      {/* soft vignette to settle the render into the page */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_95%_at_50%_8%,transparent_45%,rgba(26,29,27,0.12)_100%)]" />

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
        <Link
          href="/"
          className={`${CARD} px-4 py-2 text-sm text-rh-muted transition hover:text-rh-ink`}
        >
          ← Arcade
        </Link>
        <div className="flex items-center gap-2">
          <span className={`${CARD} flex items-center gap-2 px-4 py-2 text-sm font-medium tabular-nums`}>
            <span className="h-2 w-2 rounded-full bg-rh-green" />
            {coins}
          </span>
          <button
            onClick={refill}
            className={`${CARD} px-4 py-2 text-sm text-rh-muted transition hover:text-rh-ink`}
          >
            Refill
          </button>
          <button
            onClick={() => setShowCollection((v) => !v)}
            className={`${CARD} px-4 py-2 text-sm text-rh-muted transition hover:text-rh-ink`}
          >
            Collection · {inventory.length}
          </button>
          {address && (
            <span className={`${CARD} px-4 py-2 font-mono text-sm text-rh-muted`}>
              {shortAddress(address)}
            </span>
          )}
        </div>
      </div>

      {message && phase === "idle" && (
        <p className="absolute inset-x-0 top-24 text-center text-sm text-rh-muted">{message}</p>
      )}

      {/* bottom controls — kept to the edges so the cabinet stays unobstructed */}
      {phase === "idle" && !address && (
        <div className="absolute inset-x-0 bottom-7 flex justify-center">
          <ConnectButton
            label="Connect wallet to play"
            hint="A wallet is needed to claim what you pull."
            className="rounded-full bg-rh-ink px-9 py-4 font-display text-base font-bold tracking-tight text-white shadow-[0_10px_30px_-12px_rgba(26,29,27,0.7)] transition hover:brightness-125 disabled:opacity-50"
          />
        </div>
      )}

      {phase === "idle" && address && (
        <div className="absolute inset-x-0 bottom-7 flex justify-center">
          <button
            onClick={insertCoin}
            disabled={coins < 1}
            className="rounded-full bg-rh-ink px-9 py-4 font-display text-base font-bold tracking-tight text-white shadow-[0_10px_30px_-12px_rgba(26,29,27,0.7)] transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
          >
            {coins < 1 ? "Out of coins" : "Insert coin"}
          </button>
        </div>
      )}

      {phase === "aiming" && (
        <>
          <div className="absolute bottom-7 left-7 grid grid-cols-3 gap-1.5">
            <div />
            <HoldBtn k="fwd" label="▲" />
            <div />
            <HoldBtn k="left" label="◀" />
            <div />
            <HoldBtn k="right" label="▶" />
            <div />
            <HoldBtn k="back" label="▼" />
            <div />
          </div>
          <button
            onClick={drop}
            className="absolute bottom-7 right-7 h-20 w-20 rounded-full bg-rh-green font-display text-sm font-bold tracking-wide text-rh-ink shadow-[0_12px_32px_-10px_rgba(0,200,5,0.85)] transition active:scale-95"
          >
            DROP
          </button>
          <p className="absolute inset-x-0 bottom-9 text-center text-xs text-rh-muted">
            arrows / WASD · space to drop
          </p>
        </>
      )}

      {STATUS[phase] && (
        <p className="absolute inset-x-0 bottom-9 text-center text-sm tracking-tight text-rh-muted">
          {STATUS[phase]}…
        </p>
      )}

      {showCollection && (
        <div className={`${CARD} absolute right-5 top-20 w-72 p-5`}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-rh-muted">
            Collection
          </h2>
          {ITEMS.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-1.5 text-sm">
              <span className="flex items-center gap-2.5">
                <span className="h-4 w-4 rounded-[3px] ring-1 ring-rh-line" style={boxSwatch(item)} />
                {item.name}
              </span>
              <span className="tabular-nums" style={{ color: RARITY_COLOR[item.rarity] }}>
                ×{counts[item.id] ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* result */}
      {phase === "result" && wonItem && (
        <div className="absolute inset-0 flex items-center justify-center bg-rh-ink/25 backdrop-blur-sm">
          <div className="flex w-80 flex-col items-center gap-3 rounded-2xl border border-rh-line bg-white p-8 text-center shadow-[0_24px_60px_-20px_rgba(26,29,27,0.45)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rh-muted">
              You looted
            </p>
            <span className="h-16 w-16 rounded-xl ring-1 ring-rh-line" style={boxSwatch(wonItem)} />
            <h2 className="font-display text-2xl font-bold tracking-tight">{wonItem.name}</h2>
            <p
              className="text-xs font-semibold uppercase tracking-[0.14em]"
              style={{ color: RARITY_COLOR[wonItem.rarity] }}
            >
              {wonItem.rarity}
            </p>
            <button
              onClick={dismissResult}
              className="mt-3 w-full rounded-full bg-rh-ink py-3 text-sm font-semibold text-white transition hover:brightness-125"
            >
              Collect
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
