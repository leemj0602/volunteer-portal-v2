import CRM from "../crm";
import { EventDetailProps, EventDetails } from "./EventDetails";

interface MandatoryCustomEventRoleProps {
    "Volunteer_Event_Role_Details.Role:label": string;
    "Volunteer_Event_Role_Details.Vacancy": number;
    "Volunteer_Event_Role_Details.Registration_Start_Days_Before": number;
    "Volunteer_Event_Role_Details.Registration_End_Days_Before": number;
    [key: string]: any;
}

export interface EventRoleProps extends MandatoryCustomEventRoleProps {
    id: number;
    activity_date_time: string;
    duration: number;
}


export class EventRole implements EventRoleProps {
    public id: number;
    public activity_date_time: string;
    public duration: number;
    public event: EventDetails;

    public "Volunteer_Event_Role_Details.Role:label": string;
    public "Volunteer_Event_Role_Details.Vacancy": number;
    public "Volunteer_Event_Role_Details.Approval_Required": boolean;
    public "Volunteer_Event_Role_Details.Attendance_Code": string;
    public "Volunteer_Event_Role_Details.Registration_Start_Days_Before": number;
    public "Volunteer_Event_Role_Details.Registration_End_Days_Before": number;
    [key: string]: any;

    constructor(props: EventRoleProps) {
        this.id = props.id;
        this.activity_date_time = props.activity_date_time;
        this.duration = props.duration;

        const eventDetails: Partial<EventDetailProps> = {};
        for (const key in props)
            if (key.startsWith("Volunteer_Event_Role_Details")) 
                this[key] = props[key];
            else if (key.startsWith("event"))
                eventDetails[key.split("event.")[1]] = props[key];
            else if (key.startsWith("thumbnail"))
                eventDetails.thumbnail = props[key];
        this.event = new EventDetails(eventDetails);
    }
}