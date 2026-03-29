# Kartoteka Parafii — PIN Login

## Current State
Aplikacja używa Internet Identity do logowania. Użytkownik musi każdorazowo przechodzić przez II popup. Sesja trwa 30 dni (ustawione w maxTimeToLive).

## Requested Changes (Diff)

### Add
- `PinEntryScreen` — elegancki ekran PIN (4 cyfry), granat–złoto, logo parafii, auto-advance między polami, animacja błędu przy złym PINie
- `PinSetupScreen` — ekran ustawiania PINu (wyświetlany po pierwszym zalogowaniu przez II, lub gdy PIN nie jest jeszcze ustawiony)
- Logika PIN w `App.tsx`: nowy stan `pinPhase` (enum: `pin_setup | pin_entry | ready`)
- PIN przechowywany jako hash SHA-256 w localStorage (`parish_pin_hash`)
- Flaga `parish_pin_configured` w localStorage

### Modify
- `App.tsx` — dodać PIN flow przed wyświetleniem MainLayout:
  1. II session valid + brak PIN → po zalogowaniu II wyświetl PinSetupScreen
  2. II session valid + PIN skonfigurowany → wyświetl PinEntryScreen
  3. PIN wpisany poprawnie → przejdź do app
  4. PIN wpisany błędnie → animacja błędu, licznik prób
  5. Opcja resetu PIN (wymaga ponownego logowania II)
- `LoginPage.tsx` — bez zmian (używana gdy II session wygasła)

### Remove
- Nic

## Implementation Plan
1. Stworzyć `src/frontend/src/utils/pinAuth.ts` — hashowanie PIN, zapis/odczyt/usuwanie PIN z localStorage
2. Stworzyć `src/frontend/src/components/PinEntryScreen.tsx` — ekran wpisywania PIN
3. Stworzyć `src/frontend/src/components/PinSetupScreen.tsx` — ekran ustawiania PIN (2x wpisanie dla potwierdzenia)
4. Zmodyfikować `App.tsx` — zintegrować PIN flow po II authentication
