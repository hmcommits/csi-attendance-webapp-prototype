import Badge from './ui/Badge';
import { EVENT_STATUS_LABELS } from '../lib/utils';

const STATUS_TONE = {
  upcoming: 'primary',
  ongoing: 'success',
  closed: 'neutral',
  cancelled: 'error',
};

export function EventStatusBadge({ status }) {
  return (
    <Badge tone={STATUS_TONE[status] || 'neutral'} dot>
      {EVENT_STATUS_LABELS[status] || status}
    </Badge>
  );
}
