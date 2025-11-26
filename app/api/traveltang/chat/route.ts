import { getUserUuid } from "@/services/user";
import { getUserCredits, decreaseCredits, CreditsTransType } from "@/services/credit";
import { respData, respErr } from "@/lib/resp";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getFirstPaidOrderByUserUuid } from "@/models/order";

const CHAT_COST = 5; // Cost in credits per chat message

const SYSTEM_PROMPT = `You are TravelTang, a helpful AI assistant specializing in China travel advice for international tourists. 

Your role is to provide accurate, practical, and friendly guidance about:
- Travel planning and itineraries in China
- Transportation (trains, flights, buses, subways)
- Accommodation recommendations
- Food and dining recommendations
- Cultural etiquette and customs
- Payment methods (Alipay, WeChat Pay, cash)
- Tourist attractions and activities
- Language tips and communication
- Visa and documentation requirements
- Safety and emergency information

Always be:
- Friendly and welcoming
- Clear and concise
- Culturally sensitive
- Practical and actionable
- Honest about limitations

If you don't know something, admit it and suggest where they might find the information.`;

export async function POST(req: Request) {
  try {
    // The useChat hook sends messages array in the request body
    const { messages: chatMessages } = await req.json();

    if (!Array.isArray(chatMessages) || chatMessages.length === 0) {
      return respErr("invalid messages");
    }

    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return respErr("no auth, please sign-in");
    }

    // Check if user has paid order
    const paid_order = await getFirstPaidOrderByUserUuid(user_uuid);
    if (!paid_order) {
      return respErr("please purchase a plan first");
    }

    // Check credits
    const userCredits = await getUserCredits(user_uuid);
    if (userCredits.left_credits < CHAT_COST) {
      return respErr("insufficient credits");
    }

    // Build conversation messages with system prompt
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chatMessages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Use OpenAI model (you can change this to other providers)
    const model = openai(process.env.OPENAI_MODEL || "gpt-4o-mini");

    // Stream the response
    const result = await streamText({
      model,
      messages,
      maxTokens: 1000,
      temperature: 0.7,
    });

    // Deduct credits after successful response start
    // Note: In a production system, you might want to deduct credits after the full response
    // For now, we'll deduct immediately
    try {
      await decreaseCredits({
        user_uuid,
        trans_type: CreditsTransType.ChatMessage,
        credits: CHAT_COST,
      });
    } catch (creditError) {
      console.log("Failed to deduct credits:", creditError);
      // Continue with response even if credit deduction fails
      // (you might want to handle this differently in production)
    }

    return result.toDataStreamResponse();
  } catch (e: any) {
    console.log("chat failed: ", e);
    return respErr("chat failed: " + e.message);
  }
}

