import { NextRequest, NextResponse } from "next/server";
import { getAudioBlob } from "@/lib/audioUtils"; // Import the utility function to get the audio file

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY as string;

// Function to transcribe audio using OpenAI Whisper API
async function transcribeAudio(
  audioUrl: string,
  audioName: string
): Promise<string> {
  // Step 1: Download the audio file from the URL and get the Blob and fileName
  const { blob, fileName } = await getAudioBlob(audioUrl, audioName);

  // Step 2: Create the FormData to send with the audio file
  const formData = new FormData();
  formData.append("file", blob, fileName); // Use the dynamic filename
  formData.append("model", "whisper-1");

  // Step 3: Call OpenAI API to transcribe the audio
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

// Function to generate a summary using GPT

// Function to generate a summary using GPT
async function generateSummary(
  transcript: string,
  patientName: string,
  visitDate: string
): Promise<string> {
  const summaryPrompt = `
    You are a medical assistant summarizing a doctor's visit from the following transcript. Use the format below:
    **Transcript:** ${transcript}
    **Patient Name:** ${patientName || "NOT PROVIDED"}
    **Date of Visit:** ${visitDate}
    **Primary Complaint:** Based on audio recording
    **Doctor:** DR. VICTOR DOOM
    **Notes:**
    Summarize the key points from the transcript here.
    **Action Points:**
    - **Follow-up required:** Schedule follow-up in 2 weeks.
    - **Medication prescribed:** List medications as discussed in the transcript.
  `;

  // Now using the v1/chat/completions endpoint
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4", // Use gpt-4 chat model
      messages: [
        {
          role: "system",
          content: "You are a helpful medical assistant.",
        },
        {
          role: "user",
          content: summaryPrompt,
        },
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
  return data.choices[0].message.content.trim(); // Return the summary from the model
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { audioUrl, patientName, userId, audioName } = await req.json();

    if (!audioUrl || !userId) {
      return NextResponse.json(
        { error: "audioUrl and userId are required" },
        { status: 400 }
      );
    }

    // Step 1: Transcribe the audio using OpenAI Whisper
    const transcript = await transcribeAudio(audioUrl, audioName);

    // Debugging the transcription result
    console.log("Transcription result:", transcript);

    // Step 2: Generate a summary with GPT
    const summary = await generateSummary(
      transcript,
      patientName,
      new Date().toLocaleDateString()
    );

    // Return response with transcript and summary
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
