import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, CameraOff, Scan } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LiveScanner({ onScan, isActive, setIsActive }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [lastScan, setLastScan] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',  // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError("");
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions.");
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || isProcessing) return;

    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // For demo purposes, generate a mock QR code scan
    // In production, you would use a QR code library like jsQR
    const mockQRData = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setTimeout(() => {
      if (mockQRData !== lastScan) {
        setLastScan(mockQRData);
        onScan(mockQRData);
      }
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <CameraOff className="w-16 h-16 mx-auto mb-4" />
              <p>Camera not active</p>
            </div>
          </div>
        )}
        
        {/* Scanning Overlay */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-4 border-green-500 border-dashed rounded-lg animate-pulse">
              <div className="w-full h-full flex items-center justify-center">
                <Scan className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => setIsActive(!isActive)}
          variant={isActive ? "destructive" : "default"}
          className="flex-1 py-3 text-lg"
        >
          {isActive ? (
            <>
              <CameraOff className="w-5 h-5 mr-2" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="w-5 h-5 mr-2" />
              Start Camera
            </>
          )}
        </Button>

        <Button
          onClick={captureFrame}
          disabled={!isActive || isProcessing}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
        >
          {isProcessing ? (
            "Processing..."
          ) : (
            <>
              <Scan className="w-5 h-5 mr-2" />
              Manual Scan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}