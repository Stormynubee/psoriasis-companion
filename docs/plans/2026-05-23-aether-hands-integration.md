# Aether Hands Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate a touchless, client-side, camera-based hand tracking and gestural control mode directly into the Psoriasis Companion PWA using MediaPipe, allowing patients with painful or restricted hand movement to navigate the app and log flare-ups entirely via mid-air gestures.

**Architecture:** Port the browser-based MediaPipe hands pipeline from Aether Hands into the Psoriasis Companion. Introduce a custom React accessibility hook to translate smoothed camera landmarks (using Exponential Moving Average filtering) into a floating glow cursor overlay with **Dwell Clicking** (hovering for 1.5s to trigger clicks automatically) and **Mid-Air Swipe Navigation** for cycling app tabs. Save configurations to local-first browser preferences.

**Tech Stack:** React 19, TypeScript, MediaPipe JS Tasks SDK, Dexie.js (IndexedDB), CSS Custom Animations, Vitest.

---

### Task 1: Environment & HTML CDN Configuration

**Files:**
- Modify: [index.html](file:///C:/Users/storm/psoriasis-companion/index.html)

**Step 1: Write the HTML changes**
Inject the secure MediaPipe JS dependency scripts directly into the `<head>` of the application.

```html
<!-- index.html:9-12 -->
    <!-- MediaPipe CDN Assets for Aether Touchless Gestural Tracking -->
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
```

**Step 2: Run verification**
Verify script loading manually inside the browser console by checking `window.Hands` and `window.Camera`.

**Step 3: Commit**
```bash
git add index.html
git commit -m "chore: inject mediapipe cdn scripts into index.html"
```

---

### Task 2: Core Design System & Floating Cursor CSS

**Files:**
- Modify: [src/index.css](file:///C:/Users/storm/psoriasis-companion/src/index.css)

**Step 1: Write minimal implementation**
Append Aether HUD styling variables, scanning visual feedback classes, and glowing virtual reticle styles.

```css
/* src/index.css */
:root {
  --hud-amber: #ff9500;
  --hud-cyan: #00ffff;
  --hud-magenta: #ff00ff;
  --hud-glass: rgba(28, 28, 30, 0.85);
}

.aether-pointer {
  position: fixed;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--hud-cyan);
  background: rgba(0, 255, 255, 0.1);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9999;
  filter: drop-shadow(0 0 8px var(--hud-cyan));
  transition: width 0.1s, height 0.1s;
}

.aether-pointer::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: var(--hud-magenta);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 4px var(--hud-magenta));
}

.dwell-ring {
  position: absolute;
  top: -6px;
  left: -6px;
  width: 36px;
  height: 36px;
  transform: rotate(-90deg);
}

.dwell-ring-circle {
  fill: none;
  stroke: var(--hud-magenta);
  stroke-width: 3;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
}

.aether-hud-panel {
  position: fixed;
  bottom: 95px;
  right: 20px;
  width: 180px;
  background: var(--hud-glass);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 12px;
  z-index: 1000;
  font-family: monospace;
  font-size: 11px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border-left: 3px solid var(--hud-cyan);
}
```

**Step 2: Commit**
```bash
git add src/index.css
git commit -m "style: define high-end aether hud and pointer variables"
```

---

### Task 3: The Dwell-Click Hook (`useDwellClick`)

**Files:**
- Create: [src/hooks/useDwellClick.ts](file:///C:/Users/storm/psoriasis-companion/src/hooks/useDwellClick.ts)
- Create: [src/hooks/useDwellClick.test.ts](file:///C:/Users/storm/psoriasis-companion/src/hooks/useDwellClick.test.ts)

**Step 1: Write the TDD tests**
Create `src/hooks/useDwellClick.test.ts` to assert that after the specified duration, the hover target registers a simulated `click` event.

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDwellClick } from './useDwellClick';
import { expect, test, vi } from 'vitest';

test('should register click on hover target after dwell interval', () => {
  vi.useFakeTimers();
  const mockBtn = document.createElement('button');
  mockBtn.onclick = vi.fn();
  document.body.appendChild(mockBtn);

  // Mock document.elementFromPoint
  document.elementFromPoint = vi.fn().mockReturnValue(mockBtn);

  const { result } = renderHook(() => useDwellClick(true, 100, 100, 1000));
  
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(mockBtn.onclick).toHaveBeenCalled();
  vi.useRealTimers();
  document.body.removeChild(mockBtn);
});
```

**Step 2: Run verification and see it fail**
Run: `npm run test` or `npx vitest run src/hooks/useDwellClick.test.ts`
Expected: FAIL - hook not defined.

**Step 3: Write minimal implementation**
Implement the coordinate boundary detection and automatic element triggering loop in `src/hooks/useDwellClick.ts`.

```typescript
import { useEffect, useRef, useState } from 'react';

export const useDwellClick = (
  active: boolean,
  x: number,
  y: number,
  dwellTimeMs: number = 1500
) => {
  const [dwellProgress, setDwellProgress] = useState(0);
  const hoverElementRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setDwellProgress(0);
      hoverElementRef.current = null;
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const el = document.elementFromPoint(x, y) as HTMLElement;
    
    const isInteractive = (target: HTMLElement | null): HTMLElement | null => {
      if (!target) return null;
      const tag = target.tagName.toLowerCase();
      const role = target.getAttribute('role');
      if (
        tag === 'button' ||
        tag === 'input' ||
        tag === 'select' ||
        tag === 'a' ||
        tag === 'circle' ||
        tag === 'path' ||
        target.onclick ||
        target.classList.contains('clickable') ||
        target.style.cursor === 'pointer' ||
        role === 'button' ||
        role === 'checkbox'
      ) {
        return target;
      }
      return target.parentElement ? isInteractive(target.parentElement) : null;
    };

    const interactiveEl = isInteractive(el);

    if (interactiveEl) {
      if (hoverElementRef.current !== interactiveEl) {
        hoverElementRef.current = interactiveEl;
        startTimeRef.current = Date.now();
        
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
        
        const tick = () => {
          if (!startTimeRef.current || hoverElementRef.current !== interactiveEl) return;
          const elapsed = Date.now() - startTimeRef.current;
          const progress = Math.min((elapsed / dwellTimeMs) * 100, 100);
          setDwellProgress(progress);

          if (elapsed >= dwellTimeMs) {
            interactiveEl.click();
            interactiveEl.style.transform = 'scale(0.95)';
            setTimeout(() => {
              interactiveEl.style.transform = '';
            }, 150);
            setDwellProgress(0);
            startTimeRef.current = Date.now();
          } else {
            timerRef.current = requestAnimationFrame(tick);
          }
        };
        timerRef.current = requestAnimationFrame(tick);
      }
    } else {
      hoverElementRef.current = null;
      startTimeRef.current = null;
      setDwellProgress(0);
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [x, y, active, dwellTimeMs]);

  return { dwellProgress };
};
```

**Step 4: Verify test passes**
Run: `npx vitest run src/hooks/useDwellClick.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/hooks/useDwellClick*
git commit -m "feat: implement accessibility useDwellClick hook with TDD suite"
```

---

### Task 4: The Optical Gesture Tracking Hook (`useGestureTracking`)

**Files:**
- Create: [src/hooks/useGestureTracking.ts](file:///C:/Users/storm/psoriasis-companion/src/hooks/useGestureTracking.ts)

**Step 1: Write minimal implementation**
Implement the MediaPipe hands initialization loop, coordinate mirror transformation, EMA coordinate dampening filter, and lateral wrist velocity tracker for air swipes.

```typescript
import { useEffect, useRef, useState } from 'react';

export const useGestureTracking = (active: boolean, alpha: number = 0.35) => {
  const [coords, setCoords] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [gesture, setGesture] = useState<'none' | 'point' | 'pinch' | 'swipe_left' | 'swipe_right'>('none');
  const [fps, setFps] = useState(0);
  const [trackingActive, setTrackingActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const prevCoordsRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastFrameTimeRef = useRef(Date.now());
  const swipeCooldownRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setTrackingActive(false);
      return;
    }

    let camera: any = null;
    const video = document.createElement('video');
    video.style.display = 'none';
    video.playsInline = true;
    videoRef.current = video;

    const initMediaPipe = async () => {
      try {
        // @ts-ignore
        const { Hands, Camera } = window;
        if (!Hands || !Camera) {
          setTimeout(initMediaPipe, 500);
          return;
        }

        const hands = new Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        hands.onResults((results: any) => {
          const hasHands = !!(results.multiHandLandmarks && results.multiHandLandmarks[0]);
          setTrackingActive(hasHands);
          
          const now = Date.now();
          const frameFps = Math.round(1000 / (now - lastFrameTimeRef.current));
          lastFrameTimeRef.current = now;
          setFps(frameFps);

          if (hasHands) {
            const landmarks = results.multiHandLandmarks[0];
            const indexTip = landmarks[8];
            
            const screenX = (1 - indexTip.x) * window.innerWidth;
            const screenY = indexTip.y * window.innerHeight;
            
            const smoothedX = alpha * screenX + (1 - alpha) * prevCoordsRef.current.x;
            const smoothedY = alpha * screenY + (1 - alpha) * prevCoordsRef.current.y;
            
            prevCoordsRef.current = { x: smoothedX, y: smoothedY };
            setCoords({ x: smoothedX, y: smoothedY });

            const thumbTip = landmarks[4];
            const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
            const isPinching = distance < 0.045;
            
            const wrist = landmarks[0];
            const currTime = Date.now();
            if (currTime > swipeCooldownRef.current) {
              const wristVelX = wrist.x - (prevCoordsRef.current.x / window.innerWidth);
              if (Math.abs(wristVelX) > 0.08) {
                if (wristVelX > 0) {
                  setGesture('swipe_right');
                  swipeCooldownRef.current = currTime + 1000;
                  setTimeout(() => setGesture('none'), 800);
                } else {
                  setGesture('swipe_left');
                  swipeCooldownRef.current = currTime + 1000;
                  setTimeout(() => setGesture('none'), 800);
                }
                return;
              }
            }

            setGesture(isPinching ? 'pinch' : 'point');
          }
        });

        camera = new Camera(video, {
          onFrame: async () => {
            if (active && video) {
              await hands.send({ image: video });
            }
          },
          width: 640,
          height: 480,
        });

        await camera.start();
      } catch (err) {
        console.error("Aether MediaPipe initialization failed:", err);
      }
    };

    initMediaPipe();

    return () => {
      if (camera) camera.stop();
      video.remove();
    };
  }, [active, alpha]);

  return { coords, gesture, fps, trackingActive };
};
```

**Step 2: Commit**
```bash
git add src/hooks/useGestureTracking.ts
git commit -m "feat: implement client-side camera landmark tracker hook"
```

---

### Task 5: Dynamic Accessibility Settings Panel

**Files:**
- Modify: [src/components/settings/Settings.tsx](file:///C:/Users/storm/psoriasis-companion/src/components/settings/Settings.tsx)

**Step 1: Write implementation**
Integrate state toggles and save local configuration variables (Touchless active state, Smoothing weight, Dwell speed) in the `Settings.tsx` preferences section.

```typescript
// src/components/settings/Settings.tsx:96-107
      <div className="card">
         <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '1px' }}>AETHER GESTURES ACCESSIBILITY</div>
         
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid var(--border)', marginBottom: '15px' }}>
            <div>
              <span style={{ fontSize: '15px', fontWeight: '500', display: 'block' }}>Touchless Gesture Mode</span>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Navigate using physical hand gestures</span>
            </div>
            <input 
              type="checkbox" 
              className="toggle" 
              checked={JSON.parse(localStorage.getItem('aether_active') || 'false')}
              onChange={(e) => {
                localStorage.setItem('aether_active', JSON.stringify(e.target.checked));
                window.location.reload();
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Pointer Smoothness (EMA Alpha)</span>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{parseFloat(localStorage.getItem('aether_alpha') || '0.35')}</span>
             </div>
             <input 
               type="range" 
               min="0.1" 
               max="0.9" 
               step="0.05"
               value={parseFloat(localStorage.getItem('aether_alpha') || '0.35')}
               onChange={(e) => {
                 localStorage.setItem('aether_alpha', e.target.value);
                 window.dispatchEvent(new Event('storage'));
               }}
               style={{ width: '100%' }}
             />
          </div>

          <div>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Dwell Click Delay (seconds)</span>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{(parseInt(localStorage.getItem('aether_dwell') || '1500') / 1000).toFixed(1)}s</span>
             </div>
             <input 
               type="range" 
               min="800" 
               max="3000" 
               step="100"
               value={parseInt(localStorage.getItem('aether_dwell') || '1500')}
               onChange={(e) => {
                 localStorage.setItem('aether_dwell', e.target.value);
                 window.dispatchEvent(new Event('storage'));
               }}
               style={{ width: '100%' }}
             />
          </div>
      </div>
```

**Step 2: Commit**
```bash
git add src/components/settings/Settings.tsx
git commit -m "feat: add hands-free accessibility toggles in settings menu"
```

---

### Task 6: UI Shell Layout, HUD Overlay & Gestural Navigation Integrations

**Files:**
- Modify: [src/App.tsx](file:///C:/Users/storm/psoriasis-companion/src/App.tsx)

**Step 1: Write integration**
Mount custom hooks, render the circular loading glowing pointer reticle on screen, intercept swipes in mid-air to cycle through tabs, and display diagnostic frame rates in a glassmorphic sidebar HUD box.

```typescript
// src/App.tsx
import { useState, useEffect } from 'react';
import './index.css';
import { Navigation } from './components/layout/Navigation';
import { MedChecklist } from './components/dashboard/MedChecklist';
import { BodyMap } from './components/dashboard/BodyMap';
import { useInsights } from './hooks/useInsights';
import { Settings } from './components/settings/Settings';
import { DetailedLog } from './components/log/DetailedLog';
import { History } from './components/history/History';
import { Trends } from './components/trends/Trends';
import { useGestureTracking } from './hooks/useGestureTracking';
import { useDwellClick } from './hooks/useDwellClick';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const insight = useInsights();

  // Load Aether Preferences
  const [aetherActive, setAetherActive] = useState(false);
  const [alpha, setAlpha] = useState(0.35);
  const [dwellTime, setDwellTime] = useState(1500);

  useEffect(() => {
    const active = JSON.parse(localStorage.getItem('aether_active') || 'false');
    const a = parseFloat(localStorage.getItem('aether_alpha') || '0.35');
    const d = parseInt(localStorage.getItem('aether_dwell') || '1500');
    setAetherActive(active);
    setAlpha(a);
    setDwellTime(d);
  }, []);

  // Hook Instantiations
  const { coords, gesture, fps, trackingActive } = useGestureTracking(aetherActive, alpha);
  const { dwellProgress } = useDwellClick(aetherActive, coords.x, coords.y, dwellTime);

  // Swipe Action Listener for Cycling Tabs
  useEffect(() => {
    const tabs = ['home', 'history', 'log', 'trends', 'settings'];
    const currIndex = tabs.indexOf(activeTab);
    
    if (gesture === 'swipe_left' && currIndex < tabs.length - 1) {
      setActiveTab(tabs[currIndex + 1]);
    } else if (gesture === 'swipe_right' && currIndex > 0) {
      setActiveTab(tabs[currIndex - 1]);
    }
  }, [gesture]);

  const Dashboard = () => (
    <>
      <div style={{ marginBottom: '24px', paddingTop: '10px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', letterSpacing: '-0.5px' }}>Hello, Storm</h1>
        <div style={{ color: 'var(--text-dim)', fontSize: '15px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>
      <MedChecklist />
      <BodyMap />
      <div className="card" style={{ borderTop: '4px solid var(--accent-blue)' }}>
        <div style={{ color: 'var(--accent-blue)', fontSize: '13px', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>DAILY INSIGHT</div>
        <p style={{ fontSize: '15px', margin: 0, lineHeight: '1.4' }}>{insight || "Loading insights..."}</p>
      </div>
    </>
  );

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '20px', paddingBottom: '90px', boxSizing: 'border-box' }}>
      {activeTab === 'home' && <Dashboard />}
      {activeTab === 'history' && <History />}
      {activeTab === 'log' && <DetailedLog setActiveTab={setActiveTab} />}
      {activeTab === 'trends' && <Trends />}
      {activeTab === 'settings' && <Settings />}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Floating Glowing Reticle Cursor */}
      {aetherActive && (
        <div className="aether-pointer" style={{ left: `${coords.x}px`, top: `${coords.y}px` }}>
          <svg className="dwell-ring">
            <circle 
              className="dwell-ring-circle" 
              cx="18" 
              cy="18" 
              r="15" 
              style={{ strokeDashoffset: 100 - dwellProgress }}
            />
          </svg>
        </div>
      )}

      {/* Glassmorphic Side diagnostic HUD Panel */}
      {aetherActive && (
        <div className="aether-hud-panel">
          <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: '6px' }}>AETHER HUD v2.0</div>
          <div>CAMERA STATUS: <span style={{ color: trackingActive ? '#00ffff' : '#ff0055' }}>{trackingActive ? 'TRACKING' : 'SEARCHING'}</span></div>
          <div>FPS: {fps}</div>
          <div>GESTURE: <span style={{ textTransform: 'uppercase' }}>{gesture}</span></div>
        </div>
      )}
    </div>
  );
}

export default App;
```

**Step 2: Commit**
```bash
git add src/App.tsx
git commit -m "feat: combine gesture cursor and glassmorphic hud in main app shell"
```

---

## Verification Plan

### Automated Tests
- Run unit tests to verify coordinate and trigger correctness:
  `npm run test` or `npx vitest`

### Manual Verification
- Deploy to sandbox and run the app locally using `npm run dev`.
- Turn on "Touchless Gesture Mode" under **Settings**.
- Verify cursor tracks hand movements smoothly.
- Hold still over medication checkboxes and tabs to verify dwell clicking clicks correctly.
- Perform air-swipes to check tab navigation.
- Verify body silhouette map is clickable touchlessly via hovering over segments.
