
'use client';

import * as React from 'react';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const MODEL_URL = '/models';
const BLINK_THRESHOLD = 0.25;

interface FaceAuthProps {
  mode: 'login' | 'register';
  onSuccess: (descriptor: Float32Array) => void;
  isDisabled?: boolean;
}

export function FaceAuth({ mode, onSuccess, isDisabled }: FaceAuthProps) {
  const [loading, setLoading] = React.useState<'models' | 'scanning' | 'processing' | null>('models');
  const [statusText, setStatusText] = React.useState('Loading models...');
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean>(true);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const blinkTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const detectionIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const loadModels = React.useCallback(async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setStatusText('Please grant camera access.');
    } catch (error) {
      console.error("Error loading models: ", error);
      setStatusText("Failed to load AI models.");
      toast({ variant: "destructive", title: "Model Load Error", description: "Could not load face recognition models. Please refresh the page." });
    }
  }, [toast]);

  const startVideo = React.useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasCameraPermission(true);
        setStatusText("Position your face in the center.");
        setLoading(null);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setHasCameraPermission(false);
      setStatusText("Camera access is required.");
      setLoading(null);
      toast({ variant: 'destructive', title: "Camera Access Denied", description: "Please enable camera permissions in your browser settings." });
    }
  }, [toast]);

  React.useEffect(() => {
    loadModels().then(startVideo);
    return () => {
        if(detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
        if(blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
    }
  }, [loadModels, startVideo]);

  const getEyeAspectRatio = (landmarks: faceapi.Point[]) => {
    const d = (p1: faceapi.Point, p2: faceapi.Point) => Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
    const v1 = d(landmarks[1], landmarks[5]);
    const v2 = d(landmarks[2], landmarks[4]);
    const h = d(landmarks[0], landmarks[3]);
    return (v1 + v2) / (2 * h);
  };
  
  const handleScan = () => {
    setLoading('scanning');
    setStatusText("Scanning... Hold still.");
    let blinked = false;

    detectionIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current) return;

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
                     await new Promise(res => setTimeout(res, 500)); // Give time for a clear image
                     
                     const finalDetection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

                     if (finalDetection) {
                         setStatusText(mode === 'register' ? 'Registration complete!' : 'Login successful!');
                         onSuccess(finalDetection.descriptor);
                     } else {
                         setStatusText("Capture failed. Please try again.");
                         setLoading(null);
                     }
                }
            } else {
                 setStatusText("Please blink to verify you're live.");
            }
        } else if (detections.length > 1) {
            setStatusText("Multiple faces detected. Please ensure only one person is visible.");
        } else {
             setStatusText("No face detected. Please position your face in the center.");
        }
    }, 200);
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

        {mode === 'register' ? (
             <Button onClick={handleScan} disabled={!hasCameraPermission || !!loading || isDisabled}>
                {loading === 'scanning' || loading === 'processing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                {loading === 'models' ? 'Loading Models...' : loading ? 'Scanning...' : 'Start Registration'}
            </Button>
        ) : (
            <Button onClick={handleScan} disabled={!hasCameraPermission || !!loading || isDisabled}>
                {loading === 'scanning' || loading === 'processing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                {loading === 'models' ? 'Loading Models...' : loading ? 'Verifying...' : 'Login with Face'}
            </Button>
        )}
    </div>
  );
}
