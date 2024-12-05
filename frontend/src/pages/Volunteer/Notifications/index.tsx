import { useEffect, useState } from "react";
import Wrapper from "../../../components/Wrapper";
import { Notification } from "../../../../utils/v2/entities/Notification";
import Loading from "../../../components/Loading";
import ContactManager from "../../../../utils/managers/ContactManager";

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>();

    useEffect(() => {
        (async () => {
            const email = (window as any).email;
            const contact = await ContactManager.fetch(email);

            const notifications = await contact.fetchNotifications();
            setNotifications(notifications);
        })();
    }, []);

    return <Wrapper>
        {!notifications ? <Loading className="h-screen items-center" /> : <div className="p-4 mb-12">
            <div className="w-full px-0 md:px-6 max-w-[1200px] mx-auto">
                <h1 className="text-lg font-semibold">Notifications</h1>
                {notifications.map((notification, index) => {
                    return <div key={index}>
                        <p>id: {notification.data.id}</p>
                        <p>subject: {notification.data.subject}</p>
                        <p>details: {notification.data.details}</p>
                        <p>registration.id: {notification.data.registration?.id}</p>
                        <p>registration.activity_type_id:name: {notification.data.registration?.["activity_type_id:name"]}</p>
                        <p>eventRole.id: {notification.data.eventRole?.id}</p>
                        <p>eventRole.Volunteer_Event_Role_Details.Role: {notification.data.eventRole?.Volunteer_Event_Role_Details?.Role}</p>
                        <p>eventRole.Volunteer_Event_Role_Details.Role:label: {notification.data.eventRole?.Volunteer_Event_Role_Details?.["Role:label"]}</p>
                        <p>eventRole.Volunteer_Event_Role_Details.Event.id: {notification.data.eventRole?.Volunteer_Event_Role_Details?.Event?.id}</p>
                        <p>eventRole.Volunteer_Event_Role_Details.Event.subject: {notification.data.eventRole?.Volunteer_Event_Role_Details?.Event?.subject}</p>
                        <p>trainingSchedule.id: {notification.data.trainingSchedule?.id}</p>
                        <p>trainingSchedule.Volunteer_Training_Schedule_Details.Training.id: {notification.data.trainingSchedule?.Volunteer_Training_Schedule_Details?.Training?.id}</p>
                        <p>trainingSchedule.Volunteer_Training_Schedule_Details.Training.subject: {notification.data.trainingSchedule?.Volunteer_Training_Schedule_Details?.Training?.subject}</p>
                        <br />
                        <br />
                    </div>
                })}
            </div>
        </div>}
    </Wrapper>
}