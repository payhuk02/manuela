import { useEffect, useState } from "react";

const STORAGE_KEY = "rv_visitor_key";

function generateKey(): string {
  // 32 hex chars = 128 bits, well within the 16..128 length window enforced server-side.
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Stable, anonymous per-browser identifier used to scope chatbot conversations
 * (and any other per-visitor server-side state) without requiring login.
 */
export function useVisitorKey(): string {
  const [key, setKey] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 16) return existing;
    const fresh = generateKey();
    localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  });

  useEffect(() => {
    if (!key) {
      const fresh = generateKey();
      localStorage.setItem(STORAGE_KEY, fresh);
      setKey(fresh);
    }
  }, [key]);

  return key;
}
