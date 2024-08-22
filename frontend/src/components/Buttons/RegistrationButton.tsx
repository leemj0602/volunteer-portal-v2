import { Dispatch, MouseEvent, SetStateAction, useState } from "react";
import { EventRegistration, RegistrationStatus } from "../../../utils/classes/EventRegistration";
import { EventRole } from "../../../utils/classes/EventRole";
import config from "../../../../config";
import swal from "sweetalert";

interface RegistrationButtonProps {
    className?: string;
    eventRole: EventRole;
    registrations: EventRegistration[];
    setRegistrations: Dispatch<SetStateAction<EventRegistration[] | undefined>>;
}

export default function RegistrationButton(props: RegistrationButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const email = (window as any).email ?? config.email;

    const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
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
    const eventEnded = Date.now() > new Date(props.eventRole.activity_date_time!).getTime() + (props.eventRole.duration! * 60_000);

    let content = "";
    // If they have registered
    if (registered) {
        // If they have attended
        if (registered.attendance) content = "Attended";
        else {
            // If they have been unapproved
            if (registered["status_id:name"] == RegistrationStatus.Unapproved) content = "Unapproved";
            // If the event is now closed
            else if (eventEnded) content = "Closed";
            else {
                // If approval is required
                if (registered["status_id:name"] == RegistrationStatus.ApprovalRequired) content = "Pending";
                else content = "Registered";
            }
        }
    }
    else {
        // If they can still register
        if (canRegister && hasSpace) content = "Sign Up";
        else content = "Closed";
    }
    
    return <button className={`${props.className} text-white bg-secondary disabled:bg-primary cursor-pointer disabled:cursor-not-allowed`} disabled={isLoading || registered != null || !canRegister || !hasSpace || eventEnded} onClick={handleClick}>
        {isLoading ? "Loading..." : content}
    </button>
}