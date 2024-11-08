// audioUtils.ts
export async function getAudioBlob(
  audioUrl: string,
  audioName: string
): Promise<{ blob: Blob; fileName: string }> {
  const response = await fetch(audioUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch audio file from URL");
  }

  // Get the content type of the response to determine the file extension
  const contentType = response.headers.get("Content-Type");
  const extension = contentType?.includes("audio/mpeg")
    ? ".mp3"
    : contentType?.includes("audio/wav")
    ? ".wav"
    : ".mp3"; // Default to .mp3 if unknown

  // Generate the filename based on the provided audio name
  const fileName = `${audioName}${extension}`;

  return { blob: await response.blob(), fileName };
}
