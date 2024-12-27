import { assistantId } from "./../../../assistant-config";
import { openai } from "@/app/openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Get assistant configuration
export async function GET() {
  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    return NextResponse.json(assistant);
  } catch (error) {
    console.error("Error fetching assistant:", error);
    return NextResponse.json(
      { error: "Failed to fetch assistant configuration" },
      { status: 500 }
    );
  }
}

// Update assistant configuration
export async function PATCH(request: Request) {
  try {
    const { name, instructions, model } = await request.json();
    const assistant = await openai.beta.assistants.update(assistantId, {
      name,
      instructions,
      model,
      tools: [
        { type: "code_interpreter" },
        { type: "file_search" },
        {
          type: "function",
          function: {
            name: "downloadPDF",
            description: "Download the generated Report",
            parameters: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "The URL for the PDF to download",
                },
                outputPath: {
                  type: "string",
                  description: "The path to save the downloaded PDF",
                },
              },
              required: ["url", "outputPath"],
            },
          },
        },
      ],
    });
    return NextResponse.json(assistant);
  } catch (error) {
    console.error("Error updating assistant:", error);
    return NextResponse.json(
      { error: "Failed to update assistant configuration" },
      { status: 500 }
    );
  }
}
