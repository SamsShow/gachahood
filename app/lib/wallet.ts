"use client";

import { create } from "zustand";

// Wallet discovery via EIP-6963, which is how browser wallets announce themselves now.
// `window.ethereum` alone is unreliable: several wallets no longer set it, and when two
// extensions are installed they overwrite each other's. It stays as a legacy fallback.
interface Eip1193 {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: never[]) => void) => void;
}

export interface WalletOption {
  uuid: string;
  name: string;
  icon: string;
  provider: Eip1193;
}

const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const LAST_USED = "gachahood.wallet";

// Providers are untrusted input — never render back whatever they hand over.
const firstAddress = (value: unknown): string | null => {
  if (!Array.isArray(value)) return null;
  const a = value[0];
  return typeof a === "string" && ADDRESS.test(a) ? a.toLowerCase() : null;
};

const legacyProvider = (): Eip1193 | null =>
  typeof window === "undefined"
    ? null
    : ((window as unknown as { ethereum?: Eip1193 }).ethereum ?? null);

interface WalletState {
  wallets: WalletOption[];
  /** false until discovery has had a chance to run, so we never flash "no wallet". */
  checked: boolean;
  address: string | null;
  connecting: boolean;
  error: string | null;
  connect: (uuid?: string) => Promise<void>;
  disconnect: () => void;
}

export const useWallet = create<WalletState>((set, get) => ({
  wallets: [],
  checked: false,
  address: null,
  connecting: false,
  error: null,
  connect: async (uuid) => {
    const { wallets } = get();
    const chosen = uuid ? wallets.find((w) => w.uuid === uuid) : wallets[0];
    const eth = chosen?.provider ?? legacyProvider();
    if (!eth) {
      set({ error: "No browser wallet detected." });
      return;
    }
    set({ connecting: true, error: null });
    try {
      const address = firstAddress(await eth.request({ method: "eth_requestAccounts" }));
      set({ address, connecting: false, error: address ? null : "No account returned." });
      if (address && chosen) localStorage.setItem(LAST_USED, chosen.uuid);
      eth.on?.("accountsChanged", (...args: never[]) =>
        useWallet.setState({ address: firstAddress(args[0]) })
      );
    } catch (e) {
      const rejected = typeof e === "object" && e !== null && "code" in e && e.code === 4001;
      set({ connecting: false, error: rejected ? "Connection rejected." : "Could not connect." });
    }
  },
  disconnect: () => {
    localStorage.removeItem(LAST_USED);
    set({ address: null, error: null });
  },
}));

const addWallet = (w: WalletOption) =>
  useWallet.setState((s) =>
    s.wallets.some((x) => x.uuid === w.uuid) ? s : { wallets: [...s.wallets, w] }
  );

// eth_accounts never prompts — it only reports an already-granted connection.
const silentRestore = async (w: WalletOption) => {
  try {
    const address = firstAddress(await w.provider.request({ method: "eth_accounts" }));
    if (address) useWallet.setState({ address });
  } catch {
    /* locked or unavailable — stay disconnected */
  }
};

let started = false;

export function initWallets() {
  if (started || typeof window === "undefined") return;
  started = true;

  window.addEventListener("eip6963:announceProvider", (event) => {
    const detail = (event as CustomEvent).detail as
      | { info?: { uuid?: string; name?: string; icon?: string }; provider?: Eip1193 }
      | undefined;
    const { uuid, name, icon } = detail?.info ?? {};
    if (!detail?.provider || !uuid || !name) return;
    const wallet = { uuid, name, icon: icon ?? "", provider: detail.provider };
    addWallet(wallet);
    if (localStorage.getItem(LAST_USED) === uuid) silentRestore(wallet);
  });

  // Wallets re-announce on request, so this is safe to fire more than once.
  window.dispatchEvent(new Event("eip6963:requestProvider"));

  // Extensions can inject late; re-poll briefly before deciding nothing is there.
  const sweep = (final: boolean) => {
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    const eth = legacyProvider();
    if (eth && useWallet.getState().wallets.length === 0) {
      const wallet = { uuid: "injected", name: "Browser wallet", icon: "", provider: eth };
      addWallet(wallet);
      silentRestore(wallet);
    }
    if (final) useWallet.setState({ checked: true });
  };
  sweep(false);
  setTimeout(() => sweep(false), 350);
  setTimeout(() => sweep(true), 1200);
}

export const shortAddress = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
