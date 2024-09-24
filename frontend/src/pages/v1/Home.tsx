import { useEffect, useState } from "react"
import ContactManager from "../../../utils/managers/ContactManager";
import EventRoleManager from "../../../utils/managers/EventRoleManager";
import EventRegistrationManager from "../../../utils/managers/EventRegistrationManager";
import { Contact } from "../../../utils/classes/Contact";
import { EventRole } from "../../../utils/classes/EventRole";
import { EventRegistration } from "../../../utils/classes/EventRegistration";
import config from "../../../../config";
import Wrapper from "../../components/Wrapper";
import TableStatus from "../../components/TableStatus";
import UpcomingEvents from "../../components/UpcomingEvents";
import Loading from "../../components/Loading";
import ConfirmationModal from "../../components/ConfirmationModal";
import CancelEvent from "../../../assets/undraw_cancel_re_pkdm.svg";
import { format, parseISO } from "date-fns";
import swal from 'sweetalert';
import { AiOutlinePhone, AiOutlineMail } from "react-icons/ai";
import { FiEdit } from "react-icons/fi";
import { Link } from "react-router-dom";
import { TrainingRegistration } from "../../../utils/classes/TrainingRegistration";
import TrainingRegistrationManager from "../../../utils/managers/TrainingRegistrationManager";


interface DashboardHeaderProps {
    name: string | null;
    email: string | null;
    phone: string | null;
    imageUrl: string | null;
}

interface DashboardStatsProps {
    hours: number,
    events: number,
}

