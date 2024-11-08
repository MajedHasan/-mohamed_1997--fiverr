"use client";

import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { MainContent } from "@/components/MainContent";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useAuth } from "@/components/auth/AuthProvider";
import { PatientRecord } from "@/types/patient";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Home() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(
    null
  );
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { user, loading } = useAuth();

  const handleNewRecord = () => {
    setSelectedRecord(null);
    setTitle("");
    setAudioFile(null);
  };

  const handleRecordSelect = (record: PatientRecord) => {
    setSelectedRecord(record);
    setTitle(record.title);
  };

  // const handleSaveRecord = async (data: Partial<PatientRecord>) => {
  //   if (!user) return;

  //   try {
  //     let audioUrl = selectedRecord?.audioUrl;

  //     if (audioFile) {
  //       const storageRef = ref(
  //         storage,
  //         `audio/${Date.now()}_${audioFile.name}`
  //       );
  //       await uploadBytes(storageRef, audioFile);
  //       audioUrl = await getDownloadURL(storageRef);
  //     }

  //     const recordData = {
  //       ...data,
  //       title,
  //       audioUrl,
  //       updatedAt: Timestamp.now(),
  //       userId: user.uid,
  //     };

  //     if (selectedRecord?.id) {
  //       await updateDoc(doc(db, "records", selectedRecord.id), recordData);
  //     } else {
  //       await addDoc(collection(db, "records"), {
  //         ...recordData,
  //         createdAt: new Date().toISOString(),
  //       });
  //     }

  //     // Reset form
  //     handleNewRecord();
  //   } catch (error) {
  //     console.error("Error saving record:", error);
  //   }
  // };

  // const handleSaveRecord = async (data: Partial<PatientRecord>) => {
  //   if (!user) return;

  //   try {
  //     // Step 1: Upload audio file to Firebase Storage if provided
  //     let audioUrl = selectedRecord?.audioUrl;
  //     if (audioFile) {
  //       const storageRef = ref(
  //         storage,
  //         `audio/${user.uid}/${Date.now()}_${audioFile.name}`
  //       );
  //       await uploadBytes(storageRef, audioFile);
  //       audioUrl = await getDownloadURL(storageRef);
  //     }

  //     // Step 2: Send audio URL to API for transcription and summary
  //     const response = await fetch("/api/transcribe", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         audioUrl,
  //         patientName: data.name || "", // Optional field
  //         userId: user.uid,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Failed to process audio: ${response.statusText}`);
  //     }

  //     // Step 3: Retrieve transcript and summary from API response
  //     const { transcript, summary } = await response.json();

  //     // Step 4: Prepare data with title, audioUrl, transcript, summary, and timestamps
  //     const recordData = {
  //       ...data,
  //       title,
  //       audioUrl,
  //       transcript,
  //       summary,
  //       updatedAt: Timestamp.now(),
  //       userId: user.uid,
  //     };

  //     // Step 5: Save data to Firestore
  //     if (selectedRecord?.id) {
  //       // Update existing record
  //       await updateDoc(doc(db, "records", selectedRecord.id), recordData);
  //       console.log("Record updated successfully.");
  //     } else {
  //       // Add new record
  //       await addDoc(collection(db, "records"), {
  //         ...recordData,
  //         createdAt: new Date().toISOString(),
  //       });
  //       console.log("New record created successfully.");
  //     }

  //     // Step 6: Reset form
  //     handleNewRecord();
  //   } catch (error) {
  //     console.error("Error saving record:", error);
  //   }
  // };

  const handleSaveRecord = async (data: Partial<PatientRecord>) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Step 1: Upload audio file to Firebase Storage if provided
      let audioUrl = selectedRecord?.audioUrl;
      let transcript = selectedRecord?.transcript || "";
      let summary = selectedRecord?.summary || "";

      if (audioFile) {
        const storageRef = ref(
          storage,
          `audio/${user.uid}/${Date.now()}_${audioFile.name}`
        );
        await uploadBytes(storageRef, audioFile);
        audioUrl = await getDownloadURL(storageRef);
      }

      // Step 2: Conditionally send audio URL to API for transcription and summary (only for new records)
      if (!selectedRecord?.id) {
        // Only call the API to transcribe and summarize if this is a new record
        const response = await fetch("/api/transcribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audioUrl,
            patientName: data.name || "No Provided", // Optional field
            userId: user.uid,
            audioName: "default",
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to process audio: ${response.statusText}`);
        }

        // Step 3: Retrieve transcript and summary from API response for new records
        const { transcript: apiTranscript, summary: apiSummary } =
          await response.json();
        transcript = apiTranscript;
        summary = apiSummary;
      }

      // Step 4: Prepare data with title, audioUrl, transcript, summary, and timestamps
      const recordData = {
        ...data,
        title,
        audioUrl,
        transcript,
        summary,
        updatedAt: Timestamp.now(),
        userId: user.uid,
      };

      // Step 5: Save data to Firestore
      if (selectedRecord?.id) {
        // Update existing record
        await updateDoc(doc(db, "records", selectedRecord.id), recordData);
        console.log("Record updated successfully.");
      } else {
        // Add new record
        await addDoc(collection(db, "records"), {
          ...recordData,
          createdAt: new Date().toISOString(),
        });
        console.log("New record created successfully.");
      }

      // Step 6: Reset form
      handleNewRecord();
    } catch (error) {
      console.error("Error saving record:", error);
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {!user ? (
        <LoginDialog isOpen={true} onClose={() => {}} />
      ) : (
        <div className="flex flex-col h-screen">
          <Header
            title={title}
            onTitleChange={setTitle}
            onNewRecord={handleNewRecord}
            audioFile={audioFile}
            setAudioFile={setAudioFile}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              ref={sidebarRef} // Passing ref to Sidebar
              onRecordSelect={handleRecordSelect}
              onNewRecord={handleNewRecord}
              selectedRecord={selectedRecord}
              showMobile={showMobileSidebar}
              onMobileClose={() => setShowMobileSidebar(false)}
            />
            <MainContent
              selectedRecord={selectedRecord}
              audioFile={audioFile}
              onSave={handleSaveRecord}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </main>
  );
}
