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
        const { Hands, Camera } = window as any;
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
            
            // Mirror coordinates for webcam
            const screenX = (1 - indexTip.x) * window.innerWidth;
            const screenY = indexTip.y * window.innerHeight;
            
            // Exponential Moving Average (EMA) coordinate smoothing
            const smoothedX = alpha * screenX + (1 - alpha) * prevCoordsRef.current.x;
            const smoothedY = alpha * screenY + (1 - alpha) * prevCoordsRef.current.y;
            
            prevCoordsRef.current = { x: smoothedX, y: smoothedY };
            setCoords({ x: smoothedX, y: smoothedY });

            // Pinch detection (Index tip landmark 8, Thumb tip landmark 4)
            const thumbTip = landmarks[4];
            const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
            const isPinching = distance < 0.045;
            
            // Lateral swipe detection (Wrist velocity tracking)
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
      if (camera) {
        camera.stop();
      }
      video.remove();
    };
  }, [active, alpha]);

  return { coords, gesture, fps, trackingActive };
};
export default useGestureTracking;
