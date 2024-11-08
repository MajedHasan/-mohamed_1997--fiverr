"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { PatientRecord } from "@/types/patient";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface PatientInfoProps {
  selectedRecord: PatientRecord | null;
  onSave: (data: Partial<PatientRecord>) => void;
  isSubmitting: Boolean;
}

export function PatientInfo({
  selectedRecord,
  onSave,
  isSubmitting,
}: PatientInfoProps) {
  const [patientName, setPatientName] = useState(selectedRecord?.name || "");
  const [patientAge, setPatientAge] = useState(
    selectedRecord?.patientAge || ""
  );
  const [visitDate, setVisitDate] = useState<Date | undefined>(
    selectedRecord?.visitDate ? new Date(selectedRecord.visitDate) : undefined
  );
  const [summary, setSummary] = useState(selectedRecord?.summary || "");

  useEffect(() => {
    if (selectedRecord) {
      setPatientName(selectedRecord.name);
      setPatientAge(selectedRecord.patientAge || "");
      setVisitDate(
        selectedRecord.visitDate
          ? new Date(selectedRecord.visitDate)
          : undefined
      );
      setSummary(selectedRecord.summary || "");
    } else {
      setPatientName("");
      setPatientAge("");
      setVisitDate(undefined);
      setSummary("");
    }
  }, [selectedRecord]);

  const handleSubmit = () => {
    onSave({
      name: patientName,
      patientAge,
      visitDate: visitDate?.toISOString(),
      summary,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-400">PATIENT NAME</label>
            <button className="text-sm text-blue-500 hover:underline">
              IMPORT?
            </button>
          </div>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
            placeholder="Enter patient name"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-zinc-400">PATIENT AGE</label>
          <input
            type="number"
            value={patientAge}
            onChange={(e) => setPatientAge(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
            placeholder="Enter patient age"
            min="0"
            max="150"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-zinc-400">VISIT DATE</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-zinc-900 border-zinc-800",
                  !visitDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {visitDate ? (
                  format(visitDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={visitDate}
                onSelect={setVisitDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="prose prose-sm text-white bg-black p-4 rounded-md shadow-md markdown-custom">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          className="bg-blue-500 hover:bg-blue-600"
          onClick={handleSubmit}
          disabled={isSubmitting ? true : false}
        >
          {isSubmitting
            ? "Loading..."
            : selectedRecord
            ? "Update Record"
            : "Save Record"}
        </Button>
      </div>
    </div>
  );
}
