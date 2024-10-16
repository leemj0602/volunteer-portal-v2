import EventRoleCard from "./Card/EventRoleCard";
import { EventRole, EventRoleProps } from "../../utils/classes/EventRole";
import { useNavigate } from "react-router-dom";
import { Membership } from "../../utils/classes/Membership";

interface UpcomingEventsProps {
  eventRoles: EventRole[] | null;
  membership: Membership;
}

export default function UpcomingEvents({ eventRoles, membership }: UpcomingEventsProps) {
  const navigate = useNavigate();

  return (
    <div className="mt-8 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold">Upcoming Events!</h2>
        <a className="text-blue-500 hover:text-blue-700 text-lg font-medium cursor-pointer" onClick={() => { navigate('/events') }}>View All Events &gt;</a>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {eventRoles && eventRoles.length > 0 ? (
          eventRoles.slice(0, 3).map((event: any) => <EventRoleCard membership={membership} className="flex justify-center" eventRole={event} />)
        ) : (
          <p className="text-lg text-gray-500">Looks like there aren't any upcoming events</p>
        )}
      </div>
    </div>
  );
};
