"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientInfo } from "@/components/PatientInfo";
import { PatientRecord } from "@/types/patient";

interface MainContentProps {
  selectedRecord: PatientRecord | null;
  audioFile: File | null;
  onSave: (data: Partial<PatientRecord>) => Promise<void>;
}

export function MainContent({
  selectedRecord,
  audioFile,
  onSave,
}: MainContentProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioFile]);

  return (
    <div className="flex-1 overflow-hidden">
      <Tabs defaultValue="summary" className="h-full">
        <TabsList className="w-full justify-start bg-zinc-900 border-b border-zinc-800 rounded-none h-12">
          <TabsTrigger
            value="summary"
            className="flex-1 data-[state=active]:bg-zinc-800"
          >
            SUMMARY
          </TabsTrigger>
          <TabsTrigger
            value="transcript"
            className="flex-1 data-[state=active]:bg-zinc-800"
          >
            TRANSCRIPT
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="flex-1 data-[state=active]:bg-zinc-800"
          >
            FILES
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="summary"
          className="p-4 m-0 h-[calc(100%-3rem)] overflow-auto"
        >
          <PatientInfo selectedRecord={selectedRecord} onSave={onSave} />
        </TabsContent>

        <TabsContent
          value="transcript"
          className="p-4 m-0 h-[calc(100%-3rem)] overflow-auto"
        >
          {selectedRecord?.transcript ? (
            <div className="font-mono whitespace-pre-wrap">
              {selectedRecord.transcript}
            </div>
          ) : (
            <div className="text-zinc-500 text-center mt-8">
              No transcript available
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="files"
          className="p-4 m-0 h-[calc(100%-3rem)] overflow-auto"
        >
          {selectedRecord?.audioUrl || audioUrl ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Audio Recording</h3>
              <audio
                controls
                className="w-full"
                src={selectedRecord?.audioUrl || audioUrl || undefined}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <div className="text-zinc-500 text-center mt-8">
              No audio files available
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
