// Re-exported from @caffeineai/core-infrastructure with createActor bound.
// This file bridges the package's generic useActor with this app's backend.
import { useActor as _useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";

export function useActor() {
  return _useActor(createActor);
}
