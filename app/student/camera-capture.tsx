"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type CameraCaptureProps = {
  onCapture: (file: File) => void;
};

type CameraStatus = "idle" | "starting" | "ready" | "unsupported" | "blocked";

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [cameraMessage, setCameraMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleStartCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("unsupported");
      setCameraMessage("This browser does not support direct camera capture.");
      return;
    }

    setCameraStatus("starting");
    setCameraMessage("Opening camera...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraStatus("ready");
      setCameraMessage("Camera ready. Capture a clear photo of the homework.");
    } catch {
      stopCamera();
      setCameraStatus("blocked");
      setCameraMessage("Camera permission was blocked or no camera was found.");
    }
  }

  function handleCaptureImage() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || cameraStatus !== "ready") {
      setCameraMessage("Open the camera before capturing an image.");
      return;
    }

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraMessage("Unable to capture the camera image.");
          return;
        }

        const file = new File([blob], `camera-homework-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        setPreviewUrl(URL.createObjectURL(file));
        setCameraMessage("Camera image captured and ready for OCR grading.");
        onCapture(file);
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-emerald-100 bg-slate-950">
        {cameraStatus === "ready" || cameraStatus === "starting" ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="aspect-video w-full bg-slate-950 object-cover"
          />
        ) : previewUrl ? (
          <Image
            src={previewUrl}
            alt="Captured homework preview"
            width={1280}
            height={720}
            unoptimized
            className="aspect-video w-full bg-slate-950 object-cover"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center px-6 text-center text-sm font-medium text-slate-200">
            Camera preview will appear here.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleStartCamera}
          disabled={cameraStatus === "starting"}
          className="flex h-11 items-center justify-center rounded-md border border-emerald-700 bg-white px-4 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:border-emerald-200 disabled:text-emerald-300"
        >
          {cameraStatus === "starting" ? "Opening..." : "Open Camera"}
        </button>
        <button
          type="button"
          onClick={handleCaptureImage}
          disabled={cameraStatus !== "ready"}
          className="flex h-11 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          Capture Image
        </button>
        {cameraStatus === "ready" ? (
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setCameraStatus("idle");
              setCameraMessage("Camera closed.");
            }}
            className="flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
          >
            Close Camera
          </button>
        ) : null}
      </div>

      <p role="status" aria-live="polite" className="min-h-6 text-sm text-slate-600">
        {cameraMessage}
      </p>

      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
}
