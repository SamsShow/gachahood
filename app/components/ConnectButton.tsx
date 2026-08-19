"use client";

import { useEffect } from "react";
import { initWallets, useWallet } from "../lib/wallet";

const CHIP =
  "flex items-center gap-2 rounded-full border border-rh-line bg-white px-5 py-3 text-sm font-medium shadow-[0_1px_2px_rgba(26,29,27,0.05)] transition hover:border-rh-ink disabled:opacity-50";

export default function ConnectButton({
  label,
  className,
  hint,
}: {
  label: string;
  className: string;
  hint?: string;
}) {
  const wallets = useWallet((w) => w.wallets);
  const checked = useWallet((w) => w.checked);
  const connecting = useWallet((w) => w.connecting);
  const error = useWallet((w) => w.error);
  const connect = useWallet((w) => w.connect);

  useEffect(initWallets, []);

  const none = checked && wallets.length === 0;

  return (
    <div className="flex flex-col items-center gap-3">
      {wallets.length > 1 ? (
        <div className="flex flex-wrap justify-center gap-2">
          {wallets.map((w) => (
            <button key={w.uuid} onClick={() => connect(w.uuid)} disabled={connecting} className={CHIP}>
              {w.icon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.icon} alt="" className="h-5 w-5 rounded" />
              )}
              {w.name}
            </button>
          ))}
        </div>
      ) : (
        <button onClick={() => connect()} disabled={connecting || none} className={className}>
          {connecting ? "Check your wallet…" : none ? "No wallet detected" : label}
        </button>
      )}
      <p className="text-xs text-rh-muted">
        {none ? "Install MetaMask, Rabby or another browser wallet." : hint}
      </p>
      {error && <p className="text-xs text-[#A2422A]">{error}</p>}
    </div>
  );
}
