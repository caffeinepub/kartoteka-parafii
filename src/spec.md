# Specification

## Summary
**Goal:** Make Dashboard anniversary calculations match Kartoteka exactly and add anniversary-type filtering (including PDF export).

**Planned changes:**
- Unify backend anniversary calculation to use `anniversaryNumber = (targetYear - eventYear)` with no +1 offset, sourced only from the relevant single year field (baptismYear/marriageYear/funeralYear), and exclude entries where `anniversaryNumber` is 0.
- Add backend support to filter anniversaries by type (baptism/marriage/funeral) for both paginated results and PDF export, with filtering applied before pagination and reflected in totals.
- Add a Dashboard UI filter control (All, Baptism, Marriage, Funeral) that works with the existing year selector and pagination (changing year or filter resets to page 1).
- Update Dashboard PDF export to respect the selected year and current anniversary type filter.

**User-visible outcome:** On the Dashboard, users can filter anniversaries by type and export a PDF containing only the selected type(s) for the chosen year, with anniversary numbers matching the Kartoteka calculation.
