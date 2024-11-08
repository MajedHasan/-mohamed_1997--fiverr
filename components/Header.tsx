"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Plus, Upload } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { SettingsDialog } from "@/components/SettingsDialog";
import { AudioRecorder } from "@/components/AudioRecorder";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface HeaderProps {
  title: string;
  onTitleChange: (value: string) => void;
  onNewRecord: () => void;
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
}

export function Header({
  title,
  onTitleChange,
  onNewRecord,
  setAudioFile,
}: HeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
    } else {
      alert("Please select an audio file");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <header className="p-4 border-b border-zinc-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between max-w-[1920px] mx-auto gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xs text-zinc-400">
                {user?.photoURL || "N/A"}
              </h1>
              <h2 className="text-lg font-semibold">
                Dr. {user?.displayName || "N/A"}
              </h2>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="bg-zinc-900 border-zinc-800"
              onClick={onNewRecord}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-zinc-900 border-zinc-800"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4 flex-1 max-w-3xl">
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white"
              placeholder="Enter title"
              id="title"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/*"
              className="hidden"
            />
            <Button
              variant="outline"
              className="bg-zinc-900 border-zinc-800 flex-1 md:flex-none"
              onClick={handleUploadClick}
            >
              <Upload className="h-4 w-4 mr-2" />
              UPLOAD
            </Button>
            <Button
              onClick={() => setIsRecorderOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 flex-1 md:flex-none"
            >
              RECORD
            </Button>
          </div>
        </div>
      </header>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      <Dialog open={isRecorderOpen} onOpenChange={setIsRecorderOpen}>
        <DialogContent className="bg-zinc-950 text-white">
          <AudioRecorder
            onRecordingComplete={(file) => {
              setAudioFile(file);
              setIsRecorderOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
