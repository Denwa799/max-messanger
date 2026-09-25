import { z } from 'zod';

export const sendMessageResponseSchema = z.object({
  idMessage: z.string(),
});

/**
 * Чат из ответа GetChats. Ответ может расширяться новыми полями, поэтому схема
 * объектная (лишние поля отбрасываются), но без `looseObject` — состав полей чата стабилен.
 */
export const chatSchema = z.object({
  chatId: z.string(),
  name: z.string(),
  type: z.enum(['user', 'group', 'channel', 'bot']),
  /** Номер телефона контакта или 0, если он скрыт либо чат является группой. */
  phoneNumber: z.number(),
});

export const getChatsResponseSchema = z.array(chatSchema);

/** Ответ CheckAccount. `chatId` приходит только при `exist: true`. */
export const checkAccountResponseSchema = z.object({
  exist: z.boolean(),
  chatId: z.string().optional(),
});

/**
 * Контакт из ответа GetContacts. `name` может быть пустой строкой, если с контактом
 * ещё не было входящей переписки, поэтому отображаемое имя берётся из `contactName`.
 */
export const contactSchema = z.object({
  chatId: z.string(),
  name: z.string(),
  contactName: z.string(),
  type: z.string(),
  phoneNumber: z.number(),
});

export const getContactsResponseSchema = z.array(contactSchema);

/**
 * Сообщение из GetChatHistory. Пока работаем только с текстом, поэтому берём лишь поля,
 * нужные для текстовых сообщений, а неизвестные ключи (медиа, опросы, гео, реакции и т.п.)
 * отбрасываем — так ответ разбирается даже если MAX добавит новые типы сообщений.
 */
export const chatMessageSchema = z.looseObject({
  type: z.enum(['incoming', 'outgoing']),
  idMessage: z.string(),
  timestamp: z.number(),
  typeMessage: z.string(),
  chatId: z.string(),
  chatType: z.enum(['user', 'group', 'channel', 'bot']).optional(),
  statusMessage: z.string().optional(),
  sendByApi: z.boolean().optional(),
  senderId: z.string().optional(),
  senderName: z.string().optional(),
  senderType: z.string().optional(),
  senderContactName: z.string().optional(),
  textMessage: z.string().optional(),
});

export const getChatHistoryResponseSchema = z.array(chatMessageSchema);

const notificationInstanceDataSchema = z.object({
  idInstance: z.number(),
  wid: z.string(),
  typeInstance: z.string(),
});

const notificationSenderDataSchema = z.object({
  chatId: z.string(),
  chatName: z.string().optional(),
  chatType: z.string().optional(),
  sender: z.string().optional(),
  senderName: z.string().optional(),
  senderType: z.string().optional(),
  senderContactName: z.string().optional(),
  senderPhoneNumber: z.number().optional(),
});

/**
 * Тело `messageData` уведомления. Кроме обычного текста сюда приходят удаление, редактирование
 * и цитата: у каждого свой объект-спутник, а `typeMessage` говорит, какой именно. Наличие всех
 * полей сразу не предполагается, поэтому все они опциональны.
 */
const notificationMessageDataSchema = z.looseObject({
  /** textMessage / extendedTextMessage — обычное, editedMessage — правка, deletedMessage — удаление, quotedMessage — цитата. */
  typeMessage: z.string().optional(),
  textMessageData: z.looseObject({ textMessage: z.string() }).optional(),
  /** Текст сообщения с цитатой (`quotedMessage`). */
  extendedTextMessageData: z.looseObject({ text: z.string() }).optional(),
  /** `stanzaId` — id удалённого сообщения. */
  deletedMessageData: z.looseObject({ stanzaId: z.string() }).optional(),
  /** `stanzaId` — id отредактированного сообщения, `textMessage` — его новый текст. */
  editedMessageData: z.looseObject({ stanzaId: z.string(), textMessage: z.string() }).optional(),
});

/**
 * Входящее уведомление. Набор `typeWebhook` постоянно расширяется, поэтому схема
 * принимает неизвестные поля и не падает на новых типах уведомлений, иначе потеряли бы
 * уведомление, не подтвердив его удаление.
 */
export const incomingNotificationSchema = z.looseObject({
  typeWebhook: z.string(),
  instanceData: notificationInstanceDataSchema.optional(),
  timestamp: z.number().optional(),
  idMessage: z.string().optional(),
  senderData: notificationSenderDataSchema.optional(),
  messageData: notificationMessageDataSchema.optional(),
});

export const receiveNotificationResponseSchema = z.object({
  receiptId: z.number(),
  body: incomingNotificationSchema,
});

export const deleteNotificationResponseSchema = z.object({
  result: z.boolean(),
  reason: z.string().optional(),
});
