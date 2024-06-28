import { useNavigate, useParams } from "react-router-dom";
import Wrapper from "../components/Wrapper";
import { useEffect, useState } from "react";
import { EventRole } from "../../utils/classes/EventRole";
import EventRoleManager from "../../utils/managers/EventRoleManager";
import Loading from "../components/Loading";
import config from "../../../config";
import { CiFileOff } from "react-icons/ci";
import moment from "moment";
import { MdPeopleAlt } from "react-icons/md";
import { GrLocation } from "react-icons/gr";
import { FiCalendar } from "react-icons/fi";
import { IoMdBriefcase } from "react-icons/io";

export default function Event() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [eventRole, setEventRole] = useState<EventRole>();

    useEffect(() => {
        (async function () {
            const eventRole = await EventRoleManager.fetch({ id }) as EventRole;
            setEventRole(eventRole);
            console.log(eventRole.event.getOptionalCustomFields());
        })();
    }, []);

    return <Wrapper>
        {!eventRole ? <Loading className="h-screen items-center" /> : <div className="p-4">
            <h1 className="font-semibold text-lg text-gray-600">Event Details</h1>
            <div className="bg-white rounded-md mt-4 py-6 px-4 max-w-[1400px]">
                {/* Image */}
                <div className="mb-8 h-[200px] rounded-lg relative bg-gray-200">
                    {eventRole.event.thumbnail ?
                        <img src={`${config.domain}/wp-content/uploads/civicrm/custom/${eventRole.event.thumbnail}`} className="w-full h-full object-cover rounded-lg" /> :
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <CiFileOff className="text-[80px] text-gray-500" />
                        </div>}
                </div>
                {/* Header */}
                <header className="flex flex-row justify-between w-full gap-x-4">
                    {/* Description */}
                    <div className="flex-grow">
                        <h2 className="text-2xl text-secondary font-bold">{eventRole.event.subject}</h2>
                        {(eventRole.event.details?.length ?? 0) > 0 && <div className="max-w-[780px] mt-4 text-black/70" dangerouslySetInnerHTML={{ __html: eventRole.event.details ?? "" }} />}
                    </div>
                    {/* Registration Section */}
                    <div className="text-center min-w-[180px] max-w-[180px] hidden lg:block">
                        <RegistrationButton eventRole={eventRole} />
                        <RegistrationDateRange eventRole={eventRole} />
                    </div>
                </header>
                {/* Information */}
                <div className="grid grid-cols-4 lg:flex lg:flex-row gap-4 w-full mt-6">
                    {/* Registered */}
                    <div className="bg-primary/30 text-secondary rounded-md py-2 px-3 col-span-2 min-w-[135px]">
                        <h3 className="text-xs font-semibold mb-2">Registered</h3>
                        <div className="flex flex-row items-center gap-x-3 font-bold text-lg">
                            <MdPeopleAlt size={22} />
                            <span>0</span>
                            {eventRole["Volunteer_Event_Role_Details.Vacancy"] > 0 && <>
                                <span>/</span>
                                <span>{eventRole["Volunteer_Event_Role_Details.Vacancy"]}</span>
                            </>}
                        </div>
                    </div>
                    {/* Location */}
                    <div className="bg-primary/30 text-secondary rounded-md py-2 px-3 col-span-2">
                        <h3 className="text-xs font-semibold mb-2">Location</h3>
                        <div className="flex flex-row items-center gap-x-3 font-bold text-sm">
                            <GrLocation size={22} />
                            <span>{eventRole.event.location}</span>
                        </div>
                    </div>
                    {/* Date and Time */}
                    <div className="bg-primary/30 text-secondary rounded-md py-2 px-3 col-span-4 lg:col-span-2">
                        <h3 className="text-sm font-semibold mb-2">Date & Time</h3>
                        <div className="flex flex-row items-center gap-x-3 font-bold text-sm">
                            <FiCalendar size={22} />
                            <div className="flex flex-col sm:flex-row gap-x-3">
                                <span>{moment(eventRole.activity_date_time).format("D MMM YYYY, h:mm A")}</span>
                                <span className="hidden sm:block">-</span>
                                <span>{moment(new Date(eventRole.activity_date_time).getTime() + (eventRole.duration * 60 * 1000)).format("D MMM YYYY, h:mm A")}</span>
                            </div>
                        </div>
                    </div>
                    {/* Role */}
                    <div className="bg-primary/30 text-secondary rounded-md py-2 px-3 col-span-4 lg:col-span-2">
                        <h3 className="text-sm font-semibold mb-2">Role</h3>
                        <div className="flex flex-row items-center gap-x-3 font-bold text-sm">
                            <IoMdBriefcase size={22} />
                            <span>{eventRole["Volunteer_Event_Role_Details.Role:label"]}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>}
    </Wrapper>
}



interface EventRoleFieldProp {
    eventRole: EventRole;
}

function RegistrationButton(props: EventRoleFieldProp) {
    return <button className="text-white font-semibold bg-secondary rounded-md w-full py-[6px] px-2 mb-2 disabled:bg-primary">
        Sign Up
    </button>
}

function RegistrationDateRange(props: EventRoleFieldProp) {
    const activityDateTime = new Date(props.eventRole.activity_date_time);

    const startDateTime = new Date(activityDateTime);
    startDateTime.setDate(activityDateTime.getDate() - (props.eventRole["Volunteer_Event_Role_Details.Registration_Start_Days_Before"] ?? 0));

    const endDateTime = new Date(activityDateTime);
    endDateTime.setDate(activityDateTime.getDate() - (props.eventRole["Volunteer_Event_Role_Details.Registration_End_Days_Before"] ?? 0));

    return props.eventRole["Volunteer_Event_Role_Details.Registration_Start_Days_Before"] && <p className="text-xs">
        Registration: {moment(startDateTime).format("DD MMMM")} - {moment(endDateTime).format("DD MMMM")}
    </p>
}