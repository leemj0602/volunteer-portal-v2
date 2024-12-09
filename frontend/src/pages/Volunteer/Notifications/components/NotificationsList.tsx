import { useEffect, useState } from "react";
import { Notification } from "../../../../../utils/v2/entities/Notification";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { CalendarIcon, MapPinIcon, UserIcon, ClipboardDocumentListIcon, ExclamationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
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
            const now = new Date().getTime();
            const sortedNotifications = props.notifications.sort((a, b) => {
                const aDate = a.data.trainingSchedule?.activity_date_time || a.data.eventRole?.activity_date_time;
                const bDate = b.data.trainingSchedule?.activity_date_time || b.data.eventRole?.activity_date_time;

                const aTime = aDate ? new Date(aDate).getTime() : 0;
                const bTime = bDate ? new Date(bDate).getTime() : 0;

                if (aTime >= now && bTime >= now) {
                    return aTime - bTime; // Upcoming first
                } else if (aTime < now && bTime < now) {
                    return bTime - aTime; // Completed first
                } else {
                    return aTime >= now ? -1 : 1; // Upcoming first
                }
            });
            setCurrNotifications(sortedNotifications);
        })();
    }, [props.notifications]);

    return (
        !currNotifications?.length ? <p className="text-lg text-gray-500">Looks like there aren't any notifications.</p> :
            <>
                <ul className="space-y-6">
                    {currNotifications.slice(page * limit, page + ((page + 1) * limit)).map((notification) => {
                        const { eventRole, trainingSchedule } = notification.data;
                        const isUpcoming =
                            notification.data.trainingSchedule?.activity_date_time &&
                            new Date(notification.data.trainingSchedule.activity_date_time) > new Date() ||
                            notification.data.eventRole?.activity_date_time &&
                            new Date(notification.data.eventRole.activity_date_time) > new Date();

                        return (
                            <li
                                key={notification.data.id}
                                className={`p-6 shadow-lg rounded-lg border 
                                    ${isUpcoming ? 'bg-orange-100 border-orange-300' : 'bg-green-50 border-green-200'}`}
                            >
                                {/* Parent Container */}
                                <div className="flex flex-col space-y-2">
                                    {/* Row 1: Icons and Sent Date */}
                                    <div className="flex justify-between items-center">
                                        {/* Icon */}
                                        {isUpcoming ? (
                                            <ExclamationCircleIcon className="h-6 w-6 text-orange-500" />
                                        ) : (
                                            <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                        )}

                                        {/* Sent Date */}
                                        <p className="text-sm text-gray-500">
                                            Sent {moment(notification.data.activity_date_time).fromNow()}
                                        </p>
                                    </div>

                                    {/* Row 2: Notification Details with Button */}
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-2 md:space-y-0">
                                        {/* Notification Details */}
                                        <div className="flex-1 md:mr-6 overflow-auto">
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                                {notification.data.subject}
                                            </h3>

                                            {/* Event Role Notifications */}
                                            {eventRole?.id && (
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
                                            )}

                                            {/* Training Schedule Notifications */}
                                            {trainingSchedule?.id && (
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
                                            )}
                                        </div>

                                        {/* Button */}
                                        <div className="w-full md:w-auto">
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
                                </div>
                            </li>
                        );
                    })}
                </ul>
                <PageNavigation page={page} pages={pages} limit={limit} array={currNotifications} previousPage={previousPage} nextPage={nextPage} />
            </>
    );
}