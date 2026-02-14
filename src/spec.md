# Specification

## Summary
**Goal:** Add a consistent PDF export mode selection (export all vs export selected single record) across all non-Budget modules that support PDF export.

**Planned changes:**
- Add a shared export control on each applicable non-Budget module page to choose between “Export all” and “Export selected”.
- Implement/standardize single-record selection flow per module so “Export selected” exports exactly one explicitly selected record.
- Preserve existing “export all” behavior per module, and keep Budget module export behavior unchanged.
- Add localized, consistent labels and user prompts/toasts (including an error when “Export selected” is chosen without a selection).

**User-visible outcome:** In supported modules (e.g., Baptisms, Marriages, Funerals, Kartoteka/Parishioners, Localities, Events, Correspondence), users can choose to export either the whole current list to PDF or a single selected record to PDF; attempting single-record export without selecting a record shows a clear message. Budget exports work as before.
