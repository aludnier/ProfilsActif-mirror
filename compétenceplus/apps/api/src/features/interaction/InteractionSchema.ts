import { z } from 'zod'

export const listNotificationsQuery = z.object({
  unread: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
})

export const notificationIdParam = z.object({
  id: z.string().uuid(),
})

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuery>
