"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";
import { PatientRecord } from "@/types/patient";

interface PatientListProps {
  onRecordSelect: (record: PatientRecord) => void;
  selectedRecord: PatientRecord | null;
  searchQuery: string;
}

export function PatientList({
  onRecordSelect,
  selectedRecord,
  searchQuery,
}: PatientListProps) {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "records"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as PatientRecord)
      );
      setRecords(records);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredRecords = records.filter((record) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      record.name?.toLowerCase().includes(searchLower) ||
      record.title?.toLowerCase().includes(searchLower) ||
      record.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex-1 overflow-auto">
      {filteredRecords.map((record) => (
        <div
          key={record.id}
          className={`p-4 border-b border-zinc-800 hover:bg-zinc-900 cursor-pointer ${
            selectedRecord?.id === record.id ? "bg-zinc-800" : ""
          }`}
          onClick={() => onRecordSelect(record)}
        >
          <div className="flex justify-between items-start mb-1">
            <span className="font-medium">{record.name}</span>
            <span className="text-sm text-zinc-400">
              {record.date || record.time}
            </span>
          </div>
          {record.title && (
            <h3 className="text-sm font-medium mb-1">{record.title}</h3>
          )}
          <p className="text-sm text-zinc-400">{record.description}</p>
        </div>
      ))}
    </div>
  );
}
