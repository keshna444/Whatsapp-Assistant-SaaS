export type MessageSender = 'user' | 'bot';

export type Message = {
  _id?: string;
  text: string;
  sender: MessageSender;
  createdAt?: string;
  time?: string;
};

export type ConversationStatus = 'ai_active' | 'human_needed';

export type Conversation = {
  _id: string;
  phone: string;
  name?: string;
  lastMessage: string;
  status: ConversationStatus;
  unread: number;
  updatedAt: string;
  messages?: Message[];
};

export type SendMessageResponse = {
  reply: string;
  userMessage: Message;
  botMessage: Message;
};
