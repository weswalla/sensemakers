import {
  Notification,
  NotificationCreate,
  NotificationStatus,
} from '../@shared/types/types.notifications';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';

export class NotificationsRepository extends BaseRepository<
  Notification,
  NotificationCreate
> {
  constructor(protected db: DBInstance) {
    super(db.collections.notifications);
  }
  public async getUnotifiedOfUser(userId: string, manager: TransactionManager) {
    const status_property: keyof Notification = 'status';

    const query = this.db.collections.notifications
      .where(status_property, '==', NotificationStatus.pending)
      .where('userId', '==', userId);

    const snap = await manager.query(query);
    const ids = snap.docs.map((doc) => doc.id);

    return ids;
  }

  public async markAsNotified(
    userId: string,
    notificationId: string,
    manager: TransactionManager
  ) {
    const ref = this.db.collections.notifications.doc(notificationId);

    manager.update(ref, {
      status: NotificationStatus.sent,
    });
  }
}
