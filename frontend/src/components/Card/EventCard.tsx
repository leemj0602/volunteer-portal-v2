import { useEffect, useState } from "react";
import { EventDetails, EventStatus } from "../../../utils/classes/EventDetails";
import { EventRole } from "../../../utils/classes/EventRole";
import Card from ".";
import { FiCalendar } from "react-icons/fi";
import { Spinner } from "flowbite-react";
import moment from "moment";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { IoBriefcase } from "react-icons/io5";

interface GroupedEventRoleCardProps {
    event: EventDetails;
    roleId: string;
    roleLabel: string;
    className?: string;
}

export default function GroupedEventRoleCard(props: GroupedEventRoleCardProps) {
    const [eventRoles, setEventRoles] = useState<EventRole[]>();
    const [minDate, setMinDate] = useState<Date>();
    const [maxDate, setMaxDate] = useState<Date>();
    useEffect(() => {
        (async () => {
            const eventRoles = await props.event.fetchEventRoles(props.roleId) as EventRole[];
            const min = new Date(Math.min(...eventRoles.map(e => new Date(e.activity_date_time!).getTime() )));
            const max = new Date(Math.min(...eventRoles.map(e => new Date(e.activity_date_time!).getTime() )));
            setMinDate(min);
            setMaxDate(max);
            setEventRoles(eventRoles);
        })();
    }, []);

    return <Card
        className={props.className}
        url={`/v2/events/${props.event.id}/${props.roleId}`}
        thumbnail={props.event["thumbnail.uri"]}
        cancelled={props.event["status_id:name"] == EventStatus.Cancelled}
    >
        <h1 className="font-semibold mb-4">{props.event.subject}</h1>
        <div className="grid grid-rows-1 gap-y-2 text-black/70">
            {/* Date and Time */}
            <div className="flex items-center">
                <FiCalendar className="text-secondary mr-3" />
                <span className="text-sm font-semibold">
                    {eventRoles ? <span>
                        {moment(minDate).format("D MMM YYYY")}
                        {moment(maxDate).format("D MMM YYYY") != moment(minDate).format("D MMM YYYY") && <span>
                            <span className="text-sm mx-1">-</span>
                            {moment(maxDate).format("D MMM YYYY")}
                        </span>}
                    </span> : <Spinner className="w-[14px] h-[14px] fill-secondary mr-1" />}
                </span>
            </div>
            {/* Number of schedules */}
            <div>
                <RiCalendarScheduleLine className="text-secondary" />
                {eventRoles ? eventRoles.length > 1 ? "Multiple Schedules" : eventRoles.length == 1 ? `${moment(eventRoles[0].activity_date_time).format("hh:mm A")} - ${moment(new Date(eventRoles[0].activity_date_time!).getTime() + (eventRoles[0].duration! * 60 * 1000)).format("hh:mm A")}` : "No Schedules Available" : <Spinner className="w-[14px] h-[14px] fill-secondary mr-1" />}
            </div>
            {/* Role */}
            <div className="gap-x-3 flex items-center">
                <IoBriefcase className="text-secondary" />
                <span className="text-sm font-semibold">{props.roleLabel}</span>
            </div>
        </div>
    </Card>
}