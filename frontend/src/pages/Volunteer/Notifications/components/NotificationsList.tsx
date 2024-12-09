import { useEffect, useState } from "react";
import { Notification } from "../../../../../utils/v2/entities/Notification";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { CalendarIcon, MapPinIcon, UserIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import PageNavigation from "../../../../components/PageNavigation";

export default function Notifications(props: { notifications: Notification[] }) {
    const navigate = useNavigate();
    const [currNotifications, setCurrNotifications] = useState<Notification[]>();
    const [page, setPage] = useState(0);
    const limit = 5;
    const pages = Math.ceil(props.notifications.length / limit) - 1;

    const previousPage = () => {
        if (page - 1 <= 0) setPage(0);
        else setPage(page - 1);
    }

    const nextPage = () => {
        if (page >= pages) setPage(pages);
        else setPage(page + 1);
    }

    useEffect(() => {
        (async () => {
            const currNotifications = props.notifications.sort((a, b) => {
                // Get activity_date_time for trainingSchedule or eventRole for both a and b
                const aDate = a.data.trainingSchedule?.activity_date_time || a.data.eventRole?.activity_date_time;
                const bDate = b.data.trainingSchedule?.activity_date_time || b.data.eventRole?.activity_date_time;

                // Convert to timestamps for comparison
                const aTime = aDate ? new Date(aDate).getTime() : 0; // Default to 0 if date is missing
                const bTime = bDate ? new Date(bDate).getTime() : 0; // Default to 0 if date is missing

                // Compare timestamps
                return bTime - aTime; // Descending order
            });
            setCurrNotifications(currNotifications);
        })();
    }, []);

    return (
        !currNotifications?.length ? <p className="text-lg text-gray-500">Looks like there aren't any notifications.</p> :
            <>
                <ul className="space-y-6">
                    {currNotifications.slice(page * limit, page + ((page + 1) * limit)).map((notification) => {
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
                <PageNavigation page={page} pages={pages} limit={limit} array={currNotifications} previousPage={previousPage} nextPage={nextPage} />
            </>
    );
}