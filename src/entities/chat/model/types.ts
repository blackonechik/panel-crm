import type { Client } from '../../client/model/types';
import type { Lead } from '../../lead/model/types';

export type ChatListItem = {
  id: string;
  channel: 'TELEGRAM' | 'MAX';
  externalChatId: string;
  status: string;
  mode: string;
  conversationState: string;
  priority: string;
  isUrgent: boolean;
  tags: string[];
  lastUserMessageAt: string | null;
  lastBotMessageAt: string | null;
  updatedAt: string;
  client: Client;
  assignedUser: { id: string; name: string; email: string } | null;
  _count: { messages: number };
};

export type ChatMessage = {
  id: string;
  chatId: string;
  direction: 'INBOUND' | 'OUTBOUND' | 'INTERNAL';
  text: string;
  channelMessageId: string | null;
  metadata: unknown;
  createdAt: string;
  senderUserId: string | null;
  senderClientId: string | null;
};

export type ChatDetail = ChatListItem & {
  messages: ChatMessage[];
  internalNotes: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; name: string };
  }>;
  lead: Lead | null;
};
