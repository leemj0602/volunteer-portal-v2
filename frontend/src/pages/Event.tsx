import { useParams } from "react-router-dom";
import Wrapper from "../components/Wrapper";
import { Dispatch, MouseEvent, SetStateAction, useEffect, useState } from "react";
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
import { EventRegistration, RegistrationStatus } from "../../utils/classes/EventRegistration";
import swal from "sweetalert";

export default function Event() {
    const { id } = useParams();

    const [eventRole, setEventRole] = useState<EventRole>();
    const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
    const [optionalFields, setOptionalFields] = useState<{ [key: string]: any }>();

    useEffect(() => {
        (async function () {
            const eventRole = await EventRoleManager.fetch({ id }) as EventRole;
            setRegistrations(await eventRole.fetchRegistrations());
            const optionalFields = await eventRole.event.getOptionalCustomFields();
            setOptionalFields(optionalFields);
            setEventRole(eventRole);
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
                        <RegistrationButton eventRole={eventRole} registrations={registrations} setRegistrations={setRegistrations} />
                        <RegistrationDateRange eventRole={eventRole} />
                    </div>
                </header>
                <div className="text-center min-w-[180px] max-w-[180px] lg:hidden mt-6">
                    <RegistrationButton eventRole={eventRole} registrations={registrations} setRegistrations={setRegistrations} />
                    <RegistrationDateRange eventRole={eventRole} />
                </div>
                {/* Information */}
                <div className="grid grid-cols-4 lg:flex lg:flex-row gap-4 w-full mt-6">
                    {/* Registered */}
                    <div className="bg-primary/30 text-secondary rounded-md py-2 px-3 col-span-2 min-w-[135px]">
                        <h3 className="text-xs font-semibold mb-2">Registered</h3>
                        <div className="flex flex-row items-center gap-x-3 font-bold text-lg">
                            <MdPeopleAlt size={22} />
                            <span>{registrations.filter(r => r["status_id:name"] == RegistrationStatus.Approved).length}</span>
                            {eventRole["Volunteer_Event_Role_Details.Vacancy"]! > 0 && <>
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
                                <span>{moment(new Date(eventRole.activity_date_time!).getTime() + (eventRole.duration! * 60 * 1000)).format("D MMM YYYY, h:mm A")}</span>
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
                {/* Custom Fields */}
                <div className="mt-6">
                    {Object.keys(optionalFields!).map(key => {
                        return <div className="mb-6">
                            <h1 className="font-bold mb-2 text-black/70">{key.split("Volunteer_Event_Details.")[1].split("-").join(" ")}</h1>
                            <p className="text-black/70">{optionalFields![key]}</p>
                        </div>
                    })}
                </div>
            </div>
        </div>}
    </Wrapper>
}



interface EventRoleFieldProp {
    eventRole: EventRole;
    registrations: EventRegistration[];
    setRegistrations: Dispatch<SetStateAction<EventRegistration[]>>;
}

function RegistrationButton(props: EventRoleFieldProp) {
    const [isLoading, setIsLoading] = useState(false);
    const email = (window as any).email ?? config.email;

    const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
        setIsLoading(true);
        // If they already registered
        if (!props.registrations.find(r => r["contact.email_primary.email"] == email)) {
            const registrations = await props.eventRole.register(email);
            props.setRegistrations(registrations);
            swal(props.eventRole["Volunteer_Event_Role_Details.Approval_Required"] ? "Your request has been submitted.\nPlease wait for an administrator to approve." : "You have successfully registered.", { icon: "success" });
        }
        else swal("An error has occurred while registering.\nPlease contact an administrator.", { icon: "error" });
        setIsLoading(false);
    }

    // Whether they have already registered
    const registered = props.registrations.find(r => r["contact.email_primary.email"] == email) ?? null;
    // Whether they're within the registration date time and it's before the event ends
    const canRegister = Date.now() >= new Date(props.eventRole["Volunteer_Event_Role_Details.Registration_Start_Date"]!).getTime() && Date.now() <= new Date(props.eventRole["Volunteer_Event_Role_Details.Registration_End_Date"]!).getTime();
   
    // If there's even space in the first place
    const hasSpace = props.eventRole["Volunteer_Event_Role_Details.Vacancy"] ?? Infinity >= props.registrations.filter(r => r["status_id:name"] == RegistrationStatus.Approved).length;
   
    // If the event is still ongoing
    const eventOngoing = Date.now() >= new Date(props.eventRole.activity_date_time!).getTime() && Date.now() <= new Date(props.eventRole.activity_date_time!).getTime() + (props.eventRole.duration! * 60_000);

    let content = "";
    // If they have registered
    if (registered) {
        // If they have attended
        if (registered.attendance) content = "Attended";
        else {
            // If they have been unapproved
            if (registered["status_id:name"] == RegistrationStatus.Unapproved) content = "Unapproved";
            // If the event is now closed
            else if (!eventOngoing) content = "Closed";
            else {
                // If approval is required
                if (registered["status_id:name"] == RegistrationStatus.ApprovalRequired) content = "Pending";
                else content = "Registered";
            }
        }
    }
    else {
        // If they can still register
        if (canRegister && hasSpace && eventOngoing) content = "Sign Up";
        else content = "Closed";
    }

    console.log(registered);

    return <button className="text-white font-semibold bg-secondary rounded-md w-full py-[6px] px-2 mb-2 disabled:bg-primary" disabled={isLoading || !(!registered) || !canRegister || !hasSpace || !eventOngoing} onClick={handleClick}>
        {isLoading ? "Loading..." : content}
    </button>
}

function RegistrationDateRange(props: Omit<EventRoleFieldProp, "registrations" | "setRegistrations">) {
    const activityDateTime = new Date(props.eventRole.activity_date_time!);

    const startDateTime = new Date(activityDateTime);
    startDateTime.setDate(activityDateTime.getDate() - (props.eventRole["Volunteer_Event_Role_Details.Registration_Start_Days_Before"] ?? 0));

    const endDateTime = new Date(activityDateTime);
    endDateTime.setDate(activityDateTime.getDate() - (props.eventRole["Volunteer_Event_Role_Details.Registration_End_Days_Before"] ?? 0));

    return props.eventRole["Volunteer_Event_Role_Details.Registration_Start_Days_Before"] && <p className="text-xs">
        Registration: {moment(startDateTime).format("DD MMMM")} - {moment(endDateTime).format("DD MMMM")}
    </p>
}