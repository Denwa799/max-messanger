import { z } from 'zod';

export const sendMessageResponseSchema = z.object({
  idMessage: z.string(),
});

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

const notificationMessageDataSchema = z.looseObject({
  typeMessage: z.string().optional(),
  textMessageData: z.looseObject({ textMessage: z.string() }).optional(),
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
