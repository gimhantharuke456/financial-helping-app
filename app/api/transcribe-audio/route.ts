import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createReadStream } from "fs";
import formidable from "formidable";
import { promises as fs } from "fs";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a temporary file to work with OpenAI's API
    const tempFilePath = `/tmp/${Date.now()}-${file.name}`;
    await fs.writeFile(tempFilePath, buffer);

    // Create file stream
    const fileStream = createReadStream(tempFilePath);

    // Transcribe audio
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
      response_format: "json",
    });

    // Clean up the temporary file
    await fs.unlink(tempFilePath).catch(console.error);

    return NextResponse.json(
      {
        transcript: transcription.text,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error transcribing audio:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to transcribe audio",
      },
      { status: 500 }
    );
  }
}
