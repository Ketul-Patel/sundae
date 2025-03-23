'use server';

import { generateText, Message } from 'ai';

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import { openai } from '@ai-sdk/openai';

export async function saveChatModelAsCookie(model: string) {
  // const cookieStore = await cookies();
  // cookieStore.set('chat-model', model);
  
  // replace with localstorage
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
  console.log("generating title");

  if(message.content.length > 20) {
    return message.content.slice(0, 20) + "...";
  } else {
    return message.content;
  }
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
}: {
  chatId: string;
}) {
  await updateChatVisiblityById({ chatId, visibility: 'public' });
}
