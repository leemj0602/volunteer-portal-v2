import { useNavigate, useParams } from "react-router-dom";
import Wrapper from "../../components/Wrapper";
import { Dispatch, MouseEvent, SetStateAction, useEffect, useState } from "react";
import { EventDetails } from "../../../utils/classes/EventDetails";
import { EventRole } from "../../../utils/classes/EventRole";
import EventDetailManager from "../../../utils/managers/EventDetailManager";
import Loading from "../../components/Loading";
import config from "../../../../config";
import { CiFileOff } from "react-icons/ci";
import { GrLocation } from "react-icons/gr";
import { FiCalendar } from "react-icons/fi";
import moment from "moment";
import { IoMdBriefcase } from "react-icons/io";
import EventRoleManager from "../../../utils/managers/EventRoleManager";
import { EventRegistration, RegistrationStatus } from "../../../utils/classes/EventRegistration";
import { CheckIcon, ChevronDownIcon, LockClosedIcon, PencilIcon } from "@heroicons/react/24/solid";
import { Spinner } from "flowbite-react";
import Swal from "sweetalert2";

export default function Event() {
    const navigate = useNavigate();

    const { eventId, roleId } = useParams();
    const [roleLabel, setRoleLabel] = useState<string>();
    const [event, setEvent] = useState<EventDetails>();
    const [eventRoles, setEventRoles] = useState<EventRole[]>();
    const [fields, setFields] = useState<{ [key: string]: any }>();

    // #region State initialisation
    useEffect(() => {
        (async () => {
            const event = await EventDetailManager.fetch(eventId!);
            if (!event) return navigate("/events");

            // #region Getting the role label, this assumes that there is at least 1 EventRole created
            const eventRole = await EventRoleManager.fetch({ where: [["Volunteer_Event_Role_Details.Role", "=", roleId]], limit: 1, select: ["Volunteer_Event_Role_Details.Role:label"] }) as EventRole[];
            if (!eventRole.length) return navigate("/events");
            setRoleLabel(eventRole[0]["Volunteer_Event_Role_Details.Role:label"]!);
            // #endregion

            const eventRoles = await event?.fetchRegisterableEventRoles(roleId!);
            setFields(await event.getOptionalCustomFields());
            setEventRoles(eventRoles);
            setEvent(event);
        })();
    }, []);
    // #endregion

    return <Wrapper>
        {!event ? <Loading className="h-screen items-center" /> : <div className="p-4">
            <div className="bg-white rounded-md mt-4 py-6 px-4 max-w-[1600px]">
                {/* Image */}
                <div className="mb-8 h-[200px] rounded-lg relative border border-gray-50 bg-gray-200">
                    {event["thumbnail.uri"] ? <img src={`${config.domain}/wp-content/uploads/civicrm/custom/${event["thumbnail.uri"]}`} className="w-full h-full object-cover rounded-lg" /> : <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <CiFileOff className="text-[80px] text-gray-500" />
                    </div>}
                </div>
                {/* Header */}
                <header className="flex flex-row justify-between w-full gap-x-4">
                    <div className="flex-grow">
                        {/* Subject */}
                        <h2 className="text-2xl text-secondary font-semibold">{event.subject}</h2>
                        {/* Description */}
                        {(event.details?.length ?? 0) > 0 && <div className="max-w-[780px] mt-4 text-black/70" dangerouslySetInnerHTML={{ __html: event.details ?? "" }} />}
                    </div>
                </header>

                {/* Information */}
                <div className="grid grid-cols-4 lg:flex lg:flex-row gap-4 w-full mt-6">
                    {/* Role */}
                    <div className="bg-primary/30 text-secondary rounded-md py-2 px-3 col-span-2">
                        <h3 className="text-sm font-semibold mb-2">Role</h3>
                        <div className="flex flex-row items-center gap-x-3 font-bold text-sm">
                            <IoMdBriefcase size={22} />
                            <span>{roleLabel}</span>
                        </div>
                    </div>
                    {/* Location */}
                    <div className="bg-primary/30 text-secondary rounded-md py-2 px-3 col-span-2">
                        <h3 className="text-xs font-semibold mb-2">Location</h3>
                        <div className="flex flex-row items-center gap-x-3 font-bold text-sm">
                            <GrLocation size={22} />
                            <span>{event.location}</span>
                        </div>
                    </div>
                    {/* No or multiple event roles */}
                    {(eventRoles!.length == 0 || eventRoles!.length > 1) && <div className="bg-primary/30 text-secondary rounded-md py-2 px-3 col-span-2">
                        <h3 className="text-xs font-semibold mb-2">Schedules</h3>
                        <div className="flex flex-row items-center gap-x-3 font-bold text-sm">
                            <FiCalendar size={22} />
                            <span>{eventRoles?.length ? "Multiple Schedules" : "No Available Schedules"}</span>
                        </div>
                    </div>}
                    {/* 1 specific schedule */}
                    {eventRoles?.length == 1 && <>
                        <div className="bg-primary/30 text-secondary rounded-md py-2 px-3 col-span-4 lg:col-span-2">
                            <h3 className="text-sm font-semibold mb-2">Date & Time</h3>
                            <div className="flex flex-row items-center gap-x-3 font-bold text-sm">
                                <FiCalendar size={22} />
                                <div className="flex flex-col sm:flex-row gap-x-3">
                                    <span>{moment(eventRoles[0].activity_date_time).format("D MMM YYYY, h:mm A")}</span>
                                    <span className="hidden sm:block">-</span>
                                    <span>{moment(new Date(eventRoles[0].activity_date_time!).getTime() + (eventRoles[0].duration! * 60 * 1000)).format("D MMM YYYY, h:mm A")}</span>
                                </div>
                            </div>
                        </div>
                    </>}
                </div>

                {/* Optional fields */}
                <div className="mt-6">
                    {fields != undefined && Object.keys(fields).map(key => <div className="mb-6">
                        <h1 className="font-bold mb-2 text-black/70">{key.split("Volunteer_Event_Details.")[1].replace(/_/g, " ")}</h1>
                        <p className="text-black/70">{fields[key]}</p>
                    </div>)}
                </div>

                {/* Event roles */}
                <section>
                    <h3 className="text-xl text-black/70 font-semibold mb-4">Event Schedules</h3>
                    <div className="overflow-x-auto w-full">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 py-3 text-left text-sm font-semibold text-black/70 uppercase">Date</th>
                                    <th className="px-2 py-3 text-left text-sm font-semibold text-black/70 uppercase hidden lg:table-cell">Registration End</th>
                                    <th className="px-2 py-3 text-left text-sm font-semibold text-black/70 uppercase hidden sm:table-cell">Participants</th>
                                    <th className="px-2 py-3 text-left text-sm font-semibold text-black/70 uppercase">Register</th>
                                    <th className="px-2 py-3 text-left text-sm font-semibold hidden sm:table-cell"></th>
                                </tr>
                            </thead>
                            <tbody>{eventRoles?.map(e => <EventRoleDisplay eventRole={e} key={e.id} />)}</tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>}
    </Wrapper>
}

