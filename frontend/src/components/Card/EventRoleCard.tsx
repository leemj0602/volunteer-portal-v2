import { useEffect, useState } from "react";
import { EventRole } from "../../../utils/classes/EventRole";
import { EventRegistration, RegistrationStatus } from "../../../utils/classes/EventRegistration";
import Card from "./";
import { FiCalendar } from "react-icons/fi";
import moment from "moment";
import { GrGroup, GrLocation } from "react-icons/gr";
import { IoBriefcaseOutline } from "react-icons/io5";
import { Spinner } from "flowbite-react";

interface EventRoleCardProps {
    eventRole: EventRole;
    className?: string;
    url?: string;
}
export default function EventRoleCard(props: EventRoleCardProps) {
    const [volunteers, setVolunteers] = useState<EventRegistration[]>();
    useEffect(() => {
        (async () => {
            setVolunteers(await props.eventRole.fetchRegistrations());
        })();
    }, []);

    return <Card
        className={props.className}
        thumbnail={props.eventRole.event["thumbnail.uri"]}
        url={props.url ?? `/v1/events/${props.eventRole.event.id}/${props.eventRole["Volunteer_Event_Role_Details.Role"]}`}
    >
        <h1 className="font-semibold mb-4">{props.eventRole.event.subject}</h1>
        <div className="grid grid-rows-1 gap-y-2 text-black/70">
            {/* Date and Time */}
            <div className="flex items-center">
                <FiCalendar className="text-secondary mr-3" />
                <span className="text-sm font-semibold">
                    {moment(props.eventRole.activity_date_time).format("D MMM YYYY h:mma")}
                    <span className="text-sm mx-1">-</span>
                    {moment(new Date(props.eventRole.activity_date_time!).getTime() + (props.eventRole.duration! * 60 * 1000)).format("h:mma")}
                </span>
            </div>
            {/* Role */}
            <div className="gap-x-3 flex items-center">
                <IoBriefcaseOutline className="text-secondary" />
                <span className="text-sm font-semibold">{props.eventRole["Volunteer_Event_Role_Details.Role:label"]}</span>
            </div>
            {/* Vacancy */}
            <div className="gap-x-3 flex items-center">
                <GrGroup className="text-secondary" />
                <span className="text-sm font-semibold items-center">
                    {volunteers ? volunteers.filter(r => r["status_id:name"] == RegistrationStatus.Approved).length : <Spinner className="w-[14px] h-[14px] fill-secondary mr-1" />}{props.eventRole["Volunteer_Event_Role_Details.Vacancy"] ? ` out of ${props.eventRole["Volunteer_Event_Role_Details.Vacancy"]}` : ""} registered
                </span>
            </div>
        </div>
    </Card>
}