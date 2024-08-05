import { useEffect, useState } from "react"
import ContactManager from "../../utils/managers/ContactManager";
import EventRoleManager from "../../utils/managers/EventRoleManager";
import EventRegistrationManager from "../../utils/managers/EventRegistrationManager";
import CustomFieldSetManager, { CustomField } from "../../utils/managers/CustomFieldSetManager";
import { Contact } from "../../utils/classes/Contact";
import { EventRole } from "../../utils/classes/EventRole";
import config from "../../../config";
import Wrapper from "../components/Wrapper";
import DashboardHeader, { DashboardHeaderProps } from "../components/DashboardHeader";
import DashboardStats from "../components/DashboardStats";
import EventStatus from "../components/EventStatus";
import UpcomingEvents from "../components/UpcomingEvents";
import Loading from "../components/Loading";
import ConfirmationModal from "../components/ConfirmationModal";
import CancelEvent from "../../assets/undraw_cancel_re_pkdm.svg";
import { format, parseISO } from "date-fns";
import swal from 'sweetalert';

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
    const [isCancelling, setIsCancelling] = useState(false);

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

                const registeredEventRoles = await contact.fetchRegistrations();
                // console.log(registeredEventRoles);

                let minsVolunteeredCalc = 0;
                let numEventsParticipatedCalc = 0;

                const transformedEvents = registeredEventRoles.map((registeredEventRole: any) => {
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
                        else if (registeredEventRole["status_id:name"] === "Unapproved") eventStatus = "Unapproved";
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
                            minsVolunteeredCalc += attendance?.duration ?? eventRole.duration;
                            numEventsParticipatedCalc++;
                        }
                    }

                    return {
                        id: registeredEventRole.id,  // Added this line to include the registration ID
                        name: eventRole["Volunteer_Event_Role_Details.Role:label"] + ' - ' + eventRole.event.subject,
                        dateTime: eventRole.activity_date_time, // Store raw date time string for sorting
                        formattedDateTime: eventRole.activity_date_time ? format(parseISO(eventRole.activity_date_time), "dd/MM/yyyy hh:mm a") : "N/A", // Formatted date time for display
                        status: eventStatus,
                        location: eventRole.event.location,
                        eventRoleId: eventRole.id,
                        duration: eventRole.duration,
                        eventId: eventRole.event.id,
                    };
                });

                let hoursVolunteered = parseFloat((minsVolunteeredCalc / 60).toFixed(1));

                // console.log(transformedEvents);

                // Sort the events based on status and activity date time
                const sortedEvents = transformedEvents.sort((a, b) => {
                    const statusOrder = ["Check In", "Checked In", "Upcoming", "Pending", "Unapproved", "No Show", "Cancelled", "Cancelled By Organiser", "Completed"];
                    const statusComparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
                    if (statusComparison !== 0) {
                        return statusComparison;
                    }

                    if ((a.status === "Upcoming" && b.status === "Upcoming") || (a.status === "Check In" && b.status === "Check In") || (a.status === "Checked In" && b.status === "Checked In")) {
                        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
                    }

                    return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
                });

                setRegisteredEventRoles(sortedEvents);
                setHoursVolunteered(hoursVolunteered);
                setNumEventsParticipated(numEventsParticipatedCalc);

                const registeredEventRoleIds = registeredEventRoles.map((registration: any) => registration.eventRole.id);
                const unvolunteeredEvents = await EventRoleManager.fetchUnregistered(registeredEventRoleIds);

                setUpcomingUnvolunteeredEvents(unvolunteeredEvents as EventRole[]);
            } catch (error) {
                console.log('Error fetching data: ', error)
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleCancelConfirm = async () => {
        setIsCancelling(true);
        if (currentRegistrationId !== null) {
            const result = await EventRegistrationManager.cancelEvent(currentRegistrationId);
            if (result) {
                setShowCancelModal(false);
                swal("Event has been cancelled", {
                    icon: "success",
                });
                
                // console.log("currentRegistrationId:", currentRegistrationId);
                // console.log("volunteeredEvents before update:", registeredEventRoles);

                // Debugging: Log volunteeredEvents after update
                setRegisteredEventRoles((prevEvents) => {
                    const updatedEvents = prevEvents.map((event) =>
                        event.id === currentRegistrationId ? { ...event, status: "Cancelled" } : event
                    );
                    // console.log("volunteeredEvents after update:", updatedEvents);
                    return updatedEvents;
                });

                setIsCancelling(false);
            } else {
                setShowCancelModal(false);
                swal("Event cancellation failed", {
                    icon: "error",
                });
                setIsCancelling(false);
            }
        }
    };

    return <Wrapper>
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

                        <EventStatus
                            eventRegistrations={registeredEventRoles}
                            openCancelModal={(registrationId: number) => {
                                setCurrentRegistrationId(registrationId);
                                setShowCancelModal(true);
                            }}
                        />

                        <UpcomingEvents eventRoles={upcomingUnvolunteeredEvents} />
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
                Are you sure you want to cancel this event?
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
}