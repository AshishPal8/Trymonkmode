import { StateStorage, createJSONStorage } from "zustand/middleware";

const STORAGE_PREFIX = "TM_ENC_v1:";

function getStorageSecretKey(): string {
  if (typeof window === "undefined") return "trymonk_default_secret_salt_2026";
  const ua = window.navigator?.userAgent || "agent";
  const screen = `${window.screen?.width}x${window.screen?.height}`;
  return `trymonk_mode_sec_${ua.length}_${screen}`;
}

export function encryptData(plainText: string): string {
  if (!plainText) return plainText;
  try {
    const key = getStorageSecretKey();
    const textBytes = new TextEncoder().encode(plainText);
    const keyBytes = new TextEncoder().encode(key);

    const encryptedBytes = new Uint8Array(textBytes.length);
    for (let i = 0; i < textBytes.length; i++) {
      encryptedBytes[i] =
        textBytes[i] ^ keyBytes[i % keyBytes.length] ^ ((i * 7) & 0xff);
    }

    let binary = "";
    const len = encryptedBytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(encryptedBytes[i]);
    }
    const base64 = btoa(binary);

    return `${STORAGE_PREFIX}${base64}`;
  } catch (error) {
    console.warn(
      "[EncryptedStorage] Encryption failed, fallback to plain:",
      error,
    );
    return plainText;
  }
}

export function decryptData(cipherText: string): string {
  if (!cipherText) return cipherText;

  if (!cipherText.startsWith(STORAGE_PREFIX)) {
    return cipherText;
  }

  try {
    const base64 = cipherText.slice(STORAGE_PREFIX.length);
    const binary = atob(base64);
    const encryptedBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      encryptedBytes[i] = binary.charCodeAt(i);
    }

    const key = getStorageSecretKey();
    const keyBytes = new TextEncoder().encode(key);

    const decryptedBytes = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      decryptedBytes[i] =
        encryptedBytes[i] ^ keyBytes[i % keyBytes.length] ^ ((i * 7) & 0xff);
    }

    return new TextDecoder().decode(decryptedBytes);
  } catch (error) {
    console.warn("[EncryptedStorage] Decryption failed, returning raw:", error);
    return cipherText;
  }
}

export const encryptedStateStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    return decryptData(raw);
  },

  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    const encrypted = encryptData(value);
    localStorage.setItem(name, encrypted);
  },

  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};

export const createEncryptedStorage = () =>
  createJSONStorage(() => encryptedStateStorage);
