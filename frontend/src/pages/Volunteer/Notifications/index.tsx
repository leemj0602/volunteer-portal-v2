import { useEffect, useState } from "react";
import Wrapper from "../../../components/Wrapper";
import { Notification } from "../../../../utils/v2/entities/Notification";
import Loading from "../../../components/Loading";
import ContactManager from "../../../../utils/managers/ContactManager";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { CalendarIcon, MapPinIcon, UserIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import PageNavigation from "../../../components/PageNavigation";
import NotificationsList from "./components/NotificationsList";

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

    return (
        <Wrapper>
            {!notifications ? (
                <Loading className="h-screen items-center" />
            ) : (
                <div className="p-4 mb-12">
                    <div className="w-full px-0 md:px-6 max-w-[1200px] mx-auto">
                        <NotificationsList notifications={notifications} />
                    </div>
                </div>
            )}
        </Wrapper>
    );
}