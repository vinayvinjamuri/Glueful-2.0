# Resume Studio Viewer Validation

## Regression checks

1. Every `.glueful-fixed-page` has positive width and height.
2. Pages do not geometrically overlap in the viewport.
3. Page elements do not carry a direct transform that changes document flow.
4. Zoom must be implemented at a viewer/container level rather than mutating individual page flow dimensions.
5. Editor text reflow remains owned by `glueful-resume-fixed-page-ux-v6.js`; the viewer must not alter block geometry.
6. Fixed-PDF bootstrap remains the authoritative renderer.

The branch currently contains diagnostics/tests only. No visual layout mutation is included until browser results identify the exact failing invariant.
