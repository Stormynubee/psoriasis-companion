# Research Findings: Psoriasis Companion Refinement

This document serves as our "working memory on disk" to track codebase inspections, visual/motion flaws, and performance profiling signatures.

---

## Codebase Analysis & Analysis of Flaws

### 1. Visual/Motion Design Flaws (Antigravity Design Rules)
- **Flat Layout Cards:** The current dashboard cards (`MedChecklist`, `BodyMap`, and `Daily Insight`) are visually flat and static. They lack spatial depth (Z-axis perspective) and kinetic interactive animations.
- **Snapping State Transitions:** Navigation and hovering states lack high-end staggers and inertia-based tilt transitions.
- **HUD Edge Integration:** The glassmorphic side HUD panel is static and doesn't feature an active video preview or wireframe overlay, limiting visual confirmation of what the camera is tracking.

### 2. Functional & Robustness Bugs (Debugger Rules)
- **Camera Block / Permission Exceptions:** If a user blocks camera access, `useGestureTracking.ts` logs the error, but the HUD states remain stuck on `"CAMERA: SEARCHING"`. We need to bubble up permission states (`"NO_WEBCAM"`, `"PERMISSION_BLOCKED"`) directly into the HUD interface.
- **Cursor Boundary Overflow:** If hand tracking exits the camera frame, the virtual cursor snaps or remains stuck at the edge. We should introduce coordinate fade-outs or smoothing snaps.
- **SVG Hover Target Conflicts:** We must ensure that the silhouette body regions and other deep-nested SVG paths handle coordinate calculations accurately when hover-clicked touchlessly.

---

## Performance Baselines
- **Vite Production Bundler size:** 320.05 kB JS
- **Camera Landmark loop FPS:** ~30-60 FPS (depending on device CPU and camera model)
- **Unit Test coverage:** 1 passing test (`useDwellClick.test.ts`)
