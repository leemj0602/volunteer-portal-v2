import { useNavigate, useParams } from "react-router-dom";
import Wrapper from "../../components/Wrapper";
import { useEffect, useState } from "react";
import { EventDetails } from "../../../utils/classes/EventDetails";
import { EventRole } from "../../../utils/classes/EventRole";
import EventDetailManager from "../../../utils/managers/EventDetailManager";
import Loading from "../../components/Loading";
import config from "../../../../config.json";
import { CiFileOff } from "react-icons/ci";
import { GrLocation } from "react-icons/gr";
import { FiCalendar } from "react-icons/fi";
import moment from "moment";
import { IoMdBriefcase } from "react-icons/io";
import EventRoleManager from "../../../utils/managers/EventRoleManager";
import { EventRegistration, RegistrationStatus } from "../../../utils/classes/EventRegistration";
import ScheduleTable from "../../components/ScheduleTable";
import Swal from "sweetalert2";

export default function Event() {
    const navigate = useNavigate();

    const { eventId, roleId } = useParams();
    const [roleLabel, setRoleLabel] = useState<string>();
    const [event, setEvent] = useState<EventDetails>();
    const [eventRoles, setEventRoles] = useState<EventRole[]>();
    const [fields, setFields] = useState<{ [key: string]: any }>();
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loadingScheduleId, setLoadingScheduleId] = useState<number | null>(null);
    const [dataFetched, setDataFetched] = useState<boolean>(false);
    const email = (window as any).email;

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

            // #region Parsing data for event roles table
            const eventRolesTable = await Promise.all(eventRoles.map(async (eventRole: EventRole) => {
                // console.log(eventRole);
                const registrations = await eventRole.fetchRegistrations();

                const ID = eventRole.id ?? null;
                const StartDateTime = eventRole.activity_date_time ?? 'N/A';
                const Duration = eventRole.duration ?? 0;
                const EndDateTime = moment(StartDateTime).add(Duration, 'minutes');
                const Vacancy = eventRole["Volunteer_Event_Role_Details.Vacancy"] ?? 'N/A';
                const NumRegistrations = registrations.filter((r) => r["status_id:name"] !== "Cancelled" && r["status_id:name"] !== "Not Approved" ).length;
                const RegistrationStartDate = eventRole["Volunteer_Event_Role_Details.Registration_Start_Date"] ?? 'N/A';
                let RegistrationEndDate = eventRole["Volunteer_Event_Role_Details.Registration_End_Date"] ?? 'N/A';
                const Location = eventRole.event.location ?? 'N/A';
                const currentDate = moment();

                const userIsRegistered = isUserRegistered(registrations, email);
                const pendingRegistration = userIsRegistered ? registrations.find(r => r["contact.email_primary.email"] == email)?.["status_id:name"] == RegistrationStatus.ApprovalRequired ? true : false : false;
                const cancelledRegistration = userIsRegistered ? registrations.find(r => r["contact.email_primary.email"] == email)?.["status_id:name"] == RegistrationStatus.Cancelled ? true : false : false;
                const isRegistering = loadingScheduleId === eventRole.id;

                if (RegistrationEndDate === 'N/A') {
                    RegistrationEndDate = StartDateTime;
                }

                let registerStatus;
                let disabled;

                // #region Determine button status
                if (userIsRegistered && pendingRegistration) {
                    registerStatus = 'Pending';
                    disabled = true;
                } else if (userIsRegistered && cancelledRegistration) {
                    registerStatus = 'Cancelled';
                    disabled = true;
                } else if (userIsRegistered) {
                    registerStatus = 'Registered';
                    disabled = true;
                } else if (isRegistering) {
                    registerStatus = 'Registering';
                    disabled = true;
                } else if (
                    (RegistrationStartDate !== 'N/A' && currentDate.isBefore(moment(RegistrationStartDate))) ||
                    (RegistrationEndDate !== 'N/A' && currentDate.isAfter(moment(RegistrationEndDate)))
                ) {
                    registerStatus = 'Closed';
                    disabled = true;
                } else if (Vacancy !== 'N/A' && (Vacancy - NumRegistrations) <= 0) {
                    registerStatus = 'Full';
                    disabled = true;
                } else {
                    registerStatus = 'Register';
                    disabled = false;
                }
                // #endregion

                return {
                    id: ID,
                    startDate: StartDateTime,
                    endDate: EndDateTime,
                    participants: Vacancy === "N/A" ? NumRegistrations : NumRegistrations + "/" + Vacancy,
                    registrationEndDate: RegistrationEndDate,
                    registerStatus: registerStatus,
                    disabled: disabled,
                    onClick: () => handleRegisterClick(eventRole, Vacancy),
                    location: Location,
                }
            }));
            // #endregion

            // Setting the schedules state
            setSchedules(eventRolesTable);
            setDataFetched(true);
        })();
    }, [eventId, roleId]);
    // #endregion

    const isUserRegistered = (registrations: EventRegistration[], email: string) => {
        return registrations.some(
            registration => registration["contact.email_primary.email"] === email
        );
    };

    // #region Registration
    const handleRegisterClick = async (schedule: EventRole, currentVacancy: number | string) => {
        setLoadingScheduleId(schedule.id);
        setSchedules((prevSchedules) =>
            prevSchedules.map((prevSchedule) =>
                prevSchedule.id === schedule.id
                    ? { ...prevSchedule, registerStatus: "Registering", disabled: true }
                    : prevSchedule
            )
        );

        try {
            const register = await schedule.register(email);
            if (register) {
                const newScheduleRegistrations = register.length;
                setSchedules((prevSchedules) =>
                    prevSchedules.map((prevSchedule) =>
                        prevSchedule.id === schedule.id
                            ? {
                                ...prevSchedule,
                                registerStatus: schedule["Volunteer_Event_Role_Details.Approval_Required"] ? "Pending" : "Registered",
                                disabled: true,
                                participants: currentVacancy === 'N/A' ? newScheduleRegistrations : newScheduleRegistrations + "/" + currentVacancy,
                            }
                            : prevSchedule
                    )
                );
                Swal.fire({
                    icon: "success",
                    title: schedule["Volunteer_Event_Role_Details.Approval_Required"] ? "Your request has been submitted" : "You have successfully registered",
                    text: schedule["Volunteer_Event_Role_Details.Approval_Required"] ? "Please wait for an Administrator to approve." : ""
                });
            }
        } catch (error) {
            console.error('Error during registration:', error);
            Swal.fire({
                icon: "error",
                title: "Registration Failed"
            })

            setSchedules((prevSchedules) =>
                prevSchedules.map((prevSchedule) =>
                    prevSchedule.id === schedule.id
                        ? { ...prevSchedule, registerStatus: "Register", disabled: false }
                        : prevSchedule
                )
            );

        } finally {
            setLoadingScheduleId(null);
        }
    };
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
                                    <div className="flex items-center">
                                        <span>{moment(eventRoles[0].activity_date_time).format("D MMM YYYY, h:mm A")}</span>
                                        <span className="flex-shrink-0 ml-3.5">-</span>
                                    </div>
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

                <section>
                    {/* Schedules */}
                    <ScheduleTable schedules={schedules} type="Event" isLoading={!schedules || schedules.length === 0 && !dataFetched} />
                </section>
            </div>
        </div>}
    </Wrapper>
}