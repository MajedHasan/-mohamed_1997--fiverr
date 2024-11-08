export interface PatientRecord {
  id: string;
  name: string;
  date: string;
  time?: string;
  title: string;
  description: string;
  patientAge?: string;
  visitDate?: string;
  summary?: string;
  transcript?: string;
  audioUrl?: string;
}