// #region Displaying individual event role
interface EventRoleDisplayProps {
    eventRole: EventRole;
}

function EventRoleDisplay({ eventRole }: EventRoleDisplayProps) {
    const [registrations, setRegistrations] = useState<EventRegistration[]>();

    useEffect(() => {
        (async () => setRegistrations(await eventRole.fetchRegistrations()))()
    }, []);

    const startDate = moment(eventRole.activity_date_time);
    const endDate = moment(eventRole.activity_date_time).add(eventRole.duration, "minutes");
    const registrationEndDate = moment(eventRole["Volunteer_Event_Role_Details.Registration_End_Date"]);

    return <tr>
        {/* Date */}
        <td className="px-2 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{startDate.format("D MMM h:mm A").toUpperCase()} - {endDate.format(startDate.format("DD-MM") == endDate.format("DD-MM") ? "LT" : "D MMM h:mm A").toUpperCase()}</td>
        {/* Registration Period */}
        <td className="hidden md:table-cell px-2 py-3 whitespace-nowrap text-sm text-gray-800">{registrationEndDate.format("D MMMM").toUpperCase()}</td>
        {/* Participants */}
        <td className="hidden sm:table-cell px-2 py-3 whitespace-nowrap text-sm text-gray-800">
            {registrations ? registrations.filter(r => r["status_id:name"] == RegistrationStatus.Approved).length : <Loading className="text-sm" />} / {eventRole["Volunteer_Event_Role_Details.Vacancy"]}
        </td>
        {/* Registration button */}
        {!registrations ? <Loading className="items-center" /> : <td className="px-2 py-3 whitespace-nowrap">
            <RegistrationButton eventRole={eventRole} registrations={registrations} setRegistrations={setRegistrations} />
        </td>}
        {/* Chevron */}
        {/* <td className="px-2 py-3 whitespace-nowrap">
            <ChevronDownIcon className="w-5 h-5 text-gray-800" />
        </td> */}
    </tr>
}
// #endregion

