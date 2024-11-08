"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Pause, Play, Square } from "lucide-react";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";

interface AudioRecorderProps {
  onRecordingComplete: (file: File) => void;
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [waveform, setWaveform] = useState<number[]>([]);
  const {
    isRecording,
    isPaused,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useMediaRecorder({
    onDataAvailable: (blob) => {
      const file = new File([blob], "recording.wav", { type: "audio/wav" });
      onRecordingComplete(file);
    },
  });

  useEffect(() => {
    if (isRecording && !isPaused) {
      const interval = setInterval(() => {
        setWaveform((prev) => [...prev, Math.random() * 100]);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRecording, isPaused]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Mic className="h-4 w-4 mr-2" />
            Record
          </Button>
        ) : (
          <>
            <Button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isPaused ? (
                <Play className="h-4 w-4 mr-2" />
              ) : (
                <Pause className="h-4 w-4 mr-2" />
              )}
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button
              onClick={stopRecording}
              className="bg-red-500 hover:bg-red-600"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
            <span className="text-sm text-zinc-400">
              {formatDuration(duration)}
            </span>
          </>
        )}
      </div>

      {isRecording && (
        <div className="h-24 bg-zinc-900 rounded-lg p-4 flex items-center">
          <div className="flex-1 flex items-center gap-0.5">
            {waveform.map((height, i) => (
              <div
                key={i}
                className="w-1 bg-blue-500"
                style={{
                  height: `${height}%`,
                  opacity: isPaused ? 0.5 : 1,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
