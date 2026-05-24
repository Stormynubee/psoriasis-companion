import { renderHook, act } from '@testing-library/react';
import { useDwellClick } from './useDwellClick';
import { expect, test, vi } from 'vitest';

test('should register click on hover target after dwell interval', async () => {
  vi.useFakeTimers();
  
  // Mock requestAnimationFrame using setTimeout so fake timers work
  const originalRaf = window.requestAnimationFrame;
  const originalCaf = window.cancelAnimationFrame;
  window.requestAnimationFrame = (cb) => window.setTimeout(cb, 16.6) as any;
  window.cancelAnimationFrame = (id) => window.clearTimeout(id);

  const mockBtn = document.createElement('button');
  const clickSpy = vi.fn();
  mockBtn.addEventListener('click', clickSpy);
  document.body.appendChild(mockBtn);

  // Mock document.elementFromPoint
  const originalElementFromPoint = document.elementFromPoint;
  document.elementFromPoint = () => mockBtn;

  renderHook(
    ({ x, y }) => useDwellClick(true, x, y, 1000),
    { initialProps: { x: 100, y: 100 } }
  );

  // Advance time by 1200ms inside act to trigger state updates and tick callbacks
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1200);
  });

  expect(clickSpy).toHaveBeenCalled();
  
  // Clean up
  window.requestAnimationFrame = originalRaf;
  window.cancelAnimationFrame = originalCaf;
  document.elementFromPoint = originalElementFromPoint;
  document.body.removeChild(mockBtn);
  vi.useRealTimers();
});