export default function Home() {
    const [contact, setContact] = useState<Contact>();
    const [dashboardContact, setDashboardContact] = useState<DashboardHeaderProps | null>(null);
    const [registeredEventRoles, setRegisteredEventRoles] = useState<any[]>([]);
    const [hoursVolunteered, setHoursVolunteered] = useState<number>(0);
    const [numEventsParticipated, setNumEventsParticipated] = useState<number>(0);
    const [upcomingUnvolunteeredEvents, setUpcomingUnvolunteeredEvents] = useState<EventRole[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [currentRegistrationId, setCurrentRegistrationId] = useState<number | null>(null);
    const [currentRegistrationType, setCurrentRegistrationType] = useState<"Event" | "Training" | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [registeredTrainingSchedules, setRegisteredTrainingSchedules] = useState<any[]>([]);

    const email = (window as any).email ?? config.email;

    useEffect(() => {
        (async () => {
            try {
                const contact = await ContactManager.fetch(email);
                setContact(contact);

                const dashboardContact = {
                    name: contact["first_name"] + " " + contact["last_name"],
                    email: contact["email_primary.email"],
                    phone: contact["phone_primary.phone_numeric"],
                    imageUrl: "",
                };
                setDashboardContact(dashboardContact);

                const registeredEventRoles = await contact.fetchEventRegistrations();

                let minsVolunteeredCalc = 0;
                let numEventsParticipatedCalc = 0;

                const transformedEvents = registeredEventRoles.map((registeredEventRole: EventRegistration) => {
                    const { eventRole, attendance } = registeredEventRole;
                    let eventStatus = "";
                    const eventDate = eventRole.activity_date_time ? new Date(eventRole.activity_date_time) : null;
                    const duration = eventRole.duration ? eventRole.duration : 0;
                    const endDate = eventDate ? new Date(eventDate.getTime() + duration * 60000) : null;
                    const now = new Date();

                    if (registeredEventRole['status_id:name'] === 'Cancelled') {
                        eventStatus = "Cancelled";
                    } else if (eventRole['status_id:name'] === 'Cancelled' || eventRole.event["status_id:name"] === 'Cancelled') {
                        eventStatus = "Cancelled By Organiser";
                    } else if (eventDate && now < eventDate) {
                        if (registeredEventRole["status_id:name"] === "Approval Required") eventStatus = "Pending";
                        else if (registeredEventRole["status_id:name"] === "Not Approved") eventStatus = "Unapproved";
                        else eventStatus = "Upcoming";
                    } else if (eventDate && endDate && now >= eventDate && now <= endDate) {
                        if (!attendance) {
                            eventStatus = "Check In";
                        } else {
                            eventStatus = "Checked In";
                        }
                    } else if (eventDate && endDate && now > endDate) {
                        if (!attendance) {
                            eventStatus = "No Show";
                        } else {
                            eventStatus = "Completed";
                            minsVolunteeredCalc += attendance?.duration ?? eventRole.duration!;
                            numEventsParticipatedCalc++;
                        }
                    }

                    return {
                        id: registeredEventRole.id,
                        name: eventRole["Volunteer_Event_Role_Details.Role:label"] + ' - ' + eventRole.event.subject,
                        dateTime: eventRole.activity_date_time,
                        formattedDateTime: eventRole.activity_date_time ? format(parseISO(eventRole.activity_date_time), "dd/MM/yyyy hh:mm a") : "N/A",
                        status: eventStatus,
                        location: eventRole.event.location,
                        roleId: eventRole["Volunteer_Event_Role_Details.Role"],
                        duration: eventRole.duration,
                        entityId: eventRole.event.id,
                        eventRoleId: eventRole.id,
                    };
                });

                let hoursVolunteered = parseFloat((minsVolunteeredCalc / 60).toFixed(1));

                const sortedEvents = transformedEvents.sort((a, b) => {
                    const statusOrder = ["Check In", "Checked In", "Upcoming", "Pending", "Unapproved", "No Show", "Cancelled", "Cancelled By Organiser", "Completed"];
                    const statusComparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
                    if (statusComparison !== 0) {
                        return statusComparison;
                    }

                    if ((a.status === "Upcoming" && b.status === "Upcoming") || (a.status === "Check In" && b.status === "Check In") || (a.status === "Checked In" && b.status === "Checked In")) {
                        return new Date(a.dateTime!).getTime() - new Date(b.dateTime!).getTime();
                    }

                    return new Date(b.dateTime!).getTime() - new Date(a.dateTime!).getTime();
                });

                setRegisteredEventRoles(sortedEvents);
                setHoursVolunteered(hoursVolunteered);
                setNumEventsParticipated(numEventsParticipatedCalc);

                const registeredEventRoleIds = registeredEventRoles.map((registration: any) => registration.eventRole.id);
                const unvolunteeredEvents = await EventRoleManager.fetchUnregistered(registeredEventRoleIds);

                setUpcomingUnvolunteeredEvents(unvolunteeredEvents as EventRole[]);

                const registeredTrainingSchedules = await contact.fetchTrainingRegistrations();

                const transformedTrainings = registeredTrainingSchedules.map((registeredTrainingSchedule: TrainingRegistration) => {
                    const { trainingSchedule } = registeredTrainingSchedule;
                    let trainingStatus = "";
                    const trainingDate = trainingSchedule.activity_date_time ? new Date(trainingSchedule.activity_date_time) : null;
                    const duration = trainingSchedule.duration ? trainingSchedule.duration : 0;
                    const endDate = trainingDate ? new Date(trainingDate.getTime() + duration * 60000) : null;
                    const now = new Date();

                    if (registeredTrainingSchedule['status_id:name'] === 'Cancelled') {
                        trainingStatus = "Cancelled";
                    } else if (trainingSchedule['status_id:name'] === 'Cancelled' || trainingSchedule.training["status_id:name"] === 'Cancelled') {
                        trainingStatus = "Cancelled By Organiser";
                    } else if (trainingDate && now < trainingDate) {
                        trainingStatus = "Upcoming";
                    } else if (trainingDate && endDate && now > endDate) {
                        if (registeredTrainingSchedule['status_id:name'] === 'Completed') {
                            trainingStatus = "Completed";
                        } else {
                            trainingStatus = "No Show";
                        }
                    }

                    return {
                        id: registeredTrainingSchedule.id,
                        name: trainingSchedule.training.subject,
                        dateTime: trainingSchedule.activity_date_time,
                        formattedDateTime: trainingSchedule.activity_date_time ? format(parseISO(trainingSchedule.activity_date_time), "dd/MM/yyyy hh:mm a") : "N/A",
                        status: trainingStatus,
                        location: trainingSchedule.location,
                        duration: trainingSchedule.training.duration,
                        entityId: trainingSchedule.training.id,
                    };
                });

                const sortedTrainings = transformedTrainings.sort((a, b) => {
                    const statusOrder = ["Upcoming", "No Show", "Cancelled", "Cancelled By Organiser", "Completed"];
                    const statusComparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
                    if (statusComparison !== 0) {
                        return statusComparison;
                    }

                    if ((a.status === "Upcoming" && b.status === "Upcoming")) {
                        return new Date(a.dateTime!).getTime() - new Date(b.dateTime!).getTime();
                    }

                    return new Date(b.dateTime!).getTime() - new Date(a.dateTime!).getTime();
                });

                setRegisteredTrainingSchedules(sortedTrainings);
            } catch (error) {
                console.log('Error fetching data: ', error)
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleCancelConfirm = async () => {
        setIsCancelling(true);
        if (currentRegistrationId !== null && currentRegistrationType !== null) {
            let result = false;

            if (currentRegistrationType === "Event") {
                result = await EventRegistrationManager.cancelEvent(currentRegistrationId);
            } else if (currentRegistrationType === "Training") {
                result = await TrainingRegistrationManager.cancelTraining(currentRegistrationId)
            }

            if (result) {
                setShowCancelModal(false);
                swal("Registration has been cancelled", {
                    icon: "success",
                });

                if (currentRegistrationType === "Event") {
                    setRegisteredEventRoles((prevEvents) =>
                        prevEvents.map((event) =>
                            event.id === currentRegistrationId ? { ...event, status: "Cancelled" } : event
                        )
                    );
                } else if (currentRegistrationType === "Training") {
                    setRegisteredTrainingSchedules((prevTrainings) =>
                        prevTrainings.map((training) =>
                            training.id === currentRegistrationId ? { ...training, status: "Cancelled" } : training
                        )
                    );
                }

                setIsCancelling(false);
            } else {
                setShowCancelModal(false);
                swal("Registration cancellation failed", {
                    icon: "error",
                });
                setIsCancelling(false);
            }
        }
    };

    const DashboardHeader = (props: DashboardHeaderProps) => (
        <div
            className="relative p-6 md:p-10 shadow-md flex flex-col md:flex-row justify-between items-center rounded-lg w-full"
            style={{ backgroundColor: "rgba(169, 183, 224, 0.31)" }}
        >
            <div className="flex flex-col md:flex-row items-center w-full">
                <div className="mb-4 md:mb-0 md:mr-6 flex-shrink-0">
                    <img
                        src={props.imageUrl || "https://th.bing.com/th/id/R.d995d728def36a40a261e36bab9f9bfe?rik=LDZuJgLPtIzgZw&riu=http%3a%2f%2fromanroadtrust.co.uk%2fwp-content%2fuploads%2f2018%2f01%2fprofile-icon-png-898.png&ehk=WfpwpBbTdOcQK51xzwmVamkbadbdbzi2tYDYnK8V2hM%3d&risl=&pid=ImgRaw&r=0"}
                        alt="Profile"
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white overflow-hidden"
                    />
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center w-full">
                    <h1 className="font-semibold text-2xl md:text-3xl lg:text-4xl mb-2 md:mb-0 md:ml-6 lg:ml-10">
                        {props.name}
                    </h1>
                    <div className="flex flex-col items-start md:ml-auto md:mr-10 lg:mr-20 mt-2 md:mt-0">
                        <p className="text-lg lg:text-xl xl:text-2xl flex items-center font-semibold">
                            <AiOutlineMail className="text-2xl md:text-2xl mr-2 text-[#5A71B4] hover:text-[#495b92] cursor-pointer" />
                            {props.email}
                        </p>
                        <p className="text-lg lg:text-xl xl:text-2xl flex items-center font-semibold">
                            <AiOutlinePhone className="text-2xl md:text-2xl mr-2 text-[#5A71B4] hover:text-[#495b92] cursor-pointer" />
                            {props.phone}
                        </p>
                    </div>
                </div>
            </div>
            <div className="absolute top-5 right-5">
                <Link to="/profile">
                    <button className="text-[#5A71B4] hover:text-[#495b92]">
                        <FiEdit className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                </Link>
            </div>
        </div>
    );

    const DashboardStats = (props: DashboardStatsProps) => (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="relative bg-white p-6 rounded-lg shadow-md flex flex-col min-h-[120px]">
                <div className="absolute left-0 top-0 bottom-0 w-3 rounded-tl-lg rounded-bl-lg" style={{ backgroundColor: "#A9B7E0" }}></div>
                <div className="text-xl font-bold text-black-700 mb-2 mt-2 text-left pl-4">Number of Hours Volunteered</div>
                <div className="text-4xl font-semibold text-black flex justify-center items-center flex-grow">{props.hours}</div>
            </div>
            <div className="relative bg-white p-6 rounded-lg shadow-md flex flex-col min-h-[120px]">
                <div className="absolute left-0 top-0 bottom-0 w-3 rounded-tl-lg rounded-bl-lg" style={{ backgroundColor: "#A9B7E0" }}></div>
                <div className="text-xl font-bold text-black-700 mb-2 mt-2 text-left pl-4">Volunteering Events Participated</div>
                <div className="text-4xl font-semibold text-black flex justify-center items-center flex-grow">{props.events}</div>
            </div>
        </div>
    );

    return (
        <Wrapper>
            <div className="p-4 mb-12">
                <div className="w-full px-0 md:px-6">
                    {loading ? (
                        <Loading className="h-screen items-center" />
                    ) : (
                        <div>
                            <div className="mb-6 flex">
                                {dashboardContact && <DashboardHeader {...dashboardContact} />}
                            </div>

                            <DashboardStats {...{ hours: hoursVolunteered, events: numEventsParticipated }} />

                            <TableStatus
                                registrations={registeredEventRoles}
                                type="Event"
                                openCancelModal={(registrationId: number, type: "Event" | "Training") => {
                                    setCurrentRegistrationId(registrationId);
                                    setCurrentRegistrationType(type);
                                    setShowCancelModal(true);
                                }}
                            />

                            <UpcomingEvents eventRoles={upcomingUnvolunteeredEvents} />

                            <TableStatus
                                registrations={registeredTrainingSchedules}
                                type="Training"
                                openCancelModal={(registrationId: number, type: "Event" | "Training") => {
                                    setCurrentRegistrationId(registrationId);
                                    setCurrentRegistrationType(type);
                                    setShowCancelModal(true);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                showModal={showCancelModal}
                closeModal={() => setShowCancelModal(false)}
                image={CancelEvent}
                imageWidth="w-[260px]"
                imageHeight="h-[160px]"
                boxWidth="max-w-[400px]"
            >
                <h3 className="text-xl font-semibold text-center mb-4 text-gray-600">
                    Are you sure you want to cancel this registration?
                </h3>
                <div className="flex flex-col items-center space-y-4">
                    <button className="w-[200px] py-4 text-lg bg-[#5A71B4] text-white rounded-md hover:bg-[#4a77ff]" onClick={handleCancelConfirm} disabled={isCancelling}>
                        {isCancelling ? "Cancelling..." : "Confirm"}
                    </button>
                    <button
                        className="w-[200px] py-4 text-lg text-gray-600 rounded-md hover:bg-gray-200"
                        onClick={() => setShowCancelModal(false)}
                    >
                        Cancel
                    </button>
                </div>
            </ConfirmationModal>
        </Wrapper>
    );
}