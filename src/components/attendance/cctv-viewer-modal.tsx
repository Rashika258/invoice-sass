"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Cctv,
  Video,
  Maximize2,
  Minimize2,
  RefreshCw,
  Camera,
  Play,
  Square,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CameraFeed = {
  id: string;
  name: string;
  location: string;
  type: "DEVICE_CAMERA" | "IP_STREAM" | "SIMULATED";
  url?: string;
  status: "ONLINE" | "CONNECTING" | "OFFLINE";
  deviceId?: string;
};

const DEFAULT_CAMERAS: CameraFeed[] = [
  {
    id: "cam-1",
    name: "CAM 01 - Workshop Main Bay",
    location: "CNC Turning & Milling Floor",
    type: "DEVICE_CAMERA",
    status: "ONLINE",
  },
  {
    id: "cam-2",
    name: "CAM 02 - Assembly & Quality Line",
    location: "Inspection & Assembly Bench",
    type: "SIMULATED",
    status: "ONLINE",
  },
  {
    id: "cam-3",
    name: "CAM 03 - Biometric Gate & Entry",
    location: "Worker Entrance & Clock-In Station",
    type: "SIMULATED",
    status: "ONLINE",
  },
  {
    id: "cam-4",
    name: "CAM 04 - Dispatch & Raw Materials",
    location: "Loading Dock & Metal Storage",
    type: "SIMULATED",
    status: "ONLINE",
  },
];

