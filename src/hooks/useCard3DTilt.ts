import { useState, useRef, useEffect, type MouseEvent } from 'react';

export const useCard3DTilt = (
  maxTiltDegrees: number = 8,
  virtualCoords?: { x: number; y: number; active: boolean }
) => {
  const [transformStyle, setTransformStyle] = useState('rotateX(0deg) rotateY(0deg)');
  const [shadowStyle, setShadowStyle] = useState('0 4px 15px rgba(0,0,0,0.2)');
  const cardRef = useRef<HTMLElement | null>(null);

  // Helper to calculate card rotation based on raw client coordinates
  const calculateTilt = (clientX: number, clientY: number) => {
    const card = cardRef.current;
    if (!card) return;

    // Check OS reduced motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate cursor position offset relative to card's geometric center
    const offsetX = clientX - rect.left - width / 2;
    const offsetY = clientY - rect.top - height / 2;

    // Standardize rotation ratio and degrees
    const rotateY = (offsetX / (width / 2)) * maxTiltDegrees;
    const rotateX = -(offsetY / (height / 2)) * maxTiltDegrees;

    setTransformStyle(`rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) scale(1.02)`);
    setShadowStyle('0 20px 40px rgba(0, 255, 255, 0.15), 0 10px 20px rgba(0, 0, 0, 0.4)');
  };

  const resetTilt = () => {
    setTransformStyle('rotateX(0deg) rotateY(0deg) scale(1)');
    setShadowStyle('0 4px 15px rgba(0,0,0,0.2)');
  };

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (virtualCoords?.active) return;
    calculateTilt(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    if (virtualCoords?.active) return;
    resetTilt();
  };

  // Sync tilt transformations with virtual gesture pointer coordinates
  useEffect(() => {
    if (!virtualCoords || !virtualCoords.active) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const { x, y } = virtualCoords;

    const isInside = (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );

    if (isInside) {
      calculateTilt(x, y);
    } else {
      resetTilt();
    }
  }, [virtualCoords?.x, virtualCoords?.y, virtualCoords?.active]);

  return {
    cardRef,
    transformStyle,
    shadowStyle,
    handleMouseMove,
    handleMouseLeave
  };
};

export default useCard3DTilt;
