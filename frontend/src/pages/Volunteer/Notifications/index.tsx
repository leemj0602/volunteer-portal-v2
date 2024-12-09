import { useEffect, useState } from "react";
import Wrapper from "../../../components/Wrapper";
import { Notification } from "../../../../utils/v2/entities/Notification";
import Loading from "../../../components/Loading";
import ContactManager from "../../../../utils/managers/ContactManager";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { CalendarIcon, MapPinIcon, UserIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>();

    useEffect(() => {
        (async () => {
            const email = (window as any).email;
            const contact = await ContactManager.fetch(email);

            const notifications = await contact.fetchNotifications();
            notifications.sort((a, b) => {
                // Get activity_date_time for trainingSchedule or eventRole for both a and b
                const aDate = a.data.trainingSchedule?.activity_date_time || a.data.eventRole?.activity_date_time;
                const bDate = b.data.trainingSchedule?.activity_date_time || b.data.eventRole?.activity_date_time;

                // Convert to timestamps for comparison
                const aTime = aDate ? new Date(aDate).getTime() : 0; // Default to 0 if date is missing
                const bTime = bDate ? new Date(bDate).getTime() : 0; // Default to 0 if date is missing

                // Compare timestamps
                return bTime - aTime; // Descending order
            });
            setNotifications(notifications);
        })();
    }, []);

    return (
        <Wrapper>
            {!notifications ? (
                <Loading className="h-screen items-center" />
            ) : (
                <div className="p-4 mb-12">
                    <div className="w-full px-0 md:px-6 max-w-[1200px] mx-auto">
                        <ul className="space-y-6">
                            {notifications.map((notification) => {
                                const { eventRole, trainingSchedule } = notification.data;

                                return (
                                    <li
                                        key={notification.data.id}
                                        className="p-6 bg-white shadow-lg rounded-lg border border-gray-200"
                                    >
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                                            {/* Left Content: Notification Details */}
                                            <div className="flex-1 md:mr-6 overflow-auto">
                                                <p>
                                                    <b>Sent On:</b> {moment(notification.data.activity_date_time).format("D MMM YYYY, h:mm A") || "N/A"}
                                                </p>
                                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                                    {notification.data.subject}
                                                </h3>

                                                {/* Event Role Notifications */}
                                                {eventRole?.id ? (
                                                    <>
                                                        <p className="text-md text-gray-700 flex items-center gap-2 whitespace-nowrap">
                                                            <ClipboardDocumentListIcon className="h-5 w-5 text-gray-500" />
                                                            <b>Event:</b> {eventRole.Volunteer_Event_Role_Details?.Event?.subject || "N/A"}
                                                        </p>
                                                        <p className="text-md text-gray-700 flex items-center gap-2 whitespace-nowrap">
                                                            <UserIcon className="h-5 w-5 text-gray-500" />
                                                            <b>Role:</b> {eventRole.Volunteer_Event_Role_Details?.["Role:label"] || "N/A"}
                                                        </p>
                                                        <p className="text-md text-gray-700 flex items-center gap-2 whitespace-nowrap">
                                                            <CalendarIcon className="h-5 w-5 text-gray-500" />
                                                            <b>Date:</b> {moment(eventRole.activity_date_time).format("D MMM YYYY, h:mm A") || "N/A"}
                                                        </p>
                                                        <p className="text-md text-gray-700 flex items-center gap-2 whitespace-nowrap">
                                                            <MapPinIcon className="h-5 w-5 text-gray-500" />
                                                            <b>Location:</b> {eventRole.Volunteer_Event_Role_Details?.Event?.location || "N/A"}
                                                        </p>
                                                    </>
                                                ) : null}

                                                {/* Training Schedule Notifications */}
                                                {trainingSchedule?.id ? (
                                                    <>
                                                        <p className="text-md text-gray-700 flex items-center gap-2 whitespace-nowrap">
                                                            <ClipboardDocumentListIcon className="h-5 w-5 text-gray-500" />
                                                            <b>Training:</b>{" "}
                                                            {trainingSchedule.Volunteer_Training_Schedule_Details?.Training?.subject || "N/A"}
                                                        </p>
                                                        <p className="text-md text-gray-700 flex items-center gap-2 whitespace-nowrap">
                                                            <CalendarIcon className="h-5 w-5 text-gray-500" />
                                                            <b>Date:</b> {moment(trainingSchedule.activity_date_time).format("D MMM YYYY, h:mm A") || "N/A"}
                                                        </p>
                                                        <p className="text-md text-gray-700 flex items-center gap-2 whitespace-nowrap">
                                                            <MapPinIcon className="h-5 w-5 text-gray-500" />
                                                            <b>Location:</b> {trainingSchedule.location || "N/A"}
                                                        </p>
                                                    </>
                                                ) : null}

                                                {/* Shared Message */}
                                                <p className="text-md text-gray-600 mt-4">
                                                    We look forward to seeing you there, thank you for making a difference!
                                                </p>
                                            </div>

                                            {/* Right Content: Button */}
                                            <div className="mt-4 md:mt-0 md:flex-none md:w-40">
                                                {eventRole?.id ? (
                                                    <button
                                                        className="w-full px-6 py-2 bg-secondary text-white text-sm font-semibold rounded-md hover:bg-primary transition"
                                                        onClick={() =>
                                                            navigate(
                                                                `/volunteer/events/${eventRole.Volunteer_Event_Role_Details?.Event?.id}/${eventRole.Volunteer_Event_Role_Details?.Role}`
                                                            )
                                                        }
                                                    >
                                                        View Details
                                                    </button>
                                                ) : trainingSchedule?.id ? (
                                                    <button
                                                        className="w-full px-6 py-2 bg-secondary text-white text-sm font-semibold rounded-md hover:bg-primary transition"
                                                        onClick={() =>
                                                            navigate(
                                                                `/volunteer/trainings/${trainingSchedule.Volunteer_Training_Schedule_Details?.Training?.id}`
                                                            )
                                                        }
                                                    >
                                                        View Details
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}
        </Wrapper>
    );
}