// #region RegistrationButton Component
interface RegistrationButtonProps {
    eventRole: EventRole;
    registrations: EventRegistration[];
    setRegistrations: Dispatch<SetStateAction<EventRegistration[] | undefined>>;
}
function RegistrationButton(props: RegistrationButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const email = (window as any).email;

    const endDate = moment(props.eventRole.activity_date_time).add(props.eventRole.duration, "minutes");
    const registrationStartDate = moment(props.eventRole["Volunteer_Event_Role_Details.Registration_Start_Date"]);
    const registrationEndDate = moment(props.eventRole["Volunteer_Event_Role_Details.Registration_End_Date"]);

    const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsLoading(true);
        // If they already registered
        if (!props.registrations.find(r => r["contact.email_primary.email"] == email)) {
            const registrations = await props.eventRole.register(email);
            props.setRegistrations(registrations);
            Swal.fire({
                icon: "success",
                title: props.eventRole["Volunteer_Event_Role_Details.Approval_Required"] ? "Your request has been submitted" : "You have successfully registered",
                text: "Please wait for an Administrator to approve"
            })
        }
        else Swal.fire({
            icon: "error",
            title: "An error has occurred",
            text: "Please contact an Administrator."
        })
        setIsLoading(false);
    }

    // Whether they have registered
    const registered = props.registrations.find(r => r["contact.email_primary.email"] == email) ? true : false;
    // Whether their registration is pending
    const pendingRegistration = registered ? props.registrations.find(r => r["contact.email_primary.email"] == email)?.["status_id:name"] == RegistrationStatus.ApprovalRequired ? true : false : false;

    // Whether it's within registration period
    const withinRegistrationPeriod = moment().isSameOrAfter(registrationStartDate) && moment().isSameOrBefore(registrationEndDate);
    // Whether there's vacancy
    const hasSpace = props.eventRole["Volunteer_Event_Role_Details.Vacancy"] ?? Infinity >= props.registrations.filter(r => r["status_id:name"] == RegistrationStatus.Approved).length;
    // Whether the event has ended
    const eventEnded = moment().isSameOrAfter(endDate);
    // Whether it's registerable
    const registerable = !registered && withinRegistrationPeriod && hasSpace && !eventEnded;

    return <button onClick={handleClick} disabled={!registerable || isLoading} className={`mt-2 w-[100px] px-2 py-2 rounded font-semibold text-sm ${registered ? 'bg-blue-500 text-white cursor-not-allowed' : withinRegistrationPeriod ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700 cursor-not-allowed'} flex items-center justify-center`}>
        {isLoading ? <Spinner className="w-3 h-3 text-white" /> :
            registered ? (pendingRegistration ? 
                <><CheckIcon className="w-5 h-5 mr-2 text-white" />Pending</> : 
                <><CheckIcon className="w-5 h-5 mr-2 text-white" />Registered</>) :
            registerable ? <><PencilIcon className="w-5 h-5 mr-2 text-white" />Register</> :
            !hasSpace ? <><LockClosedIcon className="w-5 h-5 mr-2 text-white" />Full</> :
            <><LockClosedIcon className="w-5 h-5 mr-2 text-white" />Closed</>}
    </button>
}
// #endregion