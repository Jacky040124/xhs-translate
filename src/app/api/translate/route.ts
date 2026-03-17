import { NextRequest, NextResponse } from "next/server";
import { translate } from "@/lib/deepseek";
import { getStyleById } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { text, style } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: "Text too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    const styleOption = getStyleById(style || "standard");
    if (!styleOption) {
      return NextResponse.json({ error: "Invalid style" }, { status: 400 });
    }

    const result = await translate({
      text: text.trim(),
      systemPrompt: styleOption.prompt,
    });

    return NextResponse.json({ result, style: styleOption.id });
  } catch (error) {
    console.error("Translate error:", error);
    return NextResponse.json(
      { error: "Translation failed. Please try again." },
      { status: 500 }
    );
  }
}
