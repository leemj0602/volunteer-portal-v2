import CRM from "../crm";
import { EventDetails } from "./EventDetails";

interface MandatoryCustomEventRoleProps {
    "Volunteer_Event_Role_Details.Role:name": string;
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
    public event: Partial<EventDetails> = {};

    public "Volunteer_Event_Role_Details.Role:name": string;
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
        for (const key in props)
            if (key.startsWith("Volunteer_Event_Role_Details")) 
                this[key] = props[key];
            else if (key.startsWith("event"))
                this.event[key.split("event.")[1]] = props[key];
            else if (key.startsWith("thumbnail"))
                this.event.thumbnail = props[key];
    }
}