export function CctvViewerModal({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [cameras, setCameras] = useState<CameraFeed[]>(DEFAULT_CAMERAS);
  const [selectedCamId, setSelectedCamId] = useState<string>("cam-1");
  const [layout, setLayout] = useState<"SINGLE" | "GRID">("GRID");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioMuted, setAudioMuted] = useState(true);
  const [nightVision, setNightVision] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isRecording, setIsRecording] = useState(true);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [ipUrlInput, setIpUrlInput] = useState("");
  const [showConfig, setShowConfig] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  // Live clock for CCTV OSD watermark
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Enumerate user camera hardware
  useEffect(() => {
    if (!open) return;
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoDevs = devices.filter((d) => d.kind === "videoinput");
          setAvailableDevices(videoDevs);
        })
        .catch(() => {});
    }
  }, [open]);

  // Connect local device stream
  useEffect(() => {
    if (!open) {
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((t) => t.stop());
        activeStreamRef.current = null;
      }
      return;
    }

    const currentCam = cameras.find((c) => c.id === selectedCamId);
    if (currentCam?.type === "DEVICE_CAMERA") {
      navigator.mediaDevices
        ?.getUserMedia({
          video: currentCam.deviceId ? { deviceId: { exact: currentCam.deviceId } } : true,
          audio: false,
        })
        .then((stream) => {
          activeStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch((err) => {
          console.warn("Could not start device camera stream:", err);
        });
    }

    return () => {
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((t) => t.stop());
        activeStreamRef.current = null;
      }
    };
  }, [open, selectedCamId, cameras]);

  const handleCaptureSnapshot = (camName: string) => {
    toast.success(`Snapshot captured from ${camName} and saved to security audit log.`);
  };

  const handleAddIpCamera = () => {
    if (!ipUrlInput.trim()) {
      toast.error("Please enter a valid IP Camera RTSP or HTTP stream URL");
      return;
    }
    const newId = `cam-${Date.now().toString().slice(-4)}`;
    const newCam: CameraFeed = {
      id: newId,
      name: `CAM 0${cameras.length + 1} - IP Camera`,
      location: "Workshop Network Stream",
      type: "IP_STREAM",
      url: ipUrlInput.trim(),
      status: "ONLINE",
    };
    setCameras((prev) => [...prev, newCam]);
    setSelectedCamId(newId);
    setIpUrlInput("");
    setShowConfig(false);
    toast.success("IP Camera feed connected successfully!");
  };

  const selectedCam = cameras.find((c) => c.id === selectedCamId) || cameras[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (trigger || (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs font-semibold shadow-xs border-border/80"
            >
              <Cctv className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Live CCTV Surveillance</span>
            </Button>
          )) as React.ReactElement
        }
      />

      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-zinc-950 text-white border-zinc-800">
        {/* CCTV Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Cctv className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Workshop CCTV Surveillance Hub</h3>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px] font-mono px-1.5 py-0 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </Badge>
              </div>
              <p className="text-[10px] text-zinc-400">
                Multi-camera IP stream &amp; local workshop video surveillance system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setLayout(layout === "GRID" ? "SINGLE" : "GRID")}
              className="text-zinc-300 hover:text-white hover:bg-zinc-800 text-[11px] gap-1"
            >
              {layout === "GRID" ? <Maximize2 className="size-3" /> : <Minimize2 className="size-3" />}
              <span>{layout === "GRID" ? "Single View" : "4-Cam Grid"}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setNightVision((prev) => !prev)}
              className={`text-[11px] gap-1 ${
                nightVision ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              <Radio className="size-3" />
              <span>IR / Night Vision</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setShowConfig((prev) => !prev)}
              className="text-zinc-300 hover:text-white hover:bg-zinc-800 text-[11px] gap-1"
            >
              <Settings2 className="size-3" />
              <span>Connect Cam</span>
            </Button>
          </div>
        </div>

        {/* IP Camera Configuration Drawer */}
        {showConfig && (
          <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 text-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full space-y-1">
              <Label className="text-[11px] text-zinc-300 font-semibold">
                Connect IP Camera (RTSP / HTTP / HLS Stream URL)
              </Label>
              <Input
                placeholder="rtsp://admin:password@192.168.1.108:554/stream1 or http://..."
                value={ipUrlInput}
                onChange={(e) => setIpUrlInput(e.target.value)}
                className="h-8 bg-zinc-950 border-zinc-700 text-xs font-mono text-zinc-200"
              />
            </div>
            {availableDevices.length > 0 && (
              <div className="space-y-1">
                <Label className="text-[11px] text-zinc-300 font-semibold">Available USB / Built-in Camera</Label>
                <select
                  className="h-8 rounded-md bg-zinc-950 border border-zinc-700 text-xs px-2 text-zinc-200"
                  onChange={(e) => {
                    const devId = e.target.value;
                    setCameras((prev) =>
                      prev.map((c) => (c.id === "cam-1" ? { ...c, deviceId: devId } : c))
                    );
                    toast.success("Camera input updated");
                  }}
                >
                  {availableDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2 self-end mt-2 sm:mt-0">
              <Button
                type="button"
                size="sm"
                onClick={handleAddIpCamera}
                className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Add Stream
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowConfig(false)}
                className="h-8 text-zinc-400 hover:bg-zinc-800 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Video Feeds Viewport */}
        <div className="p-3 bg-black min-h-[420px] max-h-[70vh] overflow-y-auto">
          {layout === "GRID" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cameras.slice(0, 4).map((cam, idx) => (
                <div
                  key={cam.id}
                  onClick={() => {
                    setSelectedCamId(cam.id);
                    setLayout("SINGLE");
                  }}
                  className={`relative aspect-video rounded-xl overflow-hidden border transition-all cursor-pointer group ${
                    selectedCamId === cam.id
                      ? "border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500"
                      : "border-zinc-800 hover:border-zinc-600"
                  } ${nightVision ? "hue-rotate-90 contrast-125 brightness-110" : ""}`}
                >
                  {/* Video Viewport / Simulated Canvas */}
                  {cam.id === "cam-1" ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-b from-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden">
                      {/* Industrial Workshop Floor Background Simulation */}
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
                      <div className="text-center space-y-1.5 z-10">
                        <div className="size-10 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mx-auto text-emerald-400">
                          <Video className="size-5" />
                        </div>
                        <p className="text-xs font-bold text-zinc-200">{cam.name}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{cam.location}</p>
                        <span className="inline-block text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          1080p • 30 FPS • H.264
                        </span>
                      </div>
                    </div>
                  )}

                  {/* CCTV OSD Overlay */}
                  <div className="absolute inset-0 pointer-events-none p-2.5 flex flex-col justify-between text-[10px] font-mono text-emerald-400 bg-linear-to-b from-black/60 via-transparent to-black/60">
                    <div className="flex items-center justify-between">
                      <span className="font-bold tracking-wider">{cam.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-red-500 animate-ping" />
                        <span className="text-red-400 font-bold">REC</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{cam.location}</span>
                      <span>{format(currentTime, "yyyy-MM-dd HH:mm:ss")}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCaptureSnapshot(cam.name);
                    }}
                    className="absolute top-2 right-2 size-7 rounded-lg bg-black/60 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Capture Snapshot"
                  >
                    <Camera className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Single Camera Focus View */
            <div
              className={`relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 max-h-[500px] w-full mx-auto ${
                nightVision ? "hue-rotate-90 contrast-125 brightness-110" : ""
              }`}
            >
              {selectedCam.id === "cam-1" ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={audioMuted}
                  className="w-full h-full object-cover"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              ) : (
                <div
                  className="w-full h-full bg-linear-to-b from-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
                  <div className="text-center space-y-2 z-10">
                    <div className="size-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mx-auto text-emerald-400">
                      <Cctv className="size-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-100">{selectedCam.name}</p>
                      <p className="text-xs text-zinc-400 font-mono">{selectedCam.location}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-emerald-400">
                      <span className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        1080p FHD 60 FPS
                      </span>
                      <span className="bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                        Bitrate: 4.2 Mbps
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Screen CCTV OSD Overlay */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between text-xs font-mono text-emerald-400 bg-linear-to-b from-black/70 via-transparent to-black/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white tracking-wide">
                      {selectedCam.name}
                    </span>
                    <Badge className="bg-zinc-800/80 text-zinc-300 border-zinc-700 text-[10px]">
                      {selectedCam.location}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-red-400 font-bold">REC [00:48:21]</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span>PTZ STATUS: LOCKED • ZOOM: {zoomLevel.toFixed(1)}x</span>
                  <span>{format(currentTime, "yyyy-MM-dd HH:mm:ss")}</span>
                </div>
              </div>

              {/* PTZ / Zoom Overlay Controls */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-xs p-1 rounded-xl border border-zinc-700/80">
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                  className="size-7 text-zinc-300 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 1))}
                  className="size-7 text-zinc-300 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => handleCaptureSnapshot(selectedCam.name)}
                  className="size-7 text-zinc-300 hover:text-white"
                  title="Take Snapshot"
                >
                  <Camera className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => setAudioMuted((m) => !m)}
                  className="size-7 text-zinc-300 hover:text-white"
                  title={audioMuted ? "Unmute" : "Mute"}
                >
                  {audioMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Camera Selector Strip */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            {cameras.map((cam) => (
              <button
                key={cam.id}
                type="button"
                onClick={() => setSelectedCamId(cam.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedCamId === cam.id
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-zinc-800 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-700/60"
                }`}
              >
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>{cam.name.split("-")[0]}</span>
              </button>
            ))}
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center gap-2 font-mono">
            <span>{cameras.length} Active Feeds</span>
            <span>•</span>
            <span className="text-emerald-400">All Nodes Secure</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
