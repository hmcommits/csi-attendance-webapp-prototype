import { Link } from 'react-router-dom';
import { ScanLine, CalendarX } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import EventCard from '../../components/EventCard';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';

export default function VolunteerEvents() {
  const { db, currentUser } = useApp();

  const assigned = db.events
    .filter((e) => e.volunteers.includes(currentUser.id))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return (
    <Shell title="Assigned events" subtitle="Events you're authorized to scan attendance for.">
      {assigned.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No events assigned"
          description="An administrator or coordinator needs to assign you to an event before you can scan attendance."
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {assigned.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              footer={
                <div className="flex gap-2">
                  <Button as={Link} to={`/volunteer/events/${event.id}`} variant="secondary" className="flex-1">
                    Details
                  </Button>
                  {event.status === 'closed' || event.status === 'cancelled' ? (
                    <Button className="flex-1" disabled>
                      <ScanLine className="size-4" />
                      Scan
                    </Button>
                  ) : (
                    <Button as={Link} to={`/volunteer/scanner/${event.id}`} className="flex-1">
                      <ScanLine className="size-4" />
                      Scan
                    </Button>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}
    </Shell>
  );
}
