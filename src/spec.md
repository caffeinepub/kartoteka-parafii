# Specification

## Summary
**Goal:** Fix the Correspondence (Korespondencja) printable letter PDF layout so the body text is left-aligned and the signature block is shifted slightly to the right.

**Planned changes:**
- Update `generateLetterPDF` in `frontend/src/lib/pdfGenerator.ts` to render the main letter body text block left-aligned (not centered).
- Adjust `generateLetterPDF` in `frontend/src/lib/pdfGenerator.ts` so the signature block ("Z ufnością w Boże miłosierdzie", "ks. Marek Michalczyk") is positioned slightly to the right of center (not centered).
- Ensure these layout changes apply only to `generateLetterPDF` and do not affect other PDF generators.

**User-visible outcome:** Generating a PDF from the Korespondencja page produces a letter with a left-aligned body text block and a signature block clearly shifted to the right, while other PDFs remain unchanged.
