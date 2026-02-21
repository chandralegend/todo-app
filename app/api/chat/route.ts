import { streamText, convertToModelMessages, UIMessage, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { auth } from "@/lib/auth";
import { getSystemPrompt } from "@/lib/ai/system-prompt";
import { buildTools } from "@/lib/ai/tools";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = (await req.json()) as { messages: UIMessage[] };

  const userId = session.user.id;
  const userName = session.user.name ?? "User";
  const tools = buildTools(userId);

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: getSystemPrompt(userName),
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(5),
    onError: (error) => {
      console.error("AI chat error:", error);
    },
  });

  return result.toUIMessageStreamResponse();
}
