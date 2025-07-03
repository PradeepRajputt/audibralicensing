
'use client';

import * as React from 'react';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

// Load models from the local public directory for reliability
const MODEL_URL = '/models'; 
const BLINK_THRESHOLD = 0.25;

interface FaceAuthProps {
  mode: 'login' | 'register';
  onSuccess: (descriptor: Float32Array) => void;
  isDisabled?: boolean;
}

export function FaceAuth({ mode, onSuccess, isDisabled }: FaceAuthProps) {
  const [loading, setLoading] = React.useState<'models' | 'scanning' | 'processing' | null>(null);
  const [statusText, setStatusText] = React.useState('Click the button to start the camera.');
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const blinkTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const detectionIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const loadModelsAndStart = React.useCallback(async () => {
    setLoading('models');
    setStatusText('Loading models...');
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setStatusText('Please grant camera access.');
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasCameraPermission(true);
        setStatusText("Position your face in the center and click Scan.");
        setLoading(null);
      }
    } catch (err) {
      console.error("Error loading models or starting camera: ", err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setStatusText("Error initializing camera or models.");
      toast({ 
        variant: "destructive", 
        title: "Initialization Error", 
        description: `Could not load models or access camera. Please ensure you have a webcam and the model files are present. Error: ${errorMessage}`
      });
      setHasCameraPermission(false);
      setLoading(null);
    }
  }, [toast]);
  

  React.useEffect(() => {
    // Cleanup function to stop camera when component unmounts
    return () => {
        if(detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
        if(blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
    }
  }, []);

  const getEyeAspectRatio = (landmarks: faceapi.Point[]) => {
    const d = (p1: faceapi.Point, p2: faceapi.Point) => Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
    const v1 = d(landmarks[1], landmarks[5]);
    const v2 = d(landmarks[2], landmarks[4]);
    const h = d(landmarks[0], landmarks[3]);
    return (v1 + v2) / (2 * h);
  };
  
  const handleScan = () => {
    setLoading('scanning');
    setStatusText("Scanning... Please blink.");
    let blinked = false;

    detectionIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) {
          if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
          return;
        };

        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        
        if(canvasRef.current && videoRef.current) {
             const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
             faceapi.draw.drawDetections(canvasRef.current, faceapi.resizeResults(detections, dims));
        }

        if (detections.length === 1) {
            const landmarks = detections[0].landmarks;
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();

            const leftEAR = getEyeAspectRatio(leftEye);
            const rightEAR = getEyeAspectRatio(rightEye);
            
            const ear = (leftEAR + rightEAR) / 2;

            if (ear < BLINK_THRESHOLD) {
                if (!blinked) {
                     setStatusText("Blink detected! Capturing...");
                     blinked = true;
                     if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
                     setLoading('processing');
                     
                     setTimeout(async () => {
                        if (!videoRef.current) return;
                        const finalDetection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

                        if (finalDetection) {
                            setStatusText(mode === 'register' ? 'Registration complete!' : 'Login successful!');
                            onSuccess(finalDetection.descriptor);
                        } else {
                            setStatusText("Capture failed. Please blink again.");
                            setLoading(null);
                        }
                     }, 500);
                }
            }
        } else if (detections.length > 1) {
            setStatusText("Multiple faces detected. Please ensure only one person is visible.");
        } else {
             setStatusText("Position your face in the center and blink.");
        }
    }, 200);
  }

  const actionText = mode === 'register' ? 'Start Registration' : 'Login with Face';
  const loadingText = loading === 'models' ? 'Loading Models...' : loading ? 'Verifying...' : actionText;

  if (hasCameraPermission === null) {
     return (
        <div className="flex flex-col items-center gap-4">
             <div className="relative w-full max-w-xs aspect-square border-2 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                 <Camera className="w-16 h-16 text-muted-foreground" />
             </div>
             <p className="text-sm text-muted-foreground h-5">{statusText}</p>
             <Button onClick={loadModelsAndStart} disabled={!!loading || isDisabled}>
                 {loading === 'models' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                 Start Camera
            </Button>
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
        <div className="relative w-full max-w-xs aspect-square border-2 rounded-lg overflow-hidden bg-muted">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
            {!hasCameraPermission && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4 text-center"><Camera className="w-12 h-12 mb-2" /><p>Camera access denied. Please enable it in your browser settings to continue.</p></div>}
        </div>
        <div className="text-center h-5">
          <p className="text-sm text-muted-foreground">{statusText}</p>
        </div>

        <Button onClick={handleScan} disabled={!hasCameraPermission || !!loading || isDisabled}>
            {loading === 'scanning' || loading === 'processing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (mode === 'register' ? <UserCheck className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />)}
            {loading === 'scanning' || loading === 'processing' ? 'Scanning...' : 'Scan Face & ' + (mode === 'register' ? 'Register' : 'Login')}
        </Button>
    </div>
  );
}
