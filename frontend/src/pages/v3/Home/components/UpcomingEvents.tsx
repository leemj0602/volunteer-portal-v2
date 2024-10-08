import { Link } from "react-router-dom";
import { EventRole } from "../../../../../utils/classes/EventRole"
import Loading from "../../../../components/Loading";
import EventRoleCard from "../../../../components/Card/EventRoleCard";
import { useEffect, useState } from "react";
import EventRoleManager from "../../../../../utils/managers/EventRoleManager";
import { EventRegistration } from "../../../../../utils/classes/EventRegistration";

interface UpcomingEventsProps {
    registrations: EventRegistration[];
}

export default function UpcomingEvents({ registrations }: UpcomingEventsProps) {
    const [eventRoles, setEventRoles] = useState<EventRole[]>();
    useEffect(() => {
        (async () => {
            setEventRoles(await EventRoleManager.fetchUnregistered(registrations.map(r => r.eventRole.id!), 3));
        })();
    })
    
    return <div className="mt-8">
        <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <Link to="/events" className="text-secondary hover:text-primary">View All Events &gt;</Link>
        </div>
        {!eventRoles ? <Loading /> : eventRoles.length == 0 ? <p className="text-gray-500">Looks like there aren't any upcoming events</p> : <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eventRoles.map(event => <EventRoleCard className="flex justify-center" eventRole={event} />)}
        </div>}
    </div>
}   