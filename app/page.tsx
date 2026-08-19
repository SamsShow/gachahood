"use client";

import Link from "next/link";
import Image from "next/image";
import BoxHero from "./components/BoxHero";
import { ITEMS, boxSwatch } from "./lib/items";
import ConnectButton from "./components/ConnectButton";
import { shortAddress, useWallet } from "./lib/wallet";

const CARD =
  "rounded-2xl border border-rh-line bg-white/85 shadow-[0_1px_2px_rgba(26,29,27,0.05),0_8px_24px_-12px_rgba(26,29,27,0.25)] backdrop-blur-md";

export default function Landing() {
  const address = useWallet((w) => w.address);
  const disconnect = useWallet((w) => w.disconnect);

  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-rh-wall text-rh-ink">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-5">
        <span className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className="h-2 w-2 rounded-full bg-rh-green" />
          Gachahood
        </span>
        <span className={`${CARD} px-4 py-2 text-xs text-rh-muted`}>Robinhood Chain</span>
      </header>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[58vh] min-h-[340px]">
        <BoxHero />
      </div>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-20 pt-[46vh] text-center">
        <h1 className="font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
          Gachahood
        </h1>
        <p className="mt-5 max-w-md text-balance text-base leading-relaxed text-rh-muted">
          An on-chain claw machine. Drop the claw, grab a box, keep whatever is inside.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3">
          {address ? (
            <>
              <Link
                href="/play"
                className="rounded-full bg-rh-green px-10 py-4 font-display text-base font-bold tracking-tight text-rh-ink shadow-[0_12px_32px_-10px_rgba(0,200,5,0.85)] transition hover:brightness-105"
              >
                Open the claw machine
              </Link>
              <button
                onClick={disconnect}
                className="font-mono text-xs text-rh-muted underline-offset-4 hover:underline"
              >
                {shortAddress(address)} · disconnect
              </button>
            </>
          ) : (
            <ConnectButton
              label="Connect wallet"
              hint="Connect to open the machine."
              className="rounded-full bg-rh-ink px-10 py-4 font-display text-base font-bold tracking-tight text-white shadow-[0_10px_30px_-12px_rgba(26,29,27,0.7)] transition hover:brightness-125 disabled:opacity-50"
            />
          )}
        </div>

        <div className="mt-20 w-full">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-rh-muted">
            What you can win
          </p>
          <p className="mb-6 text-sm text-rh-muted">
            Real Robinhood merch. Every box in the machine holds one of these six.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ITEMS.map((item) => (
              <figure
                key={item.id}
                className="relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-rh-line"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
                  className="object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-3 pt-10 text-left">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-4 w-4 shrink-0 rounded-[3px] ring-1 ring-white/30"
                      style={boxSwatch(item)}
                    />
                    <span className="text-sm font-medium text-white">{item.name}</span>
                  </span>
                  <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                    {item.rarity}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <p className="mt-14 text-xs text-rh-muted">
          Coins are local for now — pulls are not yet settled on-chain.
        </p>
      </section>
    </main>
  );
}
