import { matchReply } from "@/mock/chat";
import type { ChatContext, ChatMessage } from "@/types";
import { uid } from "@/lib/utils";

/**
 * 模拟 AI 流式响应。
 * 使用 async generator 逐字返回内容，前端用 Typewriter 组件消费。
 *
 * 用法：
 *   for await (const chunk of streamReply(userText)) { ... }
 */
export async function* streamReply(
  userInput: string
): AsyncGenerator<{ content: string; done: boolean; context: ChatContext }> {
  const { reply, context } = matchReply(userInput);

  // 模拟首字延迟
  await new Promise((r) => setTimeout(r, 350 + Math.random() * 300));

  // 按 ~2-4 个字符一组返回，模拟真实打字节奏
  const chunkSize = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < reply.length; i += chunkSize) {
    const chunk = reply.slice(i, i + chunkSize);
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 25));
    yield { content: chunk, done: false, context };
  }
  yield { content: "", done: true, context };
}

// 一次性返回完整回复（用于历史回放或不需要流式时）
export function getReply(userInput: string): { content: string; context: ChatContext } {
  const { reply, context } = matchReply(userInput);
  return { content: reply, context };
}

export function makeMessage(
  sessionId: string,
  role: ChatMessage["role"],
  content: string,
  context?: ChatContext
): ChatMessage {
  return {
    id: uid("msg"),
    sessionId,
    role,
    content,
    context,
    tokens: Math.ceil(content.length / 2),
    createdAt: new Date().toISOString(),
  };
}
