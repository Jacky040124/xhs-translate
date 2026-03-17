const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface TranslateOptions {
  text: string;
  systemPrompt: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function translate({
  text,
  systemPrompt,
}: TranslateOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://rednote-translate.vercel.app",
      "X-Title": "RedNote Translate",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data: OpenRouterResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}
