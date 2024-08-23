import { useEffect, useState } from "react";
import { EventDetails, EventStatus } from "../../../utils/classes/EventDetails";
import { EventRole } from "../../../utils/classes/EventRole";
import Card from ".";
import { FiCalendar } from "react-icons/fi";
import { Spinner } from "flowbite-react";
import moment from "moment";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { IoBriefcase } from "react-icons/io5";

interface EventCardProps {
    event: EventDetails;
    roleId: string;
    roleLabel: string;
    className?: string;
}

export default function EventCard(props: EventCardProps) {
    const [eventRoles, setEventRoles] = useState<EventRole[]>();
    const [dates, setDates] = useState<string[]>();
    useEffect(() => {
        (async () => {
            const eventRoles = await props.event.fetchRegisterableEventRoles(props.roleId) as EventRole[];
            setDates(eventRoles.map(e => moment(e.activity_date_time!).format("D MMM")).filter(d => !!d));
            setEventRoles(eventRoles);
        })();
    }, []);

    return <Card
        className={props.className}
        url={`/events/${props.event.id}/${props.roleId}`}
        thumbnail={props.event["thumbnail.uri"]}
        cancelled={props.event["status_id:name"] == EventStatus.Cancelled}
    >
        <h1 className="font-semibold mb-4">{props.event.subject}</h1>
        <div className="grid grid-rows-1 gap-y-2 text-black/70">
            {/* Date and Time */}
            <div className="flex items-center">
                <FiCalendar className="text-secondary mr-3" />
                <span className="text-sm font-semibold">
                    {!eventRoles ? <Spinner className="w-[14px] h-[14px] fill-secondary mr-1" /> : <span>
                       {dates!.slice(0, 3).map((d, i) => <>{d}{(i == dates!.length - 1 || i == 2) ? " " : ", "}</>)}
                       {dates!.length > 3 ? `... (+${dates!.length - 3})` : ""}
                    </span>}
                </span>
            </div>
            {/* Number of schedules */}
            <div className="flex gap-x-3 items-center">
                <RiCalendarScheduleLine className="text-secondary" />
                <span className="text-sm font-semibold items-center">
                    {eventRoles ? eventRoles.length > 1 ? "Multiple Schedules" : eventRoles.length == 1 ? `${moment(eventRoles[0].activity_date_time).format("hh:mm A")} - ${moment(new Date(eventRoles[0].activity_date_time!).getTime() + (eventRoles[0].duration! * 60 * 1000)).format("hh:mm A")}` : "No Schedules Available" : <Spinner className="w-[14px] h-[14px] fill-secondary mr-1" />}
                </span>
            </div>
            {/* Role */}
            <div className="gap-x-3 flex items-center">
                <IoBriefcase className="text-secondary" />
                <span className="text-sm font-semibold">{props.roleLabel}</span>
            </div>
        </div>
    </Card>
}