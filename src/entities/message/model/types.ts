export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  isOutgoing: boolean;
  /** Unix-время в секундах. */
  timestamp: number;
}
