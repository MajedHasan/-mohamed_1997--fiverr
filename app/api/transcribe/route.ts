import { NextRequest, NextResponse } from "next/server";
import { getAudioBlob } from "@/lib/audioUtils";

export const dynamic = "force-dynamic"; // Force dynamic rendering

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY as string;

async function transcribeAudio(
  audioUrl: string,
  audioName: string = "audio"
): Promise<string> {
  const { blob, fileName } = await getAudioBlob(audioUrl, audioName);

  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("model", "whisper-1");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("OpenAI API Error:", errorData);
    throw new Error("Failed to transcribe audio");
  }

  const data = await response.json();
  return data.text;
}

async function generateSummary(
  transcript: string,
  patientName: string,
  visitDate: string
): Promise<string> {
  // const summaryPrompt = `
  //   You are a medical assistant summarizing a doctor's visit.
  //   **Transcript:** ${transcript}
  //   **Patient Name:** ${patientName || "NOT PROVIDED"}
  //   **Date of Visit:** ${visitDate}
  //   **Primary Complaint:** Based on audio recording
  //   **Doctor:** DR. VICTOR DOOM
  //   **Notes:** Summarize key points.
  //   **Action Points:**
  //   - Follow-up in 2 weeks.
  //   - List any medication.
  // `;
  const summaryPrompt = `
    Role: You are a medical scribe assistant. Your task is to generate a structured medical chart based on a patient's interaction, formatted in Markdown for display with Tailwind CSS. The chart should be organized into the following sections:

    Instructions:
  Focus on Relevant Information:
  - Concentrate on the patient's reason for the visit.
  - Exclude irrelevant details such as family vacations or unrelated personal events unless they are contributing to the patient's stress or affecting their health.

  Avoid Common Mistakes:
  - Spelling: Ensure all medications and medical terms are spelled correctly.
  - Repetition: Do not repeat information unnecessarily from the conversation.
  - Use bullet points for readability.

  Critical Thinking:
  - Before charting each section, consider the context and significance of the information.
  - Determine what is essential for the patient's medical record.

  Formatting Instructions:
  - Use **Markdown** syntax.
  - Use H2 (##) for main section titles and H3 (###) for sub-sections.
  - Use **bold** for important terms, and bullet points for lists.
  - Keep the format concise and structured for readability with Tailwind CSS.

  Chart Organization:
  ## History of Present Illness (HPI)
  - Provide a brief overview of why the patient is following up.
  - Include bullet points for symptoms, duration, and factors affecting their condition.

  ## Physical Examination
  - Organize findings by system (e.g., **General**, **HEENT**, **LUNGS**).
  - Note any abnormalities and normal findings.

  ## Plan
  - Outline the treatment and management plan, including medications, education, and follow-up.
  - Use bullet points to list each item clearly.

  Note: This is a test. If no patient interaction or information is provided, create a demo chart to illustrate the format.
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: summaryPrompt },
        { role: "user", content: transcript },
      ],
      max_tokens: 300,
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error in summary generation:", errorData);
    throw new Error("Failed to generate summary");
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export async function POST(req: NextRequest) {
  try {
    const { audioUrl, patientName, userId, audioName } = await req.json();

    if (!audioUrl || !userId) {
      return NextResponse.json(
        { error: "audioUrl and userId are required" },
        { status: 400 }
      );
    }

    const transcript = await transcribeAudio(audioUrl, audioName);
    const summary = await generateSummary(
      transcript,
      patientName,
      new Date().toLocaleDateString()
    );

    return NextResponse.json({
      success: true,
      transcript,
      summary,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error processing audio:", error.message);
      return NextResponse.json(
        { error: error.message || "Error processing audio" },
        { status: 500 }
      );
    } else {
      console.error("Unexpected error:", error);
      return NextResponse.json(
        { error: "Unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
