/**
 * Retrieves a parameter value from the URL hash or sessionStorage.
 * Used primarily for detecting the Caffeine admin token during diagnostics.
 */
export function getSecretParameter(paramName: string): string | null {
  // Check sessionStorage first
  try {
    const stored = sessionStorage.getItem(paramName);
    if (stored !== null) return stored;
  } catch {
    // sessionStorage not available
  }

  // Check URL hash fragment
  try {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const value = params.get(paramName);
    if (value !== null) {
      try {
        sessionStorage.setItem(paramName, value);
      } catch {
        // ignore
      }
      return value;
    }
  } catch {
    // ignore
  }

  // Check URL search params
  try {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(paramName);
    if (value !== null) {
      try {
        sessionStorage.setItem(paramName, value);
      } catch {
        // ignore
      }
      return value;
    }
  } catch {
    // ignore
  }

  return null;
}
