
import { NonTrouve } from '../../shared/errors.js'
import { InteractionRepository, type NotificationRow } from './InteractionRepository.js'

export interface NotificationDTO {
  id: string
  type: 'contact'
  read: boolean
  createdAt: Date
  message: string | null
  recruiterId: string | null
  recruiterName: string | null
  recruiterMail: string | null
  recruiterPhone: string | null
}

function toDTO(row: NotificationRow): NotificationDTO {
  return {
    id: row.id,
    type: row.type,
    read: Boolean(row.isRead),
    createdAt: row.createdAt,
    message: row.message,
    recruiterId: row.recruiterId,
    recruiterName: row.recruiterName?.trim() || null,
    recruiterMail: row.recruiterMail,
    recruiterPhone: row.recruiterPhone,
  }
}

export class InteractionService {
  constructor(private readonly repository = new InteractionRepository()) {}

  async listNotifications(seekerId: string, unreadOnly = false): Promise<NotificationDTO[]> {
    const rows = await this.repository.findBySeeker(seekerId, unreadOnly)
    return rows.map(toDTO)
  }

  countUnread(seekerId: string): Promise<number> {
    return this.repository.countUnread(seekerId)
  }

  async markRead(id: string, seekerId: string): Promise<void> {
    const ok = await this.repository.markRead(id, seekerId)
    if (!ok) {
      throw new NonTrouve('Notification introuvable ou déjà lue', 'NOTIFICATION_NON_TROUVEE')
    }
  }

  markAllRead(seekerId: string): Promise<number> {
    return this.repository.markAllRead(seekerId)
  }
}
