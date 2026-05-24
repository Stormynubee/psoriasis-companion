import { useEffect, useRef, useState } from 'react';

export const useDwellClick = (
  active: boolean,
  x: number,
  y: number,
  dwellTimeMs: number = 1500
) => {
  const [dwellProgress, setDwellProgress] = useState(0); // 0 to 100
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

    // Find element at client (x, y) coordinates
    const el = document.elementFromPoint(x, y) as HTMLElement;
    
    // Check if element is interactive (button, checkbox, input, link, select, svg, or styled as pointer/clickable)
    const isInteractive = (target: HTMLElement | null): HTMLElement | null => {
      if (!target) return null;
      const tag = target.tagName.toLowerCase();
      const role = target.getAttribute('role');
      if (
        tag === 'button' ||
        tag === 'input' ||
        tag === 'select' ||
        tag === 'a' ||
        tag === 'option' ||
        tag === 'rect' ||
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
      // Bubble up to parent
      return target.parentElement ? isInteractive(target.parentElement) : null;
    };

    const interactiveEl = isInteractive(el);

    if (interactiveEl) {
      if (hoverElementRef.current !== interactiveEl) {
        // Switch targets
        hoverElementRef.current = interactiveEl;
        startTimeRef.current = Date.now();
        
        if (timerRef.current) {
          cancelAnimationFrame(timerRef.current);
          timerRef.current = null;
        }
        
        const tick = () => {
          if (!startTimeRef.current || hoverElementRef.current !== interactiveEl) return;
          const elapsed = Date.now() - startTimeRef.current;
          const progress = Math.min((elapsed / dwellTimeMs) * 100, 100);
          setDwellProgress(progress);

          if (elapsed >= dwellTimeMs) {
            // Trigger Dwell Click with synthetic coordinate-injected event
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y
            });
            interactiveEl.dispatchEvent(clickEvent);
            
            // Add a brief scale feedback
            const originalTransform = interactiveEl.style.transform;
            interactiveEl.style.transform = 'scale(0.95)';
            setTimeout(() => {
              interactiveEl.style.transform = originalTransform;
            }, 150);
            
            // Reset
            setDwellProgress(0);
            startTimeRef.current = Date.now();
          } else {
            timerRef.current = requestAnimationFrame(tick);
          }
        };
        timerRef.current = requestAnimationFrame(tick);
      }
    } else {
      // Clear targets
      hoverElementRef.current = null;
      startTimeRef.current = null;
      setDwellProgress(0);
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [x, y, active, dwellTimeMs]);

  return { dwellProgress };
};
