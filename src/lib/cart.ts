"use client";

import { useSyncExternalStore } from "react";
import { resolveLine } from "@/lib/lite";

/** One cart line per product and size. */
export type CartItem = { slug: string; size: string | null; qty: number };

const KEY = "aldo.cart.v1";
const EMPTY: CartItem[] = [];
export const MAX_QTY = 10;

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const same = (i: CartItem, slug: string, size: string | null) => i.slug === slug && i.size === size;

/** Most units of one product / size a customer can order: stock when tracked, never more than MAX_QTY. */
export function maxQty(slug: string, size: string | null) {
  const line = resolveLine(slug, size);
  if (!line) return 0;
  return line.stock == null ? MAX_QTY : Math.min(MAX_QTY, line.stock);
}

const isItem = (x: unknown): x is CartItem => {
  const i = x as CartItem;
  return !!i && typeof i.slug === "string" && (i.size === null || typeof i.size === "string") && Number.isInteger(i.qty) && i.qty > 0 && maxQty(i.slug, i.size) > 0;
};

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (Array.isArray(parsed)) items = parsed.filter(isItem).map((i) => ({ slug: i.slug, size: i.size, qty: Math.min(i.qty, maxQty(i.slug, i.size)) }));
  } catch {
    items = EMPTY;
  }
}

function commit(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: the cart still works for this page view */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart() {
  return useSyncExternalStore(
    subscribe,
    () => (load(), items),
    () => EMPTY,
  );
}

export const cart = {
  add(slug: string, size: string | null, qty = 1) {
    load();
    const cap = maxQty(slug, size);
    if (cap <= 0) return;
    const has = items.some((i) => same(i, slug, size));
    commit(has ? items.map((i) => (same(i, slug, size) ? { ...i, qty: Math.min(cap, i.qty + qty) } : i)) : [...items, { slug, size, qty: Math.min(cap, qty) }]);
  },
  setQty(slug: string, size: string | null, qty: number) {
    load();
    const cap = maxQty(slug, size);
    commit(qty <= 0 ? items.filter((i) => !same(i, slug, size)) : items.map((i) => (same(i, slug, size) ? { ...i, qty: Math.min(cap, qty) } : i)));
  },
  clear() {
    commit(EMPTY);
  },
};

export const cartCount = (list: CartItem[]) => list.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = (list: CartItem[]) => list.reduce((s, i) => s + (resolveLine(i.slug, i.size)?.price ?? 0) * i.qty, 0);
