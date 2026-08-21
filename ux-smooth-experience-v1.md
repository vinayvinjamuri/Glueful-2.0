# Smooth Experience V1

Initial UX/performance work for Glueful. Resume Studio was selected first because the fixed-page renderer and V6 wrapper were both touching the same render lifecycle. The branch adds a non-invasive runtime foundation so the next optimization steps can be measured safely.

## Current focus
- Reduce duplicate DOM work around Resume Studio rendering.
- Improve touch/scroll behavior and compositor hints.
- Keep existing renderer behavior intact while changes are introduced incrementally.

## Next targets
1. Consolidate renderer wrapper ownership.
2. Add viewer zoom state and smooth fit/zoom transitions.
3. Audit Jobs boot/API duplication and search latency.
4. Add resilient loading/error/empty states.
5. Add lightweight performance diagnostics for render and API latency.
