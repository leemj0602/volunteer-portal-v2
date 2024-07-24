import { useNavigate } from "react-router-dom";
import config from "../../../config";
import { EventStatus } from "../../utils/classes/EventDetails";
import { EventRole } from "../../utils/classes/EventRole";
import { FiCalendar } from "react-icons/fi";
import moment from "moment";
import { GrGroup, GrLocation } from "react-icons/gr";
import { IoBriefcaseOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { EventRegistration, RegistrationStatus } from "../../utils/classes/EventRegistration";
import { Spinner } from "flowbite-react";

interface EventRoleCardProps {
    eventRole: EventRole;
    className?: string;
}

export default function EventRoleCard(props: EventRoleCardProps) {
    const navigate = useNavigate();
    const [volunteers, setVolunteers] = useState<EventRegistration[]>();
    useEffect(() => {
        (async () => {
            setVolunteers(await props.eventRole.fetchRegistrations());
        })();
    }, []);

    return <div className={props.className}>
        <div className="bg-white w-full shadow-md rounded-md p-4 transition-transform duration-300 transform hover:scale-105 flex flex-col justify-between relative">
            {/* If the event is cancelled */}
            {props.eventRole.event["status_id:name"] == EventStatus.Cancelled && <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center z-10 rounded-md">
                <div className="text-red-500 text-4xl font-bold transform rotate-[-10deg] opacity-90 p-4 border-2 border-red-500 rounded-lg bg-white bg-opacity-75 shadow-lg">
                    Event Cancelled
                </div>
            </div>}
            {/* Main body */}
            <div>
                {/* Image */}
                <div className={`mb-4 h-[160px] rounded-lg relative bg-gray-200 cursor-pointer`} onClick={() => navigate(`/events/${props.eventRole.id}`)}>
                    {props.eventRole.event.thumbnail && <img src={`${config.domain}/wp-content/uploads/civicrm/custom/${props.eventRole.event.thumbnail}`} className="w-full h-full object-cover rounded-lg" />}
                </div>
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
                    {/* Location */}
                    <div className="gap-x-3 flex items-center">
                        <GrLocation className="text-secondary" />
                        <span className="text-sm font-semibold">{props.eventRole.event.location}</span>
                    </div>
                    {/* Role */}
                    <div className="gap-x-3 flex items-center">
                        <IoBriefcaseOutline className="text-secondary" />
                        <span className="text-sm font-semibold">{props.eventRole["Volunteer_Event_Role_Details.Role:label"]}</span>
                    </div>
                    {/* Vacancy */}
                    <div className="gap-x-3 flex items-center">
                        <GrGroup className="text-secondary"/>
                        <span className="text-sm font-semibold items-center">
                            {volunteers ? volunteers.filter(r => r["status_id:name"] == RegistrationStatus.Approved).length : <Spinner className="w-[14px] h-[14px] fill-secondary mr-1" />}{props.eventRole["Volunteer_Event_Role_Details.Vacancy"] ? ` out of ${props.eventRole["Volunteer_Event_Role_Details.Vacancy"]}` : ""} registered
                        </span>
                    </div>
                </div>
            </div>
            {/* Read More Button */}
            <button className="text-white bg-secondary text-center w-full rounded-md text-sm mt-6 py-2" onClick={() => navigate(`/events/${props.eventRole.id}`)}>
                Read More
            </button>
        </div>
    </div>
}
