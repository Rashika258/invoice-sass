import { NextRequest, NextResponse } from "next/server";
import { parseBillWithAI } from "@/lib/ai-ocr";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, base64Data } = body;

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }

    const result = await parseBillWithAI(fileName, base64Data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("AI Bill OCR Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process image scan" },
      { status: 500 }
    );
  }
}
