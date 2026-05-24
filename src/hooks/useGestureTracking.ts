import { useEffect, useRef, useState } from 'react';

export type TrackingStatus = 'OFFLINE' | 'SEARCHING' | 'ACTIVE' | 'NO_WEBCAM' | 'PERMISSION_BLOCKED';

export const useGestureTracking = (active: boolean, alpha: number = 0.35) => {
  const [coords, setCoords] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [gesture, setGesture] = useState<'none' | 'point' | 'pinch' | 'swipe_left' | 'swipe_right'>('none');
  const [fps, setFps] = useState(0);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('OFFLINE');
  const [rawLandmarks, setRawLandmarks] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const prevCoordsRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastFrameTimeRef = useRef(Date.now());
  const swipeCooldownRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setTrackingStatus('OFFLINE');
      setRawLandmarks([]);
      return;
    }

    setTrackingStatus('SEARCHING');
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
          setTrackingStatus(hasHands ? 'ACTIVE' : 'SEARCHING');

          const now = Date.now();
          const frameFps = Math.round(1000 / (now - lastFrameTimeRef.current));
          lastFrameTimeRef.current = now;
          setFps(frameFps);

          if (hasHands) {
            const landmarks = results.multiHandLandmarks[0];
            setRawLandmarks(landmarks);
            
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
          } else {
            setRawLandmarks([]);
          }
        });

        // Request webcam access safely to catch permission rejections
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (mediaErr: any) {
          if (mediaErr.name === 'NotAllowedError' || mediaErr.name === 'PermissionDeniedError') {
            setTrackingStatus('PERMISSION_BLOCKED');
            return;
          } else {
            setTrackingStatus('NO_WEBCAM');
            return;
          }
        }

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
        setTrackingStatus('NO_WEBCAM');
      }
    };

    initMediaPipe();

    return () => {
      if (camera) camera.stop();
      video.remove();
    };
  }, [active, alpha]);

  return { coords, gesture, fps, trackingStatus, rawLandmarks };
};

export default useGestureTracking;
