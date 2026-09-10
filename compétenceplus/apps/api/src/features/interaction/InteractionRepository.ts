
import type { ResultSetHeader, RowDataPacket } from 'mysql2'

import { db } from '../../infrastructure/db.client.js'

export interface NotificationRow extends RowDataPacket {
  id: string
  type: 'contact'
  isRead: number
  createdAt: Date
  contactId: string | null
  message: string | null
  recruiterId: string | null
  recruiterName: string | null
  recruiterMail: string | null
  recruiterPhone: string | null
}

const SELECT = `
  SELECT
    n.id,
    n.type,
    (n.read_at IS NOT NULL)                        AS isRead,
    n.created_at                                   AS createdAt,
    n.contact_id                                   AS contactId,
    c.message                                      AS message,
    c.recruiter_id                                 AS recruiterId,
    CONCAT(ru.first_name, ' ', ru.last_name)       AS recruiterName,
    ru.mail                                        AS recruiterMail,
    ru.phone                                       AS recruiterPhone
  FROM notification n
  LEFT JOIN contact c  ON c.id = n.contact_id
  LEFT JOIN app_user ru ON ru.uuid = c.recruiter_id
`

export class InteractionRepository {
  async findBySeeker(seekerId: string, unreadOnly = false): Promise<NotificationRow[]> {
    const [rows] = await db.query<NotificationRow[]>(
      `${SELECT}
       WHERE n.seeker_id = ?
       ${unreadOnly ? 'AND n.read_at IS NULL' : ''}
       ORDER BY n.created_at DESC`,
      [seekerId],
    )
    return rows
  }

  async countUnread(seekerId: string): Promise<number> {
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS n FROM notification WHERE seeker_id = ? AND read_at IS NULL',
      [seekerId],
    )
    return Number(rows[0]?.n ?? 0)
  }

  async markRead(id: string, seekerId: string): Promise<boolean> {
    const [res] = await db.execute<ResultSetHeader>(
      'UPDATE notification SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND seeker_id = ? AND read_at IS NULL',
      [id, seekerId],
    )
    return res.affectedRows > 0
  }

  async markAllRead(seekerId: string): Promise<number> {
    const [res] = await db.execute<ResultSetHeader>(
      'UPDATE notification SET read_at = CURRENT_TIMESTAMP WHERE seeker_id = ? AND read_at IS NULL',
      [seekerId],
    )
    return res.affectedRows
  }
}
