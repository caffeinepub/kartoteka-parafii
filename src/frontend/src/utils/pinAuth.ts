const PIN_HASH_KEY = "parish_pin_hash";
const PIN_CONFIGURED_KEY = "parish_pin_configured";

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${pin}parish_salt_zbrosza`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function savePin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_HASH_KEY, hash);
  localStorage.setItem(PIN_CONFIGURED_KEY, "true");
}

export function isPinConfigured(): boolean {
  return localStorage.getItem(PIN_CONFIGURED_KEY) === "true";
}

export async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = localStorage.getItem(PIN_HASH_KEY);
  if (!storedHash) return false;
  const inputHash = await hashPin(pin);
  return inputHash === storedHash;
}

export function clearPin(): void {
  localStorage.removeItem(PIN_HASH_KEY);
  localStorage.removeItem(PIN_CONFIGURED_KEY);
}
